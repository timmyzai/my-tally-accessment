#!/usr/bin/env npx tsx

/**
 * Database Migration Script
 *
 * Local (MongoDB):  Creates collections and indexes
 * Production (DynamoDB): Creates tables with GSIs
 *
 * Usage:
 *   npx tsx scripts/migrate.ts              # Apply pending migrations
 *   npx tsx scripts/migrate.ts --seed       # Apply migrations + seed questions
 *   npx tsx scripts/migrate.ts --status     # Show migration status
 *   npx tsx scripts/migrate.ts --fresh      # Drop and re-create (DESTRUCTIVE)
 */

import { config } from "dotenv";
config({ path: ".env.local" });

const USE_MONGODB = process.env.USE_MONGODB === "true";

async function main() {
  const args = process.argv.slice(2);
  const isFresh = args.includes("--fresh");
  const isSeed = args.includes("--seed");
  const isStatus = args.includes("--status");

  console.log(`\nDatabase Migration Tool (${USE_MONGODB ? "MongoDB" : "DynamoDB"})\n`);

  if (USE_MONGODB) {
    await runMongoDB({ isFresh, isSeed, isStatus });
  } else {
    await runDynamoDB({ isFresh, isSeed, isStatus });
  }
}

// ─── MongoDB ────────────────────────────────────────────────────

async function runMongoDB(opts: { isFresh: boolean; isSeed: boolean; isStatus: boolean }) {
  const mongoose = await import("mongoose");
  const uri = process.env.MONGODB_URI ?? "mongodb://localhost:27017/tally_assessment";

  console.log(`Connecting to MongoDB: ${uri}`);
  await mongoose.default.connect(uri);
  console.log("Connected successfully\n");

  const db = mongoose.default.connection.db!;

  if (opts.isStatus) {
    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map((c) => c.name).join(", ") || "(none)");
    await mongoose.default.disconnect();
    return;
  }

  if (opts.isFresh) {
    console.log("Dropping database...\n");
    await db.dropDatabase();
  }

  // Ensure collections and indexes
  const collections = ["questions", "assessments", "candidates", "invites", "answers"];
  for (const name of collections) {
    const existing = await db.listCollections({ name }).toArray();
    if (existing.length === 0) {
      await db.createCollection(name);
      console.log(`Created collection: ${name}`);
    } else {
      console.log(`Collection exists: ${name}`);
    }
  }

  // Create indexes
  await db.collection("questions").createIndex({ questionId: 1 }, { unique: true });
  await db.collection("assessments").createIndex({ assessmentId: 1 }, { unique: true });
  await db.collection("candidates").createIndex({ candidateId: 1 }, { unique: true });
  await db.collection("invites").createIndex({ inviteId: 1 }, { unique: true });
  await db.collection("invites").createIndex({ token: 1 }, { unique: true });
  await db.collection("answers").createIndex({ attemptId: 1, questionId: 1 }, { unique: true });
  console.log("\nIndexes created\n");

  if (opts.isSeed) {
    const { seedQuestions } = await import("./seed-questions");
    await seedQuestions();
  }

  await mongoose.default.disconnect();
  console.log("\nMigration completed!\n");
}

// ─── DynamoDB ───────────────────────────────────────────────────

