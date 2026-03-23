"use client";

import React, { useEffect, useState } from "react";
import type { Assessment, Candidate } from "@/lib/types";
import Spinner from "./Spinner";
import GlassCard from "./GlassCard";
import GradientButton from "./GradientButton";
import StatusBadge from "./StatusBadge";

interface EnrichedInvite {
  inviteId: string;
  assessmentId: string;
  candidateId: string;
  token: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  assessmentTitle: string | null;
  candidateName: string | null;
  candidateEmail: string | null;
  link: string;
  createdAt: string;
}

export default function InvitesTab() {
  const [invites, setInvites] = useState<EnrichedInvite[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [selectedAssessmentId, setSelectedAssessmentId] = useState("");
  const [selectedCandidateId, setSelectedCandidateId] = useState("");

  async function fetchData() {
    try {
      const [iRes, aRes, cRes] = await Promise.all([
        fetch("/api/invite"),
        fetch("/api/assessments"),
        fetch("/api/candidates"),
      ]);
      const iData = await iRes.json();
      const aData = await aRes.json();
      const cData = await cRes.json();
      setInvites(iData.invites ?? []);
      setAssessments(aData.assessments ?? []);
      setCandidates(cData.candidates ?? []);
    } catch {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  function resetForm() {
    setSelectedAssessmentId("");
    setSelectedCandidateId("");
    setShowForm(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedAssessmentId || !selectedCandidateId) {
      setError("Please select both an assessment and a candidate");
      return;
    }
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentId: selectedAssessmentId,
          candidateId: selectedCandidateId,
        }),
      });

      if (!res.ok) throw new Error("Failed to create invite");

      resetForm();
      await fetchData();
    } catch {
      setError("Failed to create invite");
    } finally {
      setSaving(false);
    }
  }

  async function copyLink(link: string, inviteId: string) {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(inviteId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback not needed for modern browsers
    }
  }

  if (loading) {
    return <Spinner label="Loading invites..." />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2
          className="text-xl font-bold bg-gradient-to-r from-gray-100 to-slate-300 bg-clip-text text-transparent"
        >
          Invites
          <span className="ml-2 text-sm font-normal text-slate-500">({invites.length})</span>
        </h2>
        <GradientButton onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Create Invite"}
        </GradientButton>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/[0.07] backdrop-blur-sm px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {showForm && (
        <GlassCard className="mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300/90 mb-1.5 tracking-wide">
                  Assessment
                </label>
                <select
                  value={selectedAssessmentId}
                  onChange={(e) => setSelectedAssessmentId(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-gray-100 outline-none transition-all duration-300 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10 focus:bg-white/[0.05] backdrop-blur-sm"
                >
                  <option value="">Select assessment...</option>
                  {assessments.map((a) => (
                    <option key={a.assessmentId} value={a.assessmentId}>
                      {a.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300/90 mb-1.5 tracking-wide">
                  Candidate
                </label>
                <select
                  value={selectedCandidateId}
                  onChange={(e) => setSelectedCandidateId(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-gray-100 outline-none transition-all duration-300 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10 focus:bg-white/[0.05] backdrop-blur-sm"
                >
                  <option value="">Select candidate...</option>
                  {candidates.map((c) => (
                    <option key={c.candidateId} value={c.candidateId}>
                      {c.name} ({c.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <GradientButton type="submit" disabled={saving}>
              {saving ? "Creating..." : "Create Invite"}
            </GradientButton>
          </form>
        </GlassCard>
      )}

      <GlassCard noPadding className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                  Candidate
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                  Assessment
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                  Status
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                  Link
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {invites.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">
                    No invites yet. Create one to get started.
                  </td>
                </tr>
              ) : (
                invites.map((inv) => (
                  <tr
                    key={inv.inviteId}
                    className="border-b border-white/[0.03] transition-colors duration-200 hover:bg-white/[0.02]"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-200">
                      {inv.candidateName ?? "Unknown"}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {inv.assessmentTitle ?? "Unknown"}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => copyLink(inv.link, inv.inviteId)}
                        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all duration-300 backdrop-blur-sm ${
                          copiedId === inv.inviteId
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                            : "border-white/[0.06] bg-white/[0.03] text-slate-300 hover:bg-white/[0.06] hover:text-gray-100"
                        }`}
                      >
                        {copiedId === inv.inviteId ? (
                          <>
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            Copied!
                          </>
                        ) : (
                          <>
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copy
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
