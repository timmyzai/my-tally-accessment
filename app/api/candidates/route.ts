import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db";
import { Candidate } from "@/lib/types";

export async function GET() {
  try {
    const candidates = await db.getAllCandidates();
    return NextResponse.json({ candidates });
  } catch (error) {
    console.error("Error fetching candidates:", error);
    return NextResponse.json({ error: "Failed to fetch candidates" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, email } = await request.json();

    if (!name || typeof name !== "string" || !email || typeof email !== "string") {
      return NextResponse.json(
        { error: "name and email are required and must be non-empty strings" },
        { status: 400 }
      );
    }

    const candidate: Candidate = {
      candidateId: uuidv4(),
      name,
      email,
    };

    await db.createCandidate(candidate);
    return NextResponse.json(candidate, { status: 201 });
  } catch (error) {
    console.error("Error creating candidate:", error);
    return NextResponse.json({ error: "Failed to create candidate" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { candidateId, name, email } = await request.json();

    if (!candidateId || !name || !email) {
      return NextResponse.json(
        { error: "candidateId, name, and email are required" },
        { status: 400 }
      );
    }

    await db.updateCandidate(candidateId, { name, email });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating candidate:", error);
    return NextResponse.json({ error: "Failed to update candidate" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { candidateId } = await request.json();

    if (!candidateId) {
      return NextResponse.json(
        { error: "candidateId is required" },
        { status: 400 }
      );
    }

    await db.deleteCandidate(candidateId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting candidate:", error);
    return NextResponse.json({ error: "Failed to delete candidate" }, { status: 500 });
  }
}
