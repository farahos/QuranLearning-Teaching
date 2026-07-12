import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { Clock3, ShieldAlert } from "lucide-react";
import { Badge, statusTone } from "../components/common/Badge";
import { KYC_STATUS_LABELS } from "../utils/constants";

export function RoleRoute({ role }) {
  const user = useSelector((state) => state.auth.user);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to="/unauthorized" replace />;

  if (role === "teacher" && user.active === false) {
    return <TeacherPendingScreen user={user} />;
  }

  return <Outlet />;
}

function TeacherPendingScreen({ user }) {
  const rejected = user.kycStatus === "rejected";

  return (
    <div className="mx-auto max-w-xl py-10 text-center">
      <div className="card-pad">
        <span className={`mx-auto grid h-14 w-14 place-items-center rounded-full ${rejected ? "bg-red-50 text-quran-red" : "bg-amber-50 text-quran-amber"}`}>
          {rejected ? <ShieldAlert size={26} /> : <Clock3 size={26} />}
        </span>
        <h1 className="mt-4 text-xl font-black text-quran-text">{rejected ? "Registration not approved" : "Your teacher account is pending approval"}</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-quran-muted">
          {rejected
            ? "An administrator reviewed your teacher application and it was not approved. You can update your profile details and contact support to resubmit."
            : "An administrator needs to review your profile and KYC documents before you can access the teacher dashboard. This usually only takes a short while."}
        </p>
        <div className="mt-4 flex justify-center">
          <Badge tone={statusTone(user.kycStatus)}>KYC status: {KYC_STATUS_LABELS[user.kycStatus] || user.kycStatus}</Badge>
        </div>
      </div>
    </div>
  );
}
