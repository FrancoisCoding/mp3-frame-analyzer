# MP3 Frame Analyzer — Design Spec

**Date:** 2026-03-30
**Status:** Reviewed and Implemented

## Overview

A TypeScript web application that accepts MP3 file uploads and returns the number of MPEG Version 1 Layer 3 frames in the file. Built with Hono (API) and React (frontend), deployable to Vercel with the option to deploy the API independently.

## Requirements

- POST endpoint at `/file-upload` accepting multipart MP3 uploads
- Returns JSON: `{ "frameCount": <number> }`
- Custom MP3 parser — no NPM packages for MP3 frame parsing
- MPEG Version 1 Layer 3 only (other formats out of scope)
- Polished React frontend with drag-and-drop upload, metadata display, and upload history
- API must be independently deployable without the frontend
- GitHub Actions CI pipeline with small and large file tests
- Vercel-ready deployment

## Architecture

### Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| API       | Hono + @hono/node-server            |
| Frontend  | React 19 + Vite + Tailwind + shadcn/ui |
| Testing   | Vitest                              |
| Linting   | ESLint + Prettier                   |
| CI        | GitHub Actions                      |
| Deploy    | Vercel (serverless + static)        |

### Project Structure

```
mp3-frame-analyzer/
├── api/
│   └── file-upload.ts            # Vercel serverless entry point
├── src/
│   ├── app/                      # React frontend
│   │   ├── components/
│   │   │   ├── UploadZone.tsx    # Drag-and-drop file upload
│   │   │   ├── ResultCard.tsx    # Frame count + metadata display
│   │   │   ├── UploadHistory.tsx # Past uploads list (localStorage)
│   │   │   └── Layout.tsx        # App shell with header/footer
│   │   ├── hooks/
│   │   │   └── useUploadHistory.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── server/
│   │   ├── index.ts              # Hono app definition + routes
│   │   └── server.ts             # Standalone server entry (node)
│   └── utils/                    # Reusable documented utilities
│       ├── mp3-parser.ts         # Core frame counting logic
│       ├── mp3-constants.ts      # Bitrate/sample rate lookup tables
│       ├── id3-reader.ts         # ID3v2 tag size detection + skip
│       ├── frame-header.ts       # 4-byte frame header decoder
│       └── validators.ts         # File type validation helpers
├── tests/
│   ├── unit/
│   │   ├── mp3-parser.test.ts
│   │   ├── frame-header.test.ts
│   │   ├── id3-reader.test.ts
│   │   └── validators.test.ts
│   └── integration/
│       └── file-upload.test.ts
├── fixtures/                     # Test MP3 files
│   └── sample.mp3                # Provided sample (1.4MB, verified at 6090 frames)
├── .github/workflows/
│   └── ci.yml
├── vercel.json
├── vite.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## MP3 Parser Design

### Frame Header Format (4 bytes)

```
Bits  [31-21]: Sync word (11 bits, all 1s = 0xFFE0)
Bits  [20-19]: MPEG version (11 = V1, 10 = V2, 00 = V2.5)
Bits  [18-17]: Layer (01 = Layer III, 10 = Layer II, 11 = Layer I)
Bit   [16]:    Protection (0 = CRC, 1 = none)
Bits  [15-12]: Bitrate index (lookup table)
Bits  [11-10]: Sample rate index (lookup table)
Bit   [9]:     Padding (1 = padded, 0 = not)
Bit   [8]:     Private bit
Bits  [7-6]:   Channel mode
Bits  [5-4]:   Mode extension
Bit   [3]:     Copyright
Bit   [2]:     Original
Bits  [1-0]:   Emphasis
```

### Parsing Algorithm

1. **Read buffer** from uploaded file
2. **Skip ID3v2 tag** if present (detect `"ID3"` magic bytes, parse syncsafe size)
3. **Enter scanning mode** — search for sync word (`0xFFE0` mask)
4. **Decode candidate header** — extract version, layer, bitrate, sample rate, padding
5. **Validate header** — must be MPEG V1 Layer III, bitrate index not 0/15, sample rate index not 3
6. **Consecutive frame validation** — calculate frame size, check if next position also has valid header. Require 2 consecutive valid frames to "lock on"
7. **Count frames** — once locked, count each valid frame and advance by calculated frame size
8. **Re-scan on break** — if sequence breaks (invalid header at expected position), re-enter scanning mode
9. **Return total count**

### Frame Size Calculation

```
frameSize = Math.floor(144 * bitrate / sampleRate) + padding
```

Where:
- `bitrate` is in bits/sec (from lookup table)
- `sampleRate` is in Hz (from lookup table)
- `padding` is 0 or 1

### MPEG1 Layer 3 Bitrate Table (kbps)

Index: 1=32, 2=40, 3=48, 4=56, 5=64, 6=80, 7=96, 8=112, 9=128, 10=160, 11=192, 12=224, 13=256, 14=320

### MPEG1 Sample Rate Table (Hz)

Index: 0=44100, 1=48000, 2=32000

## API Design

### `POST /file-upload`

**Request:** `multipart/form-data` with field name `file`

**Success response (200):**
```json
{ "frameCount": 6090 }
```

**Error responses:**

| Status | Condition              | Body                                                       |
|--------|------------------------|------------------------------------------------------------|
| 400    | No file in request     | `{ "error": "No file provided" }`                         |
| 400    | Not MP3 format         | `{ "error": "Invalid file type. Expected MP3 (MPEG1 Layer 3)" }` |
| 400    | No frames found        | `{ "error": "No valid MPEG1 Layer 3 frames found in file" }` |
| 500    | Unexpected error       | `{ "error": "Internal server error" }`                     |

**No server-side file size limit.** The API processes whatever it receives. Vercel's serverless payload limit (configurable up to 50MB in `vercel.json`) is the only hard constraint in that environment. Standalone Hono server has no limit.

## Frontend Design

**Implementation approach:** The frontend will be built using the `overdrive` skill to push the interface past conventional limits with technically ambitious visual treatments — shader effects, fluid animations, and high-fidelity interactions that make the dashboard feel like a professional audio analysis tool, not a basic upload form.

### Components

- **UploadZone:** Drag-and-drop area with click-to-browse fallback. Animated border with audio waveform visual effect on drag-over. Client-side validation: file type (.mp3) and size (50MB max, frontend only). Shows upload progress with animated waveform indicator.
- **ResultCard:** Displays frame count prominently with animated count-up effect, plus metadata extracted from the parser response: file name, file size. Card with depth and layered visual treatment.
- **UploadHistory:** List of previous analyses stored in localStorage. Shows filename, frame count, timestamp. Clearable. Staggered entrance animations on items.
- **Layout:** Dark-themed app shell with subtle gradient backgrounds, professional typography, and refined spacing. No emojis — strictly typographic and iconographic visual language.

### Design Principles

- Professional, tool-grade aesthetic — this should feel like audio engineering software
- Dark mode as the primary and only theme
- No emojis anywhere in the UI — use Lucide icons and typographic hierarchy instead
- Purposeful motion: animations communicate state changes, never decorative
- High contrast text for readability, muted secondary elements

### Tech

- React 19 with Vite
- Tailwind CSS v4
- shadcn/ui components (Card, Button, Progress, etc.)
- Lucide icons
- Framer Motion for orchestrated animations

## Deployment

### Vercel (Full Stack)

`vercel.json`:
- Rewrites `/file-upload` to `api/file-upload.ts` serverless function
- All other routes serve the Vite-built frontend
- `maxDuration` and `maxBodyLength` configured for larger files

### Standalone API

Run `npx tsx src/server/server.ts` — starts Hono on `@hono/node-server` without any frontend. Documented in README.

## CI Pipeline

### GitHub Actions — `ci.yml`

**Triggers:** Push to `main`, all PRs

**Jobs:**
1. **Lint, Format, and Type Check:** `eslint . && prettier --check ... && tsc --noEmit`
2. **Unit Tests:** Vitest on parser, header decoder, ID3 reader, validators
3. **Integration Tests:** Vitest on API endpoint with:
   - Small fixture (~10KB, programmatically generated, known frame count)
   - Large fixture (sample.mp3, 1.4MB, expected: 6090 frames)

### Test Fixtures

- `fixtures/sample.mp3` — provided 1.4MB sample (git LFS if needed)
- Small test fixtures generated in test setup or committed as tiny valid MP3s

## Evaluation Criteria Mapping

| Criterion       | How addressed                                                    |
|-----------------|------------------------------------------------------------------|
| Correctness     | Custom parser with consecutive frame validation, tested against known sample |
| Code Quality    | TypeScript strict mode, ESLint, Prettier, modular utils with JSDoc |
| Error Handling  | Typed error responses, graceful recovery from corrupt data        |
| Scalability     | Buffer-based parsing with offset tracking, no redundant copies    |
| Approach        | Atomic git commits, structured design-first methodology           |

## Review And Execution Notes

This spec was used before implementation, not after it. The working process was:

1. Capture requirements and constraints in a written design.
2. Expand that design into a task-by-task execution plan.
3. Review the plan before coding so missing assumptions could be corrected.
4. Execute only after the reviewed plan was approved.

The pre-execution review found one concrete issue: the Vercel deployment config
needed `maxBodyLength` so larger uploads would be accepted. That was corrected
before implementation continued.

One implementation-time correction also matters for readers of this spec: older
planning notes referenced `6089` frames for `sample.mp3`, but the verified
parser output is `6090` because the final parser counts all valid MPEG frames,
including the valid Xing frame.
