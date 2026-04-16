"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { APP_DESCRIPTION } from "@/lib/config";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [showForgot, setShowForgot] = useState(false);
  const [forgotForm, setForgotForm] = useState({ username: "", email: "" });
  const [forgotMsg, setForgotMsg] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMsg("");
    setForgotError("");
    setForgotLoading(true);
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(forgotForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setForgotError(data.error || "Error al procesar solicitud");
      } else {
        setForgotMsg(data.message);
      }
    } catch {
      setForgotError("Error de conexión");
    }
    setForgotLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Usuario o contraseña incorrectos");
      setLoading(false);
    } else {
      router.push("/app/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4A90D9] to-[#2E6AB5] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="Finty" width={180} height={54} className="mx-auto mb-4 h-[156px] w-auto" />
          <p className="text-gray-500 text-sm mt-1">{APP_DESCRIPTION}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#4A90D9] focus:border-transparent outline-none text-gray-900"
              placeholder="Ingresa tu usuario"
              required
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#4A90D9] focus:border-transparent outline-none text-gray-900"
              placeholder="Ingresa tu contraseña"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4A90D9] text-white py-3 rounded-xl font-semibold hover:bg-[#3A7BC8] transition-colors disabled:opacity-50"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={() => { setShowForgot(true); setForgotMsg(""); setForgotError(""); setForgotForm({ username: "", email: "" }); }}
            className="text-sm text-[#4A90D9] hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      </div>

      {showForgot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Recuperar Contraseña</h3>
            <p className="text-sm text-gray-500 mb-4">Ingresa tu usuario y email registrado. Recibirás una contraseña temporal.</p>
            <form onSubmit={handleForgot} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Usuario</label>
                <input
                  type="text"
                  value={forgotForm.username}
                  onChange={(e) => setForgotForm({ ...forgotForm, username: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#4A90D9]"
                  required
                  autoComplete="username"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                <input
                  type="email"
                  value={forgotForm.email}
                  onChange={(e) => setForgotForm({ ...forgotForm, email: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#4A90D9]"
                  required
                  autoComplete="email"
                />
              </div>
              {forgotError && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl text-center">{forgotError}</div>}
              {forgotMsg && <div className="bg-green-50 text-green-600 text-sm p-3 rounded-xl text-center">{forgotMsg}</div>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForgot(false)} className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-medium">
                  Volver
                </button>
                <button type="submit" disabled={forgotLoading} className="flex-1 py-2.5 rounded-xl bg-[#4A90D9] text-white text-sm font-medium hover:bg-[#3A7BC8] disabled:opacity-50">
                  {forgotLoading ? "Enviando..." : "Enviar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
