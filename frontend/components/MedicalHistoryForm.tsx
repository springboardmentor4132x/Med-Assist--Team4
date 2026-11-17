"use client";
import { FormEvent, useEffect, useState } from "react";
import { DlgHead, FormField, useDialog } from "./ui";
import { ALL_CATS, CATS, STATUS, Category, MedicalRecord, RecordInput, Status } from "@/lib/medicalHistory";

const empty: RecordInput = { name: "", category: "chronic", status: "active", onset_date: "", provider: "", notes: "" };
const today = () => new Date().toISOString().slice(0, 10);

export function MedicalHistoryForm({ open, record, allowed, onSubmit, onClose }:
  { open: boolean; record: MedicalRecord | null; allowed: Category[] | null; onSubmit: (v: RecordInput) => Promise<void>; onClose: () => void }) {
  const ref = useDialog(open);
  const cats = allowed ?? ALL_CATS;
  const [v, setV] = useState<RecordInput>(empty);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [serverErr, setServerErr] = useState("");

  useEffect(() => {
    if (!open) return;
    const base = record ? { ...record } : { ...empty, category: cats[0] };
    setV(base); setErrs({}); setServerErr(""); setBusy(false);
  }, [open, record]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = <K extends keyof RecordInput>(k: K, val: RecordInput[K]) => setV((p) => ({ ...p, [k]: val }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!v.name.trim()) er["f-name"] = "Enter the name of the condition or procedure.";
    if (!v.onset_date) er["f-date"] = "Choose the date it started or happened.";
    else if (v.onset_date > today()) er["f-date"] = "The date can’t be in the future.";
    setErrs(er);
    const first = Object.keys(er)[0];
    if (first) { ref.current?.querySelector<HTMLElement>("#" + first)?.focus(); return; }
    setBusy(true); setServerErr("");
    try { await onSubmit({ ...v, name: v.name.trim(), provider: v.provider?.trim() || null, notes: v.notes?.trim() || null }); }
    catch (x) { setServerErr((x as Error).message); setBusy(false); }
  }

  const bad = (id: string) => ({ "aria-invalid": errs[id] ? true : false, "aria-describedby": errs[id] ? `${id}-err` : undefined });
  return (
    <dialog ref={ref} aria-labelledby="formTitle" onClose={onClose}>
      <form className="dlg" onSubmit={submit} noValidate>
        <DlgHead id="formTitle" title={record ? "Edit record" : "Add record"} sub="Fields marked * are required." onClose={onClose} />
        <div className="dlg-body">
          <fieldset><legend>Condition</legend>
            <FormField id="f-name" label="Name" required error={errs["f-name"]}>
              <input className="input" id="f-name" maxLength={120} autoComplete="off" value={v.name} onChange={(e) => set("name", e.target.value)} {...bad("f-name")} />
            </FormField>
            <div className="grid2">
              <FormField id="f-cat" label="Category" required>
                <select className="input" id="f-cat" value={v.category} onChange={(e) => set("category", e.target.value as Category)}>
                  {cats.map((k) => <option key={k} value={k}>{CATS[k][0]}</option>)}
                </select>
              </FormField>
              <FormField id="f-status" label="Status" required>
                <select className="input" id="f-status" value={v.status} onChange={(e) => set("status", e.target.value as Status)}>
                  {(Object.keys(STATUS) as Status[]).map((k) => <option key={k} value={k}>{STATUS[k][0]}</option>)}
                </select>
              </FormField>
            </div>
          </fieldset>
          <fieldset><legend>Timeline and care</legend>
            <div className="grid2">
              <FormField id="f-date" label="Date" required error={errs["f-date"]}>
                <input className="input" id="f-date" type="date" max={today()} value={v.onset_date} onChange={(e) => set("onset_date", e.target.value)} {...bad("f-date")} />
              </FormField>
              <FormField id="f-prov" label="Provider">
                <input className="input" id="f-prov" maxLength={100} autoComplete="off" value={v.provider ?? ""} onChange={(e) => set("provider", e.target.value)} />
              </FormField>
            </div>
            <FormField id="f-notes" label="Notes" hint="Symptoms, treatment, or anything a future provider should know.">
              <textarea className="input" id="f-notes" maxLength={600} value={v.notes ?? ""} onChange={(e) => set("notes", e.target.value)} />
            </FormField>
          </fieldset>
          {serverErr && <p role="alert" className="err">{serverErr}</p>}
        </div>
        <div className="dlg-foot">
          <button className="btn" type="button" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? "Saving…" : record ? "Save changes" : "Add record"}</button>
        </div>
      </form>
    </dialog>
  );
}
