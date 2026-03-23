import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAnswerSummary } from "@/lib/helpers";

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

    const questionIds = invite.assignedQuestionIds ?? [];
    const [answers, questions] = await Promise.all([
      db.getAnswersByAttemptId(inviteId),
      db.getQuestionsByIds(questionIds),
    ]);

    const { totalQuestions, answeredCount, breakdown } = getAnswerSummary(
      questionIds,
      questions,
      answers
    );

    return NextResponse.json({
      invite,
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
