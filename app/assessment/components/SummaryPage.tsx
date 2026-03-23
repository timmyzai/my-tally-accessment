"use client";

import type { QuestionData } from "../types";

interface SummaryPageProps {
  questions: QuestionData[];
  answers: Record<string, string>;
  onNavigate: (index: number) => void;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export default function SummaryPage({
  questions,
  answers,
  onNavigate,
  onSubmit,
  onBack,
  isSubmitting,
}: SummaryPageProps) {
  const answeredCount = questions.filter(
    (q) => answers[q.questionId] && answers[q.questionId].trim().length > 0
  ).length;
  const skippedCount = questions.length - answeredCount;
  const requiredUnanswered = questions.filter(
    (q) => !q.isOptional && (!answers[q.questionId] || answers[q.questionId].trim().length === 0)
  );
  const canSubmit = requiredUnanswered.length === 0;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition-all duration-300 hover:text-gray-100 group mb-6"
        >
          <svg
            className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Questions
        </button>

        <h2
          className="text-2xl font-bold bg-gradient-to-r from-gray-100 to-slate-300 bg-clip-text text-transparent mb-2"
        >
          Assessment Summary
        </h2>
        <p className="text-sm text-slate-400">
          Review your answers before submitting. Click any question to go back and edit.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div
          className="rounded-2xl p-4 text-center backdrop-blur-xl"
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          <p
            className="text-2xl font-bold"
            style={{
              background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {answeredCount}
          </p>
          <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Answered</p>
        </div>
        <div
          className="rounded-2xl p-4 text-center backdrop-blur-xl"
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          <p className="text-2xl font-bold text-slate-400">{skippedCount}</p>
          <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Skipped</p>
        </div>
        <div
          className="rounded-2xl p-4 text-center backdrop-blur-xl"
          style={{
            background: requiredUnanswered.length > 0
              ? "rgba(245, 158, 11, 0.05)"
              : "rgba(16, 185, 129, 0.05)",
            border: requiredUnanswered.length > 0
              ? "1px solid rgba(245, 158, 11, 0.2)"
              : "1px solid rgba(16, 185, 129, 0.2)",
          }}
        >
          <p
            className={`text-2xl font-bold ${
              requiredUnanswered.length > 0 ? "text-amber-400" : "text-emerald-400"
            }`}
          >
            {requiredUnanswered.length}
          </p>
          <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Required Left</p>
        </div>
      </div>

      {/* Question list */}
      <div className="space-y-2 mb-8">
        {questions.map((q, index) => {
          const hasAnswer = answers[q.questionId] && answers[q.questionId].trim().length > 0;
          const isRequiredUnanswered = !q.isOptional && !hasAnswer;

          return (
            <button
              key={q.questionId}
              onClick={() => onNavigate(index)}
              className="w-full rounded-xl p-4 text-left backdrop-blur-xl transition-all duration-200 hover:bg-white/[0.04] group"
              style={{
                background: isRequiredUnanswered
                  ? "rgba(245, 158, 11, 0.04)"
                  : "rgba(255, 255, 255, 0.02)",
                border: isRequiredUnanswered
                  ? "1px solid rgba(245, 158, 11, 0.2)"
                  : "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <div className="flex items-start gap-3">
                <span className="text-xs text-slate-500 mt-1 shrink-0 w-6">{index + 1}.</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-200 line-clamp-2">{q.questionText}</p>
                  {hasAnswer && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                      {answers[q.questionId]}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {q.isOptional && (
                    <span className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-xs text-amber-400">
                      Optional
                    </span>
                  )}
                  {hasAnswer ? (
                    <div
                      className="flex h-6 w-6 items-center justify-center rounded-full"
                      style={{
                        background: "rgba(16, 185, 129, 0.12)",
                        border: "1px solid rgba(16, 185, 129, 0.25)",
                      }}
                    >
                      <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : (
                    <div
                      className="flex h-6 w-6 items-center justify-center rounded-full"
                      style={{
                        background: isRequiredUnanswered
                          ? "rgba(245, 158, 11, 0.12)"
                          : "rgba(255, 255, 255, 0.05)",
                        border: isRequiredUnanswered
                          ? "1px solid rgba(245, 158, 11, 0.25)"
                          : "1px solid rgba(255, 255, 255, 0.08)",
                      }}
                    >
                      <span
                        className={`text-xs ${
                          isRequiredUnanswered ? "text-amber-400" : "text-slate-500"
                        }`}
                      >
                        —
                      </span>
                    </div>
                  )}
                  <svg
                    className="h-4 w-4 text-slate-600 group-hover:text-slate-400 transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Submit section */}
      {!canSubmit && (
        <div
          className="rounded-xl px-4 py-3 mb-4 text-sm text-amber-400 flex items-center gap-2"
          style={{
            background: "rgba(245, 158, 11, 0.06)",
            border: "1px solid rgba(245, 158, 11, 0.15)",
          }}
        >
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          {requiredUnanswered.length} required question{requiredUnanswered.length !== 1 ? "s" : ""} still need{requiredUnanswered.length === 1 ? "s" : ""} an answer before you can submit.
        </div>
      )}

      <button
        onClick={onSubmit}
        disabled={!canSubmit || isSubmitting}
        className="w-full rounded-xl py-4 text-sm font-bold text-white transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: canSubmit
            ? "linear-gradient(135deg, #8b5cf6, #06b6d4)"
            : "rgba(255, 255, 255, 0.06)",
          boxShadow: canSubmit ? "0 4px 20px rgba(139, 92, 246, 0.3)" : "none",
        }}
      >
        {isSubmitting ? "Submitting..." : "Submit Assessment"}
      </button>
    </div>
  );
}
