import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, UserCircle } from "lucide-react";
import { Avatar } from "../common/Avatar";
import { logout } from "../../features/auth/authSlice";
import { ROLE_LABELS } from "../../utils/constants";
import { api } from "../../api/client";

export function ProfileMenu({ user }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    dispatch(logout());
    navigate("/login");
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex min-h-10 items-center gap-2 rounded-lg border border-quran-line bg-white px-2 py-1.5 hover:border-quran-green"
      >
        <Avatar src={user?.profileImageUrl ? api.mediaUrl(user.profileImageUrl) : ""} name={user?.fullName} size="sm" />
        <span className="hidden text-left leading-tight sm:block">
          <span className="block max-w-[140px] truncate text-sm font-black text-quran-text">{user?.fullName || "Account"}</span>
          <span className="block text-xs text-quran-muted">{ROLE_LABELS[user?.role] || ""}</span>
        </span>
        <ChevronDown size={15} className="hidden text-quran-muted sm:block" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-30 mt-2 w-56 rounded-xl border border-quran-line bg-white p-1.5 shadow-modal">
          <div className="px-2.5 py-2">
            <p className="truncate text-sm font-black text-quran-text">{user?.fullName}</p>
            <p className="truncate text-xs text-quran-muted">{user?.email}</p>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              navigate(`/${user?.role}/profile`);
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-bold text-quran-text hover:bg-quran-soft"
          >
            <UserCircle size={16} /> Profile
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-bold text-quran-red hover:bg-red-50"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}
    </div>
  );
}
