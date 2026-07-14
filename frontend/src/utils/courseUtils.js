import { COURSE_STATUS } from "./constants";
import { demoCourseExtras } from "../data/demoData";

export function getId(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || value.id || "";
}

export function isFreeCourse(course) {
  return !course?.price || Number(course.price) === 0;
}

export function lessonsToPlaylist(course) {
  const lessons = Array.isArray(course?.lessons) ? course.lessons : [];
  if (!lessons.length) return null;
  return {
    id: `server-lessons-${getId(course) || "course"}`,
    title: "Lessons",
    description: "Course videos and lesson content.",
    order: 1,
    locked: false,
    preview: true,
    sections: lessons.map((lesson, index) => ({
      id: lesson._id || lesson.id || `lesson-${index + 1}`,
      title: lesson.title || `Lesson ${index + 1}`,
      type: lesson.type || "video",
      videoUrl: lesson.videoUrl || "",
      description: lesson.description || "",
      locked: !!lesson.locked,
      preview: lesson.preview ?? index === 0,
      completed: false,
    })),
  };
}

export function playlistsToLessons(playlists = []) {
  return playlists.flatMap((playlist) =>
    (playlist.sections || [])
      .filter((section) => section.title?.trim())
      .map((section) => ({
        title: section.title.trim(),
        type: section.type || "video",
        videoUrl: section.videoUrl || "",
        description: section.description || "",
        locked: !!section.locked,
        preview: !!section.preview,
      }))
  );
}

/**
 * The backend Course schema only stores { courseName, description, price,
 * category, coverImageUrl, introVideoUrl, lessons, enrolledStudents }. Fields
 * like playlists/sections/materials/status/level/certificate settings have no
 * server-side home yet, so this merges deterministic demo defaults onto real
 * course records purely for frontend presentation. Anything a teacher edits in
 * these extra fields is kept in Redux for the session only (see courseSlice)
 * and is never presented as "saved" beyond the fields the API actually accepts.
 */
export function withCourseExtras(course, index = 0) {
  const template = demoCourseExtras[index % demoCourseExtras.length];
  const serverPlaylist = lessonsToPlaylist(course);
  return {
    status: COURSE_STATUS.PUBLISHED,
    level: template.level,
    language: template.language,
    duration: template.duration,
    shortDescription: template.shortDescription,
    learningOutcomes: template.learningOutcomes,
    requirements: template.requirements,
    certificateEnabled: template.certificateEnabled,
    certificateRequiresAllLessons: template.certificateRequiresAllLessons,
    certificateMinCompletion: template.certificateMinCompletion,
    downloadableMaterials: template.downloadableMaterials,
    playlists: serverPlaylist ? [serverPlaylist] : template.playlists,
    materials: template.materials,
    surah: template.surah,
    juz: template.juz,
    tajweedLevel: template.tajweedLevel,
    featured: false,
    ...course,
    _id: getId(course) || course?._id,
    enrolledStudents: course?.enrolledStudents || [],
    // ratingAverage/reviewCount are computed live by the backend from real
    // Review documents; prefer them over the demo placeholders above.
    rating: typeof course?.ratingAverage === "number" ? course.ratingAverage : 0,
    feedbackCount: typeof course?.reviewCount === "number" ? course.reviewCount : 0,
  };
}

export function courseStatusTone(status) {
  if (status === COURSE_STATUS.PUBLISHED) return "green";
  if (status === COURSE_STATUS.ARCHIVED) return "gray";
  return "amber";
}

export function countLessons(course) {
  return (course?.playlists || []).reduce((sum, playlist) => sum + (playlist.sections?.length || 0), 0);
}
