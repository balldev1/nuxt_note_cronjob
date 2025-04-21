import { promises as fs } from "fs";
import path from "path";
import sharp from "sharp"; // Import sharp

// ฟังก์ชันเพื่อหาจำนวนไฟล์ล่าสุดในโฟลเดอร์
const getNextFileNumber = async () => {
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  const files = await fs.readdir(uploadDir);

  // หาชื่อไฟล์ที่ลงท้ายด้วย .webp
  const webpFiles = files.filter((file) => file.endsWith(".webp"));

  // ถ้าไม่มีไฟล์เว็บพีเลย ให้เริ่มต้นที่ 1
  if (webpFiles.length === 0) return 1;

  // หาไฟล์ที่มีตัวเลขในชื่อ
  const numbers = webpFiles.map((file) => {
    const match = file.match(/^(\d+)/); // หาค่าตัวเลขที่อยู่ข้างหน้าไฟล์
    return match ? parseInt(match[1], 10) : 0;
  });

  // ส่งคืนหมายเลขถัดไป
  return Math.max(...numbers) + 1;
};

export default defineEventHandler(async (event) => {
  // อ่านข้อมูลที่อัปโหลดจากฟอร์ม
  const formData = await readMultipartFormData(event);

  // ค้นหาไฟล์ที่มีชื่อว่า "image"
  const image = formData?.find((field) => field.name === "image");
  if (!image || !image.data || !image.filename) return { error: "no file" };

  // หาหมายเลขถัดไปของไฟล์
  const fileNumber = await getNextFileNumber();

  // สร้าง path สำหรับบันทึกไฟล์
  const fileExtension = path.extname(image.filename).toLowerCase();
  const filePath = `/uploads/${fileNumber}.webp`; // ใช้ตัวเลขที่ได้มาเป็นชื่อไฟล์
  const savePath = path.join(process.cwd(), "public", filePath);

  // แปลงไฟล์เป็น webp และบันทึก
  await sharp(image.data)
    .webp() // แปลงเป็น webp
    .toFile(savePath); // บันทึกไฟล์ที่แปลงแล้วลงใน disk

  // ส่งกลับ URL ของไฟล์ที่ถูกอัปโหลด
  return { url: filePath };
});
