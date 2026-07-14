import { Link } from "react-router-dom";
import { Award, PlayCircle } from "lucide-react";

export function CourseProgress({ course, progressPercent = 0, completedCount = 0, totalCount = 0 }) {
  const unlocked = totalCount > 0 && progressPercent >= 100;

  return (
    <div className="card-pad">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-quran-text">{course.courseName}</p>
          <p className="text-xs text-quran-muted">
            {completedCount}/{totalCount} lessons complete
          </p>
        </div>
        <span className="shrink-0 text-sm font-black text-quran-green">{Math.round(progressPercent)}%</span>
      </div>
      <div className="progress-line mt-3">
        <span style={{ width: `${Math.min(100, progressPercent)}%` }} />
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <Link to={`/student/learning/${course._id}`} className="btn-secondary btn-sm">
          <PlayCircle size={14} /> Continue
        </Link>
        {totalCount > 0 && (
          <span className={`flex items-center gap-1 text-xs font-bold ${unlocked ? "text-quran-green" : "text-quran-muted"}`}>
            <Award size={13} /> {unlocked ? "Certificate ready" : "Certificate locked"}
          </span>
        )}
      </div>
    </div>
  );
}
