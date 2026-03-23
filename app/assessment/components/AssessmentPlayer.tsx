"use client";

import { useState, useCallback, useRef } from "react";
import Timer from "./Timer";
import QuestionCard from "./QuestionCard";
import QuestionNav from "./QuestionNav";
import SummaryPage from "./SummaryPage";
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
  const [showSummary, setShowSummary] = useState(false);
  const submittedRef = useRef(false);
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});

  const currentQuestion = questions[currentIndex];

  const saveAnswer = useCallback(
    async (questionId: string, answerText: string) => {
      try {
        await fetch("/api/answers", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, questionId, answerText }),
        });
      } catch {
        // Answer is saved optimistically
      }
    },
    [token]
  );

  const handleAnswer = useCallback(
    (answerText: string) => {
      const questionId = questions[currentIndex].questionId;

      // Optimistic update
      setAnswers((prev) => ({ ...prev, [questionId]: answerText }));

      // Debounce server save (300ms)
      if (debounceTimers.current[questionId]) {
        clearTimeout(debounceTimers.current[questionId]);
      }
      debounceTimers.current[questionId] = setTimeout(() => {
        saveAnswer(questionId, answerText);
      }, 300);
    },
    [questions, currentIndex, saveAnswer]
  );

  const handleSubmit = useCallback(async () => {
    if (submittedRef.current || isSubmitting) return;
    submittedRef.current = true;
    setIsSubmitting(true);

    // Flush any pending debounced saves
    for (const [questionId, timer] of Object.entries(debounceTimers.current)) {
      clearTimeout(timer);
      if (answers[questionId] !== undefined) {
        saveAnswer(questionId, answers[questionId]);
      }
    }

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
  }, [token, isSubmitting, onComplete, answers, saveAnswer]);

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

  const handleNavigateFromSummary = (index: number) => {
    setCurrentIndex(index);
    setShowSummary(false);
  };

  const answeredCount = Object.values(answers).filter((v) => v && v.trim().length > 0).length;

  // Summary page
  if (showSummary) {
    return (
      <div className="relative flex min-h-screen flex-col">
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
              <span className="text-sm font-semibold text-slate-300 hidden sm:block tracking-wide">
                Summary
              </span>
            </div>
            <Timer endTime={endTime} onTimeUp={handleTimeUp} />
            <div />
          </div>
        </header>
        <main className="flex-1">
          <SummaryPage
            questions={questions}
            answers={answers}
            onNavigate={handleNavigateFromSummary}
            onSubmit={handleSubmit}
            onBack={() => setShowSummary(false)}
            isSubmitting={isSubmitting}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Top bar */}
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

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSummary(true)}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 transition-all duration-300"
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
              Summary
            </button>
            <button
              onClick={() => setShowSummary(true)}
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
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 py-10">
        {currentQuestion && (
          <QuestionCard
            question={currentQuestion}
            questionNumber={currentIndex + 1}
            totalQuestions={questions.length}
            currentAnswer={answers[currentQuestion.questionId]}
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
    </div>
  );
}
