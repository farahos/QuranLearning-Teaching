import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ShieldAlert, UserCircle } from "lucide-react";
import { Badge, statusTone } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import { FormField } from "../../components/common/FormField";
import { useToast } from "../../components/common/Toast";
import { clearAuthMessage, updateTeacherProfile } from "../../features/auth/authSlice";
import { submitTeacherKyc } from "../../features/teacher/teacherSlice";
import { KYC_STATUS, KYC_STATUS_LABELS } from "../../utils/constants";
import { formatDate } from "../../utils/formatters";

export function TeacherProfilePage() {
  const dispatch = useDispatch();
  const toast = useToast();
  const user = useSelector((state) => state.auth.user);
  const authStatus = useSelector((state) => state.auth.status);
  const authError = useSelector((state) => state.auth.error);
  const authMessage = useSelector((state) => state.auth.message);
  const kycStatusFlag = useSelector((state) => state.teacher.kycStatus);
  const kycError = useSelector((state) => state.teacher.kycError);

  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    profileImageUrl: user?.profileImageUrl || "",
    whatsappNumber: user?.whatsappNumber || "",
    bio: user?.bio || "",
    experience: user?.experience || "",
    telegramChannelLink: user?.telegramChannelLink || "",
    introVideoUrl: user?.introVideoUrl || "",
    kycDocumentUrl: user?.kycDocumentUrl || "",
  });
  const [kycDraftUrl, setKycDraftUrl] = useState("");

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

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    dispatch(updateTeacherProfile(form));
  }

  function handleKycResubmit(event) {
    event.preventDefault();
    if (!kycDraftUrl.trim()) {
      toast.error("Add a document URL before resubmitting");
      return;
    }
    dispatch(submitTeacherKyc({ kycDocumentUrl: kycDraftUrl.trim() }))
      .unwrap()
      .then(() => {
        toast.success("KYC documents submitted for review");
        setKycDraftUrl("");
      })
      .catch((message) => toast.error(message || kycError || "Could not submit KYC"));
  }

  const needsKyc = user?.kycStatus === KYC_STATUS.NOT_SUBMITTED || user?.kycStatus === KYC_STATUS.REJECTED;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Manage your public teacher profile.</p>
      </div>

      <div className="two-col">
        <Card title="Profile details">
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Full name" required value={form.fullName} onChange={(e) => set("fullName", e.target.value)} />
            <FormField label="Profile image URL" value={form.profileImageUrl} onChange={(e) => set("profileImageUrl", e.target.value)} />
            <FormField label="WhatsApp number" value={form.whatsappNumber} onChange={(e) => set("whatsappNumber", e.target.value)} />
            <FormField as="textarea" label="Bio" value={form.bio} onChange={(e) => set("bio", e.target.value)} />
            <FormField label="Experience" value={form.experience} placeholder="e.g. 5 years teaching Tajweed" onChange={(e) => set("experience", e.target.value)} />
            <FormField label="Telegram channel link" value={form.telegramChannelLink} onChange={(e) => set("telegramChannelLink", e.target.value)} />
            <FormField label="Intro video URL" value={form.introVideoUrl} onChange={(e) => set("introVideoUrl", e.target.value)} />
            <FormField label="KYC document URL" value={form.kycDocumentUrl} onChange={(e) => set("kycDocumentUrl", e.target.value)} />
            <Button type="submit" variant="primary" loading={authStatus === "loading"} full>
              Save profile
            </Button>
          </form>
        </Card>

        <div className="space-y-6">
          <Card title="Account status">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-quran-muted">KYC status</span>
                <Badge tone={statusTone(user?.kycStatus)}>{KYC_STATUS_LABELS[user?.kycStatus] || user?.kycStatus || "Unknown"}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-quran-muted">Account</span>
                <Badge tone={user?.active ? "green" : "red"}>{user?.active ? "Active" : "Inactive"}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-quran-muted">Joined</span>
                <span className="text-sm font-semibold text-quran-text">{formatDate(user?.createdAt)}</span>
              </div>
            </div>
          </Card>

          {needsKyc && (
            <Card title="Resubmit KYC documents" subtitle="Your account needs a valid ID document to be verified">
              <form onSubmit={handleKycResubmit} className="space-y-3">
                <FormField
                  label="KYC document URL"
                  required
                  value={kycDraftUrl}
                  onChange={(e) => setKycDraftUrl(e.target.value)}
                  placeholder="Link to your ID document"
                />
                <Button type="submit" variant="secondary" icon={ShieldAlert} loading={kycStatusFlag === "loading"} full>
                  Resubmit for review
                </Button>
              </form>
            </Card>
          )}

          {!needsKyc && (
            <Card>
              <div className="flex items-center gap-3 text-quran-muted">
                <UserCircle size={20} aria-hidden="true" />
                <p className="text-sm">Your KYC documents are on file and under the status shown above.</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}
