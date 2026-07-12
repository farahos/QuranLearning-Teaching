import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Award, Download, Eye, Lock } from "lucide-react";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { fetchCourses } from "../../features/courses/courseSlice";
import { getId, countLessons, certificateUnlocked } from "../../utils/courseUtils";
import { api } from "../../api/client";

export function StudentCertificatesPage() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { items: courses, status, error } = useSelector((state) => state.courses);
  const { freeEnrollments, progress } = useSelector((state) => state.student);

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  const userId = getId(user);

  const certificateCourses = useMemo(() => {
    return courses
      .filter((course) => course.certificateEnabled)
      .filter((course) => (course.enrolledStudents || []).some((entry) => getId(entry.student ?? entry) === userId) || freeEnrollments.includes(course._id));
  }, [courses, freeEnrollments, userId]);

  if (status === "loading" && !courses.length) {
    return (
      <section className="space-y-6">
        <PageHeader />
        <LoadingSpinner label="Loading certificates..." />
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

      {certificateCourses.length ? (
        <div className="course-grid">
          {certificateCourses.map((course) => {
            const entry = progress[course._id] || { completedSectionIds: [] };
            const total = countLessons(course);
            const completed = entry.completedSectionIds?.length || 0;
            const percent = total ? (completed / total) * 100 : 0;
            const unlocked = certificateUnlocked(course, percent);
            const required = course.certificateMinCompletion ?? 100;
            const lessonsNeeded = Math.max(0, Math.ceil((required / 100) * total) - completed);

            return (
              <Card key={course._id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-quran-muted">{course.category}</p>
                    <h3 className="mt-1 text-base font-black text-quran-text">{course.courseName}</h3>
                  </div>
                  {unlocked ? <Badge tone="green" icon={Award}>Unlocked</Badge> : <Badge tone="amber" icon={Lock}>Locked</Badge>}
                </div>

                <div className="progress-line mt-4">
                  <span style={{ width: `${Math.min(100, percent)}%` }} />
                </div>
                <p className="mt-1 text-xs text-quran-muted">
                  {Math.round(percent)}% complete · needs {required}%
                </p>

                {unlocked ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Download}
                      disabled={!course.certificateTemplateUrl}
                      onClick={() => window.open(api.mediaUrl(course.certificateTemplateUrl), "_blank", "noopener")}
                    >
                      Download
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={Eye}
                      disabled={!course.certificateTemplateUrl}
                      onClick={() => window.open(api.mediaUrl(course.certificateTemplateUrl), "_blank", "noopener")}
                    >
                      Preview
                    </Button>
                    {!course.certificateTemplateUrl && (
                      <p className="w-full text-xs text-quran-muted">No certificate file yet — this needs the backend certificate endpoint to generate one.</p>
                    )}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-quran-muted">
                    Complete {lessonsNeeded} more lesson{lessonsNeeded === 1 ? "" : "s"} — currently at {Math.round(percent)}%, needs {required}%.
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Award}
          title="No certificates yet"
          description="Enroll in a course that offers a certificate to see it here."
          action={
            <Link to="/student/courses" className="btn-primary btn-sm">
              Browse courses
            </Link>
          }
        />
      )}
    </section>
  );
}

function PageHeader() {
  return (
    <div>
      <h1 className="page-title">Certificates</h1>
      <p className="page-subtitle">Locked and unlocked certificates.</p>
    </div>
  );
}
