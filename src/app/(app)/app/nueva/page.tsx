"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { categories, TIPOS_DOCUMENTO } from "@/lib/categories";

export default function NuevaRendicion() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState(() => {
    const lastCategory = typeof window !== "undefined" ? localStorage.getItem("finty_last_category") || "" : "";
    return {
      date: new Date().toISOString().split("T")[0],
      category: lastCategory,
      description: "",
      amount: "",
      tipoDocumento: "",
      proveedor: "",
      numeroDocumento: "",
    };
  });
  const [receipt, setReceipt] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setReceipt(data.filename);
      if (file.type.startsWith("image/")) {
        setPreview(URL.createObjectURL(file));
      } else {
        setPreview(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir archivo");
    }
    setUploading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category) {
      setError("Selecciona una cuenta");
      return;
    }
    if (!form.amount || parseFloat(form.amount) <= 0) {
      setError("Ingresa un monto válido");
      return;
    }
    if (!form.tipoDocumento) {
      setError("Selecciona un tipo de documento");
      return;
    }
    if (!form.proveedor.trim()) {
      setError("Ingresa el proveedor");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, receipt }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      localStorage.setItem("finty_last_category", form.category);
      router.push("/app/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-lg mx-auto p-4">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Nueva Rendición</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Comprobante */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border">
            <label className="block text-sm font-medium text-gray-700 mb-3">Comprobante</label>

            {preview && (
              <div className="mb-3 relative">
                <img src={preview} alt="Comprobante" className="w-full rounded-xl max-h-48 object-cover" />
                <button
                  type="button"
                  onClick={() => { setReceipt(null); setPreview(null); }}
                  className="absolute top-2 right-2 bg-red-600 text-white w-7 h-7 rounded-full text-sm font-bold"
                >
                  x
                </button>
              </div>
            )}

            {receipt && !preview && (
              <div className="mb-3 bg-green-50 text-green-700 text-sm p-3 rounded-xl flex items-center justify-between">
                <span>PDF subido correctamente</span>
                <button type="button" onClick={() => setReceipt(null)} className="text-red-500 font-bold">x</button>
              </div>
            )}

            {!receipt && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={uploading}
                  className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed border-sky-300 rounded-xl text-sky-600 hover:bg-sky-50 transition-colors"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-xs font-medium">Tomar Foto</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="text-xs font-medium">Subir Archivo</span>
                </button>
              </div>
            )}

            {uploading && (
              <div className="mt-3 text-center text-sm text-gray-500">Subiendo archivo...</div>
            )}

            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
            <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={handleFileChange} className="hidden" />
          </div>

          {/* Monto */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border">
            <label className="block text-sm font-medium text-gray-700 mb-1">Monto ($)</label>
            <input
              type="text"
              inputMode="numeric"
              value={form.amount ? `$${Number(form.amount).toLocaleString("es-CL")}` : ""}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9]/g, "");
                setForm({ ...form, amount: raw });
              }}
              placeholder="$0"
              className="w-full text-3xl font-bold text-gray-900 py-2 border-b-2 border-gray-200 focus:border-sky-500 outline-none"
              required
            />
          </div>

          {/* Cuenta */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border">
            <label className="block text-sm font-medium text-gray-700 mb-3">Cuenta</label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setForm({ ...form, category: cat.value })}
                  className={`px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                    form.category === cat.value
                      ? "bg-sky-500 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tipo Documento y Proveedor */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Documento</label>
              <div className="grid grid-cols-2 gap-2">
                {TIPOS_DOCUMENTO.map((tipo) => (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => setForm({ ...form, tipoDocumento: tipo })}
                    className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      form.tipoDocumento === tipo
                        ? "bg-sky-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {tipo}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
              <input
                type="text"
                value={form.proveedor}
                onChange={(e) => setForm({ ...form, proveedor: e.target.value })}
                placeholder="Nombre del proveedor o comercio"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">N° Documento (opcional)</label>
              <input
                type="text"
                value={form.numeroDocumento}
                onChange={(e) => setForm({ ...form, numeroDocumento: e.target.value })}
                placeholder="Número de boleta o recibo"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none text-gray-900"
              />
            </div>
          </div>

          {/* Fecha y Descripción */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none text-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción (opcional)</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Ej: Taxi a reunión con cliente"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none text-gray-900"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl text-center">{error}</div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-sky-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-sky-600 transition-colors disabled:opacity-50 shadow-lg"
          >
            {saving ? "Guardando..." : "Guardar Rendición"}
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="w-full text-gray-500 py-2 text-sm"
          >
            Cancelar
          </button>
        </form>
      </main>
    </div>
  );
}
