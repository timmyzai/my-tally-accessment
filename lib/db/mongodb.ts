import mongoose from "mongoose";
import type { Question, Assessment, Candidate, Invite, Answer } from "@/lib/types";
import type { DB } from "./interface";

// --- Connection ---
const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://localhost:27017/tally_assessment";

let connected = false;
async function connect() {
  if (connected) return;
  if (mongoose.connection.readyState === 1) {
    connected = true;
    return;
  }
  await mongoose.connect(MONGODB_URI);
  connected = true;
}

// --- Schemas ---
const questionSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true, unique: true },
    questionText: String,
    optionA: String,
    optionB: String,
    optionC: String,
    optionD: String,
    correctAnswer: String,
    createdAt: String,
  },
  { collection: "questions", id: false, versionKey: false }
);

const assessmentSchema = new mongoose.Schema(
  {
    assessmentId: { type: String, required: true, unique: true },
    title: String,
    questionIds: [String],
    durationMinutes: Number,
    createdAt: String,
  },
  { collection: "assessments", id: false, versionKey: false }
);

const candidateSchema = new mongoose.Schema(
  {
    candidateId: { type: String, required: true, unique: true },
    name: String,
    email: String,
  },
  { collection: "candidates", id: false, versionKey: false }
);

const inviteSchema = new mongoose.Schema(
  {
    inviteId: { type: String, required: true, unique: true },
    assessmentId: String,
    candidateId: String,
    token: { type: String, unique: true },
    status: String,
    startTime: String,
    endTime: String,
    createdAt: String,
  },
  { collection: "invites", id: false, versionKey: false }
);

const answerSchema = new mongoose.Schema(
  {
    attemptId: { type: String, required: true },
    questionId: { type: String, required: true },
    selectedAnswer: String,
    updatedAt: String,
  },
  { collection: "answers", id: false, versionKey: false }
);
answerSchema.index({ attemptId: 1, questionId: 1 }, { unique: true });

// --- Models (reuse if already compiled) ---
const QuestionModel = mongoose.models.Question || mongoose.model("Question", questionSchema);
const AssessmentModel = mongoose.models.Assessment || mongoose.model("Assessment", assessmentSchema);
const CandidateModel = mongoose.models.Candidate || mongoose.model("Candidate", candidateSchema);
const InviteModel = mongoose.models.Invite || mongoose.model("Invite", inviteSchema);
const AnswerModel = mongoose.models.Answer || mongoose.model("Answer", answerSchema);

function clean<T>(doc: mongoose.Document | Record<string, unknown>): T {
  const obj = "toObject" in doc ? (doc as mongoose.Document).toObject() : doc;
  delete obj._id;
  return obj as T;
}

function cleanAll<T>(docs: (mongoose.Document | Record<string, unknown>)[]): T[] {
  return docs.map((d) => clean<T>(d));
}

export const mongoDB: DB = {
  // Questions
  async getAllQuestions() {
    await connect();
    return cleanAll<Question>(await QuestionModel.find().lean());
  },
  async createQuestion(question) {
    await connect();
    await QuestionModel.create(question);
  },

  // Assessments
  async getAllAssessments() {
    await connect();
    return cleanAll<Assessment>(await AssessmentModel.find().lean());
  },
  async getAssessmentById(assessmentId) {
    await connect();
    const doc = await AssessmentModel.findOne({ assessmentId }).lean();
    return doc ? clean<Assessment>(doc) : null;
  },
  async createAssessment(assessment) {
    await connect();
    await AssessmentModel.create(assessment);
  },

  // Candidates
  async getAllCandidates() {
    await connect();
    return cleanAll<Candidate>(await CandidateModel.find().lean());
  },
  async getCandidateById(candidateId) {
    await connect();
    const doc = await CandidateModel.findOne({ candidateId }).lean();
    return doc ? clean<Candidate>(doc) : null;
  },
  async createCandidate(candidate) {
    await connect();
    await CandidateModel.create(candidate);
  },

  // Invites
  async getAllInvites() {
    await connect();
    return cleanAll<Invite>(await InviteModel.find().lean());
  },
  async getInviteById(inviteId) {
    await connect();
    const doc = await InviteModel.findOne({ inviteId }).lean();
    return doc ? clean<Invite>(doc) : null;
  },
  async getInviteByToken(token) {
    await connect();
    const doc = await InviteModel.findOne({ token }).lean();
    return doc ? clean<Invite>(doc) : null;
  },
  async createInvite(invite) {
    await connect();
    await InviteModel.create(invite);
  },
  async updateInviteStatus(inviteId, status) {
    await connect();
    await InviteModel.updateOne({ inviteId }, { $set: { status } });
  },
  async startInvite(inviteId, startTime, endTime) {
    await connect();
    const result = await InviteModel.updateOne(
      { inviteId, status: "NOT_STARTED" },
      { $set: { status: "IN_PROGRESS", startTime, endTime } }
    );
    return result.modifiedCount > 0;
  },

  // Answers
  async upsertAnswer(answer) {
    await connect();
    await AnswerModel.updateOne(
      { attemptId: answer.attemptId, questionId: answer.questionId },
      { $set: answer },
      { upsert: true }
    );
  },
  async getAnswersByAttemptId(attemptId) {
    await connect();
    return cleanAll<Answer>(await AnswerModel.find({ attemptId }).lean());
  },

  // Batch operations
  async getQuestionsByIds(questionIds) {
    if (questionIds.length === 0) return [];
    await connect();
    return cleanAll<Question>(
      await QuestionModel.find({ questionId: { $in: questionIds } }).lean()
    );
  },
  async getAssessmentsByIds(assessmentIds) {
    if (assessmentIds.length === 0) return [];
    await connect();
    return cleanAll<Assessment>(
      await AssessmentModel.find({ assessmentId: { $in: assessmentIds } }).lean()
    );
  },
  async getCandidatesByIds(candidateIds) {
    if (candidateIds.length === 0) return [];
    await connect();
    return cleanAll<Candidate>(
      await CandidateModel.find({ candidateId: { $in: candidateIds } }).lean()
    );
  },
};
