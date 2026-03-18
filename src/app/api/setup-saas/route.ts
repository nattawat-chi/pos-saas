// // src/app/api/setup-saas/route.ts
// import { NextResponse } from "next/server";
// import prisma from "@/lib/prisma";
// import bcrypt from "bcryptjs";

// export async function GET() {
//   try {
//     // 1. สร้างร้านค้าแรกของระบบ
//     const firstShop = await prisma.shop.upsert({
//       where: { name: "Area25 Cafe" },
//       update: {},
//       create: { name: "Area25 Cafe" },
//     });

//     // 2. สร้างบัญชี Superadmin และจับผูกกับร้าน Area25 Cafe
//     const hashedPassword = await bcrypt.hash("admin123", 10);
//     const admin = await prisma.user.upsert({
//       where: { email: "admin@coffee.com" },
//       update: {
//         password: hashedPassword,
//         role: "SUPERADMIN",
//         shopId: firstShop.id,
//       },
//       create: {
//         email: "admin@coffee.com",
//         password: hashedPassword,
//         role: "SUPERADMIN",
//         shopId: firstShop.id, // หัวใจสำคัญอยู่ตรงนี้ครับ!
//       },
//     });

//     return NextResponse.json({
//       message: "สร้างร้านแรกและบัญชี Superadmin สำเร็จ!",
//       shopName: firstShop.name,
//       email: admin.email,
//     });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
//   }
// }
