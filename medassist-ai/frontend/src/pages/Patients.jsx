import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  useEffect(() => { api.get("/access/patients").then((r) => setPatients(r.data)); }, []);

  return (
    <div className="container">
      <div className="card">
        <h2>My Patients</h2>
        {patients.length === 0 ? (
          <p className="muted">No patient has authorised you yet. Patients can grant access from their "Sharing" page using your email.</p>
        ) : (
          <table>
            <thead><tr><th>Name</th><th>Age</th><th>Gender</th><th></th></tr></thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.id}>
                  <td>{p.full_name}</td><td>{p.age}</td><td style={{ textTransform: "capitalize" }}>{p.gender}</td>
                  <td><Link to={`/patients/${p.id}`}>View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
