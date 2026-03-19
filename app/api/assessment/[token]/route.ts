import { NextResponse } from "next/server";
import { GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, Tables } from "@/lib/dynamodb";
import { Assessment, Candidate, Answer } from "@/lib/types";
import {
  getInviteByToken,
  getQuestionsByIds,
  getClientQuestions,
  computeScore,
} from "@/lib/helpers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const invite = await getInviteByToken(token);
    if (!invite) {
      return NextResponse.json({ error: "Token not found" }, { status: 404 });
    }

    if (invite.status === "NOT_STARTED") {
      // Fetch assessment and candidate for metadata
      const [assessmentResult, candidateResult] = await Promise.all([
        docClient.send(
          new GetCommand({
            TableName: Tables.Assessments,
            Key: { assessmentId: invite.assessmentId },
          })
        ),
        docClient.send(
          new GetCommand({
            TableName: Tables.Candidates,
            Key: { candidateId: invite.candidateId },
          })
        ),
      ]);

      const assessment = assessmentResult.Item as Assessment | undefined;
      const candidate = candidateResult.Item as Candidate | undefined;

      return NextResponse.json({
        status: invite.status,
        assessmentTitle: assessment?.title ?? null,
        candidateName: candidate?.name ?? null,
        durationMinutes: assessment?.durationMinutes ?? null,
        totalQuestions: assessment?.questionIds.length ?? 0,
      });
    }

    if (invite.status === "IN_PROGRESS") {
      // Fetch assessment to get questionIds
      const assessmentResult = await docClient.send(
        new GetCommand({
          TableName: Tables.Assessments,
          Key: { assessmentId: invite.assessmentId },
        })
      );
      const assessment = assessmentResult.Item as Assessment | undefined;
      if (!assessment) {
        return NextResponse.json(
          { error: "Assessment not found" },
          { status: 404 }
        );
      }

      // Fetch questions (without correctAnswer) and answers in parallel
      const [questions, answersResult] = await Promise.all([
        getQuestionsByIds(assessment.questionIds),
        docClient.send(
          new QueryCommand({
            TableName: Tables.Answers,
            KeyConditionExpression: "attemptId = :attemptId",
            ExpressionAttributeValues: { ":attemptId": invite.inviteId },
          })
        ),
      ]);

      const clientQuestions = getClientQuestions(questions);
      const answers = (answersResult.Items ?? []) as Answer[];

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
    const assessmentResult = await docClient.send(
      new GetCommand({
        TableName: Tables.Assessments,
        Key: { assessmentId: invite.assessmentId },
      })
    );
    const assessment = assessmentResult.Item as Assessment | undefined;
    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    const [questions, answersResult] = await Promise.all([
      getQuestionsByIds(assessment.questionIds),
      docClient.send(
        new QueryCommand({
          TableName: Tables.Answers,
          KeyConditionExpression: "attemptId = :attemptId",
          ExpressionAttributeValues: { ":attemptId": invite.inviteId },
        })
      ),
    ]);

    const answers = (answersResult.Items ?? []) as Answer[];
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
