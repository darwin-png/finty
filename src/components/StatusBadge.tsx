const statusColors: Record<string, string> = {
  PENDIENTE: "bg-yellow-100 text-yellow-800",
  APROBADO: "bg-green-100 text-green-800",
  RECHAZADO: "bg-red-100 text-red-800",
  PAGADO: "bg-blue-100 text-blue-800",
};

const statusLabels: Record<string, string> = {
  PENDIENTE: "Pendiente",
  APROBADO: "Aprobado",
  RECHAZADO: "Rechazado",
  PAGADO: "Pagado",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || "bg-gray-100 text-gray-800"}`}>
      {statusLabels[status] || status}
    </span>
  );
}
