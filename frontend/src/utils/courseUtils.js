import { demoCourses } from "../data/demoData";

export function getId(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || value.id || "";
}

export function initials(name = "User") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function mergeCourseDefaults(courses) {
  return courses.map((course, index) => ({
    ...demoCourses[index % demoCourses.length],
    ...course,
    _id: course._id || course.id,
    enrolledStudents: course.enrolledStudents || [],
    playlists: course.playlists || demoCourses[index % demoCourses.length].playlists,
    materials: course.materials || demoCourses[index % demoCourses.length].materials,
  }));
}
