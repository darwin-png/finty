"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

interface User {
  id: string;
  username: string;
  name: string;
  email: string | null;
  role: string;
  active: boolean;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; mode: "create" | "edit"; user?: User }>({ open: false, mode: "create" });
  const [form, setForm] = useState({ username: "", name: "", email: "", password: "", role: "COLABORADOR", active: true });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [resetModal, setResetModal] = useState<{ open: boolean; user?: User }>({ open: false });
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch("/api/users");
    const data = await res.json();
    setUsers(data);
    setLoading(false);
  };

  const openCreate = () => {
    setForm({ username: "", name: "", email: "", password: "", role: "COLABORADOR", active: true });
    setError("");
    setModal({ open: true, mode: "create" });
  };

  const openEdit = (user: User) => {
    setForm({ username: user.username, name: user.name, email: user.email || "", password: "", role: user.role, active: user.active });
    setError("");
    setModal({ open: true, mode: "edit", user });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (modal.mode === "create") {
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
      } else {
        const body: Record<string, unknown> = { name: form.name, username: form.username, email: form.email, role: form.role, active: form.active };
        if (form.password) body.password = form.password;
        const res = await fetch(`/api/users/${modal.user!.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
      }

      setModal({ open: false, mode: "create" });
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    }
    setSaving(false);
  };

  const handleResetPassword = async () => {
    if (!resetModal.user || !newPassword) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${resetModal.user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast({ msg: data.error || "Error al cambiar contraseña", ok: false });
      } else {
        setToast({ msg: `Contraseña de ${resetModal.user.name} actualizada`, ok: true });
        setResetModal({ open: false });
        setNewPassword("");
        setShowPassword(false);
      }
    } catch {
      setToast({ msg: "Error al cambiar contraseña", ok: false });
    }
    setSaving(false);
    setTimeout(() => setToast(null), 3000);
  };

  const toggleActive = async (user: User) => {
    await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !user.active }),
    });
    fetchUsers();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-2xl shadow-lg text-sm font-medium text-white ${toast.ok ? "bg-green-600" : "bg-red-600"}`}>
          {toast.msg}
        </div>
      )}
      <main className="max-w-4xl mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-slate-900">Usuarios</h1>
          <button onClick={openCreate} className="px-4 py-2 bg-sky-500 text-white text-sm rounded-xl hover:bg-sky-600 font-medium">
            Nuevo Usuario
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Cargando...</div>
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="bg-white rounded-2xl p-4 shadow-sm border flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900">{user.name}</div>
                  <div className="text-sm text-slate-500">@{user.username}</div>
                  {user.email && <div className="text-xs text-gray-400">{user.email}</div>}
                  <div className="flex gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${user.role === "ADMINISTRADOR" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}`}>
                      {user.role === "ADMINISTRADOR" ? "Admin" : "Colaborador"}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${user.active ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-500"}`}>
                      {user.active ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(user)} className="text-xs bg-slate-100 text-slate-700 px-3 py-2 rounded-xl hover:bg-gray-200">Editar</button>
                  <button onClick={() => { setResetModal({ open: true, user }); setNewPassword(""); }} className="text-xs bg-yellow-100 text-yellow-700 px-3 py-2 rounded-xl hover:bg-yellow-200">Clave</button>
                  <button onClick={() => toggleActive(user)} className={`text-xs px-3 py-2 rounded-xl ${user.active ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-green-100 text-green-700 hover:bg-green-200"}`}>
                    {user.active ? "Desactivar" : "Activar"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {resetModal.open && resetModal.user && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Cambiar Contraseña</h3>
            <p className="text-sm text-slate-500 mb-4">
              <strong>{resetModal.user.name}</strong> · @{resetModal.user.username}
            </p>
            <div className="relative mb-4">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nueva contraseña (mín. 6 caracteres)"
                className="w-full px-3 py-2.5 pr-10 rounded-xl border border-slate-300 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-sky-500"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-slate-600 text-xs"
              >
                {showPassword ? "Ocultar" : "Ver"}
              </button>
            </div>
            {newPassword.length > 0 && newPassword.length < 6 && (
              <p className="text-xs text-red-500 mb-3">Mínimo 6 caracteres</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => { setResetModal({ open: false }); setNewPassword(""); setShowPassword(false); }}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleResetPassword}
                disabled={newPassword.length < 6 || saving}
                className="flex-1 py-2.5 rounded-xl bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Cambiar Clave"}
              </button>
            </div>
          </div>
        </div>
      )}

      {modal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {modal.mode === "create" ? "Nuevo Usuario" : "Editar Usuario"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nombre completo" className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-sky-500" required />
              <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Usuario" className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-sky-500" required />
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-sky-500" />
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={modal.mode === "edit" ? "Nueva contraseña (dejar vacío para mantener)" : "Contraseña"} className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-sky-500" required={modal.mode === "create"} />
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900">
                <option value="COLABORADOR">Colaborador</option>
                <option value="ADMINISTRADOR">Administrador</option>
              </select>

              {error && <div className="bg-red-50 text-red-600 text-sm p-2 rounded-xl">{error}</div>}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal({ open: false, mode: "create" })} className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-medium">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 disabled:opacity-50">{saving ? "Guardando..." : "Guardar"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
