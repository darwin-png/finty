import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const { username, email } = await req.json();

  if (!username || !email) {
    return NextResponse.json({ error: "Usuario y email son requeridos" }, { status: 400 });
  }

  // Always return success to avoid user enumeration
  const successResponse = NextResponse.json({
    message: "Si los datos coinciden, recibirás un correo con tu nueva contraseña temporal.",
  });

  const user = await prisma.user.findUnique({
    where: { username },
    include: { organization: true },
  });

  if (!user || !user.active || !user.email) return successResponse;
  if (user.email.toLowerCase() !== email.toLowerCase()) return successResponse;
  if (!user.organization.active) return successResponse;

  // Generate temporary password
  const tempPassword = crypto.randomBytes(4).toString("hex"); // 8 chars hex
  const bcryptjs = await import("bcryptjs");
  const hashed = await bcryptjs.hash(tempPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed },
  });

  // Send email via Resend
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
      await resend.emails.send({
        from: "noreply@finty.cl",
        to: user.email,
        subject: "Finty - Recuperación de contraseña",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4A90D9;">Finty</h2>
            <p>Hola <strong>${user.name}</strong>,</p>
            <p>Recibimos una solicitud para restablecer tu contraseña.</p>
            <p>Tu nueva contraseña temporal es:</p>
            <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <span style="font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #1f2937;">${tempPassword}</span>
            </div>
            <p>Por seguridad, te recomendamos cambiarla una vez que inicies sesión.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="color: #6b7280; font-size: 12px;">Si no solicitaste este cambio, contacta a tu administrador.</p>
          </div>
        `,
      });
    } catch (error) {
      console.error("Error sending password reset email:", error);
    }
  }

  return successResponse;
}
