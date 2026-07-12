import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { LayoutDashboard, Users, GraduationCap, ShieldCheck, BookOpen, DollarSign, RefreshCcw, Activity, TrendingUp } from "lucide-react";
import { StatCard } from "../../components/common/StatCard";
import { Card } from "../../components/common/Card";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { ErrorState } from "../../components/common/ErrorState";
import { EmptyState } from "../../components/common/EmptyState";
import { Badge } from "../../components/common/Badge";
import { fetchAdminDashboard, fetchAdminUsers, fetchAdminCourses, fetchAdminTransactions } from "../../features/admin/adminSlice";
import { formatCurrency, formatNumber, formatRelativeTime } from "../../utils/formatters";

function BarRow({ label, value, total, tone = "bg-quran-green" }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-semibold text-quran-text">{label}</span>
        <span className="text-quran-muted">
          {formatNumber(value)} <span className="text-xs">({pct}%)</span>
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-quran-soft">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function AdminOverviewPage() {
  const dispatch = useDispatch();
  const { dashboard, dashboardStatus, courses, logs } = useSelector((state) => state.admin);
  const { refunds } = useSelector((state) => state.payments);

  useEffect(() => {
    dispatch(fetchAdminDashboard());
    dispatch(fetchAdminUsers());
    dispatch(fetchAdminCourses());
    dispatch(fetchAdminTransactions());
  }, [dispatch]);

  const pendingRefunds = refunds.filter((r) => r.status === "pending").length;
  const topCourses = [...courses]
    .sort((a, b) => (b.enrolledStudents?.length || 0) - (a.enrolledStudents?.length || 0))
    .slice(0, 5);
  const recentLogs = [...logs].slice(0, 5);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="page-title">Admin overview</h1>
        <p className="page-subtitle">Platform-wide users, courses, revenue and activity.</p>
      </div>

      {dashboardStatus === "loading" && !dashboard && <LoadingSpinner label="Loading dashboard..." />}
      {dashboardStatus === "failed" && !dashboard && (
        <ErrorState message="Could not load the dashboard." onRetry={() => dispatch(fetchAdminDashboard())} />
      )}

      {dashboard && (
        <>
          <div className="stat-grid">
            <StatCard icon={Users} label="Total users" value={formatNumber(dashboard.users.total)} />
            <StatCard icon={GraduationCap} label="Active students" value={formatNumber(dashboard.users.students)} />
            <StatCard icon={Users} label="Active teachers" value={formatNumber(dashboard.users.teachers)} />
            <StatCard
              icon={ShieldCheck}
              label="Pending teacher requests"
              value={formatNumber(dashboard.kyc.pending)}
              changeTone={dashboard.kyc.pending > 0 ? "amber" : "green"}
              change={dashboard.kyc.pending > 0 ? "Needs review" : "All clear"}
            />
            <StatCard icon={BookOpen} label="Total courses" value={formatNumber(dashboard.courses.total)} />
            <StatCard icon={DollarSign} label="Total revenue" value={formatCurrency(dashboard.payments.totalRevenue)} />
          </div>

          <div className="two-col">
            <Card title="Registration trend" subtitle="Share of platform users by role">
              <div className="space-y-4">
                <BarRow label="Students" value={dashboard.users.students} total={dashboard.users.total} tone="bg-quran-green" />
                <BarRow label="Teachers" value={dashboard.users.teachers} total={dashboard.users.total} tone="bg-quran-teal" />
                <BarRow label="Admins" value={dashboard.users.admins} total={dashboard.users.total} tone="bg-quran-gold" />
              </div>
            </Card>

            <Card title="Revenue summary" subtitle="From completed transactions">
              <div className="space-y-4">
                <BarRow
                  label="Total revenue"
                  value={dashboard.payments.totalRevenue}
                  total={Math.max(dashboard.payments.totalRevenue, dashboard.payments.adminCommission, 1)}
                  tone="bg-quran-green"
                />
                <BarRow
                  label="Admin commission"
                  value={dashboard.payments.adminCommission}
                  total={Math.max(dashboard.payments.totalRevenue, dashboard.payments.adminCommission, 1)}
                  tone="bg-quran-teal"
                />
                <div className="flex items-center justify-between border-t border-quran-line pt-3 text-sm">
                  <span className="font-semibold text-quran-text">Completed payments</span>
                  <span className="font-black text-quran-text">{formatNumber(dashboard.payments.completedCount)}</span>
                </div>
              </div>
            </Card>
          </div>

          <div className="two-col">
            <Card
              title="Recent platform activity"
              subtitle="Demo data until a logs endpoint exists"
              action={
                <Link to="/admin/logs" className="text-sm font-bold text-quran-green hover:underline">
                  View all
                </Link>
              }
            >
              {recentLogs.length ? (
                <ul className="space-y-3">
                  {recentLogs.map((log) => (
                    <li key={log.id} className="flex items-start gap-3 text-sm">
                      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-quran-soft text-quran-green">
                        <Activity size={15} />
                      </span>
                      <div>
                        <p className="font-semibold text-quran-text">{log.event}</p>
                        <p className="text-xs text-quran-muted">
                          {log.actor} · {log.date}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState icon={Activity} title="No recent activity" />
              )}
            </Card>

            <Card
              title="Top courses"
              subtitle="By enrollment"
              action={
                <Link to="/admin/courses" className="text-sm font-bold text-quran-green hover:underline">
                  Manage courses
                </Link>
              }
            >
              {topCourses.length ? (
                <ul className="space-y-3">
                  {topCourses.map((course, index) => (
                    <li key={course._id} className="flex items-center justify-between gap-3 text-sm">
                      <div className="flex items-center gap-3">
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-quran-soft text-xs font-black text-quran-green">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-semibold text-quran-text">{course.courseName}</p>
                          <p className="text-xs text-quran-muted">{course.teacher?.fullName || "Unknown teacher"}</p>
                        </div>
                      </div>
                      <Badge tone="green" icon={TrendingUp}>
                        {formatNumber(course.enrolledStudents?.length || 0)} students
                      </Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState icon={BookOpen} title="No courses yet" />
              )}
            </Card>
          </div>

          <Card title="Refund requests" subtitle="Demo data — see Payments & refunds for details">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-quran-soft text-quran-amber">
                <RefreshCcw size={20} />
              </span>
              <div>
                <p className="text-xl font-black text-quran-text">{formatNumber(pendingRefunds)}</p>
                <p className="text-sm text-quran-muted">Pending refund {pendingRefunds === 1 ? "request" : "requests"} awaiting review</p>
              </div>
              <Link to="/admin/payments" className="ml-auto text-sm font-bold text-quran-green hover:underline">
                Review refunds
              </Link>
            </div>
          </Card>
        </>
      )}

      {!dashboard && dashboardStatus === "idle" && (
        <EmptyState icon={LayoutDashboard} title="No dashboard data" description="Data will appear once loaded." />
      )}
    </section>
  );
}
