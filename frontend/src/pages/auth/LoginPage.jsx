import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { LogIn } from "lucide-react";
import { Input, Section } from "../../components/ui";
import { loginUser, setAuthView } from "../../store/portalSlice";

export function LoginPage() {
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.portal);
  const [form, setForm] = useState({ email: "", password: "" });

  async function submit(event) {
    event.preventDefault();
    await dispatch(loginUser(form));
  }

  return (
    <Section title="Login">
      <form className="auth-card" onSubmit={submit}>
        <div>
          <p className="eyebrow">Quran Connect</p>
          <h3>Welcome back</h3>
          <p>Sign in to continue managing courses, learning progress, reports, and payments.</p>
        </div>
        <Input label="Email" type="email" value={form.email} onChange={(email) => setForm({ ...form, email })} />
        <Input label="Password" type="password" value={form.password} onChange={(password) => setForm({ ...form, password })} />
        {error && <p className="error-text">{error}</p>}
        <button className="primary-button full" disabled={status === "loading"}>
          <LogIn size={18} />
          {status === "loading" ? "Signing in..." : "Login"}
        </button>
        <button type="button" className="auth-link" onClick={() => dispatch(setAuthView("register"))}>
          Need an account? Register
        </button>
      </form>
    </Section>
  );
}
