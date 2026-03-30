import { AnimatePresence, motion } from 'framer-motion';
import { Clock3, Eraser, History, RadioTower } from 'lucide-react';

import type { IHistoryEntry } from '../hooks/useUploadHistory';

interface IUploadHistoryProps {
  entries: IHistoryEntry[];
  onClear: () => void;
}

function formatFileSize(size: number) {
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  }

  if (size >= 1024) {
    return `${Math.round(size / 1024)} KB`;
  }

  return `${size} B`;
}

function formatTimestamp(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(timestamp);
}

/** Displays recent analyses stored on the client with clear and empty states. */
export function UploadHistory({ entries, onClear }: IUploadHistoryProps) {
  function handleClear() {
    if (entries.length === 0) {
      return;
    }

    if (window.confirm('Clear the local upload history for this browser?')) {
      onClear();
    }
  }

  return (
    <section className="rounded-[2rem] border border-[var(--line-strong)] bg-[var(--panel)] p-6 shadow-[0_24px_64px_rgba(0,0,0,0.22)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line-soft)] bg-white/5 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[var(--text-soft)]">
            <History className="h-3.5 w-3.5 text-[var(--accent-cool)]" />
            Upload History
          </div>
          <h2 className="mt-4 font-[var(--font-display)] text-[clamp(1.6rem,2.6vw,2.6rem)] leading-none tracking-[-0.04em] text-[var(--text-strong)]">
            Recent analysis passes
          </h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Stored in local browser state for quick reference while you compare multiple files.
          </p>
        </div>

        <button
          className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--line-soft)] px-4 py-2.5 text-sm font-medium text-[var(--text-muted)] transition hover:border-[rgba(255,131,104,0.4)] hover:text-[rgb(255,205,193)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-warm)]"
          type="button"
          onClick={handleClear}
        >
          <Eraser className="h-4 w-4" />
          Clear history
        </button>
      </div>

      <AnimatePresence mode="popLayout">
        {entries.length === 0 ? (
          <motion.div
            key="empty-history"
            className="mt-6 rounded-[1.6rem] border border-dashed border-[var(--line-soft)] bg-[var(--panel-muted)] px-5 py-8"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--line-soft)] bg-[var(--surface-900)]">
                <RadioTower className="h-4 w-4 text-[var(--accent-cool)]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--text-strong)]">
                  No uploads recorded yet.
                </p>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">
                  Analyze a file and the console will keep a local history with filenames, frame
                  counts, and timestamps for later comparison.
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="history-list"
            className="mt-6 grid gap-3"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.06,
                },
              },
            }}
          >
            {entries.map((entry) => (
              <motion.article
                key={entry.id}
                className="group rounded-[1.5rem] border border-[var(--line-soft)] bg-[var(--panel-muted)] px-4 py-4 transition hover:border-[var(--line-strong)]"
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--text-strong)]">
                      {entry.filename}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs uppercase tracking-[0.18em] text-[var(--text-soft)]">
                      <span>{formatFileSize(entry.fileSize)}</span>
                      <span>•</span>
                      <span>{entry.frameCount.toLocaleString()} frames</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="rounded-full border border-[var(--line-soft)] px-3 py-1 text-xs uppercase tracking-[0.18em] text-[var(--accent-cool)] opacity-70 transition group-hover:opacity-100">
                      Cached
                    </div>
                    <div className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)]">
                      <Clock3 className="h-4 w-4" />
                      {formatTimestamp(entry.timestamp)}
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
