// prisma/seed.ts
import prisma from "../src/lib/prisma";

async function main() {
  console.log("กำลังเสกข้อมูลกลับมา...");

  // 1. สร้างหมวดหมู่
  const coffee = await prisma.category.create({
    data: { name: "Coffee (กาแฟ)" },
  });
  const nonCoffee = await prisma.category.create({
    data: { name: "Non-Coffee (ชา/นม)" },
  });
  const bakery = await prisma.category.create({
    data: { name: "Bakery (ขนม)" },
  });

  // 2. สร้างสินค้า
  await prisma.product.createMany({
    data: [
      { name: "Americano (อเมริกาโน่)", price: 55, categoryId: coffee.id },
      { name: "Latte (ลาเต้)", price: 65, categoryId: coffee.id },
      { name: "Drip Coffee (กาแฟดริป)", price: 80, categoryId: coffee.id },
      {
        name: "Matcha Latte (มัทฉะลาเต้)",
        price: 70,
        categoryId: nonCoffee.id,
      },
      { name: "Thai Tea (ชาไทย)", price: 50, categoryId: nonCoffee.id },
      { name: "Cheesecake (ชีสเค้ก)", price: 90, categoryId: bakery.id },
    ],
  });

  // 3. สร้างสต็อกวัตถุดิบ
  await prisma.inventoryItem.createMany({
    data: [
      { name: "เมล็ดกาแฟคั่วกลาง", unit: "g", quantity: 2000 },
      { name: "นมสด", unit: "ml", quantity: 5000 },
      { name: "ผงมัทฉะ", unit: "g", quantity: 500 },
      { name: "แก้วพลาสติก 16oz", unit: "ใบ", quantity: 300 },
    ],
  });

  console.log("เสกข้อมูลเสร็จเรียบร้อย! 🎉");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
