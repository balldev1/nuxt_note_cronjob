import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default defineEventHandler(async (event: any) => {
  const id = parseInt(event.context.params.id);
  const body = await readBody(event);

  return await prisma.note.update({
    where: { id },
    data: {
      header: body.header,
      content: body.content,
      image: body.image ?? null,
    },
  });
});
