"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import AssessmentPlayer from "./components/AssessmentPlayer";
import ScoreScreen from "./components/ScoreScreen";
import Spinner from "./components/Spinner";
import type {
  QuestionData,
  AssessmentData,
  NotStartedData,
  InProgressData,
  CompletedData,
  CompletedResult,
} from "./types";

function AssessmentContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [data, setData] = useState<AssessmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  // For in-progress state after starting
  const [playerData, setPlayerData] = useState<{
    questions: QuestionData[];
    endTime: string;
    initialAnswers: Record<string, string>;
  } | null>(null);

  // For completed state after submission
  const [completedResult, setCompletedResult] = useState<CompletedResult | null>(null);

  useEffect(() => {
    if (!token) {
      setError("No assessment token provided.");
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        const res = await fetch(`/api/assessment/${token}`);
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error || "Failed to load assessment");
        }
        const json: AssessmentData = await res.json();
        setData(json);

        // If in progress, set up player data directly
        if (json.status === "IN_PROGRESS") {
          const ipData = json as InProgressData;
          const endTime = new Date(Date.now() + ipData.remainingTime * 1000).toISOString();
          const initialAnswers: Record<string, string> = {};
          for (const a of ipData.answers) {
            initialAnswers[a.questionId] = a.selectedAnswer;
          }
          setPlayerData({
            questions: ipData.questions,
            endTime,
            initialAnswers,
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [token]);

  const handleStart = useCallback(async () => {
    if (!token || starting) return;
    setStarting(true);

    try {
      const res = await fetch("/api/assessment/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Failed to start assessment");
      }

      const result = await res.json();
      setPlayerData({
        questions: result.questions,
        endTime: result.endTime,
        initialAnswers: {},
      });
      setData({ status: "IN_PROGRESS" } as InProgressData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start");
    } finally {
      setStarting(false);
    }
  }, [token, starting]);

  const handleComplete = useCallback(
    (result: CompletedResult) => {
      setCompletedResult(result);
    },
    []
  );

  // Loading state — skeleton shimmer
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" label="Loading assessment..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div
            className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{
              background: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              boxShadow: "0 0 24px rgba(239, 68, 68, 0.1)",
            }}
          >
            <svg className="h-7 w-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h2
            className="text-xl font-bold text-gray-100 mb-3"
            style={{ fontFamily: "var(--font-outfit), sans-serif" }}
          >
            Unable to Load
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">{error}</p>
        </div>
      </div>
    );
  }

  // Completed result (after submission)
  if (completedResult) {
    return (
      <ScoreScreen
        score={completedResult.score}
        totalQuestions={completedResult.totalQuestions}
        answeredCount={completedResult.answeredCount}
      />
    );
  }

  // In progress with player data
  if (data?.status === "IN_PROGRESS" && playerData && token) {
    return (
      <AssessmentPlayer
        token={token}
        questions={playerData.questions}
        endTime={playerData.endTime}
        initialAnswers={playerData.initialAnswers}
        onComplete={handleComplete}
      />
    );
  }

  // Completed from initial fetch
  if (data?.status === "COMPLETED") {
    const cd = data as CompletedData;
    return (
      <ScoreScreen
        score={cd.score}
        totalQuestions={cd.totalQuestions}
        answeredCount={cd.answeredCount}
      />
    );
  }

  // NOT_STARTED — Landing page
  if (data?.status === "NOT_STARTED") {
    const ns = data as NotStartedData;
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-lg text-center">
          {/* Logo with gradient and glow */}
          <div
            className="mx-auto mb-10 flex h-20 w-20 items-center justify-center rounded-3xl"
            style={{
              background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
              boxShadow: "0 8px 40px rgba(139, 92, 246, 0.35), 0 0 60px rgba(139, 92, 246, 0.15)",
            }}
          >
            <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
            </svg>
          </div>

          {/* Welcome text */}
          {ns.candidateName && (
            <p
              className="text-sm font-semibold mb-3 tracking-widest uppercase"
              style={{
                background: "linear-gradient(90deg, #8b5cf6, #06b6d4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Welcome, {ns.candidateName}
            </p>
          )}

          <h1
            className="text-4xl sm:text-5xl font-bold text-gray-100 mb-4"
            style={{ fontFamily: "var(--font-outfit), sans-serif" }}
          >
            {ns.assessmentTitle || "Assessment"}
          </h1>

          <p className="text-slate-400 mb-10 max-w-sm mx-auto leading-relaxed">
            Read the details below carefully before starting. The timer begins once you click Start.
          </p>

          {/* Info cards — glass-morphism */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div
              className="rounded-2xl p-6 backdrop-blur-xl"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Questions</span>
              </div>
              <p
                className="text-3xl font-bold text-gray-100"
                style={{ fontFamily: "var(--font-outfit), sans-serif" }}
              >
                {ns.totalQuestions}
              </p>
            </div>
            <div
              className="rounded-2xl p-6 backdrop-blur-xl"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Duration</span>
              </div>
              <p
                className="text-3xl font-bold text-gray-100"
                style={{ fontFamily: "var(--font-outfit), sans-serif" }}
              >
                {ns.durationMinutes ?? "\u2014"}<span className="text-base font-normal text-slate-500 ml-1">min</span>
              </p>
            </div>
          </div>

          {/* Instructions — glass card */}
          <div
            className="rounded-2xl p-6 mb-10 text-left backdrop-blur-xl"
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
            }}
          >
            <h3
              className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest"
              style={{ fontFamily: "var(--font-outfit), sans-serif" }}
            >
              Instructions
            </h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-3">
                <span
                  className="mt-1.5 h-1.5 w-1.5 rounded-full shrink-0"
                  style={{ background: "linear-gradient(135deg, #8b5cf6, #06b6d4)" }}
                />
                Each question has four options. Select the best answer.
              </li>
              <li className="flex items-start gap-3">
                <span
                  className="mt-1.5 h-1.5 w-1.5 rounded-full shrink-0"
                  style={{ background: "linear-gradient(135deg, #8b5cf6, #06b6d4)" }}
                />
                Your answers are saved automatically as you go.
              </li>
              <li className="flex items-start gap-3">
                <span
                  className="mt-1.5 h-1.5 w-1.5 rounded-full shrink-0"
                  style={{ background: "linear-gradient(135deg, #8b5cf6, #06b6d4)" }}
                />
                You can skip questions and return to them later.
              </li>
              <li className="flex items-start gap-3">
                <span
                  className="mt-1.5 h-1.5 w-1.5 rounded-full shrink-0"
                  style={{ background: "linear-gradient(135deg, #8b5cf6, #06b6d4)" }}
                />
                The assessment will auto-submit when the timer expires.
              </li>
            </ul>
          </div>

          {/* Start button — gradient with hover shimmer */}
          <button
            onClick={handleStart}
            disabled={starting}
            className="group relative inline-flex items-center justify-center gap-3 rounded-2xl px-10 py-4 text-base font-bold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
              boxShadow: "0 8px 32px rgba(139, 92, 246, 0.35)",
            }}
            onMouseEnter={(e) => {
              if (!starting) {
                e.currentTarget.style.boxShadow = "0 12px 48px rgba(139, 92, 246, 0.5)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 8px 32px rgba(139, 92, 246, 0.35)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {/* Shimmer overlay */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: "linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.15) 50%, transparent 60%)",
                animation: "shimmer 2s infinite",
              }}
            />
            {starting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-transparent border-t-white" />
                <span className="relative z-10">Starting...</span>
              </>
            ) : (
              <>
                <span className="relative z-10">Start Assessment</span>
                <svg className="relative z-10 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>

          {/* Shimmer keyframe */}
          <style>{`
            @keyframes shimmer {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return null;
}

export default function AssessmentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Spinner size="lg" label="Loading..." />
        </div>
      }
    >
      <AssessmentContent />
    </Suspense>
  );
}
