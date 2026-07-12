import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Award, Eye } from "lucide-react";
import { Badge } from "../../components/common/Badge";
import { Card } from "../../components/common/Card";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { FormField } from "../../components/common/FormField";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { fetchCourses, updateCourseLocal } from "../../features/courses/courseSlice";
import { getId } from "../../utils/courseUtils";

export function TeacherCertificatesPage() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const courses = useSelector((state) => state.courses.items);
  const status = useSelector((state) => state.courses.status);
  const error = useSelector((state) => state.courses.error);

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  const ownCourses = useMemo(() => courses.filter((course) => getId(course.teacher) === user?._id), [courses, user?._id]);

  function update(courseId, updates) {
    dispatch(updateCourseLocal({ id: courseId, updates }));
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="page-title">Certificates</h1>
        <p className="page-subtitle">Configure certificate rules for your courses.</p>
      </div>

      <p className="field-hint">
        Certificate delivery is enforced client-side only — there is no backend certificate endpoint yet, so these rules apply for this session.
      </p>

      {status === "loading" && !ownCourses.length ? (
        <LoadingSpinner label="Loading your courses..." />
      ) : status === "failed" ? (
        <ErrorState message={error} onRetry={() => dispatch(fetchCourses())} />
      ) : ownCourses.length ? (
        <div className="space-y-4">
          {ownCourses.map((course) => (
            <Card
              key={course._id}
              title={course.courseName}
              subtitle={course.category}
              action={<Badge tone={course.certificateEnabled ? "green" : "gray"}>{course.certificateEnabled ? "Certificate enabled" : "Disabled"}</Badge>}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="toggle inline-flex items-center gap-2.5 rounded-lg border border-quran-line bg-white px-3 py-2 text-sm font-bold text-quran-muted">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-quran-green"
                    checked={!!course.certificateEnabled}
                    onChange={(e) => update(course._id, { certificateEnabled: e.target.checked })}
                  />
                  Certificate enabled
                </label>
                <FormField
                  label="Minimum completion %"
                  type="number"
                  min="0"
                  max="100"
                  value={course.certificateMinCompletion ?? 100}
                  onChange={(e) => update(course._id, { certificateMinCompletion: Number(e.target.value) })}
                />
                <label className="toggle inline-flex items-center gap-2.5 rounded-lg border border-quran-line bg-white px-3 py-2 text-sm font-bold text-quran-muted">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-quran-green"
                    checked={!!course.certificateRequiresAllLessons}
                    onChange={(e) => update(course._id, { certificateRequiresAllLessons: e.target.checked })}
                  />
                  Requires all lessons completed
                </label>
                <label className="toggle inline-flex items-center gap-2.5 rounded-lg border border-quran-line bg-white px-3 py-2 text-sm font-bold text-quran-muted">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-quran-green"
                    checked={!!course.certificateRequiresAssessment}
                    onChange={(e) => update(course._id, { certificateRequiresAssessment: e.target.checked })}
                  />
                  Requires final assessment passed
                </label>
                <FormField
                  label="Certificate template URL"
                  value={course.certificateTemplateUrl || ""}
                  onChange={(e) => update(course._id, { certificateTemplateUrl: e.target.value })}
                  className="sm:col-span-2"
                />
              </div>
              <div className="mt-4 border-t border-quran-line pt-3">
                {course.certificateTemplateUrl ? (
                  <a href={course.certificateTemplateUrl} target="_blank" rel="noreferrer" className="btn-secondary btn-sm">
                    <Eye size={14} aria-hidden="true" /> Preview certificate
                  </a>
                ) : (
                  <button type="button" className="btn-secondary btn-sm" disabled title="Add a certificate template URL first">
                    <Eye size={14} aria-hidden="true" /> Preview certificate
                  </button>
                )}
                {!course.certificateTemplateUrl && <p className="field-hint mt-1">Add a template URL above to enable preview.</p>}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState icon={Award} title="No courses yet" description="Create a course first to configure its certificate rules." />
      )}
    </section>
  );
}
