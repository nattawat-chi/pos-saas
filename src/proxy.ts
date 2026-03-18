// src/proxy.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// ใช้ withAuth เพื่อให้ระบบบังคับล็อกอิน และดึงข้อมูล token มาเช็คได้
export default withAuth(
  function proxy(req) {
    // 1. ดึง role จาก token ของคนที่ล็อกอินอยู่ (แปลงเป็นพิมพ์เล็กเพื่อป้องกันความผิดพลาด)
    const role = (req.nextauth.token?.role as string)?.toLowerCase();

    // 2. ถ้าพยายามเข้าหน้า /admin แต่ Role ไม่ใช่ admin ให้เตะกลับไปหน้าร้าน (/)
    if (req.nextUrl.pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  },
  {
    callbacks: {
      // ด่านแรก: เช็คว่า "ล็อกอินแล้วหรือยัง?" ถ้ามี token ถึงจะปล่อยให้เข้าไปรันโค้ดด้านบนต่อ
      authorized: ({ token }) => !!token,
    },
  },
);

// 3. กำหนดเป้าหมาย: บอกให้ Middleware ทำงานเฉพาะ URL ที่ขึ้นต้นด้วย /admin
export const config = {
  matcher: ["/admin/:path*"], // คลุมทั้ง /admin และหน้าย่อยเช่น /admin/products
};
