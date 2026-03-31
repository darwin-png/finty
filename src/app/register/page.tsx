"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPlan = searchParams.get("plan") === "full" ? "FULL" : "FREE";

  const [selectedPlan, setSelectedPlan] = useState(initialPlan);
  const [form, setForm] = useState({
    orgName: "",
    name: "",
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, plan: selectedPlan }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al registrar");
      }

      const result = await signIn("credentials", {
        username: form.username,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error("Cuenta creada pero hubo un error al iniciar sesión. Intenta desde el login.");
      }

      router.push("/app/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-extrabold text-sky-600">Finty</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Crea tu cuenta</h1>
          <p className="text-gray-500 text-sm mt-1">Comienza a gestionar las rendiciones de tu equipo</p>
        </div>

        {/* Plan Selector */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setSelectedPlan("FREE")}
            className={`rounded-2xl p-4 border-2 text-left transition-all ${
              selectedPlan === "FREE"
                ? "border-gray-900 bg-white shadow-md"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className="text-xs font-bold text-gray-500 uppercase">Gratis</div>
            <div className="text-2xl font-extrabold text-gray-900 mt-1">$0<span className="text-sm font-normal text-gray-400">/mes</span></div>
            <div className="text-xs text-gray-500 mt-1">2 usuarios · 50 rendiciones</div>
          </button>
          <button
            type="button"
            onClick={() => setSelectedPlan("FULL")}
            className={`rounded-2xl p-4 border-2 text-left transition-all relative ${
              selectedPlan === "FULL"
                ? "border-sky-500 bg-white shadow-md"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            {selectedPlan === "FULL" && (
              <div className="absolute -top-2.5 right-3 bg-sky-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">POPULAR</div>
            )}
            <div className="text-xs font-bold text-sky-600 uppercase">Completo</div>
            <div className="text-2xl font-extrabold text-gray-900 mt-1">$29.990<span className="text-sm font-normal text-gray-400">/mes</span></div>
            <div className="text-xs text-gray-500 mt-1">Ilimitado</div>
          </button>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de tu empresa</label>
              <input
                type="text"
                value={form.orgName}
                onChange={(e) => setForm({ ...form, orgName: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none text-gray-900"
                placeholder="Ej: Mi Empresa SpA"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tu nombre</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none text-gray-900"
                placeholder="Nombre completo"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none text-gray-900"
                placeholder="ej: juan.perez"
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none text-gray-900"
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl text-center">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-500 text-white py-3.5 rounded-xl font-bold hover:bg-sky-600 transition-colors disabled:opacity-50 shadow-sm"
            >
              {loading ? "Creando cuenta..." : `Crear Cuenta ${selectedPlan === "FULL" ? "Completa" : "Gratis"}`}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-4">
            Al crear tu cuenta aceptas los términos de servicio y la política de privacidad.
          </p>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-sky-600 hover:underline font-medium">Iniciar Sesión</Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-400">Cargando...</div></div>}>
      <RegisterForm />
    </Suspense>
  );
}
