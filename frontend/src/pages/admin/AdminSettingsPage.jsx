import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Save, UserCircle } from "lucide-react";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import { FormField } from "../../components/common/FormField";
import { ProfileImageUpload } from "../../components/common/ProfileImageUpload";
import { Select } from "../../components/common/Select";
import { useToast } from "../../components/common/Toast";
import { updateSettingsLocal, clearAdminMessage } from "../../features/admin/adminSlice";
import { updateProfile, clearAuthMessage } from "../../features/auth/authSlice";

function ToggleRow({ label, hint, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-lg border border-quran-line px-3 py-2.5">
      <span>
        <span className="block text-sm font-bold text-quran-text">{label}</span>
        {hint && <span className="block text-xs text-quran-muted">{hint}</span>}
      </span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-5 w-9 shrink-0 accent-quran-green" />
    </label>
  );
}

export function AdminSettingsPage() {
  const dispatch = useDispatch();
  const toast = useToast();
  const { settings, message: adminMessage } = useSelector((state) => state.admin);
  const { user, status: authStatus, error: authError, message: authMessage } = useSelector((state) => state.auth);
  const [form, setForm] = useState(settings);
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || "",
    profileImageUrl: user?.profileImageUrl || "",
    whatsappNumber: user?.whatsappNumber || "",
  });

  useEffect(() => {
    setProfileForm({
      fullName: user?.fullName || "",
      profileImageUrl: user?.profileImageUrl || "",
      whatsappNumber: user?.whatsappNumber || "",
    });
  }, [user]);

  useEffect(() => {
    if (adminMessage) {
      toast.success(adminMessage);
      dispatch(clearAdminMessage());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminMessage]);

  useEffect(() => {
    if (authMessage) {
      toast.success(authMessage);
      dispatch(clearAuthMessage());
    }
    if (authError) {
      toast.error(authError);
      dispatch(clearAuthMessage());
    }
  }, [authMessage, authError, toast, dispatch]);

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function setProfileField(key, value) {
    setProfileForm((current) => ({ ...current, [key]: value }));
  }

  function handleSave() {
    dispatch(updateSettingsLocal(form));
  }

  function handleProfileSave(event) {
    event.preventDefault();
    dispatch(updateProfile(profileForm));
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="page-title">Platform settings</h1>
          <p className="page-subtitle">Configure platform-wide preferences.</p>
        </div>
        <Button variant="primary" icon={Save} onClick={handleSave}>
          Save changes
        </Button>
      </div>

      <Badge tone="amber">Demo only — GET/PUT /api/admin/settings does not exist yet. Changes are kept in this session's Redux store only.</Badge>

      <Card title="Admin profile" subtitle="Manage your account photo and basic details">
        <form onSubmit={handleProfileSave} className="space-y-4">
          <ProfileImageUpload
            value={profileForm.profileImageUrl}
            name={profileForm.fullName}
            onChange={(imageUrl) => setProfileField("profileImageUrl", imageUrl)}
            onSuccess={toast.success}
            onError={toast.error}
            disabled={authStatus === "loading"}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Full name" required value={profileForm.fullName} onChange={(e) => setProfileField("fullName", e.target.value)} />
            <FormField label="WhatsApp number" value={profileForm.whatsappNumber} onChange={(e) => setProfileField("whatsappNumber", e.target.value)} />
          </div>
          <Button type="submit" variant="primary" icon={UserCircle} loading={authStatus === "loading"}>
            Save profile
          </Button>
        </form>
      </Card>

      <Card title="General" subtitle="Platform identity and support contact">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Platform name" name="platformName" value={form.platformName} onChange={(e) => setField("platformName", e.target.value)} />
          <FormField label="Platform logo URL" name="platformLogoUrl" value={form.platformLogoUrl} onChange={(e) => setField("platformLogoUrl", e.target.value)} />
          <FormField label="Support email" type="email" name="supportEmail" value={form.supportEmail} onChange={(e) => setField("supportEmail", e.target.value)} />
          <FormField label="Support phone" name="supportPhone" value={form.supportPhone} onChange={(e) => setField("supportPhone", e.target.value)} />
          <Select
            label="Default currency"
            value={form.defaultCurrency}
            onChange={(e) => setField("defaultCurrency", e.target.value)}
            options={[
              { value: "USD", label: "USD — US Dollar" },
              { value: "EUR", label: "EUR — Euro" },
              { value: "GBP", label: "GBP — British Pound" },
            ]}
          />
        </div>
      </Card>

      <Card title="Payments & certificates" subtitle="Commission rate and certificate issuance">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label="Platform fee (%)"
            type="number"
            min="0"
            max="100"
            name="platformFeePercent"
            value={form.platformFeePercent}
            onChange={(e) => setField("platformFeePercent", Number(e.target.value))}
            hint="Applied to teacher course payments as the platform's commission."
          />
          <div className="flex items-end">
            <ToggleRow label="Certificates enabled" hint="Allow students to earn certificates on completion" checked={form.certificatesEnabled} onChange={(v) => setField("certificatesEnabled", v)} />
          </div>
        </div>
      </Card>

      <Card title="Platform toggles" subtitle="Site-wide switches">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ToggleRow label="Maintenance mode" hint="Temporarily block non-admin access" checked={form.maintenanceMode} onChange={(v) => setField("maintenanceMode", v)} />
          <ToggleRow label="Registration enabled" hint="Allow new sign-ups" checked={form.registrationEnabled} onChange={(v) => setField("registrationEnabled", v)} />
          <ToggleRow label="Teacher approval required" hint="Require admin KYC review before teachers go live" checked={form.teacherApprovalRequired} onChange={(v) => setField("teacherApprovalRequired", v)} />
        </div>
      </Card>
    </section>
  );
}
