import { NextResponse } from "next/server";
import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, Tables } from "@/lib/dynamodb";
import { Assessment } from "@/lib/types";
import {
  getInviteByToken,
  getQuestionsByIds,
  getClientQuestions,
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
        { status: 410 }
      );
    }

    // Fetch the assessment
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

    // If IN_PROGRESS, return existing data for idempotent resume
    if (invite.status === "IN_PROGRESS") {
      const questions = await getQuestionsByIds(assessment.questionIds);
      const clientQuestions = getClientQuestions(questions);

      return NextResponse.json({
        inviteId: invite.inviteId,
        questions: clientQuestions,
        endTime: invite.endTime,
        totalQuestions: assessment.questionIds.length,
      });
    }

    // NOT_STARTED: start the assessment with race condition protection
    const now = new Date();
    const endTime = new Date(
      now.getTime() + assessment.durationMinutes * 60 * 1000
    );

    try {
      await docClient.send(
        new UpdateCommand({
          TableName: Tables.Invites,
          Key: { inviteId: invite.inviteId },
          UpdateExpression:
            "SET #status = :status, startTime = :startTime, endTime = :endTime",
          ConditionExpression: "#status = :notStarted",
          ExpressionAttributeNames: { "#status": "status" },
          ExpressionAttributeValues: {
            ":status": "IN_PROGRESS",
            ":notStarted": "NOT_STARTED",
            ":startTime": now.toISOString(),
            ":endTime": endTime.toISOString(),
          },
        })
      );
    } catch (err: unknown) {
      if (
        err instanceof Error &&
        err.name === "ConditionalCheckFailedException"
      ) {
        return NextResponse.json(
          { error: "Assessment has already been started" },
          { status: 409 }
        );
      }
      throw err;
    }

    // Fetch questions (without correctAnswer)
    const questions = await getQuestionsByIds(assessment.questionIds);
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
