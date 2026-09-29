import { Component } from 'react';
import FullScreenCenter from './FullScreenCenter';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled UI error:', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <FullScreenCenter>
        <div className="max-w-sm px-6 text-center">
          <h1 className="text-lg font-medium text-grey-900 dark:text-grey-200">Something went wrong</h1>
          <p className="mt-2 text-sm text-grey-700 dark:text-grey-500">
            The page ran into an unexpected problem. Reloading usually fixes it.
          </p>
          <button
            onClick={() => window.location.assign('/files')}
            className="mt-6 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
          >
            Reload Driveboard
          </button>
        </div>
      </FullScreenCenter>
    );
  }
}
