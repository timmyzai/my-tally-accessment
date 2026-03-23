import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { computeScore } from "@/lib/helpers";

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
        { status: 409 }
      );
    }

    if (invite.status !== "IN_PROGRESS") {
      return NextResponse.json(
        { error: "Assessment has not been started" },
        { status: 400 }
      );
    }

    await db.updateInviteStatus(invite.inviteId, "COMPLETED");

    const assessment = await db.getAssessmentById(invite.assessmentId);
    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    const [questions, answers] = await Promise.all([
      db.getQuestionsByIds(assessment.questionIds),
      db.getAnswersByAttemptId(invite.inviteId),
    ]);

    const { score, totalQuestions, answeredCount } = computeScore(
      assessment.questionIds,
      questions,
      answers
    );

    return NextResponse.json({
      score,
      totalQuestions,
      answeredCount,
    });
  } catch (error) {
    console.error("Error submitting assessment:", error);
    return NextResponse.json(
      { error: "Failed to submit assessment" },
      { status: 500 }
    );
  }
}
