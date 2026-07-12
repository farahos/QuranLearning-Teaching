import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BarChart3, BookOpen, DollarSign, Star, Users } from "lucide-react";
import { ReportFilters } from "../../components/reports/ReportFilters";
import { ReportSummaryCards } from "../../components/reports/ReportSummaryCards";
import { ReportTable } from "../../components/reports/ReportTable";
import { fetchCourses, fetchTeacherStudents } from "../../features/courses/courseSlice";
import { fetchTeacherReviews } from "../../features/teacher/teacherSlice";
import { getId } from "../../utils/courseUtils";
import { formatCurrency, formatPercent } from "../../utils/formatters";

const DEFAULT_FILTERS = { from: "", to: "", minPrice: "", maxPrice: "", courseId: "", category: "" };

// Deterministic pseudo-completion rate so the demo value stays stable across renders
// for the same course, instead of jumping around randomly. Clearly labeled as an
// estimate in the UI since there is no real lesson-progress backend yet.
function estimateCompletionRate(courseId) {
  let hash = 0;
  for (let i = 0; i < courseId.length; i += 1) hash = (hash * 31 + courseId.charCodeAt(i)) % 1000;
  return 45 + (hash % 50);
}

export function TeacherReportsPage() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const courses = useSelector((state) => state.courses.items);
  const coursesStatus = useSelector((state) => state.courses.status);
  const coursesError = useSelector((state) => state.courses.error);
  const studentsByCourse = useSelector((state) => state.courses.studentsByCourse);
  const reviews = useSelector((state) => state.teacher.reviews);
  const categories = useSelector((state) => state.categories.items);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  useEffect(() => {
    dispatch(fetchCourses());
    dispatch(fetchTeacherStudents());
    if (user?._id) dispatch(fetchTeacherReviews(user._id));
  }, [dispatch, user?._id]);

  const ownCourses = useMemo(() => courses.filter((course) => getId(course.teacher) === user?._id), [courses, user?._id]);

  const studentsByCourseId = useMemo(() => {
    const map = {};
    studentsByCourse.forEach((course) => {
      map[course._id] = course.enrolledStudents || [];
    });
    return map;
  }, [studentsByCourse]);

  const reviewsByCourseId = useMemo(() => {
    const map = {};
    reviews.forEach((review) => {
      const id = getId(review.course);
      if (!map[id]) map[id] = [];
      map[id].push(review.rating);
    });
    return map;
  }, [reviews]);

  const rows = useMemo(() => {
    return ownCourses
      .filter((course) => {
        if (filters.courseId && course._id !== filters.courseId) return false;
        if (filters.category && course.category !== filters.category) return false;
        if (filters.minPrice && Number(course.price) < Number(filters.minPrice)) return false;
        if (filters.maxPrice && Number(course.price) > Number(filters.maxPrice)) return false;
        return true;
      })
      .map((course) => {
        const students = (studentsByCourseId[course._id] || course.enrolledStudents || []).filter((enrollment) => {
          if (!filters.from && !filters.to) return true;
          const purchasedAt = enrollment.purchasedAt ? new Date(enrollment.purchasedAt) : null;
          if (!purchasedAt) return true;
          if (filters.from && purchasedAt < new Date(filters.from)) return false;
          if (filters.to && purchasedAt > new Date(`${filters.to}T23:59:59`)) return false;
          return true;
        });
        const enrollments = students.length;
        const revenue = enrollments * Number(course.price || 0);
        const courseRatings = reviewsByCourseId[course._id] || [];
        const avgRating = courseRatings.length ? courseRatings.reduce((sum, r) => sum + r, 0) / courseRatings.length : course.rating || 0;
        return {
          _id: course._id,
          courseName: course.courseName,
          category: course.category,
          enrollments,
          revenue,
          avgRating,
          completionRate: estimateCompletionRate(course._id),
        };
      });
  }, [ownCourses, studentsByCourseId, reviewsByCourseId, filters]);

  const totals = useMemo(
    () => ({
      courses: rows.length,
      enrollments: rows.reduce((sum, row) => sum + row.enrollments, 0),
      revenue: rows.reduce((sum, row) => sum + row.revenue, 0),
      avgRating: rows.length ? rows.reduce((sum, row) => sum + row.avgRating, 0) / rows.length : 0,
    }),
    [rows]
  );

  const columns = [
    { key: "courseName", header: "Course", render: (row) => <span className="font-bold text-quran-text">{row.courseName}</span> },
    { key: "category", header: "Category" },
    { key: "enrollments", header: "Enrollments" },
    { key: "revenue", header: "Revenue", render: (row) => formatCurrency(row.revenue) },
    { key: "avgRating", header: "Avg. rating", render: (row) => (row.avgRating ? row.avgRating.toFixed(1) : "New") },
    { key: "completionRate", header: "Completion rate (estimate)", render: (row) => formatPercent(row.completionRate) },
  ];

  return (
    <section className="space-y-6">
      <div>
        <h1 className="page-title">Reports</h1>
        <p className="page-subtitle">Enrollment, revenue and completion insights.</p>
      </div>

      <ReportFilters
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(DEFAULT_FILTERS)}
        courseOptions={ownCourses.map((course) => ({ value: course._id, label: course.courseName }))}
        categoryOptions={categories.map((category) => ({ value: category.name, label: category.name }))}
      />

      <ReportSummaryCards
        items={[
          { label: "Courses", value: totals.courses, icon: BookOpen },
          { label: "Enrollments", value: totals.enrollments, icon: Users },
          { label: "Revenue", value: formatCurrency(totals.revenue), icon: DollarSign },
          { label: "Avg. rating", value: totals.avgRating ? totals.avgRating.toFixed(1) : "New", icon: Star },
        ]}
      />

      <ReportTable
        title="Course performance"
        columns={columns}
        rows={rows}
        status={coursesStatus}
        error={coursesError}
        onRetry={() => dispatch(fetchCourses())}
        emptyTitle="No courses match these filters"
      />

      <p className="field-hint flex items-center gap-1.5">
        <BarChart3 size={14} aria-hidden="true" /> Completion rate is an estimate for demo purposes — there is no lesson-progress backend yet.
      </p>
    </section>
  );
}
