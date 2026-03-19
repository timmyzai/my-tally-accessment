import { QueryCommand, BatchGetCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, Tables } from "@/lib/dynamodb";
import type {
  Invite,
  Question,
  Answer,
  ClientQuestion,
} from "@/lib/types";

/**
 * Look up an invite by its token using the TokenIndex GSI.
 */
export async function getInviteByToken(
  token: string
): Promise<Invite | null> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: Tables.Invites,
      IndexName: "TokenIndex",
      KeyConditionExpression: "#token = :token",
      ExpressionAttributeNames: { "#token": "token" },
      ExpressionAttributeValues: { ":token": token },
    })
  );

  return (result.Items?.[0] as Invite) ?? null;
}

/**
 * Fetch questions by IDs using BatchGetCommand.
 * Handles the 100-item DynamoDB limit by chunking,
 * and retries any UnprocessedKeys.
 */
export async function getQuestionsByIds(
  questionIds: string[]
): Promise<Question[]> {
  if (questionIds.length === 0) return [];

  const questions: Question[] = [];

  // Chunk into batches of 100 (DynamoDB BatchGet limit)
  for (let i = 0; i < questionIds.length; i += 100) {
    const chunk = questionIds.slice(i, i + 100);
    let keys = chunk.map((id) => ({ questionId: id }));

    while (keys.length > 0) {
      const result = await docClient.send(
        new BatchGetCommand({
          RequestItems: {
            [Tables.Questions]: { Keys: keys },
          },
        })
      );

      const items = (result.Responses?.[Tables.Questions] ?? []) as Question[];
      questions.push(...items);

      // Handle UnprocessedKeys
      const unprocessed = result.UnprocessedKeys?.[Tables.Questions]?.Keys;
      if (unprocessed && unprocessed.length > 0) {
        keys = unprocessed as { questionId: string }[];
      } else {
        break;
      }
    }
  }

  return questions;
}

/**
 * Strip correctAnswer from questions for client-side use.
 */
export function getClientQuestions(questions: Question[]): ClientQuestion[] {
  return questions.map(({ correctAnswer: _ca, ...rest }) => rest);
}

/**
 * Compute the score for a set of questions and answers.
 */
export function computeScore(
  questionIds: string[],
  questions: Question[],
  answers: Answer[]
): {
  score: number;
  totalQuestions: number;
  answeredCount: number;
  breakdown: {
    questionId: string;
    questionText: string;
    selectedAnswer: string | null;
    correctAnswer: string;
    isCorrect: boolean;
  }[];
} {
  const questionMap = new Map<string, Question>();
  for (const q of questions) {
    questionMap.set(q.questionId, q);
  }

  const answerMap = new Map<string, Answer>();
  for (const a of answers) {
    answerMap.set(a.questionId, a);
  }

  const breakdown = questionIds.map((questionId) => {
    const question = questionMap.get(questionId);
    const answer = answerMap.get(questionId);
    const isCorrect = answer?.selectedAnswer === question?.correctAnswer;
    return {
      questionId,
      questionText: question?.questionText ?? "",
      selectedAnswer: answer?.selectedAnswer ?? null,
      correctAnswer: question?.correctAnswer ?? "",
      isCorrect,
    };
  });

  const score = breakdown.filter((b) => b.isCorrect).length;

  return {
    score,
    totalQuestions: questionIds.length,
    answeredCount: answers.length,
    breakdown,
  };
}
