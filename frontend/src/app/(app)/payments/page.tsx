"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Eye, Trash2, FileText, CheckCircle, Calculator } from "lucide-react";
import { loanApi, paymentApi, Loan, Payment } from "@/lib/api";
import { toast } from "@/components/Toast";

export default function PaymentsPage() {
  const [loanId, setLoanId] = useState("");
  const [loan, setLoan] = useState<Loan | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [allLoans, setAllLoans] = useState<Loan[]>([]);
  const [fetching, setFetching] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ loan_id: "", payment_amount: "", payment_date: new Date().toISOString().split("T")[0], remarks: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loanApi.getAll().then((r) => setAllLoans(r.data)).catch(() => {});
  }, []);

  const loadPayments = async (id?: string) => {
    const lid = id ?? loanId;
    if (!lid) return;
    setFetching(true);
    try {
      const r = await paymentApi.getByLoan(Number(lid));
      setLoan(r.data.loan);
      setPayments(r.data.payments);
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed", "error");
    } finally {
      setFetching(false);
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await paymentApi.create({
        loan_id: Number(form.loan_id),
        payment_amount: Number(form.payment_amount),
        payment_date: form.payment_date,
        remarks: form.remarks,
      });
      toast("Payment recorded");
      setShowModal(false);
      setForm({ loan_id: "", payment_amount: "", payment_date: new Date().toISOString().split("T")[0], remarks: "" });
      if (loanId) loadPayments();
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    try {
      await paymentApi.delete(id);
      toast("Deleted successfully");
      if (loanId) loadPayments();
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed", "error");
    }
  };

  const fmt = (n: number) => "₹ " + new Intl.NumberFormat("en-IN").format(Number(n));

  return (
    <div>
      <div className="page-header mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Loan Payments</h1>
        </div>
        <button className="btn btn-primary shadow-sm" onClick={() => setShowModal(true)}><Plus className="mr-2 w-4 h-4"/> Add Payment</button>
      </div>

      {/* Loan selector */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", gap: ".75rem", alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label className="label">Select Loan to view payment history</label>
            <select className="input" value={loanId} onChange={(e) => { setLoanId(e.target.value); if (e.target.value) loadPayments(e.target.value); }}>
              <option value="">Choose a loan…</option>
              {allLoans.map((l) => (
                <option key={l.loan_id} value={l.loan_id}>Loan #{l.loan_id} — {l.customer?.name ?? `Customer #${l.customer_id}`} ({fmt(l.loan_amount)})</option>
              ))}
            </select>
          </div>
          {loanId && (
            <button className="btn btn-secondary border-border shadow-sm text-foreground bg-secondary/50 hover:bg-secondary" onClick={() => loadPayments()} disabled={fetching}>
              {fetching ? "Loading…" : "🔄 Refresh"}
            </button>
          )}
        </div>
      </div>

      {loan && (
        <div style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <h2 className="p-4 align-middle font-medium text-foreground">Loan #{loan.loan_id} — {loan.customer?.name}</h2>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/30">{fmt(loan.loan_amount)}</span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30">{loan.interest_rate}% {loan.interest_type}</span>
        </div>
      )}

      <div className="card overflow-hidden outline-none !p-0">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">#</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Payment Date</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Amount</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Remarks</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Recorded On</th>
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {fetching ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "3rem" }}><div className="spinner" style={{ margin: "auto" }} /></td></tr>
              ) : !loanId ? (
                <tr><td colSpan={6} className="h-24 text-center text-muted-foreground">Select a loan above to view its payment history</td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan={6} className="h-24 text-center text-muted-foreground">No payments recorded for this loan yet</td></tr>
              ) : payments.map((p, i) => (
                <tr key={p.payment_id} className="transition-colors hover:bg-muted/30 border-b border-border last:border-0">
                  <td className="p-4 align-middle text-muted-foreground">{i + 1}</td>
                  <td className="p-4 align-middle font-medium">{new Date(p.payment_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                  <td style={{ fontWeight: 700, color: "#10b981" }}>{fmt(p.payment_amount)}</td>
                  <td className="p-4 align-middle text-muted-foreground">{p.remarks ?? "—"}</td>
                  <td className="p-4 align-middle text-sm text-muted-foreground">{new Date(p.created_at).toLocaleDateString("en-IN")}</td>
                  <td className="p-4 align-middle text-center w-[180px]">
                    <div className="flex justify-center">
                      <button 
                        className="inline-flex items-center justify-center w-7 h-7 rounded-md transition-all duration-200 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white"
                        onClick={() => handleDelete(p.payment_id)}
                        title="Delete Payment"
                      >
                        <Trash2 className="w-3.5 h-3.5"/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-all duration-100 flex items-center justify-center p-4 sm:p-6" onClick={() => setShowModal(false)}>
          <div className="bg-card w-full max-w-lg rounded-2xl shadow-lg border border-border p-6 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontWeight: 700, marginBottom: "1.5rem", fontSize: "1.1rem" }}>Record Payment</h2>
            <form onSubmit={handleAddPayment} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label className="label">Loan *</label>
                <select className="input" required value={form.loan_id} onChange={(e) => setForm((p) => ({ ...p, loan_id: e.target.value }))}>
                  <option value="">Select loan…</option>
                  {allLoans.map((l) => (
                    <option key={l.loan_id} value={l.loan_id}>Loan #{l.loan_id} — {l.customer?.name ?? `Customer #${l.customer_id}`}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Payment Amount (₹) *</label>
                <input className="input" type="number" min="1" step="0.01" placeholder="5000" required
                  value={form.payment_amount} onChange={(e) => setForm((p) => ({ ...p, payment_amount: e.target.value }))} />
              </div>
              <div>
                <label className="label">Payment Date *</label>
                <input className="input" type="date" required value={form.payment_date} onChange={(e) => setForm((p) => ({ ...p, payment_date: e.target.value }))} />
              </div>
              <div>
                <label className="label">Remarks</label>
                <input className="input" placeholder="EMI for March 2026" value={form.remarks} onChange={(e) => setForm((p) => ({ ...p, remarks: e.target.value }))} />
              </div>
              <div style={{ display: "flex", gap: ".75rem", marginTop: ".5rem" }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>{saving ? "Saving…" : "Record Payment"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
