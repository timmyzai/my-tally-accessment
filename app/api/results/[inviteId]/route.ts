import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { computeScore } from "@/lib/helpers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ inviteId: string }> }
) {
  try {
    const { inviteId } = await params;

    const invite = await db.getInviteById(inviteId);
    if (!invite) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    const [answers, assessment] = await Promise.all([
      db.getAnswersByAttemptId(inviteId),
      db.getAssessmentById(invite.assessmentId),
    ]);

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    const questions = await db.getQuestionsByIds(assessment.questionIds);

    const { score, totalQuestions, answeredCount, breakdown } = computeScore(
      assessment.questionIds,
      questions,
      answers
    );

    return NextResponse.json({
      invite,
      score,
      totalQuestions,
      answeredCount,
      breakdown,
    });
  } catch (error) {
    console.error("Error fetching results:", error);
    return NextResponse.json(
      { error: "Failed to fetch results" },
      { status: 500 }
    );
  }
}
