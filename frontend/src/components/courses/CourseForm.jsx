import { useState } from "react";
import { Save } from "lucide-react";
import { FormField } from "../common/FormField";
import { Textarea } from "../common/Textarea";
import { Select } from "../common/Select";
import { Button } from "../common/Button";
import { COURSE_LANGUAGES, COURSE_LEVELS, COURSE_STATUS, COURSE_STATUS_LABELS } from "../../utils/constants";
import { runValidation, validators } from "../../utils/validators";
import { uploadApi } from "../../api/uploadApi";

const STATUS_OPTIONS = Object.entries(COURSE_STATUS_LABELS).map(([value, label]) => ({ value, label }));
const LEVEL_OPTIONS = COURSE_LEVELS.map((level) => ({ value: level, label: level }));
const LANGUAGE_OPTIONS = COURSE_LANGUAGES.map((lang) => ({ value: lang, label: lang }));

function toLines(value) {
  return (value || []).join("\n");
}
function fromLines(value) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function CourseForm({ course, categories = [], onSubmit, onCancel, loading = false, submitLabel = "Save course" }) {
  const [form, setForm] = useState({
    courseName: course?.courseName || "",
    shortDescription: course?.shortDescription || "",
    description: course?.description || "",
    category: course?.category || categories[0]?.name || "",
    introVideoUrl: course?.introVideoUrl || "",
    language: course?.language || "Arabic",
    level: course?.level || "Beginner",
    duration: course?.duration || "",
    learningOutcomes: toLines(course?.learningOutcomes),
    requirements: toLines(course?.requirements),
    price: course?.price ? String(course.price) : "",
    status: course?.status || COURSE_STATUS.DRAFT,
    certificateEnabled: course?.certificateEnabled ?? true,
    downloadableMaterials: course?.downloadableMaterials ?? true,
    surah: course?.surah || "",
    juz: course?.juz || "",
    tajweedLevel: course?.tajweedLevel || "",
    memorizationTarget: course?.memorizationTarget || "",
  });
  const [errors, setErrors] = useState({});
  const [uploadingIntro, setUploadingIntro] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleIntroUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingIntro(true);
    try {
      const result = await uploadApi.uploadVideo(file);
      set("introVideoUrl", result.videoUrl || "");
    } catch (error) {
      setErrors((prev) => ({ ...prev, introVideoUrl: error.message || "Could not upload video" }));
    } finally {
      setUploadingIntro(false);
      event.target.value = "";
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting || loading) return;
    const rules = {
      courseName: [validators.required("Course title is required")],
      description: [validators.required("Full description is required")],
      category: [validators.required("Choose a category")],
      introVideoUrl: [validators.url()],
      price: [(value) => (Number(value || 0) >= 0 ? null : "Enter a valid price")],
    };
    const validationErrors = runValidation(form, rules);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;

    setSubmitting(true);
    try {
      await onSubmit({
      courseName: form.courseName,
      shortDescription: form.shortDescription,
      description: form.description,
      category: form.category,
      introVideoUrl: form.introVideoUrl,
      language: form.language,
      level: form.level,
      duration: form.duration,
      learningOutcomes: fromLines(form.learningOutcomes),
      requirements: fromLines(form.requirements),
      price: Number(form.price) || 0,
      status: form.status,
      certificateEnabled: form.certificateEnabled,
      downloadableMaterials: form.downloadableMaterials,
      surah: form.surah,
      juz: form.juz,
      tajweedLevel: form.tajweedLevel,
      memorizationTarget: form.memorizationTarget,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Course title" required value={form.courseName} error={errors.courseName} onChange={(e) => set("courseName", e.target.value)} className="sm:col-span-2" />
        <FormField label="Short description" value={form.shortDescription} hint="One sentence shown on course cards" onChange={(e) => set("shortDescription", e.target.value)} className="sm:col-span-2" />
        <Textarea label="Full description" required value={form.description} error={errors.description} onChange={(e) => set("description", e.target.value)} className="sm:col-span-2" />
        <Select label="Category" required value={form.category} error={errors.category} onChange={(e) => set("category", e.target.value)} options={categories.map((c) => ({ value: c.name, label: c.name }))} />
        <Select label="Level" value={form.level} onChange={(e) => set("level", e.target.value)} options={LEVEL_OPTIONS} />
        <Select label="Language" value={form.language} onChange={(e) => set("language", e.target.value)} options={LANGUAGE_OPTIONS} />
        <FormField label="Duration" value={form.duration} placeholder="e.g. 6 weeks" onChange={(e) => set("duration", e.target.value)} />
        <div className="sm:col-span-2">
          <FormField label="Intro video URL" value={form.introVideoUrl} error={errors.introVideoUrl} onChange={(e) => set("introVideoUrl", e.target.value)} />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <input id="introVideoFile" type="file" accept="video/*" className="sr-only" onChange={handleIntroUpload} />
            <label htmlFor="introVideoFile" className={`btn-secondary btn-sm ${uploadingIntro ? "pointer-events-none opacity-70" : ""}`}>
              {uploadingIntro ? "Uploading..." : "Upload video"}
            </label>
          </div>
        </div>
        <Textarea label="Learning outcomes" hint="One per line" value={form.learningOutcomes} onChange={(e) => set("learningOutcomes", e.target.value)} />
        <Textarea label="Requirements" hint="One per line" value={form.requirements} onChange={(e) => set("requirements", e.target.value)} />
      </div>

      <div className="rounded-lg border border-quran-line bg-quran-soft/50 p-4">
        <p className="text-sm font-black text-quran-text">Quran learning details</p>
        <p className="mt-0.5 text-xs text-quran-muted">Optional — fill these in for recitation, Tajweed or Hifz-focused courses.</p>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FormField label="Surah" value={form.surah} placeholder="e.g. Al-Baqarah" onChange={(e) => set("surah", e.target.value)} />
          <FormField label="Juz" value={form.juz} placeholder="e.g. Juz 1-2" onChange={(e) => set("juz", e.target.value)} />
          <FormField label="Tajweed level" value={form.tajweedLevel} placeholder="e.g. Intermediate" onChange={(e) => set("tajweedLevel", e.target.value)} />
          <FormField label="Daily memorization target" value={form.memorizationTarget} placeholder="e.g. 5 ayat / day" onChange={(e) => set("memorizationTarget", e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Price (USD)" type="number" min="0" step="0.01" value={form.price} error={errors.price} placeholder="0 = Free" onChange={(e) => set("price", e.target.value)} />
        <Select label="Status" value={form.status} onChange={(e) => set("status", e.target.value)} options={STATUS_OPTIONS} hint="Only published courses appear in the student catalog" />
      </div>

      <div className="flex flex-wrap gap-3">
        <label className="toggle inline-flex items-center gap-2.5 rounded-lg border border-quran-line bg-white px-3 py-2 text-sm font-bold text-quran-muted">
          <input type="checkbox" className="h-4 w-4 accent-quran-green" checked={form.certificateEnabled} onChange={(e) => set("certificateEnabled", e.target.checked)} />
          Certificate enabled
        </label>
        <label className="toggle inline-flex items-center gap-2.5 rounded-lg border border-quran-line bg-white px-3 py-2 text-sm font-bold text-quran-muted">
          <input type="checkbox" className="h-4 w-4 accent-quran-green" checked={form.downloadableMaterials} onChange={(e) => set("downloadableMaterials", e.target.checked)} />
          Allow downloadable materials
        </label>
      </div>

      <p className="field-hint">
        Playlists, sections, materials and certificate rules are managed after saving the course, and are stored for this session only until the backend
        supports them (see the notice on those tabs).
      </p>

      <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-quran-line pt-4">
        {onCancel && (
          <Button variant="secondary" type="button" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button variant="primary" type="submit" icon={Save} loading={loading || submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
