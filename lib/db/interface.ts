import type { Question, Assessment, Candidate, Invite, Answer } from "@/lib/types";

export interface DB {
  // Questions
  getAllQuestions(): Promise<Question[]>;
  createQuestion(question: Question): Promise<void>;

  // Assessments
  getAllAssessments(): Promise<Assessment[]>;
  getAssessmentById(assessmentId: string): Promise<Assessment | null>;
  createAssessment(assessment: Assessment): Promise<void>;

  // Candidates
  getAllCandidates(): Promise<Candidate[]>;
  getCandidateById(candidateId: string): Promise<Candidate | null>;
  createCandidate(candidate: Candidate): Promise<void>;

  // Invites
  getAllInvites(): Promise<Invite[]>;
  getInviteById(inviteId: string): Promise<Invite | null>;
  getInviteByToken(token: string): Promise<Invite | null>;
  createInvite(invite: Invite): Promise<void>;
  updateInviteStatus(inviteId: string, status: Invite["status"]): Promise<void>;
  startInvite(inviteId: string, startTime: string, endTime: string): Promise<boolean>;

  // Answers
  upsertAnswer(answer: Answer): Promise<void>;
  getAnswersByAttemptId(attemptId: string): Promise<Answer[]>;

  // Batch operations
  getQuestionsByIds(questionIds: string[]): Promise<Question[]>;
  getAssessmentsByIds(assessmentIds: string[]): Promise<Assessment[]>;
  getCandidatesByIds(candidateIds: string[]): Promise<Candidate[]>;
}
