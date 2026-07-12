import { useState } from "react";
import { Eye, EyeOff, GripVertical, Lock, Plus, Trash2, Unlock } from "lucide-react";
import { FormField } from "../common/FormField";
import { Select } from "../common/Select";
import { Button } from "../common/Button";
import { LESSON_TYPES } from "../../utils/constants";

let localSectionSeq = 0;
function newSectionId() {
  localSectionSeq += 1;
  return `section-local-${Date.now()}-${localSectionSeq}`;
}

export function SectionManager({ sections, onChange }) {
  const [draftTitle, setDraftTitle] = useState("");
  const [draftType, setDraftType] = useState("video");

  function update(nextSections) {
    onChange(nextSections);
  }

  function addSection() {
    if (!draftTitle.trim()) return;
    update([...sections, { id: newSectionId(), title: draftTitle.trim(), type: draftType, locked: false, preview: false, completed: false }]);
    setDraftTitle("");
  }

  function updateSection(id, updates) {
    update(sections.map((section) => (section.id === id ? { ...section, ...updates } : section)));
  }

  function removeSection(id) {
    update(sections.filter((section) => section.id !== id));
  }

  function move(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    [next[index], next[target]] = [next[target], next[index]];
    update(next);
  }

  return (
    <div className="space-y-2">
      {sections.map((section, index) => (
        <div key={section.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-quran-line bg-white p-2.5">
          <span className="flex flex-col text-quran-muted">
            <button type="button" aria-label="Move up" disabled={index === 0} onClick={() => move(index, -1)} className="disabled:opacity-30">
              <GripVertical size={14} />
            </button>
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-quran-text">{section.title}</p>
            <p className="text-xs text-quran-muted">{LESSON_TYPES.find((type) => type.value === section.type)?.label || section.type}</p>
          </div>
          <button
            type="button"
            onClick={() => updateSection(section.id, { preview: !section.preview })}
            className={`btn-sm ${section.preview ? "btn-primary" : "btn-secondary"}`}
            aria-pressed={section.preview}
          >
            {section.preview ? <Eye size={13} /> : <EyeOff size={13} />} Preview
          </button>
          <button type="button" onClick={() => updateSection(section.id, { locked: !section.locked })} className="btn-secondary btn-sm" aria-pressed={section.locked}>
            {section.locked ? <Lock size={13} /> : <Unlock size={13} />} {section.locked ? "Locked" : "Unlocked"}
          </button>
          <Button variant="danger" size="sm" iconOnly icon={Trash2} ariaLabel={`Delete section ${section.title}`} onClick={() => removeSection(section.id)} />
        </div>
      ))}
      {!sections.length && <p className="text-sm text-quran-muted">No sections yet — add the first lesson below.</p>}

      <div className="flex flex-wrap items-end gap-2 rounded-lg border border-dashed border-quran-line p-2.5">
        <FormField label="New lesson title" value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} className="min-w-[180px] flex-1" />
        <Select label="Lesson type" value={draftType} onChange={(e) => setDraftType(e.target.value)} options={LESSON_TYPES} className="w-48" />
        <Button variant="secondary" icon={Plus} type="button" onClick={addSection}>
          Add lesson
        </Button>
      </div>
    </div>
  );
}
