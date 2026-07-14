import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Award, BookOpen, GraduationCap, Mic, ShieldCheck } from "lucide-react";
import { Button } from "../../components/common/Button";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { CourseCard } from "../../components/courses/CourseCard";
import { fetchCourses } from "../../features/courses/courseSlice";

const HIGHLIGHTS = [
  { icon: Mic, title: "Live recitation feedback", text: "Get Makharij and Tajweed corrections directly from your teacher." },
  { icon: GraduationCap, title: "Structured Hifz plans", text: "Daily memorization targets with revision tracking built in." },
  { icon: ShieldCheck, title: "Verified teachers", text: "Every teacher is reviewed and KYC-approved before teaching." },
  { icon: Award, title: "Certificates", text: "Earn a certificate once you complete a course's requirements." },
];

export function LandingPage() {
  const dispatch = useDispatch();
  const { items, status } = useSelector((state) => state.courses);
  const categories = useSelector((state) => state.categories.items);

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  return (
    <div>
      <section className="content-container grid gap-8 py-14 lg:grid-cols-2 lg:items-center">
        <div>
          <span className="badge-green">Online Quran learning platform</span>
          <h1 className="mt-4 text-3xl font-black leading-tight text-quran-text sm:text-4xl">Learn Quran, Tajweed and Hifz with dedicated teachers</h1>
          <p className="mt-3 max-w-lg text-quran-muted">
            Quran Connect pairs students with verified teachers for live recitation feedback, structured memorization plans, and trackable progress —
            all in one calm, focused workspace.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/register?role=student">
              <Button variant="primary">Start learning</Button>
            </Link>
            <Link to="/register?role=teacher">
              <Button variant="secondary">Teach on Quran Connect</Button>
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {HIGHLIGHTS.map((item) => (
            <div key={item.title} className="card-pad">
              <item.icon size={20} className="text-quran-green" />
              <p className="mt-3 text-sm font-black text-quran-text">{item.title}</p>
              <p className="mt-1 text-xs text-quran-muted">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="content-container pb-6">
        <h2 className="text-xl font-black text-quran-text">Explore categories</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.filter((c) => c.active).map((category) => (
            <div key={category.id} className="card-pad text-center">
              <BookOpen size={18} className="mx-auto text-quran-teal" />
              <p className="mt-2 text-sm font-black text-quran-text">{category.name}</p>
              <p className="mt-0.5 text-xs text-quran-muted">{category.courseCount || 0} courses</p>
            </div>
          ))}
        </div>
      </section>

      <section className="content-container pb-16">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-quran-text">Featured courses</h2>
          <Link to="/login" className="text-sm font-bold text-quran-green hover:underline">
            Sign in to enroll
          </Link>
        </div>
        <div className="mt-4">
          {status === "loading" ? (
            <LoadingSpinner label="Loading courses..." />
          ) : (
            <div className="course-grid">
              {items.slice(0, 6).map((course) => (
                <CourseCard
                  key={course._id}
                  course={course}
                  detailsTo={`/courses/${course._id}`}
                  footer={
                    <Link to={`/courses/${course._id}`} className="btn-secondary btn-sm w-full justify-center">
                      View details
                    </Link>
                  }
                />
              ))}
              {!items.length && <p className="text-sm text-quran-muted">No courses published yet — check back soon.</p>}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
