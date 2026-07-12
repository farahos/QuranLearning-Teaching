import { LoadingSpinner } from "./LoadingSpinner";
import { ErrorState } from "./ErrorState";
import { EmptyState } from "./EmptyState";

export function DataTable({
  columns,
  rows = [],
  rowKey = "_id",
  status = "succeeded",
  error,
  onRetry,
  emptyTitle = "Nothing here yet",
  emptyDescription,
  emptyIcon,
  emptyAction,
}) {
  if (status === "loading") return <LoadingSpinner label="Loading..." />;
  if (status === "failed") return <ErrorState message={error} onRetry={onRetry} />;
  if (!rows.length) return <EmptyState title={emptyTitle} description={emptyDescription} icon={emptyIcon} action={emptyAction} />;

  return (
    <div className="overflow-x-auto rounded-xl border border-quran-line bg-white">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-quran-soft text-xs font-black uppercase tracking-wide text-quran-muted">
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col" className="whitespace-nowrap px-4 py-3">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-quran-line">
          {rows.map((row) => (
            <tr key={row[rowKey] ?? row.id} className="transition-colors hover:bg-quran-soft/50">
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-3 align-middle text-quran-text">
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
