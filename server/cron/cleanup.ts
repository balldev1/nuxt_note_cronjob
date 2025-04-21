import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

// ทำงานทุกวันอาทิตย์ เวลา 00:00
cron.schedule("0 0 * * 0", async () => {
  try {
    const allNotes = await prisma.note.findMany();

    if (allNotes.length === 0) {
      console.log("📭 ไม่มีโน้ตให้ลบ");
      return;
    }

    for (const note of allNotes) {
      if (note.image) {
        const imagePath = path.join(process.cwd(), "public", note.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log(`🧹 ลบรูปภาพ: ${note.image}`);
        } else {
          console.warn(`⚠️ ไม่พบรูปภาพ: ${note.image}`);
        }
      }

      await prisma.note.delete({
        where: { id: note.id },
      });
      console.log(`✅ ลบโน้ต id: ${note.id}`);
    }
  } catch (err) {
    console.error("❌ ลบโน้ตล้มเหลว:", err);
  }
});
