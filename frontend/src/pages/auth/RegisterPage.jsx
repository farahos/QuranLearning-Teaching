import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { GraduationCap, ShieldCheck, UserPlus, UserRound } from "lucide-react";
import { FormField } from "../../components/common/FormField";
import { Textarea } from "../../components/common/Textarea";
import { Button } from "../../components/common/Button";
import { useToast } from "../../components/common/Toast";
import { registerUser, clearAuthMessage } from "../../features/auth/authSlice";
import { isValidEmail, isValidUrl, runValidation, validators } from "../../utils/validators";
import { ADMIN_INVITE_HINT, ROLES } from "../../utils/constants";

const ROLE_OPTIONS = [
  { id: ROLES.STUDENT, title: "Student", icon: UserRound, text: "Learn, track progress, favorite courses." },
  { id: ROLES.TEACHER, title: "Teacher", icon: GraduationCap, text: "Create courses after admin approval." },
  { id: ROLES.ADMIN, title: "Admin", icon: ShieldCheck, text: "Manage users, payments, and reports." },
];

const emptyForm = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: ROLES.STUDENT,
  whatsappNumber: "",
  profileImageUrl: "",
  telegramChannelLink: "",
  bio: "",
  experience: "",
  introVideoUrl: "",
  kycDocumentUrl: "",
  learningGoal: "",
  guardianPhone: "",
  adminInviteCode: "",
  acceptTerms: false,
};

