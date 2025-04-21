import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default defineEventHandler(async () => {
  return await prisma.note.findMany({
    orderBy: { createdAt: "desc" },
  });
});
