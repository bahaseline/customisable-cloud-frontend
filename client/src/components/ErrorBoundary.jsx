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
          <h1 className="text-lg font-medium text-[#202124] dark:text-[#e8eaed]">Something went wrong</h1>
          <p className="mt-2 text-sm text-[#5f6368] dark:text-[#9aa0a6]">
            The page ran into an unexpected problem. Reloading usually fixes it.
          </p>
          <button
            onClick={() => window.location.assign('/files')}
            className="mt-6 rounded-full bg-[#1a73e8] px-4 py-2 text-sm font-medium text-white hover:bg-[#1765cc]"
          >
            Reload Driveboard
          </button>
        </div>
      </FullScreenCenter>
    );
  }
}
