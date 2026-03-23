"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import GlassCard from "./GlassCard";
import GradientButton from "./GradientButton";
import FormInput from "./FormInput";
import StatusBadge from "./StatusBadge";
import Spinner from "./Spinner";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Assessment {
  assessmentId: string;
  title: string;
  questionSetId: string;
  numQuestions: number;
  durationMinutes: number;
  createdAt: string;
}

interface Candidate {
  candidateId: string;
  name: string;
  email: string;
}

interface QuestionSet {
  questionSetId: string;
  name: string;
  createdAt: string;
}

interface EnrichedInvite {
  inviteId: string;
  assessmentId: string;
  candidateId: string;
  token: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  assessmentTitle: string | null;
  candidateName: string | null;
  candidateEmail: string | null;
  link: string;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const selectClass =
  "w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-gray-100 outline-none transition-all duration-300 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10 focus:bg-white/[0.05] backdrop-blur-sm [&>option]:bg-slate-900 [&>option]:text-gray-100";

const thClass =
  "px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent";

const sectionHeader =
  "text-xs font-semibold uppercase tracking-wider text-slate-500";

/* ------------------------------------------------------------------ */
/*  Collapsible Section                                                */
/* ------------------------------------------------------------------ */

function CollapsibleSection({
  title,
  count,
  defaultOpen = false,
  children,
}: {
  title: string;
  count: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 py-3 group"
      >
        <svg
          className={`h-4 w-4 text-slate-500 transition-transform duration-300 ${
            open ? "rotate-90" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 5l7 7-7 7"
          />
        </svg>
        <span className={sectionHeader}>
          {title} ({count})
        </span>
      </button>
      {open && <div className="pb-2">{children}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function DashboardTab() {
  /* ---- data state ---- */
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
  const [invites, setInvites] = useState<EnrichedInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ---- Step 1: Assessment ---- */
  const [selectedAssessmentId, setSelectedAssessmentId] = useState("");
  const [showNewAssessment, setShowNewAssessment] = useState(false);
  const [newAssTitle, setNewAssTitle] = useState("");
  const [newAssQsId, setNewAssQsId] = useState("");
  const [newAssNumQ, setNewAssNumQ] = useState(20);
  const [newAssDuration, setNewAssDuration] = useState(20);
  const [creatingAssessment, setCreatingAssessment] = useState(false);
  const [showEditAssessment, setShowEditAssessment] = useState(false);

  /* ---- Step 2: Candidate ---- */
  const [candidateSearch, setCandidateSearch] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null
  );
  const [showCandidateDropdown, setShowCandidateDropdown] = useState(false);
  const [showNewCandidate, setShowNewCandidate] = useState(false);
  const [newCandName, setNewCandName] = useState("");
  const [newCandEmail, setNewCandEmail] = useState("");
  const [creatingCandidate, setCreatingCandidate] = useState(false);
  const candidateRef = useRef<HTMLDivElement>(null);

  /* ---- Step 3: Send ---- */
  const [sending, setSending] = useState(false);
  const [successLink, setSuccessLink] = useState("");
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  /* ---- Manage: inline edit ---- */
  const [editCandidateId, setEditCandidateId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  /* ---- Invites copy ---- */
  const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null);

  /* ================================================================ */
  /*  Data Fetching                                                    */
  /* ================================================================ */

  const fetchData = useCallback(async () => {
    try {
      const [aRes, cRes, qRes, iRes] = await Promise.all([
        fetch("/api/assessments"),
        fetch("/api/candidates"),
        fetch("/api/question-sets"),
        fetch("/api/invite"),
      ]);
      const aData = await aRes.json();
      const cData = await cRes.json();
      const qData = await qRes.json();
      const iData = await iRes.json();

      setAssessments(aData.assessments ?? []);
      setCandidates(cData.candidates ?? []);
      setQuestionSets(qData.questionSets ?? []);
      setInvites(iData.invites ?? []);
    } catch {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* close candidate dropdown on outside click */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        candidateRef.current &&
        !candidateRef.current.contains(e.target as Node)
      ) {
        setShowCandidateDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* auto-hide success */
  useEffect(() => {
    if (!successLink) return;
    const t = setTimeout(() => {
      setSuccessLink("");
      setCopiedSuccess(false);
    }, 5000);
    return () => clearTimeout(t);
  }, [successLink]);

  /* ================================================================ */
  /*  Handlers                                                         */
  /* ================================================================ */

  async function handleCreateAssessment() {
    if (!newAssTitle || !newAssQsId) return;
    setCreatingAssessment(true);
    setError("");
    try {
      const res = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newAssTitle,
          questionSetId: newAssQsId,
          numQuestions: newAssNumQ,
          durationMinutes: newAssDuration,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const newId = data.assessmentId ?? "";
      await fetchData();
      if (newId) setSelectedAssessmentId(newId);
      setShowNewAssessment(false);
      setShowEditAssessment(false);
      setNewAssTitle("");
      setNewAssQsId("");
      setNewAssNumQ(20);
      setNewAssDuration(20);
    } catch {
      setError("Failed to create assessment");
    } finally {
      setCreatingAssessment(false);
    }
  }

  async function handleCreateCandidate() {
    if (!newCandName || !newCandEmail) return;
    setCreatingCandidate(true);
    setError("");
    try {
      const res = await fetch("/api/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCandName, email: newCandEmail }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      // API returns candidate fields directly
      const created: Candidate = {
        candidateId: data.candidateId,
        name: data.name,
        email: data.email,
      };
      await fetchData();
      setSelectedCandidate(created);
      setCandidateSearch(created.name);
      setShowNewCandidate(false);
      setNewCandName("");
      setNewCandEmail("");
      setShowCandidateDropdown(false);
    } catch {
      setError("Failed to create candidate");
    } finally {
      setCreatingCandidate(false);
    }
  }

  async function handleSend() {
    if (!selectedAssessmentId || !selectedCandidate) {
      setError("Please select both an assessment and a candidate");
      return;
    }
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentId: selectedAssessmentId,
          candidateId: selectedCandidate.candidateId,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const link = data.link ?? "";
      setSuccessLink(link);
      if (link) {
        try {
          await navigator.clipboard.writeText(link);
          setCopiedSuccess(true);
        } catch {
          /* clipboard may fail silently */
        }
      }
      setSelectedAssessmentId("");
      setSelectedCandidate(null);
      setCandidateSearch("");
      await fetchData();
    } catch {
      setError("Failed to create invite");
    } finally {
      setSending(false);
    }
  }

  async function handleCopySuccess() {
    try {
      await navigator.clipboard.writeText(successLink);
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 2000);
    } catch {
      /* noop */
    }
  }

  async function handleCopyInviteLink(link: string, id: string) {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedInviteId(id);
      setTimeout(() => setCopiedInviteId(null), 2000);
    } catch {
      /* noop */
    }
  }

  async function handleSaveEditCandidate() {
    if (!editCandidateId || !editName || !editEmail) return;
    setSavingEdit(true);
    setError("");
    try {
      const res = await fetch("/api/candidates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId: editCandidateId,
          name: editName,
          email: editEmail,
        }),
      });
      if (!res.ok) throw new Error();
      setEditCandidateId(null);
      await fetchData();
    } catch {
      setError("Failed to update candidate");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDeleteCandidate(id: string, name: string) {
    if (!window.confirm(`Delete candidate "${name}"? This cannot be undone.`))
      return;
    setError("");
    try {
      const res = await fetch("/api/candidates", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId: id }),
      });
      if (!res.ok) throw new Error();
      await fetchData();
    } catch {
      setError("Failed to delete candidate");
    }
  }

  /* ---- filtered candidates for search ---- */
  const filteredCandidates = candidateSearch.trim()
    ? candidates.filter(
        (c) =>
          c.name.toLowerCase().includes(candidateSearch.toLowerCase()) ||
          c.email.toLowerCase().includes(candidateSearch.toLowerCase())
      )
    : candidates;

  /* ---- question set name helper ---- */
  function qsName(id: string) {
    return questionSets.find((q) => q.questionSetId === id)?.name ?? id;
  }

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */

  if (loading) return <Spinner label="Loading dashboard..." />;

  return (
    <div className="space-y-8">
      {/* ---- Error Banner ---- */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/[0.07] backdrop-blur-sm px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* ============================================================ */}
      {/*  SECTION 1 — Send Assessment                                  */}
      {/* ============================================================ */}

      <GlassCard className="relative overflow-hidden border-violet-500/20">
        {/* gradient accent bar */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-violet-500 to-cyan-500" />

        <h2 className="text-lg font-bold bg-gradient-to-r from-gray-100 to-slate-300 bg-clip-text text-transparent mb-6 pt-1">
          Send Assessment
        </h2>

        <div className="space-y-6">
          {/* ---------- Step 1: Assessment ---------- */}
          <div>
            <p className={`${sectionHeader} mb-2`}>Step 1 — Assessment</p>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <select
                  value={selectedAssessmentId}
                  onChange={(e) => setSelectedAssessmentId(e.target.value)}
                  className={selectClass}
                >
                  <option value="">Select assessment...</option>
                  {assessments.map((a) => (
                    <option key={a.assessmentId} value={a.assessmentId}>
                      {a.title}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!showNewAssessment) {
                    // Auto-fill title with timestamp
                    const n = new Date();
                    const d = `${n.getFullYear()}${String(n.getMonth()+1).padStart(2,"0")}${String(n.getDate()).padStart(2,"0")}`;
                    const t = `${String(n.getHours()).padStart(2,"0")}${String(n.getMinutes()).padStart(2,"0")}`;
                    setNewAssTitle(`Assessment-${d}-${t}`);
                    // Auto-select latest question set
                    if (questionSets.length > 0) {
                      const sorted = [...questionSets].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
                      setNewAssQsId(sorted[0].questionSetId);
                    }
                  }
                  setShowNewAssessment(!showNewAssessment);
                }}
                className="shrink-0 rounded-xl border border-violet-500/30 bg-violet-500/10 px-3 py-3 text-xs font-semibold text-violet-300 transition-all duration-300 hover:bg-violet-500/20 hover:text-violet-200"
              >
                {showNewAssessment ? "Cancel" : "+ New"}
              </button>
            </div>

            {/* inline new assessment form */}
            {showNewAssessment && (
              <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
                {/* Prefilled summary */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-300">
                  <span><span className="text-slate-500">Title:</span> {newAssTitle}</span>
                  <span><span className="text-slate-500">Set:</span> {qsName(newAssQsId)}</span>
                  <span><span className="text-slate-500">Qs:</span> {newAssNumQ}</span>
                  <span><span className="text-slate-500">Duration:</span> {newAssDuration}min</span>
                  <button
                    type="button"
                    onClick={() => setShowEditAssessment(!showEditAssessment)}
                    className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    {showEditAssessment ? "Hide" : "Edit"}
                  </button>
                </div>

                {/* Editable fields — hidden by default */}
                {showEditAssessment && (
                  <div className="space-y-3 pt-2 border-t border-white/[0.06]">
                    <FormInput
                      label="Title"
                      value={newAssTitle}
                      onChange={(e) => setNewAssTitle(e.target.value)}
                      placeholder="e.g. Frontend Developer Assessment"
                      required
                    />
                    <div>
                      <label className="block text-sm font-medium text-slate-300/90 mb-1.5 tracking-wide">
                        Question Set
                      </label>
                      <select
                        value={newAssQsId}
                        onChange={(e) => setNewAssQsId(e.target.value)}
                        className={selectClass}
                      >
                        <option value="">Select question set...</option>
                        {questionSets.map((qs) => (
                          <option key={qs.questionSetId} value={qs.questionSetId}>
                            {qs.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <FormInput
                        label="Number of Questions"
                        type="number"
                        value={newAssNumQ}
                        onChange={(e) => setNewAssNumQ(Number(e.target.value))}
                        min={1}
                      />
                      <FormInput
                        label="Duration (min)"
                        type="number"
                        value={newAssDuration}
                        onChange={(e) => setNewAssDuration(Number(e.target.value))}
                        min={1}
                      />
                    </div>
                  </div>
                )}

                <GradientButton
                  onClick={handleCreateAssessment}
                  disabled={creatingAssessment || !newAssTitle || !newAssQsId}
                >
                  {creatingAssessment ? "Creating..." : "Create"}
                </GradientButton>
              </div>
            )}
          </div>

          {/* ---------- Step 2: Candidate ---------- */}
          <div>
            <p className={`${sectionHeader} mb-2`}>Step 2 — Candidate</p>

            {selectedCandidate ? (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-200 backdrop-blur-sm">
                  <span>{selectedCandidate.name}</span>
                  <span className="text-violet-400/60">
                    {selectedCandidate.email}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCandidate(null);
                      setCandidateSearch("");
                    }}
                    className="ml-1 rounded-full p-0.5 hover:bg-white/10 transition-colors"
                  >
                    <svg
                      className="h-3.5 w-3.5 text-violet-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </span>
              </div>
            ) : (
              <div ref={candidateRef} className="relative">
                <input
                  type="text"
                  value={candidateSearch}
                  onChange={(e) => {
                    setCandidateSearch(e.target.value);
                    setShowCandidateDropdown(true);
                    setShowNewCandidate(false);
                  }}
                  onFocus={() => setShowCandidateDropdown(true)}
                  placeholder="Search by name or email..."
                  className={selectClass}
                />

                {showCandidateDropdown && (
                  <div className="absolute z-20 mt-1 w-full max-h-52 overflow-y-auto rounded-xl border border-white/[0.08] bg-slate-900/90 backdrop-blur-2xl shadow-2xl shadow-black/30">
                    {filteredCandidates.length > 0 ? (
                      filteredCandidates.map((c) => (
                        <button
                          key={c.candidateId}
                          type="button"
                          onClick={() => {
                            setSelectedCandidate(c);
                            setCandidateSearch(c.name);
                            setShowCandidateDropdown(false);
                          }}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-white/[0.06]"
                        >
                          <span className="font-medium text-gray-200">
                            {c.name}
                          </span>
                          <span className="text-slate-500">{c.email}</span>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-slate-500">
                        No matching candidates
                      </div>
                    )}

                    {/* Add New Candidate button */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewCandidate(true);
                        setShowCandidateDropdown(false);
                      }}
                      className="flex w-full items-center gap-2 border-t border-white/[0.06] px-4 py-3 text-left text-sm font-medium text-violet-300 transition-colors hover:bg-violet-500/10"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Add New Candidate
                    </button>
                  </div>
                )}

                {/* inline new candidate form */}
                {showNewCandidate && (
                  <div className="mt-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
                    <FormInput
                      label="Name"
                      value={newCandName}
                      onChange={(e) => setNewCandName(e.target.value)}
                      placeholder="John Doe"
                      required
                    />
                    <FormInput
                      label="Email"
                      type="email"
                      value={newCandEmail}
                      onChange={(e) => setNewCandEmail(e.target.value)}
                      placeholder="john@example.com"
                      required
                    />
                    <div className="flex gap-2">
                      <GradientButton
                        onClick={handleCreateCandidate}
                        disabled={
                          creatingCandidate || !newCandName || !newCandEmail
                        }
                      >
                        {creatingCandidate ? "Adding..." : "Add"}
                      </GradientButton>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewCandidate(false);
                          setNewCandName("");
                          setNewCandEmail("");
                        }}
                        className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2 text-sm text-slate-400 transition-colors hover:bg-white/[0.06]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ---------- Step 3: Send ---------- */}
          <div>
            <p className={`${sectionHeader} mb-2`}>Step 3 — Send</p>

            {successLink ? (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.07] p-4 space-y-3 transition-all duration-500">
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-400">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Invite created! Link copied to clipboard.
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 truncate rounded-lg bg-black/30 px-3 py-2 text-xs text-slate-300 font-mono">
                    {successLink}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopySuccess}
                    className={`shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-300 ${
                      copiedSuccess
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-white/[0.06] text-slate-300 hover:bg-white/[0.1]"
                    }`}
                  >
                    {copiedSuccess ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSend}
                disabled={sending || !selectedAssessmentId || !selectedCandidate}
                className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-violet-600/20 transition-all duration-300 hover:from-violet-500 hover:to-cyan-500 hover:shadow-violet-500/30 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="h-5 w-5 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Creating Invite...
                  </span>
                ) : (
                  "Create & Copy Link"
                )}
              </button>
            )}
          </div>
        </div>
      </GlassCard>

      {/* ============================================================ */}
      {/*  SECTION 2 — Manage                                           */}
      {/* ============================================================ */}

      <GlassCard>
        <h2 className="text-lg font-bold bg-gradient-to-r from-gray-100 to-slate-300 bg-clip-text text-transparent mb-4">
          Manage
        </h2>

        <div className="space-y-2">
          {/* ---------- Assessments ---------- */}
          <CollapsibleSection
            title="Assessments"
            count={assessments.length}
          >
            <GlassCard noPadding className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className={thClass}>Title</th>
                      <th className={thClass}>Question Set</th>
                      <th className={thClass}>Random Qs</th>
                      <th className={thClass}>Duration</th>
                      <th className={thClass}>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assessments.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-10 text-center text-sm text-slate-500"
                        >
                          No assessments yet.
                        </td>
                      </tr>
                    ) : (
                      assessments.map((a) => (
                        <tr
                          key={a.assessmentId}
                          className="border-b border-white/[0.03] transition-colors duration-200 hover:bg-white/[0.02]"
                        >
                          <td className="px-6 py-4 text-sm font-medium text-gray-200">
                            {a.title}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-400">
                            {qsName(a.questionSetId)}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-400">
                            {a.numQuestions}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-400">
                            {a.durationMinutes} min
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">
                            {new Date(a.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </CollapsibleSection>

          {/* ---------- Candidates ---------- */}
          <CollapsibleSection
            title="Candidates"
            count={candidates.length}
          >
            <GlassCard noPadding className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className={thClass}>Name</th>
                      <th className={thClass}>Email</th>
                      <th className={thClass}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-6 py-10 text-center text-sm text-slate-500"
                        >
                          No candidates yet.
                        </td>
                      </tr>
                    ) : (
                      candidates.map((c) => (
                        <tr
                          key={c.candidateId}
                          className="border-b border-white/[0.03] transition-colors duration-200 hover:bg-white/[0.02]"
                        >
                          {editCandidateId === c.candidateId ? (
                            <>
                              <td className="px-6 py-3">
                                <input
                                  type="text"
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  className="w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-3 py-1.5 text-sm text-gray-100 outline-none focus:border-violet-500/50"
                                />
                              </td>
                              <td className="px-6 py-3">
                                <input
                                  type="email"
                                  value={editEmail}
                                  onChange={(e) => setEditEmail(e.target.value)}
                                  className="w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-3 py-1.5 text-sm text-gray-100 outline-none focus:border-violet-500/50"
                                />
                              </td>
                              <td className="px-6 py-3">
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={handleSaveEditCandidate}
                                    disabled={savingEdit}
                                    className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20 disabled:opacity-50"
                                  >
                                    {savingEdit ? "Saving..." : "Save"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditCandidateId(null)}
                                    className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:bg-white/[0.06]"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-6 py-4 text-sm font-medium text-gray-200">
                                {c.name}
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-400">
                                {c.email}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditCandidateId(c.candidateId);
                                      setEditName(c.name);
                                      setEditEmail(c.email);
                                    }}
                                    className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-gray-100"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeleteCandidate(
                                        c.candidateId,
                                        c.name
                                      )
                                    }
                                    className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20"
                                  >
                                    Delete
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
              </div>
            </GlassCard>
          </CollapsibleSection>
        </div>
      </GlassCard>

      {/* ============================================================ */}
      {/*  SECTION 3 — Recent Invites                                   */}
      {/* ============================================================ */}

      <GlassCard>
        <h2 className="text-lg font-bold bg-gradient-to-r from-gray-100 to-slate-300 bg-clip-text text-transparent mb-4">
          Recent Invites
          <span className="ml-2 text-sm font-normal text-slate-500">
            ({invites.length})
          </span>
        </h2>

        <GlassCard noPadding className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className={thClass}>Candidate</th>
                  <th className={thClass}>Assessment</th>
                  <th className={thClass}>Status</th>
                  <th className={thClass}>Link</th>
                  <th className={thClass}>Created</th>
                </tr>
              </thead>
              <tbody>
                {invites.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-sm text-slate-500"
                    >
                      No invites yet. Use the form above to send one.
                    </td>
                  </tr>
                ) : (
                  invites.map((inv) => (
                    <tr
                      key={inv.inviteId}
                      className="border-b border-white/[0.03] transition-colors duration-200 hover:bg-white/[0.02]"
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-200">
                          {inv.candidateName ?? "Unknown"}
                        </div>
                        {inv.candidateEmail && (
                          <div className="text-xs text-slate-500 mt-0.5">
                            {inv.candidateEmail}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {inv.assessmentTitle ?? "Unknown"}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={inv.status} />
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() =>
                            handleCopyInviteLink(inv.link, inv.inviteId)
                          }
                          className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all duration-300 backdrop-blur-sm ${
                            copiedInviteId === inv.inviteId
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                              : "border-white/[0.06] bg-white/[0.03] text-slate-300 hover:bg-white/[0.06] hover:text-gray-100"
                          }`}
                        >
                          {copiedInviteId === inv.inviteId ? (
                            <>
                              <svg
                                className="h-3.5 w-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              Copied!
                            </>
                          ) : (
                            <>
                              <svg
                                className="h-3.5 w-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                              Copy
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {new Date(inv.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </GlassCard>
    </div>
  );
}
