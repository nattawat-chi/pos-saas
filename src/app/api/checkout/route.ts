// src/app/api/checkout/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.shopId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const shopId = (session.user as any).shopId;
    const userId = (session.user as any).id; // ดึง ID ของพนักงานที่กดคิดเงิน
    const { items, totalAmount } = await req.json();

    const order = await prisma.order.create({
      data: {
        userId: userId,
        shopId: shopId,
        totalAmount: totalAmount,
        // 🛑 แก้ตรงนี้: เปลี่ยนจาก PENDING เป็น COMPLETED (สำเร็จทันที)
        status: "COMPLETED",
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
            brewMethod: item.brewMethod || null,
            sweetness:
              item.sweetness !== undefined ? Number(item.sweetness) : null,
            note: item.note || null,
          })),
        },
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: "Failed to checkout" }, { status: 500 });
  }
}
