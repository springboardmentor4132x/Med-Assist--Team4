"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import { ALL_CATS, AccessGrant, CATS, MedicalRecord, RecordInput, STATUS, Category, Status, api, catNames, fmtDate } from "@/lib/medicalHistory";
import { Icon } from "@/components/Icon";
import { EmptyState, ErrorState, LoadingState, SummaryCard } from "@/components/ui";
import { MedicalHistoryCard, MedicalHistoryTimeline } from "@/components/MedicalHistoryCard";
import { MedicalHistoryForm } from "@/components/MedicalHistoryForm";
import { ConfirmationDialog, ViewDialog } from "@/components/ConfirmationDialog";
import { AccessPanel } from "@/components/AccessPanel";

const GATE: Record<string, [string, string]> = {
  none: ["Patient approval required", "The patient must approve before you can view or add records."],
  pending: ["Waiting for patient approval", "Request sent. The patient can approve it from their own view."],
  denied: ["Access was denied", "The patient declined your request."],
  revoked: ["Access was revoked", "The patient ended your access."],
};

export default function MedicalHistoryPage() {
  const { user } = useAuth();
  const role = user?.role, me = user?.id ?? 0;
  const [qPatient, setQPatient] = useState(1); // doctors/admins open /medical-history?patient=<id> (defaults to 1)
  useEffect(() => { const p = Number(new URLSearchParams(window.location.search).get("patient")); if (p) setQPatient(p); }, []);
  const patientId = user ? (role === "patient" ? user.id : qPatient) : 0;

  const [records, setRecords] = useState<MedicalRecord[] | null>(null);
  const [grant, setGrant] = useState<AccessGrant | null>(null);
  const [error, setError] = useState("");
  const [f, setF] = useState({ q: "", category: "", status: "" });
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<MedicalRecord | null>(null);
  const [viewing, setViewing] = useState<MedicalRecord | null>(null);
  const [deleting, setDeleting] = useState<MedicalRecord | null>(null);
  const [busy, setBusy] = useState(false);
  const [toasts, setToasts] = useState<{ id: number; msg: string }[]>([]);
  const toast = useCallback((msg: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg }]); setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  const load = useCallback(async () => {
    if (!user || !patientId) return;
    setError(""); setRecords(null); setGrant(null);
    try {
      if (user.role === "doctor") {
        const g = (await api.requests()).find((x) => x.patient_id === patientId) ?? null; // newest first
        setGrant(g);
        if (g?.status !== "approved") { setRecords([]); return; }
      }
      setRecords(await api.list(patientId));
    } catch (e) { setError((e as Error).message); }
  }, [user, patientId]);
  useEffect(() => { load(); }, [load]);

  const gated = role === "doctor" && grant?.status !== "approved";
  const canWrite = role === "patient" || (role === "doctor" && !gated);
  const canDelete = (r: MedicalRecord) => role === "patient" || (role === "doctor" && r.created_by === me && r.created_by_role === "doctor");
  const allowed: Category[] | null = role === "doctor" ? grant?.categories ?? null : null;

  const vis = records ?? [];
  const shown = useMemo(() => vis.filter((r) =>
    (!f.category || r.category === f.category) && (!f.status || r.status === f.status) &&
    (!f.q || `${r.name} ${r.provider ?? ""} ${r.notes ?? ""}`.toLowerCase().includes(f.q.toLowerCase()))
  ).sort((a, b) => b.onset_date.localeCompare(a.onset_date)), [vis, f]);
  const latest = [...vis].sort((a, b) => b.onset_date.localeCompare(a.onset_date))[0];

  async function save(v: RecordInput) {
    const s = editing ? await api.update(editing.id, v) : await api.create(patientId, v);
    setRecords((p) => (editing ? (p ?? []).map((r) => (r.id === s.id ? s : r)) : [s, ...(p ?? [])]));
    toast(editing ? "Changes saved" : "Record added"); setFormOpen(false);
  }
  async function confirmDelete() {
    if (!deleting) return;
    setBusy(true);
    try { await api.remove(deleting.id); setRecords((p) => (p ?? []).filter((r) => r.id !== deleting.id)); toast("Record deleted"); }
    catch (e) { toast((e as Error).message); }
    setBusy(false); setDeleting(null);
  }
  async function requestAccess() {
    try { await api.requestAccess(patientId); toast("Request sent. The patient must approve it."); await load(); }
    catch (e) { toast((e as Error).message); }
  }
  const openForm = (r: MedicalRecord | null) => { setViewing(null); setEditing(r); setFormOpen(true); };

  let body;
  if (error) body = <ErrorState message={error} onRetry={load} />;
  else if (records === null) body = <LoadingState />;
  else if (gated) {
    const [t, p] = GATE[grant?.status ?? "none"];
    const canAsk = !grant || grant.status === "denied" || grant.status === "revoked";
    body = (
      <div className="card state"><div className="state-icon"><Icon name="shield" /></div><h2>{t}</h2><p>{p}</p>
        {canAsk && <button className={`btn ${grant ? "" : "btn-primary"}`} onClick={requestAccess}>{grant ? "Request again" : "Request patient approval"}</button>}</div>
    );
  } else if (!shown.length) body = <EmptyState filtered={vis.length > 0} canAdd={canWrite} onAdd={() => openForm(null)} onClear={() => setF({ q: "", category: "", status: "" })} />;
  else body = <MedicalHistoryTimeline records={shown} render={(r) => (
    <MedicalHistoryCard r={r} canEdit={canWrite} canDelete={canDelete(r)} onView={() => setViewing(r)} onEdit={() => openForm(r)} onDelete={() => setDeleting(r)} />
  )} />;

  return (
    <>
      <div>
        <nav className="crumbs" aria-label="Breadcrumb"><span>Patient record</span><span aria-hidden="true">/</span><span aria-current="page">Medical history</span></nav>
        <div className="page-header">
          <div><h1>Medical history</h1><p>Conditions, procedures, allergies, and immunizations in one chronological record.</p></div>
          {role !== "admin" && <button className="btn btn-primary" onClick={() => openForm(null)} disabled={!canWrite}><Icon name="plus" />Add record</button>}
        </div>
      </div>

      <div className="summary">
        <SummaryCard icon="list" label="Total records" value={vis.length} />
        <SummaryCard icon="alert" label="Active conditions" value={vis.filter((r) => r.status === "active").length} />
        <SummaryCard icon="pulse" label="Chronic conditions" value={vis.filter((r) => r.category === "chronic").length} />
        <SummaryCard icon="cal" label="Latest entry" value={latest ? fmtDate(latest.onset_date) : "None"} />
      </div>

      {role === "patient" && <AccessPanel notify={toast} />}
      {role === "doctor" && !gated && <div className="note" role="status">Patient approved access to {catNames(grant?.categories ?? null)}. You can add and edit records, and delete the ones you added.</div>}

      <div className="toolbar" role="search">
        <div className="field search"><label className="sr" htmlFor="q">Search records</label>
          <input className="input" id="q" type="search" placeholder="Search by condition, provider, or notes" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} /></div>
        <div className="field"><label className="sr" htmlFor="fc">Filter by category</label>
          <select className="input" id="fc" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>
            <option value="">All categories</option>{ALL_CATS.map((k) => <option key={k} value={k}>{CATS[k][0]}</option>)}</select></div>
        <div className="field"><label className="sr" htmlFor="fs">Filter by status</label>
          <select className="input" id="fs" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>
            <option value="">All statuses</option>{(Object.keys(STATUS) as Status[]).map((k) => <option key={k} value={k}>{STATUS[k][0]}</option>)}</select></div>
      </div>

      <div>{body}</div>

      <MedicalHistoryForm open={formOpen} record={editing} allowed={allowed} onSubmit={save} onClose={() => setFormOpen(false)} />
      <ViewDialog record={viewing} onClose={() => setViewing(null)} onEdit={canWrite ? openForm : null} />
      <ConfirmationDialog open={!!deleting} busy={busy} onConfirm={confirmDelete} onCancel={() => setDeleting(null)}
        message={`“${deleting?.name ?? ""}” will be removed from the medical history. This can’t be undone.`} />
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => <div className="toast" key={t.id}><Icon name="check" /><span>{t.msg}</span></div>)}
      </div>
    </>
  );
}
