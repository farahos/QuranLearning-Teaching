import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BarChart3, Users, BookOpen, DollarSign, GraduationCap, Sparkles } from "lucide-react";
import { Select } from "../../components/common/Select";
import { Tabs } from "../../components/common/Tabs";
import { Badge } from "../../components/common/Badge";
import { ReportFilters } from "../../components/reports/ReportFilters";
import { ReportSummaryCards } from "../../components/reports/ReportSummaryCards";
import { ReportTable } from "../../components/reports/ReportTable";
import { fetchAdminUsers, fetchAdminCourses, fetchAdminTransactions } from "../../features/admin/adminSlice";
import { ROLES, ROLE_LABELS } from "../../utils/constants";
import { formatCurrency, formatDate, formatNumber, formatPercent } from "../../utils/formatters";

const emptyFilters = { from: "", to: "", role: "", category: "", status: "" };

function inRange(dateValue, from, to) {
  if (!dateValue) return true;
  const date = new Date(dateValue);
  if (from && date < new Date(from)) return false;
  if (to && date > new Date(`${to}T23:59:59`)) return false;
  return true;
}

// Deterministic pseudo-completion percentage, purely for the demo estimate tab —
// there is no real lesson-progress backend to source this from.
function demoCompletionPercent(id) {
  let hash = 0;
  for (let i = 0; i < String(id).length; i += 1) hash = (hash * 31 + String(id).charCodeAt(i)) % 1000;
  return 45 + (hash % 50);
}

