import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { GraduationCap, UserPlus, UserRound } from "lucide-react";
import { FormField } from "../../components/common/FormField";
import { Button } from "../../components/common/Button";
import { useToast } from "../../components/common/Toast";
import { registerUser, clearAuthMessage } from "../../features/auth/authSlice";
import { runValidation, validators } from "../../utils/validators";
import { ROLES } from "../../utils/constants";

// Admin accounts are not self-service — only Student and Teacher can sign up here.
const ROLE_OPTIONS = [
  { id: ROLES.STUDENT, title: "Student", icon: UserRound, text: "Learn, track progress, favorite courses." },
  { id: ROLES.TEACHER, title: "Teacher", icon: GraduationCap, text: "Create courses after admin approval." },
];

const emptyForm = {
  email: "",
  password: "",
  role: ROLES.STUDENT,
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
      email: [validators.required("Email is required"), validators.email()],
      password: [validators.required("Password is required"), validators.min(6, "Password must be at least 6 characters")],
    };
    return runValidation(form, rules);
  }

  function nameFromEmail(email) {
    const localPart = email.split("@")[0] || "User";
    return localPart
      .replace(/[._-]+/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
      .trim();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    const payload = {
      email: form.email.trim(),
      password: form.password,
      role: form.role,
      fullName: nameFromEmail(form.email.trim()),
    };
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
        <p className="mt-1 text-sm text-quran-muted">Choose your role, then create your account with email and password.</p>

        <form className="mt-5 space-y-5" onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2" role="radiogroup" aria-label="Account role">
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
            <FormField label="Email" type="email" required value={form.email} error={fieldErrors.email} onChange={set("email")} />
            <FormField label="Password" type="password" required value={form.password} error={fieldErrors.password} onChange={set("password")} />
          </div>

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
