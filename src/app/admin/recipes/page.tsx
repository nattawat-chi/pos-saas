"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function RecipesPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // State สำหรับเก็บข้อมูลเมนูที่กำลังแก้ไข และรายการวัตถุดิบในสูตร
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [recipeItems, setRecipeItems] = useState<any[]>([]);

  const fetchData = async () => {
    const res = await fetch("/api/recipes").then((r) => r.json());
    setProducts(res.products || []);
    setInventory(res.inventoryItems || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // เปิด Popup และโหลดสูตรเดิมของเมนูนั้นๆ (ถ้ามี)
  const handleOpenEdit = (product: any) => {
    setEditingProduct(product);
    if (product.recipeItems && product.recipeItems.length > 0) {
      setRecipeItems(
        product.recipeItems.map((r: any) => ({
          inventoryItemId: r.inventoryItemId,
          amountRequired: r.amountRequired,
        })),
      );
    } else {
      setRecipeItems([]); // ถ้ายังไม่มีสูตร ให้เป็นฟอร์มว่างๆ
    }
    setIsDialogOpen(true);
  };

  // เพิ่มช่องใส่วัตถุดิบใหม่
  const handleAddIngredient = () => {
    if (inventory.length === 0)
      return alert("ไม่มีวัตถุดิบในคลัง กรุณาเพิ่มคลังสินค้าก่อน");
    setRecipeItems([
      ...recipeItems,
      { inventoryItemId: inventory[0].id, amountRequired: "" },
    ]);
  };

  // อัปเดตข้อมูลเมื่อมีการพิมพ์ตัวเลขหรือเลือก Dropdown
  const handleUpdateItem = (index: number, field: string, value: string) => {
    const newItems = [...recipeItems];
    newItems[index][field] = value;
    setRecipeItems(newItems);
  };

  // ลบช่องวัตถุดิบ
  const handleRemoveItem = (index: number) => {
    setRecipeItems(recipeItems.filter((_, i) => i !== index));
  };

  // บันทึกข้อมูลลง Database
  const handleSave = async () => {
    // เช็คว่ากรอกข้อมูลครบไหม
    if (
      recipeItems.some(
        (item) => !item.amountRequired || Number(item.amountRequired) <= 0,
      )
    ) {
      return alert("กรุณาระบุปริมาณวัตถุดิบให้ถูกต้อง");
    }

    const res = await fetch("/api/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: editingProduct.id,
        recipes: recipeItems,
      }),
    });

    if (res.ok) {
      alert("บันทึกสูตรสำเร็จ!");
      setIsDialogOpen(false);
      fetchData(); // โหลดข้อมูลตารางใหม่
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-zinc-800">
        จัดการสูตรเครื่องดื่ม
      </h1>

      {/* ตารางแสดงสินค้าและสูตรปัจจุบัน */}
      <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-100 text-zinc-600 font-medium border-b border-zinc-200">
            <tr>
              <th className="px-6 py-3">ชื่อเมนู</th>
              <th className="px-6 py-3">หมวดหมู่</th>
              <th className="px-6 py-3">สูตรปัจจุบัน (วัตถุดิบที่ใช้)</th>
              <th className="px-6 py-3 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className="border-b border-zinc-100 hover:bg-zinc-50"
              >
                <td className="px-6 py-4 font-medium">{product.name}</td>
                <td className="px-6 py-4 text-zinc-500">
                  {product.category?.name}
                </td>
                <td className="px-6 py-4">
                  {product.recipeItems.length > 0 ? (
                    <ul className="list-disc pl-4 text-zinc-600">
                      {product.recipeItems.map((r: any) => (
                        <li key={r.id}>
                          {r.inventoryItem?.name} : {r.amountRequired}{" "}
                          {r.inventoryItem?.unit}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-red-500 text-xs bg-red-50 px-2 py-1 rounded">
                      ยังไม่ผูกสูตร (ไม่ตัดสต็อก)
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEdit(product)}
                  >
                    ⚙️ ตั้งค่าสูตร
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Popup สำหรับจัดการสูตร */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>ตั้งค่าสูตร: {editingProduct?.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {recipeItems.map((item, index) => (
              <div
                key={index}
                className="flex gap-2 items-center bg-zinc-50 p-2 rounded border border-zinc-200"
              >
                {/* Dropdown เลือกวัตถุดิบ */}
                <select
                  className="flex-1 h-10 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm"
                  value={item.inventoryItemId}
                  onChange={(e) =>
                    handleUpdateItem(index, "inventoryItemId", e.target.value)
                  }
                >
                  {inventory.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.name} ({inv.unit})
                    </option>
                  ))}
                </select>

                {/* Input ใส่จำนวน */}
                <Input
                  type="number"
                  className="w-24"
                  placeholder="จำนวน"
                  value={item.amountRequired}
                  onChange={(e) =>
                    handleUpdateItem(index, "amountRequired", e.target.value)
                  }
                />

                {/* ปุ่มลบแถว */}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveItem(index)}
                >
                  X
                </Button>
              </div>
            ))}

            <Button
              variant="outline"
              className="w-full border-dashed"
              onClick={handleAddIngredient}
            >
              + เพิ่มวัตถุดิบ
            </Button>

            <Button
              className="w-full bg-zinc-900 text-white hover:bg-zinc-800 mt-6"
              onClick={handleSave}
            >
              บันทึกสูตร
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
