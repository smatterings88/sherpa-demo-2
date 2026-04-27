# GoHighLevel (GHL) demo contact tagging — Sherpa Alex Demo

This repo tracks **two demo lifecycle moments** in GoHighLevel using the **HighLevel REST API v1**:

1. **Transcript submitted** → tag: `sherpa demo--> submitted transcript`
2. **Voice/test call successfully started** → tag: `sherpa demo--> did test call`

All GHL calls are **server-only** (Vercel functions). The browser never receives `GHL_API_KEY`.

## Required environment variables

Set these in **Vercel → Project → Settings → Environment Variables** for **Production** (and Preview/Development if you test there):

- `GHL_API_KEY`
- `GHL_LOCATION_ID`

Also add them to local `.env` for local API testing (never prefix with `VITE_`).

After changing env vars: **redeploy** the Vercel project.

## Where tagging fires

### 1) Transcript submission

**Route:** `POST /api/demo/submit` (`api/demo/submit.ts`)

**When:** After the demo session is successfully written to KV (transcript exists or audio transcription succeeded).

**What it does:**

- `safeTrackGhlDemoTag({ email, name, tag: SUBMITTED_TRANSCRIPT, context: "demo_transcript_submission" })`

**Non-blocking:** If GHL is missing/misconfigured or GHL errors, the submit response still succeeds.

**Preview-only debug field:** When `VERCEL_ENV !== "production"`, the JSON response may include:

- `ghlTracking: { ok, skipped, reason?, tagAction? }`

This is intentionally **not** included in production responses.

### 2) Voice call started

**Route:** `POST /api/demo/ultravox-session` (`api/demo/ultravox-session.ts`)

**When:** After Ultravox returns a successful call payload containing `joinUrl` (call creation succeeded).

**What it does:**

- Reads `email` + `name` from the KV demo session (`/api/demo/submit` stores these fields).
- `safeTrackGhlDemoTag({ email, name, tag: DID_TEST_CALL, context: "demo_voice_call_started" })`

**Non-blocking:** If GHL fails, the Ultravox response still returns normally.

**Preview-only debug field:** Same `ghlTracking` pattern as submit (non-production only).

## Exact tag strings

- `sherpa demo--> submitted transcript`
- `sherpa demo--> did test call`

## How duplicate tags are avoided

The server:

1. Searches for a contact by email (`GET /v1/contacts/?query=...`) and prefers an **exact email match**.
2. Creates the contact if missing (`POST /v1/contacts/`).
3. Adds tags using a **merge-safe** strategy:
   - Preferred: `PUT /v1/contacts/:id` with a merged `tags` array (fetched first to avoid wiping tags).
   - Fallback: `POST /v1/contacts/:id/tags` if the PUT tag merge is rejected by GHL.

## Manual testing

### Option A: npm script (recommended)

1. Set `GHL_API_KEY` + `GHL_LOCATION_ID` in your shell environment.
2. Run:

```bash
npm run test:ghl-demo
```

The script prints only: `contactId`, `contactCreated`, `tag`, `tagAction` (no API key).

### Option B: exercise the real demo endpoints

1. Submit a transcript via `POST /api/demo/submit` with a real email.
2. Start a voice session via `POST /api/demo/ultravox-session` with the returned `sid`.

## Operational notes

- GHL failures must **never** block the demo funnel.
- Server logs must **not** include transcript text, API keys, or Authorization headers.
