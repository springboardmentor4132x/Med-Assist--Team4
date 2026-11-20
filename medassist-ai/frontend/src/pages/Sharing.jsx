import { useEffect, useState } from "react";
import api, { errMsg } from "../api";

export default function Sharing() {
  const [list, setList] = useState([]);
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });

  const load = () => api.get("/access").then((r) => setList(r.data));
  useEffect(() => { load(); }, []);

  const grant = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/access", { grantee_email: email.trim() });
      setMsg({ type: "success", text: data.message });
      setEmail("");
      load();
    } catch (err) {
      setMsg({ type: "error", text: errMsg(err) });
    }
  };

  const revoke = async (id) => {
    await api.delete(`/access/${id}`);
    load();
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Share my records</h2>
        <p className="muted">Doctors/clinics you add can view (not edit) your profile and medical history.</p>
        {msg.text && <div className={`alert ${msg.type}`}>{msg.text}</div>}
        <form onSubmit={grant} className="row" style={{ gridTemplateColumns: "1fr auto" }}>
          <input type="email" required placeholder="Doctor / clinic email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button>Grant Access</button>
        </form>
      </div>
      <div className="card">
        <h3>Currently authorised</h3>
        {list.length === 0 ? <p className="muted">Nobody yet.</p> : (
          <table>
            <tbody>
              {list.map((u) => (
                <tr key={u.id}>
                  <td>{u.full_name} <span className="badge">{u.role}</span></td>
                  <td>{u.email}</td>
                  <td><button className="small danger" onClick={() => revoke(u.id)}>Revoke</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
