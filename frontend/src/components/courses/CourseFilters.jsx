import { RotateCcw } from "lucide-react";
import { SearchInput } from "../common/SearchInput";
import { Select } from "../common/Select";
import { Button } from "../common/Button";
import { COURSE_LEVELS, COURSE_STATUS_LABELS } from "../../utils/constants";

export function CourseFilters({ filters, onChange, onReset, categories = [], showStatus = false, showLevel = true, showPriceType = true, showSort = false }) {
  function setField(key, value) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <SearchInput value={filters.search || ""} onChange={(value) => setField("search", value)} placeholder="Search courses..." className="min-w-[220px] flex-1" />
      <Select
        value={filters.category || ""}
        onChange={(event) => setField("category", event.target.value)}
        className="w-44"
        options={[{ value: "", label: "All categories" }, ...categories.map((c) => ({ value: c.name || c, label: c.name || c }))]}
      />
      {showLevel && (
        <Select
          value={filters.level || ""}
          onChange={(event) => setField("level", event.target.value)}
          className="w-40"
          options={[{ value: "", label: "All levels" }, ...COURSE_LEVELS.map((level) => ({ value: level, label: level }))]}
        />
      )}
      {showPriceType && (
        <Select
          value={filters.priceType || ""}
          onChange={(event) => setField("priceType", event.target.value)}
          className="w-32"
          options={[
            { value: "", label: "Free & paid" },
            { value: "free", label: "Free" },
            { value: "paid", label: "Paid" },
          ]}
        />
      )}
      {showStatus && (
        <Select
          value={filters.status || ""}
          onChange={(event) => setField("status", event.target.value)}
          className="w-40"
          options={[{ value: "", label: "All statuses" }, ...Object.entries(COURSE_STATUS_LABELS).map(([value, label]) => ({ value, label }))]}
        />
      )}
      {showSort && (
        <Select
          value={filters.sort || "newest"}
          onChange={(event) => setField("sort", event.target.value)}
          className="w-36"
          options={[
            { value: "newest", label: "Newest" },
            { value: "rating", label: "Top rated" },
            { value: "price", label: "Price" },
          ]}
        />
      )}
      {onReset && (
        <Button variant="ghost" icon={RotateCcw} onClick={onReset}>
          Reset
        </Button>
      )}
    </div>
  );
}
