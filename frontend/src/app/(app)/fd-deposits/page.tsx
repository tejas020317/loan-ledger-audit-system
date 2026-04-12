"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Eye, Trash2, FileText, CheckCircle, Calculator } from "lucide-react";
import { fdApi, FD, FdTransaction } from "@/lib/api";
import { toast } from "@/components/Toast";

export default function FdDepositsPage() {
  const [fdId, setFdId] = useState("");
  const [fd, setFd] = useState<FD | null>(null);
  const [transactions, setTransactions] = useState<FdTransaction[]>([]);
  const [allFds, setAllFds] = useState<FD[]>([]);
  const [fetching, setFetching] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ fd_id: "", deposit_amount: "", transaction_date: new Date().toISOString().split("T")[0] });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fdApi.getAll().then((r) => setAllFds(r.data.filter(fd => fd.deposit_type === "FLEXIBLE"))).catch(() => {});
  }, []);

  const loadTransactions = async (id?: string) => {
    const lid = id ?? fdId;
    if (!lid) return;
    setFetching(true);
    try {
      const r = await fdApi.getOne(Number(lid));
      setFd(r.data);
      setTransactions(r.data.transactions || []);
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed", "error");
    } finally {
      setFetching(false);
    }
  };

  const handleAddDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fdApi.addDeposit(
        Number(form.fd_id),
        form.transaction_date,
        Number(form.deposit_amount)
      );
      toast("FD Deposit recorded");
      setShowModal(false);
      setForm({ fd_id: "", deposit_amount: "", transaction_date: new Date().toISOString().split("T")[0] });
      if (fdId) loadTransactions();
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const fmt = (n: number) => "₹ " + new Intl.NumberFormat("en-IN").format(Number(n));

  return (
    <div>
      <div className="page-header mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">FD Deposits</h1>
        </div>
        <button className="btn btn-primary shadow-sm" onClick={() => setShowModal(true)}><Plus className="mr-2 w-4 h-4"/> Add Deposit</button>
      </div>

      {/* FD selector */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", gap: ".75rem", alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label className="label">Select Flexible FD to view deposit history</label>
            <select className="input" value={fdId} onChange={(e) => { setFdId(e.target.value); if (e.target.value) loadTransactions(e.target.value); }}>
              <option value="">Choose a Flexible FD…</option>
              {allFds.map((f) => (
                <option key={f.fd_id} value={f.fd_id}>FD #{f.fd_id} — {f.customer?.name ?? `Customer #${f.customer_id}`} ({fmt(f.deposit_amount)})</option>
              ))}
            </select>
          </div>
          {fdId && (
            <button className="btn btn-secondary border-border shadow-sm text-foreground bg-secondary/50 hover:bg-secondary" onClick={() => loadTransactions()} disabled={fetching}>
              {fetching ? "Loading…" : "🔄 Refresh"}
            </button>
          )}
        </div>
      </div>

      {fd && (
        <div style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <h2 className="p-4 align-middle font-medium text-foreground">FD #{fd.fd_id} — {fd.customer?.name}</h2>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/30">{fmt(fd.deposit_amount)}</span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30">{fd.deposit_type}</span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30">{fd.interest_rate}%</span>
        </div>
      )}

      <div className="card overflow-hidden outline-none !p-0">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">#</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Deposit Date</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Deposit Amount</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Interest Earned</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Balance</th>
              </tr>
            </thead>
            <tbody>
              {fetching ? (
                <tr><td colSpan={5} style={{ textAlign: "center", padding: "3rem" }}><div className="spinner" style={{ margin: "auto" }} /></td></tr>
              ) : !fdId ? (
                <tr><td colSpan={5} className="h-24 text-center text-muted-foreground">Select an FD above to view its deposit history</td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan={5} className="h-24 text-center text-muted-foreground">No transactions recorded for this FD yet</td></tr>
              ) : transactions.map((t, i) => (
                <tr key={t.id || i} className="transition-colors hover:bg-muted/30 border-b border-border last:border-0">
                  <td className="p-4 align-middle text-muted-foreground">{i + 1}</td>
                  <td className="p-4 align-middle font-medium">{new Date(t.transaction_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                  <td style={{ fontWeight: 700, color: "#10b981" }}>{fmt(t.deposit_amount)}</td>
                  <td className="p-4 align-middle text-muted-foreground">{t.interest_added ? fmt(t.interest_added) : "—"}</td>
                  <td className="p-4 align-middle font-medium text-foreground">{fmt(t.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-all duration-100 flex items-center justify-center p-4 sm:p-6" onClick={() => setShowModal(false)}>
          <div className="bg-card w-full max-w-lg rounded-2xl shadow-lg border border-border p-6 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontWeight: 700, marginBottom: "1.5rem", fontSize: "1.1rem" }}>Record FD Deposit</h2>
            <form onSubmit={handleAddDeposit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label className="label">Fixed Deposit *</label>
                <select className="input" required value={form.fd_id} onChange={(e) => setForm((p) => ({ ...p, fd_id: e.target.value }))}>
                  <option value="">Select Flexible FD…</option>
                  {allFds.map((f) => (
                    <option key={f.fd_id} value={f.fd_id}>FD #{f.fd_id} — {f.customer?.name ?? `Customer #${f.customer_id}`}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Deposit Amount (₹) *</label>
                <input className="input" type="number" min="1" step="0.01" placeholder="5000" required
                  value={form.deposit_amount} onChange={(e) => setForm((p) => ({ ...p, deposit_amount: e.target.value }))} />
              </div>
              <div>
                <label className="label">Deposit Date *</label>
                <input className="input" type="date" required value={form.transaction_date} onChange={(e) => setForm((p) => ({ ...p, transaction_date: e.target.value }))} />
              </div>
              <div style={{ display: "flex", gap: ".75rem", marginTop: ".5rem" }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>{saving ? "Saving…" : "Record Deposit"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}