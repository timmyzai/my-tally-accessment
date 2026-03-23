import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getClientQuestions, computeScore } from "@/lib/helpers";

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
        totalQuestions: assessment?.questionIds.length ?? 0,
      });
    }

    if (invite.status === "IN_PROGRESS") {
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

      const clientQuestions = getClientQuestions(questions);
      const now = Date.now();
      const endTime = invite.endTime ? new Date(invite.endTime).getTime() : now;
      const remainingTime = Math.max(0, Math.floor((endTime - now) / 1000));

      return NextResponse.json({
        status: invite.status,
        questions: clientQuestions,
        answers: answers.map((a) => ({
          questionId: a.questionId,
          selectedAnswer: a.selectedAnswer,
        })),
        remainingTime,
      });
    }

    // COMPLETED
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
      status: invite.status,
      score,
      totalQuestions,
      answeredCount,
    });
  } catch (error) {
    console.error("Error fetching assessment by token:", error);
    return NextResponse.json(
      { error: "Failed to fetch assessment" },
      { status: 500 }
    );
  }
}
