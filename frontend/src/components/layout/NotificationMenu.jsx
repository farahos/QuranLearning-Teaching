import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Bell, CheckCheck } from "lucide-react";
import { fetchNotifications, markAllNotificationsRead, markNotificationRead } from "../../features/notifications/notificationSlice";
import { formatRelativeTime } from "../../utils/formatters";

export function NotificationMenu() {
  const dispatch = useDispatch();
  const items = useSelector((state) => state.notifications.items);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const unreadCount = items.filter((item) => !item.read).length;

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
        className="btn-ghost btn-icon relative"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-quran-red px-1 text-[10px] font-black text-white">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-2 w-[min(340px,90vw)] rounded-xl border border-quran-line bg-white p-2 shadow-modal">
          <div className="flex items-center justify-between gap-2 px-2 py-1.5">
            <p className="text-sm font-black text-quran-text">Notifications</p>
            <button type="button" onClick={() => dispatch(markAllNotificationsRead())} className="flex items-center gap-1 text-xs font-bold text-quran-green hover:underline">
              <CheckCheck size={13} /> Mark all read
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 && <p className="px-2 py-4 text-center text-sm text-quran-muted">You're all caught up.</p>}
            {items.slice(0, 8).map((item) => (
              <button
                key={item._id}
                type="button"
                onClick={() => dispatch(markNotificationRead(item._id))}
                className={`block w-full rounded-lg px-2 py-2 text-left text-sm hover:bg-quran-soft ${item.read ? "opacity-70" : ""}`}
              >
                <span className="flex items-center gap-2 font-bold text-quran-text">
                  {!item.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-quran-green" aria-hidden="true" />}
                  {item.message}
                </span>
                <span className="mt-0.5 block text-[11px] text-quran-muted/70">{formatRelativeTime(item.createdAt)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
