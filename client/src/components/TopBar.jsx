import ThemeToggle from './ThemeToggle';
import { SearchIcon } from './icons';
import Logo from './Logo';

function UserAvatar({ name, email }) {
  const initial = (name || email || '?').charAt(0).toUpperCase();
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1a73e8] text-xs font-medium text-white">
      {initial}
    </div>
  );
}

export default function TopBar({ search, onSearchChange, user, onLogout, placeholder = 'Search in Drive' }) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-6 border-b border-[#e0e0e0] bg-white px-4 dark:border-[#3c4043] dark:bg-[#202124]">
      <div className="flex w-52 shrink-0 items-center gap-2 pl-2">
        <Logo className="h-8 w-8 shrink-0 text-[#1a73e8] dark:text-[#8ab4f8]" />
        <span className="text-xl text-[#5f6368] dark:text-[#e8eaed]">Driveboard</span>
      </div>

      <div className="flex max-w-[720px] flex-1 items-center gap-3 rounded-full bg-[#eaf1fb] px-4 py-2.5 focus-within:bg-white focus-within:shadow-md dark:bg-[#292a2d] dark:focus-within:bg-[#2f3033]">
        <SearchIcon className="h-5 w-5 shrink-0 text-[#5f6368] dark:text-[#9aa0a6]" />
        <input
          id="drive-search"
          name="search"
          autoComplete="off"
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-[#202124] placeholder:text-[#5f6368] focus:outline-none dark:text-[#e8eaed] dark:placeholder:text-[#9aa0a6]"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <span className="hidden text-sm text-[#5f6368] sm:inline dark:text-[#9aa0a6]">{user?.email}</span>
        <UserAvatar name={user?.name} email={user?.email} />
        <button
          onClick={onLogout}
          className="rounded-full border border-[#dadce0] px-4 py-1.5 text-sm font-medium text-[#3c4043] hover:bg-[#f1f3f4] dark:border-[#5f6368] dark:text-[#e8eaed] dark:hover:bg-[#3c4043]"
        >
          Log out
        </button>
      </div>
    </header>
  );
}
