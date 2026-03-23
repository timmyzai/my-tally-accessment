"use client";

interface QuestionNavProps {
  questions: { questionId: string; isOptional: boolean }[];
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
  const isAnswered = (qId: string) =>
    answers[qId] !== undefined && answers[qId].trim().length > 0;
  const answeredCount = questions.filter((q) => isAnswered(q.questionId)).length;
  const requiredUnansweredCount = questions.filter(
    (q) => !q.isOptional && !isAnswered(q.questionId)
  ).length;

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
            {requiredUnansweredCount > 0 && (
              <>
                {" "}<span style={{ color: "#fbbf24" }}>
                  {requiredUnansweredCount} required remaining
                </span>
              </>
            )}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {questions.map((q, idx) => {
            const answered = isAnswered(q.questionId);
            const isCurrent = idx === currentIndex;
            const isRequired = !q.isOptional;

            // Determine styles based on state
            let bg: string;
            let borderStyle: string;
            let textColor: string;

            if (answered) {
              bg = "rgba(16, 185, 129, 0.12)";
              borderStyle = "1px solid rgba(16, 185, 129, 0.25)";
              textColor = "#34d399";
            } else if (isRequired) {
              bg = "rgba(245, 158, 11, 0.1)";
              borderStyle = "1px solid rgba(245, 158, 11, 0.25)";
              textColor = "#fbbf24";
            } else {
              bg = "rgba(255, 255, 255, 0.03)";
              borderStyle = "1px solid rgba(255, 255, 255, 0.06)";
              textColor = "rgba(148, 163, 184, 0.5)";
            }

            // Current question overrides border for the violet ring
            if (isCurrent) {
              borderStyle = "2px solid transparent";
            }

            return (
              <button
                key={q.questionId}
                onClick={() => onNavigate(idx)}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold transition-all duration-300"
                style={{
                  background: bg,
                  border: borderStyle,
                  color: isCurrent && !answered
                    ? "#c4b5fd"
                    : textColor,
                  boxShadow: isCurrent
                    ? "0 0 0 2px #06060a, 0 0 0 4px #8b5cf6, 0 0 16px rgba(139, 92, 246, 0.25)"
                    : answered
                      ? "0 0 12px rgba(16, 185, 129, 0.1)"
                      : "none",
                }}
                onMouseEnter={(e) => {
                  if (!isCurrent && !answered) {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
                    e.currentTarget.style.color = "rgba(203, 213, 225, 0.8)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isCurrent && !answered) {
                    e.currentTarget.style.background = bg;
                    e.currentTarget.style.color = textColor;
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
