import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import bcryptjs from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const password = await bcryptjs.hash("123456", 10);

  // Create or find Finty organization
  const org = await prisma.organization.upsert({
    where: { slug: "finty" },
    update: {},
    create: {
      name: "Finty",
      slug: "finty",
      plan: "FULL",
    },
  });

  // Create admin user linked to org
  await prisma.user.upsert({
    where: { username: "admin" },
    update: { organizationId: org.id },
    create: {
      username: "admin",
      password,
      name: "Administrador",
      role: "ADMINISTRADOR",
      organizationId: org.id,
    },
  });

  console.log("Seed completed: Finty org + admin user created (password: 123456)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
