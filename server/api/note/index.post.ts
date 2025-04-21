import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const note = await prisma.note.create({
    data: {
      header: body.header,
      content: body.content,
      image: body.image ?? null,
    },
  });
  return note;
});
