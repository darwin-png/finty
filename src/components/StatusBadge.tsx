const statusConfig: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  PENDIENTE: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400", border: "border-amber-200" },
  APROBADO: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-400", border: "border-green-200" },
  RECHAZADO: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-400", border: "border-red-200" },
  PAGADO: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400", border: "border-blue-200" },
};

const statusLabels: Record<string, string> = {
  PENDIENTE: "Pendiente",
  APROBADO: "Aprobado",
  RECHAZADO: "Rechazado",
  PAGADO: "Pagado",
};

export default function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || { bg: "bg-slate-50", text: "text-slate-700", dot: "bg-slate-400", border: "border-slate-200" };

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`}></span>
      {statusLabels[status] || status}
    </span>
  );
}
