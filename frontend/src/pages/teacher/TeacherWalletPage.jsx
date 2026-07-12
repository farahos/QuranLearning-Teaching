import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CircleDollarSign, Clock, TrendingUp, Wallet as WalletIcon } from "lucide-react";
import { Badge, statusTone } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import { DataTable } from "../../components/common/DataTable";
import { ErrorState } from "../../components/common/ErrorState";
import { FormField } from "../../components/common/FormField";
import { Select } from "../../components/common/Select";
import { StatCard } from "../../components/common/StatCard";
import { useToast } from "../../components/common/Toast";
import { fetchWallet, requestWithdrawal } from "../../features/teacher/teacherSlice";
import { PAYMENT_METHODS, TRANSACTION_TYPES } from "../../utils/constants";
import { formatCurrency, formatDate } from "../../utils/formatters";

const TRANSACTION_TYPE_LABELS = {
  [TRANSACTION_TYPES.COURSE_PAYMENT]: "Course payment",
  [TRANSACTION_TYPES.COURSE_INCOME]: "Course income",
  [TRANSACTION_TYPES.ADMIN_COMMISSION]: "Admin commission",
  [TRANSACTION_TYPES.REFUND]: "Refund",
  [TRANSACTION_TYPES.WITHDRAWAL]: "Withdrawal",
};

const EMPTY_WITHDRAWAL_FORM = { amount: "", phoneNumber: "", method: PAYMENT_METHODS[0].value };

export function TeacherWalletPage() {
  const dispatch = useDispatch();
  const toast = useToast();
  const wallet = useSelector((state) => state.teacher.wallet);
  const walletStatus = useSelector((state) => state.teacher.walletStatus);
  const walletError = useSelector((state) => state.teacher.walletError);
  const transactions = useSelector((state) => state.teacher.transactions);
  const withdrawals = useSelector((state) => state.teacher.withdrawals);

  const [typeFilter, setTypeFilter] = useState("");
  const [form, setForm] = useState(EMPTY_WITHDRAWAL_FORM);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    dispatch(fetchWallet());
  }, [dispatch]);

  const filteredTransactions = useMemo(
    () => (typeFilter ? transactions.filter((t) => t.type === typeFilter) : transactions),
    [transactions, typeFilter]
  );

  const pendingBalance = useMemo(
    () => withdrawals.filter((w) => w.status === "pending").reduce((sum, w) => sum + Number(w.amount || 0), 0),
    [withdrawals]
  );

  const totalWithdrawn = useMemo(
    () => withdrawals.filter((w) => w.status === "completed").reduce((sum, w) => sum + Number(w.amount || 0), 0),
    [withdrawals]
  );

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const errors = {};
    const amount = Number(form.amount);
    if (!form.amount || amount <= 0) errors.amount = "Enter an amount greater than 0";
    else if (amount > Number(wallet?.walletBalance || 0)) errors.amount = "Amount exceeds your current balance";
    if (!form.phoneNumber.trim()) errors.phoneNumber = "Waafi phone number is required";
    setFormErrors(errors);
    if (Object.keys(errors).length) return;

    dispatch(requestWithdrawal({ amount, phoneNumber: form.phoneNumber.trim(), method: form.method }));
    toast.info("Withdrawal requested (demo only — not connected to the backend yet)");
    setForm(EMPTY_WITHDRAWAL_FORM);
  }

  const transactionColumns = [
    { key: "type", header: "Type", render: (row) => <Badge tone="blue">{TRANSACTION_TYPE_LABELS[row.type] || row.type}</Badge> },
    { key: "status", header: "Status", render: (row) => <Badge tone={statusTone(row.status)}>{row.status}</Badge> },
    { key: "amount", header: "Amount", render: (row) => formatCurrency(row.amount) },
    { key: "note", header: "Note", render: (row) => row.note || "—" },
    { key: "createdAt", header: "Date", render: (row) => formatDate(row.createdAt) },
  ];

  const withdrawalColumns = [
    { key: "amount", header: "Amount", render: (row) => formatCurrency(row.amount) },
    { key: "method", header: "Method" },
    { key: "phoneNumber", header: "Phone number" },
    { key: "status", header: "Status", render: (row) => <Badge tone={statusTone(row.status)}>{row.status}</Badge> },
    { key: "requestedAt", header: "Requested", render: (row) => formatDate(row.requestedAt) },
  ];

  if (walletStatus === "failed" && !wallet) {
    return (
      <section className="space-y-6">
        <div>
          <h1 className="page-title">Wallet</h1>
          <p className="page-subtitle">Track earnings and request withdrawals.</p>
        </div>
        <ErrorState message={walletError} onRetry={() => dispatch(fetchWallet())} />
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="page-title">Wallet</h1>
        <p className="page-subtitle">Track earnings and request withdrawals.</p>
      </div>

      <div className="stat-grid">
        <StatCard icon={WalletIcon} label="Current balance" value={walletStatus === "loading" ? "..." : formatCurrency(wallet?.walletBalance)} />
        <StatCard icon={Clock} label="Pending balance" value={formatCurrency(pendingBalance)} helpText="Requested withdrawals awaiting processing" />
        <StatCard icon={TrendingUp} label="Total earnings" value={walletStatus === "loading" ? "..." : formatCurrency(wallet?.totalEarnings)} />
        <StatCard icon={CircleDollarSign} label="Total withdrawn" value={formatCurrency(totalWithdrawn)} />
      </div>

      <div className="two-col">
        <Card title="Transaction history">
          <div className="mb-3">
            <Select
              label="Filter by type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={[{ value: "", label: "All types" }, ...Object.entries(TRANSACTION_TYPE_LABELS).map(([value, label]) => ({ value, label }))]}
              className="max-w-xs"
            />
          </div>
          <DataTable
            columns={transactionColumns}
            rows={filteredTransactions}
            rowKey="_id"
            status={walletStatus}
            error={walletError}
            onRetry={() => dispatch(fetchWallet())}
            emptyTitle="No transactions yet"
          />
        </Card>

        <Card title="Request a withdrawal" subtitle="Demo only — not connected to the backend yet">
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              label="Amount (USD)"
              type="number"
              min="1"
              step="0.01"
              value={form.amount}
              error={formErrors.amount}
              onChange={(e) => set("amount", e.target.value)}
            />
            <FormField
              label="Waafi phone number"
              value={form.phoneNumber}
              error={formErrors.phoneNumber}
              placeholder="e.g. 6XXXXXXXX"
              onChange={(e) => set("phoneNumber", e.target.value)}
            />
            <Select label="Method" value={form.method} onChange={(e) => set("method", e.target.value)} options={PAYMENT_METHODS} />
            <Button type="submit" variant="primary" full>
              Request withdrawal
            </Button>
          </form>
        </Card>
      </div>

      <Card title="Withdrawal requests">
        <DataTable columns={withdrawalColumns} rows={withdrawals} rowKey="id" status="succeeded" emptyTitle="No withdrawal requests yet" />
      </Card>
    </section>
  );
}
