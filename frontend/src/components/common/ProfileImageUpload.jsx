import { useId, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { uploadApi } from "../../api/uploadApi";
import { api } from "../../api/client";
import { Avatar } from "./Avatar";

export function ProfileImageUpload({ value, name, onChange, onError, onSuccess, disabled = false }) {
  const inputId = useId();
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadApi.uploadImage(file);
      onChange(result.imageUrl);
      onSuccess?.("Profile image uploaded");
    } catch (error) {
      onError?.(error.message || "Could not upload profile image");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <Avatar src={value ? api.mediaUrl(value) : ""} name={name} size="xl" />
      <div className="min-w-0 flex-1">
        <label className="label" htmlFor={inputId}>
          Profile image
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <label className={`btn-secondary relative overflow-hidden ${disabled || uploading ? "pointer-events-none opacity-55" : ""}`}>
            {uploading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Upload size={16} aria-hidden="true" />}
            Upload file
            <input
              id={inputId}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              disabled={disabled || uploading}
              className="absolute inset-0 cursor-pointer opacity-0"
              aria-label="Upload profile image"
            />
          </label>
          {value && <span className="max-w-full truncate text-xs font-semibold text-quran-muted">{value}</span>}
        </div>
        <p className="field-hint">Upload JPG, PNG, or WebP. Max size is 8MB.</p>
      </div>
    </div>
  );
}
