import type { ReactNode } from 'react';

import { motion } from 'framer-motion';
import { AudioLines, GaugeCircle, Waves } from 'lucide-react';

interface ILayoutProps {
  children: ReactNode;
}

/** Wraps the analyzer in a studio-inspired application shell. */
export function Layout({ children }: ILayoutProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--surface-950)] text-[var(--text-strong)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(circle_at_top,rgba(67,173,172,0.16),transparent_58%)]" />
        <div className="absolute right-[-14rem] top-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(255,176,68,0.18),transparent_68%)] blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] opacity-20" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,16,24,0)_0%,rgba(11,16,24,0.72)_100%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <motion.header
          className="rounded-[2rem] border border-white/8 bg-white/6 px-5 py-4 backdrop-blur-xl"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--line-strong)] bg-[var(--surface-900)] shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_16px_32px_rgba(0,0,0,0.28)]">
                <AudioLines className="h-5 w-5 text-[var(--accent-cool)]" />
              </div>
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line-soft)] bg-[var(--surface-900)] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[var(--text-soft)]">
                  <Waves className="h-3.5 w-3.5 text-[var(--accent-warm)]" />
                  Precision Console
                </div>
                <div>
                  <h1 className="font-[var(--font-display)] text-[clamp(2rem,4vw,3.8rem)] leading-none tracking-[-0.05em] text-[var(--text-strong)]">
                    MP3 Frame Analyzer
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)] sm:text-base">
                    Inspect MPEG Version 1 Layer 3 uploads with a studio-grade interface built for
                    fast verification, clean error handling, and repeat analysis.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-[var(--line-soft)] bg-[var(--surface-900)] px-4 py-3">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-[var(--text-soft)]">
                  <GaugeCircle className="h-3.5 w-3.5 text-[var(--accent-cool)]" />
                  Parser Scope
                </div>
                <p className="mt-2 text-sm font-medium text-[var(--text-strong)]">
                  MPEG1 Layer III only
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--line-soft)] bg-[var(--surface-900)] px-4 py-3">
                <div className="text-xs uppercase tracking-[0.24em] text-[var(--text-soft)]">
                  Frontend Guardrail
                </div>
                <p className="mt-2 text-sm font-medium text-[var(--text-strong)]">
                  4.5 MB Vercel upload cap
                </p>
              </div>
            </div>
          </div>
        </motion.header>

        <main className="flex-1 py-6 sm:py-8">{children}</main>

        <footer className="mt-8 flex flex-col gap-3 border-t border-white/8 px-2 py-5 text-sm text-[var(--text-soft)] sm:flex-row sm:items-center sm:justify-between">
          <p>Counts logical MPEG audio frames, including valid metadata-side Xing frames.</p>
          <p>Built for local analysis, API deployment, and repeatable verification.</p>
        </footer>
      </div>
    </div>
  );
}
