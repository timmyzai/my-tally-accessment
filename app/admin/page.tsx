"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import QuestionsTab from "./components/QuestionsTab";
import AssessmentsTab from "./components/AssessmentsTab";
import CandidatesTab from "./components/CandidatesTab";
import InvitesTab from "./components/InvitesTab";
import ResultsTab from "./components/ResultsTab";

const tabs = ["Questions", "Assessments", "Candidates", "Invites", "Results"] as const;
type Tab = (typeof tabs)[number];

const tabIcons: Record<Tab, React.ReactNode> = {
  Questions: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
    </svg>
  ),
  Assessments: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  Candidates: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  Invites: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  ),
  Results: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  ),
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("Questions");
  const router = useRouter();

  async function handleLogout() {
    document.cookie = "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/admin/login");
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/[0.06] backdrop-blur-xl bg-white/[0.02] sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 shadow-lg shadow-violet-500/20">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                />
              </svg>
            </div>
            <h1
              className="text-lg font-bold bg-gradient-to-r from-gray-100 to-slate-300 bg-clip-text text-transparent"
              style={{ fontFamily: "var(--font-outfit), sans-serif" }}
            >
              Admin Dashboard
            </h1>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2 text-sm text-slate-300 transition-all duration-300 hover:bg-white/[0.06] hover:text-gray-100 backdrop-blur-sm"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="border-b border-white/[0.06] backdrop-blur-xl bg-white/[0.01]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab
                    ? "text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <span
                  className={`transition-colors duration-300 ${
                    activeTab === tab ? "text-violet-400" : ""
                  }`}
                >
                  {tabIcons[tab]}
                </span>
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500" />
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {activeTab === "Questions" && <QuestionsTab />}
        {activeTab === "Assessments" && <AssessmentsTab />}
        {activeTab === "Candidates" && <CandidatesTab />}
        {activeTab === "Invites" && <InvitesTab />}
        {activeTab === "Results" && <ResultsTab />}
      </main>
    </div>
  );
}
