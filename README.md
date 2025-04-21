```bash
# npm
npm install

# ติดตั้ง SQLite + Prisma
npm install prisma @prisma/client sqlite3
npx prisma init
npm install sharp # webp
npm install sweetalert2

#  สร้าง schema

# datasource db {
#   provider = "sqlite"
#   url      = "file:./dev.db"
# }

# generator client {
#   provider = "prisma-client-js"
# }

# model Note {
#   id        Int      @id @default(autoincrement())
#   header    String
#   content   String
#   image     String?   // optional
#   createdAt DateTime @default(now())
# }

# สร้าง DB
npx prisma migrate dev --name init
```

# cronjob delete data

npm install node-cron
