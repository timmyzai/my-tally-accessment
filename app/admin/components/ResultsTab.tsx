"use client";

import React, { useEffect, useState } from "react";
import Spinner from "./Spinner";
import GlassCard from "./GlassCard";

interface EnrichedInvite {
  inviteId: string;
  assessmentId: string;
  candidateId: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  assessmentTitle: string | null;
  candidateName: string | null;
  createdAt: string;
}

interface BreakdownItem {
  questionId: string;
  questionText: string;
  isOptional: boolean;
  answerText: string | null;
}

interface ResultDetail {
  totalQuestions: number;
  answeredCount: number;
  breakdown: BreakdownItem[];
}

export default function ResultsTab() {
  const [invites, setInvites] = useState<EnrichedInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Detail view
  const [selectedInvite, setSelectedInvite] = useState<EnrichedInvite | null>(null);
  const [detail, setDetail] = useState<ResultDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  async function fetchInvites() {
    try {
      const res = await fetch("/api/invite");
      const data = await res.json();
      const all: EnrichedInvite[] = data.invites ?? [];
      setInvites(all.filter((inv) => inv.status === "COMPLETED"));
    } catch {
      setError("Failed to load results");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInvites();
  }, []);

  async function viewDetails(invite: EnrichedInvite) {
    setSelectedInvite(invite);
    setDetailLoading(true);
    setDetail(null);

    try {
      const res = await fetch(`/api/results/${invite.inviteId}`);
      if (!res.ok) throw new Error("Failed to load results");
      const data: ResultDetail = await res.json();
      setDetail(data);
    } catch {
      setError("Failed to load result details");
    } finally {
      setDetailLoading(false);
    }
  }

  function goBack() {
    setSelectedInvite(null);
    setDetail(null);
  }

  if (loading) {
    return <Spinner label="Loading results..." />;
  }

  // Detail View
  if (selectedInvite) {
    return (
      <div>
        <button
          onClick={goBack}
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition-all duration-300 hover:text-gray-100 group"
        >
          <svg className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Results
        </button>

        <div className="mb-6">
          <h2
            className="text-xl font-bold bg-gradient-to-r from-gray-100 to-slate-300 bg-clip-text text-transparent"
          >
            {selectedInvite.candidateName ?? "Unknown"} — {selectedInvite.assessmentTitle ?? "Assessment"}
          </h2>
        </div>

        {detailLoading ? (
          <Spinner label="Loading details..." />
        ) : detail ? (
          <>
            {/* Summary cards */}
            <div className="mb-8 grid grid-cols-2 gap-4">
              {[
                {
                  label: "Total Questions",
                  value: detail.totalQuestions,
                },
                {
                  label: "Answered",
                  value: detail.answeredCount,
                  suffix: `/${detail.totalQuestions}`,
                },
              ].map((stat) => (
                <GlassCard key={stat.label} className="text-center">
                  <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">
                    {stat.label}
                  </p>
                  <p
                    className="text-3xl font-bold bg-gradient-to-r from-gray-100 to-slate-300 bg-clip-text text-transparent"
                  >
                    {stat.value}
                    {stat.suffix && (
                      <span className="text-lg text-slate-500">{stat.suffix}</span>
                    )}
                  </p>
                </GlassCard>
              ))}
            </div>

            {/* Question breakdown */}
            <div className="space-y-3">
              {detail.breakdown.map((item, index) => (
                <div
                  key={item.questionId}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-5 transition-all duration-200"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs text-slate-500">Question {index + 1}</p>
                      {item.isOptional && (
                        <span className="inline-flex items-center rounded-full bg-white/[0.06] border border-white/[0.08] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-400">
                          Optional
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-200 mb-3">{item.questionText}</p>
                    <div className="text-sm">
                      {item.answerText ? (
                        <p className="text-slate-300 whitespace-pre-wrap">{item.answerText}</p>
                      ) : (
                        <p className="italic text-slate-500">Not answered</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/[0.07] backdrop-blur-sm px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )
        )}
      </div>
    );
  }

  // List View
  return (
    <div>
      <div className="mb-6">
        <h2
          className="text-xl font-bold bg-gradient-to-r from-gray-100 to-slate-300 bg-clip-text text-transparent"
        >
          Results
          <span className="ml-2 text-sm font-normal text-slate-500">({invites.length})</span>
        </h2>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/[0.07] backdrop-blur-sm px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <GlassCard noPadding className="overflow-hidden">
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
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {invites.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-sm text-slate-500">
                  No completed assessments yet.
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
                    <button
                      onClick={() => viewDetails(inv)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-500/10 to-cyan-500/10 border border-violet-500/20 px-3 py-1.5 text-xs font-medium text-violet-300 transition-all duration-300 hover:from-violet-500/20 hover:to-cyan-500/20 hover:text-violet-200 group"
                    >
                      View Details
                      <svg className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
}
