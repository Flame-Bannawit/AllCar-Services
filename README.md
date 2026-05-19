# 🚗 AllCar Services

**Platform รถยนต์ครบวงจร** — ซื้อขายรถมือสอง หาอู่ซ่อมรถ พร้อมระบบแชท รีวิว และนัดซ่อมออนไลน์

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?logo=supabase)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com)

🌐 **Live Demo:** [all-car-services.vercel.app](https://all-car-services.vercel.app)

---

## 📋 สารบัญ

- [ภาพรวม](#ภาพรวม)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [โครงสร้างโปรเจกต์](#โครงสร้างโปรเจกต์)
- [การติดตั้ง](#การติดตั้ง)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [Screenshots](#screenshots)

---

## ภาพรวม

AllCar Services เป็น **Niche Marketplace** สำหรับวงการรถยนต์ไทย ที่รวมทั้งซื้อ-ขายรถมือสอง, หาอู่ซ่อมรถ, ระบบแชท Real-time, และการนัดซ่อมออนไลน์ไว้ในที่เดียว

> ทำฟรี 100% ด้วย Free Tier ของ Vercel + Supabase — ไม่มีค่าใช้จ่ายในการ Deploy

---

## ✨ Features

### 👤 ระบบ Auth & Users
- Google OAuth Login (ไม่ต้องสมัครสมาชิก)
- Role-based Access Control: `buyer`, `seller`, `garage`, `admin`
- KYC ยืนยันตัวตนผู้ขาย
- ระบบแบนผู้ใช้

### 🚗 ตลาดซื้อ-ขายรถ (Marketplace)
- ลงประกาศขายรถพร้อมรูป (บังคับขั้นต่ำ 5 รูป)
- ค้นหาและ Filter หลายเงื่อนไข (ยี่ห้อ, ราคา, จังหวัด, เชื้อเพลิง, เกียร์)
- ระบบอนุมัติโพสโดย Admin
- โพสหมดอายุอัตโนมัติ 60 วัน
- Wishlist บันทึกรถที่สนใจ
- **เปรียบเทียบรถ Side-by-side**

### 🔧 หาอู่ซ่อมรถ
- อู่ปักหมุดบนแผนที่ (OpenStreetMap — ฟรี 100%)
- กรองตามจังหวัดและบริการ
- นำทางด้วย Google Maps
- **ระบบนัดซ่อมออนไลน์** — เลือกวัน/เวลา ไม่ต้องโทร

### 💬 แชท Real-time
- แชทผู้ซื้อ-ผู้ขายต่อประกาศ
- แชทกับอู่ซ่อมรถ
- Realtime ด้วย Supabase Realtime

### ⭐ Review & Rating
- รีวิวผู้ขายและอู่ซ่อมรถ
- ป้องกัน Fake Review
- คะแนนเฉลี่ยบนโปรไฟล์

### 🛡️ Admin Dashboard
- อนุมัติ/ปฏิเสธประกาศรถและอู่
- จัดการผู้ใช้งาน (ban/unban/เปลี่ยน role)
- จัดการนัดหมาย
- Queue รายงานปัญหา
- Dashboard สถิติภาพรวม

### 📧 Email Notifications
- แจ้งเตือนเมื่อประกาศอนุมัติ/ปฏิเสธ
- แจ้งเตือนเมื่ออู่ได้รับการอนุมัติ
- ใช้ Resend.com (ฟรี 3,000 emails/เดือน)

### 📱 PWA & SEO
- Progressive Web App — Add to Home Screen ได้
- SEO Metadata ทุกหน้า
- Sitemap.xml + robots.txt
- Open Graph สำหรับ Social Share

### 🛡️ ประกันรถ & บทความ
- เปรียบเทียบประกันรถจากบริษัทชั้นนำ (Affiliate)
- บล็อกความรู้เรื่องรถ 6 บทความ

---

## 🛠️ Tech Stack

| ส่วน | เทคโนโลยี |
|------|-----------|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| **UI Components** | shadcn/ui, Lucide React |
| **Backend** | Supabase (PostgreSQL, Auth, Realtime, Storage) |
| **Maps** | Leaflet.js + OpenStreetMap |
| **Email** | Resend.com |
| **Auth** | Supabase Auth + Google OAuth |
| **Deploy** | Vercel (Frontend) |
| **Version Control** | GitHub |

---

## 📁 โครงสร้างโปรเจกต์

```
allcar-services/
├── app/
│   ├── admin/              # Admin Dashboard
│   │   ├── appointments/   # จัดการนัดหมาย
│   │   ├── cars/           # อนุมัติประกาศรถ
│   │   ├── garages/        # อนุมัติอู่
│   │   ├── reports/        # จัดการรายงาน
│   │   └── users/          # จัดการผู้ใช้
│   ├── api/
│   │   └── email/          # Email API (Resend)
│   ├── appointments/       # หน้านัดหมายของฉัน
│   ├── auth/callback/      # OAuth Callback
│   ├── blog/               # บทความความรู้
│   │   └── [slug]/
│   ├── cars/               # ตลาดรถ
│   │   ├── [id]/           # รายละเอียดรถ
│   │   ├── compare/        # เปรียบเทียบรถ
│   │   └── create/         # ลงประกาศ
│   ├── chat/               # ระบบแชท
│   │   └── [id]/
│   ├── garages/            # หาอู่ซ่อม
│   │   ├── [id]/           # รายละเอียดอู่
│   │   │   └── book/       # นัดซ่อม
│   │   └── create/         # ลงทะเบียนอู่
│   ├── insurance/          # ประกันรถ
│   ├── login/              # หน้า Login
│   └── profile/            # โปรไฟล์ผู้ใช้
├── components/
│   └── shared/
│       ├── Navbar.tsx
│       └── MapView.tsx
├── lib/
│   └── supabase/
│       ├── client.ts
│       ├── server.ts
│       └── middleware.ts
├── types/
│   └── index.ts
└── public/
    ├── manifest.json       # PWA Manifest
    ├── sw.js               # Service Worker
    ├── icon-192.png
    └── icon-512.png
```

---

## 🚀 การติดตั้ง

### 1. Clone Repository
```bash
git clone https://github.com/Flame-Bannawit/AllCar-Services.git
cd AllCar-Services/allcar-services
```

### 2. ติดตั้ง Dependencies
```bash
npm install
```

### 3. ตั้งค่า Environment Variables
```bash
cp .env.example .env.local
# แก้ไขค่าใน .env.local
```

### 4. รัน Development Server
```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000) ครับ

---

## 🔑 Environment Variables

สร้างไฟล์ `.env.local` แล้วใส่ค่าต่อไปนี้:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Resend (Email)
RESEND_API_KEY=re_your-api-key
```

---

## 🗄️ Database Schema

ระบบใช้ **PostgreSQL** ผ่าน Supabase ประกอบด้วย 10 Tables:

| Table | คำอธิบาย |
|-------|----------|
| `profiles` | ข้อมูลผู้ใช้ (ต่อจาก auth.users) |
| `kyc` | เอกสารยืนยันตัวตนผู้ขาย |
| `car_listings` | ประกาศขายรถ |
| `garages` | ข้อมูลอู่ซ่อมรถ |
| `reviews` | รีวิวผู้ขายและอู่ |
| `chat_rooms` | ห้องแชท |
| `chat_messages` | ข้อความแชท |
| `reports` | รายงานปัญหา |
| `wishlists` | รายการโปรดของผู้ใช้ |
| `appointments` | การนัดหมายซ่อมรถ |

---

## 👨‍💻 ผู้พัฒนา

**Bannawit Chaichomphu**

- GitHub: [@Flame-Bannawit](https://github.com/Flame-Bannawit)
- Project นี้พัฒนาเพื่อเป็น Portfolio สำหรับสมัครงาน Full Stack Web Developer

---

## 📄 License

MIT License — ใช้ได้ฟรีสำหรับการศึกษาและพัฒนาต่อครับ
