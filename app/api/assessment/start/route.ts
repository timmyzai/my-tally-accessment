import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getClientQuestions } from "@/lib/helpers";

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
      const questions = await db.getQuestionsByIds(assessment.questionIds);
      const clientQuestions = getClientQuestions(questions);

      return NextResponse.json({
        inviteId: invite.inviteId,
        questions: clientQuestions,
        endTime: invite.endTime,
        totalQuestions: assessment.questionIds.length,
      });
    }

    // NOT_STARTED: start the assessment
    const now = new Date();
    const endTime = new Date(
      now.getTime() + assessment.durationMinutes * 60 * 1000
    );

    const started = await db.startInvite(
      invite.inviteId,
      now.toISOString(),
      endTime.toISOString()
    );

    if (!started) {
      return NextResponse.json(
        { error: "Assessment has already been started" },
        { status: 409 }
      );
    }

    const questions = await db.getQuestionsByIds(assessment.questionIds);
    const clientQuestions = getClientQuestions(questions);

    return NextResponse.json({
      inviteId: invite.inviteId,
      questions: clientQuestions,
      endTime: endTime.toISOString(),
      totalQuestions: assessment.questionIds.length,
    });
  } catch (error) {
    console.error("Error starting assessment:", error);
    return NextResponse.json(
      { error: "Failed to start assessment" },
      { status: 500 }
    );
  }
}