async function runDynamoDB(opts: { isFresh: boolean; isSeed: boolean; isStatus: boolean }) {
  const {
    DynamoDBClient,
    CreateTableCommand,
    DeleteTableCommand,
    ListTablesCommand,
    DescribeTableCommand,
    ResourceInUseException,
    ResourceNotFoundException,
    waitUntilTableExists,
  } = await import("@aws-sdk/client-dynamodb");
  const { DynamoDBDocumentClient, PutCommand, ScanCommand } = await import("@aws-sdk/lib-dynamodb");

  const REGION = process.env.AWS_REGION ?? "ap-southeast-5";
  const client = new DynamoDBClient({ region: REGION });
  const docClient = DynamoDBDocumentClient.from(client, {
    marshallOptions: { removeUndefinedValues: true },
  });

  console.log(`Connecting to DynamoDB (${REGION})...`);
  console.log(`Access Key: ${process.env.AWS_ACCESS_KEY_ID?.slice(0, 8)}...`);

  try {
    await client.send(new ListTablesCommand({}));
    console.log("Connected successfully\n");
  } catch (err) {
    console.error("Connection failed:", (err as Error).message);
    process.exit(1);
  }

  const MIGRATIONS_TABLE = "_Migrations";

  async function createTable(params: ConstructorParameters<typeof CreateTableCommand>[0]) {
    try {
      await client.send(new CreateTableCommand(params));
      console.log(`Created table: ${params.TableName}`);
      await waitUntilTableExists({ client, maxWaitTime: 60 }, { TableName: params.TableName! });
    } catch (err) {
      if (err instanceof ResourceInUseException) {
        console.log(`Table exists: ${params.TableName}`);
      } else throw err;
    }
  }

  async function deleteTable(name: string) {
    try {
      await client.send(new DeleteTableCommand({ TableName: name }));
      console.log(`Deleted table: ${name}`);
    } catch (err) {
      if (err instanceof ResourceNotFoundException) {
        console.log(`Table not found: ${name}`);
      } else throw err;
    }
  }

  if (opts.isStatus) {
    const result = await client.send(new ListTablesCommand({}));
    console.log("Tables:", (result.TableNames ?? []).join(", ") || "(none)");

    // Check migrations table
    try {
      const migrations = await docClient.send(new ScanCommand({ TableName: MIGRATIONS_TABLE }));
      const applied = (migrations.Items ?? []).map((i) => i.migrationId).sort();
      console.log("Applied migrations:", applied.join(", ") || "(none)");
    } catch {
      console.log("No migrations table found.");
    }
    return;
  }

  const allTables = ["Questions", "Assessments", "Candidates", "Invites", "Answers", MIGRATIONS_TABLE];

  if (opts.isFresh) {
    console.log("Dropping all tables...\n");
    for (const t of allTables) await deleteTable(t);
    console.log("\nWaiting for deletions...");
    await new Promise((r) => setTimeout(r, 5000));
    console.log("");
  }

  // Ensure migrations table
  await createTable({
    TableName: MIGRATIONS_TABLE,
    KeySchema: [{ AttributeName: "migrationId", KeyType: "HASH" }],
    AttributeDefinitions: [{ AttributeName: "migrationId", AttributeType: "S" }],
    BillingMode: "PAY_PER_REQUEST",
  });

  // Check applied
  const applied = new Set<string>();
  try {
    const result = await docClient.send(new ScanCommand({ TableName: MIGRATIONS_TABLE }));
    for (const item of result.Items ?? []) applied.add(item.migrationId as string);
  } catch { /* empty */ }

  const migrations = [
    {
      id: "001", name: "create_questions_table",
      apply: () => createTable({
        TableName: "Questions",
        KeySchema: [{ AttributeName: "questionId", KeyType: "HASH" }],
        AttributeDefinitions: [{ AttributeName: "questionId", AttributeType: "S" }],
        BillingMode: "PAY_PER_REQUEST",
      }),
    },
    {
      id: "002", name: "create_assessments_table",
      apply: () => createTable({
        TableName: "Assessments",
        KeySchema: [{ AttributeName: "assessmentId", KeyType: "HASH" }],
        AttributeDefinitions: [{ AttributeName: "assessmentId", AttributeType: "S" }],
        BillingMode: "PAY_PER_REQUEST",
      }),
    },
    {
      id: "003", name: "create_candidates_table",
      apply: () => createTable({
        TableName: "Candidates",
        KeySchema: [{ AttributeName: "candidateId", KeyType: "HASH" }],
        AttributeDefinitions: [{ AttributeName: "candidateId", AttributeType: "S" }],
        BillingMode: "PAY_PER_REQUEST",
      }),
    },
    {
      id: "004", name: "create_invites_table_with_token_gsi",
      apply: () => createTable({
        TableName: "Invites",
        KeySchema: [{ AttributeName: "inviteId", KeyType: "HASH" }],
        AttributeDefinitions: [
          { AttributeName: "inviteId", AttributeType: "S" },
          { AttributeName: "token", AttributeType: "S" },
        ],
        BillingMode: "PAY_PER_REQUEST",
        GlobalSecondaryIndexes: [{
          IndexName: "TokenIndex",
          KeySchema: [{ AttributeName: "token", KeyType: "HASH" }],
          Projection: { ProjectionType: "ALL" },
        }],
      }),
    },
    {
      id: "005", name: "create_answers_table",
      apply: () => createTable({
        TableName: "Answers",
        KeySchema: [
          { AttributeName: "attemptId", KeyType: "HASH" },
          { AttributeName: "questionId", KeyType: "RANGE" },
        ],
        AttributeDefinitions: [
          { AttributeName: "attemptId", AttributeType: "S" },
          { AttributeName: "questionId", AttributeType: "S" },
        ],
        BillingMode: "PAY_PER_REQUEST",
      }),
    },
  ];

  let count = 0;
  for (const m of migrations) {
    if (applied.has(m.id)) continue;
    console.log(`Applying [${m.id}] ${m.name}...`);
    await m.apply();
    await docClient.send(new PutCommand({
      TableName: MIGRATIONS_TABLE,
      Item: { migrationId: m.id, name: m.name, appliedAt: new Date().toISOString() },
    }));
    count++;
  }

  if (count === 0) console.log("\nAll migrations up to date.");
  else console.log(`\n${count} migration(s) applied.`);

  if (opts.isSeed) {
    const { seedQuestions } = await import("./seed-questions");
    await seedQuestions();
  }

  const tables = await client.send(new ListTablesCommand({}));
  console.log("\nCurrent tables:", (tables.TableNames ?? []).join(", "));
  console.log("\nMigration completed!\n");
}

main().catch((err) => {
  console.error("\nMigration failed:", err.message ?? err);
  process.exit(1);
});