export function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const { status, error, token, user } = useSelector((state) => state.auth);
  const defaultRole = searchParams.get("role");
  const [form, setForm] = useState({ ...emptyForm, role: ROLE_OPTIONS.some((r) => r.id === defaultRole) ? defaultRole : ROLES.STUDENT });
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (token && user) navigate(`/${user.role}`, { replace: true });
  }, [token, user, navigate]);

  useEffect(() => () => dispatch(clearAuthMessage()), [dispatch]);

  function set(field) {
    return (event) => setForm({ ...form, [field]: event.target.value });
  }

  function validate() {
    const rules = {
      fullName: [validators.required("Full name is required")],
      email: [validators.required("Email is required"), validators.email()],
      password: [validators.required("Password is required"), validators.min(6, "Password must be at least 6 characters")],
      confirmPassword: [validators.required("Please confirm your password"), validators.matches("password", "Passwords do not match")],
      whatsappNumber: [validators.required("WhatsApp or phone number is required")],
    };
    if (form.role === ROLES.ADMIN) {
      rules.adminInviteCode = [validators.required("Admin invite code is required")];
    }
    if (form.role === ROLES.TEACHER) {
      rules.experience = [validators.required("Tell students about your teaching experience")];
      rules.bio = [validators.required("A short bio helps students get to know you")];
      if (form.introVideoUrl && !isValidUrl(form.introVideoUrl)) rules.introVideoUrl = [() => "Enter a valid URL"];
    }
    const errors = runValidation(form, rules);
    if (!form.acceptTerms) errors.acceptTerms = "Please accept the registration terms";
    return errors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    const { confirmPassword, acceptTerms, ...payload } = form;
    const result = await dispatch(registerUser(payload));
    if (registerUser.fulfilled.match(result)) {
      toast.success(result.payload.user.role === ROLES.TEACHER ? "Registration submitted for approval" : "Account created");
    }
  }

  return (
    <div className="w-full max-w-3xl">
      <div className="card-pad">
        <p className="text-xs font-black uppercase tracking-wide text-quran-green">Quran Connect</p>
        <h1 className="mt-1 text-2xl font-black text-quran-text">Create your account</h1>
        <p className="mt-1 text-sm text-quran-muted">Choose the correct role so your workspace opens with the right tools and approval flow.</p>

        <form className="mt-5 space-y-5" onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3" role="radiogroup" aria-label="Account role">
            {ROLE_OPTIONS.map(({ id, title, icon: Icon, text }) => (
              <button
                type="button"
                key={id}
                role="radio"
                aria-checked={form.role === id}
                onClick={() => setForm({ ...form, role: id })}
                className={`grid gap-1 rounded-lg border p-3 text-left transition-colors ${
                  form.role === id ? "border-quran-green bg-emerald-50" : "border-quran-line bg-white hover:border-quran-green/50"
                }`}
              >
                <Icon size={19} className={form.role === id ? "text-quran-green" : "text-quran-muted"} />
                <strong className="text-sm text-quran-text">{title}</strong>
                <span className="text-xs leading-snug text-quran-muted">{text}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Full name" required value={form.fullName} error={fieldErrors.fullName} onChange={set("fullName")} />
            <FormField label="Email" type="email" required value={form.email} error={fieldErrors.email} onChange={set("email")} />
            <FormField label="Password" type="password" required value={form.password} error={fieldErrors.password} onChange={set("password")} />
            <FormField label="Confirm password" type="password" required value={form.confirmPassword} error={fieldErrors.confirmPassword} onChange={set("confirmPassword")} />
            <FormField label="WhatsApp / phone" required value={form.whatsappNumber} error={fieldErrors.whatsappNumber} onChange={set("whatsappNumber")} />
            <FormField label="Profile image URL" value={form.profileImageUrl} hint="Optional" onChange={set("profileImageUrl")} />
          </div>

          {form.role === ROLES.TEACHER && (
            <div className="space-y-4 rounded-lg border border-quran-line bg-quran-soft/60 p-4">
              <p className="text-sm font-black text-quran-text">Teacher details</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Teaching experience" required value={form.experience} error={fieldErrors.experience} onChange={set("experience")} hint="e.g. 5 years teaching Tajweed" />
                <FormField label="Telegram channel link" value={form.telegramChannelLink} onChange={set("telegramChannelLink")} />
                <FormField label="Intro video URL" value={form.introVideoUrl} error={fieldErrors.introVideoUrl} onChange={set("introVideoUrl")} />
                <FormField label="KYC document URL" value={form.kycDocumentUrl} onChange={set("kycDocumentUrl")} hint="Link to an ID or certification document" />
              </div>
              <Textarea label="Teacher bio" required value={form.bio} error={fieldErrors.bio} onChange={set("bio")} />
              <p className="form-note rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-quran-green">
                Teacher registration will be sent to admin for approval before login is enabled.
              </p>
            </div>
          )}

          {form.role === ROLES.STUDENT && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Learning goal" value={form.learningGoal} onChange={set("learningGoal")} hint="e.g. Memorize Juz Amma" />
              <FormField label="Guardian phone" value={form.guardianPhone} onChange={set("guardianPhone")} hint="Optional" />
            </div>
          )}

          {form.role === ROLES.ADMIN && (
            <div className="space-y-2">
              <FormField label="Admin invite code" required value={form.adminInviteCode} error={fieldErrors.adminInviteCode} onChange={set("adminInviteCode")} />
              <p className="field-hint">{ADMIN_INVITE_HINT}</p>
            </div>
          )}

          <label className="flex items-start gap-2.5 rounded-lg bg-quran-soft p-3 text-sm font-bold text-quran-muted">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 accent-quran-green"
              checked={form.acceptTerms}
              onChange={(event) => setForm({ ...form, acceptTerms: event.target.checked })}
            />
            <span>{form.role === ROLES.TEACHER ? "I understand teacher accounts need admin approval before I can sign in." : "I agree to create this account."}</span>
          </label>
          {fieldErrors.acceptTerms && <p className="field-error -mt-3">{fieldErrors.acceptTerms}</p>}

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2.5 text-sm font-bold text-quran-red" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" variant="primary" full icon={UserPlus} loading={status === "loading"}>
            {status === "loading" ? "Submitting..." : "Submit registration"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-quran-muted">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-quran-green hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
