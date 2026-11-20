import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api, { errMsg } from "../api";

export default function PatientDetail() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get(`/users/${id}`), api.get(`/history/patient/${id}`)])
      .then(([p, h]) => { setPatient(p.data); setRecords(h.data); })
      .catch((e) => setError(errMsg(e)));
  }, [id]);

  if (error) return <div className="container"><div className="alert error">{error}</div></div>;
  if (!patient) return <p className="container">Loading...</p>;

  return (
    <div className="container">
      <Link to="/patients">&larr; Back to patients</Link>
      <div className="card" style={{ marginTop: 12 }}>
        <h2>{patient.full_name}</h2>
        <dl>
          <dt>Age</dt><dd>{patient.age}</dd>
          <dt>Gender</dt><dd style={{ textTransform: "capitalize" }}>{patient.gender}</dd>
          <dt>Contact</dt><dd>{patient.contact || "-"}</dd>
          <dt>Blood Group</dt><dd>{patient.blood_group || "-"}</dd>
        </dl>
      </div>
      <div className="card">
        <h3>Medical History (read-only)</h3>
        {records.length === 0 ? <p className="muted">No records.</p> : (
          <table>
            <thead><tr><th>Type</th><th>Title</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td style={{ textTransform: "capitalize" }}>{r.record_type}</td>
                  <td>{r.title}{r.description && <div className="muted">{r.description}</div>}</td>
                  <td>{r.diagnosed_on || "-"}</td><td><span className="badge">{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
