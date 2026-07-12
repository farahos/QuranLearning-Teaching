import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CreditCard, DollarSign, Clock, RotateCcw, CheckCircle2, XCircle } from "lucide-react";
import { Badge, statusTone } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import { DataTable } from "../../components/common/DataTable";
import { FormField } from "../../components/common/FormField";
import { Modal } from "../../components/common/Modal";
import { Pagination } from "../../components/common/Pagination";
import { SearchInput } from "../../components/common/SearchInput";
import { Select } from "../../components/common/Select";
import { StatCard } from "../../components/common/StatCard";
import { Textarea } from "../../components/common/Textarea";
import { useToast } from "../../components/common/Toast";
import { fetchAdminTransactions } from "../../features/admin/adminSlice";
import { approveRefund, rejectRefund, clearPaymentMessage } from "../../features/payments/paymentSlice";
import { TRANSACTION_TYPES } from "../../utils/constants";
import { formatCurrency, formatDate, formatDateTime } from "../../utils/formatters";

const PAGE_SIZE = 10;
const emptyFilters = { search: "", status: "", type: "", from: "", to: "" };

const REFUND_STATUS_LABEL = {
  pending: "Pending",
  approved_demo: "Approved (demo — no funds moved)",
  rejected: "Rejected",
};

export function AdminPaymentsPage() {
  const dispatch = useDispatch();
  const toast = useToast();
  const { transactions, transactionsStatus, error } = useSelector((state) => state.admin);
  const { refunds, message: paymentMessage } = useSelector((state) => state.payments);

  const [filters, setFilters] = useState(emptyFilters);
  const [page, setPage] = useState(1);
  const [refundAction, setRefundAction] = useState(null); // { refund, type: 'approve' | 'reject' }
  const [note, setNote] = useState("");

  useEffect(() => {
    dispatch(fetchAdminTransactions());
  }, [dispatch]);

  useEffect(() => {
    if (paymentMessage) {
      toast.success(paymentMessage);
      dispatch(clearPaymentMessage());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentMessage]);

  const totalRevenue = useMemo(
    () => transactions.filter((t) => t.type === "course_payment" && t.status === "completed").reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );
  const pendingCount = useMemo(() => transactions.filter((t) => t.status === "pending").length, [transactions]);
  const refundedAmount = useMemo(() => refunds.filter((r) => r.status === "approved_demo").reduce((sum, r) => sum + Number(r.amount || 0), 0), [refunds]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matches = t.user?.fullName?.toLowerCase().includes(q) || t.user?.email?.toLowerCase().includes(q) || t.note?.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (filters.status && t.status !== filters.status) return false;
      if (filters.type && t.type !== filters.type) return false;
      if (filters.from && new Date(t.createdAt) < new Date(filters.from)) return false;
      if (filters.to && new Date(t.createdAt) > new Date(`${filters.to}T23:59:59`)) return false;
      return true;
    });
  }, [transactions, filters]);

  const pagedTransactions = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredTransactions.slice(start, start + PAGE_SIZE);
  }, [filteredTransactions, page]);

  function openRefundAction(refund, type) {
    setRefundAction({ refund, type });
    setNote("");
  }

  function submitRefundAction() {
    if (refundAction.type === "approve") {
      dispatch(approveRefund({ id: refundAction.refund.id, note: note.trim() }));
    } else {
      dispatch(rejectRefund({ id: refundAction.refund.id, note: note.trim() }));
    }
    setRefundAction(null);
  }

  const columns = [
    { key: "user", header: "User", render: (row) => (row.user ? <div><p className="font-bold text-quran-text">{row.user.fullName}</p><p className="text-xs text-quran-muted">{row.user.email}</p></div> : "—") },
    { key: "type", header: "Type", render: (row) => <Badge tone="blue">{row.type.replace(/_/g, " ")}</Badge> },
    { key: "amount", header: "Amount", render: (row) => formatCurrency(row.amount) },
    { key: "status", header: "Status", render: (row) => <Badge tone={statusTone(row.status)}>{row.status}</Badge> },
    { key: "note", header: "Note", render: (row) => row.note || "—" },
    { key: "date", header: "Date", render: (row) => formatDateTime(row.createdAt) },
  ];

  const refundColumns = [
    { key: "requester", header: "Requester", render: (row) => row.studentName },
    { key: "course", header: "Course", render: (row) => row.courseTitle },
    { key: "reason", header: "Reason", render: (row) => row.reason },
    { key: "amount", header: "Amount", render: (row) => formatCurrency(row.amount) },
    { key: "status", header: "Status", render: (row) => <Badge tone={statusTone(row.status)}>{REFUND_STATUS_LABEL[row.status] || row.status}</Badge> },
    { key: "requestedAt", header: "Requested", render: (row) => formatDate(row.requestedAt) },
    {
      key: "actions",
      header: "Actions",
      render: (row) =>
        row.status === "pending" ? (
          <div className="flex gap-1.5">
            <Button variant="secondary" size="sm" icon={CheckCircle2} onClick={() => openRefundAction(row, "approve")}>
              Approve
            </Button>
            <Button variant="ghost" size="sm" icon={XCircle} onClick={() => openRefundAction(row, "reject")}>
              Reject
            </Button>
          </div>
        ) : (
          <span className="text-xs text-quran-muted">{row.adminNote || "—"}</span>
        ),
    },
  ];

  return (
    <section className="space-y-6">
      <div>
        <h1 className="page-title">Payments & refunds</h1>
        <p className="page-subtitle">Review transactions and process refunds.</p>
      </div>

      <div className="stat-grid">
        <StatCard icon={DollarSign} label="Total revenue" value={formatCurrency(totalRevenue)} />
        <StatCard icon={Clock} label="Pending payments" value={pendingCount} changeTone={pendingCount > 0 ? "amber" : "green"} />
        <StatCard icon={RotateCcw} label="Refunded (demo)" value={formatCurrency(refundedAmount)} helpText="No real funds moved — demo state only" />
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput value={filters.search} onChange={(value) => setFilters((f) => ({ ...f, search: value }))} placeholder="Search by user or note..." className="min-w-[220px] flex-1" />
          <Select
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            className="w-40"
            options={[
              { value: "", label: "All statuses" },
              { value: "completed", label: "Completed" },
              { value: "pending", label: "Pending" },
              { value: "failed", label: "Failed" },
            ]}
          />
          <Select
            value={filters.type}
            onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
            className="w-48"
            options={[{ value: "", label: "All types" }, ...Object.values(TRANSACTION_TYPES).filter((t) => t !== "refund" && t !== "withdrawal").map((t) => ({ value: t, label: t.replace(/_/g, " ") }))]}
          />
          <FormField type="date" value={filters.from} onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))} className="w-40" />
          <FormField type="date" value={filters.to} onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))} className="w-40" />
          <Button variant="ghost" onClick={() => setFilters(emptyFilters)}>
            Reset
          </Button>
        </div>
      </Card>

      <div className="space-y-3">
        <DataTable
          columns={columns}
          rows={pagedTransactions}
          rowKey="_id"
          status={transactionsStatus}
          error={error}
          onRetry={() => dispatch(fetchAdminTransactions())}
          emptyIcon={CreditCard}
          emptyTitle="No transactions found"
        />
        <Pagination page={page} pageSize={PAGE_SIZE} total={filteredTransactions.length} onPageChange={setPage} />
      </div>

      <Card title="Refunds" subtitle="Demo data — refund approvals here never move real funds">
        <DataTable columns={refundColumns} rows={refunds} rowKey="id" emptyIcon={RotateCcw} emptyTitle="No refund requests" />
      </Card>

      <Modal
        open={!!refundAction}
        onClose={() => setRefundAction(null)}
        title={refundAction?.type === "approve" ? "Approve refund" : "Reject refund"}
        description={refundAction ? `${refundAction.refund.studentName} · ${refundAction.refund.courseTitle} · ${formatCurrency(refundAction.refund.amount)}` : ""}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRefundAction(null)}>
              Cancel
            </Button>
            <Button variant={refundAction?.type === "approve" ? "primary" : "danger"} onClick={submitRefundAction}>
              {refundAction?.type === "approve" ? "Approve refund" : "Reject refund"}
            </Button>
          </>
        }
      >
        <Textarea
          label="Admin note"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          hint={refundAction?.type === "approve" ? "This only marks the refund as approved in this demo — no money actually moves." : "Optional note for the record."}
        />
      </Modal>
    </section>
  );
}
