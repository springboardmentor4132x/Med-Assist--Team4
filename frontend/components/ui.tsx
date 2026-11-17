"use client";
import { ReactNode, useEffect, useRef } from "react";
import { Icon } from "./Icon";
import { Status, STATUS } from "@/lib/medicalHistory";

export function StatusBadge({ status }: { status: Status }) {
  const [label, cls, icon] = STATUS[status];
  return <span className={`badge ${cls}`}><Icon name={icon} />{label}</span>;
}
export function SummaryCard({ icon, label, value }: { icon: Parameters<typeof Icon>[0]["name"]; label: string; value: string | number }) {
  return <div className="card sum"><div className="sum-icon"><Icon name={icon} /></div><div><div className="sum-label">{label}</div><div className="sum-value">{value}</div></div></div>;
}
export function FormField({ id, label, required, error, hint, children }: { id: string; label: string; required?: boolean; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label} {required ? <><span className="req" aria-hidden="true">*</span><span className="sr">required</span></> : <span className="opt">(optional)</span>}</label>
      {children}
      {hint && <span className="hint">{hint}</span>}
      <span className="err" id={`${id}-err`} role="alert">{error}</span>
    </div>
  );
}
export function useDialog(open: boolean) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const d = ref.current; if (!d) return; if (open && !d.open) d.showModal(); else if (!open && d.open) d.close(); }, [open]);
  return ref;
}
export function DlgHead({ id, title, sub, onClose }: { id: string; title: string; sub?: string; onClose: () => void }) {
  return (
    <div className="dlg-head"><div><h2 id={id}>{title}</h2>{sub && <p className="hint">{sub}</p>}</div>
      <button className="btn btn-ghost btn-sm" type="button" onClick={onClose} aria-label="Close"><Icon name="x" /></button></div>
  );
}
export function EmptyState({ filtered, canAdd, onAdd, onClear }: { filtered: boolean; canAdd: boolean; onAdd: () => void; onClear: () => void }) {
  return (
    <div className="card state"><div className="state-icon"><Icon name="list" /></div>
      <h2>{filtered ? "No records match your filters" : "No medical history yet"}</h2>
      <p>{filtered ? "Try a different search term or clear the filters." : "Add your first condition, procedure, allergy, or immunization to start your timeline."}</p>
      {filtered ? <button className="btn" onClick={onClear}>Clear filters</button> : canAdd && <button className="btn btn-primary" onClick={onAdd}><Icon name="plus" />Add record</button>}
    </div>
  );
}
export const LoadingState = () => <div className="stack" aria-busy="true" aria-label="Loading records"><div className="skel" /><div className="skel" /><div className="skel" /></div>;
export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="card state" role="alert">
      <div className="state-icon" style={{ background: "var(--c-danger-soft)", color: "var(--c-danger)" }}><Icon name="alert" /></div>
      <h2>We couldn’t load your records</h2><p>{message}</p><button className="btn" onClick={onRetry}>Try again</button>
    </div>
  );
}
