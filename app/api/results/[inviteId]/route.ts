import { NextResponse } from "next/server";
import { GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, Tables } from "@/lib/dynamodb";
import { Invite, Assessment, Answer } from "@/lib/types";
import { getQuestionsByIds, computeScore } from "@/lib/helpers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ inviteId: string }> }
) {
  try {
    const { inviteId } = await params;

    // Fetch the invite
    const inviteResult = await docClient.send(
      new GetCommand({
        TableName: Tables.Invites,
        Key: { inviteId },
      })
    );

    if (!inviteResult.Item) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    const invite = inviteResult.Item as Invite;

    // Fetch answers for this invite (attemptId = inviteId)
    const answersResult = await docClient.send(
      new QueryCommand({
        TableName: Tables.Answers,
        KeyConditionExpression: "attemptId = :attemptId",
        ExpressionAttributeValues: { ":attemptId": inviteId },
      })
    );

    const answers = (answersResult.Items ?? []) as Answer[];

    // Fetch the assessment
    const assessmentResult = await docClient.send(
      new GetCommand({
        TableName: Tables.Assessments,
        Key: { assessmentId: invite.assessmentId },
      })
    );

    if (!assessmentResult.Item) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    const assessment = assessmentResult.Item as Assessment;

    // Fetch all questions for this assessment
    const questions = await getQuestionsByIds(assessment.questionIds);

    // Compute score with breakdown
    const { score, totalQuestions, answeredCount, breakdown } = computeScore(
      assessment.questionIds,
      questions,
      answers
    );

    return NextResponse.json({
      invite,
      score,
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
