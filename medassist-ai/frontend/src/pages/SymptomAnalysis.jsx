import { useEffect, useState } from "react";
import api, { errMsg } from "../api";

export default function SymptomAnalysis() {
  const [options, setOptions] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get("/symptoms")
      .then((r) => setOptions(r.data))
      .catch((e) => setMsg({ type: "error", text: errMsg(e) }));
  }, []);

  const labelOf = (name) => options.find((o) => o.name === name)?.label || name;

  const toggle = (name) => {
    setMsg({ type: "", text: "" });
    setSelected((cur) => (cur.includes(name) ? cur.filter((s) => s !== name) : [...cur, name]));
  };

  const visible = options.filter((o) => o.label.toLowerCase().includes(search.trim().toLowerCase()));

  const submit = async () => {
    if (selected.length === 0) return setMsg({ type: "error", text: "Please select at least one symptom." });
    setSaving(true);
    try {
      const { data } = await api.post("/symptoms/assessments", { symptoms: selected });
      setMsg({ type: "success", text: data.message });
      setSelected([]);
    } catch (err) {
      setMsg({ type: "error", text: errMsg(err) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Symptom Analysis</h2>
        <p className="muted">
          Select the symptoms you are experiencing. This gives preliminary information only and is not a medical
          diagnosis. For serious symptoms such as chest pain or difficulty breathing, seek medical attention.
        </p>
        {msg.text && <div className={`alert ${msg.type}`}>{msg.text}</div>}

        <label>Search symptoms</label>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="e.g. head" />

        <div>
          {visible.length === 0 ? (
            <p className="muted">No matching symptoms.</p>
          ) : (
            visible.map((o) => (
              <button
                key={o.name}
                type="button"
                className={selected.includes(o.name) ? "small" : "small secondary"}
                style={{ margin: "4px" }}
                onClick={() => toggle(o.name)}
              >
                {o.label}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="card">
        <h2>Selected symptoms ({selected.length})</h2>
        {selected.length === 0 ? (
          <p className="muted">Nothing selected yet.</p>
        ) : (
          <div>
            {selected.map((s) => (
              <span key={s} className="badge" style={{ margin: "4px" }}>
                {labelOf(s)}{" "}
                <button type="button" className="small danger" onClick={() => toggle(s)} aria-label={`Remove ${labelOf(s)}`}>
                  x
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="actions">
          <button onClick={submit} disabled={saving}>{saving ? "Saving..." : "Submit symptoms"}</button>
          {selected.length > 0 && (
            <button type="button" className="secondary" onClick={() => setSelected([])}>Clear all</button>
          )}
        </div>
      </div>
    </div>
  );
}