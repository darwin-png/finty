"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import StatusBadge from "@/components/StatusBadge";
import { categoryLabels, formatCLP, formatDate, categories, TIPOS_DOCUMENTO } from "@/lib/categories";

interface Expense {
  id: string;
  date: string;
  category: string;
  description: string | null;
  amount: number;
  receipt: string | null;
  status: string;
  comment: string | null;
  tipoDocumento: string | null;
  proveedor: string | null;
  numeroDocumento: string | null;
  paidAt: string | null;
  paymentRef: string | null;
  user: { name: string };
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState<{ open: boolean; expense?: Expense }>({ open: false });
  const [editForm, setEditForm] = useState({ date: "", category: "", description: "", amount: "", tipoDocumento: "", proveedor: "", numeroDocumento: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      if (session?.user?.role === "ADMINISTRADOR") {
        router.replace("/app/admin");
        return;
      }
      fetchExpenses();
    }
  }, [status, session, router]);

  const fetchExpenses = async () => {
    const res = await fetch("/api/expenses");
    const data = await res.json();
    setExpenses(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta rendición?")) return;
    await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    fetchExpenses();
  };

  const openEdit = (exp: Expense) => {
    setEditForm({
      date: exp.date.split("T")[0],
      category: exp.category,
      description: exp.description || "",
      amount: String(exp.amount),
      tipoDocumento: exp.tipoDocumento || "",
      proveedor: exp.proveedor || "",
      numeroDocumento: exp.numeroDocumento || "",
    });
    setEditModal({ open: true, expense: exp });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal.expense) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/expenses/${editModal.expense.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Error al editar");
      } else {
        setEditModal({ open: false });
        fetchExpenses();
      }
    } catch {
      alert("Error al editar");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">Cargando...</div>
        </div>
      </div>
    );
  }

  const active = expenses.filter((e) => e.status !== "PAGADO");
  const paid = expenses.filter((e) => e.status === "PAGADO");
  const totalMes = expenses.reduce((s, e) => s + e.amount, 0);
  const totalPendiente = expenses.filter((e) => e.status === "PENDIENTE").reduce((s, e) => s + e.amount, 0);
  const totalAprobado = expenses.filter((e) => e.status === "APROBADO").reduce((s, e) => s + e.amount, 0);
  const totalPagado = paid.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto p-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3">
            <div className="text-xs text-gray-500 font-medium">Total del Mes</div>
            <div className="text-lg font-bold text-gray-900">{formatCLP(totalMes)}</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-3">
            <div className="text-xs text-yellow-600 font-medium">Pendiente</div>
            <div className="text-lg font-bold text-yellow-800">{formatCLP(totalPendiente)}</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-2xl p-3">
            <div className="text-xs text-green-600 font-medium">Aprobado</div>
            <div className="text-lg font-bold text-green-800">{formatCLP(totalAprobado)}</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3">
            <div className="text-xs text-blue-600 font-medium">Pagado</div>
            <div className="text-lg font-bold text-blue-800">{formatCLP(totalPagado)}</div>
          </div>
        </div>

        {/* New Button */}
        <Link
          href="/app/nueva"
          className="w-full flex items-center justify-center gap-2 bg-sky-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-sky-600 transition-colors shadow-lg mb-6"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva Rendición
        </Link>

        {/* Active Expenses */}
        {active.length === 0 && paid.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>No tienes rendiciones aún</p>
            <p className="text-sm mt-1">Presiona &quot;Nueva Rendición&quot; para comenzar</p>
          </div>
        ) : (
          <>
            {active.length > 0 && (
              <div className="space-y-3 mb-6">
                {active.map((expense) => (
                  <div key={expense.id} className="bg-white rounded-2xl p-4 shadow-sm border">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-gray-900">
                            {categoryLabels[expense.category] || expense.category}
                          </span>
                          <StatusBadge status={expense.status} />
                        </div>
                        {expense.description && (
                          <p className="text-sm text-gray-500">{expense.description}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(expense.date)}
                          {expense.proveedor && ` · ${expense.proveedor}`}
                        </p>
                        {expense.status === "RECHAZADO" && expense.comment && (
                          <div className="mt-2 bg-red-50 text-red-600 text-xs p-2 rounded-lg">
                            <span className="font-medium">Motivo: </span>{expense.comment}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">{formatCLP(expense.amount)}</div>
                        <div className="flex gap-2 mt-2">
                          {expense.receipt && (
                            <a href={expense.receipt} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                              Ver
                            </a>
                          )}
                          {expense.status === "PENDIENTE" && (
                            <>
                              <button onClick={() => openEdit(expense)} className="text-xs text-gray-600 hover:underline">
                                Editar
                              </button>
                              <button onClick={() => handleDelete(expense.id)} className="text-xs text-red-500 hover:underline">
                                Eliminar
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Paid Section */}
            {paid.length > 0 && (
              <>
                <h2 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">Pagados</h2>
                <div className="space-y-3">
                  {paid.map((expense) => (
                    <div key={expense.id} className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-gray-900">
                              {categoryLabels[expense.category] || expense.category}
                            </span>
                            <StatusBadge status={expense.status} />
                          </div>
                          {expense.description && (
                            <p className="text-sm text-gray-500">{expense.description}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDate(expense.date)}
                            {expense.paidAt && ` · Pagado ${formatDate(expense.paidAt)}`}
                          </p>
                        </div>
                        <div className="text-lg font-bold text-blue-700">{formatCLP(expense.amount)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </main>

      {/* Edit Modal */}
      {editModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Editar Rendición</h3>
            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Monto ($)</label>
                <input
                  type="number"
                  value={editForm.amount}
                  onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Cuenta</label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-900"
                  required
                >
                  <option value="">Seleccionar</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Tipo Documento</label>
                <select
                  value={editForm.tipoDocumento}
                  onChange={(e) => setEditForm({ ...editForm, tipoDocumento: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-900"
                >
                  <option value="">Seleccionar</option>
                  {TIPOS_DOCUMENTO.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Proveedor</label>
                <input
                  type="text"
                  value={editForm.proveedor}
                  onChange={(e) => setEditForm({ ...editForm, proveedor: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">N° Documento</label>
                <input
                  type="text"
                  value={editForm.numeroDocumento}
                  onChange={(e) => setEditForm({ ...editForm, numeroDocumento: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Fecha</label>
                <input
                  type="date"
                  value={editForm.date}
                  onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Descripción</label>
                <input
                  type="text"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditModal({ open: false })} className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-medium">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 disabled:opacity-50">
                  {saving ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