export function AdminReportsPage() {
  const dispatch = useDispatch();
  const { users, usersStatus, courses, coursesStatus, transactions, transactionsStatus } = useSelector((state) => state.admin);

  const [tab, setTab] = useState("registration");
  const [filters, setFilters] = useState(emptyFilters);

  useEffect(() => {
    if (usersStatus === "idle") dispatch(fetchAdminUsers({}));
    if (coursesStatus === "idle") dispatch(fetchAdminCourses());
    if (transactionsStatus === "idle") dispatch(fetchAdminTransactions());
  }, [dispatch, usersStatus, coursesStatus, transactionsStatus]);

  const categoryOptions = useMemo(() => {
    const names = new Set(courses.map((c) => c.category).filter(Boolean));
    return [...names].map((name) => ({ value: name, label: name }));
  }, [courses]);

  const tabs = [
    { value: "registration", label: "Registrations" },
    { value: "courses", label: "Courses" },
    { value: "revenue", label: "Revenue" },
    { value: "enrollment", label: "Enrollment" },
    { value: "completion", label: "Completion (demo)" },
  ];

  // ---- Registration report ----
  const filteredUsers = useMemo(
    () => users.filter((u) => (!filters.role || u.role === filters.role) && inRange(u.createdAt, filters.from, filters.to)),
    [users, filters]
  );
  const registrationRows = useMemo(() => {
    const map = new Map();
    filteredUsers.forEach((u) => {
      const date = formatDate(u.createdAt);
      const key = `${date}|${u.role}`;
      map.set(key, { date, role: u.role, count: (map.get(key)?.count || 0) + 1 });
    });
    return [...map.values()].sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [filteredUsers]);
  const registrationSummary = [
    { label: "Total registrations", value: formatNumber(filteredUsers.length), icon: Users },
    { label: "Students", value: formatNumber(filteredUsers.filter((u) => u.role === "student").length), icon: GraduationCap },
    { label: "Teachers", value: formatNumber(filteredUsers.filter((u) => u.role === "teacher").length), icon: Users },
    { label: "Admins", value: formatNumber(filteredUsers.filter((u) => u.role === "admin").length), icon: Users },
  ];

  // ---- Course report ----
  const filteredCourses = useMemo(
    () => courses.filter((c) => (!filters.category || c.category === filters.category) && inRange(c.createdAt, filters.from, filters.to)),
    [courses, filters]
  );
  const courseRows = filteredCourses;
  const avgPrice = filteredCourses.length ? filteredCourses.reduce((sum, c) => sum + Number(c.price || 0), 0) / filteredCourses.length : 0;
  const courseSummary = [
    { label: "Total courses", value: formatNumber(filteredCourses.length), icon: BookOpen },
    { label: "Free courses", value: formatNumber(filteredCourses.filter((c) => !Number(c.price)).length), icon: BookOpen },
    { label: "Average price", value: formatCurrency(avgPrice), icon: DollarSign },
  ];

  // ---- Revenue report ----
  const filteredTransactions = useMemo(
    () => transactions.filter((t) => (!filters.status || t.status === filters.status) && inRange(t.createdAt, filters.from, filters.to)),
    [transactions, filters]
  );
  const revenueTotal = filteredTransactions.filter((t) => t.type === "course_payment" && t.status === "completed").reduce((sum, t) => sum + t.amount, 0);
  const commissionTotal = filteredTransactions.filter((t) => t.type === "admin_commission" && t.status === "completed").reduce((sum, t) => sum + t.amount, 0);
  const revenueSummary = [
    { label: "Total revenue", value: formatCurrency(revenueTotal), icon: DollarSign },
    { label: "Admin commission", value: formatCurrency(commissionTotal), icon: DollarSign },
    { label: "Completed transactions", value: formatNumber(filteredTransactions.filter((t) => t.status === "completed").length), icon: BarChart3 },
    { label: "Pending transactions", value: formatNumber(filteredTransactions.filter((t) => t.status === "pending").length), icon: BarChart3 },
  ];

  // ---- Enrollment report ----
  const enrollmentRows = useMemo(
    () =>
      [...filteredCourses]
        .map((c) => ({ ...c, enrolledCount: c.enrolledStudents?.length || 0, revenueEstimate: (c.enrolledStudents?.length || 0) * Number(c.price || 0) }))
        .sort((a, b) => b.enrolledCount - a.enrolledCount),
    [filteredCourses]
  );
  const totalEnrollments = enrollmentRows.reduce((sum, c) => sum + c.enrolledCount, 0);
  const enrollmentSummary = [
    { label: "Total enrollments", value: formatNumber(totalEnrollments), icon: GraduationCap },
    { label: "Avg. per course", value: enrollmentRows.length ? (totalEnrollments / enrollmentRows.length).toFixed(1) : "0", icon: BarChart3 },
    { label: "Most popular course", value: enrollmentRows[0]?.courseName || "—", icon: BookOpen },
  ];

  // ---- Completion (demo) report ----
  const completionRows = useMemo(() => filteredCourses.map((c) => ({ ...c, completionPercent: demoCompletionPercent(c._id) })), [filteredCourses]);
  const avgCompletion = completionRows.length ? completionRows.reduce((sum, c) => sum + c.completionPercent, 0) / completionRows.length : 0;
  const completionSummary = [
    { label: "Avg. completion (demo)", value: formatPercent(avgCompletion), icon: Sparkles, helpText: "Estimated — no real progress backend yet" },
    { label: "Courses ≥ 80% (demo)", value: formatNumber(completionRows.filter((c) => c.completionPercent >= 80).length), icon: Sparkles },
  ];

  return (
    <section className="space-y-6">
      <div>
        <h1 className="page-title">Reports</h1>
        <p className="page-subtitle">Platform-wide registration, revenue and completion reports.</p>
      </div>

      <Tabs tabs={tabs} value={tab} onChange={setTab} />

      {tab === "registration" && (
        <>
          <div className="card-pad">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Select
                label="Role"
                value={filters.role}
                onChange={(e) => setFilters((f) => ({ ...f, role: e.target.value }))}
                options={[{ value: "", label: "All roles" }, ...Object.values(ROLES).map((r) => ({ value: r, label: ROLE_LABELS[r] }))]}
              />
            </div>
          </div>
          <ReportFilters filters={filters} onChange={setFilters} onReset={() => setFilters(emptyFilters)} showPriceRange={false} />
          <ReportSummaryCards items={registrationSummary} />
          <ReportTable
            title="Registrations by date and role"
            columns={[
              { key: "date", header: "Date", render: (r) => r.date },
              { key: "role", header: "Role", render: (r) => ROLE_LABELS[r.role] || r.role },
              { key: "count", header: "New registrations", render: (r) => formatNumber(r.count) },
            ]}
            rows={registrationRows}
            status={usersStatus}
          />
        </>
      )}

      {tab === "courses" && (
        <>
          <ReportFilters filters={filters} onChange={setFilters} onReset={() => setFilters(emptyFilters)} categoryOptions={categoryOptions} showPriceRange={false} />
          <ReportSummaryCards items={courseSummary} />
          <ReportTable
            title="Courses"
            columns={[
              { key: "courseName", header: "Course", render: (r) => r.courseName },
              { key: "teacher", header: "Teacher", render: (r) => r.teacher?.fullName || "—" },
              { key: "category", header: "Category", render: (r) => r.category },
              { key: "price", header: "Price", render: (r) => (Number(r.price) ? formatCurrency(r.price) : "Free") },
              { key: "enrolled", header: "Enrolled", render: (r) => formatNumber(r.enrolledStudents?.length || 0) },
            ]}
            rows={courseRows}
            status={coursesStatus}
          />
        </>
      )}

      {tab === "revenue" && (
        <>
          <ReportFilters
            filters={filters}
            onChange={setFilters}
            onReset={() => setFilters(emptyFilters)}
            showPriceRange={false}
            showStatus
            statusOptions={[
              { value: "completed", label: "Completed" },
              { value: "pending", label: "Pending" },
              { value: "failed", label: "Failed" },
            ]}
          />
          <ReportSummaryCards items={revenueSummary} />
          <ReportTable
            title="Transactions"
            columns={[
              { key: "date", header: "Date", render: (r) => formatDate(r.createdAt) },
              { key: "user", header: "User", render: (r) => r.user?.fullName || "—" },
              { key: "type", header: "Type", render: (r) => r.type.replace(/_/g, " ") },
              { key: "amount", header: "Amount", render: (r) => formatCurrency(r.amount) },
              { key: "status", header: "Status", render: (r) => <Badge tone={r.status === "completed" ? "green" : r.status === "pending" ? "amber" : "red"}>{r.status}</Badge> },
            ]}
            rows={filteredTransactions}
            rowKey="_id"
            status={transactionsStatus}
          />
        </>
      )}

      {tab === "enrollment" && (
        <>
          <ReportFilters filters={filters} onChange={setFilters} onReset={() => setFilters(emptyFilters)} categoryOptions={categoryOptions} showPriceRange={false} />
          <ReportSummaryCards items={enrollmentSummary} />
          <ReportTable
            title="Enrollment by course"
            columns={[
              { key: "courseName", header: "Course", render: (r) => r.courseName },
              { key: "teacher", header: "Teacher", render: (r) => r.teacher?.fullName || "—" },
              { key: "enrolled", header: "Enrolled students", render: (r) => formatNumber(r.enrolledCount) },
              { key: "revenue", header: "Revenue estimate", render: (r) => formatCurrency(r.revenueEstimate) },
            ]}
            rows={enrollmentRows}
            status={coursesStatus}
          />
        </>
      )}

      {tab === "completion" && (
        <>
          <Badge tone="amber">Demo estimate — there is no real lesson-progress backend yet, these numbers are illustrative only.</Badge>
          <ReportFilters filters={filters} onChange={setFilters} onReset={() => setFilters(emptyFilters)} categoryOptions={categoryOptions} showPriceRange={false} />
          <ReportSummaryCards items={completionSummary} />
          <ReportTable
            title="Completion by course (demo estimate)"
            columns={[
              { key: "courseName", header: "Course", render: (r) => r.courseName },
              { key: "teacher", header: "Teacher", render: (r) => r.teacher?.fullName || "—" },
              { key: "completion", header: "Est. completion", render: (r) => formatPercent(r.completionPercent) },
            ]}
            rows={completionRows}
            status={coursesStatus}
          />
        </>
      )}
    </section>
  );
}
