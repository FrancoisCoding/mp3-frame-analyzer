export interface IUploadResponseBody {
  frameCount?: number;
  logicalFrameCount?: number;
  error?: string;
  code?: string;
}

export interface IUploadFeedback {
  title: string;
  detail: string;
}

export async function readUploadResponse(response: Response): Promise<IUploadResponseBody | null> {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    try {
      return (await response.json()) as IUploadResponseBody;
    } catch {
      return null;
    }
  }

  try {
    const bodyText = await response.text();

    if (!bodyText.trim()) {
      return null;
    }

    return JSON.parse(bodyText) as IUploadResponseBody;
  } catch {
    return null;
  }
}

export function getUploadErrorFeedback(
  response: Response,
  body: IUploadResponseBody | null,
): IUploadFeedback | null {
  if (body?.code === 'NO_FILE_PROVIDED') {
    return {
      title: 'No file selected',
      detail: 'Choose an MP3 file before starting the analysis.',
    };
  }

  if (body?.code === 'INVALID_FILE_TYPE') {
    return {
      title: 'Unsupported file type',
      detail: 'Only MP3 files with MPEG1 Layer 3 audio are supported.',
    };
  }

  if (body?.code === 'NO_VALID_MPEG1_LAYER3_FRAMES') {
    return {
      title: 'No MPEG frames found',
      detail: 'This file was uploaded as MP3, but no readable MPEG1 Layer 3 frames were found.',
    };
  }

  if (body?.code === 'INTERNAL_SERVER_ERROR') {
    return {
      title: 'Analysis failed on the server',
      detail: 'The server could not finish analyzing that file. Try again in a moment.',
    };
  }

  if (body?.error) {
    return {
      title: 'Upload rejected',
      detail: body.error,
    };
  }

  if (response.status === 413) {
    return {
      title: 'File too large for this web app',
      detail: 'This web deployment only accepts uploads up to 4.5 MB. Run locally for larger files.',
    };
  }

  if (response.status === 404 || response.status === 405) {
    return {
      title: 'Upload route unavailable',
      detail: 'This deployment is missing the file upload endpoint.',
    };
  }

  if (response.status === 429) {
    return {
      title: 'Too many upload attempts',
      detail: 'The server is rate limiting requests. Wait a moment and try again.',
    };
  }

  if (response.status >= 500) {
    return {
      title: 'Server error during analysis',
      detail: 'The server failed while processing the upload. Try again in a moment.',
    };
  }

  if (!response.ok) {
    return {
      title: 'Upload rejected',
      detail: 'The analyzer could not process that upload.',
    };
  }

  return null;
}

export function getUploadNetworkFeedback(): IUploadFeedback {
  return {
    title: 'Could not reach the upload endpoint',
    detail: 'Check that the API is running, then try again.',
  };
}
