import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { FormField } from "../../components/common/FormField";
import { Button } from "../../components/common/Button";
import { useToast } from "../../components/common/Toast";
import { loginUser, clearAuthMessage } from "../../features/auth/authSlice";
import { isValidEmail } from "../../utils/validators";

export function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { status, error, token, user } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (token && user) {
      const from = location.state?.from;
      navigate(from && from !== "/login" ? from : `/${user.role}`, { replace: true });
    }
  }, [token, user, navigate, location.state]);

  useEffect(() => () => dispatch(clearAuthMessage()), [dispatch]);

  async function handleSubmit(event) {
    event.preventDefault();
    const errors = {};
    if (!form.email || !isValidEmail(form.email)) errors.email = "Enter a valid email address";
    if (!form.password) errors.password = "Password is required";
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result)) {
      toast.success("Logged in successfully");
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="card-pad">
        <p className="text-xs font-black uppercase tracking-wide text-quran-green">Quran Connect</p>
        <h1 className="mt-1 text-2xl font-black text-quran-text">Welcome back</h1>
        <p className="mt-1 text-sm text-quran-muted">Sign in to continue managing courses, learning progress, reports, and payments.</p>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit} noValidate>
          <FormField
            label="Email"
            type="email"
            required
            autoComplete="email"
            value={form.email}
            error={fieldErrors.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
          />
          <FormField
            label="Password"
            type="password"
            required
            autoComplete="current-password"
            value={form.password}
            error={fieldErrors.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2.5 text-sm font-bold text-quran-red" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" variant="primary" full icon={LogIn} loading={status === "loading"}>
            {status === "loading" ? "Signing in..." : "Login"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-quran-muted">
          Need an account?{" "}
          <Link to="/register" className="font-bold text-quran-green hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
