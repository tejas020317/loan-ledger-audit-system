"use client";

import { useEffect, useState, use } from "react";
import { fdApi, FD } from "@/lib/api";
import { toast } from "react-hot-toast";
import { ArrowLeft, Plus, Eye, Search, Trash2, FileText, CheckCircle, Calculator } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function FdLedgerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const fdId = parseInt(id, 10);
  const [fd, setFd] = useState<FD | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [amount, setAmount] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchFd();
  }, [fdId]);

  const fetchFd = async () => {
    try {
      setLoading(true);
      const res = await fdApi.getOne(fdId);
      if (res.success) {
        setFd(res.data);
      } else {
        toast.error("Failed to load FD details.");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch FD details.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    try {
      setAdding(true);
      const res = await fdApi.addDeposit(fdId, date, parseFloat(amount));
      if (res.success) {
        toast.success("Deposit added successfully!");
        setIsAddModalOpen(false);
        setAmount("");
        fetchFd();
      } else {
        toast.error("Failed to add deposit");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to add deposit");
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading FD Details...</div>;
  }

  if (!fd) {
    return <div className="p-8">FD Not Found</div>;
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/fd" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-bold">Fixed Deposit Details</h1>
        </div>
        {fd.deposit_type === "FLEXIBLE" && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Deposit</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-500">Customer</p>
          <p className="font-semibold text-lg">{fd.customer?.name}</p>
          <p className="text-sm text-gray-600">A/C: {fd.customer?.account_number}</p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-500">Deposit Info</p>
          <p className="font-semibold text-lg">Type: {fd.deposit_type}</p>
          <p className="text-sm text-gray-600">
            Rate: {fd.interest_rate}% ({fd.interest_type})
          </p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-500">Maturity Info</p>
          <p className="font-semibold text-lg">Amount: ₹{(fd.maturity_amount || 0).toFixed(2)}</p>
          <p className="text-sm text-green-600">Interest: +₹{(fd.interest_earned || 0).toFixed(2)}</p>
          <p className="text-sm text-gray-500">Date: {fd.maturity_date}</p>
        </div>
      </div>

      <div className="rounded-xl border bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
        <div className="border-b p-4 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <h2 className="font-semibold">Transaction Ledger</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50/50 dark:border-gray-800 dark:bg-gray-800/20">
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-right">Deposit</th>
                <th className="px-4 py-3 text-right">Interest Earned</th>
                <th className="px-4 py-3 text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {fd.transactions && fd.transactions.length > 0 ? (
                fd.transactions.map((tx) => (
                  <tr key={tx.id} className="border-b last:border-0 dark:border-gray-800">
                    <td className="px-4 py-3">{new Date(tx.transaction_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">₹{parseFloat(tx.deposit_amount.toString()).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-green-600">
                      {tx.interest_added ? `+₹${parseFloat(tx.interest_added.toString()).toFixed(2)}` : "-"}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">₹{parseFloat(tx.balance.toString()).toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Deposit Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-gray-900 border dark:border-gray-800"
            >
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Add Deposit to Flexible FD</h2>
                <form onSubmit={handleAddDeposit} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Date</label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Amount (₹)</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="e.g., 5000"
                      className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
                    />
                  </div>
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="rounded-lg px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                      disabled={adding}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={adding}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {adding ? "Adding..." : "Add Deposit"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
