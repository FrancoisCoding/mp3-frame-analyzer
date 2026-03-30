import { useState } from 'react';

import { Layout } from './components/Layout';
import { ResultCard } from './components/ResultCard';
import { UploadHistory } from './components/UploadHistory';
import { UploadZone } from './components/UploadZone';
import { useUploadHistory } from './hooks/useUploadHistory';

interface IAnalysisResult {
  frameCount: number;
  filename: string;
  fileSize: number;
}

/** Renders the MP3 analyzer workflow, current result, and local history. */
export function App() {
  const [result, setResult] = useState<IAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { history, addEntry, clearHistory } = useUploadHistory();

  async function handleUpload(file: File) {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/file-upload', {
        method: 'POST',
        body: formData,
      });
      const json = (await response.json()) as {
        frameCount?: number;
        error?: string;
      };

      if (!response.ok || typeof json.frameCount !== 'number') {
        setError(json.error ?? 'The analyzer could not process that upload.');
        return;
      }

      const nextResult: IAnalysisResult = {
        frameCount: json.frameCount,
        filename: file.name,
        fileSize: file.size,
      };

      setResult(nextResult);
      addEntry(nextResult);
    } catch {
      setError('Failed to reach the upload endpoint.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <UploadZone isLoading={isLoading} onUpload={handleUpload} />
        {error ? (
          <div className="rounded-[1.5rem] border border-[rgba(255,131,104,0.32)] bg-[rgba(112,34,24,0.32)] px-4 py-4 text-sm text-[rgb(255,205,193)]">
            {error}
          </div>
        ) : null}
        {result ? <ResultCard result={result} /> : null}
        <UploadHistory entries={history} onClear={clearHistory} />
      </div>
    </Layout>
  );
}
