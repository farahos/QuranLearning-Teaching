import { RotateCcw } from "lucide-react";
import { FormField } from "../common/FormField";
import { Select } from "../common/Select";
import { Button } from "../common/Button";

export function ReportFilters({ filters, onChange, onReset, courseOptions = [], categoryOptions = [], statusOptions = [], showPriceRange = true, showStatus = false }) {
  function setField(key, value) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="card-pad">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <FormField label="From date" type="date" value={filters.from || ""} onChange={(e) => setField("from", e.target.value)} />
        <FormField label="To date" type="date" value={filters.to || ""} onChange={(e) => setField("to", e.target.value)} />
        {showPriceRange && (
          <>
            <FormField label="Min price" type="number" value={filters.minPrice || ""} onChange={(e) => setField("minPrice", e.target.value)} />
            <FormField label="Max price" type="number" value={filters.maxPrice || ""} onChange={(e) => setField("maxPrice", e.target.value)} />
          </>
        )}
        {courseOptions.length > 0 && (
          <Select label="Course" value={filters.courseId || ""} onChange={(e) => setField("courseId", e.target.value)} options={[{ value: "", label: "All courses" }, ...courseOptions]} />
        )}
        {categoryOptions.length > 0 && (
          <Select label="Category" value={filters.category || ""} onChange={(e) => setField("category", e.target.value)} options={[{ value: "", label: "All categories" }, ...categoryOptions]} />
        )}
        {showStatus && (
          <Select label="Payment status" value={filters.status || ""} onChange={(e) => setField("status", e.target.value)} options={[{ value: "", label: "All statuses" }, ...statusOptions]} />
        )}
      </div>
      {onReset && (
        <div className="mt-3 flex justify-end">
          <Button variant="ghost" size="sm" icon={RotateCcw} onClick={onReset}>
            Reset filters
          </Button>
        </div>
      )}
    </div>
  );
}
