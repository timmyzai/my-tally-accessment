"use client";

interface QuestionData {
  questionId: string;
  questionText: string;
  isOptional: boolean;
}

interface QuestionCardProps {
  question: QuestionData;
  questionNumber: number;
  totalQuestions: number;
  currentAnswer: string | undefined;
  onAnswer: (answerText: string) => void;
}

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  currentAnswer,
  onAnswer,
}: QuestionCardProps) {
  const answerValue = currentAnswer ?? "";

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
          boxShadow:
            "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.04)",
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <p className="text-xl font-semibold leading-relaxed text-gray-100">
            {question.questionText}
          </p>

          {/* Required / Optional badge */}
          {question.isOptional ? (
            <span
              className="shrink-0 rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase"
              style={{
                background: "rgba(245, 158, 11, 0.12)",
                color: "#fbbf24",
                border: "1px solid rgba(245, 158, 11, 0.25)",
              }}
            >
              Optional
            </span>
          ) : (
            <span
              className="shrink-0 rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase"
              style={{
                background: "rgba(139, 92, 246, 0.12)",
                color: "#a78bfa",
                border: "1px solid rgba(139, 92, 246, 0.25)",
              }}
            >
              Required
            </span>
          )}
        </div>
      </div>

      {/* Answer textarea — glass card */}
      <div
        className="rounded-2xl p-6 backdrop-blur-xl"
        style={{
          background: "rgba(255, 255, 255, 0.02)",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.02)",
        }}
      >
        <textarea
          value={answerValue}
          onChange={(e) => onAnswer(e.target.value)}
          placeholder="Write your answer here..."
          className="w-full rounded-xl p-5 text-base text-gray-100 placeholder-slate-500 resize-y outline-none transition-all duration-300 focus:ring-2 focus:ring-violet-500/30"
          style={{
            minHeight: "150px",
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            boxShadow:
              "0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.04)",
            backdropFilter: "blur(12px)",
          }}
        />

        {/* Character count */}
        <div className="mt-3 flex justify-end">
          <span
            className="text-xs font-medium tabular-nums"
            style={{ color: "rgba(148, 163, 184, 0.6)" }}
          >
            {answerValue.length} characters
          </span>
        </div>
      </div>
    </div>
  );
}
