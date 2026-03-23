"use client";

import { useState, useCallback, useRef } from "react";
import Timer from "./Timer";
import QuestionCard from "./QuestionCard";
import QuestionNav from "./QuestionNav";
import type { QuestionData, CompletedResult } from "../types";

interface AssessmentPlayerProps {
  token: string;
  questions: QuestionData[];
  endTime: string;
  initialAnswers: Record<string, string>;
  onComplete: (result: CompletedResult) => void;
}

export default function AssessmentPlayer({
  token,
  questions,
  endTime,
  initialAnswers,
  onComplete,
}: AssessmentPlayerProps) {
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const submittedRef = useRef(false);

  const currentQuestion = questions[currentIndex];

  const handleAnswer = useCallback(
    async (answer: string) => {
      const questionId = questions[currentIndex].questionId;

      // Optimistic update
      setAnswers((prev) => ({ ...prev, [questionId]: answer }));

      // Save to server (fire-and-forget with error handling)
      try {
        await fetch("/api/answers", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, questionId, selectedAnswer: answer }),
        });
      } catch {
        // Answer is saved optimistically; if the request fails the user can retry
      }
    },
    [token, questions, currentIndex]
  );

  const handleSubmit = useCallback(async () => {
    if (submittedRef.current || isSubmitting) return;
    submittedRef.current = true;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/assessment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (res.ok) {
        onComplete(data);
      } else {
        // If already completed, treat as success for the UX
        if (res.status === 409) {
          onComplete(data);
        }
        submittedRef.current = false;
        setIsSubmitting(false);
      }
    } catch {
      submittedRef.current = false;
      setIsSubmitting(false);
    }
  }, [token, isSubmitting, onComplete]);

  const handleTimeUp = useCallback(() => {
    handleSubmit();
  }, [handleSubmit]);

  const goNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;

  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Top bar — glass header */}
      <header
        className="sticky top-0 z-20 backdrop-blur-xl"
        style={{
          background: "rgba(6, 6, 10, 0.8)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
        }}
      >
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div
              className="h-9 w-9 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
                boxShadow: "0 4px 16px rgba(139, 92, 246, 0.25)",
              }}
            >
              <svg className="h-4.5 w-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span
              className="text-sm font-semibold text-slate-300 hidden sm:block tracking-wide"
            >
              Assessment
            </span>
          </div>

          <Timer endTime={endTime} onTimeUp={handleTimeUp} />

          <button
            onClick={() => setShowConfirm(true)}
            disabled={isSubmitting}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
              boxShadow: "0 4px 20px rgba(139, 92, 246, 0.3)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 6px 28px rgba(139, 92, 246, 0.45)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(139, 92, 246, 0.3)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 py-10">
        {currentQuestion && (
          <QuestionCard
            question={currentQuestion}
            questionNumber={currentIndex + 1}
            totalQuestions={questions.length}
            selectedAnswer={answers[currentQuestion.questionId]}
            onAnswer={handleAnswer}
          />
        )}

        {/* Navigation arrows */}
        <div className="mx-auto mt-10 flex max-w-3xl items-center justify-between">
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium text-slate-400 backdrop-blur-xl transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed"
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
            }}
            onMouseEnter={(e) => {
              if (currentIndex > 0) {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
                e.currentTarget.style.color = "#e2e8f0";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
              e.currentTarget.style.color = "";
            }}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          <span className="text-sm text-slate-600 font-medium">
            {currentIndex + 1} / {questions.length}
          </span>

          <button
            onClick={goNext}
            disabled={currentIndex === questions.length - 1}
            className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium text-slate-400 backdrop-blur-xl transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed"
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
            }}
            onMouseEnter={(e) => {
              if (currentIndex < questions.length - 1) {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
                e.currentTarget.style.color = "#e2e8f0";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
              e.currentTarget.style.color = "";
            }}
          >
            Next
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </main>

      {/* Bottom navigation */}
      <footer
        className="sticky bottom-0 backdrop-blur-xl px-4 py-5"
        style={{
          background: "rgba(6, 6, 10, 0.8)",
          borderTop: "1px solid rgba(255, 255, 255, 0.06)",
        }}
      >
        <QuestionNav
          questions={questions}
          answers={answers}
          currentIndex={currentIndex}
          onNavigate={setCurrentIndex}
        />
      </footer>

      {/* Confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
          <div
            className="w-full max-w-sm rounded-2xl p-7 shadow-2xl"
            style={{
              background: "linear-gradient(180deg, rgba(20, 22, 32, 0.98), rgba(12, 14, 24, 0.98))",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow: "0 24px 64px rgba(0, 0, 0, 0.5), 0 0 40px rgba(139, 92, 246, 0.1)",
            }}
          >
            {/* Icon */}
            <div
              className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{
                background: "rgba(139, 92, 246, 0.1)",
                border: "1px solid rgba(139, 92, 246, 0.2)",
              }}
            >
              <svg className="h-6 w-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <h3
              className="text-xl font-bold text-gray-100 mb-2 text-center"
            >
              Submit Assessment?
            </h3>
            <p className="text-sm text-slate-400 mb-1 text-center">
              You have answered{" "}
              <span
                className="font-bold"
                style={{
                  background: "linear-gradient(90deg, #8b5cf6, #06b6d4)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {answeredCount}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-200">{questions.length}</span> questions.
            </p>
            {unansweredCount > 0 && (
              <p className="text-sm text-amber-400/80 mb-5 text-center">
                {unansweredCount} question{unansweredCount !== 1 ? "s" : ""} unanswered.
              </p>
            )}
            {unansweredCount === 0 && <div className="mb-5" />}
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-xl py-3 text-sm font-semibold text-slate-300 transition-all duration-300 backdrop-blur-xl"
                style={{
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConfirm(false);
                  handleSubmit();
                }}
                disabled={isSubmitting}
                className="flex-1 rounded-xl py-3 text-sm font-bold text-white transition-all duration-300 disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
                  boxShadow: "0 4px 20px rgba(139, 92, 246, 0.3)",
                }}
              >
                Confirm Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
