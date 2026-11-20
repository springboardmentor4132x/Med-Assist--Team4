import { useEffect, useState } from "react";
import api, { errMsg } from "../api";

const EMPTY = { record_type: "condition", title: "", description: "", diagnosed_on: "", status: "active" };

export default function MedicalHistory() {
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const load = () => api.get("/history").then((r) => setRecords(r.data)).catch((e) => setMsg({ type: "error", text: errMsg(e) }));
  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.title.trim().length < 2) return setMsg({ type: "error", text: "Please enter a title" });
    const payload = { ...form, title: form.title.trim(), description: form.description || null, diagnosed_on: form.diagnosed_on || null };
    try {
      if (editId) await api.put(`/history/${editId}`, payload);
      else await api.post("/history", payload);
      setForm(EMPTY);
      setEditId(null);
      setMsg({ type: "success", text: editId ? "Record updated" : "Record added" });
      load();
    } catch (err) {
      setMsg({ type: "error", text: errMsg(err) });
    }
  };

  const edit = (r) => {
    setEditId(r.id);
    setForm({ record_type: r.record_type, title: r.title, description: r.description || "", diagnosed_on: r.diagnosed_on || "", status: r.status });
    window.scrollTo(0, 0);
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    try { await api.delete(`/history/${id}`); load(); } catch (err) { setMsg({ type: "error", text: errMsg(err) }); }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>{editId ? "Edit Record" : "Add Medical Record"}</h2>
        {msg.text && <div className={`alert ${msg.type}`}>{msg.text}</div>}
        <form onSubmit={submit}>
          <div className="row">
            <div>
              <label>Type</label>
              <select value={form.record_type} onChange={set("record_type")}>
                {["condition", "allergy", "medication", "surgery", "other"].map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label>Status</label>
              <select value={form.status} onChange={set("status")}>
                {["active", "chronic", "resolved"].map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <label>Title</label>
          <input value={form.title} onChange={set("title")} placeholder="e.g. Type 2 Diabetes, Penicillin allergy" />
          <label>Diagnosed / Started On</label>
          <input type="date" value={form.diagnosed_on} onChange={set("diagnosed_on")} />
          <label>Notes</label>
          <textarea rows={3} value={form.description} onChange={set("description")} />
          <div className="actions">
            <button>{editId ? "Update" : "Add Record"}</button>
            {editId && <button type="button" className="secondary" onClick={() => { setEditId(null); setForm(EMPTY); }}>Cancel</button>}
          </div>
        </form>
      </div>

      <div className="card">
        <h2>My Medical History</h2>
        {records.length === 0 ? <p className="muted">No records yet.</p> : (
          <table>
            <thead><tr><th>Type</th><th>Title</th><th>Date</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td style={{ textTransform: "capitalize" }}>{r.record_type}</td>
                  <td>{r.title}{r.description && <div className="muted">{r.description}</div>}</td>
                  <td>{r.diagnosed_on || "-"}</td>
                  <td><span className="badge">{r.status}</span></td>
                  <td>
                    <button className="small secondary" onClick={() => edit(r)}>Edit</button>{" "}
                    <button className="small danger" onClick={() => remove(r.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
