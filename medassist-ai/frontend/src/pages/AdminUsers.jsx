import { useEffect, useState } from "react";
import api, { errMsg } from "../api";
import { useAuth } from "../AuthContext";

export default function AdminUsers() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState("");
  const [grant, setGrant] = useState({ patient_id: "", grantee_id: "" });
  const [msg, setMsg] = useState({ type: "", text: "" });

  const load = () => {
    api.get("/admin/users", { params: { search: search || undefined } }).then((r) => setUsers(r.data));
    api.get("/admin/stats").then((r) => setStats(r.data));
  };
  useEffect(() => { load(); }, []); // eslint-disable-line

  const act = async (fn, okText) => {
    try { await fn(); setMsg({ type: "success", text: okText }); load(); }
    catch (err) { setMsg({ type: "error", text: errMsg(err) }); }
  };

  return (
    <div className="container">
      {stats && (
        <div className="grid" style={{ marginBottom: 20 }}>
          <div className="stat"><b>{stats.total_users}</b>Total users</div>
          <div className="stat"><b>{stats.active_users}</b>Active users</div>
          <div className="stat"><b>{stats.by_role.patient || 0}</b>Patients</div>
          <div className="stat"><b>{(stats.by_role.doctor || 0) + (stats.by_role.clinic || 0)}</b>Doctors / clinics</div>
          <div className="stat"><b>{stats.medical_records}</b>Medical records</div>
        </div>
      )}
      <div className="card">
        <h2>User Management</h2>
        {msg.text && <div className={`alert ${msg.type}`}>{msg.text}</div>}
        <form onSubmit={(e) => { e.preventDefault(); load(); }} className="row" style={{ gridTemplateColumns: "1fr auto" }}>
          <input placeholder="Search by name or email" value={search} onChange={(e) => setSearch(e.target.value)} />
          <button>Search</button>
        </form>
        <table style={{ marginTop: 16 }}>
          <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td><td>{u.full_name}</td><td>{u.email}</td>
                <td>
                  <select
                    value={u.role}
                    disabled={u.id === me.id}
                    onChange={(e) => act(() => api.patch(`/admin/users/${u.id}/role`, { role: e.target.value }), "Role updated")}
                  >
                    {["patient", "doctor", "clinic", "admin"].map((r) => <option key={r}>{r}</option>)}
                  </select>
                </td>
                <td>{u.is_active ? "Active" : "Deactivated"}</td>
                <td>
                  {u.id !== me.id && (
                    <button
                      className={`small ${u.is_active ? "danger" : ""}`}
                      onClick={() => act(() => api.patch(`/admin/users/${u.id}/status`, { is_active: !u.is_active }), "Status updated")}
                    >
                      {u.is_active ? "Deactivate" : "Activate"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card">
        <h3>Link a doctor/clinic to a patient</h3>
        <form
          className="row"
          style={{ gridTemplateColumns: "1fr 1fr auto" }}
          onSubmit={(e) => {
            e.preventDefault();
            act(() => api.post("/admin/access", { patient_id: Number(grant.patient_id), grantee_id: Number(grant.grantee_id) }), "Access granted");
          }}
        >
          <input type="number" required placeholder="Patient user ID" value={grant.patient_id} onChange={(e) => setGrant({ ...grant, patient_id: e.target.value })} />
          <input type="number" required placeholder="Doctor/clinic user ID" value={grant.grantee_id} onChange={(e) => setGrant({ ...grant, grantee_id: e.target.value })} />
          <button>Grant</button>
        </form>
      </div>
    </div>
  );
}
