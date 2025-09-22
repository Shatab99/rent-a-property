import { Navigate, useLocation } from "react-router-dom";

export default function AdminRoute({ children }: { children: React.ReactElement }) {
  const { pathname, search } = useLocation();
  const isAuthed = Boolean(localStorage.getItem("userEmail"));
  const isAdmin = localStorage.getItem("isAdmin") === "1";
  if (!isAuthed) {
    const redirectTo = encodeURIComponent(pathname + (search || ""));
    return <Navigate to={`/login?next=${redirectTo}`} replace />;
  }
  // if (!isAdmin) {
  //   return <Navigate to="/" replace />;
  // }
  return children;
}
