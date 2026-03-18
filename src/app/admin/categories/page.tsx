// src/app/admin/categories/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Category {
  id: string;
  name: string;
}

export default function ManageCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State สำหรับ Popup
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState("");
  const [categoryName, setCategoryName] = useState("");

  const fetchCategories = async () => {
    setIsLoading(true);
    const res = await fetch("/api/categories").then((r) => r.json());
    if (Array.isArray(res)) setCategories(res);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // เปิด Popup สำหรับสร้างใหม่
  const handleAddNew = () => {
    setEditMode(false);
    setCategoryName("");
    setIsDialogOpen(true);
  };

  // เปิด Popup สำหรับแก้ไข
  const handleEdit = (cat: Category) => {
    setEditMode(true);
    setCurrentId(cat.id);
    setCategoryName(cat.name);
    setIsDialogOpen(true);
  };

  // กดปุ่มบันทึก (แยกแยกว่าเป็นการสร้างใหม่ หรือ แก้ไข)
  const handleSave = async () => {
    if (!categoryName.trim()) return alert("กรุณากรอกชื่อหมวดหมู่");

    const method = editMode ? "PATCH" : "POST";
    const body = editMode
      ? JSON.stringify({ id: currentId, name: categoryName })
      : JSON.stringify({ name: categoryName });

    const res = await fetch("/api/categories", {
      method,
      headers: { "Content-Type": "application/json" },
      body,
    });

    if (res.ok) {
      setIsDialogOpen(false);
      fetchCategories(); // โหลดข้อมูลใหม่
    } else {
      alert("เกิดข้อผิดพลาดในการบันทึก");
    }
  };

  // ลบหมวดหมู่
  const handleDelete = async (id: string, name: string) => {
    if (
      !confirm(
        `คุณแน่ใจหรือไม่ที่จะลบหมวดหมู่ "${name}" ?\n*ไม่สามารถลบได้หากมีสินค้าอยู่ในหมวดหมู่นี้`,
      )
    )
      return;

    const res = await fetch(`/api/categories?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchCategories();
    } else {
      const data = await res.json();
      alert(
        `ลบไม่สำเร็จ: ${data.error || "โปรดตรวจสอบว่ามีสินค้าค้างอยู่ในหมวดหมู่นี้หรือไม่"}`,
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-zinc-800">
          📂 จัดการหมวดหมู่ (Categories)
        </h1>
        <Button onClick={handleAddNew} className="bg-zinc-900 text-white">
          + เพิ่มหมวดหมู่ใหม่
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-zinc-500">กำลังโหลด...</div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600">
              <tr>
                <th className="px-6 py-4 font-medium">ชื่อหมวดหมู่</th>
                <th className="px-6 py-4 font-medium text-right w-32">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr
                  key={cat.id}
                  className="border-b border-zinc-100 hover:bg-zinc-50"
                >
                  <td className="px-6 py-4 font-medium text-zinc-900">
                    {cat.name}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(cat)}
                    >
                      แก้ไข
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(cat.id, cat.name)}
                    >
                      ลบ
                    </Button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={2} className="text-center py-10 text-zinc-400">
                    ยังไม่มีหมวดหมู่
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Popup เพิ่ม/แก้ไข */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editMode ? "✏️ แก้ไขหมวดหมู่" : "✨ เพิ่มหมวดหมู่ใหม่"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">
                ชื่อหมวดหมู่
              </label>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="เช่น Coffee, Bakery, Slow Bar"
                className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900"
                autoFocus
              />
            </div>
            <Button
              onClick={handleSave}
              className="w-full bg-zinc-900 text-white"
            >
              บันทึกข้อมูล
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
