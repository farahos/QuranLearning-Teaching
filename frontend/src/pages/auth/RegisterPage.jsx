import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GraduationCap, ShieldCheck, UserRound, UserPlus } from "lucide-react";
import { Input, Section } from "../../components/ui";
import { registerUser, setAuthView } from "../../store/portalSlice";

export function RegisterPage({ defaultRole = "student" }) {
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.portal);
  const [localError, setLocalError] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: defaultRole,
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
  });

  async function submit(event) {
    event.preventDefault();
    setLocalError("");
    if (form.password !== form.confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }
    if (!form.acceptTerms) {
      setLocalError("Please accept the registration terms");
      return;
    }
    await dispatch(registerUser(form));
  }

  return (
    <Section title="Register">
      <form className="auth-card wide" onSubmit={submit}>
        <div>
          <p className="eyebrow">Quran Connect</p>
          <h3>Create your account</h3>
          <p>Choose the correct role so your workspace opens with the right tools and approval flow.</p>
        </div>
        <RolePicker value={form.role} onChange={(role) => setForm({ ...form, role })} />
        <div className="auth-grid">
          <Input label="Full name" value={form.fullName} onChange={(fullName) => setForm({ ...form, fullName })} />
          <Input label="Email" type="email" value={form.email} onChange={(email) => setForm({ ...form, email })} />
          <Input label="Password" type="password" value={form.password} onChange={(password) => setForm({ ...form, password })} />
          <Input label="Confirm password" type="password" value={form.confirmPassword} onChange={(confirmPassword) => setForm({ ...form, confirmPassword })} />
          <Input label="WhatsApp / phone" value={form.whatsappNumber} onChange={(whatsappNumber) => setForm({ ...form, whatsappNumber })} />
          <Input label="Profile image URL" value={form.profileImageUrl} onChange={(profileImageUrl) => setForm({ ...form, profileImageUrl })} />
        </div>
        {form.role === "teacher" && <TeacherFields form={form} setForm={setForm} />}
        {form.role === "student" && <StudentFields form={form} setForm={setForm} />}
        {form.role === "admin" && <AdminFields form={form} setForm={setForm} />}
        <label className="check-row">
          <input type="checkbox" checked={form.acceptTerms} onChange={(event) => setForm({ ...form, acceptTerms: event.target.checked })} />
          <span>{form.role === "teacher" ? "I understand teacher accounts need admin approval." : "I agree to create this account online."}</span>
        </label>
        {(localError || error) && <p className="error-text">{localError || error}</p>}
        <button className="primary-button full" disabled={status === "loading"}>
          <UserPlus size={18} />
          {status === "loading" ? "Submitting..." : "Submit registration"}
        </button>
        <button type="button" className="auth-link" onClick={() => dispatch(setAuthView("login"))}>
          Already have an account? Login
        </button>
      </form>
    </Section>
  );
}

function RolePicker({ value, onChange }) {
  const roles = [
    { id: "student", title: "Student", icon: UserRound, text: "Learn, track progress, favorite courses." },
    { id: "teacher", title: "Teacher", icon: GraduationCap, text: "Create courses after admin approval." },
    { id: "admin", title: "Admin", icon: ShieldCheck, text: "Manage users, payments, and reports." },
  ];

  return (
    <div className="role-picker">
      {roles.map(({ id, title, icon: Icon, text }) => (
        <button type="button" key={id} className={value === id ? "active" : ""} onClick={() => onChange(id)}>
          <Icon size={19} />
          <strong>{title}</strong>
          <span>{text}</span>
        </button>
      ))}
    </div>
  );
}

function TeacherFields({ form, setForm }) {
  return (
    <>
      <div className="auth-grid">
        <Input label="Teaching experience" value={form.experience} onChange={(experience) => setForm({ ...form, experience })} />
        <Input label="Telegram channel link" value={form.telegramChannelLink} onChange={(telegramChannelLink) => setForm({ ...form, telegramChannelLink })} />
        <Input label="Intro video URL" value={form.introVideoUrl} onChange={(introVideoUrl) => setForm({ ...form, introVideoUrl })} />
        <Input label="KYC document URL" value={form.kycDocumentUrl} onChange={(kycDocumentUrl) => setForm({ ...form, kycDocumentUrl })} />
      </div>
      <label className="field">
        <span>Teacher bio</span>
        <textarea value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} />
      </label>
      <p className="form-note">Teacher registration will be sent to admin for approval before login is enabled.</p>
    </>
  );
}

function StudentFields({ form, setForm }) {
  return (
    <div className="auth-grid">
      <Input label="Learning goal" value={form.learningGoal} onChange={(learningGoal) => setForm({ ...form, learningGoal })} />
      <Input label="Guardian phone (optional)" value={form.guardianPhone} onChange={(guardianPhone) => setForm({ ...form, guardianPhone })} />
    </div>
  );
}

function AdminFields({ form, setForm }) {
  return (
    <>
      <Input label="Admin invite code" value={form.adminInviteCode} onChange={(adminInviteCode) => setForm({ ...form, adminInviteCode })} />
      <p className="form-note">Default local invite code: QLT-ADMIN-2026</p>
    </>
  );
}
