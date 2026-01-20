import { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import { getUser } from "../auth/auth";

export default function Tools() {
  const user = getUser();
  const isAdmin = user?.role === "admin";

  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  // Admin create tool
  const [toolTag, setToolTag] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("General");
  const [area, setArea] = useState(user?.area || "Area-1");

  const fetchTools = async () => {
    setErrMsg("");
    setLoading(true);
    try {
      const res = await api.get("/api/tools");
      setTools(res.data);
    } catch (err) {
      setErrMsg(err?.response?.data?.message || "Failed to load tools");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTools();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusBadge = (status) => {
    const map = {
      available: "success",
      checked_out: "primary",
      missing: "danger",
      calibration: "warning",
      damaged: "dark",
    };
    return `badge bg-${map[status] || "secondary"}`;
  };

  const onCreateTool = async (e) => {
    e.preventDefault();
    setErrMsg("");
    try {
      await api.post("/api/tools", { toolTag, name, category, area });
      setToolTag("");
      setName("");
      setCategory("General");
      await fetchTools();
    } catch (err) {
      setErrMsg(err?.response?.data?.message || "Failed to create tool");
    }
  };

  const checkout = async (toolId) => {
    setErrMsg("");
    try {
      await api.patch(`/api/tools/${toolId}/checkout`, {
        holderType: "user",
        holder: user?.name || "Unknown",
        note: "Checked out from app",
      });
      await fetchTools();
    } catch (err) {
      setErrMsg(err?.response?.data?.message || "Checkout failed");
    }
  };

  const returnTool = async (toolId) => {
    setErrMsg("");
    try {
      await api.patch(`/api/tools/${toolId}/return`, { note: "Returned from app" });
      await fetchTools();
    } catch (err) {
      setErrMsg(err?.response?.data?.message || "Return failed");
    }
  };

  const toolsSorted = useMemo(() => {
    return [...tools].sort((a, b) => (a.toolTag > b.toolTag ? 1 : -1));
  }, [tools]);

  return (
    <div className="container py-4">
      <h2 className="mb-3">Tools</h2>

      {errMsg ? <div className="alert alert-danger">{errMsg}</div> : null}

      {isAdmin ? (
        <div className="card mb-4 shadow-sm">
          <div className="card-body">
            <h5 className="card-title mb-3">Add Tool (Admin)</h5>
            <form className="row g-2" onSubmit={onCreateTool}>
              <div className="col-md-2">
                <input
                  className="form-control"
                  value={toolTag}
                  onChange={(e) => setToolTag(e.target.value)}
                  placeholder="TT-001"
                  required
                />
              </div>
              <div className="col-md-4">
                <input
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tool name"
                  required
                />
              </div>
              <div className="col-md-2">
                <input
                  className="form-control"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Category"
                />
              </div>
              <div className="col-md-2">
                <input
                  className="form-control"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="Area-1"
                  required
                />
              </div>
              <div className="col-md-2 d-grid">
                <button className="btn btn-success">Create</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <div className="card shadow-sm">
        <div className="card-body">
          {loading ? (
            <div className="text-muted">Loading...</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Tag</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Area</th>
                    <th>Status</th>
                    <th>Holder</th>
                    <th style={{ width: 220 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {toolsSorted.map((t) => (
                    <tr key={t._id}>
                      <td className="fw-semibold">{t.toolTag}</td>
                      <td>{t.name}</td>
                      <td>{t.category}</td>
                      <td>{t.area}</td>
                      <td>
                        <span className={statusBadge(t.status)}>{t.status}</span>
                      </td>
                      <td className="text-muted">
                        {t.status === "checked_out" ? t.currentHolder : "-"}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => checkout(t._id)}
                            disabled={t.status !== "available"}
                          >
                            Check out
                          </button>
                          <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => returnTool(t._id)}
                            disabled={t.status !== "checked_out"}
                          >
                            Return
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {toolsSorted.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center text-muted py-4">
                        No tools yet. (Admin can add tools.)
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
