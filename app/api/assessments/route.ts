import { NextResponse } from "next/server";
import { ScanCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { docClient, Tables } from "@/lib/dynamodb";
import { Assessment } from "@/lib/types";

export async function GET() {
  try {
    const result = await docClient.send(
      new ScanCommand({ TableName: Tables.Assessments })
    );
    const assessments = (result.Items ?? []) as Assessment[];
    return NextResponse.json({ assessments });
  } catch (error) {
    console.error("Error fetching assessments:", error);
    return NextResponse.json({ error: "Failed to fetch assessments" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { title, questionIds, durationMinutes } = await request.json();

    if (
      !title ||
      typeof title !== "string" ||
      !Array.isArray(questionIds) ||
      questionIds.length === 0 ||
      typeof durationMinutes !== "number" ||
      durationMinutes <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "title (non-empty string), questionIds (non-empty array), and durationMinutes (> 0) are required",
        },
        { status: 400 }
      );
    }

    const assessment: Assessment = {
      assessmentId: uuidv4(),
      title,
      questionIds,
      durationMinutes,
      createdAt: new Date().toISOString(),
    };

    await docClient.send(
      new PutCommand({
        TableName: Tables.Assessments,
        Item: assessment,
      })
    );

    return NextResponse.json(assessment, { status: 201 });
  } catch (error) {
    console.error("Error creating assessment:", error);
    return NextResponse.json({ error: "Failed to create assessment" }, { status: 500 });
  }
}
