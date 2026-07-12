import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FileText } from "lucide-react";
import { Card } from "../../components/common/Card";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { Select } from "../../components/common/Select";
import { MaterialManager } from "../../components/courses/MaterialManager";
import { fetchCourses, updateCourseLocal } from "../../features/courses/courseSlice";
import { getId } from "../../utils/courseUtils";

export function TeacherMaterialsPage() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const courses = useSelector((state) => state.courses.items);
  const status = useSelector((state) => state.courses.status);
  const error = useSelector((state) => state.courses.error);

  const [selectedCourseId, setSelectedCourseId] = useState("");

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  const ownCourses = useMemo(() => courses.filter((course) => getId(course.teacher) === user?._id), [courses, user?._id]);

  useEffect(() => {
    if (!selectedCourseId && ownCourses.length) setSelectedCourseId(ownCourses[0]._id);
  }, [ownCourses, selectedCourseId]);

  const selectedCourse = ownCourses.find((course) => course._id === selectedCourseId);

  const sectionOptions = useMemo(() => {
    const options = [];
    (selectedCourse?.playlists || []).forEach((playlist) => {
      (playlist.sections || []).forEach((section) => {
        options.push({ value: section.id, label: `${playlist.title} — ${section.title}` });
      });
    });
    return options;
  }, [selectedCourse]);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="page-title">Materials</h1>
        <p className="page-subtitle">Upload and manage downloadable course materials.</p>
      </div>

      {status === "loading" && !ownCourses.length ? (
        <LoadingSpinner label="Loading your courses..." />
      ) : status === "failed" ? (
        <ErrorState message={error} onRetry={() => dispatch(fetchCourses())} />
      ) : !ownCourses.length ? (
        <EmptyState icon={FileText} title="No courses yet" description="Create a course first to attach materials to it." />
      ) : (
        <>
          <Card>
            <Select
              label="Course"
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              options={ownCourses.map((course) => ({ value: course._id, label: course.courseName }))}
              className="max-w-md"
            />
          </Card>

          {selectedCourse && (
            <Card title={`Materials for ${selectedCourse.courseName}`} subtitle="Session-only until the backend supports document uploads">
              <MaterialManager
                materials={selectedCourse.materials || []}
                sectionOptions={sectionOptions}
                onChange={(next) => dispatch(updateCourseLocal({ id: selectedCourse._id, updates: { materials: next } }))}
              />
            </Card>
          )}
        </>
      )}
    </section>
  );
}
