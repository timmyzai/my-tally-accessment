import { BatchWriteCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { docClient, Tables } from "../lib/dynamodb";
import type { Question } from "../lib/types";

const now = new Date().toISOString();

const questions: Question[] = [
  // JavaScript (10)
  { questionId: uuidv4(), questionText: "What is the output of `typeof null` in JavaScript?", optionA: "\"null\"", optionB: "\"object\"", optionC: "\"undefined\"", optionD: "\"boolean\"", correctAnswer: "B", createdAt: now },
  { questionId: uuidv4(), questionText: "Which method converts a JSON string to a JavaScript object?", optionA: "JSON.stringify()", optionB: "JSON.parse()", optionC: "JSON.toObject()", optionD: "JSON.convert()", correctAnswer: "B", createdAt: now },
  { questionId: uuidv4(), questionText: "What does `Array.prototype.reduce()` return?", optionA: "A new array", optionB: "A boolean", optionC: "A single accumulated value", optionD: "undefined", correctAnswer: "C", createdAt: now },
  { questionId: uuidv4(), questionText: "Which keyword declares a block-scoped variable in JavaScript?", optionA: "var", optionB: "let", optionC: "define", optionD: "dim", correctAnswer: "B", createdAt: now },
  { questionId: uuidv4(), questionText: "What is the result of `0.1 + 0.2 === 0.3` in JavaScript?", optionA: "true", optionB: "false", optionC: "TypeError", optionD: "undefined", correctAnswer: "B", createdAt: now },
  { questionId: uuidv4(), questionText: "Which statement about closures is correct?", optionA: "A closure is a function without access to outer scope", optionB: "Closures only work with arrow functions", optionC: "A closure retains access to its lexical scope even after the outer function returns", optionD: "Closures are not supported in strict mode", correctAnswer: "C", createdAt: now },
  { questionId: uuidv4(), questionText: "What does the `??` (nullish coalescing) operator do?", optionA: "Returns right operand if left is null or undefined", optionB: "Returns right operand if left is any falsy value", optionC: "Performs logical AND", optionD: "Throws if left is null", correctAnswer: "A", createdAt: now },
  { questionId: uuidv4(), questionText: "What is the event loop in JavaScript?", optionA: "A loop that iterates over DOM events", optionB: "A mechanism that handles asynchronous callbacks by monitoring the call stack and task queue", optionC: "A for-loop variant for events", optionD: "A Node.js-only concept", correctAnswer: "B", createdAt: now },
  { questionId: uuidv4(), questionText: "Which of these creates a shallow copy of an array?", optionA: "arr.clone()", optionB: "arr.copy()", optionC: "[...arr]", optionD: "Array.deepCopy(arr)", correctAnswer: "C", createdAt: now },
  { questionId: uuidv4(), questionText: "What does `Promise.all()` do if one promise rejects?", optionA: "Returns all results, with rejected ones as null", optionB: "Waits for all promises to settle", optionC: "Rejects immediately with the first rejection reason", optionD: "Ignores the rejected promise", correctAnswer: "C", createdAt: now },

  // TypeScript (10)
  { questionId: uuidv4(), questionText: "What is the `unknown` type in TypeScript?", optionA: "Same as `any`", optionB: "A type-safe counterpart of `any` that requires type checking before use", optionC: "A type that represents null", optionD: "An alias for `never`", correctAnswer: "B", createdAt: now },
  { questionId: uuidv4(), questionText: "What does the `keyof` operator return in TypeScript?", optionA: "The values of an object", optionB: "A union of the property names (keys) of a type", optionC: "The first key of an object", optionD: "An array of keys", correctAnswer: "B", createdAt: now },
  { questionId: uuidv4(), questionText: "Which TypeScript utility type makes all properties optional?", optionA: "Required<T>", optionB: "Readonly<T>", optionC: "Partial<T>", optionD: "Pick<T, K>", correctAnswer: "C", createdAt: now },
  { questionId: uuidv4(), questionText: "What is a discriminated union in TypeScript?", optionA: "A union of primitive types only", optionB: "A union of types sharing a common literal property used for narrowing", optionC: "A union that excludes null", optionD: "An intersection type", correctAnswer: "B", createdAt: now },
  { questionId: uuidv4(), questionText: "What does `as const` do in TypeScript?", optionA: "Declares a constant variable", optionB: "Makes the type immutable and narrows literals to their exact values", optionC: "Casts to the const type", optionD: "Prevents reassignment at runtime", correctAnswer: "B", createdAt: now },
  { questionId: uuidv4(), questionText: "Which TypeScript type represents a value that never occurs?", optionA: "void", optionB: "null", optionC: "undefined", optionD: "never", correctAnswer: "D", createdAt: now },
  { questionId: uuidv4(), questionText: "What is the purpose of TypeScript generics?", optionA: "To create classes only", optionB: "To allow types to be parameterized, enabling reusable type-safe code", optionC: "To bypass type checking", optionD: "To generate JavaScript code", correctAnswer: "B", createdAt: now },
  { questionId: uuidv4(), questionText: "What does `Omit<T, K>` do?", optionA: "Adds keys K to type T", optionB: "Creates a type with all properties of T except those in K", optionC: "Makes keys K required", optionD: "Removes all keys from T", correctAnswer: "B", createdAt: now },
  { questionId: uuidv4(), questionText: "What is the difference between `interface` and `type` in TypeScript?", optionA: "They are identical in every way", optionB: "Interfaces support declaration merging; type aliases support unions and intersections more flexibly", optionC: "Types cannot describe objects", optionD: "Interfaces cannot extend other interfaces", correctAnswer: "B", createdAt: now },
  { questionId: uuidv4(), questionText: "What does `satisfies` keyword do in TypeScript?", optionA: "Replaces `as` for type assertions", optionB: "Validates that an expression matches a type while preserving the narrowest inferred type", optionC: "Checks types at runtime", optionD: "Is a deprecated keyword", correctAnswer: "B", createdAt: now },

  // React (10)
  { questionId: uuidv4(), questionText: "What is the purpose of `useEffect` in React?", optionA: "To manage state", optionB: "To perform side effects after render", optionC: "To handle events", optionD: "To create context", correctAnswer: "B", createdAt: now },
  { questionId: uuidv4(), questionText: "What does `React.memo()` do?", optionA: "Caches API responses", optionB: "Memoizes a component to skip re-renders if props haven't changed", optionC: "Creates a memo data structure", optionD: "Stores state between renders", correctAnswer: "B", createdAt: now },
  { questionId: uuidv4(), questionText: "What is the correct way to update state based on previous state?", optionA: "setState(state + 1)", optionB: "setState(prev => prev + 1)", optionC: "state = state + 1", optionD: "this.state += 1", correctAnswer: "B", createdAt: now },
  { questionId: uuidv4(), questionText: "What is the purpose of `useRef` in React?", optionA: "To create a mutable ref that persists across renders without causing re-renders", optionB: "To reference other components", optionC: "To create global variables", optionD: "To trigger re-renders", correctAnswer: "A", createdAt: now },
  { questionId: uuidv4(), questionText: "Which hook is used to share state across components without prop drilling?", optionA: "useState", optionB: "useReducer", optionC: "useContext", optionD: "useMemo", correctAnswer: "C", createdAt: now },
  { questionId: uuidv4(), questionText: "What is a controlled component in React?", optionA: "A component wrapped in an error boundary", optionB: "A form element whose value is controlled by React state", optionC: "A component that cannot be re-rendered", optionD: "A component created by a factory function", correctAnswer: "B", createdAt: now },
  { questionId: uuidv4(), questionText: "What is the key prop used for in React lists?", optionA: "Styling list items", optionB: "Helping React identify which items have changed, been added, or removed", optionC: "Sorting the list", optionD: "Setting accessibility attributes", correctAnswer: "B", createdAt: now },
  { questionId: uuidv4(), questionText: "What is the difference between `useMemo` and `useCallback`?", optionA: "They are identical", optionB: "useMemo memoizes a computed value; useCallback memoizes a function reference", optionC: "useMemo is for async operations", optionD: "useCallback is deprecated", correctAnswer: "B", createdAt: now },
  { questionId: uuidv4(), questionText: "What does `useReducer` provide over `useState`?", optionA: "Better performance always", optionB: "Structured state transitions via a reducer function, useful for complex state logic", optionC: "Automatic API calls", optionD: "Server-side rendering", correctAnswer: "B", createdAt: now },
  { questionId: uuidv4(), questionText: "What triggers a re-render in React?", optionA: "Changing a local variable", optionB: "Calling setState or a state updater, context change, or parent re-render", optionC: "Modifying the DOM directly", optionD: "Using console.log", correctAnswer: "B", createdAt: now },

  // Next.js (10)
  { questionId: uuidv4(), questionText: "What is the difference between `page.tsx` and `layout.tsx` in Next.js App Router?", optionA: "They are interchangeable", optionB: "page.tsx defines the unique UI for a route; layout.tsx wraps pages and persists across navigation", optionC: "layout.tsx is only for CSS", optionD: "page.tsx cannot use server components", correctAnswer: "B", createdAt: now },
  { questionId: uuidv4(), questionText: "What is a Server Component in Next.js?", optionA: "A component that only runs on the client", optionB: "A component that renders on the server by default, reducing client-side JavaScript", optionC: "A component that manages server configuration", optionD: "A REST API endpoint", correctAnswer: "B", createdAt: now },
  { questionId: uuidv4(), questionText: "How do you create an API route in Next.js App Router?", optionA: "Create a file in /pages/api/", optionB: "Create a route.ts file in the /app/ directory", optionC: "Use getServerSideProps", optionD: "Create a .api.ts file anywhere", correctAnswer: "B", createdAt: now },
  { questionId: uuidv4(), questionText: "What does `'use client'` directive do in Next.js?", optionA: "Marks a component as a Client Component, enabling hooks and browser APIs", optionB: "Makes the component server-only", optionC: "Enables TypeScript", optionD: "Adds client-side caching", correctAnswer: "A", createdAt: now },
  { questionId: uuidv4(), questionText: "What is `generateStaticParams` used for in Next.js?", optionA: "Generating query parameters", optionB: "Defining which dynamic route segments to statically generate at build time", optionC: "Creating form parameters", optionD: "Generating random IDs", correctAnswer: "B", createdAt: now },
  { questionId: uuidv4(), questionText: "What is the purpose of `loading.tsx` in Next.js App Router?", optionA: "To define error pages", optionB: "To show instant loading UI via React Suspense while a route segment loads", optionC: "To preload JavaScript", optionD: "To configure lazy loading", correctAnswer: "B", createdAt: now },
  { questionId: uuidv4(), questionText: "How does Next.js handle metadata for SEO?", optionA: "Only through <head> tags", optionB: "By exporting a `metadata` object or `generateMetadata` function from page/layout files", optionC: "Through a separate SEO config file", optionD: "Metadata is not supported", correctAnswer: "B", createdAt: now },
  { questionId: uuidv4(), questionText: "What is middleware in Next.js?", optionA: "Server components", optionB: "Code that runs before a request is completed, enabling redirects, rewrites, and header modifications", optionC: "Database connection layer", optionD: "CSS preprocessing", correctAnswer: "B", createdAt: now },
  { questionId: uuidv4(), questionText: "What does `revalidatePath()` do in Next.js?", optionA: "Validates URL format", optionB: "Purges the cache for a specific path, triggering re-rendering on next visit", optionC: "Checks if a path exists", optionD: "Redirects to another path", correctAnswer: "B", createdAt: now },
  { questionId: uuidv4(), questionText: "What is the purpose of `error.tsx` in Next.js App Router?", optionA: "To log errors to console", optionB: "To create an error boundary that catches errors in a route segment and shows a fallback UI", optionC: "To configure error reporting", optionD: "To handle 404 pages only", correctAnswer: "B", createdAt: now },

  // Web Fundamentals (10)
  { questionId: uuidv4(), questionText: "What does CORS stand for?", optionA: "Cross-Origin Resource Sharing", optionB: "Client-Origin Request System", optionC: "Cross-Object Rendering Service", optionD: "Cached Origin Response Standard", correctAnswer: "A", createdAt: now },
  { questionId: uuidv4(), questionText: "Which HTTP method is idempotent?", optionA: "POST", optionB: "PUT", optionC: "PATCH (always)", optionD: "CONNECT", correctAnswer: "B", createdAt: now },
  { questionId: uuidv4(), questionText: "What is the purpose of the `Content-Type` HTTP header?", optionA: "To specify caching rules", optionB: "To indicate the media type of the request/response body", optionC: "To set authentication tokens", optionD: "To define CORS policies", correctAnswer: "B", createdAt: now },
  { questionId: uuidv4(), questionText: "What does the HTTP status code 401 indicate?", optionA: "Not Found", optionB: "Unauthorized — authentication is required", optionC: "Forbidden", optionD: "Bad Request", correctAnswer: "B", createdAt: now },
  { questionId: uuidv4(), questionText: "What is the difference between `localStorage` and `sessionStorage`?", optionA: "They are identical", optionB: "localStorage persists until explicitly cleared; sessionStorage is cleared when the tab closes", optionC: "sessionStorage has more capacity", optionD: "localStorage is server-side", correctAnswer: "B", createdAt: now },
  { questionId: uuidv4(), questionText: "What is the purpose of a service worker?", optionA: "To run server-side code", optionB: "To act as a proxy between the browser and network, enabling offline support and caching", optionC: "To manage Web Workers", optionD: "To compile JavaScript", correctAnswer: "B", createdAt: now },
  { questionId: uuidv4(), questionText: "What does the `defer` attribute do on a script tag?", optionA: "Prevents the script from executing", optionB: "Downloads the script in parallel and executes it after HTML parsing is complete", optionC: "Makes the script execute immediately", optionD: "Loads the script from a CDN", correctAnswer: "B", createdAt: now },
  { questionId: uuidv4(), questionText: "What is the Critical Rendering Path?", optionA: "The path to the main CSS file", optionB: "The sequence of steps the browser takes to convert HTML, CSS, and JS into rendered pixels", optionC: "A JavaScript optimization technique", optionD: "The server-side rendering pipeline", correctAnswer: "B", createdAt: now },
  { questionId: uuidv4(), questionText: "What is the purpose of the `alt` attribute on an `<img>` tag?", optionA: "To set the image title", optionB: "To provide alternative text for accessibility and when the image fails to load", optionC: "To specify image dimensions", optionD: "To set a tooltip", correctAnswer: "B", createdAt: now },
  { questionId: uuidv4(), questionText: "What is the difference between `==` and `===` in JavaScript?", optionA: "No difference", optionB: "`==` performs type coercion before comparison; `===` checks value and type without coercion", optionC: "`===` is slower", optionD: "`==` only works with strings", correctAnswer: "B", createdAt: now },
];

export async function seedQuestions() {
  console.log(`   Seeding ${questions.length} questions...`);

  // BatchWrite supports max 25 items per request
  for (let i = 0; i < questions.length; i += 25) {
    const batch = questions.slice(i, i + 25);
    await docClient.send(
      new BatchWriteCommand({
        RequestItems: {
          [Tables.Questions]: batch.map((q) => ({
            PutRequest: { Item: q },
          })),
        },
      })
    );
    console.log(`   Batch ${Math.floor(i / 25) + 1}: wrote ${batch.length} questions`);
  }

  console.log("   Seeding complete.");
}

// Run standalone if executed directly
const isMainModule = process.argv[1]?.includes("seed-questions");
if (isMainModule) {
  seedQuestions().catch((err) => {
    console.error("Failed to seed questions:", err);
    process.exit(1);
  });
}
