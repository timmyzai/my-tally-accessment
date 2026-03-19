import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0c0e14] px-6">
      <main className="flex w-full max-w-2xl flex-col items-center gap-12 text-center">
        {/* Logo / Title */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-600 text-2xl font-bold text-white">
            TA
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Tally Assessment
          </h1>
          <p className="max-w-md text-lg leading-relaxed text-zinc-400">
            An invite-based candidate assessment platform. Create question
            banks, build assessments, send invite links, and review results
            — all from one dashboard.
          </p>
        </div>

        {/* Feature highlights */}
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              title: "Question Bank",
              desc: "50 pre-seeded technical questions with easy management",
            },
            {
              title: "Timed Assessments",
              desc: "Configurable duration with auto-submit on expiry",
            },
            {
              title: "Instant Results",
              desc: "Automatic scoring with detailed breakdowns",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 text-left"
            >
              <h3 className="mb-1 text-sm font-semibold text-violet-400">
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed text-zinc-500">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-4">
          <Link
            href="/admin"
            className="inline-flex h-12 items-center justify-center rounded-full bg-violet-600 px-8 text-sm font-medium text-white transition-colors hover:bg-violet-500"
          >
            Open Admin Dashboard
          </Link>
          <p className="text-sm text-zinc-600">
            Candidates access assessments via unique invite links.
          </p>
        </div>
      </main>
    </div>
  );
}
