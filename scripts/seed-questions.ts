import { v4 as uuidv4 } from "uuid";
import type { Question, QuestionSet } from "../lib/types";

const now = new Date().toISOString();

const DEFAULT_SET_ID = "default-set-1";

const defaultQuestionSet: QuestionSet = {
  questionSetId: DEFAULT_SET_ID,
  name: "Default Set",
  createdAt: now,
};

const questions: Question[] = [
  // JavaScript (10)
  { questionId: uuidv4(), questionText: "What is the output of `typeof null` in JavaScript? Explain why.", isOptional: false, questionSetId: DEFAULT_SET_ID, createdAt: now },
  { questionId: uuidv4(), questionText: "Explain how `JSON.parse()` and `JSON.stringify()` work. When would you use each?", isOptional: false, questionSetId: DEFAULT_SET_ID, createdAt: now },
  { questionId: uuidv4(), questionText: "Explain how `Array.prototype.reduce()` works with an example.", isOptional: false, questionSetId: DEFAULT_SET_ID, createdAt: now },
  { questionId: uuidv4(), questionText: "What is the difference between `var`, `let`, and `const` in JavaScript?", isOptional: false, questionSetId: DEFAULT_SET_ID, createdAt: now },
  { questionId: uuidv4(), questionText: "Why does `0.1 + 0.2 !== 0.3` in JavaScript? How would you handle this?", isOptional: false, questionSetId: DEFAULT_SET_ID, createdAt: now },
  { questionId: uuidv4(), questionText: "Explain closures in JavaScript. Provide a practical example of when you would use one.", isOptional: false, questionSetId: DEFAULT_SET_ID, createdAt: now },
  { questionId: uuidv4(), questionText: "What does the `??` (nullish coalescing) operator do? How does it differ from `||`?", isOptional: false, questionSetId: DEFAULT_SET_ID, createdAt: now },
  { questionId: uuidv4(), questionText: "Explain the JavaScript event loop. How does it handle asynchronous operations?", isOptional: false, questionSetId: DEFAULT_SET_ID, createdAt: now },
  { questionId: uuidv4(), questionText: "What are the different ways to create a shallow copy of an array or object in JavaScript?", isOptional: false, questionSetId: DEFAULT_SET_ID, createdAt: now },
  { questionId: uuidv4(), questionText: "Explain the difference between `Promise.all()`, `Promise.allSettled()`, `Promise.race()`, and `Promise.any()`.", isOptional: false, questionSetId: DEFAULT_SET_ID, createdAt: now },

  // TypeScript (10)
  { questionId: uuidv4(), questionText: "What is the `unknown` type in TypeScript and how does it differ from `any`?", isOptional: false, questionSetId: DEFAULT_SET_ID, createdAt: now },
  { questionId: uuidv4(), questionText: "Explain the `keyof` operator in TypeScript with an example.", isOptional: false, questionSetId: DEFAULT_SET_ID, createdAt: now },
  { questionId: uuidv4(), questionText: "Describe the `Partial<T>`, `Required<T>`, and `Readonly<T>` utility types in TypeScript.", isOptional: false, questionSetId: DEFAULT_SET_ID, createdAt: now },
  { questionId: uuidv4(), questionText: "What is a discriminated union in TypeScript? Provide an example.", isOptional: false, questionSetId: DEFAULT_SET_ID, createdAt: now },
  { questionId: uuidv4(), questionText: "What does `as const` do in TypeScript? When would you use it?", isOptional: false, questionSetId: DEFAULT_SET_ID, createdAt: now },
  { questionId: uuidv4(), questionText: "Explain the `never` type in TypeScript. When does it occur?", isOptional: false, questionSetId: DEFAULT_SET_ID, createdAt: now },
  { questionId: uuidv4(), questionText: "What are generics in TypeScript? Explain with a practical example.", isOptional: false, questionSetId: DEFAULT_SET_ID, createdAt: now },
  { questionId: uuidv4(), questionText: "Explain `Omit<T, K>` and `Pick<T, K>` utility types with examples.", isOptional: false, questionSetId: DEFAULT_SET_ID, createdAt: now },
  { questionId: uuidv4(), questionText: "What is the difference between `interface` and `type` in TypeScript? When would you use each?", isOptional: false, questionSetId: DEFAULT_SET_ID, createdAt: now },
  { questionId: uuidv4(), questionText: "What does the `satisfies` keyword do in TypeScript? Provide an example.", isOptional: false, questionSetId: DEFAULT_SET_ID, createdAt: now },

  // React (10)
  { questionId: uuidv4(), questionText: "Explain the purpose and behavior of `useEffect` in React. What is its cleanup function for?", isOptional: false, questionSetId: DEFAULT_SET_ID, createdAt: now },
  { questionId: uuidv4(), questionText: "What does `React.memo()` do? When should and shouldn't you use it?", isOptional: false, questionSetId: DEFAULT_SET_ID, createdAt: now },
  { questionId: uuidv4(), questionText: "Why should you use the functional form of setState (e.g., `setState(prev => prev + 1)`) instead of direct values?", isOptional: false, questionSetId: DEFAULT_SET_ID, createdAt: now },
  { questionId: uuidv4(), questionText: "Explain `useRef` in React. How does it differ from `useState`?", isOptional: false, questionSetId: DEFAULT_SET_ID, createdAt: now },
  { questionId: uuidv4(), questionText: "What is the Context API in React? When would you use it over prop drilling?", isOptional: false, questionSetId: DEFAULT_SET_ID, createdAt: now },
  { questionId: uuidv4(), questionText: "What is a controlled component in React? How does it differ from an uncontrolled component?", isOptional: false, questionSetId: DEFAULT_SET_ID, createdAt: now },
  { questionId: uuidv4(), questionText: "Why is the `key` prop important in React lists? What happens if you don't use it correctly?", isOptional: false, questionSetId: DEFAULT_SET_ID, createdAt: now },
  { questionId: uuidv4(), questionText: "Explain the difference between `useMemo` and `useCallback` in React.", isOptional: false, questionSetId: DEFAULT_SET_ID, createdAt: now },
  { questionId: uuidv4(), questionText: "When would you use `useReducer` instead of `useState`? Provide an example.", isOptional: false, questionSetId: DEFAULT_SET_ID, createdAt: now },
  { questionId: uuidv4(), questionText: "What causes a component to re-render in React? How can you prevent unnecessary re-renders?", isOptional: false, questionSetId: DEFAULT_SET_ID, createdAt: now },

  // Next.js (10)
  { questionId: uuidv4(), questionText: "What is the difference between `page.tsx` and `layout.tsx` in the Next.js App Router?", isOptional: false, questionSetId: DEFAULT_SET_ID, createdAt: now },
  { questionId: uuidv4(), questionText: "What are Server Components in Next.js? What are their benefits and limitations?", isOptional: false, questionSetId: DEFAULT_SET_ID, createdAt: now },
  { questionId: uuidv4(), questionText: "How do you create API routes in the Next.js App Router? Explain the file convention.", isOptional: false, questionSetId: DEFAULT_SET_ID, createdAt: now },
  { questionId: uuidv4(), questionText: "What does the `'use client'` directive do in Next.js? When do you need it?", isOptional: false, questionSetId: DEFAULT_SET_ID, createdAt: now },
  { questionId: uuidv4(), questionText: "Explain `generateStaticParams` in Next.js. When and why would you use it?", isOptional: false, questionSetId: DEFAULT_SET_ID, createdAt: now },
  { questionId: uuidv4(), questionText: "How does `loading.tsx` work in Next.js App Router? What is its relationship with React Suspense?", isOptional: false, questionSetId: DEFAULT_SET_ID, createdAt: now },
  { questionId: uuidv4(), questionText: "How does Next.js handle metadata for SEO? Explain the `metadata` export and `generateMetadata` function.", isOptional: false, questionSetId: DEFAULT_SET_ID, createdAt: now },
  { questionId: uuidv4(), questionText: "What is middleware in Next.js? Describe a practical use case.", isOptional: false, questionSetId: DEFAULT_SET_ID, createdAt: now },
  { questionId: uuidv4(), questionText: "Explain `revalidatePath()` and `revalidateTag()` in Next.js. How do they relate to caching?", isOptional: false, questionSetId: DEFAULT_SET_ID, createdAt: now },
  { questionId: uuidv4(), questionText: "What is `error.tsx` in Next.js App Router? How does it act as an error boundary?", isOptional: false, questionSetId: DEFAULT_SET_ID, createdAt: now },

  // Web Fundamentals (10)
  { questionId: uuidv4(), questionText: "What is CORS? Explain how it works and why it exists.", isOptional: false, questionSetId: DEFAULT_SET_ID, createdAt: now },
  { questionId: uuidv4(), questionText: "Explain HTTP idempotency. Which methods are idempotent and why does it matter?", isOptional: false, questionSetId: DEFAULT_SET_ID, createdAt: now },
  { questionId: uuidv4(), questionText: "What is the purpose of the `Content-Type` HTTP header? Give examples of common values.", isOptional: false, questionSetId: DEFAULT_SET_ID, createdAt: now },
  { questionId: uuidv4(), questionText: "Explain the difference between HTTP status codes 401 and 403.", isOptional: false, questionSetId: DEFAULT_SET_ID, createdAt: now },
  { questionId: uuidv4(), questionText: "What is the difference between `localStorage` and `sessionStorage`? When would you use each?", isOptional: false, questionSetId: DEFAULT_SET_ID, createdAt: now },
  { questionId: uuidv4(), questionText: "What is a service worker? Describe its role in Progressive Web Apps.", isOptional: false, questionSetId: DEFAULT_SET_ID, createdAt: now },
  { questionId: uuidv4(), questionText: "Explain the `defer` and `async` attributes on script tags. How do they differ?", isOptional: false, questionSetId: DEFAULT_SET_ID, createdAt: now },
  { questionId: uuidv4(), questionText: "What is the Critical Rendering Path? How can you optimize it?", isOptional: false, questionSetId: DEFAULT_SET_ID, createdAt: now },
  { questionId: uuidv4(), questionText: "Why is the `alt` attribute important on `<img>` tags? Explain its role in accessibility.", isOptional: false, questionSetId: DEFAULT_SET_ID, createdAt: now },
  { questionId: uuidv4(), questionText: "Explain the difference between `==` and `===` in JavaScript. Why is `===` generally preferred?", isOptional: false, questionSetId: DEFAULT_SET_ID, createdAt: now },
];

