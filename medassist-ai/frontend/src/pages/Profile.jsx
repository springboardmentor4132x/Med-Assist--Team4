import { useState } from "react";
import api, { errMsg } from "../api";
import { useAuth } from "../AuthContext";

const BLOOD = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function Profile() {
  const { user, setUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState({ type: "", text: "" });

  const startEdit = () => {
    setForm({
      full_name: user.full_name,
      age: user.age,
      gender: user.gender,
      contact: user.contact || "",
      address: user.address || "",
      blood_group: user.blood_group || "",
    });
    setMsg({ type: "", text: "" });
    setEditing(true);
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    const age = Number(form.age);
    if (form.full_name.trim().length < 2) return setMsg({ type: "error", text: "Name must be at least 2 characters" });
    if (!Number.isInteger(age) || age < 0 || age > 120) return setMsg({ type: "error", text: "Enter a valid age (0-120)" });
    try {
      const { data } = await api.put("/users/me", {
        full_name: form.full_name.trim(),
        age,
        gender: form.gender,
        contact: form.contact || null,
        address: form.address || null,
        blood_group: form.blood_group || null,
      });
      setUser(data);
      setEditing(false);
      setMsg({ type: "success", text: "Profile updated successfully" });
    } catch (err) {
      setMsg({ type: "error", text: errMsg(err) });
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>My Profile</h2>
        {msg.text && <div className={`alert ${msg.type}`}>{msg.text}</div>}
        {!editing ? (
          <>
            <dl>
              <dt>Full Name</dt><dd>{user.full_name}</dd>
              <dt>Email</dt><dd>{user.email}</dd>
              <dt>Age</dt><dd>{user.age}</dd>
              <dt>Gender</dt><dd style={{ textTransform: "capitalize" }}>{user.gender}</dd>
              <dt>Contact</dt><dd>{user.contact || "-"}</dd>
              <dt>Address</dt><dd>{user.address || "-"}</dd>
              <dt>Blood Group</dt><dd>{user.blood_group || "-"}</dd>
              <dt>Role</dt><dd><span className="badge">{user.role}</span></dd>
              <dt>Member since</dt><dd>{new Date(user.created_at).toLocaleDateString()}</dd>
            </dl>
            <div className="actions"><button onClick={startEdit}>Edit Profile</button></div>
          </>
        ) : (
          <form onSubmit={save}>
            <label>Full Name</label>
            <input value={form.full_name} onChange={set("full_name")} />
            <div className="row">
              <div><label>Age</label><input type="number" value={form.age} onChange={set("age")} /></div>
              <div>
                <label>Gender</label>
                <select value={form.gender} onChange={set("gender")}>
                  <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                </select>
              </div>
            </div>
            <label>Contact Number</label>
            <input value={form.contact} onChange={set("contact")} />
            <label>Address</label>
            <input value={form.address} onChange={set("address")} />
            <label>Blood Group</label>
            <select value={form.blood_group} onChange={set("blood_group")}>
              <option value="">Not specified</option>
              {BLOOD.map((b) => <option key={b}>{b}</option>)}
            </select>
            <p className="muted">Email cannot be changed.</p>
            <div className="actions">
              <button>Save Changes</button>
              <button type="button" className="secondary" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
