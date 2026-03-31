import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";
import { categoryLabels } from "@/lib/categories";

const statusLabels: Record<string, string> = {
  PENDIENTE: "Pendiente",
  APROBADO: "Aprobado",
  RECHAZADO: "Rechazado",
};

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMINISTRADOR") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const orgId = session.user.organizationId;
  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") || "xlsx";
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: Record<string, unknown> = { organizationId: orgId };
  if (from || to) {
    where.date = {};
    if (from) (where.date as Record<string, Date>).gte = new Date(from);
    if (to) (where.date as Record<string, Date>).lte = new Date(to + "T23:59:59");
  }

  const expenses = await prisma.expense.findMany({
    where,
    include: { user: { select: { name: true, username: true } } },
    orderBy: { date: "desc" },
  });

  // Formato Chipax
  if (format === "chipax") {
    const wb = XLSX.utils.book_new();

    const headerRows = [
      ["Plantilla para importar Gastos a Chipax"],
      ["Ingresa montos sin fórmulas ni formato (puntos ni comas) para que Chipax importe los datos correctamente."],
      ["Máximo 100 registros"],
      ["* Campos obligatorios."],
      [],
      [
        "Fecha (AAAA-MM-DD) *",
        "Periodo Clasificación (AAAA-MM) *",
        "Cuenta *",
        "Línea de Negocio *",
        "Responsable *",
        "Tipo de Documento *",
        "Proveedor *",
        "Número de Documento",
        "Descripción *",
        "Monto *",
        "Moneda *",
      ],
    ];

    const dataRows = expenses.map((exp) => {
      const dateObj = new Date(exp.date);
      const fecha = dateObj.toISOString().split("T")[0];
      const periodo = fecha.slice(0, 7);

      return [
        fecha,
        periodo,
        exp.category,
        exp.lineaNegocio || "Público",
        exp.user.name,
        exp.tipoDocumento || "",
        exp.proveedor || "",
        exp.numeroDocumento || "",
        exp.description || exp.category,
        exp.amount,
        exp.moneda || "CLP",
      ];
    });

    const allRows = [...headerRows, ...dataRows];
    const ws = XLSX.utils.aoa_to_sheet(allRows);

    ws["!cols"] = [
      { wch: 18 }, { wch: 18 }, { wch: 22 }, { wch: 18 }, { wch: 18 },
      { wch: 18 }, { wch: 20 }, { wch: 18 }, { wch: 30 }, { wch: 12 }, { wch: 10 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Worksheet");

    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=Importar_Gastos_Chipax.xlsx",
      },
    });
  }

  // Formato estándar
  const data = expenses.map((exp) => ({
    Usuario: exp.user.name,
    Fecha: new Date(exp.date).toLocaleDateString("es-CL"),
    Categoría: categoryLabels[exp.category] || exp.category,
    Descripción: exp.description || "",
    Monto: exp.amount,
    Estado: statusLabels[exp.status] || exp.status,
    Comentario: exp.comment || "",
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Rendiciones");

  if (format === "csv") {
    const csv = XLSX.utils.sheet_to_csv(ws);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=rendiciones.csv",
      },
    });
  }

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=rendiciones.xlsx",
    },
  });
}