export { questions, defaultQuestionSet };

export async function seedQuestions() {
  const useMongo = process.env.USE_MONGODB === "true";

  console.log(`   Seeding question set + ${questions.length} questions (${useMongo ? "MongoDB" : "DynamoDB"})...`);

  if (useMongo) {
    const mongoose = await import("mongoose");
    const uri = process.env.MONGODB_URI ?? "mongodb://localhost:27017/tally_assessment";
    await mongoose.default.connect(uri);

    const questionSetSchema = new mongoose.Schema(
      {
        questionSetId: { type: String, required: true, unique: true },
        name: String,
        createdAt: String,
      },
      { collection: "questionSets", id: false, versionKey: false }
    );
    const QuestionSetModel = mongoose.default.models.QuestionSet || mongoose.default.model("QuestionSet", questionSetSchema);

    const questionSchema = new mongoose.Schema(
      {
        questionId: { type: String, required: true, unique: true },
        questionText: String,
        isOptional: Boolean,
        questionSetId: String,
        createdAt: String,
      },
      { collection: "questions", id: false, versionKey: false }
    );
    const QuestionModel = mongoose.default.models.Question || mongoose.default.model("Question", questionSchema);

    await QuestionSetModel.deleteMany({});
    await QuestionModel.deleteMany({});
    await QuestionSetModel.create(defaultQuestionSet);
    await QuestionModel.insertMany(questions);
    await mongoose.default.disconnect();
  } else {
    const { BatchWriteCommand } = await import("@aws-sdk/lib-dynamodb");
    const { DynamoDBClient } = await import("@aws-sdk/client-dynamodb");
    const { DynamoDBDocumentClient, PutCommand } = await import("@aws-sdk/lib-dynamodb");

    const client = new DynamoDBClient({ region: process.env.AWS_REGION ?? "ap-southeast-5" });
    const docClient = DynamoDBDocumentClient.from(client, {
      marshallOptions: { removeUndefinedValues: true },
    });

    // Seed question set
    await docClient.send(new PutCommand({ TableName: "QuestionSets", Item: defaultQuestionSet }));
    console.log("   Created default question set");

    // Seed questions
    for (let i = 0; i < questions.length; i += 25) {
      const batch = questions.slice(i, i + 25);
      await docClient.send(
        new BatchWriteCommand({
          RequestItems: {
            Questions: batch.map((q) => ({ PutRequest: { Item: q } })),
          },
        })
      );
      console.log(`   Batch ${Math.floor(i / 25) + 1}: wrote ${batch.length} questions`);
    }
  }

  console.log("   Seeding complete.");
}

const isMainModule = process.argv[1]?.includes("seed-questions");
if (isMainModule) {
  const { config } = require("dotenv");
  config({ path: ".env.local" });
  seedQuestions().catch((err) => {
    console.error("Failed to seed questions:", err);
    process.exit(1);
  });
}
