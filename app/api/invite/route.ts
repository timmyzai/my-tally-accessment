import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db";
import { Invite } from "@/lib/types";

export async function GET(request: Request) {
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

    const host = request.headers.get("host") ?? "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    const enrichedInvites = invites.map((invite) => {
      const assessment = assessmentMap.get(invite.assessmentId);
      const candidate = candidateMap.get(invite.candidateId);
      const link = `${baseUrl}/assessment?token=${invite.token}`;
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

export async function DELETE(request: Request) {
  try {
    const { inviteId } = await request.json();

    if (!inviteId || typeof inviteId !== "string") {
      return NextResponse.json({ error: "inviteId is required" }, { status: 400 });
    }

    const invite = await db.getInviteById(inviteId);
    if (!invite) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    if (invite.status === "IN_PROGRESS") {
      return NextResponse.json(
        { error: "Cannot revoke an in-progress assessment" },
        { status: 409 }
      );
    }

    if (invite.status === "REVOKED") {
      return NextResponse.json(
        { error: "Invite is already revoked" },
        { status: 409 }
      );
    }

    await db.updateInviteStatus(inviteId, "REVOKED");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error revoking invite:", error);
    return NextResponse.json({ error: "Failed to revoke invite" }, { status: 500 });
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

    // Check for existing active invite (NOT_STARTED or IN_PROGRESS)
    const allInvites = await db.getAllInvites();
    const activeInvite = allInvites.find(
      (i) =>
        i.candidateId === candidateId &&
        i.assessmentId === assessmentId &&
        (i.status === "NOT_STARTED" || i.status === "IN_PROGRESS")
    );
    if (activeInvite) {
      return NextResponse.json(
        {
          error: `This candidate already has an active invite (${
            activeInvite.status === "NOT_STARTED" ? "Not Started" : "In Progress"
          }) for this assessment.`,
        },
        { status: 409 }
      );
    }

    const host = request.headers.get("host") ?? "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

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
    const link = `${baseUrl}/assessment?token=${token}`;

    return NextResponse.json({ ...invite, link }, { status: 201 });
  } catch (error) {
    console.error("Error creating invite:", error);
    return NextResponse.json({ error: "Failed to create invite" }, { status: 500 });
  }
}
