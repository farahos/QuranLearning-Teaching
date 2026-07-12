import { X } from "lucide-react";
import { getNavForRole } from "../../routes/navConfig";
import { SidebarContent } from "./Sidebar";

export function MobileSidebar({ role, open, onClose }) {
  return (
    <div className={`fixed inset-0 z-40 lg:hidden ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div
        className={`absolute inset-0 bg-quran-ink/50 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      <div
        className={`absolute inset-y-0 left-0 flex w-[280px] max-w-[85vw] flex-col bg-quran-sidebar shadow-modal transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <button type="button" onClick={onClose} aria-label="Close menu" className="absolute right-3 top-3 text-emerald-100/80 hover:text-white">
          <X size={20} />
        </button>
        <SidebarContent role={role} nav={getNavForRole(role)} collapsed={false} onNavigate={onClose} />
      </div>
    </div>
  );
}
