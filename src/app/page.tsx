import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* ─── Navbar ─── */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/"><Image src="/logo.png" alt="Finty" width={240} height={80} className="h-14 sm:h-[68px] w-auto" /></Link>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#como-funciona" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Cómo Funciona</a>
              <a href="#funciones" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Funciones</a>
              <a href="#planes" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Planes</a>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium">Iniciar Sesión</Link>
            <Link href="/register" className="text-sm bg-[#4A90D9] text-white px-5 py-2.5 rounded-lg hover:bg-[#3A7BC8] font-semibold transition-colors shadow-sm">
              Prueba Gratis
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="pt-28 sm:pt-36 pb-20 px-4 sm:px-6 bg-gradient-to-b from-sky-50/50 to-white">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-block bg-blue-100 text-[#3A7BC8] text-xs font-bold px-3 py-1.5 rounded-full mb-6 uppercase tracking-wide">
            Rendición de gastos 100% digital
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight">
            Rendiciones de gastos{" "}
            <span className="text-[#4A90D9]">en segundos</span>,<br className="hidden sm:block" />
            no en horas
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Tus colaboradores registran gastos desde el celular. Tú apruebas, pagas y exportas con un clic. Deja atrás las planillas y los papeles.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="bg-[#4A90D9] text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-[#3A7BC8] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
              Comienza Gratis
            </Link>
            <a href="#como-funciona" className="border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-xl text-lg font-medium hover:border-gray-300 hover:bg-gray-50 transition-all">
              Ver cómo funciona
            </a>
          </div>
          <p className="mt-4 text-sm text-gray-400">Sin tarjeta de crédito. Activo en 30 segundos.</p>
        </div>
      </section>

      {/* ─── Logos / Social proof ─── */}
      <section className="py-12 border-y border-gray-100 bg-gray-50/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm text-gray-500 font-medium mb-6">Empresas que confían en Finty para gestionar sus gastos</p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-60">
            <span className="text-lg font-bold text-gray-400">Tu Empresa</span>
            <span className="text-lg font-bold text-gray-400">Constructora ABC</span>
            <span className="text-lg font-bold text-gray-400">Asesorías XYZ</span>
            <span className="text-lg font-bold text-gray-400">Eventos Pro</span>
            <span className="text-lg font-bold text-gray-400">Logística Sur</span>
          </div>
        </div>
      </section>

      {/* ─── Cómo Funciona ─── */}
      <section id="como-funciona" className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Así de simple funciona</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">Tres pasos para dejar de perder tiempo con rendiciones de gastos.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {/* Paso 1 */}
            <div className="relative">
              <div className="w-14 h-14 bg-[#4A90D9] text-white rounded-2xl flex items-center justify-center text-xl font-bold mb-5 shadow-lg shadow-[#B3D4F0]">1</div>
              <h3 className="text-xl font-bold mb-3">Registra</h3>
              <p className="text-gray-600 leading-relaxed">
                El colaborador saca una foto a la boleta desde su celular, ingresa el monto y la categoría. Listo, en 15 segundos.
              </p>
              <div className="mt-4 bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <svg className="w-5 h-5 text-[#5BA0E5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
                  Foto del comprobante
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500 mt-2">
                  <svg className="w-5 h-5 text-[#5BA0E5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Monto + categoría
                </div>
              </div>
            </div>
            {/* Paso 2 */}
            <div className="relative">
              <div className="w-14 h-14 bg-[#4A90D9] text-white rounded-2xl flex items-center justify-center text-xl font-bold mb-5 shadow-lg shadow-[#B3D4F0]">2</div>
              <h3 className="text-xl font-bold mb-3">Aprueba</h3>
              <p className="text-gray-600 leading-relaxed">
                El administrador revisa cada rendición y aprueba o rechaza con un clic. Si rechaza, el colaborador recibe el motivo por email.
              </p>
              <div className="mt-4 bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Aprobación en un clic
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500 mt-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  Notificación automática
                </div>
              </div>
            </div>
            {/* Paso 3 */}
            <div className="relative">
              <div className="w-14 h-14 bg-[#4A90D9] text-white rounded-2xl flex items-center justify-center text-xl font-bold mb-5 shadow-lg shadow-[#B3D4F0]">3</div>
              <h3 className="text-xl font-bold mb-3">Paga y Exporta</h3>
              <p className="text-gray-600 leading-relaxed">
                Procesa el pago, genera el comprobante PDF automático y exporta a Excel o al formato Chipax para tu contabilidad.
              </p>
              <div className="mt-4 bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                  PDF de comprobante
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500 mt-2">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Excel, CSV y Chipax
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Funciones ─── */}
      <section id="funciones" className="py-20 sm:py-28 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Todo lo que necesitas para controlar gastos</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">Funciones diseñadas para empresas en Chile que quieren orden y visibilidad en sus rendiciones.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z",
                title: "Registro desde el celular",
                desc: "App web optimizada para móvil (PWA). Toma la foto de la boleta, ingresa el monto y listo. Funciona offline.",
              },
              {
                icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
                title: "Aprobación en un clic",
                desc: "Panel de administración para revisar, aprobar o rechazar rendiciones. Con motivo de rechazo personalizado.",
              },
              {
                icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z",
                title: "Pagos con comprobante PDF",
                desc: "Procesa pagos masivos por colaborador. Genera comprobante PDF automático con detalle de cada rendición.",
              },
              {
                icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
                title: "Reportes en tiempo real",
                desc: "Gastos por usuario, categoría y mes con gráficos. Visibilidad total de dónde se va el dinero de tu empresa.",
              },
              {
                icon: "M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
                title: "Exportación Excel y Chipax",
                desc: "Descarga tus rendiciones en Excel, CSV o en el formato exacto de importación de Chipax para tu contabilidad.",
              },
              {
                icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
                title: "Notificaciones por email",
                desc: "Los colaboradores reciben email automático al aprobar, rechazar o pagar sus rendiciones. Transparencia total.",
              },
              {
                icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
                title: "Multi-empresa",
                desc: "Cada empresa tiene su propio espacio aislado. Usuarios, datos y configuración 100% independientes.",
              },
              {
                icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
                title: "Seguridad y control",
                desc: "Roles de administrador y colaborador. Cada usuario solo ve sus propios gastos. Datos encriptados.",
              },
              {
                icon: "M13 10V3L4 14h7v7l9-11h-7z",
                title: "Rápido de implementar",
                desc: "Crea tu cuenta en 30 segundos. Agrega colaboradores y empieza a recibir rendiciones hoy mismo.",
              },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#B3D4F0] hover:shadow-md transition-all group">
                <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                  <svg className="w-5 h-5 text-[#4A90D9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={f.icon} />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Beneficios ─── */}
      <section className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                Deja de perseguir boletas.<br />
                <span className="text-[#4A90D9]">Dedícate a lo que importa.</span>
              </h2>
              <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                Las empresas en Chile pierden en promedio 5 horas semanales gestionando rendiciones de gastos con planillas Excel. Con Finty, ese tiempo se reduce a minutos.
              </p>
              <div className="mt-8 space-y-5">
                {[
                  { stat: "90%", text: "menos tiempo en rendiciones" },
                  { stat: "100%", text: "de las boletas digitalizadas" },
                  { stat: "0", text: "planillas Excel necesarias" },
                ].map((b) => (
                  <div key={b.text} className="flex items-center gap-4">
                    <div className="text-2xl font-extrabold text-[#4A90D9] w-16">{b.stat}</div>
                    <div className="text-gray-700">{b.text}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-sky-50 to-sky-100 rounded-3xl p-8 sm:p-12">
              <div className="bg-white rounded-2xl shadow-xl p-6 border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#4A90D9] rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Rendición aprobada</div>
                    <div className="text-xs text-gray-500">Hace 2 minutos</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Colaborador</span><span className="font-medium">María González</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Monto</span><span className="font-bold text-green-600">$45.000</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Cuenta</span><span className="font-medium">Alimentación</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Estado</span><span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-bold">Aprobado</span></div>
                </div>
              </div>
              <div className="mt-4 bg-white rounded-2xl shadow-lg p-4 border opacity-75 -rotate-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center"><svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8" /></svg></div>
                    <span className="text-sm text-gray-500">Email enviado a María</span>
                  </div>
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Planes ─── */}
      <section id="planes" className="py-20 sm:py-28 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Planes simples, sin letra chica</h2>
            <p className="mt-4 text-lg text-gray-600">Comienza gratis hoy. Escala cuando tu empresa lo necesite.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Free */}
            <div className="bg-white rounded-3xl p-8 sm:p-10 border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-sm font-bold text-gray-500 uppercase tracking-wide">Gratis</div>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-5xl font-extrabold text-gray-900">$0</span>
                <span className="text-gray-400 text-lg">/mes</span>
              </div>
              <p className="mt-3 text-gray-600">Para equipos pequeños que quieren empezar a ordenar sus gastos.</p>
              <div className="mt-8 space-y-4">
                {[
                  { text: "Hasta 2 usuarios", included: true },
                  { text: "50 rendiciones por mes", included: true },
                  { text: "Registro desde celular (PWA)", included: true },
                  { text: "Aprobación de gastos", included: true },
                  { text: "Reportes básicos", included: true },
                  { text: "Comprobantes PDF", included: false },
                  { text: "Exportación Excel/Chipax", included: false },
                  { text: "Notificaciones por email", included: false },
                  { text: "Soporte prioritario", included: false },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3">
                    {item.included ? (
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <svg className="w-5 h-5 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    )}
                    <span className={`text-sm ${item.included ? "text-gray-700" : "text-gray-400"}`}>{item.text}</span>
                  </div>
                ))}
              </div>
              <Link href="/register" className="mt-10 block text-center bg-gray-900 text-white py-3.5 rounded-xl font-semibold hover:bg-gray-800 transition-colors text-sm">
                Comenzar Gratis
              </Link>
            </div>

            {/* Full */}
            <div className="bg-white rounded-3xl p-8 sm:p-10 border-2 border-[#4A90D9] shadow-xl relative hover:shadow-2xl transition-shadow">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#4A90D9] text-white text-xs px-4 py-1.5 rounded-full font-bold uppercase tracking-wide shadow-lg">
                Más Popular
              </div>
              <div className="text-sm font-bold text-[#4A90D9] uppercase tracking-wide">Completo</div>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-5xl font-extrabold text-gray-900">$29.990</span>
                <span className="text-gray-400 text-lg">/mes</span>
              </div>
              <p className="mt-3 text-gray-600">Para empresas que necesitan el control total de sus rendiciones.</p>
              <div className="mt-8 space-y-4">
                {[
                  "Usuarios ilimitados",
                  "Rendiciones ilimitadas",
                  "Registro desde celular (PWA)",
                  "Aprobación de gastos",
                  "Reportes completos",
                  "Comprobantes PDF automáticos",
                  "Exportación Excel, CSV y Chipax",
                  "Notificaciones por email",
                  "Soporte prioritario",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    <span className="text-sm text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/register?plan=full" className="mt-10 block text-center bg-[#4A90D9] text-white py-3.5 rounded-xl font-bold hover:bg-[#3A7BC8] transition-colors shadow-md hover:shadow-lg text-sm">
                Comenzar Ahora
              </Link>
            </div>
          </div>
          <p className="text-center text-sm text-gray-400 mt-8">Todos los precios en pesos chilenos (CLP). Puedes cambiar de plan en cualquier momento.</p>
        </div>
      </section>

      {/* ─── Testimonial ─── */}
      <section className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-[#4A90D9] to-[#3A7BC8] rounded-3xl p-8 sm:p-12 text-white text-center shadow-2xl">
            <svg className="w-10 h-10 mx-auto mb-6 opacity-40" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
            <blockquote className="text-xl sm:text-2xl font-medium leading-relaxed mb-6">
              Antes gastábamos medio día cada semana juntando boletas y actualizando planillas. Con Finty todo llega digitalizado y listo para aprobar.
            </blockquote>
            <div className="text-blue-200 font-medium">
              Administrador de operaciones
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA Final ─── */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 bg-gray-900 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Prueba Finty gratis hoy
          </h2>
          <p className="mt-4 text-lg text-gray-400 leading-relaxed">
            Rendiciones de gastos 100% digitales. Crea tu cuenta en 30 segundos, agrega a tu equipo y empieza a recibir rendiciones hoy.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="bg-[#4A90D9] text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-[#5BA0E5] transition-all shadow-lg">
              Crear Cuenta Gratis
            </Link>
            <Link href="/login" className="border-2 border-gray-600 text-gray-300 px-8 py-4 rounded-xl text-lg font-medium hover:border-gray-500 hover:text-white transition-all">
              Ya tengo cuenta
            </Link>
          </div>
          <p className="mt-5 text-sm text-gray-500">Sin tarjeta de crédito. Sin compromiso. Cancela cuando quieras.</p>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-white text-gray-500 py-12 px-4 sm:px-6 border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-4 gap-8 mb-10">
            <div>
              <Image src="/logo.png" alt="Finty" width={200} height={64} className="h-14 w-auto" />
              <p className="mt-2 text-sm leading-relaxed">Sistema de rendición de gastos para empresas en Chile y Latinoamérica.</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-700 text-sm mb-3 uppercase tracking-wide">Producto</h4>
              <div className="space-y-2 text-sm">
                <a href="#funciones" className="block hover:text-gray-900 transition-colors">Funciones</a>
                <a href="#planes" className="block hover:text-gray-900 transition-colors">Planes y Precios</a>
                <a href="#como-funciona" className="block hover:text-gray-900 transition-colors">Cómo Funciona</a>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-gray-700 text-sm mb-3 uppercase tracking-wide">Cuenta</h4>
              <div className="space-y-2 text-sm">
                <Link href="/register" className="block hover:text-gray-900 transition-colors">Crear Cuenta</Link>
                <Link href="/login" className="block hover:text-gray-900 transition-colors">Iniciar Sesión</Link>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-gray-700 text-sm mb-3 uppercase tracking-wide">Legal</h4>
              <div className="space-y-2 text-sm">
                <a href="#" className="block hover:text-gray-900 transition-colors">Términos de Servicio</a>
                <a href="#" className="block hover:text-gray-900 transition-colors">Política de Privacidad</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs">© 2025 Finty. Todos los derechos reservados.</span>
            <span className="text-xs">Hecho en Chile</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
