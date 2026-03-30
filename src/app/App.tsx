import { useState } from 'react';

import { Layout } from './components/Layout';
import { ResultCard } from './components/ResultCard';
import { UploadHistory } from './components/UploadHistory';
import { UploadZone } from './components/UploadZone';
import { useUploadHistory } from './hooks/useUploadHistory';

interface IAnalysisResult {
  frameCount: number;
  logicalFrameCount: number;
  filename: string;
  fileSize: number;
}

interface IUploadResponseBody {
  frameCount?: number;
  logicalFrameCount?: number;
  error?: string;
  code?: string;
}

async function readUploadResponse(response: Response): Promise<IUploadResponseBody | null> {
  const contentType = response.headers.get('content-type') ?? '';

  if (!contentType.includes('application/json')) {
    return null;
  }

  try {
    return (await response.json()) as IUploadResponseBody;
  } catch {
    return null;
  }
}

function getUploadErrorMessage(response: Response, body: IUploadResponseBody | null) {
  if (body?.code === 'NO_FILE_PROVIDED') {
    return 'Choose an MP3 file before starting the analysis.';
  }

  if (body?.code === 'INVALID_FILE_TYPE') {
    return 'Only MP3 files with MPEG1 Layer 3 audio are supported.';
  }

  if (body?.code === 'NO_VALID_MPEG1_LAYER3_FRAMES') {
    return 'This file was uploaded as MP3, but no readable MPEG1 Layer 3 frames were found.';
  }

  if (body?.code === 'INTERNAL_SERVER_ERROR') {
    return 'The server could not finish analyzing that file. Try again in a moment.';
  }

  if (body?.error) {
    return body.error;
  }

  if (response.status === 413) {
    return 'This web deployment only accepts uploads up to 4.5 MB. Run locally for larger files.';
  }

  if (response.status >= 500) {
    return 'The server failed while processing the upload. Try again in a moment.';
  }

  if (!response.ok) {
    return 'The analyzer could not process that upload.';
  }

  return null;
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
      const json = await readUploadResponse(response);
      const errorMessage = getUploadErrorMessage(response, json);

      if (
        errorMessage ||
        typeof json?.frameCount !== 'number' ||
        typeof json.logicalFrameCount !== 'number'
      ) {
        setError(errorMessage ?? 'The analyzer returned an unexpected response.');
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
      setError('Could not connect to the upload endpoint. Check that the API is running and try again.');
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
