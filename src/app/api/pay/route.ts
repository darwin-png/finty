import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PDFDocument from "pdfkit";
import { categoryLabels } from "@/lib/categories";
import { logExpenseAction } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMINISTRADOR") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const orgId = session.user.organizationId;
  const body = await req.json();
  const { userId } = body;

  if (!userId) {
    return NextResponse.json({ error: "userId requerido" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.organizationId !== orgId) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  const expenses = await prisma.expense.findMany({
    where: { userId, organizationId: orgId, status: "APROBADO" },
    orderBy: { date: "asc" },
  });

  if (expenses.length === 0) {
    return NextResponse.json({ error: "No hay gastos aprobados para pagar" }, { status: 400 });
  }

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const paymentRef = `PAG-${Date.now()}`;
  const now = new Date();

  try {
  const doc = new PDFDocument({ size: "LETTER", margin: 50 });
  const chunks: Buffer[] = [];

  doc.on("data", (chunk: Buffer) => chunks.push(chunk));

  const pdfPromise = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  // Header - use org name
  const orgName = session.user.organizationName || "Finty";
  doc.fontSize(20).font("Helvetica-Bold").text(orgName.toUpperCase(), { align: "center" });
  doc.fontSize(10).font("Helvetica").text("Comprobante de Pago de Rendiciones", { align: "center" });
  doc.moveDown(0.5);

  doc.moveTo(50, doc.y).lineTo(562, doc.y).stroke("#4A90D9");
  doc.moveDown(0.5);

  doc.fontSize(10).font("Helvetica-Bold").text("Referencia: ", { continued: true });
  doc.font("Helvetica").text(paymentRef);
  doc.font("Helvetica-Bold").text("Fecha de Pago: ", { continued: true });
  doc.font("Helvetica").text(now.toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric" }));
  doc.font("Helvetica-Bold").text("Colaborador: ", { continued: true });
  doc.font("Helvetica").text(user.name);
  doc.font("Helvetica-Bold").text("Total a Pagar: ", { continued: true });
  doc.font("Helvetica").text(`$${total.toLocaleString("es-CL")}`);
  doc.moveDown();

  const tableTop = doc.y;
  const col = { fecha: 50, cuenta: 130, proveedor: 250, tipoDoc: 370, monto: 470 };

  doc.fontSize(8).font("Helvetica-Bold");
  doc.rect(50, tableTop - 3, 512, 16).fill("#f3f4f6");
  doc.fillColor("#374151");
  doc.text("Fecha", col.fecha, tableTop, { width: 75 });
  doc.text("Cuenta", col.cuenta, tableTop, { width: 115 });
  doc.text("Proveedor", col.proveedor, tableTop, { width: 115 });
  doc.text("Tipo Doc", col.tipoDoc, tableTop, { width: 95 });
  doc.text("Monto", col.monto, tableTop, { width: 80, align: "right" });

  let y = tableTop + 18;
  doc.font("Helvetica").fontSize(8).fillColor("#111827");

  for (const exp of expenses) {
    if (y > 700) {
      doc.addPage();
      y = 50;
    }

    const fecha = new Date(exp.date).toLocaleDateString("es-CL");
    doc.text(fecha, col.fecha, y, { width: 75 });
    doc.text(categoryLabels[exp.category] || exp.category, col.cuenta, y, { width: 115 });
    doc.text(exp.proveedor || "—", col.proveedor, y, { width: 115 });
    doc.text(exp.tipoDocumento || "—", col.tipoDoc, y, { width: 95 });
    doc.text(`$${exp.amount.toLocaleString("es-CL")}`, col.monto, y, { width: 80, align: "right" });

    y += 14;
  }

  y += 5;
  doc.moveTo(50, y).lineTo(562, y).stroke("#e5e7eb");
  y += 8;
  doc.font("Helvetica-Bold").fontSize(10);
  doc.text("TOTAL:", col.tipoDoc, y, { width: 95 });
  doc.text(`$${total.toLocaleString("es-CL")}`, col.monto, y, { width: 80, align: "right" });

  y += 30;
  doc.font("Helvetica").fontSize(8).fillColor("#6b7280");
  doc.text(`Cantidad de rendiciones: ${expenses.length}`, 50, y);
  doc.text(`Documento generado el ${now.toLocaleString("es-CL")}`, 50, y + 12);

  doc.end();
  const pdfBuffer = await pdfPromise;

  await prisma.expense.updateMany({
    where: {
      userId,
      organizationId: orgId,
      status: "APROBADO",
    },
    data: {
      status: "PAGADO",
      paidAt: now,
      paymentRef,
    },
  });

  // Audit log for each paid expense
  for (const exp of expenses) {
    logExpenseAction(exp.id, "PAID", session.user.id);
  }

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=Pago_${user.name.replace(/\s/g, "_")}_${paymentRef}.pdf`,
    },
  });
  } catch (error) {
    console.error("Error generating payment PDF:", error);
    return NextResponse.json({ error: "Error al generar comprobante de pago" }, { status: 500 });
  }
}
