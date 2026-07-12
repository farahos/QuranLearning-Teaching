import { BookOpen, CheckCircle2, Clock, FileText, Layers, Lock, PlayCircle, Star, Users } from "lucide-react";
import { Avatar } from "../common/Avatar";
import { Badge } from "../common/Badge";
import { api } from "../../api/client";
import { formatCurrency } from "../../utils/formatters";
import { isFreeCourse } from "../../utils/courseUtils";

export function CourseDetails({ course, headerActions, ratingsSection }) {
  const teacher = course.teacher || {};

  return (
    <div className="space-y-6">
      <div className="card overflow-hidden">
        <div className="relative flex h-56 items-center justify-center bg-gradient-to-br from-emerald-50 to-amber-50 text-quran-green">
          {course.coverImageUrl ? (
            <img src={api.mediaUrl(course.coverImageUrl)} alt="" className="h-full w-full object-cover" />
          ) : (
            <BookOpen size={56} aria-hidden="true" />
          )}
        </div>
        <div className="space-y-4 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-quran-muted">{course.category}</p>
              <h1 className="mt-1 text-2xl font-black text-quran-text">{course.courseName}</h1>
              <p className="mt-2 max-w-2xl text-sm text-quran-muted">{course.description}</p>
            </div>
            <p className="shrink-0 text-2xl font-black text-quran-green">{isFreeCourse(course) ? "Free" : formatCurrency(course.price)}</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-quran-muted">
            <span className="flex items-center gap-1.5">
              <Star size={15} className="text-quran-gold" /> {course.rating || "New"} ({course.feedbackCount || 0} reviews)
            </span>
            <span className="flex items-center gap-1.5">
              <Users size={15} /> {course.enrolledStudents?.length || 0} students
            </span>
            {course.duration && (
              <span className="flex items-center gap-1.5">
                <Clock size={15} /> {course.duration}
              </span>
            )}
            {course.level && (
              <span className="flex items-center gap-1.5">
                <Layers size={15} /> {course.level}
              </span>
            )}
          </div>
          {headerActions && <div className="flex flex-wrap gap-2.5 pt-2">{headerActions}</div>}
        </div>
      </div>

      <div className="two-col">
        <div className="card-pad">
          <h2 className="text-base font-black text-quran-text">Teacher</h2>
          <div className="mt-3 flex items-center gap-3">
            <Avatar src={teacher.profileImageUrl ? api.mediaUrl(teacher.profileImageUrl) : ""} name={teacher.fullName} size="lg" />
            <div>
              <p className="font-black text-quran-text">{teacher.fullName || "Quran Connect teacher"}</p>
              <p className="text-sm text-quran-muted">
                {teacher.averageRating ? `${teacher.averageRating.toFixed(1)} rating` : "New teacher"} · {teacher.totalReviews || 0} reviews
              </p>
            </div>
          </div>
          {teacher.bio && <p className="mt-3 text-sm text-quran-muted">{teacher.bio}</p>}
        </div>

        <div className="card-pad">
          <h2 className="text-base font-black text-quran-text">What you'll learn</h2>
          <ul className="mt-3 space-y-2">
            {(course.learningOutcomes || []).map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-quran-muted">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-quran-green" /> {item}
              </li>
            ))}
            {!course.learningOutcomes?.length && <li className="text-sm text-quran-muted">No learning outcomes listed yet.</li>}
          </ul>
        </div>
      </div>

      <div className="card-pad">
        <h2 className="text-base font-black text-quran-text">Course content</h2>
        <div className="mt-3 space-y-3">
          {(course.playlists || []).map((playlist) => (
            <div key={playlist.id} className="rounded-lg border border-quran-line">
              <div className="flex items-center justify-between gap-2 bg-quran-soft px-3 py-2">
                <p className="text-sm font-black text-quran-text">{playlist.title}</p>
                {playlist.locked && <Badge tone="amber" icon={Lock}>Locked</Badge>}
              </div>
              <ul className="divide-y divide-quran-line">
                {(playlist.sections || []).map((section) => (
                  <li key={section.id} className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
                    <span className="flex items-center gap-2 text-quran-text">
                      <PlayCircle size={15} className="text-quran-muted" /> {section.title}
                    </span>
                    {section.preview ? <Badge tone="green">Free preview</Badge> : section.locked ? <Lock size={14} className="text-quran-muted" /> : null}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {!course.playlists?.length && <p className="text-sm text-quran-muted">Course content will be added soon.</p>}
        </div>
      </div>

      {course.materials?.length > 0 && (
        <div className="card-pad">
          <h2 className="text-base font-black text-quran-text">Materials</h2>
          <ul className="mt-3 space-y-2">
            {course.materials.map((material) => (
              <li key={material.id} className="flex items-center gap-2 text-sm text-quran-muted">
                <FileText size={15} className="text-quran-teal" /> {material.title} <span className="text-xs">({material.fileType})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {ratingsSection}
    </div>
  );
}
