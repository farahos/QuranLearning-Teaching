import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ClipboardList, Plus, Pencil, Trash2, Power } from "lucide-react";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { DataTable } from "../../components/common/DataTable";
import { FormField } from "../../components/common/FormField";
import { Modal } from "../../components/common/Modal";
import { SearchInput } from "../../components/common/SearchInput";
import { Textarea } from "../../components/common/Textarea";
import { useToast } from "../../components/common/Toast";
import { addCategory, updateCategory, removeCategory, toggleCategoryActive, clearCategoryMessage } from "../../features/categories/categorySlice";
import { formatCurrency, formatNumber } from "../../utils/formatters";
import { runValidation, validators } from "../../utils/validators";

const emptyForm = { name: "", description: "", price: "0", isFree: true, thumbnailUrl: "", active: true };

export function AdminCategoriesPage() {
  const dispatch = useDispatch();
  const toast = useToast();
  const { items, isDemo, message } = useSelector((state) => state.categories);

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(clearCategoryMessage());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);

  const filtered = useMemo(() => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter((item) => item.name.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q));
  }, [items, search]);

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(category) {
    setEditingId(category.id);
    setForm({
      name: category.name,
      description: category.description || "",
      price: String(category.price ?? 0),
      isFree: !!category.isFree,
      thumbnailUrl: category.thumbnailUrl || "",
      active: category.active,
    });
    setErrors({});
    setModalOpen(true);
  }

  function submitForm() {
    const validationErrors = runValidation(form, { name: [validators.required("Category name is required")] });
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: form.isFree ? 0 : Number(form.price) || 0,
      isFree: form.isFree,
      thumbnailUrl: form.thumbnailUrl.trim(),
      active: form.active,
    };
    if (editingId) {
      dispatch(updateCategory({ id: editingId, updates: payload }));
    } else {
      dispatch(addCategory(payload));
    }
    setModalOpen(false);
  }

  const columns = [
    {
      key: "name",
      header: "Category",
      render: (row) => (
        <div>
          <p className="font-bold text-quran-text">{row.name}</p>
          <p className="max-w-xs truncate text-xs text-quran-muted">{row.description}</p>
        </div>
      ),
    },
    { key: "price", header: "Price", render: (row) => (row.isFree ? "Free" : formatCurrency(row.price)) },
    { key: "courseCount", header: "Courses", render: (row) => formatNumber(row.courseCount || 0) },
    { key: "active", header: "Status", render: (row) => <Badge tone={row.active ? "green" : "gray"}>{row.active ? "Active" : "Inactive"}</Badge> },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex flex-wrap items-center gap-1.5">
          <Button variant="ghost" size="sm" icon={Pencil} iconOnly ariaLabel={`Edit ${row.name}`} onClick={() => openEdit(row)} />
          <Button variant="ghost" size="sm" icon={Power} iconOnly ariaLabel={row.active ? `Deactivate ${row.name}` : `Activate ${row.name}`} onClick={() => dispatch(toggleCategoryActive(row.id))} />
          <Button variant="ghost" size="sm" icon={Trash2} iconOnly ariaLabel={`Delete ${row.name}`} onClick={() => setDeleteTarget(row)} />
        </div>
      ),
    },
  ];

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">Manage platform-wide course categories.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={openAdd}>
          Add category
        </Button>
      </div>

      {isDemo && (
        <Badge tone="amber">Demo data — categories are not yet saved to the backend (no /api/categories endpoints).</Badge>
      )}

      <Card>
        <SearchInput value={search} onChange={setSearch} placeholder="Search categories..." />
      </Card>

      <DataTable
        columns={columns}
        rows={filtered}
        rowKey="id"
        emptyIcon={ClipboardList}
        emptyTitle="No categories found"
        emptyDescription="Try a different search or add a new category."
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit category" : "Add category"}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={submitForm}>
              {editingId ? "Save changes" : "Add category"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <FormField label="Name" required name="name" value={form.name} error={errors.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Textarea label="Description" name="description" rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          <label className="flex items-center gap-2 text-sm font-semibold text-quran-text">
            <input type="checkbox" checked={form.isFree} onChange={(e) => setForm((f) => ({ ...f, isFree: e.target.checked }))} className="h-4 w-4 rounded border-quran-line accent-quran-green" />
            This category is free
          </label>
          {!form.isFree && (
            <FormField label="Price" type="number" min="0" name="price" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
          )}
          <FormField label="Thumbnail URL" name="thumbnailUrl" value={form.thumbnailUrl} onChange={(e) => setForm((f) => ({ ...f, thumbnailUrl: e.target.value }))} />
          <label className="flex items-center gap-2 text-sm font-semibold text-quran-text">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} className="h-4 w-4 rounded border-quran-line accent-quran-green" />
            Active
          </label>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this category?"
        description={deleteTarget ? `"${deleteTarget.name}" will be removed from this demo list.` : ""}
        confirmLabel="Delete category"
        tone="danger"
        onConfirm={() => {
          dispatch(removeCategory(deleteTarget.id));
          setDeleteTarget(null);
        }}
        onClose={() => setDeleteTarget(null)}
      />
    </section>
  );
}
