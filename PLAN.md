# Invite-Based Assessment System — Implementation Plan

## Context

Building a lightweight, invite-based candidate assessment system from scratch (greenfield). An admin creates questions, bundles them into assessments, adds candidates, and generates unique invite links. Candidates open the link, take a timed assessment, and results are stored. The system prioritizes simplicity and usability over complexity.

**Also required:** Update the `.claude/skills/assessment-builder/` files to match the refined 5-table DynamoDB schema and invite-based flow (replacing the old 3-table session-based design).

---

## Phase 0: Project Scaffolding

1. Initialize Next.js with `create-next-app` (App Router, TypeScript, Tailwind, ESLint)
2. Install deps: `@aws-sdk/client-dynamodb`, `@aws-sdk/lib-dynamodb`, `uuid`, `@types/uuid`
3. Create `.env.example`:
   ```
   AWS_ACCESS_KEY_ID=
   AWS_SECRET_ACCESS_KEY=
   AWS_REGION=us-east-1
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=admin123
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

**Files:** `package.json`, `.env.example`, `tailwind.config.ts`, `tsconfig.json` (all via create-next-app + npm install)

---

## Phase 1: Database Layer

### `/lib/dynamodb.ts`
- Singleton `DynamoDBDocumentClient`
- Table name constants: `Questions`, `Assessments`, `Candidates`, `Invites`, `Answers`

### `/lib/types.ts`
- `Question` — questionId, questionText, optionA/B/C/D, correctAnswer ("A"|"B"|"C"|"D"), createdAt
- `Assessment` — assessmentId, title, questionIds[], durationMinutes, createdAt
- `Candidate` — candidateId, name, email
- `Invite` — inviteId, assessmentId, candidateId, token, status (NOT_STARTED|IN_PROGRESS|COMPLETED), startTime?, endTime?, createdAt
- `Answer` — attemptId (=inviteId), questionId (SK), selectedAnswer, updatedAt

### `/scripts/create-tables.ts`
- Creates all 5 DynamoDB tables
- Invites table gets a GSI on `token` for O(1) token lookups
- Answers table uses composite key: PK=attemptId, SK=questionId

### `/scripts/seed-questions.ts`
- 50 hardcoded technical questions (JS, TS, React, Next.js, Web fundamentals)
- Inserts via BatchWrite

---

## Phase 2: API Routes — Admin & CRUD

| File | Methods | Purpose |
|------|---------|---------|
| `/app/api/admin/login/route.ts` | POST | Username/password check, sets `admin_session` cookie |
| `/app/api/questions/route.ts` | GET, POST | List all / create question |
| `/app/api/assessments/route.ts` | GET, POST | List all / create assessment (title + questionIds + duration) |
| `/app/api/candidates/route.ts` | GET, POST | List all / add candidate |
| `/app/api/invite/route.ts` | GET, POST | List invites (enriched) / create invite (generates token + link) |
| `/app/api/results/[inviteId]/route.ts` | GET | Fetch answers, compute score, return breakdown |

---

## Phase 3: API Routes — Candidate Flow

| File | Methods | Purpose |
|------|---------|---------|
| `/app/api/assessment/[token]/route.ts` | GET | Load assessment by token. Returns different data based on invite status (NOT_STARTED → metadata, IN_PROGRESS → questions + answers + remainingTime, COMPLETED → score) |
| `/app/api/assessment/start/route.ts` | POST | Set startTime, endTime, status=IN_PROGRESS. Return questions (no correctAnswer) |
| `/app/api/answers/route.ts` | PUT | Save single answer. Validates invite is IN_PROGRESS and not expired |
| `/app/api/assessment/submit/route.ts` | POST | Set status=COMPLETED. Compute and return score |

**Key:** `correctAnswer` is NEVER sent to the client during assessment. Score computed server-side on submit.

---

## Phase 4: Candidate UI

### `/app/assessment/page.tsx` (client component)
- Reads `token` from URL search params
- Fetches `GET /api/assessment/[token]`
- Renders one of three views based on status:
  - NOT_STARTED → landing with "Start Assessment" button
  - IN_PROGRESS → `<AssessmentPlayer>`
  - COMPLETED → `<ScoreScreen>`

### `/app/assessment/components/`
| Component | Purpose |
|-----------|---------|
| `AssessmentPlayer.tsx` | Main assessment view: timer, question card, navigation, summary panel |
| `Timer.tsx` | Countdown from endTime. MM:SS display. Red when <60s. Calls onTimeUp at 0 |
| `QuestionCard.tsx` | Displays question text + 4 radio options. Highlights selected |
| `QuestionNav.tsx` | Grid of numbered buttons. Green=answered, gray=unanswered, blue=current |
| `ScoreScreen.tsx` | Shows score as fraction + percentage after completion |

### Key behaviors:
- Answer saved immediately on selection (PUT /api/answers, optimistic UI)
- Timer persists on refresh (computed from server endTime)
- Auto-submit when timer hits 0
- Skip & revisit via QuestionNav

---

## Phase 5: Admin UI

### `/app/admin/login/page.tsx`
- Simple username + password form → POST /api/admin/login → redirect to /admin

### `/app/admin/page.tsx`
- Dashboard with tab navigation: Questions | Assessments | Candidates | Invites | Results

### `/app/admin/components/`
| Component | Purpose |
|-----------|---------|
| `QuestionsTab.tsx` | Table of questions + "Add Question" form |
| `AssessmentsTab.tsx` | Table of assessments + "Create Assessment" form with question multi-select |
| `CandidatesTab.tsx` | Table of candidates + "Add Candidate" form |
| `InvitesTab.tsx` | Table of invites with copyable links + "Create Invite" form (select assessment + candidate) |
| `ResultsTab.tsx` | Completed invites list. Click to see per-question breakdown |

### `/middleware.ts`
- Protects `/admin` routes (except `/admin/login`) — redirects to login if no `admin_session` cookie

---

## Phase 6: Update Skill Files

Update `.claude/skills/assessment-builder/` to match the refined requirements:
- **SKILL.md** — Update to 5-table schema, invite-based flow, simplified timer
- **architecture.md** — Update DynamoDB schema, data flows, security model
- **api-structure.md** — Update all API route definitions to match new routes
- **prompt-templates.md** — Update component/page generation prompts

---

## Phase 7: Polish & Documentation

- `/app/layout.tsx` — Root layout with Tailwind, metadata
- `/app/page.tsx` — Simple landing page
- `README.md` — Setup guide (prerequisites, install, table creation, seeding, dev server, Vercel deploy)

---

## Verification Plan

1. Run `npx tsx scripts/create-tables.ts` — tables created without errors
2. Run `npx tsx scripts/seed-questions.ts` — 50 questions seeded
3. `npm run dev` — app starts on localhost:3000
4. Admin flow: login → create question → create assessment → add candidate → generate invite → copy link
5. Candidate flow: open invite link → start → answer questions → skip/revisit → submit → see score
6. Timer: start assessment → wait/refresh page → verify timer resumes from correct remaining time
7. Auto-submit: let timer expire → verify assessment auto-submits with saved answers
8. Duplicate prevention: try to re-open a completed invite link → verify it shows completion, not restart
9. `npm run build` — no build errors (Vercel deployment readiness)
