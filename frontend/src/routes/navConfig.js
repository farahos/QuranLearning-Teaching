import {
  Award,
  Bell,
  BookOpen,
  ClipboardList,
  CreditCard,
  FileText,
  GraduationCap,
  Heart,
  LayoutDashboard,
  ScrollText,
  Settings,
  ShieldCheck,
  Star,
  UserCircle,
  Users,
  Wallet,
  BarChart3,
} from "lucide-react";
import { ROLES } from "../utils/constants";

export const teacherNav = [
  { to: "/teacher", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/teacher/categories", label: "Category Parts", icon: ClipboardList },
  { to: "/teacher/courses", label: "Courses", icon: BookOpen },
  { to: "/teacher/materials", label: "Materials", icon: FileText },
  { to: "/teacher/ratings", label: "Ratings & Feedback", icon: Star },
  { to: "/teacher/reports", label: "Reports", icon: BarChart3 },
  { to: "/teacher/wallet", label: "Wallet", icon: Wallet },
  { to: "/teacher/certificates", label: "Certificates", icon: Award },
  { to: "/teacher/profile", label: "Profile", icon: UserCircle },
];

export const studentNav = [
  { to: "/student", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/student/courses", label: "Courses", icon: BookOpen },
  { to: "/student/progress", label: "Progress", icon: GraduationCap },
  { to: "/student/favorites", label: "Favorites", icon: Heart },
  { to: "/student/notifications", label: "Notifications", icon: Bell },
  { to: "/student/certificates", label: "Certificates", icon: Award },
  { to: "/student/profile", label: "Profile", icon: UserCircle },
];

export const adminNav = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/teacher-requests", label: "Teacher Requests", icon: ShieldCheck },
  { to: "/admin/courses", label: "Courses", icon: BookOpen },
  { to: "/admin/categories", label: "Categories", icon: ClipboardList },
  { to: "/admin/payments", label: "Payments", icon: CreditCard },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
  { to: "/admin/logs", label: "Logs", icon: ScrollText },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export function getNavForRole(role) {
  if (role === ROLES.TEACHER) return teacherNav;
  if (role === ROLES.ADMIN) return adminNav;
  if (role === ROLES.STUDENT) return studentNav;
  return [];
}

export function getWorkspaceLabel(role) {
  if (role === ROLES.TEACHER) return "Teacher workspace";
  if (role === ROLES.ADMIN) return "Admin workspace";
  return "Student workspace";
}
