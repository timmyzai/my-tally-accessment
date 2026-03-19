"use client";

import React, { useEffect, useState } from "react";
import type { Candidate } from "@/lib/types";
import Spinner from "./Spinner";
import GlassCard from "./GlassCard";
import GradientButton from "./GradientButton";
import FormInput from "./FormInput";

export default function CandidatesTab() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  async function fetchCandidates() {
    try {
      const res = await fetch("/api/candidates");
      const data = await res.json();
      setCandidates(data.candidates ?? []);
    } catch {
      setError("Failed to load candidates");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCandidates();
  }, []);

  function resetForm() {
    setName("");
    setEmail("");
    setShowForm(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      if (!res.ok) throw new Error("Failed to create candidate");

      resetForm();
      await fetchCandidates();
    } catch {
      setError("Failed to create candidate");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <Spinner label="Loading candidates..." />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2
          className="text-xl font-bold bg-gradient-to-r from-gray-100 to-slate-300 bg-clip-text text-transparent"
          style={{ fontFamily: "var(--font-outfit), sans-serif" }}
        >
          Candidates
          <span className="ml-2 text-sm font-normal text-slate-500">({candidates.length})</span>
        </h2>
        <GradientButton onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Add Candidate"}
        </GradientButton>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/[0.07] backdrop-blur-sm px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {showForm && (
        <GlassCard className="mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Full name"
              />
              <FormInput
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="email@example.com"
              />
            </div>

            <GradientButton type="submit" disabled={saving}>
              {saving ? "Adding..." : "Add Candidate"}
            </GradientButton>
          </form>
        </GlassCard>
      )}

      <GlassCard noPadding className="overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                Name
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                Email
              </th>
            </tr>
          </thead>
          <tbody>
            {candidates.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-6 py-12 text-center text-sm text-slate-500">
                  No candidates yet. Add one to get started.
                </td>
              </tr>
            ) : (
              candidates.map((c) => (
                <tr
                  key={c.candidateId}
                  className="border-b border-white/[0.03] transition-colors duration-200 hover:bg-white/[0.02]"
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-200">{c.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{c.email}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
}
