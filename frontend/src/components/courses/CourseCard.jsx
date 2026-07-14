import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Clock, Layers, Star, Users } from "lucide-react";
import { Badge, statusTone } from "../common/Badge";
import { formatCurrency } from "../../utils/formatters";
import { isFreeCourse } from "../../utils/courseUtils";
import { api } from "../../api/client";
import { COURSE_STATUS_LABELS } from "../../utils/constants";

export function CourseCard({ course, footer, showStatusBadge = false, detailsTo, onClick }) {
  const navigate = useNavigate();
  const cardClick = onClick || (detailsTo ? () => navigate(detailsTo) : null);

  function handleKeyDown(event) {
    if (!cardClick) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      cardClick();
    }
  }

  return (
    <article
      className={`card flex flex-col overflow-hidden ${cardClick ? "cursor-pointer transition hover:-translate-y-0.5 hover:shadow-lg" : ""}`}
      onClick={cardClick || undefined}
      onKeyDown={handleKeyDown}
      role={cardClick ? "button" : undefined}
      tabIndex={cardClick ? 0 : undefined}
    >
      <div className="relative flex h-40 items-center justify-center bg-gradient-to-br from-emerald-50 to-amber-50 text-quran-green">
        {course.coverImageUrl ? (
          <img
            src={api.mediaUrl(course.coverImageUrl)}
            alt=""
            className="h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <BookOpen size={40} aria-hidden="true" />
        )}
        <span className="absolute right-3 top-3 rounded-md bg-quran-ink/80 px-2 py-1 text-xs font-black text-white">
          {isFreeCourse(course) ? "Free" : formatCurrency(course.price)}
        </span>
        {showStatusBadge && course.status && (
          <span className="absolute left-3 top-3">
            <Badge tone={statusTone(course.status)}>{COURSE_STATUS_LABELS[course.status] || course.status}</Badge>
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-quran-muted">{course.category}</p>
          {detailsTo ? (
            <Link to={detailsTo} className="mt-1 block text-base font-black text-quran-text hover:text-quran-green" onClick={(event) => event.stopPropagation()}>
              {course.courseName}
            </Link>
          ) : (
            <h3 className="mt-1 text-base font-black text-quran-text">{course.courseName}</h3>
          )}
          <p className="mt-1 line-clamp-2 text-sm text-quran-muted">{course.shortDescription || course.description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-quran-muted">
          <span className="flex items-center gap-1">
            <Star size={13} className="text-quran-gold" aria-hidden="true" /> {course.rating || "New"}
          </span>
          <span className="flex items-center gap-1">
            <Users size={13} aria-hidden="true" /> {course.enrolledStudents?.length || 0}
          </span>
          {course.duration && (
            <span className="flex items-center gap-1">
              <Clock size={13} aria-hidden="true" /> {course.duration}
            </span>
          )}
          {course.level && (
            <span className="flex items-center gap-1">
              <Layers size={13} aria-hidden="true" /> {course.level}
            </span>
          )}
        </div>
        {footer && (
          <div className="mt-auto flex flex-wrap items-center gap-2 pt-1" onClick={(event) => event.stopPropagation()}>
            {footer}
          </div>
        )}
      </div>
    </article>
  );
}
