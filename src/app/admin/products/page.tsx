// src/app/admin/products/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ManageProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // State สำหรับ Popup สินค้า
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");

  // 🛑 State สำหรับ Popup หมวดหมู่ (เพิ่มโหมดแก้ไข)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [categoryEditMode, setCategoryEditMode] = useState(false); // เช็คว่ากำลังสร้างหรือแก้ไข
  const [categoryEditId, setCategoryEditId] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");

  const fetchData = async () => {
    const [resProducts, resCategories] = await Promise.all([
      fetch("/api/products").then((res) => res.json()),
      fetch("/api/categories").then((res) => res.json()),
    ]);
    setProducts(resProducts);
    setCategories(resCategories);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ----------------------------------------------------------------
  // ส่วนจัดการ "เมนูสินค้า"
  // ----------------------------------------------------------------
  const handleOpenCreate = () => {
    setEditingId(null);
    setName("");
    setPrice("");
    if (categories.length > 0) setCategoryId(categories[0].id);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (product: any) => {
    setEditingId(product.id);
    setName(product.name);
    setPrice(product.price.toString());
    setCategoryId(product.categoryId);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !categoryId) return alert("กรุณากรอกข้อมูลให้ครบ");

    const url = editingId ? `/api/products/${editingId}` : "/api/products";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, price, categoryId }),
    });

    if (res.ok) {
      alert(editingId ? "แก้ไขเมนูสำเร็จ!" : "เพิ่มเมนูสำเร็จ!");
      setIsDialogOpen(false);
      fetchData();
    } else {
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบเมนู "${name}"?`)) return;

    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) fetchData();
  };

  // ----------------------------------------------------------------
  // ส่วนจัดการ "หมวดหมู่" (โฉมใหม่ มีครบ CRUD)
  // ----------------------------------------------------------------
  const handleOpenCreateCategory = () => {
    setCategoryEditMode(false);
    setCategoryEditId(null);
    setNewCategoryName("");
    setIsCategoryDialogOpen(true);
  };

  const handleOpenEditCategory = () => {
    const selectedCat = categories.find((c) => c.id === categoryId);
    if (!selectedCat) return;

    setCategoryEditMode(true);
    setCategoryEditId(selectedCat.id);
    setNewCategoryName(selectedCat.name);
    setIsCategoryDialogOpen(true);
  };

  const handleSubmitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return alert("กรุณากรอกชื่อหมวดหมู่");

    const method = categoryEditMode ? "PATCH" : "POST";
    const body = categoryEditMode
      ? JSON.stringify({ id: categoryEditId, name: newCategoryName })
      : JSON.stringify({ name: newCategoryName });

    const res = await fetch("/api/categories", {
      method,
      headers: { "Content-Type": "application/json" },
      body,
    });

    if (res.ok) {
      setIsCategoryDialogOpen(false);
      fetchData(); // โหลดข้อมูลใหม่ หมวดหมู่ใหม่จะโผล่ใน Dropdown ทันที
    } else {
      alert("เกิดข้อผิดพลาดในการบันทึกหมวดหมู่");
    }
  };

  const handleDeleteCategory = async () => {
    const selectedCat = categories.find((c) => c.id === categoryId);
    if (!selectedCat) return;

    if (
      !confirm(
        `คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่ "${selectedCat.name}"?\n*ไม่สามารถลบได้หากมีเมนูค้างอยู่ในหมวดหมู่นี้`,
      )
    )
      return;

    const res = await fetch(`/api/categories?id=${categoryId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setCategoryId(""); // ล้างค่า Dropdown ทิ้งหลังลบสำเร็จ
      fetchData();
      alert("ลบหมวดหมู่สำเร็จ!");
    } else {
      const data = await res.json();
      alert(
        `ลบไม่สำเร็จ: ${data.error || "โปรดลบเมนูในหมวดหมู่นี้ออกให้หมดก่อนลบหมวดหมู่"}`,
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-zinc-800">จัดการเมนูสินค้า</h1>
        <div className="space-x-2">
          <Button
            onClick={handleOpenCreate}
            className="bg-zinc-900 text-white hover:bg-zinc-800"
          >
            + เพิ่มเมนูใหม่
          </Button>
          <Button
            onClick={handleOpenCreateCategory}
            className="bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-50"
          >
            + เพิ่มหมวดหมู่ใหม่
          </Button>
        </div>

        {/* Popup สร้าง/แก้ไข สินค้า */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? "แก้ไขเมนูสินค้า" : "เพิ่มเมนูใหม่"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>ชื่อเมนู</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น Iced Latte"
                />
              </div>
              <div className="space-y-2">
                <Label>ราคา (บาท)</Label>
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="เช่น 65"
                />
              </div>

              {/* 🛑 ส่วนเลือกหมวดหมู่ที่เพิ่มปุ่ม แก้ไข/ลบ */}
              <div className="space-y-2">
                <Label>หมวดหมู่</Label>
                <div className="flex gap-2">
                  <select
                    className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    <option value="" disabled>
                      -- เลือกหมวดหมู่ --
                    </option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>

                  {/* ปุ่มแก้ไขหมวดหมู่ */}
                  <Button
                    type="button"
                    variant="outline"
                    className="px-3"
                    onClick={handleOpenEditCategory}
                    disabled={!categoryId}
                    title="แก้ไขชื่อหมวดหมู่ที่เลือก"
                  >
                    ✏️
                  </Button>

                  {/* ปุ่มลบหมวดหมู่ */}
                  <Button
                    type="button"
                    variant="outline"
                    className="px-3 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={handleDeleteCategory}
                    disabled={!categoryId}
                    title="ลบหมวดหมู่ที่เลือก"
                  >
                    🗑️
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full mt-4 bg-zinc-900 text-white hover:bg-zinc-800"
              >
                {editingId ? "บันทึกการแก้ไข" : "บันทึกข้อมูลเมนู"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Popup สร้าง/แก้ไข หมวดหมู่ */}
        <Dialog
          open={isCategoryDialogOpen}
          onOpenChange={setIsCategoryDialogOpen}
        >
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>
                {categoryEditMode ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่ใหม่"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitCategory} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>ชื่อหมวดหมู่</Label>
                <Input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="เช่น สมูทตี้, ชาผลไม้"
                  autoFocus
                />
              </div>
              <Button
                type="submit"
                className="w-full mt-4 bg-zinc-900 text-white hover:bg-zinc-800"
              >
                บันทึกหมวดหมู่
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* ตารางแสดงสินค้า */}
      <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-100 text-zinc-600 font-medium border-b border-zinc-200">
            <tr>
              <th className="px-6 py-3">ชื่อเมนู</th>
              <th className="px-6 py-3">หมวดหมู่</th>
              <th className="px-6 py-3 text-right">ราคา</th>
              <th className="px-6 py-3 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50"
              >
                <td className="px-6 py-4 font-medium">{product.name}</td>
                <td className="px-6 py-4 text-zinc-500">
                  {product.category?.name}
                </td>
                <td className="px-6 py-4 text-right">฿{product.price}</td>
                <td className="px-6 py-4 text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="mr-2 cursor-pointer"
                    onClick={() => handleOpenEdit(product)}
                  >
                    แก้ไข
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => handleDelete(product.id, product.name)}
                  >
                    ลบ
                  </Button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-10 text-zinc-400">
                  ยังไม่มีเมนูสินค้า
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
