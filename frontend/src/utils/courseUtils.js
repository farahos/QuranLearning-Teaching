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
    playlists: template.playlists,
    materials: template.materials,
    surah: template.surah,
    juz: template.juz,
    tajweedLevel: template.tajweedLevel,
    featured: false,
    rating: 0,
    feedbackCount: 0,
    ...course,
    _id: getId(course) || course?._id,
    enrolledStudents: course?.enrolledStudents || [],
  };
}

export function courseStatusTone(status) {
  if (status === COURSE_STATUS.PUBLISHED) return "green";
  if (status === COURSE_STATUS.ARCHIVED) return "gray";
  return "amber";
}

export function certificateUnlocked(course, progressPercent) {
  if (!course?.certificateEnabled) return false;
  const required = course.certificateMinCompletion ?? 100;
  return Number(progressPercent || 0) >= required;
}

export function countLessons(course) {
  return (course?.playlists || []).reduce((sum, playlist) => sum + (playlist.sections?.length || 0), 0);
}
