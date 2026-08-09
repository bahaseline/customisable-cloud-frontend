import { Link, useParams } from 'react-router-dom';
import { useFilePreview } from '../hooks/useFilePreview';
import { BackIcon } from '../components/icons';
import Spinner from '../components/Spinner';

const FALLBACK_MESSAGES = {
  folder: 'This is a folder, so there is nothing to preview.',
  'too-large': 'This file is too large to preview here.',
  unsupported: 'This file type can’t be previewed here.',
};

function Centered({ children }) {
  return <div className="flex h-full items-center justify-center px-6 text-center">{children}</div>;
}

export default function FileViewerPage() {
  const { fileId } = useParams();
  const { file, kind, blobUrl, loading, error } = useFilePreview(fileId);

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

      <main className="flex-1 overflow-hidden bg-[#f8f9fa] dark:bg-[#202124]">
        {loading && (
          <Centered>
            <Spinner />
          </Centered>
        )}

        {!loading && error && (
          <Centered>
            <p className="text-sm text-[#5f6368] dark:text-[#9aa0a6]">{error}</p>
          </Centered>
        )}

        {!loading && !error && kind === 'pdf' && blobUrl && (
          <iframe src={blobUrl} title={file.name} className="h-full w-full border-0" />
        )}

        {!loading && !error && kind === 'image' && blobUrl && (
          <Centered>
            <img src={blobUrl} alt={file.name} className="max-h-full max-w-full object-contain" />
          </Centered>
        )}

        {!loading && !error && FALLBACK_MESSAGES[kind] && (
          <Centered>
            <div>
              <p className="text-sm text-[#5f6368] dark:text-[#9aa0a6]">{FALLBACK_MESSAGES[kind]}</p>
              {file && kind !== 'folder' && (
                <a
                  href={file.webViewLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-block rounded-full bg-[#1a73e8] px-4 py-2 text-sm font-medium text-white hover:bg-[#1765cc]"
                >
                  Open in Google Drive
                </a>
              )}
            </div>
          </Centered>
        )}
      </main>
    </div>
  );
}
