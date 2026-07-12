import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, Search } from "lucide-react";
import { Breadcrumbs, computeBreadcrumbs } from "./Breadcrumbs";
import { NotificationMenu } from "./NotificationMenu";
import { ProfileMenu } from "./ProfileMenu";

export function Topbar({ user, onOpenMobileMenu }) {
  const location = useLocation();
  const navigate = useNavigate();
  const breadcrumbs = useMemo(() => computeBreadcrumbs(location.pathname, user?.role), [location.pathname, user?.role]);
  const pageTitle = breadcrumbs[breadcrumbs.length - 1]?.label || "Dashboard";

  function handleSearchSubmit(event) {
    event.preventDefault();
    const query = new FormData(event.currentTarget).get("q");
    if (user?.role === "student") navigate(`/student/courses${query ? `?search=${encodeURIComponent(query)}` : ""}`);
    else if (user?.role === "teacher") navigate(`/teacher/courses${query ? `?search=${encodeURIComponent(query)}` : ""}`);
    else if (user?.role === "admin") navigate(`/admin/courses${query ? `?search=${encodeURIComponent(query)}` : ""}`);
  }

  return (
    <header className="sticky top-0 z-20 flex min-h-16 items-center gap-3 border-b border-quran-line bg-white/95 px-4 backdrop-blur sm:px-6">
      <button type="button" onClick={onOpenMobileMenu} aria-label="Open navigation menu" className="btn-ghost btn-icon lg:hidden">
        <Menu size={20} />
      </button>
      <div className="min-w-0 flex-1">
        <Breadcrumbs items={breadcrumbs} />
        <h1 className="truncate text-base font-black text-quran-text sm:text-lg">{pageTitle}</h1>
      </div>
      <form onSubmit={handleSearchSubmit} className="hidden max-w-xs flex-1 items-center gap-2 rounded-lg border border-quran-line bg-quran-soft px-3 py-2 md:flex">
        <Search size={15} className="text-quran-muted" aria-hidden="true" />
        <input name="q" type="search" placeholder="Search courses..." className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-quran-muted/70" />
      </form>
      <div className="flex items-center gap-2">
        <NotificationMenu />
        <ProfileMenu user={user} />
      </div>
    </header>
  );
}
