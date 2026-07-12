import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { ScrollText, Eye } from "lucide-react";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import { DataTable } from "../../components/common/DataTable";
import { Modal } from "../../components/common/Modal";
import { SearchInput } from "../../components/common/SearchInput";
import { Select } from "../../components/common/Select";
import { FormField } from "../../components/common/FormField";

const emptyFilters = { search: "", actor: "", role: "", action: "", date: "" };

export function AdminLogsPage() {
  const { logs } = useSelector((state) => state.admin);
  const [filters, setFilters] = useState(emptyFilters);
  const [detail, setDetail] = useState(null);

  const actorOptions = useMemo(() => [...new Set(logs.map((l) => l.actor))].map((a) => ({ value: a, label: a })), [logs]);
  const roleOptions = useMemo(() => [...new Set(logs.map((l) => l.role))].map((r) => ({ value: r, label: r })), [logs]);
  const actionOptions = useMemo(() => [...new Set(logs.map((l) => l.action))].map((a) => ({ value: a, label: a })), [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!log.event.toLowerCase().includes(q) && !log.actor.toLowerCase().includes(q) && !log.action.toLowerCase().includes(q)) return false;
      }
      if (filters.actor && log.actor !== filters.actor) return false;
      if (filters.role && log.role !== filters.role) return false;
      if (filters.action && log.action !== filters.action) return false;
      if (filters.date && !log.date.startsWith(filters.date)) return false;
      return true;
    });
  }, [logs, filters]);

  const columns = [
    { key: "event", header: "Event", render: (row) => <span className="font-bold text-quran-text">{row.event}</span> },
    { key: "actor", header: "Actor", render: (row) => row.actor },
    { key: "role", header: "Role", render: (row) => <Badge tone={row.role === "admin" ? "blue" : row.role === "teacher" ? "green" : "gray"}>{row.role}</Badge> },
    { key: "action", header: "Action", render: (row) => <code className="text-xs">{row.action}</code> },
    { key: "date", header: "Date", render: (row) => row.date },
    {
      key: "actions",
      header: "",
      render: (row) => <Button variant="ghost" size="sm" icon={Eye} iconOnly ariaLabel={`View details for ${row.event}`} onClick={() => setDetail(row)} />,
    },
  ];

  return (
    <section className="space-y-6">
      <div>
        <h1 className="page-title">Activity logs</h1>
        <p className="page-subtitle">Audit trail of platform activity.</p>
      </div>

      <Badge tone="amber">Demo data — GET /api/admin/logs does not exist yet, this list is seeded locally.</Badge>

      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput value={filters.search} onChange={(value) => setFilters((f) => ({ ...f, search: value }))} placeholder="Search events, actors, actions..." className="min-w-[220px] flex-1" />
          <Select value={filters.actor} onChange={(e) => setFilters((f) => ({ ...f, actor: e.target.value }))} className="w-44" options={[{ value: "", label: "All actors" }, ...actorOptions]} />
          <Select value={filters.role} onChange={(e) => setFilters((f) => ({ ...f, role: e.target.value }))} className="w-36" options={[{ value: "", label: "All roles" }, ...roleOptions]} />
          <Select value={filters.action} onChange={(e) => setFilters((f) => ({ ...f, action: e.target.value }))} className="w-52" options={[{ value: "", label: "All actions" }, ...actionOptions]} />
          <FormField type="date" value={filters.date} onChange={(e) => setFilters((f) => ({ ...f, date: e.target.value }))} className="w-40" />
          <Button variant="ghost" onClick={() => setFilters(emptyFilters)}>
            Reset
          </Button>
        </div>
      </Card>

      <DataTable columns={columns} rows={filteredLogs} rowKey="id" emptyIcon={ScrollText} emptyTitle="No matching log entries" />

      <Modal open={!!detail} onClose={() => setDetail(null)} title="Log entry" size="sm">
        {detail && (
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-xs font-bold uppercase text-quran-muted">Event</p>
              <p className="font-semibold text-quran-text">{detail.event}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-quran-muted">Actor</p>
              <p className="font-semibold text-quran-text">
                {detail.actor} ({detail.role})
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-quran-muted">Action</p>
              <p className="font-semibold text-quran-text">
                <code>{detail.action}</code>
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-quran-muted">Date</p>
              <p className="font-semibold text-quran-text">{detail.date}</p>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
