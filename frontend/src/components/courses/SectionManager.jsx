import { useState } from "react";
import { Eye, EyeOff, GripVertical, Lock, Plus, Trash2, Unlock } from "lucide-react";
import { FormField } from "../common/FormField";
import { Select } from "../common/Select";
import { Button } from "../common/Button";
import { LESSON_TYPES } from "../../utils/constants";
import { uploadApi } from "../../api/uploadApi";

let localSectionSeq = 0;
function newSectionId() {
  localSectionSeq += 1;
  return `section-local-${Date.now()}-${localSectionSeq}`;
}

export function SectionManager({ sections, onChange }) {
  const [draftTitle, setDraftTitle] = useState("");
  const [draftType, setDraftType] = useState("video");
  const [uploadingId, setUploadingId] = useState("");

  function update(nextSections) {
    onChange(nextSections);
  }

  function addSection() {
    if (!draftTitle.trim()) return;
    update([...sections, { id: newSectionId(), title: draftTitle.trim(), type: draftType, videoUrl: "", description: "", locked: false, preview: false, completed: false }]);
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

  async function uploadVideo(sectionId, file) {
    if (!file) return;
    setUploadingId(sectionId);
    try {
      const result = await uploadApi.uploadVideo(file);
      updateSection(sectionId, { videoUrl: result.videoUrl || "" });
    } finally {
      setUploadingId("");
    }
  }

  return (
    <div className="space-y-2">
      {sections.map((section, index) => (
        <div key={section.id} className="space-y-3 rounded-lg border border-quran-line bg-white p-2.5">
          <div className="flex flex-wrap items-center gap-2">
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

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <FormField label="Lesson title" value={section.title} onChange={(e) => updateSection(section.id, { title: e.target.value })} />
            <Select label="Lesson type" value={section.type} onChange={(e) => updateSection(section.id, { type: e.target.value })} options={LESSON_TYPES} />
            {(section.type === "video" || section.type === "audio") && (
              <div className="sm:col-span-2">
                <FormField label={section.type === "video" ? "Video URL" : "Audio URL"} value={section.videoUrl || ""} onChange={(e) => updateSection(section.id, { videoUrl: e.target.value })} />
                {section.type === "video" && (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <input
                      id={`lesson-video-${section.id}`}
                      type="file"
                      accept="video/*"
                      className="sr-only"
                      onChange={(e) => {
                        uploadVideo(section.id, e.target.files?.[0]);
                        e.target.value = "";
                      }}
                    />
                    <label htmlFor={`lesson-video-${section.id}`} className={`btn-secondary btn-sm ${uploadingId === section.id ? "pointer-events-none opacity-70" : ""}`}>
                      {uploadingId === section.id ? "Uploading..." : "Upload video"}
                    </label>
                  </div>
                )}
              </div>
            )}
            {section.type === "text" && (
              <FormField as="textarea" label="Lesson text" value={section.description || ""} onChange={(e) => updateSection(section.id, { description: e.target.value })} className="sm:col-span-2" />
            )}
          </div>
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
