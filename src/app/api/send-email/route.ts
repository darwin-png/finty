import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import PDFDocument from "pdfkit";
import { categoryLabels } from "@/lib/categories";

const resend = new Resend(process.env.RESEND_API_KEY);

function formatCLP(amount: number) {
  return `$${amount.toLocaleString("es-CL")}`;
}

async function generatePaymentPDF(
  orgName: string,
  user: { name: string },
  expenses: { date: Date; category: string; proveedor: string | null; tipoDocumento: string | null; amount: number }[],
  total: number,
  paymentRef: string,
  paidAt: Date
): Promise<Buffer> {
  const doc = new PDFDocument({ size: "LETTER", margin: 50 });
  const chunks: Buffer[] = [];

  doc.on("data", (chunk: Buffer) => chunks.push(chunk));

  const pdfPromise = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  doc.fontSize(20).font("Helvetica-Bold").text(orgName.toUpperCase(), { align: "center" });
  doc.fontSize(10).font("Helvetica").text("Comprobante de Pago de Rendiciones", { align: "center" });
  doc.moveDown(0.5);

  doc.moveTo(50, doc.y).lineTo(562, doc.y).stroke("#dc2626");
  doc.moveDown(0.5);

  doc.fontSize(10).font("Helvetica-Bold").text("Referencia: ", { continued: true });
  doc.font("Helvetica").text(paymentRef);
  doc.font("Helvetica-Bold").text("Fecha de Pago: ", { continued: true });
  doc.font("Helvetica").text(paidAt.toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric" }));
  doc.font("Helvetica-Bold").text("Colaborador: ", { continued: true });
  doc.font("Helvetica").text(user.name);
  doc.font("Helvetica-Bold").text("Total Pagado: ", { continued: true });
  doc.font("Helvetica").text(formatCLP(total));
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
    doc.text(formatCLP(exp.amount), col.monto, y, { width: 80, align: "right" });
    y += 14;
  }

  y += 5;
  doc.moveTo(50, y).lineTo(562, y).stroke("#e5e7eb");
  y += 8;
  doc.font("Helvetica-Bold").fontSize(10);
  doc.text("TOTAL:", col.tipoDoc, y, { width: 95 });
  doc.text(formatCLP(total), col.monto, y, { width: 80, align: "right" });

  y += 30;
  doc.font("Helvetica").fontSize(8).fillColor("#6b7280");
  doc.text(`Cantidad de rendiciones: ${expenses.length}`, 50, y);
  doc.text(`Documento generado el ${paidAt.toLocaleString("es-CL")}`, 50, y + 12);

  doc.end();
  return pdfPromise;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMINISTRADOR") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const orgId = session.user.organizationId;
  const orgName = session.user.organizationName || "Finty";
  const body = await req.json();
  const { userId, paymentRef } = body;

  if (!userId) {
    return NextResponse.json({ error: "userId requerido" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.organizationId !== orgId) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  if (!user.email) {
    return NextResponse.json({ error: "El usuario no tiene email configurado" }, { status: 400 });
  }

  const where: Record<string, unknown> = {
    userId,
    organizationId: orgId,
    status: "PAGADO" as const,
  };
  if (paymentRef) {
    where.paymentRef = paymentRef;
  }

  const expenses = await prisma.expense.findMany({
    where,
    orderBy: { date: "asc" },
  });

  if (expenses.length === 0) {
    return NextResponse.json({ error: "No hay rendiciones pagadas para enviar" }, { status: 400 });
  }

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const ref = paymentRef || expenses[0].paymentRef || "sin-ref";
  const paidAt = expenses[0].paidAt || new Date();

  try {
    const pdfBuffer = await generatePaymentPDF(orgName, user, expenses, total, ref, paidAt);

    await resend.emails.send({
      from: "noreply@finty.cl",
      to: user.email,
      subject: `Comprobante de Pago - ${ref}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">${orgName} - Comprobante de Pago</h2>
          <p>Hola <strong>${user.name}</strong>,</p>
          <p>Se ha procesado el pago de tus rendiciones de gastos.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background: #f3f4f6;">
              <td style="padding: 8px; font-weight: bold;">Referencia</td>
              <td style="padding: 8px;">${ref}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Fecha de Pago</td>
              <td style="padding: 8px;">${paidAt.toLocaleDateString("es-CL")}</td>
            </tr>
            <tr style="background: #f3f4f6;">
              <td style="padding: 8px; font-weight: bold;">Rendiciones</td>
              <td style="padding: 8px;">${expenses.length}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold; font-size: 18px;">Total Pagado</td>
              <td style="padding: 8px; font-weight: bold; font-size: 18px; color: #16a34a;">${formatCLP(total)}</td>
            </tr>
          </table>
          <p>Adjunto encontrarás el comprobante en PDF con el detalle completo.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #6b7280; font-size: 12px;">Este es un correo automático generado por ${orgName}.</p>
        </div>
      `,
      attachments: [
        {
          filename: `Pago_${user.name.replace(/\s/g, "_")}_${ref}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    return NextResponse.json({ success: true, message: `Comprobante enviado a ${user.email}` });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json({ error: "Error al enviar el correo" }, { status: 500 });
  }
}
