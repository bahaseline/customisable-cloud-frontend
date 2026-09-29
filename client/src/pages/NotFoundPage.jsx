import { Link } from 'react-router-dom';
import FullScreenCenter from '../components/FullScreenCenter';

export default function NotFoundPage() {
  return (
    <FullScreenCenter>
      <div className="max-w-sm px-6 text-center">
        <h1 className="text-lg font-medium text-grey-900 dark:text-grey-200">Page not found</h1>
        <p className="mt-2 text-sm text-grey-700 dark:text-grey-500">
          That address doesn’t match anything in Driveboard.
        </p>
        <Link
          to="/files"
          className="mt-6 inline-block rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
        >
          Back to my files
        </Link>
      </div>
    </FullScreenCenter>
  );
}
