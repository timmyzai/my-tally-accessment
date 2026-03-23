import type { Question, Answer } from "@/lib/types";

export function getAnswerSummary(
  questionIds: string[],
  questions: Question[],
  answers: Answer[]
): {
  totalQuestions: number;
  answeredCount: number;
  breakdown: {
    questionId: string;
    questionText: string;
    isOptional: boolean;
    answerText: string | null;
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
    return {
      questionId,
      questionText: question?.questionText ?? "",
      isOptional: question?.isOptional ?? false,
      answerText: answer?.answerText ?? null,
    };
  });

  return {
    totalQuestions: questionIds.length,
    answeredCount: answers.length,
    breakdown,
  };
}
