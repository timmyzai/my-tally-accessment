import type { Question, Answer, ClientQuestion } from "@/lib/types";

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
