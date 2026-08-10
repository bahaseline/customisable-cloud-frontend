import { Link } from 'react-router-dom';
import FullScreenCenter from '../components/FullScreenCenter';

export default function NotFoundPage() {
  return (
    <FullScreenCenter>
      <div className="max-w-sm px-6 text-center">
        <h1 className="text-lg font-medium text-[#202124] dark:text-[#e8eaed]">Page not found</h1>
        <p className="mt-2 text-sm text-[#5f6368] dark:text-[#9aa0a6]">
          That address doesn’t match anything in Driveboard.
        </p>
        <Link
          to="/files"
          className="mt-6 inline-block rounded-full bg-[#1a73e8] px-4 py-2 text-sm font-medium text-white hover:bg-[#1765cc]"
        >
          Back to my files
        </Link>
      </div>
    </FullScreenCenter>
  );
}
