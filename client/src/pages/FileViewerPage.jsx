import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import apiClient from '../api/client';
import { BackIcon } from '../components/icons';
import Spinner from '../components/Spinner';

function buildPreviewUrl(file) {
  switch (file.mimeType) {
    case 'application/vnd.google-apps.document':
      return `https://docs.google.com/document/d/${file.id}/preview`;
    case 'application/vnd.google-apps.spreadsheet':
      return `https://docs.google.com/spreadsheets/d/${file.id}/preview`;
    case 'application/vnd.google-apps.presentation':
      return `https://docs.google.com/presentation/d/${file.id}/preview`;
    case 'application/vnd.google-apps.folder':
      return null;
    default:
      return `https://drive.google.com/file/d/${file.id}/preview`;
  }
}

export default function FileViewerPage() {
  const { fileId } = useParams();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    apiClient
      .get(`/api/files/${fileId}`)
      .then((res) => setFile(res.data.file))
      .catch(() => setError('Could not load this file.'))
      .finally(() => setLoading(false));
  }, [fileId]);

  const previewUrl = file ? buildPreviewUrl(file) : null;

  return (
    <div className="flex h-screen flex-col bg-white dark:bg-[#202124]">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-[#e0e0e0] px-4 dark:border-[#3c4043]">
        <Link
          to="/files"
          className="flex h-8 w-8 items-center justify-center rounded-full text-[#5f6368] hover:bg-[#f1f3f4] dark:text-[#9aa0a6] dark:hover:bg-[#3c4043]"
          aria-label="Back to files"
        >
          <BackIcon className="h-5 w-5" />
        </Link>
        {file && <img src={file.iconLink} alt="" className="h-5 w-5 shrink-0" />}
        <h1 className="min-w-0 flex-1 truncate text-sm font-medium text-[#3c4043] dark:text-[#e8eaed]">
          {file?.name || 'Loading…'}
        </h1>
        {file && (
          <a
            href={file.webViewLink}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 rounded-full border border-[#dadce0] px-3 py-1 text-xs font-medium text-[#5f6368] hover:bg-[#f1f3f4] dark:border-[#5f6368] dark:text-[#9aa0a6] dark:hover:bg-[#3c4043]"
          >
            Open in Drive
          </a>
        )}
      </header>

      <main className="flex-1 overflow-hidden">
        {loading && (
          <div className="flex h-full items-center justify-center">
            <Spinner />
          </div>
        )}

        {!loading && error && (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-[#5f6368] dark:text-[#9aa0a6]">{error}</p>
          </div>
        )}

        {!loading && !error && previewUrl && (
          <iframe src={previewUrl} title={file.name} className="h-full w-full border-0" allow="autoplay" />
        )}

        {!loading && !error && file && !previewUrl && (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-[#5f6368] dark:text-[#9aa0a6]">
              This item can't be previewed here.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
