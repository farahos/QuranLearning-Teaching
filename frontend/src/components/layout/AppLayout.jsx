import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { MobileSidebar } from "./MobileSidebar";
import { Topbar } from "./Topbar";

export function AppLayout() {
  const user = useSelector((state) => state.auth.user);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="app-shell flex">
      <Sidebar role={user?.role} collapsed={collapsed} onToggleCollapse={() => setCollapsed((value) => !value)} />
      <MobileSidebar role={user?.role} open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar user={user} onOpenMobileMenu={() => setMobileOpen(true)} />
        <main className="content-container flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
