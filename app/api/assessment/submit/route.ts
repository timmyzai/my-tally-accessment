import { NextResponse } from "next/server";
import { db } from "@/lib/db";

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

    const answers = await db.getAnswersByAttemptId(invite.inviteId);
    const totalQuestions = invite.assignedQuestionIds?.length ?? 0;

    return NextResponse.json({
      totalQuestions,
      answeredCount: answers.length,
    });
  } catch (error) {
    console.error("Error submitting assessment:", error);
    return NextResponse.json(
      { error: "Failed to submit assessment" },
      { status: 500 }
    );
  }
}
