import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "../../components/common/Badge";
import { Card } from "../../components/common/Card";
import { ErrorState } from "../../components/common/ErrorState";
import { FormField } from "../../components/common/FormField";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { Tabs } from "../../components/common/Tabs";
import { useToast } from "../../components/common/Toast";
import { CourseForm } from "../../components/courses/CourseForm";
import { MaterialManager } from "../../components/courses/MaterialManager";
import { PlaylistManager } from "../../components/courses/PlaylistManager";
import { createCourse, fetchCourseById, updateCourseLocal, updateCourseThunk } from "../../features/courses/courseSlice";

export function TeacherCourseEditorPage() {
  const { courseId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  const categories = useSelector((state) => state.categories.items);
  const saveStatus = useSelector((state) => state.courses.saveStatus);
  const course = useSelector((state) => {
    if (!courseId) return null;
    return state.courses.items.find((item) => item._id === courseId) || (state.courses.selected?._id === courseId ? state.courses.selected : null);
  });
  const fetchStatus = useSelector((state) => state.courses.status);

  const [tab, setTab] = useState("details");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (courseId && !course) {
      setLoadError("");
      dispatch(fetchCourseById(courseId))
        .unwrap()
        .catch((message) => setLoadError(message || "Could not load course"));
    }
  }, [courseId, course, dispatch]);

  const sectionOptions = useMemo(() => {
    const options = [];
    (course?.playlists || []).forEach((playlist) => {
      (playlist.sections || []).forEach((section) => {
        options.push({ value: section.id, label: `${playlist.title} — ${section.title}` });
      });
    });
    return options;
  }, [course]);

  function handleSubmit(payload) {
    if (courseId) {
      dispatch(updateCourseThunk({ id: courseId, payload }))
        .unwrap()
        .then(() => toast.success("Course updated"))
        .catch((message) => toast.error(message || "Could not update course"));
    } else {
      dispatch(createCourse(payload))
        .unwrap()
        .then((saved) => {
          toast.success("Course created");
          const newId = saved?._id || saved?.id;
          if (newId) navigate(`/teacher/courses/${newId}/edit`);
        })
        .catch((message) => toast.error(message || "Could not create course"));
    }
  }

  function updateCertificateField(field, value) {
    dispatch(updateCourseLocal({ id: courseId, updates: { [field]: value } }));
  }

  if (courseId && !course && fetchStatus === "loading") {
    return (
      <section className="space-y-6">
        <div>
          <h1 className="page-title">Course editor</h1>
          <p className="page-subtitle">Build out playlists, sections and materials.</p>
        </div>
        <LoadingSpinner label="Loading course..." />
      </section>
    );
  }

  if (courseId && !course && loadError) {
    return (
      <section className="space-y-6">
        <div>
          <h1 className="page-title">Course editor</h1>
          <p className="page-subtitle">Build out playlists, sections and materials.</p>
        </div>
        <ErrorState message={loadError} onRetry={() => dispatch(fetchCourseById(courseId))} />
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="page-title">{courseId ? "Edit course" : "Create course"}</h1>
        <p className="page-subtitle">Build out playlists, sections and materials.</p>
      </div>

      {courseId && course ? (
        <>
          <Tabs
            value={tab}
            onChange={setTab}
            tabs={[
              { value: "details", label: "Details" },
              { value: "playlists", label: "Playlists" },
              { value: "materials", label: "Materials" },
              { value: "certificate", label: "Certificate" },
            ]}
          />

          {tab === "details" && (
            <Card>
              <CourseForm
                course={course}
                categories={categories}
                onSubmit={handleSubmit}
                onCancel={() => navigate("/teacher/courses")}
                loading={saveStatus === "loading"}
                submitLabel="Save changes"
              />
            </Card>
          )}

          {tab === "playlists" && (
            <Card
              title="Playlists & sections"
              subtitle="Organize your lessons into playlists"
              action={<Badge tone="amber">Session only — not saved to server</Badge>}
            >
              <PlaylistManager
                playlists={course.playlists || []}
                onChange={(next) => dispatch(updateCourseLocal({ id: courseId, updates: { playlists: next } }))}
              />
            </Card>
          )}

          {tab === "materials" && (
            <Card
              title="Course materials"
              subtitle="Attach downloadable PDFs, slides and more"
              action={<Badge tone="amber">Session only — not saved to server</Badge>}
            >
              <MaterialManager
                materials={course.materials || []}
                sectionOptions={sectionOptions}
                onChange={(next) => dispatch(updateCourseLocal({ id: courseId, updates: { materials: next } }))}
              />
            </Card>
          )}

          {tab === "certificate" && (
            <Card
              title="Certificate rules"
              subtitle="Configure when students unlock a certificate"
              action={<Badge tone="amber">Session only — not saved to server</Badge>}
            >
              <div className="space-y-4">
                <label className="toggle inline-flex items-center gap-2.5 rounded-lg border border-quran-line bg-white px-3 py-2 text-sm font-bold text-quran-muted">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-quran-green"
                    checked={!!course.certificateEnabled}
                    onChange={(e) => updateCertificateField("certificateEnabled", e.target.checked)}
                  />
                  Certificate enabled
                </label>
                <FormField
                  label="Minimum completion required"
                  type="number"
                  min="0"
                  max="100"
                  value={course.certificateMinCompletion ?? 100}
                  hint="Percentage of the course a student must complete"
                  onChange={(e) => updateCertificateField("certificateMinCompletion", Number(e.target.value))}
                  className="max-w-xs"
                />
                <label className="toggle inline-flex items-center gap-2.5 rounded-lg border border-quran-line bg-white px-3 py-2 text-sm font-bold text-quran-muted">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-quran-green"
                    checked={!!course.certificateRequiresAllLessons}
                    onChange={(e) => updateCertificateField("certificateRequiresAllLessons", e.target.checked)}
                  />
                  Requires all lessons completed
                </label>
                <label className="toggle inline-flex items-center gap-2.5 rounded-lg border border-quran-line bg-white px-3 py-2 text-sm font-bold text-quran-muted">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-quran-green"
                    checked={!!course.certificateRequiresAssessment}
                    onChange={(e) => updateCertificateField("certificateRequiresAssessment", e.target.checked)}
                  />
                  Requires final assessment passed
                </label>
                <FormField
                  label="Certificate template URL"
                  value={course.certificateTemplateUrl || ""}
                  hint="Used for the 'Preview certificate' action on the Certificates page"
                  onChange={(e) => updateCertificateField("certificateTemplateUrl", e.target.value)}
                />
                <p className="field-hint">
                  Certificate rules are enforced client-side only for now — there is no backend certificate endpoint yet.
                </p>
              </div>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <CourseForm categories={categories} onSubmit={handleSubmit} onCancel={() => navigate("/teacher/courses")} loading={saveStatus === "loading"} submitLabel="Create course" />
          <p className="field-hint mt-4">
            Save the course first to unlock the Playlists, Materials and Certificate tabs.
          </p>
        </Card>
      )}
    </section>
  );
}
