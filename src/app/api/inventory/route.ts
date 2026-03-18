import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

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
        shopId: shopId, // แปะป้ายร้านค้า
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
