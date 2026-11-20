import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { errMsg } from "../api";

const initial = { full_name: "", email: "", password: "", confirm: "", age: "", gender: "", contact: "", role: "patient" };

function validate(f) {
  const e = {};
  if (f.full_name.trim().length < 2) e.full_name = "Enter your full name (min 2 characters)";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = "Enter a valid email address";
  if (f.password.length < 8 || !/[A-Za-z]/.test(f.password) || !/\d/.test(f.password))
    e.password = "Min 8 characters, with at least one letter and one number";
  if (f.password !== f.confirm) e.confirm = "Passwords do not match";
  const age = Number(f.age);
  if (f.age === "" || !Number.isInteger(age) || age < 0 || age > 120) e.age = "Enter a valid age (0-120)";
  if (!f.gender) e.gender = "Select a gender";
  if (f.contact && !/^\+?[0-9]{7,15}$/.test(f.contact.replace(/[\s-]/g, ""))) e.contact = "Enter a valid phone number";
  return e;
}

export default function Register() {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const Err = ({ k }) => (errors[k] ? <div className="error-text">{errors[k]}</div> : null);

  const submit = async (ev) => {
    ev.preventDefault();
    setServerError("");
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length) return;
    setBusy(true);
    try {
      await api.post("/auth/register", {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        password: form.password,
        age: Number(form.age),
        gender: form.gender,
        contact: form.contact || null,
        role: form.role,
      });
      navigate("/login", { state: { registered: true } });
    } catch (err) {
      setServerError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card auth-card">
      <h2>Create your account</h2>
      {serverError && <div className="alert error">{serverError}</div>}
      <form onSubmit={submit} noValidate>
        <label>Full Name</label>
        <input value={form.full_name} onChange={set("full_name")} /> <Err k="full_name" />
        <label>Email Address</label>
        <input type="email" value={form.email} onChange={set("email")} /> <Err k="email" />
        <div className="row">
          <div>
            <label>Password</label>
            <input type="password" value={form.password} onChange={set("password")} /> <Err k="password" />
          </div>
          <div>
            <label>Confirm Password</label>
            <input type="password" value={form.confirm} onChange={set("confirm")} /> <Err k="confirm" />
          </div>
        </div>
        <div className="row">
          <div>
            <label>Age</label>
            <input type="number" value={form.age} onChange={set("age")} /> <Err k="age" />
          </div>
          <div>
            <label>Gender</label>
            <select value={form.gender} onChange={set("gender")}>
              <option value="">Select...</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <Err k="gender" />
          </div>
        </div>
        <label>Contact Number (optional)</label>
        <input value={form.contact} onChange={set("contact")} placeholder="+919876543210" /> <Err k="contact" />
        <label>I am registering as</label>
        <select value={form.role} onChange={set("role")}>
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
          <option value="clinic">Clinic</option>
        </select>
        <div className="actions">
          <button disabled={busy}>{busy ? "Creating..." : "Register"}</button>
        </div>
      </form>
      <p className="muted">Already registered? <Link to="/login">Log in</Link></p>
    </div>
  );
}
