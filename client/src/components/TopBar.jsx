import { useState } from 'react';
import ThemeToggle from './ThemeToggle';
import { SearchIcon } from './icons';
import Logo from './Logo';

function UserAvatar({ name, email, picture }) {
  const [imgFailed, setImgFailed] = useState(false);
  const initial = (name || email || '?').charAt(0).toUpperCase();

  if (picture && !imgFailed) {
    return (
      <img
        src={picture}
        alt={name || email || 'Account'}
        referrerPolicy="no-referrer"
        onError={() => setImgFailed(true)}
        className="h-8 w-8 shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-white">
      {initial}
    </div>
  );
}

export default function TopBar({ search, onSearchChange, user, onLogout, placeholder = 'Search in Drive' }) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-6 border-b border-grey-250 bg-white px-4 dark:border-grey-800 dark:bg-grey-900">
      <div className="flex w-52 shrink-0 items-center gap-2 pl-2">
        <Logo className="h-8 w-8 shrink-0 text-primary dark:text-primary-light" />
        <span className="text-xl text-grey-700 dark:text-grey-200">Driveboard</span>
      </div>

      <div className="flex max-w-[720px] flex-1 items-center gap-3 rounded-full bg-[#eaf1fb] px-4 py-2.5 focus-within:bg-white focus-within:shadow-md dark:bg-grey-850 dark:focus-within:bg-[#2f3033]">
        <SearchIcon className="h-5 w-5 shrink-0 text-grey-700 dark:text-grey-500" />
        <input
          id="drive-search"
          name="search"
          autoComplete="off"
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-grey-900 placeholder:text-grey-700 focus:outline-none dark:text-grey-200 dark:placeholder:text-grey-500"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <span className="hidden text-sm text-grey-700 sm:inline dark:text-grey-500">{user?.email}</span>
        <UserAvatar name={user?.name} email={user?.email} picture={user?.picture} />
        <button
          onClick={onLogout}
          className="rounded-full border border-grey-300 px-4 py-1.5 text-sm font-medium text-grey-800 hover:bg-grey-100 dark:border-grey-700 dark:text-grey-200 dark:hover:bg-grey-800"
        >
          Log out
        </button>
      </div>
    </header>
  );
}
