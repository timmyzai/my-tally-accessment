export interface QuestionSet {
  questionSetId: string;
  name: string;
  createdAt: string;
}

export interface Question {
  questionId: string;
  questionText: string;
  isOptional: boolean;
  questionSetId: string;
  createdAt: string;
}

export interface Assessment {
  assessmentId: string;
  title: string;
  questionSetId: string;
  numQuestions: number;
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
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "REVOKED";
  assignedQuestionIds?: string[];
  startTime?: string;
  endTime?: string;
  createdAt: string;
}

export interface Answer {
  attemptId: string; // same as inviteId
  questionId: string; // sort key
  answerText: string;
  updatedAt: string;
}
