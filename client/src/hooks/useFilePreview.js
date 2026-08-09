import { useEffect, useState } from 'react';
import { useFile, useFileContent } from './queries';

// Google-native documents are exported to PDF by the server, so they render
// through the same path as an ordinary PDF.
const NATIVE_TYPES = [
  'application/vnd.google-apps.document',
  'application/vnd.google-apps.spreadsheet',
  'application/vnd.google-apps.presentation',
  'application/vnd.google-apps.drawing',
];

// Streaming a file means buffering it in memory, so very large binaries are
// sent to Drive rather than pulled through the browser.
const MAX_INLINE_BYTES = 25 * 1024 * 1024;

function previewKindFor(file) {
  if (!file) return null;
  if (file.mimeType === 'application/vnd.google-apps.folder') return 'folder';
  if (NATIVE_TYPES.includes(file.mimeType)) return 'pdf';

  if (file.size && Number(file.size) > MAX_INLINE_BYTES) return 'too-large';
  if (file.mimeType === 'application/pdf') return 'pdf';
  if (file.mimeType?.startsWith('image/')) return 'image';
  return 'unsupported';
}

export function useFilePreview(fileId) {
  const { data: file, isLoading: fileLoading, isError: fileError } = useFile(fileId);

  const kind = previewKindFor(file);
  const renderable = kind === 'pdf' || kind === 'image';

  const {
    data: blob,
    isLoading: contentLoading,
    isError: contentError,
  } = useFileContent(fileId, renderable);

  const [blobUrl, setBlobUrl] = useState(null);

  useEffect(() => {
    if (!blob) {
      setBlobUrl(null);
      return undefined;
    }
    const url = URL.createObjectURL(blob);
    setBlobUrl(url);
    // Release the buffer when the file changes or the viewer unmounts.
    return () => URL.revokeObjectURL(url);
  }, [blob]);

  return {
    file,
    kind,
    blobUrl,
    loading: fileLoading || (renderable && contentLoading),
    error: fileError
      ? 'Could not load this file.'
      : contentError
        ? 'Could not load this file’s contents.'
        : null,
  };
}
