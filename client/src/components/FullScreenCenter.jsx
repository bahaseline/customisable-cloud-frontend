export default function FullScreenCenter({ children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#202124]">
      {children}
    </div>
  );
}
