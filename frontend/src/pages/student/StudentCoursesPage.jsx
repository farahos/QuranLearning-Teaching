import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";
import { BookOpen, Heart } from "lucide-react";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { Button } from "../../components/common/Button";
import { CourseFilters } from "../../components/courses/CourseFilters";
import { CourseCard } from "../../components/courses/CourseCard";
import { fetchCourses } from "../../features/courses/courseSlice";
import { toggleFavorite } from "../../features/student/studentSlice";
import { useToast } from "../../components/common/Toast";
import { isFreeCourse } from "../../utils/courseUtils";
import { QURAN_CATEGORIES } from "../../utils/constants";

export function StudentCoursesPage() {
  const dispatch = useDispatch();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const { items: courses, status, error } = useSelector((state) => state.courses);
  const favorites = useSelector((state) => state.student.favorites);

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: "",
    level: "",
    priceType: "",
    sort: "newest",
  });

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  const categories = useMemo(() => QURAN_CATEGORIES.map((name) => ({ name })), []);

  const filteredCourses = useMemo(() => {
    let list = [...courses];
    const search = filters.search.trim().toLowerCase();
    if (search) {
      list = list.filter(
        (course) =>
          course.courseName?.toLowerCase().includes(search) ||
          course.description?.toLowerCase().includes(search) ||
          course.category?.toLowerCase().includes(search)
      );
    }
    if (filters.category) list = list.filter((course) => course.category === filters.category);
    if (filters.level) list = list.filter((course) => course.level === filters.level);
    if (filters.priceType === "free") list = list.filter((course) => isFreeCourse(course));
    if (filters.priceType === "paid") list = list.filter((course) => !isFreeCourse(course));

    switch (filters.sort) {
      case "rating":
        list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "price":
        list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
        break;
      case "newest":
      default:
        list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
    return list;
  }, [courses, filters]);

  function handleToggleFavorite(courseId) {
    dispatch(toggleFavorite(courseId));
    const nowFavorite = !favorites.includes(courseId);
    toast.info(nowFavorite ? "Added to favorites (demo only — not connected to the backend yet)" : "Removed from favorites (demo only — not connected to the backend yet)");
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="page-title">Course catalog</h1>
        <p className="page-subtitle">Browse published courses from verified teachers.</p>
      </div>

      <CourseFilters
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters({ search: "", category: "", level: "", priceType: "", sort: "newest" })}
        categories={categories}
        showLevel
        showPriceType
        showSort
      />

      {status === "loading" && !courses.length ? (
        <LoadingSpinner label="Loading courses..." />
      ) : status === "failed" && !courses.length ? (
        <ErrorState message={error} onRetry={() => dispatch(fetchCourses())} />
      ) : filteredCourses.length ? (
        <div className="course-grid">
          {filteredCourses.map((course) => {
            const isFavorite = favorites.includes(course._id);
            return (
              <CourseCard
                key={course._id}
                course={course}
                detailsTo={`/student/courses/${course._id}`}
                footer={
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      iconOnly
                      ariaLabel={isFavorite ? "Remove from favorites" : "Add to favorites"}
                      icon={Heart}
                      className={isFavorite ? "text-quran-red" : ""}
                      onClick={() => handleToggleFavorite(course._id)}
                    />
                    <Link to={`/student/courses/${course._id}`} className="btn-secondary btn-sm ml-auto">
                      View details
                    </Link>
                  </>
                }
              />
            );
          })}
        </div>
      ) : (
        <EmptyState icon={BookOpen} title="No courses found" description="Try adjusting your search or filters." />
      )}
    </section>
  );
}
