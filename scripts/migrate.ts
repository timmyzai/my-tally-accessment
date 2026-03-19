#!/usr/bin/env npx tsx

/**
 * Smart DynamoDB Migration Script
 *
 * Provides a dotnet ef database update-like experience:
 * 1. Connects to DynamoDB and verifies credentials
 * 2. Checks which tables exist
 * 3. Creates missing tables (applies pending "migrations")
 * 4. Tracks migration history in a _Migrations table
 * 5. Optionally seeds data
 *
 * Usage:
 *   npx tsx scripts/migrate.ts              # Apply pending migrations
 *   npx tsx scripts/migrate.ts --seed       # Apply migrations + seed questions
 *   npx tsx scripts/migrate.ts --status     # Show migration status
 *   npx tsx scripts/migrate.ts --fresh      # Drop all tables and re-create (DESTRUCTIVE)
 */

import { config } from "dotenv";
import {
  DynamoDBClient,
  CreateTableCommand,
  DeleteTableCommand,
  ListTablesCommand,
  DescribeTableCommand,
  ResourceInUseException,
  ResourceNotFoundException,
  waitUntilTableExists,
} from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";

// Load environment variables
config({ path: ".env.local" });
config({ path: ".env.development" });
config();

// ─── Configuration ───────────────────────────────────────────────

const REGION = process.env.AWS_REGION ?? "ap-southeast-5";
const MIGRATIONS_TABLE = "_Migrations";

const client = new DynamoDBClient({
  region: REGION,
  ...(process.env.DYNAMODB_ENDPOINT && {
    endpoint: process.env.DYNAMODB_ENDPOINT,
  }),
});

const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

// ─── Migration Definitions ──────────────────────────────────────

interface Migration {
  id: string;
  name: string;
  timestamp: string;
  apply: () => Promise<void>;
}

const migrations: Migration[] = [
  {
    id: "001",
    name: "create_questions_table",
    timestamp: "2026-03-20T00:00:00Z",
    apply: async () => {
      await createTable({
        TableName: "Questions",
        KeySchema: [{ AttributeName: "questionId", KeyType: "HASH" }],
        AttributeDefinitions: [
          { AttributeName: "questionId", AttributeType: "S" },
        ],
        BillingMode: "PAY_PER_REQUEST",
      });
    },
  },
  {
    id: "002",
    name: "create_assessments_table",
    timestamp: "2026-03-20T00:00:01Z",
    apply: async () => {
      await createTable({
        TableName: "Assessments",
        KeySchema: [{ AttributeName: "assessmentId", KeyType: "HASH" }],
        AttributeDefinitions: [
          { AttributeName: "assessmentId", AttributeType: "S" },
        ],
        BillingMode: "PAY_PER_REQUEST",
      });
    },
  },
  {
    id: "003",
    name: "create_candidates_table",
    timestamp: "2026-03-20T00:00:02Z",
    apply: async () => {
      await createTable({
        TableName: "Candidates",
        KeySchema: [{ AttributeName: "candidateId", KeyType: "HASH" }],
        AttributeDefinitions: [
          { AttributeName: "candidateId", AttributeType: "S" },
        ],
        BillingMode: "PAY_PER_REQUEST",
      });
    },
  },
  {
    id: "004",
    name: "create_invites_table_with_token_gsi",
    timestamp: "2026-03-20T00:00:03Z",
    apply: async () => {
      await createTable({
        TableName: "Invites",
        KeySchema: [{ AttributeName: "inviteId", KeyType: "HASH" }],
        AttributeDefinitions: [
          { AttributeName: "inviteId", AttributeType: "S" },
          { AttributeName: "token", AttributeType: "S" },
        ],
        BillingMode: "PAY_PER_REQUEST",
        GlobalSecondaryIndexes: [
          {
            IndexName: "TokenIndex",
            KeySchema: [{ AttributeName: "token", KeyType: "HASH" }],
            Projection: { ProjectionType: "ALL" },
          },
        ],
      });
    },
  },
  {
    id: "005",
    name: "create_answers_table",
    timestamp: "2026-03-20T00:00:04Z",
    apply: async () => {
      await createTable({
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
      });
    },
  },
];

// ─── Helpers ─────────────────────────────────────────────────────

async function createTable(
  params: ConstructorParameters<typeof CreateTableCommand>[0]
): Promise<void> {
  try {
    await client.send(new CreateTableCommand(params));
    console.log(`   ✅ Created table: ${params.TableName}`);
    // Wait for table to become active
    await waitUntilTableExists(
      { client, maxWaitTime: 60 },
      { TableName: params.TableName! }
    );
  } catch (err) {
    if (err instanceof ResourceInUseException) {
      console.log(`   ⏭️  Table already exists: ${params.TableName}`);
    } else {
      throw err;
    }
  }
}

async function deleteTable(tableName: string): Promise<void> {
  try {
    await client.send(new DeleteTableCommand({ TableName: tableName }));
    console.log(`   🗑️  Deleted table: ${tableName}`);
  } catch (err) {
    if (err instanceof ResourceNotFoundException) {
      console.log(`   ⏭️  Table not found: ${tableName}`);
    } else {
      throw err;
    }
  }
}

async function tableExists(tableName: string): Promise<boolean> {
  try {
    await client.send(new DescribeTableCommand({ TableName: tableName }));
    return true;
  } catch {
    return false;
  }
}

