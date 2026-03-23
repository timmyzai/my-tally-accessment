import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(request: Request) {
  try {
    const { token, questionId, answerText } = await request.json();

    if (!token || !questionId) {
      return NextResponse.json(
        { error: "token and questionId are required" },
        { status: 400 }
      );
    }

    const invite = await db.getInviteByToken(token);
    if (!invite) {
      return NextResponse.json({ error: "Token not found" }, { status: 404 });
    }

    if (invite.status !== "IN_PROGRESS") {
      return NextResponse.json(
        { error: "Assessment is not in progress" },
        { status: 400 }
      );
    }

    // Check if time has expired
    const now = Date.now();
    const endTime = invite.endTime ? new Date(invite.endTime).getTime() : now;

    if (now >= endTime) {
      await db.updateInviteStatus(invite.inviteId, "COMPLETED");
      return NextResponse.json(
        { error: "Assessment time has expired" },
        { status: 410 }
      );
    }

    // Validate questionId is in the assigned questions
    if (invite.assignedQuestionIds && !invite.assignedQuestionIds.includes(questionId)) {
      return NextResponse.json(
        { error: "Question is not part of this assessment" },
        { status: 400 }
      );
    }

    await db.upsertAnswer({
      attemptId: invite.inviteId,
      questionId,
      answerText: answerText ?? "",
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving answer:", error);
    return NextResponse.json(
      { error: "Failed to save answer" },
      { status: 500 }
    );
  }
}
