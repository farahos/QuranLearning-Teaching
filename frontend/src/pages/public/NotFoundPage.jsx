import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { Button } from "../../components/common/Button";

export function NotFoundPage() {
  return (
    <div className="content-container flex flex-col items-center justify-center py-24 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-quran-soft text-quran-green">
        <Compass size={30} />
      </span>
      <p className="mt-4 text-sm font-black uppercase tracking-wide text-quran-muted">404</p>
      <h1 className="mt-1 text-2xl font-black text-quran-text">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-quran-muted">The page you're looking for doesn't exist or may have moved.</p>
      <Link to="/" className="mt-5">
        <Button variant="primary">Back to home</Button>
      </Link>
    </div>
  );
}
