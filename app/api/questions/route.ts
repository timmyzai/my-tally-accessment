import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db";
import { Question } from "@/lib/types";

export async function GET() {
  try {
    const questions = await db.getAllQuestions();
    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { questionText, isOptional, questionSetId } = await request.json();

    if (!questionText || typeof questionText !== "string") {
      return NextResponse.json(
        { error: "questionText is required" },
        { status: 400 }
      );
    }

    if (!questionSetId || typeof questionSetId !== "string") {
      return NextResponse.json(
        { error: "questionSetId is required" },
        { status: 400 }
      );
    }

    const question: Question = {
      questionId: uuidv4(),
      questionText,
      isOptional: !!isOptional,
      questionSetId,
      createdAt: new Date().toISOString(),
    };

    await db.createQuestion(question);
    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 });
  }
}