async function listExistingTables(): Promise<string[]> {
  const result = await client.send(new ListTablesCommand({}));
  return result.TableNames ?? [];
}

async function ensureMigrationsTable(): Promise<void> {
  if (!(await tableExists(MIGRATIONS_TABLE))) {
    await client.send(
      new CreateTableCommand({
        TableName: MIGRATIONS_TABLE,
        KeySchema: [{ AttributeName: "migrationId", KeyType: "HASH" }],
        AttributeDefinitions: [
          { AttributeName: "migrationId", AttributeType: "S" },
        ],
        BillingMode: "PAY_PER_REQUEST",
      })
    );
    await waitUntilTableExists(
      { client, maxWaitTime: 60 },
      { TableName: MIGRATIONS_TABLE }
    );
    console.log("📋 Created migrations tracking table\n");
  }
}

async function getAppliedMigrations(): Promise<Set<string>> {
  try {
    const result = await docClient.send(
      new ScanCommand({ TableName: MIGRATIONS_TABLE })
    );
    return new Set(
      (result.Items ?? []).map((item) => item.migrationId as string)
    );
  } catch {
    return new Set();
  }
}

async function recordMigration(migration: Migration): Promise<void> {
  await docClient.send(
    new PutCommand({
      TableName: MIGRATIONS_TABLE,
      Item: {
        migrationId: migration.id,
        name: migration.name,
        appliedAt: new Date().toISOString(),
        timestamp: migration.timestamp,
      },
    })
  );
}

// ─── Commands ────────────────────────────────────────────────────

async function verifyConnection(): Promise<void> {
  console.log("📡 Connecting to DynamoDB...");
  console.log(`   Region: ${REGION}`);
  console.log(
    `   Access Key: ${process.env.AWS_ACCESS_KEY_ID?.slice(0, 8)}...`
  );

  try {
    await client.send(new ListTablesCommand({}));
    console.log("   ✅ Connected successfully\n");
  } catch (err) {
    console.error("   ❌ Connection failed:", (err as Error).message);
    process.exit(1);
  }
}

async function showStatus(): Promise<void> {
  await verifyConnection();
  await ensureMigrationsTable();

  const applied = await getAppliedMigrations();
  const tables = await listExistingTables();

  console.log("📊 Migration Status\n");
  console.log("   Existing tables:", tables.join(", ") || "(none)");
  console.log("");

  const pending: string[] = [];
  for (const m of migrations) {
    const status = applied.has(m.id) ? "✅ Applied" : "⏳ Pending";
    if (!applied.has(m.id)) pending.push(m.name);
    console.log(`   [${m.id}] ${m.name} — ${status}`);
  }

  console.log("");
  if (pending.length === 0) {
    console.log("   ✨ All migrations are up to date!\n");
  } else {
    console.log(`   📌 ${pending.length} pending migration(s)\n`);
  }
}

async function applyMigrations(): Promise<number> {
  await ensureMigrationsTable();
  const applied = await getAppliedMigrations();

  const pending = migrations.filter((m) => !applied.has(m.id));

  if (pending.length === 0) {
    console.log("✨ No pending migrations. Database is up to date!\n");
    return 0;
  }

  console.log(`📌 Applying ${pending.length} migration(s)...\n`);

  for (const migration of pending) {
    console.log(`🔄 [${migration.id}] ${migration.name}`);
    try {
      await migration.apply();
      await recordMigration(migration);
      console.log(`   ✅ Applied successfully\n`);
    } catch (err) {
      console.error(`   ❌ Failed:`, (err as Error).message);
      console.error(`\n⛔ Migration halted. Fix the issue and re-run.\n`);
      process.exit(1);
    }
  }

  return pending.length;
}

async function freshMigration(): Promise<void> {
  console.log("🔥 FRESH MIGRATION — Dropping all tables...\n");

  const allTables = [
    "Questions",
    "Assessments",
    "Candidates",
    "Invites",
    "Answers",
    MIGRATIONS_TABLE,
  ];

  for (const table of allTables) {
    await deleteTable(table);
  }

  // Wait for deletions to complete
  console.log("\n   ⏳ Waiting for tables to be fully deleted...");
  await new Promise((resolve) => setTimeout(resolve, 5000));

  console.log("\n🔄 Re-creating all tables...\n");
  await applyMigrations();
}

async function seedData(): Promise<void> {
  console.log("🌱 Seeding question bank...\n");

  // Dynamic import to avoid loading seed data unless needed
  const { seedQuestions } = await import("./seed-questions");
  await seedQuestions();

  console.log("\n   ✅ Seed data applied\n");
}

// ─── Main ────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const isFresh = args.includes("--fresh");
  const isSeed = args.includes("--seed");
  const isStatus = args.includes("--status");

  console.log("🚀 DynamoDB Migration Tool\n");

  await verifyConnection();

  if (isStatus) {
    await showStatus();
    return;
  }

  if (isFresh) {
    console.log("⚠️  WARNING: This will DELETE all tables and data!\n");
    await freshMigration();
  } else {
    const applied = await applyMigrations();
    if (applied > 0) {
      console.log(`✅ ${applied} migration(s) applied successfully!\n`);
    }
  }

  if (isSeed) {
    await seedData();
  }

  // Final status
  const tables = await listExistingTables();
  console.log("📋 Current tables:", tables.join(", "));
  console.log("\n✨ Migration completed successfully!\n");
}

main().catch((err) => {
  console.error("\n❌ Migration failed:", err.message ?? err);
  process.exit(1);
});
