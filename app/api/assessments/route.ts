import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db";
import { Assessment } from "@/lib/types";

export async function GET() {
  try {
    const assessments = await db.getAllAssessments();
    return NextResponse.json({ assessments });
  } catch (error) {
    console.error("Error fetching assessments:", error);
    return NextResponse.json({ error: "Failed to fetch assessments" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { title, questionSetId, numQuestions, durationMinutes } = await request.json();

    if (!title || typeof title !== "string") {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    if (!questionSetId || typeof questionSetId !== "string") {
      return NextResponse.json({ error: "questionSetId is required" }, { status: 400 });
    }

    const duration = typeof durationMinutes === "number" && durationMinutes > 0 ? durationMinutes : 20;
    const num = typeof numQuestions === "number" && numQuestions > 0 ? numQuestions : 20;

    const assessment: Assessment = {
      assessmentId: uuidv4(),
      title,
      questionSetId,
      numQuestions: num,
      durationMinutes: duration,
      createdAt: new Date().toISOString(),
    };

    await db.createAssessment(assessment);
    return NextResponse.json(assessment, { status: 201 });
  } catch (error) {
    console.error("Error creating assessment:", error);
    return NextResponse.json({ error: "Failed to create assessment" }, { status: 500 });
  }
}
