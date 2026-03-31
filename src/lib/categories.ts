export const categoryLabels: Record<string, string> = {
  "Bencina": "Bencina",
  "Gastos Generales": "Gastos Generales",
  "Mercadería - Productos": "Mercadería - Productos",
  "Viáticos Comerciales": "Viáticos Comerciales",
  "Viáticos Logísticos": "Viáticos Logísticos",
};

export const categories = Object.entries(categoryLabels).map(([value, label]) => ({
  value,
  label,
}));

export const TIPOS_DOCUMENTO = ["Boleta", "Recibo"];

export function formatCLP(amount: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
