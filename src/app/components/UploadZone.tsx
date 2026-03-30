import { useEffect, useId, useRef, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, ArrowUp, AudioLines, FileAudio, LoaderCircle } from 'lucide-react';

interface IUploadZoneProps {
  onUpload: (file: File) => Promise<void>;
  isLoading: boolean;
}

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

function formatFileSize(size: number) {
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (size >= 1024) {
    return `${Math.round(size / 1024)} KB`;
  }

  return `${size} B`;
}

function getValidationError(file: File) {
  const isMp3ByType = file.type === 'audio/mpeg' || file.type === 'audio/mp3';
  const isMp3ByName = file.name.toLowerCase().endsWith('.mp3');

  if (!isMp3ByType && !isMp3ByName) {
    return 'Only MP3 files are accepted by this analyzer.';
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return 'This upload exceeds the 50 MB client-side limit.';
  }

  return null;
}

/** Handles drag-and-drop uploads with client-side validation and animated feedback. */
export function UploadZone({ onUpload, isLoading }: IUploadZoneProps) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragDepthRef = useRef(0);
  const [progressValue, setProgressValue] = useState(0);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading) {
      setProgressValue(100);
      const timeout = window.setTimeout(() => setProgressValue(0), 380);
      return () => window.clearTimeout(timeout);
    }

    setProgressValue(10);

    const interval = window.setInterval(() => {
      setProgressValue((currentValue) => {
        if (currentValue >= 92) {
          return currentValue;
        }

        return currentValue + Math.max(2, Math.round((92 - currentValue) * 0.14));
      });
    }, 160);

    return () => window.clearInterval(interval);
  }, [isLoading]);

  async function handleFileSelection(file: File | null) {
    if (!file) {
      return;
    }

    const nextValidationError = getValidationError(file);
    setSelectedFileName(file.name);
    setValidationError(nextValidationError);

    if (nextValidationError) {
      return;
    }

    await onUpload(file);
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.9fr)]">
      <motion.div
        className="relative overflow-hidden rounded-[2rem] border border-[var(--line-strong)] bg-[var(--panel)] p-1 shadow-[0_28px_80px_rgba(0,0,0,0.28)]"
        animate={{
          scale: isDragging ? 1.01 : 1,
          boxShadow: isDragging
            ? '0 32px 90px rgba(67, 173, 172, 0.24)'
            : '0 28px 80px rgba(0, 0, 0, 0.28)',
        }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-90"
          animate={{
            background: isDragging
              ? [
                  'linear-gradient(125deg, rgba(67,173,172,0.64), rgba(255,176,68,0.18), rgba(67,173,172,0.64))',
                  'linear-gradient(205deg, rgba(67,173,172,0.64), rgba(255,176,68,0.24), rgba(67,173,172,0.64))',
                ]
              : [
                  'linear-gradient(125deg, rgba(67,173,172,0.18), rgba(255,176,68,0.08), rgba(67,173,172,0.18))',
                  'linear-gradient(205deg, rgba(67,173,172,0.18), rgba(255,176,68,0.12), rgba(67,173,172,0.18))',
                ],
          }}
          transition={{ duration: 3.2, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
        />

        <div
          className="relative rounded-[calc(2rem-4px)] bg-[linear-gradient(180deg,rgba(10,14,22,0.96),rgba(13,19,28,0.94))] p-6 sm:p-8"
          onDragEnter={(event) => {
            event.preventDefault();
            dragDepthRef.current += 1;
            setIsDragging(true);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={(event) => {
            event.preventDefault();
            dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
            setIsDragging(dragDepthRef.current > 0);
          }}
          onDrop={async (event) => {
            event.preventDefault();
            dragDepthRef.current = 0;
            setIsDragging(false);
            const droppedFile = event.dataTransfer.files?.[0] ?? null;
            await handleFileSelection(droppedFile);
          }}
        >
          <input
            ref={fileInputRef}
            id={inputId}
            accept=".mp3,audio/mpeg"
            className="sr-only"
            type="file"
            onChange={async (event) => {
              await handleFileSelection(event.target.files?.[0] ?? null);
              event.target.value = '';
            }}
          />

          <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_15rem]">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line-soft)] bg-white/5 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[var(--text-soft)]">
                  <AudioLines className="h-3.5 w-3.5 text-[var(--accent-cool)]" />
                  Input Deck
                </div>
                <div>
                  <h2 className="font-[var(--font-display)] text-[clamp(1.8rem,3vw,3rem)] leading-none tracking-[-0.05em] text-[var(--text-strong)]">
                    Drop an MP3 into the console.
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-muted)] sm:text-base">
                    The parser locks onto valid consecutive MPEG1 Layer III frames, skips ID3v2
                    headers, and returns a clean logical frame count.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-[var(--line-soft)] bg-white/4 px-4 py-4">
                  <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[var(--text-soft)]">
                    Accepted
                  </p>
                  <p className="mt-2 text-sm font-medium text-[var(--text-strong)]">.mp3 audio</p>
                </div>
                <div className="rounded-2xl border border-[var(--line-soft)] bg-white/4 px-4 py-4">
                  <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[var(--text-soft)]">
                    Frontend Cap
                  </p>
                  <p className="mt-2 text-sm font-medium text-[var(--text-strong)]">50 MB</p>
                </div>
                <div className="rounded-2xl border border-[var(--line-soft)] bg-white/4 px-4 py-4">
                  <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[var(--text-soft)]">
                    Output
                  </p>
                  <p className="mt-2 text-sm font-medium text-[var(--text-strong)]">
                    Logical frame count
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--accent-cool)] px-5 py-3 text-sm font-semibold text-[var(--surface-950)] transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cool)]"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ArrowUp className="h-4 w-4" />
                  Choose MP3
                </button>
                <label
                  className="inline-flex cursor-pointer items-center justify-center rounded-full border border-[var(--line-soft)] px-5 py-3 text-sm font-medium text-[var(--text-muted)] transition hover:border-[var(--line-strong)] hover:text-[var(--text-strong)]"
                  htmlFor={inputId}
                >
                  Browse local file
                </label>
              </div>
            </div>

            <div className="flex min-h-[18rem] flex-col justify-between rounded-[1.75rem] border border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-[0.68rem] uppercase tracking-[0.24em] text-[var(--text-soft)]">
                  <span>Signal Bed</span>
                  <span>{isLoading ? 'Analyzing' : isDragging ? 'Drag Active' : 'Idle'}</span>
                </div>
                <div className="flex h-28 items-end gap-1 overflow-hidden rounded-2xl border border-[var(--line-soft)] bg-[var(--surface-900)] px-3 py-4">
                  {Array.from({ length: 28 }, (_, index) => (
                    <motion.span
                      key={index}
                      className="wave-bar origin-bottom rounded-full bg-[linear-gradient(180deg,var(--accent-warm),var(--accent-cool))]"
                      animate={{
                        scaleY: isLoading
                          ? [0.45, 1, 0.38, 0.92]
                          : isDragging
                            ? [0.22, 0.86, 0.48, 1]
                            : [0.18, 0.58, 0.26, 0.72],
                        opacity: isDragging ? 1 : 0.78,
                      }}
                      transition={{
                        duration: isLoading ? 0.82 : 1.8,
                        repeat: Number.POSITIVE_INFINITY,
                        delay: index * 0.04,
                        ease: 'easeInOut',
                      }}
                      style={{ height: `${38 + ((index * 13) % 56)}%` }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-[var(--text-muted)]">
                  <span>{selectedFileName ?? 'No file selected yet'}</span>
                  <span>{progressValue > 0 ? `${progressValue}%` : 'Ready'}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/8">
                  <motion.div
                    className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent-cool),var(--accent-warm))]"
                    animate={{ width: progressValue > 0 ? `${progressValue}%` : '0%' }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {validationError ? (
              <motion.div
                key="validation-error"
                className="mt-6 flex items-start gap-3 rounded-2xl border border-[rgba(255,131,104,0.32)] bg-[rgba(112,34,24,0.36)] px-4 py-3 text-sm text-[rgb(255,205,193)]"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{validationError}</span>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="upload-loading"
                className="mt-6 flex items-center gap-3 rounded-2xl border border-[var(--line-soft)] bg-white/4 px-4 py-3 text-sm text-[var(--text-muted)]"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <LoaderCircle className="h-4 w-4 animate-spin text-[var(--accent-cool)]" />
                Running frame sequence verification on the uploaded stream.
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </motion.div>

      <aside className="grid gap-4">
        <div className="rounded-[1.75rem] border border-[var(--line-soft)] bg-[var(--panel-muted)] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--line-soft)] bg-[var(--surface-900)]">
              <FileAudio className="h-5 w-5 text-[var(--accent-cool)]" />
            </div>
            <div>
              <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[var(--text-soft)]">
                Queue Notes
              </p>
              <p className="mt-1 text-sm text-[var(--text-strong)]">
                Drag one file at a time for clean frame reports.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-[var(--line-soft)] bg-[var(--panel-muted)] p-5">
          <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[var(--text-soft)]">
            Validation Rules
          </p>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--text-muted)]">
            <li>Rejects non-MP3 uploads before they hit the API.</li>
            <li>Caps browser-side uploads at {formatFileSize(MAX_FILE_SIZE_BYTES)}.</li>
            <li>Hands server errors back into the main console without reloads.</li>
          </ul>
        </div>
      </aside>
    </section>
  );
}
