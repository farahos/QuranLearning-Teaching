import { Link, Outlet } from "react-router-dom";
import { BookOpenCheck } from "lucide-react";

export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-quran-bg">
      <header className="content-container flex items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-quran-green to-quran-teal text-white">
            <BookOpenCheck size={20} aria-hidden="true" />
          </span>
          <span className="text-lg font-black text-quran-text">Quran Connect</span>
        </Link>
        <Link to="/" className="text-sm font-bold text-quran-muted hover:text-quran-green">
          Back to home
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
