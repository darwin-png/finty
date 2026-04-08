import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function GET() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "RESEND_API_KEY missing" }, { status: 500 });
  }

  const resend = new Resend(apiKey);

  const result = await resend.emails.send({
    from: "noreply@finty.cl",
    to: "darwin@emergenza.cl",
    subject: "Finty - Test email diagnóstico",
    html: "<p>Test de diagnóstico. Si ves este email, Resend está funcionando.</p>",
  });

  return NextResponse.json({
    apiKeyLength: apiKey.length,
    apiKeyPrefix: apiKey.substring(0, 8),
    result,
  });
}
