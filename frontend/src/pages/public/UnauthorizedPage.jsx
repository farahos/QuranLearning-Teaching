import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { ShieldAlert } from "lucide-react";
import { Button } from "../../components/common/Button";

export function UnauthorizedPage() {
  const user = useSelector((state) => state.auth.user);

  return (
    <div className="content-container flex flex-col items-center justify-center py-24 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-red-50 text-quran-red">
        <ShieldAlert size={30} />
      </span>
      <p className="mt-4 text-sm font-black uppercase tracking-wide text-quran-muted">403</p>
      <h1 className="mt-1 text-2xl font-black text-quran-text">You don't have access to this page</h1>
      <p className="mt-2 max-w-sm text-sm text-quran-muted">This area is reserved for a different account role. Head back to your own dashboard instead.</p>
      <Link to={user ? `/${user.role}` : "/login"} className="mt-5">
        <Button variant="primary">{user ? "Go to my dashboard" : "Go to login"}</Button>
      </Link>
    </div>
  );
}
