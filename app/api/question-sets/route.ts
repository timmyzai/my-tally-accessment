import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db";
import { QuestionSet } from "@/lib/types";

export async function GET() {
  try {
    const questionSets = await db.getAllQuestionSets();
    return NextResponse.json({ questionSets });
  } catch (error) {
    console.error("Error fetching question sets:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Failed to fetch question sets", detail: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const questionSet: QuestionSet = {
      questionSetId: uuidv4(),
      name,
      createdAt: new Date().toISOString(),
    };

    await db.createQuestionSet(questionSet);
    return NextResponse.json(questionSet, { status: 201 });
  } catch (error) {
    console.error("Error creating question set:", error);
    return NextResponse.json({ error: "Failed to create question set" }, { status: 500 });
  }
}
