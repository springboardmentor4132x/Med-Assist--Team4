import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { errMsg } from "../api";

export default function MedicalContextCard({ onContextLoaded }) {
  const [context, setContext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/history/context")
      .then((res) => {
        setContext(res.data);
        if (onContextLoaded) onContextLoaded(res.data);
      })
      .catch((err) => setError(errMsg(err)))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  if (loading) {
    return (
      <div className="card" style={{ padding: 16 }}>
        <p className="muted">Loading your clinical history context...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card alert error" style={{ margin: "12px 0" }}>
        <p>Could not load medical history: {error}</p>
      </div>
    );
  }

  if (!context) return null;

  return (
    <div className="card" style={{ borderLeft: "4px solid #0284c7", marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0 }}>Relevant Medical Context</h3>
        <Link to="/history" style={{ fontSize: "0.85rem", textDecoration: "underline" }}>
          Edit History &rarr;
        </Link>
      </div>
      <p className="muted" style={{ margin: "6px 0 14px 0", fontSize: "0.9rem" }}>
        This background information will be factored into your symptom analysis:
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        <span className="badge">Age: {context.age}</span>
        <span className="badge" style={{ textTransform: "capitalize" }}>Gender: {context.gender}</span>
        {context.blood_group && <span className="badge">Blood Group: {context.blood_group}</span>}
        {context.has_respiratory_history && (
          <span className="badge" style={{ backgroundColor: "#fef3c7", color: "#92400e" }}>
            Respiratory Risk
          </span>
        )}
        {context.has_cardiovascular_history && (
          <span className="badge" style={{ backgroundColor: "#fee2e2", color: "#991b1b" }}>
            Cardiovascular Risk
          </span>
        )}
        {context.has_diabetic_history && (
          <span className="badge" style={{ backgroundColor: "#e0e7ff", color: "#3730a3" }}>
            Diabetic History
          </span>
        )}
      </div>

      <dl style={{ margin: 0, fontSize: "0.9rem" }}>
        <dt style={{ fontWeight: 600, color: "#475569" }}>Chronic / Pre-existing Conditions:</dt>
        <dd style={{ margin: "2px 0 8px 0" }}>
          {context.chronic_conditions && context.chronic_conditions.length > 0 ? (
            context.chronic_conditions.map((c) => (
              <span key={c} className="badge" style={{ marginRight: 6 }}>
                {c}
              </span>
            ))
          ) : (
            <span className="muted">None recorded</span>
          )}
        </dd>

        <dt style={{ fontWeight: 600, color: "#475569" }}>Known Allergies:</dt>
        <dd style={{ margin: "2px 0 8px 0" }}>
          {context.known_allergies && context.known_allergies.length > 0 ? (
            context.known_allergies.map((a) => (
              <span key={a} className="badge" style={{ backgroundColor: "#fee2e2", color: "#b91c1c", marginRight: 6 }}>
                {a}
              </span>
            ))
          ) : (
            <span className="muted">None recorded</span>
          )}
        </dd>

        <dt style={{ fontWeight: 600, color: "#475569" }}>Ongoing Medications:</dt>
        <dd style={{ margin: "2px 0 0 0" }}>
          {context.current_medications && context.current_medications.length > 0 ? (
            context.current_medications.join(", ")
          ) : (
            <span className="muted">None recorded</span>
          )}
        </dd>
      </dl>
    </div>
  );
}
