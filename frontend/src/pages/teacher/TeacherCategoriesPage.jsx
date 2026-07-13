import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ClipboardList, Pencil, Plus, Power, Trash2 } from "lucide-react";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { EmptyState } from "../../components/common/EmptyState";
import { FormField } from "../../components/common/FormField";
import { Modal } from "../../components/common/Modal";
import { SearchInput } from "../../components/common/SearchInput";
import { useToast } from "../../components/common/Toast";
import { addCategory, clearCategoryMessage, removeCategory, toggleCategoryActive, updateCategory } from "../../features/categories/categorySlice";
import { formatCurrency } from "../../utils/formatters";

const EMPTY_FORM = { name: "", description: "", price: "" };

export function TeacherCategoriesPage() {
  const dispatch = useDispatch();
  const toast = useToast();
  const categories = useSelector((state) => state.categories.items);
  const message = useSelector((state) => state.categories.message);
  const error = useSelector((state) => state.categories.error);
  const saveStatus = useSelector((state) => state.categories.saveStatus);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  useEffect(() => {
    if (!message) return;
    toast.success(message);
    dispatch(clearCategoryMessage());
  }, [message, toast, dispatch]);

  useEffect(() => {
    if (!error) return;
    toast.error(error);
    dispatch(clearCategoryMessage());
  }, [error, toast, dispatch]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return categories;
    return categories.filter((category) => category.name.toLowerCase().includes(term) || category.description?.toLowerCase().includes(term));
  }, [categories, search]);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(category) {
    setEditingId(category.id);
    setForm({
      name: category.name || "",
      description: category.description || "",
      price: category.price ? String(category.price) : "",
    });
    setModalOpen(true);
  }

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave(event) {
    event.preventDefault();
    if (!form.name.trim()) {
      toast.error("Category name is required");
      return;
    }
    if (Number(form.price || 0) < 0) {
      toast.error("Enter a valid price");
      return;
    }
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price) || 0,
    };
    try {
      if (editingId) {
        await dispatch(updateCategory({ id: editingId, updates: payload })).unwrap();
      } else {
        await dispatch(addCategory(payload)).unwrap();
      }
      setModalOpen(false);
    } catch {
      // Error toast is handled from Redux state.
    }
  }

  function handleDelete() {
    dispatch(removeCategory(pendingDeleteId));
    setPendingDeleteId(null);
  }

  function handleToggle(category) {
    dispatch(toggleCategoryActive(category));
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">Manage the course categories students browse by.</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search categories..." className="min-w-[220px] flex-1" />
        <Button variant="primary" icon={Plus} onClick={openCreate}>
          Add category
        </Button>
      </div>

      {filtered.length ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((category) => (
            <Card key={category.id} className="flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-base font-black text-quran-text">{category.name}</p>
                  <p className="mt-1 text-sm text-quran-muted">{category.description}</p>
                </div>
                <Badge tone={category.active ? "green" : "gray"}>{category.active ? "Active" : "Inactive"}</Badge>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-bold text-quran-muted">
                <span>{category.courseCount || 0} courses</span>
                <span>{category.price ? formatCurrency(category.price) : "Free"}</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 border-t border-quran-line pt-3">
                <Button variant="secondary" size="sm" icon={Pencil} onClick={() => openEdit(category)}>
                  Edit
                </Button>
                <Button variant="secondary" size="sm" icon={Power} onClick={() => handleToggle(category)}>
                  {category.active ? "Deactivate" : "Activate"}
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  iconOnly
                  icon={Trash2}
                  ariaLabel={`Delete ${category.name}`}
                  onClick={() => setPendingDeleteId(category.id)}
                  className="ml-auto"
                />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState icon={ClipboardList} title="No categories found" description="Try a different search or add a new category." />
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit category" : "Add category"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} loading={saveStatus === "loading"}>
              {editingId ? "Save changes" : "Add category"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <FormField label="Category name" required value={form.name} onChange={(e) => set("name", e.target.value)} />
          <FormField as="textarea" label="Description" value={form.description} onChange={(e) => set("description", e.target.value)} />
          <FormField
            label="Price (USD)"
            type="number"
            min="0"
            step="0.01"
            placeholder="0 = Free"
            hint="Courses placed in this category will use this price"
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingDeleteId)}
        title="Delete category?"
        description="This removes the category from the server."
        confirmLabel="Delete category"
        onClose={() => setPendingDeleteId(null)}
        onConfirm={handleDelete}
      />
    </section>
  );
}
