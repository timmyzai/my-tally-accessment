"use client";

import { useEffect, useState } from "react";

interface ScoreScreenProps {
  totalQuestions: number;
  answeredCount: number;
}

export default function ScoreScreen({
  totalQuestions,
  answeredCount,
}: ScoreScreenProps) {
  const [showContent, setShowContent] = useState(false);
  const skipped = totalQuestions - answeredCount;

  useEffect(() => {
    const t = setTimeout(() => setShowContent(true), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div
        className={`relative z-10 w-full max-w-md text-center transition-all duration-1000 ${
          showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Header badge */}
        <div className="mb-8">
          <div
            className="inline-flex items-center gap-2 rounded-full px-5 py-2 mb-6 backdrop-blur-xl"
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <div
              className="h-2 w-2 rounded-full animate-pulse"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #06b6d4)" }}
            />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
              Assessment Complete
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-100 mb-3">
            Assessment Submitted
          </h1>
          <p className="text-slate-400 text-base max-w-sm mx-auto">
            Your answers have been submitted for review.
          </p>
        </div>

        {/* Stat cards — glass card */}
        <div
          className="rounded-2xl p-6 backdrop-blur-xl"
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
          }}
        >
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p
                className="text-3xl font-bold"
                style={{
                  background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {totalQuestions}
              </p>
              <p className="mt-2 text-xs text-slate-500 uppercase tracking-widest font-semibold">
                Total Questions
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-100">
                {answeredCount}
              </p>
              <p className="mt-2 text-xs text-slate-500 uppercase tracking-widest font-semibold">
                Answered
              </p>
            </div>
          </div>
        </div>

        {/* Skipped note */}
        {skipped > 0 && (
          <p className="mt-4 text-sm text-slate-500">
            Skipped: {skipped}
          </p>
        )}

        {/* Footer note */}
        <p className="mt-8 text-sm text-slate-600">
          You may close this window.
        </p>
      </div>
    </div>
  );
}
