"use client";

import { useEffect, useState, useRef } from "react";

interface ScoreScreenProps {
  score: number;
  totalQuestions: number;
  answeredCount: number;
}

export default function ScoreScreen({
  score,
  totalQuestions,
  answeredCount,
}: ScoreScreenProps) {
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const [animatedPercent, setAnimatedPercent] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const [displayPercent, setDisplayPercent] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    // Stagger the reveal
    const t1 = setTimeout(() => setShowContent(true), 200);
    const t2 = setTimeout(() => setAnimatedPercent(percentage), 500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [percentage]);

  // Animate the counter
  useEffect(() => {
    if (animatedPercent === 0) return;
    const duration = 1500;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplayPercent(Math.round(eased * animatedPercent));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [animatedPercent]);

  // Circle SVG parameters
  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedPercent / 100) * circumference;

  // Determine message and colors
  let message = "";
  let subMessage = "";
  let gradientStroke = "url(#scoreGradient)";
  let glowColor = "rgba(139, 92, 246, 0.3)";

  if (percentage >= 80) {
    message = "Outstanding Performance";
    subMessage = "You demonstrated excellent knowledge across the assessment.";
    glowColor = "rgba(16, 185, 129, 0.35)";
  } else if (percentage >= 60) {
    message = "Good Effort";
    subMessage = "You showed solid understanding of the material.";
    glowColor = "rgba(59, 130, 246, 0.3)";
  } else if (percentage >= 40) {
    message = "Room for Growth";
    subMessage = "Keep studying and you will improve your results.";
    glowColor = "rgba(245, 158, 11, 0.3)";
  } else {
    message = "Keep Learning";
    subMessage = "Every assessment is a step toward mastery. Keep going.";
    glowColor = "rgba(239, 68, 68, 0.3)";
  }

  // Particles for high scores
  const showParticles = percentage >= 70;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      {/* Particle effect for high scores */}
      {showParticles && showContent && (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: i % 3 === 0
                  ? "#8b5cf6"
                  : i % 3 === 1
                    ? "#06b6d4"
                    : "#34d399",
                opacity: 0,
                animation: `floatUp ${3 + Math.random() * 4}s ease-out ${Math.random() * 2}s infinite`,
              }}
            />
          ))}
        </div>
      )}

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
          <h1
            className="text-4xl font-bold text-gray-100 mb-3"
            style={{ fontFamily: "var(--font-outfit), sans-serif" }}
          >
            {message}
          </h1>
          <p className="text-slate-400 text-base max-w-sm mx-auto">{subMessage}</p>
        </div>

        {/* Circular progress */}
        <div className="relative mx-auto mb-10 h-52 w-52">
          {/* Glow backdrop */}
          <div
            className="absolute inset-4 rounded-full blur-2xl transition-opacity duration-1000"
            style={{
              background: glowColor,
              opacity: animatedPercent > 0 ? 0.6 : 0,
            }}
          />
          <svg className="h-52 w-52 -rotate-90 relative z-10" viewBox="0 0 164 164">
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                {percentage >= 80 ? (
                  <>
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </>
                ) : percentage >= 60 ? (
                  <>
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </>
                ) : percentage >= 40 ? (
                  <>
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#ef4444" />
                  </>
                ) : (
                  <>
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </>
                )}
              </linearGradient>
            </defs>
            {/* Background circle */}
            <circle
              cx="82"
              cy="82"
              r={radius}
              fill="none"
              stroke="rgba(255, 255, 255, 0.04)"
              strokeWidth="6"
            />
            {/* Progress circle */}
            <circle
              cx="82"
              cy="82"
              r={radius}
              fill="none"
              strokeWidth="6"
              strokeLinecap="round"
              stroke={gradientStroke}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{
                transition: "stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)",
                filter: `drop-shadow(0 0 8px ${glowColor})`,
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
            <span
              className="text-5xl font-bold text-white"
              style={{ fontFamily: "var(--font-outfit), sans-serif" }}
            >
              {displayPercent}
              <span className="text-2xl text-slate-400">%</span>
            </span>
          </div>
        </div>

        {/* Score details — glass card */}
        <div
          className="rounded-2xl p-6 backdrop-blur-xl"
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
          }}
        >
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p
                className="text-3xl font-bold"
                style={{
                  fontFamily: "var(--font-outfit), sans-serif",
                  background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {score}/{totalQuestions}
              </p>
              <p className="mt-2 text-xs text-slate-500 uppercase tracking-widest font-semibold">
                Correct
              </p>
            </div>
            <div>
              <p
                className="text-3xl font-bold text-gray-100"
                style={{ fontFamily: "var(--font-outfit), sans-serif" }}
              >
                {answeredCount}
              </p>
              <p className="mt-2 text-xs text-slate-500 uppercase tracking-widest font-semibold">
                Answered
              </p>
            </div>
            <div>
              <p
                className="text-3xl font-bold text-gray-100"
                style={{ fontFamily: "var(--font-outfit), sans-serif" }}
              >
                {totalQuestions - answeredCount}
              </p>
              <p className="mt-2 text-xs text-slate-500 uppercase tracking-widest font-semibold">
                Skipped
              </p>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="mt-8 text-sm text-slate-600">
          Your results have been submitted. You may close this window.
        </p>
      </div>

      {/* Keyframe animation for particles */}
      <style>{`
        @keyframes floatUp {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0);
          }
          20% {
            opacity: 0.8;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-100px) scale(0.5);
          }
        }
      `}</style>
    </div>
  );
}
