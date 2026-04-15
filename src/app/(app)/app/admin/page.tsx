"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import StatusBadge from "@/components/StatusBadge";
import Toast from "@/components/Toast";
import { categoryLabels, formatCLP, formatDate, categories } from "@/lib/categories";

interface Expense {
  id: string;
  date: string;
  category: string;
  description: string | null;
  amount: number;
  receipt: string | null;
  receiptMime: string | null;
  hasReceipt?: boolean;
  status: string;
  comment: string | null;
  tipoDocumento: string | null;
  proveedor: string | null;
  numeroDocumento: string | null;
  user: { name: string; username: string };
  userId?: string;
}

interface UserTotal {
  userId: string;
  name: string;
  total: number;
  count: number;
}

type Tab = "PENDIENTE" | "APROBADO" | "PAGADO";

export default function AdminPanel() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("PENDIENTE");
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  const [rejectModal, setRejectModal] = useState<{ id: string; open: boolean }>({ id: "", open: false });
  const [rejectComment, setRejectComment] = useState("");
  const [paying, setPaying] = useState<string | null>(null);
  const [payConfirm, setPayConfirm] = useState<{ open: boolean; userId: string; name: string; total: number; count: number }>({ open: false, userId: "", name: "", total: 0, count: 0 });
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ id: string; open: boolean }>({ id: "", open: false });
  const [markingPaid, setMarkingPaid] = useState<string | null>(null);

  // Auth guard: redirect non-admins
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "ADMINISTRADOR") {
      router.replace("/app/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    fetchAll();
    fetchUsers();
  }, []);

  const fetchAll = async () => {
    const res = await fetch("/api/expenses");
    const data = await res.json();
    setAllExpenses(data);
    setLoading(false);
  };

  const fetchUsers = async () => {
    const res = await fetch("/api/users");
    const data = await res.json();
    setUsers(data);
  };

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
  };

  const handleApprove = async (id: string) => {
    const res = await fetch(`/api/expenses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "APROBADO" }),
    });
    if (res.ok) {
      showToast("Gasto aprobado");
      fetchAll();
    } else {
      const err = await res.json();
      showToast(err.error || "Error al aprobar", "error");
    }
  };

  const handleReject = async () => {
    const res = await fetch(`/api/expenses/${rejectModal.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "RECHAZADO", comment: rejectComment }),
    });
    setRejectModal({ id: "", open: false });
    setRejectComment("");
    if (res.ok) {
      showToast("Gasto rechazado");
      fetchAll();
    } else {
      const err = await res.json();
      showToast(err.error || "Error al rechazar", "error");
    }
  };

  const handlePay = async (userId: string) => {
    setPaying(userId);
    try {
      const res = await fetch("/api/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) {
        const err = await res.json();
        showToast(err.error || "Error al procesar pago", "error");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.headers.get("Content-Disposition")?.split("filename=")[1] || "comprobante.pdf";
      a.click();
      URL.revokeObjectURL(url);

      // Try sending email silently
      fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      }).catch(() => {});

      showToast("Pago registrado y comprobante descargado");
      window.open("https://empresas.officebanking.cl/", "_blank");
      fetchAll();
    } catch {
      showToast("Error al procesar pago", "error");
    } finally {
      setPaying(null);
    }
  };

  const handleDelete = async () => {
    const res = await fetch(`/api/expenses/${deleteModal.id}`, { method: "DELETE" });
    setDeleteModal({ id: "", open: false });
    if (res.ok) {
      showToast("Gasto eliminado");
      fetchAll();
    } else {
      const err = await res.json();
      showToast(err.error || "Error al eliminar", "error");
    }
  };

  const handleMarkPaid = async (id: string) => {
    setMarkingPaid(id);
    const res = await fetch(`/api/expenses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "PAGADO" }),
    });
    setMarkingPaid(null);
    if (res.ok) {
      showToast("Gasto marcado como pagado");
      fetchAll();
    } else {
      const err = await res.json();
      showToast(err.error || "Error al marcar como pagado", "error");
    }
  };

  const handleExport = (format: string) => {
    window.open(`/api/export?format=${format}`, "_blank");
  };

  // Data by tab
  const pendientes = allExpenses.filter((e) => e.status === "PENDIENTE");
  const aprobados = allExpenses.filter((e) => e.status === "APROBADO");
  const pagados = allExpenses.filter((e) => e.status === "PAGADO");
  const rechazados = allExpenses.filter((e) => e.status === "RECHAZADO");

  const currentList = tab === "PENDIENTE" ? [...pendientes, ...rechazados] : tab === "APROBADO" ? aprobados : pagados;

  // KPIs
  const totalPendiente = pendientes.reduce((s, e) => s + e.amount, 0);
  const totalAprobado = aprobados.reduce((s, e) => s + e.amount, 0);
  const totalPagado = pagados.reduce((s, e) => s + e.amount, 0);
  const totalRechazado = rechazados.reduce((s, e) => s + e.amount, 0);

  // Group expenses by user
  interface GroupedExpenses {
    userId: string;
    name: string;
    items: Expense[];
  }

  const groupByUser = (expenses: Expense[]): GroupedExpenses[] => {
    const map = new Map<string, GroupedExpenses>();
    expenses.forEach((e) => {
      const key = e.userId || e.user.username;
      if (!map.has(key)) {
        map.set(key, { userId: key, name: e.user.name, items: [] });
      }
      map.get(key)!.items.push(e);
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  };

  const currentGrouped = groupByUser(currentList);

  // Approved grouped by user (for pay section)
  const approvedByUser: UserTotal[] = (() => {
    const map = new Map<string, UserTotal>();
    aprobados.forEach((e) => {
      const key = e.userId || e.user.username;
      const existing = map.get(key);
      if (existing) {
        existing.total += e.amount;
        existing.count += 1;
      } else {
        map.set(key, { userId: key, name: e.user.name, total: e.amount, count: 1 });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  })();

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "PENDIENTE", label: "Pendientes", count: pendientes.length },
    { key: "APROBADO", label: "Aprobados", count: aprobados.length },
    { key: "PAGADO", label: "Pagados", count: pagados.length },
  ];

  // Auth guard: don't render if not admin
  if (status === "loading" || status === "unauthenticated") return null;
  if (status === "authenticated" && session?.user?.role !== "ADMINISTRADOR") return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <main className="max-w-7xl mx-auto p-4">
        {/* Header + Export */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h1 className="text-xl font-bold text-gray-900">Panel de Administración</h1>
          <div className="flex gap-2">
            <button onClick={() => handleExport("chipax")} className="px-3 py-2 bg-purple-600 text-white text-xs rounded-xl hover:bg-purple-700 font-medium">
              Chipax
            </button>
            <button onClick={() => handleExport("xlsx")} className="px-3 py-2 bg-green-600 text-white text-xs rounded-xl hover:bg-green-700">
              Excel
            </button>
            <button onClick={() => handleExport("csv")} className="px-3 py-2 bg-blue-600 text-white text-xs rounded-xl hover:bg-blue-700">
              CSV
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-3">
            <div className="text-xs text-yellow-600 font-medium">Pendientes</div>
            <div className="text-lg font-bold text-yellow-800">{formatCLP(totalPendiente)}</div>
            <div className="text-xs text-yellow-600">{pendientes.length} gastos</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-2xl p-3">
            <div className="text-xs text-green-600 font-medium">Por Pagar</div>
            <div className="text-lg font-bold text-green-800">{formatCLP(totalAprobado)}</div>
            <div className="text-xs text-green-600">{aprobados.length} gastos</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3">
            <div className="text-xs text-blue-600 font-medium">Pagado</div>
            <div className="text-lg font-bold text-blue-800">{formatCLP(totalPagado)}</div>
            <div className="text-xs text-blue-600">{pagados.length} gastos</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-2xl p-3">
            <div className="text-xs text-red-600 font-medium">Rechazado</div>
            <div className="text-lg font-bold text-red-800">{formatCLP(totalRechazado)}</div>
            <div className="text-xs text-red-600">{rechazados.length} gastos</div>
          </div>
        </div>

        {/* Pay section (only if there are approved expenses) */}
        {approvedByUser.length > 0 && tab === "APROBADO" && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border mb-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Pagar por Colaborador</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {approvedByUser.map((u) => (
                <div key={u.userId} className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{u.name}</div>
                    <div className="text-lg font-bold text-green-700">{formatCLP(u.total)}</div>
                    <div className="text-xs text-gray-500">{u.count} rendiciones</div>
                  </div>
                  <button
                    onClick={() => setPayConfirm({ open: true, userId: u.userId, name: u.name, total: u.total, count: u.count })}
                    disabled={paying === u.userId}
                    className="ml-3 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-wait"
                  >
                    {paying === u.userId ? "Pagando..." : "Pagar"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-2xl p-1 shadow-sm border mb-4">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                tab === t.key
                  ? "bg-sky-500 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {t.label} ({t.count})
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Cargando...</div>
        ) : currentList.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            {tab === "PENDIENTE" ? "No hay gastos pendientes" : tab === "APROBADO" ? "No hay gastos aprobados" : "No hay gastos pagados"}
          </div>
        ) : (
          <>
            {/* Mobile cards grouped by user */}
            <div className="sm:hidden space-y-3">
              {currentGrouped.map((group) => (
                <div key={group.userId}>
                  {/* User header card */}
                  <div className="bg-sky-50 border border-sky-200 rounded-2xl p-3 mb-2">
                    <div className="text-sm font-semibold text-sky-900">{group.name}</div>
                    <div className="text-xs text-sky-600">
                      {group.items.length} rendiciones · {formatCLP(group.items.reduce((s, e) => s + e.amount, 0))}
                    </div>
                  </div>
                  {/* Expense cards */}
                  {group.items.map((exp) => (
                    <div key={exp.id} className="bg-white rounded-2xl p-4 shadow-sm border">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="text-xs text-gray-500">{formatDate(exp.date)} · {categoryLabels[exp.category] || exp.category}</div>
                          {exp.description && <p className="text-xs text-gray-400 mt-1">{exp.description}</p>}
                          <div className="text-xs text-gray-400 mt-1">
                            {exp.tipoDocumento && <span>{exp.tipoDocumento}</span>}
                            {exp.proveedor && <span> · {exp.proveedor}</span>}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">{formatCLP(exp.amount)}</div>
                          <StatusBadge status={exp.status} />
                        </div>
                      </div>
                      {exp.comment && exp.status === "RECHAZADO" && (
                        <div className="bg-red-50 text-red-600 text-xs p-2 rounded-lg mb-2">
                          <span className="font-medium">Motivo: </span>{exp.comment}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2 pt-2 border-t">
                        {exp.hasReceipt && (
                          <a href={`/api/files/${exp.id}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">Ver comprobante</a>
                        )}
                        {exp.status === "PENDIENTE" && (
                          <>
                            <button onClick={() => handleApprove(exp.id)} className="text-xs bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700">Aprobar</button>
                            <button onClick={() => setRejectModal({ id: exp.id, open: true })} className="text-xs bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700">Rechazar</button>
                          </>
                        )}
                        {exp.status === "APROBADO" && (
                          <button
                            onClick={() => handleMarkPaid(exp.id)}
                            disabled={markingPaid === exp.id}
                            className="text-xs bg-sky-600 text-white px-3 py-1 rounded-lg hover:bg-sky-700 disabled:opacity-50 disabled:cursor-wait"
                          >
                            {markingPaid === exp.id ? "Marcando..." : "Marcar pagada"}
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteModal({ id: exp.id, open: true })}
                          className="text-xs bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block bg-white rounded-2xl shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Usuario</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Fecha</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Cuenta</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Proveedor</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Descripción</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Monto</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Comp.</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Estado</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {currentGrouped.map((group) => (
                      <React.Fragment key={group.userId}>
                        {/* Group header row */}
                        <tr className="bg-sky-50 hover:bg-sky-100">
                          <td colSpan={9} className="px-4 py-3">
                            <div className="text-sm font-semibold text-sky-900">{group.name}</div>
                            <div className="text-xs text-sky-600">
                              {group.items.length} rendiciones · {formatCLP(group.items.reduce((s, e) => s + e.amount, 0))}
                            </div>
                          </td>
                        </tr>
                        {/* Expense rows */}
                        {group.items.map((exp) => (
                          <tr key={exp.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-500 text-xs">—</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{formatDate(exp.date)}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{categoryLabels[exp.category] || exp.category}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{exp.proveedor || "—"}</td>
                            <td className="px-4 py-3 text-sm text-gray-500 max-w-[200px] truncate">{exp.description || "—"}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">{formatCLP(exp.amount)}</td>
                            <td className="px-4 py-3 text-center">
                              {exp.hasReceipt ? (
                                <a href={`/api/files/${exp.id}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">Ver</a>
                              ) : (
                                <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center"><StatusBadge status={exp.status} /></td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex gap-1 justify-center flex-wrap">
                            {exp.status === "PENDIENTE" && (
                              <>
                                <button onClick={() => handleApprove(exp.id)} className="text-xs bg-green-600 text-white px-2 py-1 rounded-lg hover:bg-green-700">Aprobar</button>
                                <button onClick={() => setRejectModal({ id: exp.id, open: true })} className="text-xs bg-red-600 text-white px-2 py-1 rounded-lg hover:bg-red-700">Rechazar</button>
                              </>
                            )}
                            {exp.status === "APROBADO" && (
                              <button onClick={() => handleMarkPaid(exp.id)} disabled={markingPaid === exp.id}
                                      className="text-xs bg-sky-600 text-white px-2 py-1 rounded-lg hover:bg-sky-700 disabled:opacity-50 disabled:cursor-wait">
                                {markingPaid === exp.id ? "Marcando..." : "Marcar pagada"}
                              </button>
                            )}
                            <button onClick={() => setDeleteModal({ id: exp.id, open: true })}
                                    className="text-xs bg-red-600 text-white px-2 py-1 rounded-lg hover:bg-red-700">
                              Eliminar
                            </button>
                          </div>
                        </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Rechazar Gasto</h3>
            <textarea
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              placeholder="Motivo del rechazo..."
              className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-sky-500 outline-none text-gray-900 h-24 resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => { setRejectModal({ id: "", open: false }); setRejectComment(""); }} className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-medium">Cancelar</button>
              <button onClick={handleReject} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700">Rechazar</button>
            </div>
          </div>
        </div>
      )}

      {/* Pay Confirm Modal */}
      {payConfirm.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Confirmar Pago</h3>
            <p className="text-sm text-gray-600 mb-4">
              ¿Procesar el pago para <strong>{payConfirm.name}</strong>?
            </p>
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
              <div className="text-2xl font-bold text-green-700">{formatCLP(payConfirm.total)}</div>
              <div className="text-xs text-gray-500">{payConfirm.count} rendiciones aprobadas</div>
            </div>
            <p className="text-xs text-gray-400 mb-4">Se generará un comprobante PDF y se enviará por email.</p>
            <div className="flex gap-3">
              <button onClick={() => setPayConfirm({ open: false, userId: "", name: "", total: 0, count: 0 })} className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-medium">Cancelar</button>
              <button onClick={() => { setPayConfirm({ open: false, userId: "", name: "", total: 0, count: 0 }); handlePay(payConfirm.userId); }} className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700">Confirmar Pago</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Eliminar Rendición</h3>
            <p className="text-sm text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar esta rendición? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal({ id: "", open: false })}
                      className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-medium">
                Cancelar
              </button>
              <button onClick={handleDelete}
                      className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
