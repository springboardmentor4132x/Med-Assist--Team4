"use client";
import { ReactNode } from "react";
import { Icon, IconName } from "./Icon";
import { Role, useAuth } from "@/lib/auth";

const NAV: [string, IconName, boolean?][] = [["Overview", "home"], ["Medical history", "doc", true], ["Appointments", "cal"], ["Medications", "pill"]];

// Placeholder shell: remove Sidebar/Topbar if the main app already provides them.
export function AppShell({ children }: { children: ReactNode }) {
  const { user, switchRole } = useAuth();
  const initials = user?.name.split(" ").filter((w) => !w.endsWith(".")).map((w) => w[0]).join("").slice(0, 2) ?? "";
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark" aria-hidden="true"><Icon name="plus" /></div><span>CareLedger</span></div>
        <nav className="nav" aria-label="Main">
          {NAV.map(([label, icon, current]) => (
            <a key={label} href="#" aria-current={current ? "page" : undefined}><Icon name={icon} /><span>{label}</span></a>
          ))}
        </nav>
      </aside>
      <div className="main">
        <header className="topbar">
          <div className="field" style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <label htmlFor="role" className="hint">Viewing as</label>
            <select className="input" id="role" style={{ width: "auto" }} value={user?.role ?? "patient"} onChange={(e) => switchRole(e.target.value as Role)}>
              <option value="patient">Patient (Priya Nair)</option>
              <option value="doctor">Doctor (Dr. Arjun Shetty)</option>
              <option value="admin">Admin (read-only)</option>
            </select>
          </div>
          <div className="who"><span>{user?.name}</span><div className="avatar" aria-hidden="true">{initials}</div></div>
        </header>
        <main className="container"><div className="stack">{children}</div></main>
      </div>
    </div>
  );
}
