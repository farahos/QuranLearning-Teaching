import { NavLink } from "react-router-dom";
import { BookOpenCheck, ChevronsLeft, ChevronsRight } from "lucide-react";
import { getNavForRole } from "../../routes/navConfig";
import { ROLE_LABELS } from "../../utils/constants";

export function Sidebar({ role, collapsed, onToggleCollapse, onNavigate }) {
  const nav = getNavForRole(role);

  return (
    <aside
      className={`sidebar-scroll hidden h-screen flex-col bg-quran-sidebar transition-[width] duration-200 lg:sticky lg:top-0 lg:flex ${
        collapsed ? "lg:w-sidebar-collapsed" : "lg:w-sidebar"
      }`}
    >
      <SidebarContent role={role} nav={nav} collapsed={collapsed} onNavigate={onNavigate} />
      <button
        type="button"
        onClick={onToggleCollapse}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="mx-3 mb-4 flex min-h-10 items-center justify-center gap-2 rounded-lg border border-white/10 text-sm font-bold text-emerald-100/80 hover:bg-white/10 hover:text-white"
      >
        {collapsed ? <ChevronsRight size={17} /> : (
          <>
            <ChevronsLeft size={17} /> Collapse
          </>
        )}
      </button>
    </aside>
  );
}

export function SidebarContent({ role, nav, collapsed, onNavigate }) {
  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4">
      <div className="flex items-center gap-3 px-1 pt-1">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-quran-bright to-quran-teal text-white">
          <BookOpenCheck size={20} aria-hidden="true" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-white">Quran Connect</p>
            <p className="truncate text-xs font-semibold text-emerald-100/70">{ROLE_LABELS[role] || "Learning"} Portal</p>
          </div>
        )}
      </div>
      <nav className="flex flex-1 flex-col gap-1" aria-label="Primary">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""} ${collapsed ? "justify-center px-2" : ""}`}
          >
            <item.icon size={18} className="shrink-0" aria-hidden="true" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
