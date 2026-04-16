"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { APP_NAME } from "@/lib/config";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isAdmin = session?.user?.role === "ADMINISTRADOR";
  const isSuperAdmin = session?.user?.role === "SUPERADMIN";
  const plan = session?.user?.plan;

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [expandedPasswordModal, setExpandedPasswordModal] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");

    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError("Las contraseñas no coinciden");
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwError("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }

    setPwLoading(true);
    try {
      const res = await fetch("/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwError(data.error || "Error al cambiar contraseña");
      } else {
        setPwSuccess("Contraseña actualizada correctamente");
        setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setTimeout(() => setShowPasswordModal(false), 1500);
      }
    } catch {
      setPwError("Error de conexión");
    }
    setPwLoading(false);
  };

  const navItems = isSuperAdmin
    ? [{ href: "/app/superadmin", label: "Administración" }]
    : isAdmin
    ? [
        { href: "/app/admin", label: "Rendiciones" },
        { href: "/app/admin/reports", label: "Reportes" },
        { href: "/app/admin/users", label: "Usuarios" },
        { href: "/app/dashboard", label: "Mis Gastos" },
      ]
    : [
        { href: "/app/dashboard", label: "Mis Gastos" },
      ];

  const userInitial = session?.user?.name?.[0]?.toUpperCase() || "U";

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white sticky top-0 z-50 border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          {/* Logo */}
          <Link href={isSuperAdmin ? "/app/superadmin" : isAdmin ? "/app/admin" : "/app/dashboard"} className="flex items-center gap-3">
            <Image src="/logo.png" alt={APP_NAME} width={400} height={120} className="h-[108px] sm:h-[120px] w-auto" priority />
            {plan === "FREE" && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md font-medium">FREE</span>
            )}
          </Link>

          {/* Nav Items Desktop */}
          <nav className="hidden sm:flex items-center gap-8">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors pb-3 border-b-2 ${
                    isActive
                      ? "border-[#4A90D9] text-slate-900"
                      : "border-transparent text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-[#4A90D9] to-[#3A7BC8] text-white font-medium text-sm hover:shadow-md transition-shadow"
                title={session?.user?.name}
              >
                {userInitial}
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-medium text-slate-900">{session?.user?.name}</p>
                    <p className="text-xs text-slate-500">{session?.user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setPwError("");
                      setPwSuccess("");
                      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                      setShowPasswordModal(true);
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                    Cambiar contraseña
                  </button>
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 border-t border-slate-100"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Salir
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        <nav className="sm:hidden flex overflow-x-auto gap-2 pb-3 border-t border-slate-100 pt-2 -mx-4 px-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex text-xs font-medium px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-[#4A90D9] text-white"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className={`bg-white rounded-2xl p-6 w-full transition-all ${expandedPasswordModal ? 'max-w-2xl' : 'max-w-sm'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Cambiar Contraseña</h3>
              <button
                type="button"
                onClick={() => setExpandedPasswordModal(!expandedPasswordModal)}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                title={expandedPasswordModal ? "Comprimir" : "Expandir"}
              >
                {expandedPasswordModal ? (
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 20v-4m0 4h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                  </svg>
                )}
              </button>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Contraseña Actual</label>
                <input
                  type="password"
                  value={pwForm.currentPassword}
                  onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4A90D9] focus:border-transparent outline-none text-slate-900"
                  required
                  autoComplete="current-password"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Nueva Contraseña</label>
                <input
                  type="password"
                  value={pwForm.newPassword}
                  onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4A90D9] focus:border-transparent outline-none text-slate-900"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Confirmar Contraseña</label>
                <input
                  type="password"
                  value={pwForm.confirmPassword}
                  onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4A90D9] focus:border-transparent outline-none text-slate-900"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>

              {pwError && <div className="bg-red-50 text-red-600 text-xs p-2 rounded-lg">{pwError}</div>}
              {pwSuccess && <div className="bg-green-50 text-green-600 text-xs p-2 rounded-lg">{pwSuccess}</div>}

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowPasswordModal(false); setExpandedPasswordModal(false); }}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={pwLoading}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-[#4A90D9] text-white text-sm font-medium hover:bg-[#3A7BC8] disabled:opacity-50"
                >
                  {pwLoading ? "Guardando..." : "Cambiar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
