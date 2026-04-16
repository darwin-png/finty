import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function generateUniqueSlug(baseName: string): Promise<string> {
  const base = slugify(baseName);
  for (let i = 0; i < 5; i++) {
    const slug = i === 0 ? base : `${base}-${crypto.randomBytes(3).toString("hex")}`;
    const existing = await prisma.organization.findUnique({ where: { slug } });
    if (!existing) return slug;
  }
  return `${base}-${crypto.randomBytes(4).toString("hex")}`;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const orgs = await prisma.organization.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { users: true, expenses: true } },
    },
  });

  return NextResponse.json(orgs);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { name, plan } = await req.json();

  if (!name?.trim()) {
    return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
  }

  const slug = await generateUniqueSlug(name);
  const org = await prisma.organization.create({
    data: {
      name: name.trim(),
      slug,
      plan: plan === "FULL" ? "FULL" : "FREE",
    },
    include: { _count: { select: { users: true, expenses: true } } },
  });

  return NextResponse.json(org, { status: 201 });
}
