import { NextResponse } from "next/server";
import {
  ScanCommand,
  PutCommand,
  BatchGetCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { docClient, Tables } from "@/lib/dynamodb";
import { Invite, Assessment, Candidate } from "@/lib/types";

export async function GET() {
  try {
    const result = await docClient.send(
      new ScanCommand({ TableName: Tables.Invites })
    );
    const invites = (result.Items ?? []) as Invite[];

    if (invites.length === 0) {
      return NextResponse.json({ invites: [] });
    }

    // Collect unique assessmentIds and candidateIds
    const assessmentIds = [...new Set(invites.map((i) => i.assessmentId))];
    const candidateIds = [...new Set(invites.map((i) => i.candidateId))];

    // Batch fetch assessments
    const assessmentKeys = assessmentIds.map((id) => ({ assessmentId: id }));
    const candidateKeys = candidateIds.map((id) => ({ candidateId: id }));

    const [assessmentResult, candidateResult] = await Promise.all([
      assessmentKeys.length > 0
        ? docClient.send(
            new BatchGetCommand({
              RequestItems: {
                [Tables.Assessments]: { Keys: assessmentKeys },
              },
            })
          )
        : null,
      candidateKeys.length > 0
        ? docClient.send(
            new BatchGetCommand({
              RequestItems: {
                [Tables.Candidates]: { Keys: candidateKeys },
              },
            })
          )
        : null,
    ]);

    const assessmentMap = new Map<string, Assessment>();
    if (assessmentResult?.Responses?.[Tables.Assessments]) {
      for (const item of assessmentResult.Responses[Tables.Assessments]) {
        const a = item as Assessment;
        assessmentMap.set(a.assessmentId, a);
      }
    }

    const candidateMap = new Map<string, Candidate>();
    if (candidateResult?.Responses?.[Tables.Candidates]) {
      for (const item of candidateResult.Responses[Tables.Candidates]) {
        const c = item as Candidate;
        candidateMap.set(c.candidateId, c);
      }
    }

    const enrichedInvites = invites.map((invite) => {
      const assessment = assessmentMap.get(invite.assessmentId);
      const candidate = candidateMap.get(invite.candidateId);
      const link = `${process.env.NEXT_PUBLIC_BASE_URL}/assessment?token=${invite.token}`;
      return {
        ...invite,
        assessmentTitle: assessment?.title ?? null,
        candidateName: candidate?.name ?? null,
        candidateEmail: candidate?.email ?? null,
        link,
      };
    });

    return NextResponse.json({ invites: enrichedInvites });
  } catch (error) {
    console.error("Error fetching invites:", error);
    return NextResponse.json({ error: "Failed to fetch invites" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { assessmentId, candidateId } = await request.json();

    if (
      !assessmentId ||
      typeof assessmentId !== "string" ||
      !candidateId ||
      typeof candidateId !== "string"
    ) {
      return NextResponse.json(
        {
          error:
            "assessmentId and candidateId are required and must be non-empty strings",
        },
        { status: 400 }
      );
    }

    const token = uuidv4();
    const invite: Invite = {
      inviteId: uuidv4(),
      assessmentId,
      candidateId,
      token,
      status: "NOT_STARTED",
      createdAt: new Date().toISOString(),
    };

    await docClient.send(
      new PutCommand({
        TableName: Tables.Invites,
        Item: invite,
      })
    );

    const link = `${process.env.NEXT_PUBLIC_BASE_URL}/assessment?token=${token}`;

    return NextResponse.json({ ...invite, link }, { status: 201 });
  } catch (error) {
    console.error("Error creating invite:", error);
    return NextResponse.json({ error: "Failed to create invite" }, { status: 500 });
  }
}
