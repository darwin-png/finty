"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { APP_NAME } from "@/lib/config";
import InstallBanner from "./InstallBanner";

const IconRendiciones = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const IconReportes = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13h2v8H3zm6-4h2v12H9zm6-3h2v15h-2zm6-4h2v19h-2z" />
  </svg>
);

const IconUsuarios = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const IconMisGastos = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
  </svg>
);

const icons: Record<string, () => React.ReactElement> = {
  rendiciones: IconRendiciones,
  reportes: IconReportes,
  usuarios: IconUsuarios,
  misgastos: IconMisGastos,
};

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isAdmin = session?.user?.role === "ADMINISTRADOR";
  const plan = session?.user?.plan;

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

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

  const navItems = isAdmin
    ? [
        { href: "/app/admin", label: "Rendiciones", iconKey: "rendiciones" },
        { href: "/app/admin/reports", label: "Reportes", iconKey: "reportes" },
        { href: "/app/admin/users", label: "Usuarios", iconKey: "usuarios" },
        { href: "/app/dashboard", label: "Mis Gastos", iconKey: "misgastos" },
      ]
    : [
        { href: "/app/dashboard", label: "Mis Gastos", iconKey: "misgastos" },
      ];

  return (
    <header className="bg-white sticky top-0 z-50 shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <Link href={isAdmin ? "/app/admin" : "/app/dashboard"} className="flex items-center gap-2">
              <Image src="/logo.png" alt={APP_NAME} width={90} height={28} className="h-7 w-auto" />
            </Link>
            {plan === "FREE" && (
              <span className="text-[10px] bg-yellow-400 text-yellow-900 px-1.5 py-0.5 rounded-full font-bold">FREE</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 hidden sm:block">{session?.user?.name}</span>
            <button
              onClick={() => { setPwError(""); setPwSuccess(""); setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); setShowPasswordModal(true); }}
              className="text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition-colors"
              title="Cambiar contraseña"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </button>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              Salir
            </button>
          </div>
        </div>
      </div>
      <nav className="bg-[#4A90D9]">
        <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = icons[item.iconKey];
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
                  pathname === item.href
                    ? "bg-[#3A7BC8] text-white"
                    : "text-blue-100 hover:text-white hover:bg-[#3A7BC8]/50"
                }`}
              >
                <Icon />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
      <InstallBanner />

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Cambiar Contraseña</h3>
            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Contraseña actual</label>
                <input
                  type="password"
                  value={pwForm.currentPassword}
                  onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#4A90D9]"
                  required
                  autoComplete="current-password"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Nueva contraseña</label>
                <input
                  type="password"
                  value={pwForm.newPassword}
                  onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#4A90D9]"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Confirmar nueva contraseña</label>
                <input
                  type="password"
                  value={pwForm.confirmPassword}
                  onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#4A90D9]"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
              {pwError && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl text-center">{pwError}</div>}
              {pwSuccess && <div className="bg-green-50 text-green-600 text-sm p-3 rounded-xl text-center">{pwSuccess}</div>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowPasswordModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-medium">
                  Cancelar
                </button>
                <button type="submit" disabled={pwLoading} className="flex-1 py-2.5 rounded-xl bg-[#4A90D9] text-white text-sm font-medium hover:bg-[#3A7BC8] disabled:opacity-50">
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
