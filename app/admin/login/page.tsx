"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import GlassCard from "../components/GlassCard";
import GradientButton from "../components/GradientButton";
import Spinner from "../components/Spinner";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Login failed");
      }

      window.location.href = "/admin";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      {/* Ambient glow behind card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-violet-600/[0.08] to-cyan-600/[0.06] blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-sm">
        {/* Gradient lock icon */}
        <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 shadow-lg shadow-violet-500/25">
          <svg
            className="h-8 w-8 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
            />
          </svg>
        </div>

        <h1
          className="text-2xl font-bold text-center text-gray-100 mb-2"
        >
          Admin Login
        </h1>
        <p className="text-sm text-center text-slate-400 mb-8">
          Sign in to access the dashboard
        </p>

        <GlassCard>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300/90 mb-1.5 tracking-wide">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-gray-100 placeholder-slate-500 outline-none transition-all duration-300 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10 focus:bg-white/[0.05] backdrop-blur-sm"
                placeholder="Enter username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300/90 mb-1.5 tracking-wide">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-gray-100 placeholder-slate-500 outline-none transition-all duration-300 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10 focus:bg-white/[0.05] backdrop-blur-sm"
                placeholder="Enter password"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/[0.07] backdrop-blur-sm px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <GradientButton
              type="submit"
              disabled={loading}
              className="w-full py-3 text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-transparent border-t-white" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </GradientButton>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
