"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: string;
  active: boolean;
  createdAt: string;
  _count: { users: number; expenses: number };
}

interface User {
  id: string;
  username: string;
  name: string;
  email: string | null;
  role: string;
  active: boolean;
  organizationId: string | null;
  organization?: { name: string };
  createdAt: string;
}

export default function SuperAdminPage() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"orgs" | "users">("orgs");

  // Org modal
  const [orgModal, setOrgModal] = useState<{ open: boolean; mode: "create" | "edit"; org?: Organization }>({
    open: false,
    mode: "create",
  });
  const [orgForm, setOrgForm] = useState({ name: "", plan: "FREE" });
  const [orgError, setOrgError] = useState("");
  const [orgSaving, setOrgSaving] = useState(false);

  // User modal
  const [userModal, setUserModal] = useState<{ open: boolean; mode: "create" | "edit"; user?: User }>({
    open: false,
    mode: "create",
  });
  const [userForm, setUserForm] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    role: "COLABORADOR",
    organizationId: "",
  });
  const [userError, setUserError] = useState("");
  const [userSaving, setUserSaving] = useState(false);

  // Delete confirm
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; type: "org" | "user"; item?: Organization | User }>({
    open: false,
    type: "org",
  });

  useEffect(() => {
    fetchOrgs();
    fetchUsers();
  }, []);

  const fetchOrgs = async () => {
    const res = await fetch("/api/superadmin/organizations");
    const data = await res.json();
    setOrgs(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const fetchUsers = async () => {
    const res = await fetch("/api/superadmin/users");
    const data = await res.json();
    setUsers(Array.isArray(data) ? data : []);
  };

  // Org CRUD
  const handleOrgSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrgError("");
    setOrgSaving(true);

    try {
      if (orgModal.mode === "create") {
        const res = await fetch("/api/superadmin/organizations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orgForm),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
      } else {
        const res = await fetch(`/api/superadmin/organizations/${orgModal.org!.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orgForm),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
      }
      setOrgModal({ open: false, mode: "create" });
      fetchOrgs();
    } catch (err) {
      setOrgError(err instanceof Error ? err.message : "Error");
    }
    setOrgSaving(false);
  };

  const deleteOrg = async (id: string) => {
    try {
      const res = await fetch(`/api/superadmin/organizations/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchOrgs();
    } catch (err) {
      console.error(err);
    }
    setDeleteModal({ open: false, type: "org" });
  };

  // User CRUD
  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserError("");
    setUserSaving(true);

    try {
      if (userModal.mode === "create") {
        const res = await fetch("/api/superadmin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userForm),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
      } else {
        const body: Record<string, unknown> = {
          name: userForm.name,
          username: userForm.username,
          email: userForm.email,
          role: userForm.role,
        };
        if (userForm.password) body.password = userForm.password;
        const res = await fetch(`/api/superadmin/users/${userModal.user!.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
      }
      setUserModal({ open: false, mode: "create" });
      fetchUsers();
    } catch (err) {
      setUserError(err instanceof Error ? err.message : "Error");
    }
    setUserSaving(false);
  };

  const deleteUser = async (id: string) => {
    try {
      const res = await fetch(`/api/superadmin/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
    setDeleteModal({ open: false, type: "user" });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-slate-900">SuperAdmin</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-6">
          <button
            onClick={() => setTab("orgs")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${tab === "orgs" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
          >
            Organizaciones ({orgs.length})
          </button>
          <button
            onClick={() => setTab("users")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${tab === "users" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
          >
            Usuarios ({users.length})
          </button>
        </div>

        {/* Organizations Tab */}
        {tab === "orgs" && (
          <div>
            <button
              onClick={() => {
                setOrgForm({ name: "", plan: "FREE" });
                setOrgError("");
                setOrgModal({ open: true, mode: "create" });
              }}
              className="mb-4 px-4 py-2 bg-[#4A90D9] text-white text-sm rounded-xl hover:bg-[#3a7bc8] font-medium"
            >
              Nueva Organización
            </button>

            {loading ? (
              <div className="text-center py-12 text-slate-400">Cargando...</div>
            ) : orgs.length === 0 ? (
              <div className="text-center py-12 text-slate-400">Sin organizaciones aún</div>
            ) : (
              <div className="grid gap-4">
                {orgs.map((org) => (
                  <div key={org.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-lg font-bold text-slate-900">{org.name}</div>
                        <div className="text-sm text-slate-500 mt-1">
                          Slug: <code className="bg-slate-100 px-2 py-1 rounded">{org.slug}</code>
                        </div>
                        <div className="flex gap-3 mt-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${org.plan === "FULL" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>
                            Plan {org.plan}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${org.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {org.active ? "Activa" : "Inactiva"}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                            {org._count.users} usuario{org._count.users !== 1 ? "s" : ""}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                            {org._count.expenses} rendición{org._count.expenses !== 1 ? "es" : ""}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setOrgForm({ name: org.name, plan: org.plan });
                            setOrgError("");
                            setOrgModal({ open: true, mode: "edit", org });
                          }}
                          className="text-xs bg-slate-100 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-200"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setDeleteModal({ open: true, type: "org", item: org })}
                          className="text-xs bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {tab === "users" && (
          <div>
            <button
              onClick={() => {
                setUserForm({ username: "", name: "", email: "", password: "", role: "COLABORADOR", organizationId: "" });
                setUserError("");
                setUserModal({ open: true, mode: "create" });
              }}
              className="mb-4 px-4 py-2 bg-[#4A90D9] text-white text-sm rounded-xl hover:bg-[#3a7bc8] font-medium"
            >
              Nuevo Usuario
            </button>

            {users.length === 0 ? (
              <div className="text-center py-12 text-slate-400">Sin usuarios aún</div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Usuario</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Nombre</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Org</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Rol</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Estado</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-900">@{user.username}</td>
                          <td className="px-4 py-3 text-slate-600">{user.name}</td>
                          <td className="px-4 py-3 text-slate-600 text-xs">{user.email || "—"}</td>
                          <td className="px-4 py-3 text-slate-600">{user.organization?.name || "—"}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${user.role === "SUPERADMIN" ? "bg-red-100 text-red-700" : user.role === "ADMINISTRADOR" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                              {user.role === "SUPERADMIN" ? "SuperAdmin" : user.role === "ADMINISTRADOR" ? "Admin" : "Colaborador"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${user.active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                              {user.active ? "Activo" : "Inactivo"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => {
                                  setUserForm({
                                    username: user.username,
                                    name: user.name,
                                    email: user.email || "",
                                    password: "",
                                    role: user.role,
                                    organizationId: user.organizationId || "",
                                  });
                                  setUserError("");
                                  setUserModal({ open: true, mode: "edit", user });
                                }}
                                className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded hover:bg-slate-200"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => setDeleteModal({ open: true, type: "user", item: user })}
                                className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Org Modal */}
      {orgModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {orgModal.mode === "create" ? "Nueva Organización" : "Editar Organización"}
            </h3>
            <form onSubmit={handleOrgSubmit} className="space-y-3">
              <input
                type="text"
                value={orgForm.name}
                onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                placeholder="Nombre de la organización"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 outline-none focus:ring-2 focus:ring-[#4A90D9]"
                required
              />
              <select
                value={orgForm.plan}
                onChange={(e) => setOrgForm({ ...orgForm, plan: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 outline-none focus:ring-2 focus:ring-[#4A90D9]"
              >
                <option value="FREE">Plan FREE</option>
                <option value="FULL">Plan FULL</option>
              </select>

              {orgError && <div className="bg-red-50 text-red-600 text-sm p-2 rounded-lg">{orgError}</div>}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOrgModal({ open: false, mode: "create" })}
                  className="flex-1 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={orgSaving}
                  className="flex-1 py-2.5 rounded-lg bg-[#4A90D9] text-white text-sm font-medium hover:bg-[#3a7bc8] disabled:opacity-50"
                >
                  {orgSaving ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Modal */}
      {userModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {userModal.mode === "create" ? "Nuevo Usuario" : "Editar Usuario"}
            </h3>
            <form onSubmit={handleUserSubmit} className="space-y-3">
              <input
                type="text"
                value={userForm.username}
                onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                placeholder="Usuario"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 outline-none focus:ring-2 focus:ring-[#4A90D9]"
                required
              />
              <input
                type="text"
                value={userForm.name}
                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                placeholder="Nombre completo"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 outline-none focus:ring-2 focus:ring-[#4A90D9]"
                required
              />
              <input
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                placeholder="Email"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 outline-none focus:ring-2 focus:ring-[#4A90D9]"
              />
              <input
                type="password"
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                placeholder={userModal.mode === "edit" ? "Nueva contraseña (dejar en blanco para mantener)" : "Contraseña"}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 outline-none focus:ring-2 focus:ring-[#4A90D9]"
                required={userModal.mode === "create"}
              />
              <select
                value={userForm.organizationId}
                onChange={(e) => setUserForm({ ...userForm, organizationId: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 outline-none focus:ring-2 focus:ring-[#4A90D9]"
                required={userModal.mode === "create"}
              >
                <option value="">Selecciona una organización</option>
                {orgs.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
              <select
                value={userForm.role}
                onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 outline-none focus:ring-2 focus:ring-[#4A90D9]"
              >
                <option value="COLABORADOR">Colaborador</option>
                <option value="ADMINISTRADOR">Administrador</option>
              </select>

              {userError && <div className="bg-red-50 text-red-600 text-sm p-2 rounded-lg">{userError}</div>}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setUserModal({ open: false, mode: "create" })}
                  className="flex-1 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={userSaving}
                  className="flex-1 py-2.5 rounded-lg bg-[#4A90D9] text-white text-sm font-medium hover:bg-[#3a7bc8] disabled:opacity-50"
                >
                  {userSaving ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              ¿Eliminar {deleteModal.type === "org" ? "organización" : "usuario"}?
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              {deleteModal.type === "org"
                ? `Esto eliminará "${(deleteModal.item as Organization).name}" y todos sus usuarios`
                : `Esto eliminará a ${(deleteModal.item as User).name}`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal({ open: false, type: "org" })}
                className="flex-1 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (deleteModal.type === "org") {
                    deleteOrg((deleteModal.item as Organization).id);
                  } else {
                    deleteUser((deleteModal.item as User).id);
                  }
                }}
                className="flex-1 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
