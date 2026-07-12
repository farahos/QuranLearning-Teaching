import { useSelector } from "react-redux";
import { Link, Outlet } from "react-router-dom";
import { BookOpenCheck } from "lucide-react";
import { Button } from "../common/Button";

export function PublicLayout() {
  const { user, token } = useSelector((state) => state.auth);
  const isAuthenticated = Boolean(token && user);

  return (
    <div className="min-h-screen bg-quran-bg">
      <header className="sticky top-0 z-20 border-b border-quran-line bg-white/95 backdrop-blur">
        <div className="content-container flex items-center justify-between py-3">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-quran-green to-quran-teal text-white">
              <BookOpenCheck size={20} aria-hidden="true" />
            </span>
            <span className="text-lg font-black text-quran-text">Quran Connect</span>
          </Link>
          <div className="flex items-center gap-2.5">
            {isAuthenticated ? (
              <Link to={`/${user.role}`}>
                <Button variant="primary">Go to dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="secondary">Login</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary">Register</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
