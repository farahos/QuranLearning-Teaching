import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BookOpen, Eye, Trash2, Star, Archive, CheckCircle2, XCircle, Users as UsersIcon } from "lucide-react";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { DataTable } from "../../components/common/DataTable";
import { Modal } from "../../components/common/Modal";
import { Pagination } from "../../components/common/Pagination";
import { Select } from "../../components/common/Select";
import { Textarea } from "../../components/common/Textarea";
import { useToast } from "../../components/common/Toast";
import { CourseFilters } from "../../components/courses/CourseFilters";
import { CourseDetails } from "../../components/courses/CourseDetails";
import { fetchAdminCourses, deleteAdminCourse } from "../../features/admin/adminSlice";
import { formatCurrency } from "../../utils/formatters";
import { withCourseExtras } from "../../utils/courseUtils";

const PAGE_SIZE = 10;
const emptyFilters = { search: "", category: "", teacherId: "" };

export function AdminCoursesPage() {
  const dispatch = useDispatch();
  const toast = useToast();
  const { courses, coursesStatus, error } = useSelector((state) => state.admin);

  const [filters, setFilters] = useState(emptyFilters);
  const [page, setPage] = useState(1);
  const [viewCourse, setViewCourse] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [moderation, setModeration] = useState({});
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectFeedback, setRejectFeedback] = useState("");

  useEffect(() => {
    dispatch(fetchAdminCourses());
  }, [dispatch]);

  const categories = useMemo(() => {
    const names = new Set(courses.map((c) => c.category).filter(Boolean));
    return [...names].map((name) => ({ name }));
  }, [courses]);

  const teacherOptions = useMemo(() => {
    const map = new Map();
    courses.forEach((c) => {
      if (c.teacher?._id) map.set(c.teacher._id, c.teacher.fullName);
    });
    return [...map.entries()].map(([value, label]) => ({ value, label }));
  }, [courses]);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      if (filters.search && !course.courseName?.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.category && course.category !== filters.category) return false;
      if (filters.teacherId && course.teacher?._id !== filters.teacherId) return false;
      return true;
    });
  }, [courses, filters]);

  const pagedCourses = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredCourses.slice(start, start + PAGE_SIZE);
  }, [filteredCourses, page]);

  function getFlags(id) {
    return moderation[id] || { featured: false, archived: false, decision: "" };
  }

  function setFlags(id, updates) {
    setModeration((prev) => ({ ...prev, [id]: { ...getFlags(id), ...updates } }));
  }

  function toggleFeature(course) {
    const current = getFlags(course._id);
    setFlags(course._id, { featured: !current.featured });
    toast.info(`Course ${current.featured ? "unfeatured" : "featured"} locally — not connected to the backend yet.`);
  }

  function toggleArchive(course) {
    const current = getFlags(course._id);
    setFlags(course._id, { archived: !current.archived });
    toast.info(`Course ${current.archived ? "unarchived" : "archived"} locally — not connected to the backend yet.`);
  }

  function approveCourse(course) {
    setFlags(course._id, { decision: "approved", feedback: "" });
    toast.info("Course marked approved locally — not connected to the backend yet.");
  }

  function openReject(course) {
    setRejectTarget(course);
    setRejectFeedback(getFlags(course._id).feedback || "");
  }

  function confirmReject() {
    setFlags(rejectTarget._id, { decision: "rejected", feedback: rejectFeedback.trim() });
    toast.info("Course marked rejected locally — not connected to the backend yet.");
    setRejectTarget(null);
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      await dispatch(deleteAdminCourse(deleteTarget._id)).unwrap();
      toast.success("Course removed");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err || "Could not remove course");
    } finally {
      setDeleting(false);
    }
  }

  const columns = [
    {
      key: "course",
      header: "Course",
      render: (row) => (
        <div>
          <p className="font-bold text-quran-text">{row.courseName}</p>
          <p className="text-xs text-quran-muted">{row.category}</p>
        </div>
      ),
    },
    { key: "teacher", header: "Teacher", render: (row) => row.teacher?.fullName || "—" },
    { key: "price", header: "Price", render: (row) => (Number(row.price) ? formatCurrency(row.price) : "Free") },
    {
      key: "enrolled",
      header: "Enrolled",
      render: (row) => (
        <span className="inline-flex items-center gap-1.5">
          <UsersIcon size={14} className="text-quran-muted" /> {row.enrolledStudents?.length || 0}
        </span>
      ),
    },
    {
      key: "flags",
      header: "Moderation (demo)",
      render: (row) => {
        const flags = getFlags(row._id);
        return (
          <div className="flex flex-wrap gap-1.5">
            {flags.featured && <Badge tone="amber">Featured</Badge>}
            {flags.archived && <Badge tone="gray">Archived</Badge>}
            {flags.decision === "approved" && <Badge tone="green">Approved</Badge>}
            {flags.decision === "rejected" && <Badge tone="red">Rejected</Badge>}
            {!flags.featured && !flags.archived && !flags.decision && <span className="text-xs text-quran-muted">—</span>}
          </div>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex flex-wrap items-center gap-1.5">
          <Button variant="ghost" size="sm" icon={Eye} iconOnly ariaLabel={`View ${row.courseName}`} onClick={() => setViewCourse(row)} />
          <Button variant="ghost" size="sm" icon={Star} iconOnly ariaLabel={`Feature ${row.courseName}`} onClick={() => toggleFeature(row)} />
          <Button variant="ghost" size="sm" icon={Archive} iconOnly ariaLabel={`Archive ${row.courseName}`} onClick={() => toggleArchive(row)} />
          <Button variant="ghost" size="sm" icon={CheckCircle2} iconOnly ariaLabel={`Approve ${row.courseName}`} onClick={() => approveCourse(row)} />
          <Button variant="ghost" size="sm" icon={XCircle} iconOnly ariaLabel={`Reject ${row.courseName}`} onClick={() => openReject(row)} />
          <Button variant="ghost" size="sm" icon={Trash2} iconOnly ariaLabel={`Remove ${row.courseName}`} onClick={() => setDeleteTarget(row)} />
        </div>
      ),
    },
  ];

  return (
    <section className="space-y-6">
      <div>
        <h1 className="page-title">Course moderation</h1>
        <p className="page-subtitle">Review, feature or remove courses.</p>
      </div>

      <Card>
        <div className="space-y-3">
          <CourseFilters filters={filters} onChange={setFilters} onReset={() => setFilters(emptyFilters)} categories={categories} showLevel={false} showPriceType={false} />
          <Select
            value={filters.teacherId}
            onChange={(e) => setFilters((f) => ({ ...f, teacherId: e.target.value }))}
            className="w-56"
            label="Teacher"
            options={[{ value: "", label: "All teachers" }, ...teacherOptions]}
          />
        </div>
      </Card>

      <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-quran-amber">
        Feature, archive and approve/reject actions are demo-only (no moderation endpoint exists yet). Only "Remove" is a real, destructive action.
      </p>

      <div className="space-y-3">
        <DataTable
          columns={columns}
          rows={pagedCourses}
          rowKey="_id"
          status={coursesStatus}
          error={error}
          onRetry={() => dispatch(fetchAdminCourses())}
          emptyIcon={BookOpen}
          emptyTitle="No courses found"
          emptyDescription="Try adjusting your filters."
        />
        <Pagination page={page} pageSize={PAGE_SIZE} total={filteredCourses.length} onPageChange={setPage} />
      </div>

      <Modal open={!!viewCourse} onClose={() => setViewCourse(null)} title={viewCourse?.courseName} size="xl">
        {viewCourse && <CourseDetails course={withCourseExtras(viewCourse)} />}
      </Modal>

      <Modal
        open={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        title="Reject course"
        description={rejectTarget ? `Provide feedback for ${rejectTarget.courseName}.` : ""}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRejectTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmReject}>
              Reject course
            </Button>
          </>
        }
      >
        <Textarea
          label="Feedback for the teacher"
          rows={4}
          value={rejectFeedback}
          onChange={(e) => setRejectFeedback(e.target.value)}
          hint="Demo only — there is no backend field to persist this feedback yet."
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove this course?"
        description={deleteTarget ? `This permanently deletes "${deleteTarget.courseName}". This cannot be undone.` : ""}
        confirmLabel="Remove course"
        tone="danger"
        loading={deleting}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </section>
  );
}
