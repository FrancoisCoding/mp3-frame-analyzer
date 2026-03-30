import { useState } from 'react';

import { Layout } from './components/Layout';
import { ResultCard } from './components/ResultCard';
import { UploadHistory } from './components/UploadHistory';
import { UploadZone } from './components/UploadZone';
import { useUploadHistory } from './hooks/useUploadHistory';
import {
  getUploadErrorFeedback,
  getUploadNetworkFeedback,
  readUploadResponse,
} from './upload-feedback';

interface IAnalysisResult {
  frameCount: number;
  logicalFrameCount: number;
  filename: string;
  fileSize: number;
}

/** Renders the MP3 analyzer workflow, current result, and local history. */
export function App() {
  const [result, setResult] = useState<IAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ title: string; detail: string } | null>(null);
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
      const json = await readUploadResponse(response);
      const errorFeedback = getUploadErrorFeedback(response, json);

      if (
        errorFeedback ||
        typeof json?.frameCount !== 'number' ||
        typeof json.logicalFrameCount !== 'number'
      ) {
        setError(
          errorFeedback ?? {
            title: 'Unexpected upload response',
            detail: 'The analyzer returned an unexpected response. Try the upload again.',
          },
        );
        return;
      }

      const nextResult: IAnalysisResult = {
        frameCount: json.frameCount,
        logicalFrameCount: json.logicalFrameCount,
        filename: file.name,
        fileSize: file.size,
      };

      setResult(nextResult);
      addEntry(nextResult);
    } catch {
      setError(getUploadNetworkFeedback());
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <UploadZone isLoading={isLoading} onUpload={handleUpload} />
        {error ? (
          <div
            aria-live="polite"
            className="rounded-[1.5rem] border border-[rgba(255,131,104,0.32)] bg-[rgba(112,34,24,0.32)] px-4 py-4 text-[rgb(255,205,193)]"
          >
            <p className="text-sm font-semibold text-[rgb(255,227,220)]">{error.title}</p>
            <p className="mt-1 text-sm text-[rgb(255,205,193)]">{error.detail}</p>
          </div>
        ) : null}
        {result ? <ResultCard result={result} /> : null}
        <UploadHistory entries={history} onClear={clearHistory} />
      </div>
    </Layout>
  );
}
