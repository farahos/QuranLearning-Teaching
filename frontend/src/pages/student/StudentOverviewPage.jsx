import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Award, Bell, BookOpen, Flame, GraduationCap, LayoutDashboard } from "lucide-react";
import { StatCard } from "../../components/common/StatCard";
import { Card } from "../../components/common/Card";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { Badge } from "../../components/common/Badge";
import { CourseProgress } from "../../components/courses/CourseProgress";
import { CourseCard } from "../../components/courses/CourseCard";
import { fetchCourses } from "../../features/courses/courseSlice";
import { getId, isFreeCourse, certificateUnlocked, countLessons } from "../../utils/courseUtils";
import { formatRelativeTime } from "../../utils/formatters";

export function StudentOverviewPage() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { items: courses, status, error } = useSelector((state) => state.courses);
  const { favorites, freeEnrollments, progress } = useSelector((state) => state.student);
  const notifications = useSelector((state) => state.notifications.items);

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  const userId = getId(user);

  const isEnrolled = useMemo(
    () => (course) =>
      (course.enrolledStudents || []).some((entry) => getId(entry.student ?? entry) === userId) || freeEnrollments.includes(course._id),
    [freeEnrollments, userId]
  );

  const enrolledCourses = useMemo(() => courses.filter(isEnrolled), [courses, isEnrolled]);

  const progressFor = (course) => {
    const entry = progress[course._id];
    const total = countLessons(course);
    const completed = entry?.completedSectionIds?.length || 0;
    const percent = total ? (completed / total) * 100 : 0;
    return { completed, total, percent };
  };

  const completedCourses = enrolledCourses.filter((course) => {
    const { percent, total } = progressFor(course);
    return total > 0 && percent >= 100;
  });

  const certificatesEarned = enrolledCourses.filter((course) => {
    const { percent } = progressFor(course);
    return certificateUnlocked(course, percent);
  });

  const inProgressCourses = enrolledCourses.filter((course) => {
    const { percent } = progressFor(course);
    return percent > 0 && percent < 100;
  });

  const continueCourses = inProgressCourses.length ? inProgressCourses : enrolledCourses;

  // Rough demo estimate: count distinct recent-activity days across all courses' progress entries.
  const streak = useMemo(() => {
    const days = new Set(
      Object.values(progress)
        .map((entry) => entry.updatedAt)
        .filter(Boolean)
        .map((iso) => new Date(iso).toDateString())
    );
    return days.size;
  }, [progress]);

  const recommended = useMemo(() => {
    const notEnrolled = courses.filter((course) => !isEnrolled(course));
    const goalMatches = user?.learningGoal
      ? notEnrolled.filter((course) => course.category?.toLowerCase().includes(String(user.learningGoal).toLowerCase()))
      : [];
    const pool = goalMatches.length ? goalMatches : notEnrolled;
    return pool.slice(0, 3);
  }, [courses, isEnrolled, user]);

  const latestNotifications = notifications.slice(0, 3);

  if (status === "loading" && !courses.length) {
    return (
      <section className="space-y-6">
        <PageHeader />
        <LoadingSpinner label="Loading your dashboard..." />
      </section>
    );
  }

  if (status === "failed" && !courses.length) {
    return (
      <section className="space-y-6">
        <PageHeader />
        <ErrorState message={error} onRetry={() => dispatch(fetchCourses())} />
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <PageHeader />

      <div className="stat-grid">
        <StatCard icon={BookOpen} label="Enrolled courses" value={enrolledCourses.length} />
        <StatCard icon={GraduationCap} label="Completed courses" value={completedCourses.length} />
        <StatCard icon={Award} label="Certificates earned" value={certificatesEarned.length} />
        <StatCard icon={Flame} label="Learning streak" value={`${streak} ${streak === 1 ? "day" : "days"}`} helpText="Estimate based on recent activity" />
      </div>

      <Card title="Continue learning" subtitle="Pick up where you left off" action={<Link to="/student/progress" className="text-sm font-bold text-quran-green">View all</Link>}>
        {continueCourses.length ? (
          <div className="course-grid">
            {continueCourses.slice(0, 3).map((course) => {
              const { completed, total, percent } = progressFor(course);
              return <CourseProgress key={course._id} course={course} progressPercent={percent} completedCount={completed} totalCount={total} />;
            })}
          </div>
        ) : (
          <EmptyState
            icon={LayoutDashboard}
            title="No enrolled courses yet"
            description="Browse the catalog and start your first course."
            action={
              <Link to="/student/courses" className="btn-primary btn-sm">
                Browse courses
              </Link>
            }
          />
        )}
      </Card>

      <Card title="Recommended for you" subtitle="Based on your learning goal">
        {recommended.length ? (
          <div className="course-grid">
            {recommended.map((course) => (
              <CourseCard key={course._id} course={course} detailsTo={`/student/courses/${course._id}`} />
            ))}
          </div>
        ) : (
          <EmptyState icon={BookOpen} title="No recommendations yet" description="Check back once more courses are published." />
        )}
      </Card>

      <Card title="Notifications" subtitle="Latest updates" action={<Link to="/student/notifications" className="text-sm font-bold text-quran-green">View all</Link>}>
        {latestNotifications.length ? (
          <ul className="divide-y divide-quran-line">
            {latestNotifications.map((notification) => (
              <li key={notification.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-quran-text">{notification.title}</p>
                  <p className="truncate text-sm text-quran-muted">{notification.message}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {!notification.read && <Badge tone="green">New</Badge>}
                  <span className="text-xs font-semibold text-quran-muted">{formatRelativeTime(notification.createdAt)}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon={Bell} title="No notifications" description="You're all caught up." />
        )}
      </Card>
    </section>
  );
}

function PageHeader() {
  return (
    <div>
      <h1 className="page-title">Student overview</h1>
      <p className="page-subtitle">Your enrolled courses, progress and certificates.</p>
    </div>
  );
}
