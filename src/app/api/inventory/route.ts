// src/app/api/inventory/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// 1. ดึงข้อมูลคลังวัตถุดิบ
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.shopId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const shopId = (session.user as any).shopId;

    const inventory = await prisma.inventoryItem.findMany({
      where: { shopId: shopId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(inventory);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 },
    );
  }
}

// 2. สร้างวัตถุดิบใหม่
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.shopId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const shopId = (session.user as any).shopId;
    const data = await req.json();

    const newItem = await prisma.inventoryItem.create({
      data: {
        name: data.name,
        unit: data.unit,
        quantity: Number(data.quantity) || 0,
        shopId: shopId,
      },
    });
    return NextResponse.json(newItem);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create inventory item" },
      { status: 500 },
    );
  }
}

// 🛑 3. แก้ไขและเติมสต็อกวัตถุดิบ (เพิ่มใหม่)
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.shopId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const shopId = (session.user as any).shopId;
    const data = await req.json();

    // จัดเตรียมข้อมูลที่จะอัปเดต
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.unit) updateData.unit = data.unit;

    if (data.exactQuantity !== undefined) {
      // โหมด "แก้ไข": เซ็ตตัวเลขใหม่ทับไปเลย
      updateData.quantity = Number(data.exactQuantity);
    } else if (data.quantityToAdd !== undefined) {
      // โหมด "เติมสต็อก": เอาเลขเดิมบวกเพิ่มเข้าไป
      updateData.quantity = { increment: Number(data.quantityToAdd) };
    }

    // อัปเดตฐานข้อมูล (บังคับล็อก shopId เสมอ)
    const updatedItem = await prisma.inventoryItem.updateMany({
      where: {
        id: data.id,
        shopId: shopId,
      },
      data: updateData,
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update inventory item" },
      { status: 500 },
    );
  }
}
// 🛑 4. ลบวัตถุดิบ
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.shopId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const shopId = (session.user as any).shopId;

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id)
      return NextResponse.json({ error: "ID is required" }, { status: 400 });

    // ป้องกันการลบวัตถุดิบของร้านอื่น
    await prisma.inventoryItem.deleteMany({
      where: {
        id: id,
        shopId: shopId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    // ดักจับ Error เผื่อว่าวัตถุดิบนี้ถูกผูกไว้ในหน้า "สูตรชง" แล้ว
    return NextResponse.json(
      {
        error:
          'ไม่สามารถลบได้ กรุณาตรวจสอบว่าวัตถุดิบนี้ถูกตั้งเป็น "สูตรชง" ในเมนูไหนหรือไม่ (ต้องปลดสูตรออกก่อนลบ)',
      },
      { status: 500 },
    );
  }
}
