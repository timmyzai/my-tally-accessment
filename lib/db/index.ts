import type { DB } from "./interface";

function createDB(): DB {
  if (process.env.USE_MONGODB === "true") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("./mongodb").mongoDB;
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("./dynamodb").dynamoDB;
}

export const db: DB = createDB();
export type { DB } from "./interface";
