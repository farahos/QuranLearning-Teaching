import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Award, Bell, BookOpen, ClipboardList, Megaphone, MessageSquare, Radio, Trash2, Wallet } from "lucide-react";
import { EmptyState } from "../../components/common/EmptyState";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { Tabs } from "../../components/common/Tabs";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { useToast } from "../../components/common/Toast";
import { markAllNotificationsRead, markNotificationRead, removeNotification } from "../../features/notifications/notificationSlice";
import { formatRelativeTime } from "../../utils/formatters";

const TYPE_ICON = {
  new_course: BookOpen,
  survey: ClipboardList,
  certificate: Award,
  teacher_feedback: MessageSquare,
  payment_update: Wallet,
  live_class: Radio,
  course_announcement: Megaphone,
};

export function StudentNotificationsPage() {
  const dispatch = useDispatch();
  const toast = useToast();
  const { items, isDemo } = useSelector((state) => state.notifications);
  const [tab, setTab] = useState("all");
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const unreadCount = items.filter((item) => !item.read).length;
  const visibleItems = useMemo(() => (tab === "unread" ? items.filter((item) => !item.read) : items), [items, tab]);

  function handleOpen(notification) {
    if (!notification.read) dispatch(markNotificationRead(notification.id));
  }

  function confirmDelete() {
    dispatch(removeNotification(pendingDeleteId));
    setPendingDeleteId(null);
    toast.info("Notification deleted");
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="page-title">Notifications</h1>
        <p className="page-subtitle">
          Stay up to date with your courses and teachers.
          {isDemo && " (demo data — not connected to the backend yet)"}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { value: "all", label: "All", count: items.length },
            { value: "unread", label: "Unread", count: unreadCount },
          ]}
        />
        <Button variant="secondary" size="sm" onClick={() => dispatch(markAllNotificationsRead())} disabled={!unreadCount}>
          Mark all read
        </Button>
      </div>

      {visibleItems.length ? (
        <ul className="card divide-y divide-quran-line">
          {visibleItems.map((notification) => {
            const Icon = TYPE_ICON[notification.type] || Bell;
            return (
              <li key={notification.id} className={`flex items-start gap-3 p-4 ${!notification.read ? "bg-quran-soft/40" : ""}`}>
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-quran-soft text-quran-green">
                  <Icon size={17} aria-hidden="true" />
                </span>
                <button type="button" className="min-w-0 flex-1 text-left" onClick={() => handleOpen(notification)}>
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-black text-quran-text">{notification.title}</p>
                    {!notification.read && <Badge tone="green">New</Badge>}
                  </div>
                  <p className="mt-0.5 text-sm text-quran-muted">{notification.message}</p>
                  <p className="mt-1 text-xs text-quran-muted">{formatRelativeTime(notification.createdAt)}</p>
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  iconOnly
                  ariaLabel="Delete notification"
                  icon={Trash2}
                  onClick={() => setPendingDeleteId(notification.id)}
                />
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState icon={Bell} title={tab === "unread" ? "No unread notifications" : "No notifications"} description="You're all caught up." />
      )}

      <ConfirmDialog
        open={!!pendingDeleteId}
        title="Delete notification?"
        description="This will remove the notification from your list."
        confirmLabel="Delete"
        tone="danger"
        onConfirm={confirmDelete}
        onClose={() => setPendingDeleteId(null)}
      />
    </section>
  );
}
