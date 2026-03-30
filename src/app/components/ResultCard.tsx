import { useEffect, useState } from 'react';

import { animate, motion } from 'framer-motion';
import { Binary, FileAudio, HardDriveDownload, Layers3 } from 'lucide-react';

interface IResultCardProps {
  result: {
    frameCount: number;
    logicalFrameCount: number;
    filename: string;
    fileSize: number;
  };
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

/** Presents the current analysis result with count-up animation and metadata. */
export function ResultCard({ result }: IResultCardProps) {
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    const controls = animate(0, result.frameCount, {
      duration: 1.15,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(value) {
        setDisplayCount(Math.round(value));
      },
    });

    return () => controls.stop();
  }, [result.frameCount]);

  return (
    <motion.section
      className="relative overflow-hidden rounded-[2rem] border border-[var(--line-strong)] bg-[var(--panel)] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.24)]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,176,68,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(67,173,172,0.16),transparent_34%)]" />
      <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line-soft)] bg-white/5 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[var(--text-soft)]">
            <Layers3 className="h-3.5 w-3.5 text-[var(--accent-cool)]" />
            Analysis Result
          </div>

          <p className="mt-5 text-[0.72rem] uppercase tracking-[0.26em] text-[var(--text-soft)]">
            Requirement count (Xing style)
          </p>
          <div className="mt-3 flex flex-wrap items-end gap-4">
            <div className="font-[var(--font-display)] text-[clamp(3.4rem,10vw,7rem)] leading-none tracking-[-0.08em] text-[var(--text-strong)]">
              {displayCount.toLocaleString()}
            </div>
            <div className="pb-2 text-sm text-[var(--text-muted)]">
              Matches tools that report the Xing metadata frame count.
            </div>
          </div>
        </div>

        <motion.div
          className="grid gap-3"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.08,
              },
            },
          }}
        >
          {[
            {
              label: 'Filename',
              value: result.filename,
              icon: FileAudio,
            },
            {
              label: 'Upload Size',
              value: formatFileSize(result.fileSize),
              icon: HardDriveDownload,
            },
            {
              label: 'Full Stream Count',
              value: result.logicalFrameCount.toLocaleString(),
              icon: Layers3,
            },
            {
              label: 'Frame Density',
              value: `${Math.max(1, Math.round(result.logicalFrameCount / Math.max(1, result.fileSize / 1024)))} per KB`,
              icon: Binary,
            },
          ].map((item) => (
            <motion.div
              key={item.label}
              className="rounded-[1.5rem] border border-[var(--line-soft)] bg-[var(--panel-muted)] px-4 py-4"
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--line-soft)] bg-[var(--surface-900)]">
                  <item.icon className="h-4 w-4 text-[var(--accent-cool)]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[var(--text-soft)]">
                    {item.label}
                  </p>
                  <p className="mt-2 truncate text-sm font-medium text-[var(--text-strong)]">
                    {item.value}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
