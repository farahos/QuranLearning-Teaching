import { BookOpen, ClipboardList, CreditCard, Filter, GraduationCap, LayoutDashboard, ShieldCheck, Users } from "lucide-react";
import { UserRow } from "../../components/CourseWidgets";
import { Reports } from "../../components/Reports";
import { Button, MetricGrid, RowItem, SearchBox, Section } from "../../components/ui";
import { demoLogs } from "../../data/demoData";
import { initials } from "../../utils/courseUtils";

export const adminNav = [
  ["overview", LayoutDashboard, "Overview"],
  ["users", Users, "Users"],
  ["teachers", ShieldCheck, "Teacher Requests"],
  ["payments", CreditCard, "Payments"],
  ["reports", Filter, "Reports"],
  ["logs", ClipboardList, "Logs"],
];

export function AdminPage({ users, courses, transactions, active, updateUser, setToast }) {
  const teachersPending = users.filter((item) => item.role === "teacher" && (item.kycStatus === "pending" || item.active === false));

  if (active === "users") {
    return (
      <Section title="User management role">
        <div className="toolbar">
          <SearchBox />
          <Button icon={Filter}>Filter</Button>
        </div>
        <div className="list-card">
          {users.map((item) => (
            <UserRow key={item._id} user={item} onChange={(updates) => updateUser(item._id, updates)} />
          ))}
        </div>
      </Section>
    );
  }

  if (active === "teachers") {
    return (
      <Section title="Accept Registration Teacher">
        <div className="list-card">
          {teachersPending.map((item) => (
            <div className="user-row" key={item._id}>
              <div className="avatar">{initials(item.fullName)}</div>
              <div>
                <strong>{item.fullName}</strong>
                <span>{item.email}</span>
              </div>
              <button onClick={() => updateUser(item._id, { active: true, kycStatus: "verified" })}>Accept</button>
              <button onClick={() => (updateUser(item._id, { active: false, kycStatus: "rejected" }), setToast("Cancel feedback submitted"))}>Cancel + feedback</button>
            </div>
          ))}
        </div>
      </Section>
    );
  }

  if (active === "payments") {
    return (
      <Section title="View payments and refunds">
        <div className="list-card">
          {transactions.map((item) => (
            <div className="payment-row" key={item._id}>
              <CreditCard size={18} />
              <div>
                <strong>{item.course || item.type}</strong>
                <span>{item.user?.fullName || "User"} - {item.status}</span>
              </div>
              <strong>${Number(item.amount || 0).toFixed(2)}</strong>
              <button disabled={!item.refundable}>Refund</button>
            </div>
          ))}
        </div>
      </Section>
    );
  }

  if (active === "reports") return <Reports courses={courses} title="Admin reports" />;

  if (active === "logs") {
    return (
      <Section title="View logs">
        <div className="list-card">
          {demoLogs.map((log) => (
            <RowItem key={log.id} icon={ClipboardList} title={log.event} meta={`${log.actor} - ${log.date}`} action="Open" />
          ))}
        </div>
      </Section>
    );
  }

  const revenue = transactions.filter((item) => item.status === "completed").reduce((sum, item) => sum + Number(item.amount || 0), 0);
  return (
    <Section title="Admin overview">
      <MetricGrid metrics={[["Users", users.length, Users], ["Teachers", users.filter((item) => item.role === "teacher").length, GraduationCap], ["Courses", courses.length, BookOpen], ["Payments", `$${revenue.toFixed(2)}`, CreditCard]]} />
    </Section>
  );
}
