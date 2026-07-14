import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Award, Eye, Lock } from "lucide-react";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { fetchCourses } from "../../features/courses/courseSlice";
import { fetchCertificates, fetchProgressForCourses } from "../../features/student/studentSlice";
import { getId, countLessons } from "../../utils/courseUtils";
import { formatDateTime } from "../../utils/formatters";

export function StudentCertificatesPage() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { items: courses, status, error } = useSelector((state) => state.courses);
  const { freeEnrollments, progress, certificates, certificatesStatus } = useSelector((state) => state.student);
  const [previewCertificate, setPreviewCertificate] = useState(null);

  useEffect(() => {
    dispatch(fetchCourses());
    dispatch(fetchCertificates());
  }, [dispatch]);

  const userId = getId(user);

  const enrolledCourses = useMemo(() => {
    return courses.filter(
      (course) => (course.enrolledStudents || []).some((entry) => getId(entry.student ?? entry) === userId) || freeEnrollments.includes(course._id)
    );
  }, [courses, freeEnrollments, userId]);

  const enrolledCourseIds = useMemo(() => enrolledCourses.map((course) => course._id), [enrolledCourses]);
  useEffect(() => {
    if (enrolledCourseIds.length) dispatch(fetchProgressForCourses(enrolledCourseIds));
  }, [dispatch, enrolledCourseIds.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  if ((status === "loading" || certificatesStatus === "loading") && !courses.length) {
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

      {enrolledCourses.length ? (
        <div className="course-grid">
          {enrolledCourses.map((course) => {
            const entry = progress[course._id] || { completedSectionIds: [] };
            const total = countLessons(course) || (course.lessons || []).length;
            const completed = entry.completedSectionIds?.length || 0;
            const percent = total ? (completed / total) * 100 : 0;
            const certificate = certificates.find((cert) => getId(cert.course) === course._id);
            const unlocked = Boolean(certificate);
            const lessonsNeeded = Math.max(0, total - completed);

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
                <p className="mt-1 text-xs text-quran-muted">{Math.round(percent)}% complete · needs 100%</p>

                {unlocked ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="primary" size="sm" icon={Eye} onClick={() => setPreviewCertificate({ ...certificate, course })}>
                      View certificate
                    </Button>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-quran-muted">
                    Complete {lessonsNeeded} more lesson{lessonsNeeded === 1 ? "" : "s"} to unlock your certificate.
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
          description="Enroll in a course and complete all its lessons to earn a certificate."
          action={
            <Link to="/student/courses" className="btn-primary btn-sm">
              Browse courses
            </Link>
          }
        />
      )}

      <Modal open={!!previewCertificate} onClose={() => setPreviewCertificate(null)} title="Certificate of completion">
        {previewCertificate && (
          <div className="rounded-2xl border-2 border-quran-gold bg-quran-soft/40 p-8 text-center">
            <Award size={40} className="mx-auto text-quran-gold" />
            <p className="mt-3 text-xs font-black uppercase tracking-wide text-quran-muted">Certificate of completion</p>
            <h2 className="mt-2 text-2xl font-black text-quran-text">{user?.fullName}</h2>
            <p className="mt-1 text-sm text-quran-muted">has successfully completed</p>
            <h3 className="mt-1 text-lg font-black text-quran-green">{previewCertificate.course?.courseName}</h3>
            {previewCertificate.course?.teacher?.fullName && (
              <p className="mt-1 text-sm text-quran-muted">Instructor: {previewCertificate.course.teacher.fullName}</p>
            )}
            <p className="mt-4 text-xs text-quran-muted">Issued {formatDateTime(previewCertificate.issuedAt)}</p>
            <p className="mt-1 text-xs font-mono text-quran-muted">Certificate code: {previewCertificate.certificateCode}</p>
          </div>
        )}
      </Modal>
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
