import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export default defineEventHandler(async () => {
  try {
    const allNotes = await prisma.note.findMany();

    if (allNotes.length === 0) {
      console.log("📭 ไม่มีโน้ตให้ลบ");
      return { message: "ไม่มีโน้ตให้ลบ" };
    }

    for (const note of allNotes) {
      if (note.image) {
        const imagePath = path.join(process.cwd(), "public", note.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log(`🧹 ลบรูปภาพ: ${note.image}`);
        }
      }

      await prisma.note.delete({ where: { id: note.id } });
      console.log(`✅ ลบโน้ต id: ${note.id}`);
    }

    return { message: "ลบโน้ตเรียบร้อยแล้ว" };
  } catch (err) {
    console.error("❌ ลบโน้ตล้มเหลว:", err);
    return { error: "ลบโน้ตล้มเหลว" };
  }
});
