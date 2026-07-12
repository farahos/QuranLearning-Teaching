import { useState } from "react";
import { Input, Section } from "./ui";

export function Reports({ courses, title }) {
  const [filters, setFilters] = useState({ from: "", to: "", min: "", max: "" });
  const filtered = courses.filter((course) => {
    const price = Number(course.price || 0);
    if (filters.min && price < Number(filters.min)) return false;
    if (filters.max && price > Number(filters.max)) return false;
    return true;
  });

  return (
    <Section title={title}>
      <div className="filter-bar">
        <Input label="Date from" type="date" value={filters.from} onChange={(from) => setFilters({ ...filters, from })} />
        <Input label="Date to" type="date" value={filters.to} onChange={(to) => setFilters({ ...filters, to })} />
        <Input label="Min price" type="number" value={filters.min} onChange={(min) => setFilters({ ...filters, min })} />
        <Input label="Max price" type="number" value={filters.max} onChange={(max) => setFilters({ ...filters, max })} />
      </div>
      <div className="list-card">
        {filtered.map((course) => (
          <div className="report-row" key={course._id}>
            <div>
              <strong>{course.courseName}</strong>
              <span>{course.enrolledStudents?.length || 0} students buying this course</span>
            </div>
            <span>${Number(course.price || 0).toFixed(2)}</span>
            <span>{course.rating || 0} rating</span>
            <button>Export</button>
          </div>
        ))}
      </div>
    </Section>
  );
}
