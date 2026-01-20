import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { saveAuth } from "../auth/auth";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("admin@test.com");
  const [password, setPassword] = useState("Password123!");
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrMsg("");
    setLoading(true);
    try {
      const res = await api.post("/api/auth/login", { email, password });
      saveAuth(res.data);
      nav("/tools");
    } catch (err) {
      setErrMsg(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 520 }}>
      <div className="mt-5 card shadow-sm">
        <div className="card-body p-4">
          <h3 className="mb-1">ToolTrack</h3>
          <p className="text-muted mb-4">Login</p>

          {errMsg ? <div className="alert alert-danger">{errMsg}</div> : null}

          <form onSubmit={onSubmit} className="d-grid gap-3">
            <div>
              <label className="form-label">Email</label>
              <input
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="form-label">Password</label>
              <input
                className="form-control"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
                autoComplete="current-password"
              />
            </div>

            <button className="btn btn-primary" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>

            <div className="small text-muted">
              Tip: use your admin user you created in Postman.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
