export interface QuestionData {
  questionId: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
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
  answers: { questionId: string; selectedAnswer: string }[];
  remainingTime: number;
}

export interface CompletedData {
  status: "COMPLETED";
  score: number;
  totalQuestions: number;
  answeredCount: number;
}

export type AssessmentData = NotStartedData | InProgressData | CompletedData;

export interface CompletedResult {
  score: number;
  totalQuestions: number;
  answeredCount: number;
}
