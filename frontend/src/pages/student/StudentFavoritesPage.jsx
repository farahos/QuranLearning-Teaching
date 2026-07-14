import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { Button } from "../../components/common/Button";
import { useToast } from "../../components/common/Toast";
import { CourseCard } from "../../components/courses/CourseCard";
import { fetchCourses } from "../../features/courses/courseSlice";
import { fetchFavorites, toggleFavoriteThunk } from "../../features/student/studentSlice";

export function StudentFavoritesPage() {
  const dispatch = useDispatch();
  const toast = useToast();
  const { items: courses, status, error } = useSelector((state) => state.courses);
  const { favorites, favoritesStatus } = useSelector((state) => state.student);

  useEffect(() => {
    dispatch(fetchCourses());
    dispatch(fetchFavorites());
  }, [dispatch]);

  const favoriteCourses = courses.filter((course) => favorites.includes(course._id));

  function handleRemove(courseId) {
    dispatch(toggleFavoriteThunk(courseId));
    toast.info("Removed from favorites");
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="page-title">Favorites</h1>
        <p className="page-subtitle">Courses you've saved for later.</p>
      </div>

      {status === "loading" && !courses.length ? (
        <LoadingSpinner label="Loading favorites..." />
      ) : status === "failed" && !courses.length ? (
        <ErrorState message={error} onRetry={() => dispatch(fetchCourses())} />
      ) : favoriteCourses.length ? (
        <div className="course-grid">
          {favoriteCourses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              detailsTo={`/student/courses/${course._id}`}
              footer={
                <Button variant="secondary" size="sm" icon={Heart} onClick={() => handleRemove(course._id)} className="ml-auto">
                  Remove favorite
                </Button>
              }
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Heart}
          title="No favorites yet"
          description="Save courses you're interested in to find them here later."
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
