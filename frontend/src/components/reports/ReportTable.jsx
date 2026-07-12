import { Download, FileSpreadsheet } from "lucide-react";
import { DataTable } from "../common/DataTable";
import { Button } from "../common/Button";
import { useToast } from "../common/Toast";

export function ReportTable({ title, columns, rows, status, error, onRetry, emptyTitle = "No results for these filters" }) {
  const toast = useToast();

  // TODO(api): there is no export endpoint yet (GET /api/admin/reports/export).
  // These buttons are wired up but clearly labeled as not-yet-connected.
  function handleExport(format) {
    toast.info(`${format} export is not connected to the backend yet.`);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {title && <h2 className="text-base font-black text-quran-text">{title}</h2>}
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" icon={FileSpreadsheet} onClick={() => handleExport("CSV")}>
            Export CSV
          </Button>
          <Button variant="secondary" size="sm" icon={Download} onClick={() => handleExport("PDF")}>
            Export PDF
          </Button>
        </div>
      </div>
      <DataTable columns={columns} rows={rows} status={status} error={error} onRetry={onRetry} emptyTitle={emptyTitle} />
    </div>
  );
}
