import { useState } from "react";
import { Download, Eye, FileText, Plus, Trash2 } from "lucide-react";
import { FormField } from "../common/FormField";
import { Select } from "../common/Select";
import { Button } from "../common/Button";
import { ConfirmDialog } from "../common/ConfirmDialog";

let localMaterialSeq = 0;
function newMaterialId() {
  localMaterialSeq += 1;
  return `material-local-${Date.now()}-${localMaterialSeq}`;
}

const FILE_TYPES = [
  { value: "PDF", label: "PDF" },
  { value: "PowerPoint", label: "PowerPoint" },
];

export function MaterialManager({ materials, onChange, sectionOptions = [] }) {
  const [draft, setDraft] = useState({ title: "", fileType: "PDF", fileUrl: "", sectionId: "" });
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  function addMaterial() {
    if (!draft.title.trim() || !draft.fileUrl.trim()) return;
    onChange([
      ...materials,
      { id: newMaterialId(), title: draft.title.trim(), fileType: draft.fileType, fileUrl: draft.fileUrl.trim(), sectionId: draft.sectionId || null, fileSize: "", downloadAllowed: true, disabled: false },
    ]);
    setDraft({ title: "", fileType: "PDF", fileUrl: "", sectionId: "" });
  }

  function updateMaterial(id, updates) {
    onChange(materials.map((material) => (material.id === id ? { ...material, ...updates } : material)));
  }

  function removeMaterial(id) {
    onChange(materials.filter((material) => material.id !== id));
    setPendingDeleteId(null);
  }

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-lg border border-quran-line">
        {materials.map((material) => (
          <div key={material.id} className="flex flex-wrap items-center gap-3 border-b border-quran-line bg-white p-3 last:border-b-0">
            <FileText size={18} className="shrink-0 text-quran-teal" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-quran-text">{material.title}</p>
              <p className="text-xs text-quran-muted">
                {material.fileType}
                {material.fileSize ? ` · ${material.fileSize}` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => updateMaterial(material.id, { downloadAllowed: !material.downloadAllowed })}
              className={`btn-sm ${material.downloadAllowed ? "btn-primary" : "btn-secondary"}`}
              aria-pressed={material.downloadAllowed}
            >
              <Download size={13} /> {material.downloadAllowed ? "Download on" : "Download off"}
            </button>
            <button
              type="button"
              onClick={() => updateMaterial(material.id, { disabled: !material.disabled })}
              className={`btn-sm ${material.disabled ? "btn-secondary" : "btn-primary"}`}
              aria-pressed={!material.disabled}
            >
              {material.disabled ? "Disabled" : "Enabled"}
            </button>
            {material.fileUrl && (
              <a href={material.fileUrl} target="_blank" rel="noreferrer" className="btn-secondary btn-sm" aria-label={`Preview ${material.title}`}>
                <Eye size={13} /> Preview
              </a>
            )}
            <Button variant="danger" size="sm" iconOnly icon={Trash2} ariaLabel={`Delete ${material.title}`} onClick={() => setPendingDeleteId(material.id)} />
          </div>
        ))}
        {!materials.length && <p className="p-4 text-sm text-quran-muted">No materials added yet.</p>}
      </div>

      <div className="space-y-3 rounded-lg border border-dashed border-quran-line p-3">
        <p className="text-sm font-black text-quran-text">Add material</p>
        <p className="field-hint">
          The backend only accepts image/video uploads today — PDF and PowerPoint files use a file URL until a document upload endpoint exists (see
          TODO in api/uploadApi.js).
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormField label="Material title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          <Select label="File type" value={draft.fileType} onChange={(e) => setDraft({ ...draft, fileType: e.target.value })} options={FILE_TYPES} />
          <FormField label="File URL" value={draft.fileUrl} onChange={(e) => setDraft({ ...draft, fileUrl: e.target.value })} className="sm:col-span-2" />
          {sectionOptions.length > 0 && (
            <Select
              label="Attach to section"
              value={draft.sectionId}
              onChange={(e) => setDraft({ ...draft, sectionId: e.target.value })}
              options={[{ value: "", label: "Not linked to a section" }, ...sectionOptions]}
              className="sm:col-span-2"
            />
          )}
        </div>
        <Button variant="secondary" icon={Plus} type="button" onClick={addMaterial}>
          Add material
        </Button>
      </div>

      <ConfirmDialog
        open={Boolean(pendingDeleteId)}
        title="Delete material?"
        description="This removes the material from the course for this session."
        confirmLabel="Delete material"
        onClose={() => setPendingDeleteId(null)}
        onConfirm={() => removeMaterial(pendingDeleteId)}
      />
    </div>
  );
}
