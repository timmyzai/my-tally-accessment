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
  selectedAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
}

interface ResultDetail {
  score: number;
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
            style={{ fontFamily: "var(--font-outfit), sans-serif" }}
          >
            {selectedInvite.candidateName ?? "Unknown"} — {selectedInvite.assessmentTitle ?? "Assessment"}
          </h2>
        </div>

        {detailLoading ? (
          <Spinner label="Loading details..." />
        ) : detail ? (
          <>
            {/* Score summary */}
            <div className="mb-8 grid grid-cols-3 gap-4">
              {[
                {
                  label: "Score",
                  value: detail.score,
                  suffix: `/${detail.totalQuestions}`,
                },
                {
                  label: "Percentage",
                  value:
                    detail.totalQuestions > 0
                      ? Math.round((detail.score / detail.totalQuestions) * 100)
                      : 0,
                  suffix: "%",
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
                    style={{ fontFamily: "var(--font-outfit), sans-serif" }}
                  >
                    {stat.value}
                    <span className="text-lg text-slate-500">{stat.suffix}</span>
                  </p>
                </GlassCard>
              ))}
            </div>

            {/* Question breakdown */}
            <div className="space-y-3">
              {detail.breakdown.map((item, index) => (
                <div
                  key={item.questionId}
                  className={`rounded-2xl border backdrop-blur-xl p-5 transition-all duration-200 ${
                    item.isCorrect
                      ? "border-emerald-500/20 bg-emerald-500/[0.03] shadow-[0_0_20px_rgba(16,185,129,0.03)]"
                      : "border-red-500/20 bg-red-500/[0.03] shadow-[0_0_20px_rgba(239,68,68,0.03)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 mb-1">Question {index + 1}</p>
                      <p className="text-sm font-medium text-gray-200 mb-3">{item.questionText}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <span className="text-slate-400">
                          Selected:{" "}
                          <span
                            className={`font-medium ${
                              item.isCorrect ? "text-emerald-400" : "text-red-400"
                            }`}
                          >
                            {item.selectedAnswer ?? "No answer"}
                          </span>
                        </span>
                        <span className="text-slate-400">
                          Correct:{" "}
                          <span className="text-emerald-400 font-medium">
                            {item.correctAnswer}
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {item.isCorrect ? (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
                          <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
                          <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
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
          style={{ fontFamily: "var(--font-outfit), sans-serif" }}
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
