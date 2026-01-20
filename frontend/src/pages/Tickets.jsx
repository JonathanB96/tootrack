import { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import { getUser } from "../auth/auth";

export default function Tickets() {
  const user = getUser();
  const isAdmin = user?.role === "admin";

  const [tools, setTools] = useState([]);
  const [tickets, setTickets] = useState([]);

  const [toolId, setToolId] = useState("");
  const [issueType, setIssueType] = useState("missing");
  const [notes, setNotes] = useState("");

  // Search + filters
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [issueFilter, setIssueFilter] = useState("all");

  const [errMsg, setErrMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setErrMsg("");
    setLoading(true);
    try {
      const [toolsRes, ticketsRes] = await Promise.all([
        api.get("/api/tools"),
        api.get("/api/tickets"),
      ]);
      setTools(toolsRes.data);
      setTickets(ticketsRes.data);
    } catch (err) {
      setErrMsg(err?.response?.data?.message || "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCreateTicket = async (e) => {
    e.preventDefault();
    setErrMsg("");
    try {
      await api.post("/api/tickets", { toolId, issueType, notes });
      setNotes("");
      setIssueType("missing");
      setToolId("");
      await fetchAll();
    } catch (err) {
      setErrMsg(err?.response?.data?.message || "Failed to create ticket");
    }
  };

  const onUpdateTicket = async (ticketId, status) => {
    setErrMsg("");
    try {
      await api.patch(`/api/tickets/${ticketId}`, { status });
      await fetchAll();
    } catch (err) {
      setErrMsg(err?.response?.data?.message || "Failed to update ticket");
    }
  };

  const filteredTickets = useMemo(() => {
    const query = (q || "").trim().toLowerCase();

    const filtered = tickets.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (issueFilter !== "all" && t.issueType !== issueFilter) return false;

      if (!query) return true;

      const hay = [
        t.tool?.toolTag,
        t.tool?.name,
        t.tool?.area,
        t.issueType,
        t.status,
        t.createdBy?.name,
        t.createdBy?.email,
        t.notes,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return hay.includes(query);
    });

    return filtered.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  }, [tickets, q, statusFilter, issueFilter]);

  return (
    <div className="container py-4">
      <h2 className="mb-3">Tickets</h2>

      {errMsg ? <div className="alert alert-danger">{errMsg}</div> : null}

      {/* Create Ticket */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <h5 className="card-title mb-3">Create Ticket</h5>

          <form className="row g-2" onSubmit={onCreateTicket}>
            <div className="col-md-4">
              <select
                className="form-select"
                value={toolId}
                onChange={(e) => setToolId(e.target.value)}
                required
              >
                <option value="">Select Tool...</option>
                {tools.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.toolTag} — {t.name} ({t.area})
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <select
                className="form-select"
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
              >
                <option value="missing">Missing</option>
                <option value="replace">Replacement</option>
                <option value="calibration">Calibration</option>
                <option value="damaged">Damaged</option>
              </select>
            </div>

            <div className="col-md-3">
              <input
                className="form-control"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes (optional)"
              />
            </div>

            <div className="col-md-2 d-grid">
              <button className="btn btn-primary">Submit</button>
            </div>
          </form>

          <div className="small text-muted mt-2">
            {isAdmin
              ? "Admin sees all tickets."
              : "You’ll only see tickets you created (until we add leader visibility)."}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-3 shadow-sm">
        <div className="card-body">
          <div className="row g-2 align-items-center">
            <div className="col-md-6">
              <input
                className="form-control"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search tickets (tool tag/name, created by, notes)..."
              />
            </div>

            <div className="col-md-3">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All statuses</option>
                <option value="open">open</option>
                <option value="in_progress">in_progress</option>
                <option value="resolved">resolved</option>
              </select>
            </div>

            <div className="col-md-3">
              <select
                className="form-select"
                value={issueFilter}
                onChange={(e) => setIssueFilter(e.target.value)}
              >
                <option value="all">All issues</option>
                <option value="missing">missing</option>
                <option value="replace">replace</option>
                <option value="calibration">calibration</option>
                <option value="damaged">damaged</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div className="text-muted small">
              Showing <span className="fw-semibold">{filteredTickets.length}</span> ticket(s)
            </div>
            <button className="btn btn-outline-secondary btn-sm" onClick={fetchAll}>
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="text-muted">Loading...</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Tool</th>
                    <th>Issue</th>
                    <th>Status</th>
                    <th>Created By</th>
                    <th>Notes</th>
                    <th style={{ width: 220 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map((t) => (
                    <tr key={t._id}>
                      <td className="fw-semibold">
                        {t.tool?.toolTag} — {t.tool?.name}
                      </td>
                      <td>{t.issueType}</td>
                      <td>
                        <span className="badge bg-secondary">{t.status}</span>
                      </td>
                      <td className="text-muted">{t.createdBy?.name || "-"}</td>
                      <td className="text-muted">{t.notes || "-"}</td>
                      <td>
                        {isAdmin ? (
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => onUpdateTicket(t._id, "in_progress")}
                              disabled={t.status === "in_progress" || t.status === "resolved"}
                            >
                              In progress
                            </button>
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => onUpdateTicket(t._id, "resolved")}
                              disabled={t.status === "resolved"}
                            >
                              Resolve
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
                      </td>
                    </tr>
                  ))}

                  {filteredTickets.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center text-muted py-4">
                        No tickets match your filters.
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
