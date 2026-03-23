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

  const [editingCandidate, setEditingCandidate] = useState<{
    candidateId: string;
    name: string;
    email: string;
  } | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

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

  async function handleEditSave() {
    if (!editingCandidate) return;
    setEditSaving(true);
    setError("");

    try {
      const res = await fetch("/api/candidates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId: editingCandidate.candidateId,
          name: editingCandidate.name,
          email: editingCandidate.email,
        }),
      });

      if (!res.ok) throw new Error("Failed to update candidate");

      setEditingCandidate(null);
      await fetchCandidates();
    } catch {
      setError("Failed to update candidate");
    } finally {
      setEditSaving(false);
    }
  }

  async function handleDelete(candidateId: string) {
    if (!window.confirm("Are you sure you want to delete this candidate?")) return;

    setDeleting(candidateId);
    setError("");

    try {
      const res = await fetch("/api/candidates", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId }),
      });

      if (!res.ok) throw new Error("Failed to delete candidate");

      await fetchCandidates();
    } catch {
      setError("Failed to delete candidate");
    } finally {
      setDeleting(null);
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
              <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {candidates.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-sm text-slate-500">
                  No candidates yet. Add one to get started.
                </td>
              </tr>
            ) : (
              candidates.map((c) => (
                <tr
                  key={c.candidateId}
                  className="border-b border-white/[0.03] transition-colors duration-200 hover:bg-white/[0.02]"
                >
                  {editingCandidate?.candidateId === c.candidateId ? (
                    <>
                      <td className="px-6 py-3">
                        <FormInput
                          label=""
                          value={editingCandidate.name}
                          onChange={(e) =>
                            setEditingCandidate({ ...editingCandidate, name: e.target.value })
                          }
                          required
                          placeholder="Full name"
                        />
                      </td>
                      <td className="px-6 py-3">
                        <FormInput
                          label=""
                          type="email"
                          value={editingCandidate.email}
                          onChange={(e) =>
                            setEditingCandidate({ ...editingCandidate, email: e.target.value })
                          }
                          required
                          placeholder="email@example.com"
                        />
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <GradientButton onClick={handleEditSave} disabled={editSaving}>
                            {editSaving ? "Saving..." : "Save"}
                          </GradientButton>
                          <button
                            onClick={() => setEditingCandidate(null)}
                            className="px-3 py-1.5 text-sm rounded-lg border border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 text-sm font-medium text-gray-200">{c.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-400">{c.email}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() =>
                              setEditingCandidate({
                                candidateId: c.candidateId,
                                name: c.name,
                                email: c.email,
                              })
                            }
                            className="px-3 py-1.5 text-sm rounded-lg border border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(c.candidateId)}
                            disabled={deleting === c.candidateId}
                            className="px-3 py-1.5 text-sm rounded-lg border border-red-500/20 text-red-400 hover:text-red-300 hover:border-red-500/40 transition-colors disabled:opacity-50"
                          >
                            {deleting === c.candidateId ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
}
