import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppRoutes } from "./routes/AppRoutes";
import { restoreSession } from "./features/auth/authSlice";
import { fetchCategories } from "./features/categories/categorySlice";

function App() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    if (token) dispatch(restoreSession());
  }, [dispatch, token]);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  return <AppRoutes />;
}

export default App;
