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
    <div className="flex h-screen flex-col bg-white dark:bg-grey-900">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-grey-250 px-4 dark:border-grey-800">
        <Link
          to="/files"
          className="flex h-8 w-8 items-center justify-center rounded-full text-grey-700 hover:bg-grey-100 dark:text-grey-500 dark:hover:bg-grey-800"
          aria-label="Back to files"
        >
          <BackIcon className="h-5 w-5" />
        </Link>
        {file && <img src={file.iconLink} alt="" className="h-5 w-5 shrink-0" />}
        <h1 className="min-w-0 flex-1 truncate text-sm font-medium text-grey-800 dark:text-grey-200">
          {file?.name || 'Loading…'}
        </h1>
        {file && (
          <a
            href={file.webViewLink}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 rounded-full border border-grey-300 px-3 py-1 text-xs font-medium text-grey-700 hover:bg-grey-100 dark:border-grey-700 dark:text-grey-500 dark:hover:bg-grey-800"
          >
            Open in Drive
          </a>
        )}
      </header>

      <main className="flex-1 overflow-hidden bg-grey-50 dark:bg-grey-900">
        {loading && (
          <Centered>
            <Spinner />
          </Centered>
        )}

        {!loading && error && (
          <Centered>
            <p className="text-sm text-grey-700 dark:text-grey-500">{error}</p>
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
              <p className="text-sm text-grey-700 dark:text-grey-500">{FALLBACK_MESSAGES[kind]}</p>
              {file && kind !== 'folder' && (
                <a
                  href={file.webViewLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-block rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
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
