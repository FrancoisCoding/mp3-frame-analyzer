# MP3 Frame Analyzer

MP3 Frame Analyzer is a TypeScript full-stack app that accepts MP3 uploads and
returns the MPEG Version 1 Layer 3 frame count. It ships with a Hono API, a
Vite/React frontend, and a deployment path for Vercel or standalone Node use.

## What It Does

- Accepts `multipart/form-data` uploads at `POST /file-upload`
- Validates likely MP3 input before parsing
- Skips ID3v2 tags at the start of a file
- Decodes MPEG1 Layer III frame headers and validates frame sequences
- Returns a logical frame count for the upload
- Stores recent browser-side analyses in local history

For the included `fixtures/sample.mp3`, the current parser returns `6090`
frames because it counts all valid MPEG frames, including the Xing frame.

## Stack

- API: Hono, `@hono/node-server`
- Frontend: React 19, Vite, Tailwind CSS v4, Framer Motion
- Testing: Vitest
- Tooling: TypeScript, ESLint, Prettier
- Deployment: Vercel, GitHub Actions

## Planning And Review Workflow

This repository now includes the planning artifacts that were used before
implementation started:

- `docs/superpowers/specs/2026-03-30-mp3-frame-analyzer-design.md`
- `docs/superpowers/plans/2026-03-30-mp3-frame-analyzer.md`

The workflow was intentionally design-first:

1. Requirements, constraints, expected behavior, deployment targets, and UI
   goals were written down in a design spec before code execution started.
2. That design was expanded into an implementation plan with explicit tasks,
   verification steps, and commit boundaries.
3. The plan was reviewed before execution. The review surfaced a deployment
   issue: `vercel.json` needed `maxBodyLength`, and that was fixed before
   proceeding.
4. Implementation then executed against the reviewed plan rather than relying
   on ad hoc coding decisions.

The purpose of keeping these docs in-repo is to show that the AI did not jump
straight into code. It first worked from reviewed written requirements so the
API contract, parser behavior, frontend scope, CI expectations, and deployment
details were clarified up front.

That up-front clarification stage is where open questions, assumptions, and
implementation details were supposed to be surfaced and resolved before the AI
started executing the plan.

## API

### `POST /file-upload`

Send a `multipart/form-data` request with a `file` field.

Success response:

```json
{
  "frameCount": 6090
}
```

Error responses:

```json
{
  "error": "No file provided"
}
```

```json
{
  "error": "Invalid file type. Expected MP3 (MPEG1 Layer 3)"
}
```

```json
{
  "error": "No valid MPEG1 Layer 3 frames found in file"
}
```

Example with `curl`:

```bash
curl -X POST -F "file=@fixtures/sample.mp3" http://localhost:3001/file-upload
```

## How The Parser Works

The parser reads the upload into a buffer, skips any leading ID3v2 tag, scans
for a valid MPEG sync word, decodes candidate headers, and verifies that a
candidate frame is followed by another valid frame at the expected offset. Once
it locks onto a valid sequence, it advances frame-by-frame until the sequence
breaks, then resumes scanning.

Frame size is computed with:

```text
frameSize = floor(144 * bitrate / sampleRate) + padding
```

## Development

Install dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

Start the standalone API server:

```bash
npm run dev:server
```

Run the production-style standalone API:

```bash
npm start
```

Build the frontend bundle:

```bash
npm run build
```

## Testing And Quality Checks

Run the full test suite:

```bash
npm test
```

Run linting:

```bash
npm run lint
```

Run type-checking:

```bash
npm run typecheck
```

Run formatting checks:

```bash
npm run format:check
```

## Deployment

### Vercel Full-Stack Deployment

The included `vercel.json` builds the Vite frontend and rewrites
`/file-upload` to the Vercel function in `api/file-upload.ts`. The function is
configured with a `30` second max duration and a `50 MB` body limit.

### API-Only Deployment

If you only need the API, run:

```bash
npm start
```

That launches `src/server/server.ts` with `@hono/node-server` on port `3001` by
default.

## Project Structure

```text
api/
  file-upload.ts
src/
  app/
    components/
    hooks/
    App.tsx
    index.css
    main.tsx
  server/
    index.ts
    server.ts
  utils/
    frame-header.ts
    id3-reader.ts
    mp3-constants.ts
    mp3-parser.ts
    validators.ts
tests/
  integration/
  unit/
fixtures/
  sample.mp3
```

## Utility Modules

`src/utils/mp3-parser.ts` is the orchestration layer. It skips ID3v2 metadata,
scans for candidate frame headers, performs consecutive-frame validation, and
returns the final frame count.

`src/utils/frame-header.ts` decodes a 4-byte MPEG frame header into bitrate,
sample rate, padding, and computed frame size. It rejects non-MPEG1 and
non-Layer-III headers.

`src/utils/id3-reader.ts` detects an ID3v2 header at the start of the file and
parses its syncsafe size field so the parser can skip metadata cleanly.

`src/utils/validators.ts` provides a shallow buffer check used by the API to
quickly reject clearly invalid uploads before full parsing.

`src/utils/mp3-constants.ts` contains the MPEG1 Layer III bitrate table, the
sample rate table, and the parsing constants shared across the parser helpers.

## CI

GitHub Actions runs:

- lint, formatting, and type-check
- unit tests
- integration tests
