import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppLayout } from "./components/Layout";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { AdminPage, adminNav } from "./pages/admin/AdminPage";
import { StudentPage, studentNav } from "./pages/student/StudentPage";
import { TeacherPage, teacherNav } from "./pages/teacher/TeacherPage";
import { clearToast, deleteCourse, fetchCourses, logout, saveCourse, setActive, setAuthView, setRole, setToast, updateCourse, updateUser } from "./store/portalSlice";

function App() {
  const dispatch = useDispatch();
  const portal = useSelector((state) => state.portal);
  const nav = portal.role === "admin" ? adminNav : portal.role === "student" ? studentNav : teacherNav;

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  const pageProps = {
    ...portal,
    setToast: (message) => dispatch(setToast(message)),
    saveCourse: (course) => dispatch(saveCourse(course)),
    deleteCourse: (id) => dispatch(deleteCourse(id)),
    updateCourse: (id, updates) => dispatch(updateCourse({ id, updates })),
    updateUser: (id, updates) => dispatch(updateUser({ id, updates })),
  };

  return (
    <AppLayout
      role={portal.role}
      setRole={(role) => dispatch(setRole(role))}
      nav={nav}
      active={portal.active}
      setActive={(active) => dispatch(setActive(active))}
      logout={() => dispatch(logout())}
      user={portal.user}
      token={portal.token}
      authView={portal.authView}
      setAuthView={(view) => dispatch(setAuthView(view))}
      toast={portal.toast}
      clearToast={() => dispatch(clearToast())}
    >
      {portal.authView === "login" && <LoginPage />}
      {portal.authView === "register" && <RegisterPage defaultRole={portal.role} />}
      {!portal.authView && portal.role === "teacher" && <TeacherPage {...pageProps} />}
      {!portal.authView && portal.role === "admin" && <AdminPage {...pageProps} />}
      {!portal.authView && portal.role === "student" && <StudentPage {...pageProps} />}
    </AppLayout>
  );
}

export default App;
