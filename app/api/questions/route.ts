import { NextResponse } from "next/server";
import { ScanCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { docClient, Tables } from "@/lib/dynamodb";
import { Question } from "@/lib/types";

export async function GET() {
  try {
    const result = await docClient.send(
      new ScanCommand({ TableName: Tables.Questions })
    );
    const questions = (result.Items ?? []) as Question[];
    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
  }
}

const VALID_ANSWERS = new Set(["A", "B", "C", "D"]);

export async function POST(request: Request) {
  try {
    const { questionText, optionA, optionB, optionC, optionD, correctAnswer } =
      await request.json();

    if (
      !questionText ||
      !optionA ||
      !optionB ||
      !optionC ||
      !optionD ||
      !correctAnswer
    ) {
      return NextResponse.json(
        {
          error:
            "questionText, optionA, optionB, optionC, optionD, and correctAnswer are required",
        },
        { status: 400 }
      );
    }

    if (!VALID_ANSWERS.has(correctAnswer)) {
      return NextResponse.json(
        { error: "correctAnswer must be one of A, B, C, D" },
        { status: 400 }
      );
    }

    const question: Question = {
      questionId: uuidv4(),
      questionText,
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer,
      createdAt: new Date().toISOString(),
    };

    await docClient.send(
      new PutCommand({
        TableName: Tables.Questions,
        Item: question,
      })
    );

    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 });
  }
}
