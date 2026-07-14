import { Routes, Route } from "react-router-dom";
import { PublicLayout } from "../components/layout/PublicLayout";
import { AuthLayout } from "../components/layout/AuthLayout";
import { AppLayout } from "../components/layout/AppLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { RoleRoute } from "./RoleRoute";

import { LandingPage } from "../pages/public/LandingPage";
import { NotFoundPage } from "../pages/public/NotFoundPage";
import { UnauthorizedPage } from "../pages/public/UnauthorizedPage";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";

import { TeacherOverviewPage } from "../pages/teacher/TeacherOverviewPage";
import { TeacherCategoriesPage } from "../pages/teacher/TeacherCategoriesPage";
import { TeacherCoursesPage } from "../pages/teacher/TeacherCoursesPage";
import { TeacherCourseEditorPage } from "../pages/teacher/TeacherCourseEditorPage";
import { TeacherMaterialsPage } from "../pages/teacher/TeacherMaterialsPage";
import { TeacherRatingsPage } from "../pages/teacher/TeacherRatingsPage";
import { TeacherReportsPage } from "../pages/teacher/TeacherReportsPage";
import { TeacherWalletPage } from "../pages/teacher/TeacherWalletPage";
import { TeacherCertificatesPage } from "../pages/teacher/TeacherCertificatesPage";
import { TeacherProfilePage } from "../pages/teacher/TeacherProfilePage";

import { StudentOverviewPage } from "../pages/student/StudentOverviewPage";
import { StudentCoursesPage } from "../pages/student/StudentCoursesPage";
import { StudentCourseDetailsPage } from "../pages/student/StudentCourseDetailsPage";
import { StudentLearningPage } from "../pages/student/StudentLearningPage";
import { StudentProgressPage } from "../pages/student/StudentProgressPage";
import { StudentFavoritesPage } from "../pages/student/StudentFavoritesPage";
import { StudentNotificationsPage } from "../pages/student/StudentNotificationsPage";
import { StudentCertificatesPage } from "../pages/student/StudentCertificatesPage";
import { StudentProfilePage } from "../pages/student/StudentProfilePage";

import { AdminOverviewPage } from "../pages/admin/AdminOverviewPage";
import { AdminUsersPage } from "../pages/admin/AdminUsersPage";
import { AdminTeacherRequestsPage } from "../pages/admin/AdminTeacherRequestsPage";
import { AdminCoursesPage } from "../pages/admin/AdminCoursesPage";
import { AdminCategoriesPage } from "../pages/admin/AdminCategoriesPage";
import { AdminPaymentsPage } from "../pages/admin/AdminPaymentsPage";
import { AdminReportsPage } from "../pages/admin/AdminReportsPage";
import { AdminLogsPage } from "../pages/admin/AdminLogsPage";
import { AdminSettingsPage } from "../pages/admin/AdminSettingsPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/courses/:courseId"
          element={
            <div className="content-container py-8">
              <StudentCourseDetailsPage />
            </div>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route element={<RoleRoute role="teacher" />}>
            <Route path="/teacher" element={<TeacherOverviewPage />} />
            <Route path="/teacher/categories" element={<TeacherCategoriesPage />} />
            <Route path="/teacher/courses" element={<TeacherCoursesPage />} />
            <Route path="/teacher/courses/new" element={<TeacherCourseEditorPage />} />
            <Route path="/teacher/courses/:courseId/edit" element={<TeacherCourseEditorPage />} />
            <Route path="/teacher/materials" element={<TeacherMaterialsPage />} />
            <Route path="/teacher/ratings" element={<TeacherRatingsPage />} />
            <Route path="/teacher/reports" element={<TeacherReportsPage />} />
            <Route path="/teacher/wallet" element={<TeacherWalletPage />} />
            <Route path="/teacher/certificates" element={<TeacherCertificatesPage />} />
            <Route path="/teacher/profile" element={<TeacherProfilePage />} />
          </Route>

          <Route element={<RoleRoute role="student" />}>
            <Route path="/student" element={<StudentOverviewPage />} />
            <Route path="/student/courses" element={<StudentCoursesPage />} />
            <Route path="/student/courses/:courseId" element={<StudentCourseDetailsPage />} />
            <Route path="/student/learning/:courseId" element={<StudentLearningPage />} />
            <Route path="/student/progress" element={<StudentProgressPage />} />
            <Route path="/student/favorites" element={<StudentFavoritesPage />} />
            <Route path="/student/notifications" element={<StudentNotificationsPage />} />
            <Route path="/student/certificates" element={<StudentCertificatesPage />} />
            <Route path="/student/profile" element={<StudentProfilePage />} />
          </Route>

          <Route element={<RoleRoute role="admin" />}>
            <Route path="/admin" element={<AdminOverviewPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/teacher-requests" element={<AdminTeacherRequestsPage />} />
            <Route path="/admin/courses" element={<AdminCoursesPage />} />
            <Route path="/admin/categories" element={<AdminCategoriesPage />} />
            <Route path="/admin/payments" element={<AdminPaymentsPage />} />
            <Route path="/admin/reports" element={<AdminReportsPage />} />
            <Route path="/admin/logs" element={<AdminLogsPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
