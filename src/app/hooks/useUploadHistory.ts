import { useEffect, useState } from 'react';

export interface IHistoryEntry {
  id: string;
  filename: string;
  fileSize: number;
  frameCount: number;
  timestamp: number;
}

interface IAddHistoryEntryInput {
  filename: string;
  fileSize: number;
  frameCount: number;
}

const STORAGE_KEY = 'mp3-analyzer-history';
const MAX_ENTRIES = 50;

function loadHistory(): IHistoryEntry[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const rawHistory = window.localStorage.getItem(STORAGE_KEY);
    const parsedHistory = rawHistory ? (JSON.parse(rawHistory) as IHistoryEntry[]) : [];

    return Array.isArray(parsedHistory) ? parsedHistory : [];
  } catch {
    return [];
  }
}

/** Stores and manages the recent MP3 analysis history in localStorage. */
export function useUploadHistory() {
  const [history, setHistory] = useState<IHistoryEntry[]>(() => loadHistory());

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  function addEntry(entry: IAddHistoryEntryInput) {
    setHistory((previousHistory) => {
      const nextEntry: IHistoryEntry = {
        ...entry,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      };

      return [nextEntry, ...previousHistory].slice(0, MAX_ENTRIES);
    });
  }

  function clearHistory() {
    setHistory([]);
  }

  return { history, addEntry, clearHistory };
}
