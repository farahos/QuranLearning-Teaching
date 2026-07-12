import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getNavForRole } from "../../routes/navConfig";

const ID_LIKE = /^[0-9a-f]{8,}$/i;

function humanizeSegment(segment) {
  if (ID_LIKE.test(segment)) return "Details";
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function computeBreadcrumbs(pathname, role) {
  const nav = getNavForRole(role);
  const rootPath = `/${role}`;
  const crumbs = [{ label: "Dashboard", to: rootPath }];

  const match = nav
    .filter((item) => pathname === item.to || pathname.startsWith(`${item.to}/`))
    .sort((a, b) => b.to.length - a.to.length)[0];

  if (match && match.to !== rootPath) {
    crumbs.push({ label: match.label, to: match.to });
  }

  const basePath = match ? match.to : rootPath;
  const rest = pathname
    .slice(basePath.length)
    .split("/")
    .filter(Boolean);
  rest.forEach((segment) => crumbs.push({ label: humanizeSegment(segment), to: null }));

  return crumbs;
}

export function Breadcrumbs({ items }) {
  if (!items?.length) return null;
  return (
    <nav aria-label="Breadcrumb" className="hidden sm:block">
      <ol className="flex items-center gap-1.5 text-xs font-semibold text-quran-muted">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
            {index > 0 && <ChevronRight size={12} aria-hidden="true" />}
            {item.to && index !== items.length - 1 ? (
              <Link to={item.to} className="hover:text-quran-green">
                {item.label}
              </Link>
            ) : (
              <span className={index === items.length - 1 ? "text-quran-text" : ""}>{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
