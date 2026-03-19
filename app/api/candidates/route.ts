import { NextResponse } from "next/server";
import { ScanCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { docClient, Tables } from "@/lib/dynamodb";
import { Candidate } from "@/lib/types";

export async function GET() {
  try {
    const result = await docClient.send(
      new ScanCommand({ TableName: Tables.Candidates })
    );
    const candidates = (result.Items ?? []) as Candidate[];
    return NextResponse.json({ candidates });
  } catch (error) {
    console.error("Error fetching candidates:", error);
    return NextResponse.json({ error: "Failed to fetch candidates" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, email } = await request.json();

    if (
      !name ||
      typeof name !== "string" ||
      !email ||
      typeof email !== "string"
    ) {
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

    await docClient.send(
      new PutCommand({
        TableName: Tables.Candidates,
        Item: candidate,
      })
    );

    return NextResponse.json(candidate, { status: 201 });
  } catch (error) {
    console.error("Error creating candidate:", error);
    return NextResponse.json({ error: "Failed to create candidate" }, { status: 500 });
  }
}
