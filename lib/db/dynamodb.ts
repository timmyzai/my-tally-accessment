import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
  BatchGetCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import type { Question, Assessment, Candidate, Invite, Answer, QuestionSet } from "@/lib/types";
import type { DB } from "./interface";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION ?? "ap-southeast-5",
});

const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

const T = {
  Questions: "Questions",
  Assessments: "Assessments",
  Candidates: "Candidates",
  Invites: "Invites",
  Answers: "Answers",
  QuestionSets: "QuestionSets",
} as const;

export const dynamoDB: DB = {
  // QuestionSets
  async getAllQuestionSets() {
    const result = await docClient.send(new ScanCommand({ TableName: T.QuestionSets }));
    return (result.Items ?? []) as QuestionSet[];
  },
  async getQuestionSetById(questionSetId) {
    const result = await docClient.send(
      new GetCommand({ TableName: T.QuestionSets, Key: { questionSetId } })
    );
    return (result.Item as QuestionSet) ?? null;
  },
  async createQuestionSet(questionSet) {
    await docClient.send(new PutCommand({ TableName: T.QuestionSets, Item: questionSet }));
  },

  // Questions
  async getAllQuestions() {
    const result = await docClient.send(new ScanCommand({ TableName: T.Questions }));
    return (result.Items ?? []) as Question[];
  },
  async getQuestionsBySetId(questionSetId) {
    const result = await docClient.send(
      new ScanCommand({
        TableName: T.Questions,
        FilterExpression: "questionSetId = :setId",
        ExpressionAttributeValues: { ":setId": questionSetId },
      })
    );
    return (result.Items ?? []) as Question[];
  },
  async createQuestion(question) {
    await docClient.send(new PutCommand({ TableName: T.Questions, Item: question }));
  },

  // Assessments
  async getAllAssessments() {
    const result = await docClient.send(new ScanCommand({ TableName: T.Assessments }));
    return (result.Items ?? []) as Assessment[];
  },
  async getAssessmentById(assessmentId) {
    const result = await docClient.send(
      new GetCommand({ TableName: T.Assessments, Key: { assessmentId } })
    );
    return (result.Item as Assessment) ?? null;
  },
  async createAssessment(assessment) {
    await docClient.send(new PutCommand({ TableName: T.Assessments, Item: assessment }));
  },

  // Candidates
  async getAllCandidates() {
    const result = await docClient.send(new ScanCommand({ TableName: T.Candidates }));
    return (result.Items ?? []) as Candidate[];
  },
  async getCandidateById(candidateId) {
    const result = await docClient.send(
      new GetCommand({ TableName: T.Candidates, Key: { candidateId } })
    );
    return (result.Item as Candidate) ?? null;
  },
  async createCandidate(candidate) {
    await docClient.send(new PutCommand({ TableName: T.Candidates, Item: candidate }));
  },
  async updateCandidate(candidateId, data) {
    await docClient.send(
      new UpdateCommand({
        TableName: T.Candidates,
        Key: { candidateId },
        UpdateExpression: "SET #name = :name, email = :email",
        ExpressionAttributeNames: { "#name": "name" },
        ExpressionAttributeValues: {
          ":name": data.name,
          ":email": data.email,
        },
      })
    );
  },
  async deleteCandidate(candidateId) {
    await docClient.send(
      new DeleteCommand({ TableName: T.Candidates, Key: { candidateId } })
    );
  },

  // Invites
  async getAllInvites() {
    const result = await docClient.send(new ScanCommand({ TableName: T.Invites }));
    return (result.Items ?? []) as Invite[];
  },
  async getInviteById(inviteId) {
    const result = await docClient.send(
      new GetCommand({ TableName: T.Invites, Key: { inviteId } })
    );
    return (result.Item as Invite) ?? null;
  },
  async getInviteByToken(token) {
    const result = await docClient.send(
      new QueryCommand({
        TableName: T.Invites,
        IndexName: "TokenIndex",
        KeyConditionExpression: "#token = :token",
        ExpressionAttributeNames: { "#token": "token" },
        ExpressionAttributeValues: { ":token": token },
      })
    );
    return (result.Items?.[0] as Invite) ?? null;
  },
  async createInvite(invite) {
    await docClient.send(new PutCommand({ TableName: T.Invites, Item: invite }));
  },
  async updateInviteStatus(inviteId, status) {
    await docClient.send(
      new UpdateCommand({
        TableName: T.Invites,
        Key: { inviteId },
        UpdateExpression: "SET #status = :status",
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: { ":status": status },
      })
    );
  },
  async startInvite(inviteId, startTime, endTime, assignedQuestionIds) {
    try {
      await docClient.send(
        new UpdateCommand({
          TableName: T.Invites,
          Key: { inviteId },
          UpdateExpression:
            "SET #status = :status, startTime = :startTime, endTime = :endTime, assignedQuestionIds = :assignedQuestionIds",
          ConditionExpression: "#status = :notStarted",
          ExpressionAttributeNames: { "#status": "status" },
          ExpressionAttributeValues: {
            ":status": "IN_PROGRESS",
            ":notStarted": "NOT_STARTED",
            ":startTime": startTime,
            ":endTime": endTime,
            ":assignedQuestionIds": assignedQuestionIds,
          },
        })
      );
      return true;
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "ConditionalCheckFailedException") {
        return false;
      }
      throw err;
    }
  },

  // Answers
  async upsertAnswer(answer) {
    await docClient.send(new PutCommand({ TableName: T.Answers, Item: answer }));
  },
  async getAnswersByAttemptId(attemptId) {
    const result = await docClient.send(
      new QueryCommand({
        TableName: T.Answers,
        KeyConditionExpression: "attemptId = :attemptId",
        ExpressionAttributeValues: { ":attemptId": attemptId },
      })
    );
    return (result.Items ?? []) as Answer[];
  },

  // Batch operations
  async getQuestionsByIds(questionIds) {
    if (questionIds.length === 0) return [];
    const questions: Question[] = [];
    for (let i = 0; i < questionIds.length; i += 100) {
      const chunk = questionIds.slice(i, i + 100);
      let keys = chunk.map((id) => ({ questionId: id }));
      while (keys.length > 0) {
        const result = await docClient.send(
          new BatchGetCommand({ RequestItems: { [T.Questions]: { Keys: keys } } })
        );
        questions.push(...((result.Responses?.[T.Questions] ?? []) as Question[]));
        const unprocessed = result.UnprocessedKeys?.[T.Questions]?.Keys;
        if (unprocessed && unprocessed.length > 0) {
          keys = unprocessed as { questionId: string }[];
        } else {
          break;
        }
      }
    }
    return questions;
  },
  async getAssessmentsByIds(assessmentIds) {
    if (assessmentIds.length === 0) return [];
    const keys = assessmentIds.map((id) => ({ assessmentId: id }));
    const result = await docClient.send(
      new BatchGetCommand({ RequestItems: { [T.Assessments]: { Keys: keys } } })
    );
    return (result.Responses?.[T.Assessments] ?? []) as Assessment[];
  },
  async getCandidatesByIds(candidateIds) {
    if (candidateIds.length === 0) return [];
    const keys = candidateIds.map((id) => ({ candidateId: id }));
    const result = await docClient.send(
      new BatchGetCommand({ RequestItems: { [T.Candidates]: { Keys: keys } } })
    );
    return (result.Responses?.[T.Candidates] ?? []) as Candidate[];
  },
};
