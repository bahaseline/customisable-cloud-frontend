import { useTheme } from '../context/ThemeContext';
import { SunIcon, MoonIcon } from './icons';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-grey-700 hover:bg-grey-100 dark:text-grey-500 dark:hover:bg-grey-800"
    >
      {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
    </button>
  );
}
