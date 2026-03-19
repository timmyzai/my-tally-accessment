import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION ?? "ap-southeast-5",
  ...(process.env.DYNAMODB_ENDPOINT && {
    endpoint: process.env.DYNAMODB_ENDPOINT,
  }),
});

export const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

// Table name constants
export const Tables = {
  Questions: "Questions",
  Assessments: "Assessments",
  Candidates: "Candidates",
  Invites: "Invites",
  Answers: "Answers",
} as const;
