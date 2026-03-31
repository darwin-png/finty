import nodemailer from "nodemailer";
import { categoryLabels } from "./categories";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function formatCLP(amount: number) {
  return `$${amount.toLocaleString("es-CL")}`;
}

export async function sendStatusNotification(
  userEmail: string,
  userName: string,
  status: "APROBADO" | "RECHAZADO",
  expense: { category: string; amount: number; date: Date; description: string | null },
  comment?: string | null
) {
  if (!process.env.SMTP_USER || !userEmail) return;

  const isApproved = status === "APROBADO";
  const statusText = isApproved ? "Aprobada" : "Rechazada";
  const color = isApproved ? "#16a34a" : "#dc2626";
  const fecha = new Date(expense.date).toLocaleDateString("es-CL");

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: userEmail,
      subject: `Rendición ${statusText} - ${categoryLabels[expense.category] || expense.category} ${formatCLP(expense.amount)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4A90D9;">Finty</h2>
          <p>Hola <strong>${userName}</strong>,</p>
          <p>Tu rendición ha sido <strong style="color: ${color};">${statusText.toLowerCase()}</strong>.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background: #f3f4f6;">
              <td style="padding: 8px; font-weight: bold;">Cuenta</td>
              <td style="padding: 8px;">${categoryLabels[expense.category] || expense.category}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Monto</td>
              <td style="padding: 8px; font-weight: bold; font-size: 18px;">${formatCLP(expense.amount)}</td>
            </tr>
            <tr style="background: #f3f4f6;">
              <td style="padding: 8px; font-weight: bold;">Fecha</td>
              <td style="padding: 8px;">${fecha}</td>
            </tr>
            ${expense.description ? `<tr><td style="padding: 8px; font-weight: bold;">Descripción</td><td style="padding: 8px;">${expense.description}</td></tr>` : ""}
            ${comment ? `<tr style="background: #fef2f2;"><td style="padding: 8px; font-weight: bold; color: #dc2626;">Motivo</td><td style="padding: 8px; color: #dc2626;">${comment}</td></tr>` : ""}
          </table>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #6b7280; font-size: 12px;">Este es un correo automático.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Error sending status notification:", error);
  }
}
