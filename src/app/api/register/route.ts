import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcryptjs from "bcryptjs";
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
  if (!base) return `org-${crypto.randomUUID().slice(0, 8)}`;

  // Try base slug first, then append random suffix until unique
  let slug = base;
  let attempts = 0;
  while (attempts < 5) {
    const existing = await prisma.organization.findUnique({ where: { slug } });
    if (!existing) return slug;
    slug = `${base}-${crypto.randomUUID().slice(0, 6)}`;
    attempts++;
  }
  // Fallback: full UUID guarantees uniqueness
  return `${base}-${crypto.randomUUID()}`;
}

export async function POST(req: NextRequest) {
  // Registration is now restricted to SUPERADMIN creating new organizations
  // Public registration is disabled for SaaS security
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "El registro de organizaciones es privado. Contacte al administrador." }, { status: 403 });
  }

  const body = await req.json();
  const { orgName, name, username, password } = body;

  if (!orgName || !name || !username || !password) {
    return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });
  }

  // Note: Username uniqueness is now per-organization, so we don't need to check globally
  // The constraint will be validated when creating the user within the organization

  const slug = await generateUniqueSlug(orgName);
  const hashedPassword = await bcryptjs.hash(password, 10);

  try {
    // Transaction: both org and user are created atomically
    // If user creation fails, org creation is rolled back
    const result = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: orgName,
          slug,
          plan: "FREE",
        },
      });

      const user = await tx.user.create({
        data: {
          username,
          password: hashedPassword,
          name,
          role: "ADMINISTRADOR",
          organizationId: org.id,
        },
      });

      return { org, user };
    });

    return NextResponse.json({ success: true, slug: result.org.slug });
  } catch (error: unknown) {
    console.error("Error registering:", error);

    // Handle unique constraint violations (race condition on username or slug)
    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as { code: string; meta?: { target?: string[] } };
      if (prismaError.code === "P2002") {
        const target = prismaError.meta?.target;
        if (target?.includes("username")) {
          return NextResponse.json({ error: "El usuario ya existe" }, { status: 400 });
        }
        if (target?.includes("slug")) {
          return NextResponse.json({ error: "Error al crear la organización. Intenta de nuevo." }, { status: 400 });
        }
      }
    }

    return NextResponse.json({ error: "Error al crear la cuenta" }, { status: 500 });
  }
}
