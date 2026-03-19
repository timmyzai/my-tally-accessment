# Tally Assessment System

Invite-based candidate assessment platform built with Next.js, DynamoDB, and Tailwind CSS.

## Features
- Question bank management (50 pre-seeded technical questions)
- Assessment creation with configurable duration
- Candidate management
- Unique invite links with UUID tokens
- Timed assessments with auto-submit
- Real-time answer saving
- Score computation and detailed result breakdowns
- Admin dashboard with tabbed interface
- Cookie-based admin authentication

## Tech Stack
- Next.js 16 (App Router, TypeScript)
- AWS DynamoDB (5 tables, ap-southeast-5 Malaysia region)
- Tailwind CSS
- Vercel (deployment)

## Prerequisites
- Node.js 18+
- AWS account with DynamoDB access
- npm

## Setup

1. Clone and install:
   ```bash
   git clone <repo-url>
   cd my-tally-accessment
   npm install
   ```

2. Configure environment:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your AWS credentials
   ```

3. Create DynamoDB tables and seed data:
   ```bash
   npx tsx scripts/migrate.ts --seed
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:3000

## Migration Commands
- `npx tsx scripts/migrate.ts` — Apply pending migrations
- `npx tsx scripts/migrate.ts --seed` — Migrations + seed 50 questions
- `npx tsx scripts/migrate.ts --status` — Check migration status
- `npx tsx scripts/migrate.ts --fresh` — Drop and re-create all tables (DESTRUCTIVE)

## Admin Access
Default credentials (configurable via env vars):
- Username: admin
- Password: admin123
- Dashboard: http://localhost:3000/admin

## Admin Workflow
1. Login at /admin/login
2. Browse/add questions in Questions tab
3. Create assessments (select questions, set duration) in Assessments tab
4. Add candidates in Candidates tab
5. Generate invite links in Invites tab
6. View results in Results tab

## Candidate Flow
1. Candidate receives invite link: /assessment?token=<uuid>
2. Views assessment info and clicks "Start Assessment"
3. Answers questions (saved immediately)
4. Can skip and revisit questions
5. Timer auto-submits when time runs out
6. Score displayed after submission

## DynamoDB Tables
- Questions — question bank
- Assessments — question bundles with duration
- Candidates — candidate profiles
- Invites — links assessments to candidates (GSI on token)
- Answers — per-question answers (composite key: attemptId + questionId)
- _Migrations — migration history tracking

## Environment Variables
See `.env.example` for all required variables.

## Deployment (Vercel)
1. Push to GitHub
2. Import in Vercel
3. Set environment variables in Vercel dashboard
4. Deploy
