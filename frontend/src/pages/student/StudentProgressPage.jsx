import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GraduationCap, ShieldCheck } from "lucide-react";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { Card } from "../../components/common/Card";
import { CourseProgress } from "../../components/courses/CourseProgress";
import { fetchCourses } from "../../features/courses/courseSlice";
import { fetchProgressForCourses } from "../../features/student/studentSlice";
import { getId, countLessons } from "../../utils/courseUtils";
import { formatRelativeTime } from "../../utils/formatters";

export function StudentProgressPage() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { items: courses, status, error } = useSelector((state) => state.courses);
  const { freeEnrollments, progress } = useSelector((state) => state.student);

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  const userId = getId(user);

  const enrolledCourses = useMemo(
    () => courses.filter((course) => (course.enrolledStudents || []).some((entry) => getId(entry.student ?? entry) === userId) || freeEnrollments.includes(course._id)),
    [courses, freeEnrollments, userId]
  );

  const enrolledCourseIds = useMemo(() => enrolledCourses.map((course) => course._id), [enrolledCourses]);
  useEffect(() => {
    if (enrolledCourseIds.length) dispatch(fetchProgressForCourses(enrolledCourseIds));
  }, [dispatch, enrolledCourseIds.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  const progressHistory = useMemo(() => {
    return Object.entries(progress)
      .filter(([, entry]) => entry.updatedAt)
      .map(([courseId, entry]) => ({
        courseId,
        courseName: courses.find((c) => c._id === courseId)?.courseName || "Course",
        updatedAt: entry.updatedAt,
      }))
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 8);
  }, [progress, courses]);

  const guardianSummary = useMemo(() => {
    const totalCompleted = Object.values(progress).reduce((sum, entry) => sum + (entry.completedSectionIds?.length || 0), 0);
    const activeDays = new Set(Object.values(progress).map((entry) => entry.updatedAt && new Date(entry.updatedAt).toDateString()).filter(Boolean)).size;
    const inProgress = enrolledCourses[0];
    return {
      studentName: user?.fullName || "Student",
      weeklyMemorizationTarget: inProgress ? `Continue "${inProgress.courseName}"` : "No active course yet",
      revisionStreakDays: activeDays,
      lastTeacherNote: totalCompleted > 0 ? `Completed ${totalCompleted} lesson${totalCompleted === 1 ? "" : "s"} so far — keep up the daily practice.` : "No activity recorded yet.",
    };
  }, [progress, enrolledCourses, user]);

  if (status === "loading" && !courses.length) {
    return (
      <section className="space-y-6">
        <PageHeader />
        <LoadingSpinner label="Loading progress..." />
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

      {enrolledCourses.length ? (
        <div className="space-y-5">
          {enrolledCourses.map((course) => {
            const entry = progress[course._id] || { completedSectionIds: [] };
            const total = countLessons(course);
            const completed = entry.completedSectionIds?.length || 0;
            const remaining = Math.max(0, total - completed);
            const percent = total ? (completed / total) * 100 : 0;
            const lastSection = entry.lastAccessedSectionId
              ? (course.playlists || []).flatMap((p) => p.sections || []).find((s) => s.id === entry.lastAccessedSectionId)
              : null;
            const estimatedMinutes = remaining * 10;

            return (
              <Card key={course._id}>
                <div className="two-col">
                  <CourseProgress course={course} progressPercent={percent} completedCount={completed} totalCount={total} />
                  <div className="space-y-2 text-sm text-quran-muted">
                    <p>
                      <span className="font-black text-quran-text">{completed}</span> completed · <span className="font-black text-quran-text">{remaining}</span> remaining
                    </p>
                    <p>Last accessed: {lastSection ? lastSection.title : "Not started yet"}</p>
                    <p>
                      Estimated time remaining: ~{estimatedMinutes} min <span className="text-xs">(rough estimate, 10 min/lesson)</span>
                    </p>
                    {(course.tajweedLevel || course.surah || course.juz) && (
                      <p className="rounded-md bg-quran-soft px-3 py-2 text-xs font-semibold text-quran-text">
                        Revision schedule: {course.tajweedLevel ? `${course.tajweedLevel} level` : ""}
                        {course.surah ? ` · Surah focus: ${course.surah}` : ""}
                        {course.juz ? ` · ${course.juz}` : ""}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={GraduationCap} title="No progress yet" description="Enroll in a course to start tracking your progress." />
      )}

      <Card title="Progress history" subtitle="Recent lesson activity">
        {progressHistory.length ? (
          <ul className="divide-y divide-quran-line">
            {progressHistory.map((entry) => (
              <li key={entry.courseId} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span className="font-semibold text-quran-text">{entry.courseName}</span>
                <span className="text-quran-muted">{formatRelativeTime(entry.updatedAt)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon={GraduationCap} title="No activity yet" description="Your lesson activity will show up here." />
        )}
      </Card>

      <Card
        title="Guardian progress summary"
        subtitle="Preview of what a guardian would see — not synced to any guardian account"
        action={<ShieldCheck size={18} className="text-quran-muted" aria-hidden="true" />}
      >
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-black uppercase tracking-wide text-quran-muted">Student</dt>
            <dd className="text-sm font-bold text-quran-text">{guardianSummary.studentName}</dd>
          </div>
          <div>
            <dt className="text-xs font-black uppercase tracking-wide text-quran-muted">This week's focus</dt>
            <dd className="text-sm font-bold text-quran-text">{guardianSummary.weeklyMemorizationTarget}</dd>
          </div>
          <div>
            <dt className="text-xs font-black uppercase tracking-wide text-quran-muted">Revision streak</dt>
            <dd className="text-sm font-bold text-quran-text">{guardianSummary.revisionStreakDays} active day{guardianSummary.revisionStreakDays === 1 ? "" : "s"}</dd>
          </div>
          <div>
            <dt className="text-xs font-black uppercase tracking-wide text-quran-muted">Latest note</dt>
            <dd className="text-sm font-bold text-quran-text">{guardianSummary.lastTeacherNote}</dd>
          </div>
        </dl>
      </Card>
    </section>
  );
}

function PageHeader() {
  return (
    <div>
      <h1 className="page-title">Progress</h1>
      <p className="page-subtitle">Completion, revision schedule and memorization targets.</p>
    </div>
  );
}
