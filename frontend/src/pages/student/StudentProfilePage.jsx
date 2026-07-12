import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { UserCircle } from "lucide-react";
import { Avatar } from "../../components/common/Avatar";
import { Card } from "../../components/common/Card";
import { FormField } from "../../components/common/FormField";
import { Select } from "../../components/common/Select";
import { Button } from "../../components/common/Button";
import { useToast } from "../../components/common/Toast";
import { updateProfile, clearAuthMessage } from "../../features/auth/authSlice";
import { runValidation, validators, isValidPhone } from "../../utils/validators";
import { api } from "../../api/client";

const PREFERRED_LANGUAGES = ["Arabic", "English", "Somali", "Urdu", "French"];

export function StudentProfilePage() {
  const dispatch = useDispatch();
  const toast = useToast();
  const { user, error, message } = useSelector((state) => state.auth);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    profileImageUrl: user?.profileImageUrl || "",
    whatsappNumber: user?.whatsappNumber || "",
    learningGoal: user?.learningGoal || "",
    guardianPhone: user?.guardianPhone || "",
    preferredLanguage: sessionStorage.getItem("qc_preferred_language") || "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(clearAuthMessage());
    }
    if (error) {
      toast.error(error);
      dispatch(clearAuthMessage());
    }
  }, [message, error]); // eslint-disable-line react-hooks/exhaustive-deps

  function setField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationErrors = runValidation(form, {
      fullName: [validators.required("Full name is required")],
      whatsappNumber: [(value) => (!value || isValidPhone(value) ? null : "Enter a valid phone number")],
      guardianPhone: [(value) => (!value || isValidPhone(value) ? null : "Enter a valid phone number")],
    });
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;

    sessionStorage.setItem("qc_preferred_language", form.preferredLanguage);

    setSaving(true);
    try {
      await dispatch(
        updateProfile({
          fullName: form.fullName,
          profileImageUrl: form.profileImageUrl,
          whatsappNumber: form.whatsappNumber,
          learningGoal: form.learningGoal,
          guardianPhone: form.guardianPhone,
        })
      ).unwrap();
    } catch {
      // error surfaced via state.auth.error toast below
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Manage your learning profile.</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex items-center gap-4">
            <Avatar src={form.profileImageUrl ? api.mediaUrl(form.profileImageUrl) : ""} name={form.fullName} size="xl" />
            <div className="flex-1">
              <FormField
                label="Profile image URL"
                value={form.profileImageUrl}
                onChange={(event) => setField("profileImageUrl", event.target.value)}
                placeholder="https://..."
                hint="Paste a link to your profile photo"
              />
            </div>
          </div>

          <FormField label="Email" value={user?.email || ""} disabled hint="Email cannot be changed here" />

          <div className="two-col">
            <FormField
              label="Full name"
              required
              value={form.fullName}
              error={errors.fullName}
              onChange={(event) => setField("fullName", event.target.value)}
            />
            <FormField
              label="WhatsApp number"
              value={form.whatsappNumber}
              error={errors.whatsappNumber}
              onChange={(event) => setField("whatsappNumber", event.target.value)}
              placeholder="e.g. +252 61 XXXXXXX"
            />
          </div>

          <div className="two-col">
            <FormField
              label="Learning goal"
              value={form.learningGoal}
              onChange={(event) => setField("learningGoal", event.target.value)}
              placeholder="e.g. Memorize Juz Amma"
              hint="Not currently saved by the backend for this field — kept here for your reference"
            />
            <FormField
              label="Guardian phone"
              value={form.guardianPhone}
              error={errors.guardianPhone}
              onChange={(event) => setField("guardianPhone", event.target.value)}
              placeholder="e.g. +252 61 XXXXXXX"
              hint="Not currently saved by the backend for this field — kept here for your reference"
            />
          </div>

          <Select
            label="Preferred language"
            value={form.preferredLanguage}
            onChange={(event) => setField("preferredLanguage", event.target.value)}
            options={[{ value: "", label: "No preference" }, ...PREFERRED_LANGUAGES.map((lang) => ({ value: lang, label: lang }))]}
            hint="This field isn't part of the backend profile yet — it's saved locally to this browser only"
          />

          <Button type="submit" variant="primary" icon={UserCircle} loading={saving}>
            Save changes
          </Button>
        </form>
      </Card>
    </section>
  );
}
