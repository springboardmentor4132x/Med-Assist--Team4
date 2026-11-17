"use client";
import { useEffect, useState } from "react";
import { ALL_CATS, AccessGrant, CATS, Category, api, catNames } from "@/lib/medicalHistory";

// Patient side: approve (all or selected record types), deny, or revoke a doctor's access.
export function AccessPanel({ notify }: { notify: (m: string) => void }) {
  const [grants, setGrants] = useState<AccessGrant[]>([]);
  const [picked, setPicked] = useState<Record<number, Category[]>>({});
  useEffect(() => { api.requests().then(setGrants).catch(() => {}); }, []);

  const sel = (id: number) => picked[id] ?? ALL_CATS;
  const toggle = (id: number, c: Category) => setPicked((p) => ({ ...p, [id]: sel(id).includes(c) ? sel(id).filter((x) => x !== c) : [...sel(id), c] }));
  async function act(g: AccessGrant, action: "approve" | "deny" | "revoke") {
    try {
      const u = await api.decide(g.id, action, action === "approve" && sel(g.id).length < ALL_CATS.length ? sel(g.id) : null);
      setGrants((p) => p.map((x) => (x.id === u.id ? u : x)));
      notify({ approve: "Access approved", deny: "Request denied", revoke: "Access revoked" }[action]);
    } catch (e) { notify((e as Error).message); }
  }

  const pending = grants.filter((g) => g.status === "pending"), active = grants.filter((g) => g.status === "approved");
  if (!pending.length && !active.length) return null;
  const who = (g: AccessGrant) => g.doctor_name ?? `Doctor #${g.doctor_id}`;
  return (
    <section className="card panel" aria-labelledby="acc">
      <h2 id="acc">Doctor access</h2>
      {pending.map((g) => (
        <div className="req-box" key={g.id}>
          <p><strong>{who(g)}</strong> wants to add and edit records.</p>
          <fieldset><legend className="hint">Allow these record types:</legend>
            <div className="checks">{ALL_CATS.map((c) => (
              <label key={c}><input type="checkbox" checked={sel(g.id).includes(c)} onChange={() => toggle(g.id, c)} />{CATS[c][0]}</label>
            ))}</div>
          </fieldset>
          <div className="row" style={{ justifyContent: "flex-start" }}>
            <button className="btn btn-primary btn-sm" onClick={() => act(g, "approve")} disabled={!sel(g.id).length}>Approve</button>
            <button className="btn btn-sm" onClick={() => act(g, "deny")}>Deny</button>
          </div>
        </div>
      ))}
      {active.map((g) => (
        <div className="row" key={g.id}>
          <span><strong>{who(g)}</strong> has access to {catNames(g.categories)}</span>
          <button className="btn btn-sm" onClick={() => act(g, "revoke")}>Revoke access</button>
        </div>
      ))}
    </section>
  );
}
