import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({ page, pageSize, total, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-3 border-t border-quran-line px-1 pt-3 text-sm">
      <p className="text-quran-muted">
        Page <span className="font-bold text-quran-text">{page}</span> of {totalPages} · {total} total
      </p>
      <div className="flex items-center gap-2">
        <button type="button" className="btn-secondary btn-sm btn-icon" disabled={page <= 1} onClick={() => onPageChange(page - 1)} aria-label="Previous page">
          <ChevronLeft size={15} />
        </button>
        <button type="button" className="btn-secondary btn-sm btn-icon" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} aria-label="Next page">
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
