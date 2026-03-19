export interface Question {
  questionId: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: "A" | "B" | "C" | "D";
  createdAt: string;
}

export interface Assessment {
  assessmentId: string;
  title: string;
  questionIds: string[];
  durationMinutes: number;
  createdAt: string;
}

export interface Candidate {
  candidateId: string;
  name: string;
  email: string;
}

export interface Invite {
  inviteId: string;
  assessmentId: string;
  candidateId: string;
  token: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  startTime?: string;
  endTime?: string;
  createdAt: string;
}

export interface Answer {
  attemptId: string; // same as inviteId
  questionId: string; // sort key
  selectedAnswer: string;
  updatedAt: string;
}

export type ClientQuestion = Omit<Question, "correctAnswer">;
