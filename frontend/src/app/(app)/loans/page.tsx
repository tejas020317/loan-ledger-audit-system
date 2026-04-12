"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Eye, Trash2, FileText, CheckCircle, Calculator } from "lucide-react";
import Link from "next/link";
import { loanApi, customerApi, Loan, Customer } from "@/lib/api";
import { toast } from "@/components/Toast";

const EMPTY = { customer_id: "", loan_amount: "", interest_rate: "", interest_type: "simple", calculation_type: "monthly", loan_start_date: "", duration_months: "" };

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([loanApi.getAll(), customerApi.getAll()])
      .then(([lr, cr]) => { setLoans(lr.data); setCustomers(cr.data); })
      .catch((e) => toast(e.message, "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await loanApi.create({
        customer_id: Number(form.customer_id),
        loan_amount: Number(form.loan_amount),
        interest_rate: Number(form.interest_rate),
        interest_type: form.interest_type as Loan["interest_type"],
        calculation_type: form.calculation_type as Loan["calculation_type"],
        loan_start_date: form.loan_start_date,
        duration_months: Number(form.duration_months),
      });
      toast("Loan created successfully");
      setShowModal(false);
      setForm(EMPTY);
      load();
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    try {
      await loanApi.delete(id);
      toast("Deleted successfully");
      load();
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed", "error");
    }
  };

  const filtered = loans.filter((l) =>
    [l.customer?.name, String(l.loan_id), String(l.loan_amount)].some((v) =>
      v?.toLowerCase().includes(search.toLowerCase())
    )
  );

  const fmt = (n: number) =>
    "₹ " + new Intl.NumberFormat("en-IN").format(Number(n));

  return (
    <div>
      <div className="page-header mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Loans</h1>
        </div>
        <div className="flex items-center gap-3">
          <input className="input" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 220 }} />
          <button className="btn btn-primary shadow-sm" onClick={() => setShowModal(true)}>➕ New Loan</button>
        </div>
      </div>

      <div className="card overflow-hidden outline-none !p-0">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Loan ID</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Customer</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Amount</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Rate</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Type</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Start Date</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Duration</th>
                <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "3rem" }}><div className="spinner" style={{ margin: "auto" }} /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="h-24 text-center text-muted-foreground">No loans found</td></tr>
              ) : filtered.map((l) => (
                <tr key={l.loan_id} className="transition-colors hover:bg-muted/30 border-b border-border last:border-0">
                  <td className="p-4 align-middle font-medium text-primary">#{l.loan_id}</td>
                  <td className="p-4 align-middle">{l.customer?.name ?? `Customer #${l.customer_id}`}</td>
                  <td className="p-4 align-middle font-medium text-foreground">{fmt(l.loan_amount)}</td>
                  <td className="p-4 align-middle">{l.interest_rate}%</td>
                  <td className="p-4 align-middle">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${l.interest_type === "simple" ? "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/30" : l.interest_type === "compound" ? "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/30" : "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/30"}`}>
                        {l.interest_type}
                      </span>
                  </td>
                  <td className="p-4 align-middle text-muted-foreground">{new Date(l.loan_start_date).toLocaleDateString("en-IN")}</td>
                  <td className="p-4 align-middle">{l.duration_months} mo</td>
                  <td className="p-4 align-middle text-center w-[180px]">
                    <div className="flex items-center justify-center gap-2">
                      <Link 
                        href={`/loans/${l.loan_id}`} 
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 bg-white/5 border border-white/10 hover:bg-white/10 text-white"
                      >
                        <Eye className="w-3.5 h-3.5"/> View
                      </Link>
                      <button 
                        className="inline-flex items-center justify-center w-7 h-7 rounded-md transition-all duration-200 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white"
                        onClick={() => handleDelete(l.loan_id)}
                        title="Delete Loan"
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
          <div className="bg-card w-full max-w-lg rounded-2xl shadow-lg border border-border p-6 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <h2 style={{ fontWeight: 700, marginBottom: "1.5rem", fontSize: "1.1rem" }}>Create New Loan</h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label className="label">Customer <span style={{ color: "var(--danger)" }}>*</span></label>
                <select className="input" required value={form.customer_id} onChange={(e) => set("customer_id", e.target.value)}>
                  <option value="">Select customer…</option>
                  {customers.map((c) => <option key={c.customer_id} value={c.customer_id}>{c.name} — {c.account_number}</option>)}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label className="label">Loan Amount (₹) *</label>
                  <input className="input" type="number" min="1" placeholder="500000" required value={form.loan_amount} onChange={(e) => set("loan_amount", e.target.value)} />
                </div>
                <div>
                  <label className="label">Interest Rate (%) *</label>
                  <input className="input" type="number" step="0.01" min="0" placeholder="12" required value={form.interest_rate} onChange={(e) => set("interest_rate", e.target.value)} />
                </div>
                <div>
                  <label className="label">Interest Type *</label>
                  <select className="input" value={form.interest_type} onChange={(e) => set("interest_type", e.target.value)}>
                    <option value="simple">Simple</option>
                    <option value="compound">Compound</option>
                    <option value="reducing">Reducing Balance</option>
                  </select>
                </div>
                <div>
                  <label className="label">Calculation Type</label>
                  <select className="input" value={form.calculation_type} onChange={(e) => set("calculation_type", e.target.value)}>
                    <option value="ANNUAL_MONTHLY_REDUCING">Annual (Monthly Reducing Balance)</option>
                    <option value="ANNUAL_DAILY_REDUCING">Annual (Daily Reducing Balance)</option>
                    <option value="SIMPLE">Simple Interest</option>
                    <option value="COMPOUND">Compound Interest</option>
                  </select>
                </div>
                <div>
                  <label className="label">Start Date *</label>
                  <input className="input" type="date" required value={form.loan_start_date} onChange={(e) => set("loan_start_date", e.target.value)} />
                </div>
                <div>
                  <label className="label">Duration (months) *</label>
                  <input className="input" type="number" min="1" placeholder="12" required value={form.duration_months} onChange={(e) => set("duration_months", e.target.value)} />
                </div>
              </div>
              <div style={{ display: "flex", gap: ".75rem", marginTop: ".5rem" }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                  {saving ? "Saving…" : "Create Loan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
