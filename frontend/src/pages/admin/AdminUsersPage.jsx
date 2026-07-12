import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Users, Eye, Pencil, Power, Trash2, RotateCcw } from "lucide-react";
import { Avatar } from "../../components/common/Avatar";
import { Badge, statusTone } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { DataTable } from "../../components/common/DataTable";
import { FormField } from "../../components/common/FormField";
import { Modal } from "../../components/common/Modal";
import { Pagination } from "../../components/common/Pagination";
import { SearchInput } from "../../components/common/SearchInput";
import { Select } from "../../components/common/Select";
import { useToast } from "../../components/common/Toast";
import { fetchAdminUsers, updateAdminUser, deleteAdminUser } from "../../features/admin/adminSlice";
import { ROLES, ROLE_LABELS, KYC_STATUS_LABELS } from "../../utils/constants";
import { formatCurrency, formatDate } from "../../utils/formatters";

const PAGE_SIZE = 10;

const emptyFilters = { search: "", role: "", active: "", kyc: "" };

export function AdminUsersPage() {
  const dispatch = useDispatch();
  const toast = useToast();
  const { users, usersStatus, error } = useSelector((state) => state.admin);

  const [filters, setFilters] = useState(emptyFilters);
  const [page, setPage] = useState(1);
  const [viewUser, setViewUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ fullName: "", role: "" });
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState("");

  useEffect(() => {
    dispatch(fetchAdminUsers({}));
  }, [dispatch]);

  useEffect(() => {
    const handle = setTimeout(() => {
      dispatch(fetchAdminUsers({ search: filters.search || undefined, role: filters.role || undefined }));
      setPage(1);
    }, 350);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.role]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (filters.active === "active" && !user.active) return false;
      if (filters.active === "inactive" && user.active) return false;
      if (filters.kyc && user.kycStatus !== filters.kyc) return false;
      return true;
    });
  }, [users, filters.active, filters.kyc]);

  const pagedUsers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, page]);

  function resetFilters() {
    setFilters(emptyFilters);
    setPage(1);
    dispatch(fetchAdminUsers({}));
  }

  function openEdit(user) {
    setEditUser(user);
    setEditForm({ fullName: user.fullName || "", role: user.role || ROLES.STUDENT });
  }

  async function saveEdit() {
    setSavingEdit(true);
    try {
      await dispatch(updateAdminUser({ id: editUser._id, payload: { fullName: editForm.fullName, role: editForm.role } })).unwrap();
      toast.success("User updated");
      setEditUser(null);
    } catch (err) {
      toast.error(err || "Could not update user");
    } finally {
      setSavingEdit(false);
    }
  }

  async function toggleActive(user) {
    setTogglingId(user._id);
    try {
      await dispatch(updateAdminUser({ id: user._id, payload: { active: !user.active } })).unwrap();
      toast.success(user.active ? "User deactivated" : "User activated");
    } catch (err) {
      toast.error(err || "Could not update user");
    } finally {
      setTogglingId("");
    }
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      await dispatch(deleteAdminUser(deleteTarget._id)).unwrap();
      toast.success("User deleted");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err || "Could not delete user");
    } finally {
      setDeleting(false);
    }
  }

  const columns = [
    {
      key: "user",
      header: "User",
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.fullName} size="sm" />
          <div>
            <p className="font-bold text-quran-text">{row.fullName}</p>
            <p className="text-xs text-quran-muted">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (row) => <Badge tone={row.role === "admin" ? "blue" : row.role === "teacher" ? "green" : "gray"}>{ROLE_LABELS[row.role] || row.role}</Badge>,
    },
    {
      key: "active",
      header: "Status",
      render: (row) => <Badge tone={row.active ? "green" : "red"}>{row.active ? "Active" : "Inactive"}</Badge>,
    },
    {
      key: "kyc",
      header: "KYC",
      render: (row) => <Badge tone={statusTone(row.kycStatus)}>{KYC_STATUS_LABELS[row.kycStatus] || row.kycStatus}</Badge>,
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex flex-wrap items-center gap-1.5">
          <Button variant="ghost" size="sm" icon={Eye} iconOnly ariaLabel={`View ${row.fullName}`} onClick={() => setViewUser(row)} />
          <Button variant="ghost" size="sm" icon={Pencil} iconOnly ariaLabel={`Edit ${row.fullName}`} onClick={() => openEdit(row)} />
          <Button
            variant="ghost"
            size="sm"
            icon={Power}
            iconOnly
            ariaLabel={row.active ? `Deactivate ${row.fullName}` : `Activate ${row.fullName}`}
            loading={togglingId === row._id}
            onClick={() => toggleActive(row)}
          />
          <Button variant="ghost" size="sm" icon={Trash2} iconOnly ariaLabel={`Delete ${row.fullName}`} onClick={() => setDeleteTarget(row)} />
        </div>
      ),
    },
  ];

  return (
    <section className="space-y-6">
      <div>
        <h1 className="page-title">Users</h1>
        <p className="page-subtitle">Manage every account on the platform.</p>
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput value={filters.search} onChange={(value) => setFilters((f) => ({ ...f, search: value }))} placeholder="Search by name or email..." className="min-w-[220px] flex-1" />
          <Select
            value={filters.role}
            onChange={(e) => setFilters((f) => ({ ...f, role: e.target.value }))}
            className="w-40"
            options={[{ value: "", label: "All roles" }, ...Object.values(ROLES).map((r) => ({ value: r, label: ROLE_LABELS[r] }))]}
          />
          <Select
            value={filters.active}
            onChange={(e) => {
              setFilters((f) => ({ ...f, active: e.target.value }));
              setPage(1);
            }}
            className="w-40"
            options={[
              { value: "", label: "Active & inactive" },
              { value: "active", label: "Active only" },
              { value: "inactive", label: "Inactive only" },
            ]}
          />
          <Select
            value={filters.kyc}
            onChange={(e) => {
              setFilters((f) => ({ ...f, kyc: e.target.value }));
              setPage(1);
            }}
            className="w-44"
            options={[{ value: "", label: "All KYC statuses" }, ...Object.entries(KYC_STATUS_LABELS).map(([value, label]) => ({ value, label }))]}
          />
          <Button variant="ghost" icon={RotateCcw} onClick={resetFilters}>
            Reset filters
          </Button>
        </div>
      </Card>

      <div className="space-y-3">
        <DataTable
          columns={columns}
          rows={pagedUsers}
          rowKey="_id"
          status={usersStatus}
          error={error}
          onRetry={() => dispatch(fetchAdminUsers({}))}
          emptyIcon={Users}
          emptyTitle="No users found"
          emptyDescription="Try adjusting your filters."
        />
        <Pagination page={page} pageSize={PAGE_SIZE} total={filteredUsers.length} onPageChange={setPage} />
      </div>

      <Modal open={!!viewUser} onClose={() => setViewUser(null)} title="User details" size="md">
        {viewUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar name={viewUser.fullName} size="lg" />
              <div>
                <p className="text-lg font-black text-quran-text">{viewUser.fullName}</p>
                <p className="text-sm text-quran-muted">{viewUser.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs font-bold uppercase text-quran-muted">Role</p>
                <p className="font-semibold text-quran-text">{ROLE_LABELS[viewUser.role] || viewUser.role}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-quran-muted">Status</p>
                <Badge tone={viewUser.active ? "green" : "red"}>{viewUser.active ? "Active" : "Inactive"}</Badge>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-quran-muted">KYC status</p>
                <Badge tone={statusTone(viewUser.kycStatus)}>{KYC_STATUS_LABELS[viewUser.kycStatus] || viewUser.kycStatus}</Badge>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-quran-muted">Wallet balance</p>
                <p className="font-semibold text-quran-text">{formatCurrency(viewUser.walletBalance)}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-quran-muted">WhatsApp</p>
                <p className="font-semibold text-quran-text">{viewUser.whatsappNumber || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-quran-muted">Joined</p>
                <p className="font-semibold text-quran-text">{formatDate(viewUser.createdAt)}</p>
              </div>
              {viewUser.role === "teacher" && (
                <>
                  <div className="col-span-2">
                    <p className="text-xs font-bold uppercase text-quran-muted">Experience</p>
                    <p className="font-semibold text-quran-text">{viewUser.experience || "—"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs font-bold uppercase text-quran-muted">Bio</p>
                    <p className="text-quran-text">{viewUser.bio || "—"}</p>
                  </div>
                </>
              )}
              {viewUser.role === "student" && (
                <div className="col-span-2">
                  <p className="text-xs font-bold uppercase text-quran-muted">Learning goal</p>
                  <p className="text-quran-text">{viewUser.learningGoal || "—"}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!editUser}
        onClose={() => setEditUser(null)}
        title="Edit user"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditUser(null)} disabled={savingEdit}>
              Cancel
            </Button>
            <Button variant="primary" onClick={saveEdit} loading={savingEdit}>
              Save changes
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <FormField label="Full name" required name="fullName" value={editForm.fullName} onChange={(e) => setEditForm((f) => ({ ...f, fullName: e.target.value }))} />
          <Select
            label="Role"
            value={editForm.role}
            onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}
            options={Object.values(ROLES).map((r) => ({ value: r, label: ROLE_LABELS[r] }))}
          />
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this user?"
        description={deleteTarget ? `This permanently removes ${deleteTarget.fullName} (${deleteTarget.email}). This cannot be undone.` : ""}
        confirmLabel="Delete user"
        tone="danger"
        loading={deleting}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </section>
  );
}
