import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const invite = await db.getInviteByToken(token);
    if (!invite) {
      return NextResponse.json({ error: "Token not found" }, { status: 404 });
    }

    if (invite.status === "NOT_STARTED") {
      const [assessment, candidate] = await Promise.all([
        db.getAssessmentById(invite.assessmentId),
        db.getCandidateById(invite.candidateId),
      ]);

      return NextResponse.json({
        status: invite.status,
        assessmentTitle: assessment?.title ?? null,
        candidateName: candidate?.name ?? null,
        durationMinutes: assessment?.durationMinutes ?? null,
        totalQuestions: assessment?.numQuestions ?? 0,
      });
    }

    if (invite.status === "IN_PROGRESS") {
      const questionIds = invite.assignedQuestionIds ?? [];
      const [questions, answers] = await Promise.all([
        db.getQuestionsByIds(questionIds),
        db.getAnswersByAttemptId(invite.inviteId),
      ]);

      const now = Date.now();
      const endTime = invite.endTime ? new Date(invite.endTime).getTime() : now;
      const remainingTime = Math.max(0, Math.floor((endTime - now) / 1000));

      return NextResponse.json({
        status: invite.status,
        questions: questions.map((q) => ({
          questionId: q.questionId,
          questionText: q.questionText,
          isOptional: q.isOptional,
        })),
        answers: answers.map((a) => ({
          questionId: a.questionId,
          answerText: a.answerText,
        })),
        remainingTime,
      });
    }

    // COMPLETED
    const answers = await db.getAnswersByAttemptId(invite.inviteId);
    const totalQuestions = invite.assignedQuestionIds?.length ?? 0;

    return NextResponse.json({
      status: invite.status,
      totalQuestions,
      answeredCount: answers.length,
    });
  } catch (error) {
    console.error("Error fetching assessment by token:", error);
    return NextResponse.json(
      { error: "Failed to fetch assessment" },
      { status: 500 }
    );
  }
}
