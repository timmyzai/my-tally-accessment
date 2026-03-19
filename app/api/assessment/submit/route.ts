import { NextResponse } from "next/server";
import { GetCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, Tables } from "@/lib/dynamodb";
import { Assessment, Answer } from "@/lib/types";
import {
  getInviteByToken,
  getQuestionsByIds,
  computeScore,
} from "@/lib/helpers";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const invite = await getInviteByToken(token);
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

    // Update invite status to COMPLETED
    await docClient.send(
      new UpdateCommand({
        TableName: Tables.Invites,
        Key: { inviteId: invite.inviteId },
        UpdateExpression: "SET #status = :status",
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: { ":status": "COMPLETED" },
      })
    );

    // Fetch assessment
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

    // Fetch all answers and questions in parallel
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
