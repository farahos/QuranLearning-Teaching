import { Bell, BookOpen, Download, GraduationCap, Heart, LayoutDashboard, MessageSquare, Star, UserCheck } from "lucide-react";
import { CourseCard, ProfilePanel, ProgressCard } from "../../components/CourseWidgets";
import { Card, MetricGrid, RowItem, Section } from "../../components/ui";

export const studentNav = [
  ["overview", LayoutDashboard, "Overview"],
  ["catalog", BookOpen, "Courses"],
  ["progress", GraduationCap, "Progress"],
  ["notifications", Bell, "Notifications"],
  ["profile", UserCheck, "Profile"],
];

export function StudentPage({ user, courses, active, updateCourse }) {
  const favoriteCourses = courses.filter((course) => course.favorite);

  if (active === "catalog") {
    return (
      <Section title="Courses">
        <div className="course-grid">
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} student onFavorite={() => updateCourse(course._id, { favorite: !course.favorite })} />
          ))}
        </div>
      </Section>
    );
  }

  if (active === "progress") {
    return (
      <Section title="View course progress">
        {courses.map((course) => (
          <ProgressCard key={course._id} course={course} />
        ))}
      </Section>
    );
  }

  if (active === "notifications") {
    return (
      <Section title="Notifications alert">
        <div className="list-card">
          <RowItem icon={Bell} title="New course published" meta="Tajweed Foundations is now available" action="View" />
          <RowItem icon={MessageSquare} title="Survey request" meta="Share feedback for your completed lesson" action="Open" />
          <RowItem icon={GraduationCap} title="Certificate ready" meta="Download certificate when progress reaches 100%" action="Check" />
        </div>
      </Section>
    );
  }

  if (active === "profile") return <ProfilePanel user={user} />;

  return (
    <Section title="Student overview">
      <MetricGrid metrics={[["Learning", courses.length, BookOpen], ["Favorites", favoriteCourses.length, Heart], ["Avg progress", `${Math.round(courses.reduce((sum, item) => sum + (item.progress || 0), 0) / courses.length)}%`, GraduationCap], ["Certificates", courses.filter((item) => item.progress >= 100 && item.certificateEnabled).length, Download]]} />
      <div className="two-column">
        <Card title="Favorite courses">
          {favoriteCourses.map((course) => (
            <RowItem key={course._id} icon={Heart} title={course.courseName} meta={`${course.progress || 0}% complete`} action="Continue" />
          ))}
        </Card>
        <Card title="Rating courses">
          {courses.map((course) => (
            <RowItem key={course._id} icon={Star} title={course.courseName} meta={`${course.rating || 0} current rating`} action="Rate" />
          ))}
        </Card>
      </div>
    </Section>
  );
}
