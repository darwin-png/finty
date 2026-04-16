"use client";

import { useEffect, useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Toast from "@/components/Toast";
import { categoryLabels, formatCLP, formatDate } from "@/lib/categories";

interface PaymentExpense {
  id: string;
  date: string;
  category: string;
  description: string | null;
  amount: number;
  tipoDocumento: string | null;
  proveedor: string | null;
  numeroDocumento: string | null;
  user: { name: string; username: string };
}

interface Payment {
  ref: string;
  paidAt: string;
  userId: string;
  userName: string;
  total: number;
  count: number;
  expenses: PaymentExpense[];
}

interface Summary {
  totalMes: number;
  pendiente: { total: number; count: number };
  aprobado: { total: number; count: number };
  rechazado: { total: number; count: number };
  pagado: { total: number; count: number };
}

interface ReportData {
  summary: Summary;
  users: { id: string; name: string; username: string }[];
  byUser: { userId: string; _sum: { amount: number | null }; _count: number; user: { name: string } }[];
  byCategory: { category: string; _sum: { amount: number | null }; _count: number }[];
  byMonth: { month: string; total: number; count: number }[];
  payments: Payment[];
}

// Helper to get first day of current month
function getMonthStart() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

function getToday() {
  return new Date().toISOString().split("T")[0];
}

const MONTH_NAMES: Record<string, string> = {
  "01": "Enero", "02": "Febrero", "03": "Marzo", "04": "Abril",
  "05": "Mayo", "06": "Junio", "07": "Julio", "08": "Agosto",
  "09": "Septiembre", "10": "Octubre", "11": "Noviembre", "12": "Diciembre",
};

function formatMonth(m: string) {
  const [year, month] = m.split("-");
  return `${MONTH_NAMES[month] || month} ${year}`;
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedPayment, setExpandedPayment] = useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Filters
  const [from, setFrom] = useState(getMonthStart());
  const [to, setTo] = useState(getToday());
  const [userId, setUserId] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (userId) params.set("userId", userId);
    const res = await fetch(`/api/reports?${params}`);
    const d = await res.json();
    setData(d);
    setLoading(false);
  }, [from, to, userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSendEmail = async (uid: string, paymentRef: string) => {
    setSendingEmail(paymentRef);
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: uid, paymentRef }),
      });
      const result = await res.json();
      if (res.ok) {
        setToast({ message: "Comprobante enviado por email", type: "success" });
      } else {
        setToast({ message: result.error || "Error al enviar email", type: "error" });
      }
    } catch {
      setToast({ message: "Error al enviar email", type: "error" });
    } finally {
      setSendingEmail(null);
    }
  };

  const handleExport = (format: string) => {
    const params = new URLSearchParams();
    params.set("format", format);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    window.open(`/api/export?${params}`, "_blank");
  };

  const clearFilters = () => {
    setFrom(getMonthStart());
    setTo(getToday());
    setUserId("");
  };

  const summary = data?.summary;
  const totalGeneral = summary?.totalMes || 0;
  const hasFilters = userId !== "" || from !== getMonthStart() || to !== getToday();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <main className="max-w-5xl mx-auto p-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h1 className="text-xl font-bold text-slate-900">Reportes</h1>
          <div className="flex gap-2">
            <button onClick={() => handleExport("chipax")} className="px-3 py-2 bg-purple-600 text-white text-xs rounded-xl hover:bg-purple-700 font-medium">
              Chipax
            </button>
            <button onClick={() => handleExport("xlsx")} className="px-3 py-2 bg-green-600 text-white text-xs rounded-xl hover:bg-green-700 font-medium">
              Excel
            </button>
            <button onClick={() => handleExport("csv")} className="px-3 py-2 bg-blue-600 text-white text-xs rounded-xl hover:bg-blue-700 font-medium">
              CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border mb-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Desde</label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Hasta</label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Usuario</label>
              <select
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900"
              >
                <option value="">Todos</option>
                {data?.users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              {hasFilters && (
                <button onClick={clearFilters} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-600 hover:bg-slate-50">
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Cargando reportes...</div>
        ) : !data ? null : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
              <div className="bg-gray-900 text-white rounded-2xl p-4 col-span-2 sm:col-span-1">
                <div className="text-xs text-gray-400 font-medium">Total</div>
                <div className="text-xl font-bold">{formatCLP(totalGeneral)}</div>
                <div className="text-xs text-gray-400">{summary!.pendiente.count + summary!.aprobado.count + summary!.rechazado.count + summary!.pagado.count} gastos</div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
                <div className="text-xs text-yellow-600 font-medium">Pendiente</div>
                <div className="text-xl font-bold text-yellow-800">{formatCLP(summary!.pendiente.total)}</div>
                <div className="text-xs text-yellow-600">{summary!.pendiente.count} gastos</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                <div className="text-xs text-green-600 font-medium">Aprobado</div>
                <div className="text-xl font-bold text-green-800">{formatCLP(summary!.aprobado.total)}</div>
                <div className="text-xs text-green-600">{summary!.aprobado.count} gastos</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <div className="text-xs text-blue-600 font-medium">Pagado</div>
                <div className="text-xl font-bold text-blue-800">{formatCLP(summary!.pagado.total)}</div>
                <div className="text-xs text-blue-600">{summary!.pagado.count} gastos</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                <div className="text-xs text-red-600 font-medium">Rechazado</div>
                <div className="text-xl font-bold text-red-800">{formatCLP(summary!.rechazado.total)}</div>
                <div className="text-xs text-red-600">{summary!.rechazado.count} gastos</div>
              </div>
            </div>

            {/* Two columns: By User + By Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {/* By User */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
                <h2 className="text-sm font-semibold text-slate-900 mb-3">Gastos por Usuario</h2>
                {data.byUser.length === 0 ? (
                  <div className="text-center py-4 text-gray-400 text-sm">Sin datos</div>
                ) : (
                  <div className="space-y-3">
                    {data.byUser
                      .sort((a, b) => (b._sum.amount || 0) - (a._sum.amount || 0))
                      .map((item) => {
                        const amount = item._sum.amount || 0;
                        const pct = totalGeneral > 0 ? (amount / totalGeneral) * 100 : 0;
                        return (
                          <div key={item.userId}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-slate-700 font-medium">{item.user?.name || "—"}</span>
                              <span className="font-bold text-slate-900">{formatCLP(amount)}</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2.5">
                              <div className="bg-sky-500 h-2.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                            </div>
                            <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                              <span>{item._count} rendiciones</span>
                              <span>{pct.toFixed(0)}%</span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* By Category */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
                <h2 className="text-sm font-semibold text-slate-900 mb-3">Gastos por Categoría</h2>
                {data.byCategory.length === 0 ? (
                  <div className="text-center py-4 text-gray-400 text-sm">Sin datos</div>
                ) : (
                  <div className="space-y-3">
                    {data.byCategory
                      .sort((a, b) => (b._sum.amount || 0) - (a._sum.amount || 0))
                      .map((item) => {
                        const amount = item._sum.amount || 0;
                        const pct = totalGeneral > 0 ? (amount / totalGeneral) * 100 : 0;
                        return (
                          <div key={item.category}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-slate-700 font-medium">{categoryLabels[item.category] || item.category}</span>
                              <span className="font-bold text-slate-900">{formatCLP(amount)}</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2.5">
                              <div className="bg-blue-500 h-2.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                            </div>
                            <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                              <span>{item._count} rendiciones</span>
                              <span>{pct.toFixed(0)}%</span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>

            {/* By Month */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border mb-4">
              <h2 className="text-sm font-semibold text-slate-900 mb-3">Evolución Mensual</h2>
              {data.byMonth.length === 0 ? (
                <div className="text-center py-4 text-gray-400 text-sm">Sin datos</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left text-xs font-medium text-gray-500 pb-2">Mes</th>
                        <th className="text-right text-xs font-medium text-gray-500 pb-2">Rendiciones</th>
                        <th className="text-right text-xs font-medium text-gray-500 pb-2">Total</th>
                        <th className="text-left text-xs font-medium text-gray-500 pb-2 pl-4 w-1/3">Proporción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {data.byMonth.map((item) => {
                        const maxTotal = Math.max(...data.byMonth.map((m) => m.total));
                        const pct = maxTotal > 0 ? (item.total / maxTotal) * 100 : 0;
                        return (
                          <tr key={item.month}>
                            <td className="py-2.5 text-sm font-medium text-slate-900">{formatMonth(item.month)}</td>
                            <td className="py-2.5 text-sm text-gray-500 text-right">{item.count}</td>
                            <td className="py-2.5 text-sm font-bold text-slate-900 text-right">{formatCLP(item.total)}</td>
                            <td className="py-2.5 pl-4">
                              <div className="w-full bg-slate-100 rounded-full h-2">
                                <div className="bg-gray-800 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Payment History */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
              <h2 className="text-sm font-semibold text-slate-900 mb-3">Historial de Pagos</h2>
              {data.payments.length === 0 ? (
                <div className="text-center py-4 text-gray-400 text-sm">No hay pagos registrados en este período</div>
              ) : (
                <div className="space-y-3">
                  {data.payments.map((payment) => (
                    <div key={payment.ref} className="border border-blue-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedPayment(expandedPayment === payment.ref ? null : payment.ref)}
                        className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 transition-colors"
                      >
                        <div className="text-left">
                          <div className="text-sm font-medium text-slate-900">{payment.userName}</div>
                          <div className="text-xs text-gray-500">
                            {payment.ref} · {payment.paidAt ? formatDate(payment.paidAt) : "—"} · {payment.count} rendiciones
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-blue-700">{formatCLP(payment.total)}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleSendEmail(payment.userId, payment.ref); }}
                            disabled={sendingEmail === payment.ref}
                            className="px-2 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            title="Reenviar comprobante"
                          >
                            {sendingEmail === payment.ref ? "..." : "Email"}
                          </button>
                          <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandedPayment === payment.ref ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>
                      {expandedPayment === payment.ref && (
                        <div className="p-3 border-t border-blue-200">
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-xs text-gray-500">
                                  <th className="text-left pb-2">Fecha</th>
                                  <th className="text-left pb-2">Cuenta</th>
                                  <th className="text-left pb-2">Proveedor</th>
                                  <th className="text-left pb-2">Tipo Doc</th>
                                  <th className="text-right pb-2">Monto</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {payment.expenses.map((exp) => (
                                  <tr key={exp.id}>
                                    <td className="py-1.5 text-slate-700">{formatDate(exp.date)}</td>
                                    <td className="py-1.5 text-slate-700">{categoryLabels[exp.category] || exp.category}</td>
                                    <td className="py-1.5 text-slate-700">{exp.proveedor || "—"}</td>
                                    <td className="py-1.5 text-slate-700">{exp.tipoDocumento || "—"}</td>
                                    <td className="py-1.5 text-slate-900 text-right font-medium">{formatCLP(exp.amount)}</td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot>
                                <tr className="border-t">
                                  <td colSpan={4} className="py-2 font-semibold text-slate-900">Total</td>
                                  <td className="py-2 text-right font-bold text-blue-700">{formatCLP(payment.total)}</td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
