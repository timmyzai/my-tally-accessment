import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const VALID_ANSWERS = new Set(["A", "B", "C", "D"]);

export async function PUT(request: Request) {
  try {
    const { token, questionId, selectedAnswer } = await request.json();

    if (!token || !questionId || !selectedAnswer) {
      return NextResponse.json(
        { error: "token, questionId, and selectedAnswer are required" },
        { status: 400 }
      );
    }

    if (!VALID_ANSWERS.has(selectedAnswer)) {
      return NextResponse.json(
        { error: "selectedAnswer must be one of A, B, C, D" },
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
    const endTime = invite.endTime
      ? new Date(invite.endTime).getTime()
      : now;

    if (now >= endTime) {
      await db.updateInviteStatus(invite.inviteId, "COMPLETED");
      return NextResponse.json(
        { error: "Assessment time has expired" },
        { status: 410 }
      );
    }

    // Validate questionId is in the assessment's questionIds
    const assessment = await db.getAssessmentById(invite.assessmentId);
    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    if (!assessment.questionIds.includes(questionId)) {
      return NextResponse.json(
        { error: "Question is not part of this assessment" },
        { status: 400 }
      );
    }

    await db.upsertAnswer({
      attemptId: invite.inviteId,
      questionId,
      selectedAnswer,
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
