import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default defineEventHandler(async (event: any) => {
  const id = parseInt(event.context.params.id);
  return await prisma.note.delete({ where: { id } });
});
