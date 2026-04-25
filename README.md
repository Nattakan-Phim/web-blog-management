# Blog Management System

ระบบ Blog สำหรับ Assignment A - Technical Assignment

## Tech Stack

| ส่วน | Technology |
|------|-----------|
| Frontend | Next.js 15 App Router + NextAuth.js v5 |
| Backend | ElysiaJS (Bun runtime) |
| Database | PostgreSQL + TypeORM |
| Storage | Cloudflare R2 (local dev) |
| Auth | NextAuth (frontend) + JWT (backend) |

## Database Schema

```
users
  id          UUID PK
  email       VARCHAR UNIQUE
  password    VARCHAR (bcrypt)
  role        VARCHAR default 'admin'
  createdAt   TIMESTAMP
  updatedAt   TIMESTAMP

blogs
  id          UUID PK
  title       VARCHAR
  slug        VARCHAR UNIQUE
  excerpt     TEXT
  content     TEXT
  coverImage  VARCHAR nullable
  isPublished BOOLEAN default false
  viewCount   INT default 0
  publishedAt TIMESTAMP (auto createdAt)
  updatedAt   TIMESTAMP

blog_images
  id          UUID PK
  url         VARCHAR
  order       INT
  blogId      UUID FK -> blogs.id CASCADE DELETE
  createdAt   TIMESTAMP

comments
  id          UUID PK
  senderName  VARCHAR
  message     TEXT
  status      ENUM(pending, approved, rejected) default 'pending'
  blogId      UUID FK -> blogs.id CASCADE DELETE
  createdAt   TIMESTAMP
```

## Design Decisions

- **slug**: auto-generate จาก title ถ้าไม่ระบุ, สามารถแก้ไขได้ใน admin
- **viewCount**: increment ทุกครั้งที่ดูหน้า detail (ไม่สามารถแก้ไขได้ใน admin)
- **publishedAt**: ใช้ createdAt เป็น publishedAt (ไม่สามารถแก้ไขได้ใน admin)
- **Comment validation**: validate ทั้ง frontend (regex) และ backend (regex) — Thai Unicode range `[\u0E00-\u0E7F]` + digits
- **Image upload**: เก็บใน Cloudflare R2, max 6 รูปต่อ blog (ไม่นับรูปปก)
- **Auth flow**: NextAuth เก็บ JWT token จาก backend ใน session, ส่งไปกับทุก admin request

## วิธี Run Project

### Prerequisites
- Bun >= 1.x
- PostgreSQL 14+ (หรือใช้ Docker ตามขั้นตอนด้านล่าง)
- (optional) Cloudflare R2 local / S3-compatible emulator

### Backend

**1. ติดตั้ง dependencies**

```bash
cd backend
bun install
cp .env.example .env
# แก้ไข .env ให้ตรงกับ database ของคุณ
```

**2. เริ่ม PostgreSQL** — เลือก 1 ใน 2 แบบ

```bash
# แบบที่ 1: ใช้ Docker (แนะนำ)
docker compose up -d

# แบบที่ 2: ใช้ PostgreSQL ที่ติดตั้งเอง
# สร้าง database: CREATE DATABASE blog_db;
```

**3. Run migration** — สร้าง tables ทั้งหมด

```bash
bun run db:migration:run
```

**4. Seed admin user** — สร้าง `admin@blog.com` / `admin1234`

```bash
bun run db:seed-admin
```

**5. Start backend**

```bash
bun dev
```

Backend จะรันที่ `http://localhost:4000`  
Swagger docs: `http://localhost:4000/docs`

### Migration Commands

```bash
# Run pending migrations
bun run db:migration:run

# Revert last migration
bun run db:migration:revert

# Generate migration จาก entity ที่เปลี่ยน
bun run db:migration:generate src/migrations/MigrationName

# Create empty migration file
bun run db:migration:create src/migrations/MigrationName
```

### Frontend

```bash
cd frontend
cp .env.example .env.local
# แก้ไข NEXTAUTH_SECRET ให้เป็น random string
bun dev
```

Frontend จะรันที่ `http://localhost:3000`

## หน้าต่างๆ

| URL | คำอธิบาย |
|-----|---------|
| `/blog` | หน้ารวม blog (public) |
| `/blog/[slug]` | หน้ารายละเอียด blog (public) |
| `/admin/login` | หน้า login |
| `/admin/blogs` | จัดการบทความ |
| `/admin/blogs/new` | สร้างบทความใหม่ |
| `/admin/blogs/[id]/edit` | แก้ไขบทความ |
| `/admin/comments` | จัดการ comments |

## Assumptions / ข้อจำกัด

- Comment validation: รองรับ Unicode Thai (`ก-๙`) + เลขอารบิก + เลขไทย + spacebar เท่านั้น
- รูปปก ไม่นับใน 6 รูปเพิ่มเติม
- `publishedAt` คือวันที่สร้าง blog ไม่ใช่วันที่ publish จริง (ตาม requirement ที่ระบุว่าแก้ไขไม่ได้)
- ยังไม่ได้ implement: rich text editor (ใช้ textarea plain text แทน), real-time notifications

## ถ้ามีเวลาเพิ่ม

- เพิ่ม Rich Text Editor (Tiptap หรือ Quill)
- เพิ่ม pagination ใน admin tables
- เพิ่ม image preview ก่อน upload
- เพิ่ม toast notifications
- เพิ่ม unit tests / e2e tests
