export interface QuestionData {
  questionId: string;
  questionText: string;
  isOptional: boolean;
}

export interface NotStartedData {
  status: "NOT_STARTED";
  assessmentTitle: string | null;
  candidateName: string | null;
  durationMinutes: number | null;
  totalQuestions: number;
}

export interface InProgressData {
  status: "IN_PROGRESS";
  questions: QuestionData[];
  answers: { questionId: string; answerText: string }[];
  remainingTime: number;
}

export interface CompletedData {
  status: "COMPLETED";
  totalQuestions: number;
  answeredCount: number;
}

export type AssessmentData = NotStartedData | InProgressData | CompletedData;

export interface CompletedResult {
  totalQuestions: number;
  answeredCount: number;
}
