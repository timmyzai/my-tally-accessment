import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db";
import { Invite } from "@/lib/types";

export async function GET() {
  try {
    const invites = await db.getAllInvites();

    if (invites.length === 0) {
      return NextResponse.json({ invites: [] });
    }

    const assessmentIds = [...new Set(invites.map((i) => i.assessmentId))];
    const candidateIds = [...new Set(invites.map((i) => i.candidateId))];

    const [assessments, candidates] = await Promise.all([
      db.getAssessmentsByIds(assessmentIds),
      db.getCandidatesByIds(candidateIds),
    ]);

    const assessmentMap = new Map(assessments.map((a) => [a.assessmentId, a]));
    const candidateMap = new Map(candidates.map((c) => [c.candidateId, c]));

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

    await db.createInvite(invite);
    const link = `${process.env.NEXT_PUBLIC_BASE_URL}/assessment?token=${token}`;

    return NextResponse.json({ ...invite, link }, { status: 201 });
  } catch (error) {
    console.error("Error creating invite:", error);
    return NextResponse.json({ error: "Failed to create invite" }, { status: 500 });
  }
}
