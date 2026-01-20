import { Link, useNavigate } from "react-router-dom";
import { clearAuth, getUser } from "../auth/auth";

export default function NavBar() {
  const nav = useNavigate();
  const user = getUser();

  const logout = () => {
    clearAuth();
    nav("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/tools">
          ToolTrack
        </Link>

        <div className="d-flex align-items-center gap-3">
          <div className="text-white small">
            {user ? (
              <>
                <div className="fw-semibold">{user.name}</div>
                <div className="text-white-50">
                  {user.role} • {user.area}
                </div>
              </>
            ) : null}
          </div>

          <Link className="btn btn-outline-light btn-sm" to="/tools">
            Tools
          </Link>
          <Link className="btn btn-outline-light btn-sm" to="/tickets">
            Tickets
          </Link>

          <button className="btn btn-warning btn-sm" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
