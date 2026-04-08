import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { v4 as uuid } from "uuid";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
];

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de archivo no permitido. Use PDF, JPG, JPEG, PNG o WEBP" },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "El archivo no puede superar 10MB" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileId = uuid();

    // Create a placeholder expense to store the file, then update receipt field
    // Instead, store in a temp table or directly. Since we have receiptData on Expense,
    // we'll create a temporary holding approach: return the base64 + mime for the client
    // to send back during expense creation.
    const base64 = buffer.toString("base64");

    return NextResponse.json({
      filename: `/api/files/${fileId}`,
      receiptBase64: base64,
      receiptMime: file.type,
    });
  } catch {
    return NextResponse.json({ error: "Error al subir archivo" }, { status: 500 });
  }
}
