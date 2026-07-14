import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Archive, BookOpen, Eye, Pencil, Plus, Send, Trash2 } from "lucide-react";
import { Badge, statusTone } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { Modal } from "../../components/common/Modal";
import { useToast } from "../../components/common/Toast";
import { CourseCard } from "../../components/courses/CourseCard";
import { CourseDetails } from "../../components/courses/CourseDetails";
import { CourseFilters } from "../../components/courses/CourseFilters";
import { deleteCourseThunk, fetchCourses, resetCourseFilters, setCourseFilters, updateCourseLocal } from "../../features/courses/courseSlice";
import { COURSE_STATUS, COURSE_STATUS_LABELS } from "../../utils/constants";
import { getId } from "../../utils/courseUtils";

export function TeacherCoursesPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const user = useSelector((state) => state.auth.user);
  const courses = useSelector((state) => state.courses.items);
  const status = useSelector((state) => state.courses.status);
  const error = useSelector((state) => state.courses.error);
  const filters = useSelector((state) => state.courses.filters);
  const categories = useSelector((state) => state.categories.items);

  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [previewCourse, setPreviewCourse] = useState(null);

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  const ownCourses = useMemo(() => courses.filter((course) => getId(course.teacher) === user?._id), [courses, user?._id]);

  const filteredCourses = useMemo(() => {
    return ownCourses.filter((course) => {
      const term = (filters.search || "").trim().toLowerCase();
      if (term && !course.courseName?.toLowerCase().includes(term) && !course.description?.toLowerCase().includes(term)) return false;
      if (filters.category && course.category !== filters.category) return false;
      if (filters.level && course.level !== filters.level) return false;
      if (filters.status && course.status !== filters.status) return false;
      if (filters.priceType === "free" && Number(course.price) > 0) return false;
      if (filters.priceType === "paid" && Number(course.price) <= 0) return false;
      return true;
    });
  }, [ownCourses, filters]);

  function handleDelete() {
    dispatch(deleteCourseThunk(pendingDeleteId))
      .unwrap()
      .then(() => {
        toast.success("Course deleted");
        setPendingDeleteId(null);
      })
      .catch((message) => toast.error(message || "Could not delete course"));
  }

  function cycleStatus(course) {
    const order = [COURSE_STATUS.DRAFT, COURSE_STATUS.PUBLISHED, COURSE_STATUS.ARCHIVED];
    const nextIndex = (order.indexOf(course.status) + 1) % order.length;
    const nextStatus = order[nextIndex];
    dispatch(updateCourseLocal({ id: course._id, updates: { status: nextStatus } }));
    toast.info(`Marked as ${COURSE_STATUS_LABELS[nextStatus]} (demo only — status isn't persisted by the backend yet)`);
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="page-title">Courses</h1>
          <p className="page-subtitle">Create, edit and publish your courses.</p>
        </div>
        <Link to="/teacher/courses/new" className="btn-primary">
          <Plus size={16} aria-hidden="true" /> Create course
        </Link>
      </div>

      <CourseFilters
        filters={filters}
        onChange={(next) => dispatch(setCourseFilters(next))}
        onReset={() => dispatch(resetCourseFilters())}
        categories={categories}
        showStatus
      />

      {status === "loading" && !ownCourses.length ? (
        <LoadingSpinner label="Loading your courses..." />
      ) : status === "failed" ? (
        <ErrorState message={error} onRetry={() => dispatch(fetchCourses())} />
      ) : filteredCourses.length ? (
        <div className="course-grid">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              showStatusBadge
              onClick={() => setPreviewCourse(course)}
              footer={
                <>
                  <Badge tone={statusTone(course.status)}>{COURSE_STATUS_LABELS[course.status] || course.status}</Badge>
                  <Button variant="secondary" size="sm" icon={Eye} onClick={() => setPreviewCourse(course)}>
                    Preview
                  </Button>
                  <Button variant="secondary" size="sm" icon={Pencil} onClick={() => navigate(`/teacher/courses/${course._id}/edit`)}>
                    Edit
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={course.status === COURSE_STATUS.PUBLISHED ? Archive : Send}
                    onClick={() => cycleStatus(course)}
                  >
                    {course.status === COURSE_STATUS.DRAFT ? "Publish" : course.status === COURSE_STATUS.PUBLISHED ? "Archive" : "Set draft"}
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    iconOnly
                    icon={Trash2}
                    ariaLabel={`Delete ${course.courseName}`}
                    onClick={() => setPendingDeleteId(course._id)}
                    className="ml-auto"
                  />
                </>
              }
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No courses found"
          description="Try adjusting your filters, or create your first course."
          action={
            <Link to="/teacher/courses/new" className="btn-primary">
              <Plus size={16} aria-hidden="true" /> Create course
            </Link>
          }
        />
      )}

      <Modal open={Boolean(previewCourse)} onClose={() => setPreviewCourse(null)} title={previewCourse?.courseName} size="xl">
        {previewCourse && <CourseDetails course={previewCourse} canAccessPaidContent teacherPreviewMode />}
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingDeleteId)}
        title="Delete course?"
        description="This permanently deletes the course from the server. This cannot be undone."
        confirmLabel="Delete course"
        onClose={() => setPendingDeleteId(null)}
        onConfirm={handleDelete}
      />
    </section>
  );
}
