import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  BarChart3,
  BookOpen,
  DollarSign,
  FolderPlus,
  MessageSquareWarning,
  PlusCircle,
  Radio,
  Star,
  UploadCloud,
  Users,
  Wallet,
} from "lucide-react";
import { StatCard } from "../../components/common/StatCard";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Avatar } from "../../components/common/Avatar";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { ErrorState } from "../../components/common/ErrorState";
import { EmptyState } from "../../components/common/EmptyState";
import { fetchCourses, fetchTeacherStudents } from "../../features/courses/courseSlice";
import { fetchWallet, fetchTeacherReviews } from "../../features/teacher/teacherSlice";
import { getId } from "../../utils/courseUtils";
import { formatCurrency, formatDate } from "../../utils/formatters";

export function TeacherOverviewPage() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const courses = useSelector((state) => state.courses.items);
  const coursesStatus = useSelector((state) => state.courses.status);
  const coursesError = useSelector((state) => state.courses.error);
  const studentsByCourse = useSelector((state) => state.courses.studentsByCourse);
  const studentsStatus = useSelector((state) => state.courses.studentsStatus);
  const wallet = useSelector((state) => state.teacher.wallet);
  const walletStatus = useSelector((state) => state.teacher.walletStatus);
  const reviews = useSelector((state) => state.teacher.reviews);
  const reviewsStatus = useSelector((state) => state.teacher.reviewsStatus);
  const replies = useSelector((state) => state.teacher.replies);
  const liveSessions = useSelector((state) => state.teacher.liveSessions);

  useEffect(() => {
    dispatch(fetchCourses());
    dispatch(fetchTeacherStudents());
    dispatch(fetchWallet());
    if (user?._id) dispatch(fetchTeacherReviews(user._id));
  }, [dispatch, user?._id]);

  const ownCourses = useMemo(() => courses.filter((course) => getId(course.teacher) === user?._id), [courses, user?._id]);

  const totalStudents = useMemo(
    () => studentsByCourse.reduce((sum, course) => sum + (course.enrolledStudents?.length || 0), 0),
    [studentsByCourse]
  );

  const totalRevenue = useMemo(
    () => ownCourses.reduce((sum, course) => sum + Number(course.price || 0) * (course.enrolledStudents?.length || 0), 0),
    [ownCourses]
  );

  const pendingReviewsCount = useMemo(() => reviews.filter((review) => !replies[review._id]).length, [reviews, replies]);

  const recentEnrollments = useMemo(() => {
    const flat = [];
    studentsByCourse.forEach((course) => {
      (course.enrolledStudents || []).forEach((enrollment) => {
        flat.push({
          key: enrollment._id || `${course._id}-${enrollment.student?._id}`,
          courseName: course.courseName,
          studentName: enrollment.student?.fullName || "Student",
          profileImageUrl: enrollment.student?.profileImageUrl,
          purchasedAt: enrollment.purchasedAt,
        });
      });
    });
    return flat.sort((a, b) => new Date(b.purchasedAt || 0) - new Date(a.purchasedAt || 0)).slice(0, 6);
  }, [studentsByCourse]);

  const topCourses = useMemo(
    () =>
      [...ownCourses]
        .sort((a, b) => (b.enrolledStudents?.length || 0) - (a.enrolledStudents?.length || 0))
        .slice(0, 5),
    [ownCourses]
  );

  const initialLoading = coursesStatus === "loading" && !ownCourses.length;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="page-title">Teacher overview</h1>
        <p className="page-subtitle">Your courses, students, revenue and rating at a glance.</p>
      </div>

      {initialLoading ? (
        <LoadingSpinner label="Loading your dashboard..." />
      ) : coursesStatus === "failed" ? (
        <ErrorState message={coursesError} onRetry={() => dispatch(fetchCourses())} />
      ) : (
        <>
          <div className="stat-grid">
            <StatCard icon={BookOpen} label="Total courses" value={ownCourses.length} />
            <StatCard icon={Users} label="Total students" value={totalStudents} helpText={studentsStatus === "loading" ? "Refreshing..." : undefined} />
            <StatCard icon={DollarSign} label="Total revenue" value={formatCurrency(totalRevenue)} />
            <StatCard icon={Star} label="Average rating" value={user?.averageRating ? user.averageRating.toFixed(1) : "New"} helpText={`${user?.totalReviews || 0} reviews`} />
            <StatCard icon={MessageSquareWarning} label="Pending reviews" value={pendingReviewsCount} helpText={reviewsStatus === "loading" ? "Refreshing..." : "Awaiting your reply"} />
            <StatCard icon={Wallet} label="Wallet balance" value={walletStatus === "loading" ? "..." : formatCurrency(wallet?.walletBalance)} />
          </div>

          <div className="two-col">
            <Card title="Recent enrollments" subtitle="Latest students who joined your courses">
              {studentsStatus === "loading" && !studentsByCourse.length ? (
                <LoadingSpinner label="Loading enrollments..." />
              ) : studentsStatus === "failed" ? (
                <ErrorState message="Could not load enrollments" onRetry={() => dispatch(fetchTeacherStudents())} />
              ) : recentEnrollments.length ? (
                <ul className="space-y-3">
                  {recentEnrollments.map((enrollment) => (
                    <li key={enrollment.key} className="flex items-center gap-3">
                      <Avatar src={enrollment.profileImageUrl} name={enrollment.studentName} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-quran-text">{enrollment.studentName}</p>
                        <p className="truncate text-xs text-quran-muted">{enrollment.courseName}</p>
                      </div>
                      <span className="shrink-0 text-xs font-semibold text-quran-muted">{formatDate(enrollment.purchasedAt)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState icon={Users} title="No enrollments yet" description="Once students purchase your courses they'll show up here." />
              )}
            </Card>

            <Card title="Top performing courses" subtitle="Ranked by number of enrolled students">
              {topCourses.length ? (
                <ul className="space-y-3">
                  {topCourses.map((course) => (
                    <li key={course._id} className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-quran-text">{course.courseName}</p>
                        <p className="text-xs text-quran-muted">{course.category}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-black text-quran-text">{course.enrolledStudents?.length || 0} students</p>
                        <p className="text-xs text-quran-muted">{formatCurrency(course.price)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState icon={BookOpen} title="No courses yet" description="Create your first course to see performance here." />
              )}
            </Card>
          </div>

          <div className="two-col">
            <Card title="Upcoming live sessions" subtitle="Preview list — not yet backed by a live-session service">
              <Badge tone="amber" className="mb-3">Preview / demo data</Badge>
              {liveSessions?.length ? (
                <ul className="space-y-3">
                  {liveSessions.map((session) => (
                    <li key={session.id} className="flex items-center gap-3 rounded-lg border border-quran-line p-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-quran-soft text-quran-green">
                        <Radio size={16} aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-quran-text">{session.topic}</p>
                        <p className="truncate text-xs text-quran-muted">{session.courseTitle}</p>
                      </div>
                      <span className="shrink-0 text-xs font-semibold text-quran-muted">
                        {session.date} · {session.time}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState icon={Radio} title="No live sessions scheduled" />
              )}
            </Card>

            <Card title="Quick actions">
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <Link to="/teacher/courses/new" className="btn-primary">
                  <PlusCircle size={16} aria-hidden="true" /> Create course
                </Link>
                <Link to="/teacher/categories" className="btn-secondary">
                  <FolderPlus size={16} aria-hidden="true" /> Add category
                </Link>
                <Link to="/teacher/materials" className="btn-secondary">
                  <UploadCloud size={16} aria-hidden="true" /> Upload material
                </Link>
                <Link to="/teacher/reports" className="btn-secondary">
                  <BarChart3 size={16} aria-hidden="true" /> View reports
                </Link>
              </div>
            </Card>
          </div>
        </>
      )}
    </section>
  );
}
