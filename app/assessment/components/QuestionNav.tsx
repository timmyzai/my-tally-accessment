"use client";

interface QuestionNavProps {
  questions: { questionId: string }[];
  answers: Record<string, string>;
  currentIndex: number;
  onNavigate: (index: number) => void;
}

export default function QuestionNav({
  questions,
  answers,
  currentIndex,
  onNavigate,
}: QuestionNavProps) {
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div
        className="rounded-2xl p-5 backdrop-blur-xl"
        style={{
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{
              color: "rgba(148, 163, 184, 0.6)",
            }}
          >
            Navigation
          </span>
          <span className="text-xs text-slate-500">
            <span
              className="font-semibold"
              style={{
                background: "linear-gradient(90deg, #8b5cf6, #06b6d4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {answeredCount}
            </span>
            {" "}of {questions.length} answered
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {questions.map((q, idx) => {
            const isAnswered = q.questionId in answers;
            const isCurrent = idx === currentIndex;

            return (
              <button
                key={q.questionId}
                onClick={() => onNavigate(idx)}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold transition-all duration-300"
                style={{
                  background: isAnswered
                    ? "rgba(16, 185, 129, 0.12)"
                    : "rgba(255, 255, 255, 0.03)",
                  border: isCurrent
                    ? "2px solid transparent"
                    : isAnswered
                      ? "1px solid rgba(16, 185, 129, 0.25)"
                      : "1px solid rgba(255, 255, 255, 0.06)",
                  color: isAnswered
                    ? "#34d399"
                    : isCurrent
                      ? "#c4b5fd"
                      : "rgba(148, 163, 184, 0.5)",
                  boxShadow: isCurrent
                    ? "0 0 0 2px #06060a, 0 0 0 4px #8b5cf6, 0 0 16px rgba(139, 92, 246, 0.25)"
                    : isAnswered
                      ? "0 0 12px rgba(16, 185, 129, 0.1)"
                      : "none",
                }}
                onMouseEnter={(e) => {
                  if (!isCurrent && !isAnswered) {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
                    e.currentTarget.style.color = "rgba(203, 213, 225, 0.8)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isCurrent && !isAnswered) {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                    e.currentTarget.style.color = "rgba(148, 163, 184, 0.5)";
                  }
                }}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
