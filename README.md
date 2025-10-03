# Customer Service Experiment UI

An application used to run the "customer service agent" research experiment. The app walks study participants through hardware checks, video training, and a realtime voice conversation powered by Pipecat/Daily, while surfacing a searchable knowledge base and returning a Prolific completion code when the session ends.

## Table of Contents

- [Overview](#overview)
- [Participant Flow](#participant-flow)
- [Key Features](#key-features)
- [Tech Stack & Integrations](#tech-stack--integrations)
- [Repository Tour](#repository-tour)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [Realtime Conversation Pipeline](#realtime-conversation-pipeline)
- [Knowledge Base Content](#knowledge-base-content)
- [Build & Quality Checks](#build--quality-checks)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Next Steps](#next-steps)

## Overview

The UI is the participant-facing layer of a customer support simulation. It captures Prolific metadata from the recruitment link, validates hardware, enforces that participants watch the appropriate tutorial, and then hands them over to an AI-assisted call experience. The conversation is brokered via Pipecat Cloud and Daily, while the page houses supporting resources like a markdown knowledge base and an AI advice stream.

## Participant Flow

1. **Landing (`/`)** - reads query string parameters (`PROLIFIC_PID`, `ADVICE_CONDITION`, etc.), stores them in `sessionStorage`, and invites the participant to continue.
2. **Hardware check (`/hardware-check`)** - tests microphone levels via the Web Audio API and plays a sample clip to confirm audio output. Routing to the next screen depends on the stored advice condition.
3. **Tutorial (`/tutorial-advice` or `/tutorial-no-advice`)** - participants must watch a gated training video; fast-forwarding is blocked until the video completes.
4. **Conversation (`/realtime`)** - displays two cards:
   - **Knowledge base** with full-text search and local caching.
   - **Interaction panel** hosting the Pipecat client UI (connect or disconnect, voice visualizer, live AI advice, completion code banner).

## Key Features

- Query-string metadata capture with session-scoped persistence.
- Hardware readiness checks (microphone visualizer, speaker playback).
- Tutorial gating with progress tracking and seeking guardrails.
- Realtime WebRTC session with Pipecat and Daily and automatic advice overlay.
- Server route (`POST /api/pipecat/start-session`) that exchanges the Pipecat agent token.
- Searchable markdown knowledge base with client-side caching and highlight.
- Prolific completion code display once the bot signals the session has been saved.
- Tailwind-based UI components (shadcn) with Radix primitives.

## Tech Stack & Integrations

- **Framework**: Next.js 15 (App Router) with React 19.
- **Styling**: Tailwind CSS 4 preview plus shadcn/ui component primitives.
- **Voice and RTC**: `@pipecat-ai/client-js` with the Daily transport.
- **Realtime events**: `@pipecat-ai/client-react` hooks and visualizers.
- **Utility libraries**: Radix UI, class-variance-authority, lucide-react, React Markdown.
- **Language tooling**: TypeScript strict mode, ESLint 9, Prettier.
- **Content**: Markdown knowledge base served from `/public/kb/guidelines.md`.

## Repository Tour

```
app/                   Next.js routes (landing, hardware check, tutorials, realtime)
  api/pipecat/...      Server action that starts Pipecat Cloud sessions
  realtime/...         Participant console with knowledge base plus voice UI
components/            Reusable UI (cards, pipecat client wrapper, buttons, etc.)
  cards/               Knowledge base and interaction shells
  pipecat/             Client provider, connect button, realtime widget
  ui/                  shadcn/ui component wrappers
lib/                   Config helpers (OpenAI client, Tailwind class combiner)
public/kb/             Markdown knowledge base served to participants
```

## Getting Started

### Prerequisites

- Node.js 20 (Next.js 15 requires >= 18.18; 20 LTS is recommended).
- `pnpm` 9.x (preferred) or `npm` or `yarn` if you update the lockfile.
- Access to a Pipecat Cloud agent configured with Daily transport credentials.
- Optional: OpenAI or Gemini keys if your agent or future server work will use them.

### Installation

```bash
pnpm install
# or
npm install
```

### Environment Variables

Create `.env.local` in the repo root (never commit secrets). Minimum configuration:

| Variable         | Required | Scope  | Description                                                                            |
| ---------------- | -------- | ------ | -------------------------------------------------------------------------------------- |
| `PCC_PUBLIC_KEY` | Yes      | Server | Pipecat Cloud public API key used to start sessions.                                   |
| `PCC_AGENT`      | Yes      | Server | Slug or identifier of the Pipecat agent to start (for example `pipecat-customer-lab`). |

Optional variables already scaffolded in `lib/config.ts` and `lib/openai.ts`:

| Variable              | Required | Scope  | Notes                                                              |
| --------------------- | -------- | ------ | ------------------------------------------------------------------ |
| `OPENAI_API_KEY`      | No       | Server | Needed only if you extend the backend to call OpenAI directly.     |
| `OPENAI_ORGANIZATION` | No       | Server | Optional OpenAI org slug.                                          |
| `OPENAI_PROJECT`      | No       | Server | Optional OpenAI project ID.                                        |
| `PIPECAT_API_URL`     | No       | Server | Override for Pipecat Cloud base URL if you use a different region. |
| `GEMINI_API_KEY`      | No       | Server | Placeholder for alternative LLM integrations.                      |

Tip: In production providers (Vercel, Fly, etc.) add the same variables through their dashboard; no `NEXT_PUBLIC_` prefix is used, so values stay server-side.

## Running Locally

```bash
pnpm dev
```

- Opens `http://localhost:3000`.
- Grant microphone permissions when prompted (required for the level meter and Pipecat client).
- Use a recruitment-style URL to pre-fill metadata, for example:
  ```
  http://localhost:3000/?PROLIFIC_PID=123&CIVILITY_MODE=baseline&ADVICE_CONDITION=advice&SCENARIO=lost-card
  ```
  The values are stored in `sessionStorage` and forwarded to the Pipecat session request.

## Realtime Conversation Pipeline

1. `ConnectButton` calls `client.connect()` from `@pipecat-ai/client-react`, pointing to `/api/pipecat/start-session`.
2. The API route forwards the POST body to `https://api.pipecat.daily.co/v1/public/{PCC_AGENT}/start` with the `PCC_PUBLIC_KEY`.
3. Pipecat Cloud returns a Daily room URL and token; the client joins the room via the Daily transport.
4. `useRTVIClientEvent` listens for:
   - `advice` messages -> displayed in the amber advice bubble.
   - `session_saved` or `terminate` -> disconnects the session and shows the Prolific completion code.
5. `PipecatClientAudio` plays inbound audio while `VoiceVisualizer` shows microphone activity.

Ensure your Pipecat agent emits the expected message types (`advice`, `session_saved`, `terminate`) so the UI reacts correctly.

## Knowledge Base Content

- Markdown lives at `public/kb/guidelines.md`.
- `KnowledgeBaseCard` caches the file in `localStorage` under `kb-guidelines-v1` for faster reloads.
- After editing the markdown, bump the `KB_KEY` constant in `KnowledgeBaseCard.tsx` to invalidate the cache.
- React Markdown plugins provide a generated table of contents, GitHub-flavored markdown, and slugged headings; inline `<mark>` tags highlight search hits.

## Build & Quality Checks

```bash
pnpm lint      # ESLint (includes Next.js and TypeScript rules)
pnpm build     # Creates the production build in .next
pnpm start     # Serves the production build locally
```

No automated tests ship with the project yet; consider adding integration tests around the conversation flow or mocking the Pipecat client for UI snapshot coverage.

## Deployment

### Recommended: Vercel

1. Connect the repository to Vercel.
2. Set the environment variables (`PCC_PUBLIC_KEY`, `PCC_AGENT`, optional OpenAI keys) for each environment.
3. Build command: `pnpm build`. Output directory: `.next`.
4. Ensure the project has access to the Daily domains required by Pipecat (Vercel already runs on HTTPS, which is required for microphone and WebRTC access).
5. After the first deploy, run through `https://your-app/` to confirm:
   - Microphone permissions appear.
   - Tutorial videos stream correctly from the configured storage bucket.
   - Pipecat sessions connect and terminate with the completion banner.

### Other Platforms

- Any Node hosting platform that supports Next.js 15 (Node >= 18.18) works.
- If deploying behind a proxy, keep `/api/pipecat/start-session` reachable over HTTPS.
- When self-hosting, back your `.env` with a secrets manager and provide HTTPS certificates (WebRTC and microphone APIs require secure origins).

## Troubleshooting

- **403 or 401 from `/api/pipecat/start-session`** - verify `PCC_PUBLIC_KEY` and `PCC_AGENT`, and that the agent is marked public in Pipecat Cloud.
- **Microphone meter stuck at zero** - confirm the browser granted permission and that you are serving over HTTPS (except on `localhost`).
- **Advice bubble never shows** - check that your agent emits a `ServerMessage` with `type: "advice"` and a `payload.text`.
- **Completion banner missing** - ensure the agent sends `session_saved` or `terminate` events with an optional `payload.code`.
- **Out-of-date knowledge base** - clear browser storage or bump the `KB_KEY` constant before shipping the updated markdown.

## Experimental Usage

Route to the frontend via the Qualtrics questionnaire. The URL should be constructed as follows:

```
https://el-ui-lab.vercel.app/?PROLIFIC_PID=test-user&CIVILITY_MODE=uncivil&SCENARIO=lost_card&ADVICE_CONDITION=process
```

The values are stored in `sessionStorage` and forwarded to the Pipecat session request.

In Qualtrics, the structure should be as follows:

```
https://el-ui-lab.vercel.app/?PROLIFIC_PID={e://Field/PROLIFIC_PID}&CIVILITY_MODE={e://Field/CIVILITY_MODE}&SCENARIO={e://Field/SCENARIO}&ADVICE_CONDITION={e://Field/ADVICE_CONDITION}
```
