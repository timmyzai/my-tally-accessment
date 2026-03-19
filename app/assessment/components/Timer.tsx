"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface TimerProps {
  endTime: string;
  onTimeUp: () => void;
}

export default function Timer({ endTime, onTimeUp }: TimerProps) {
  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    const diff = new Date(endTime).getTime() - Date.now();
    return Math.max(0, Math.floor(diff / 1000));
  });
  const calledRef = useRef(false);
  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;

  const handleTimeUp = useCallback(() => {
    if (!calledRef.current) {
      calledRef.current = true;
      onTimeUpRef.current();
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = new Date(endTime).getTime() - Date.now();
      const secs = Math.max(0, Math.floor(diff / 1000));
      setSecondsLeft(secs);
      if (secs <= 0) {
        clearInterval(interval);
        handleTimeUp();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime, handleTimeUp]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const display = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  // Dynamic glow & color transitions
  let glowColor = "rgba(16, 185, 129, 0.35)";
  let borderColor = "rgba(16, 185, 129, 0.25)";
  let textColor = "#34d399";
  let iconColor = "#34d399";
  let pulseClass = "";

  if (secondsLeft <= 60) {
    glowColor = "rgba(239, 68, 68, 0.5)";
    borderColor = "rgba(239, 68, 68, 0.35)";
    textColor = "#f87171";
    iconColor = "#f87171";
    pulseClass = "animate-pulse";
  } else if (secondsLeft <= 300) {
    glowColor = "rgba(245, 158, 11, 0.4)";
    borderColor = "rgba(245, 158, 11, 0.3)";
    textColor = "#fbbf24";
    iconColor = "#fbbf24";
  }

  return (
    <div
      className={`inline-flex items-center gap-2.5 rounded-full px-5 py-2.5 backdrop-blur-xl transition-all duration-700 ${pulseClass}`}
      style={{
        background: "rgba(255, 255, 255, 0.03)",
        border: `1px solid ${borderColor}`,
        boxShadow: `0 0 20px ${glowColor}, inset 0 0 20px rgba(255, 255, 255, 0.02)`,
        transition: "box-shadow 0.7s ease, border-color 0.7s ease",
      }}
    >
      <svg
        className="h-4 w-4 transition-colors duration-700"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        style={{ color: iconColor }}
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
      <span
        className="font-mono text-lg font-semibold tracking-wider transition-colors duration-700"
        style={{ color: textColor }}
      >
        {display}
      </span>
    </div>
  );
}
