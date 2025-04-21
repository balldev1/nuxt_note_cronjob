import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

// ไว้ทดสอบ cronjob
// cron.schedule("*/5 * * * * *", () => {
//   console.log("⏳ Cronjob ทำงานทุก 5 วินาที");
// });

cron.schedule("0 0 */7 * *", async () => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  try {
    const oldNotes = await prisma.note.findMany({
      where: {
        createdAt: {
          lt: sevenDaysAgo,
        },
      },
    });

    for (const note of oldNotes) {
      if (note.image) {
        // ลบไฟล์ภาพที่อยู่ใน public
        const imagePath = path.join(process.cwd(), "public", note.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log(`🧹 ลบรูปภาพ: ${note.image}`);
        } else {
          console.warn(`⚠️ ไม่พบรูปภาพ: ${note.image}`);
        }
      }

      // ลบข้อมูล Note จาก DB
      await prisma.note.delete({
        where: {
          id: note.id,
        },
      });
      console.log(`✅ ลบโน้ต id: ${note.id}`);
    }
  } catch (err) {
    console.error("❌ ลบโน้ตเก่าล้มเหลว:", err);
  }
});
