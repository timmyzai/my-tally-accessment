import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const invite = await db.getInviteByToken(token);
    if (!invite) {
      return NextResponse.json({ error: "Token not found" }, { status: 404 });
    }

    if (invite.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Assessment already completed" },
        { status: 410 }
      );
    }

    const assessment = await db.getAssessmentById(invite.assessmentId);
    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    // If IN_PROGRESS, return existing data for idempotent resume
    if (invite.status === "IN_PROGRESS") {
      const questionIds = invite.assignedQuestionIds ?? [];
      const questions = await db.getQuestionsByIds(questionIds);

      return NextResponse.json({
        inviteId: invite.inviteId,
        questions: questions.map((q) => ({
          questionId: q.questionId,
          questionText: q.questionText,
          isOptional: q.isOptional,
        })),
        endTime: invite.endTime,
        totalQuestions: questionIds.length,
      });
    }

    // NOT_STARTED: randomly select questions from the set
    const allQuestions = await db.getQuestionsBySetId(assessment.questionSetId);
    const shuffled = shuffleArray(allQuestions);
    const selected = shuffled.slice(0, Math.min(assessment.numQuestions, allQuestions.length));
    const assignedQuestionIds = selected.map((q) => q.questionId);

    const now = new Date();
    const endTime = new Date(
      now.getTime() + assessment.durationMinutes * 60 * 1000
    );

    const started = await db.startInvite(
      invite.inviteId,
      now.toISOString(),
      endTime.toISOString(),
      assignedQuestionIds
    );

    if (!started) {
      return NextResponse.json(
        { error: "Assessment has already been started" },
        { status: 409 }
      );
    }

    return NextResponse.json({
      inviteId: invite.inviteId,
      questions: selected.map((q) => ({
        questionId: q.questionId,
        questionText: q.questionText,
        isOptional: q.isOptional,
      })),
      endTime: endTime.toISOString(),
      totalQuestions: selected.length,
    });
  } catch (error) {
    console.error("Error starting assessment:", error);
    return NextResponse.json(
      { error: "Failed to start assessment" },
      { status: 500 }
    );
  }
}
