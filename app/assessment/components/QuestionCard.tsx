"use client";

import { useState } from "react";
import type { QuestionData } from "../types";

interface QuestionCardProps {
  question: QuestionData;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: string | undefined;
  onAnswer: (answer: string) => void;
}

const optionKeys = ["A", "B", "C", "D"] as const;
const optionLabels: Record<string, string> = {
  A: "optionA",
  B: "optionB",
  C: "optionC",
  D: "optionD",
};

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswer,
}: QuestionCardProps) {
  const [justSelected, setJustSelected] = useState<string | null>(null);

  const handleSelect = (key: string) => {
    setJustSelected(key);
    onAnswer(key);
    setTimeout(() => setJustSelected(null), 400);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Question header with progress */}
      <div className="mb-8 flex items-center justify-between">
        <span
          className="text-sm font-semibold tracking-widest uppercase"
          style={{
            background: "linear-gradient(90deg, #8b5cf6, #06b6d4)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Question {questionNumber} of {totalQuestions}
        </span>
        <div className="h-1 flex-1 mx-6 rounded-full bg-white/[0.04] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${(questionNumber / totalQuestions) * 100}%`,
              background: "linear-gradient(90deg, #8b5cf6, #06b6d4)",
            }}
          />
        </div>
      </div>

      {/* Question text — glass card */}
      <div
        className="rounded-2xl p-8 mb-8 backdrop-blur-xl"
        style={{
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.04)",
        }}
      >
        <p
          className="text-xl font-semibold leading-relaxed text-gray-100"
        >
          {question.questionText}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {optionKeys.map((key) => {
          const text = question[optionLabels[key] as keyof QuestionData];
          const isSelected = selectedAnswer === key;
          const isJustClicked = justSelected === key;

          return (
            <button
              key={key}
              onClick={() => handleSelect(key)}
              className="group relative w-full rounded-xl p-5 text-left backdrop-blur-xl transition-all duration-300 ease-out"
              style={{
                transform: isJustClicked ? "scale(0.98)" : isSelected ? "scale(1)" : undefined,
                background: isSelected
                  ? "rgba(139, 92, 246, 0.08)"
                  : "rgba(255, 255, 255, 0.02)",
                border: isSelected
                  ? "1px solid rgba(139, 92, 246, 0.4)"
                  : "1px solid rgba(255, 255, 255, 0.05)",
                boxShadow: isSelected
                  ? "0 0 24px rgba(139, 92, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.04)"
                  : "inset 0 1px 0 rgba(255, 255, 255, 0.02)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.05)";
                  e.currentTarget.style.transform = "translateY(0)";
                }
              }}
            >
              <div className="flex items-center gap-4">
                {/* Letter badge */}
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-all duration-300"
                  style={{
                    background: isSelected
                      ? "linear-gradient(135deg, #8b5cf6, #06b6d4)"
                      : "rgba(255, 255, 255, 0.05)",
                    color: isSelected ? "#ffffff" : "rgba(148, 163, 184, 0.8)",
                    boxShadow: isSelected
                      ? "0 4px 16px rgba(139, 92, 246, 0.35)"
                      : "none",
                  }}
                >
                  {key}
                </div>

                {/* Option text */}
                <span
                  className={`text-base transition-colors duration-300 ${
                    isSelected ? "text-gray-100 font-medium" : "text-slate-300"
                  }`}
                >
                  {text}
                </span>

                {/* Checkmark for selected */}
                {isSelected && (
                  <div className="ml-auto">
                    <div
                      className="flex h-6 w-6 items-center justify-center rounded-full"
                      style={{
                        background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
                        boxShadow: "0 2px 8px rgba(139, 92, 246, 0.3)",
                      }}
                    >
                      <svg
                        className="h-3.5 w-3.5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
