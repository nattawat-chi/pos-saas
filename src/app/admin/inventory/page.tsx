// src/app/admin/inventory/page.tsx
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

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isRefillOpen, setIsRefillOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [newItem, setNewItem] = useState({ name: "", quantity: "", unit: "" });
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [refillAmount, setRefillAmount] = useState("");

  const [editForm, setEditForm] = useState({
    id: "",
    name: "",
    quantity: "",
    unit: "",
  });

  const fetchInventory = async () => {
    const res = await fetch("/api/inventory").then((r) => r.json());
    setItems(res);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleCreate = async () => {
    if (!newItem.name || !newItem.unit) return alert("กรุณากรอกข้อมูลให้ครบ");
    await fetch("/api/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    });
    setIsAddOpen(false);
    setNewItem({ name: "", quantity: "", unit: "" });
    fetchInventory();
  };

  const handleRefill = async () => {
    if (!refillAmount || Number(refillAmount) <= 0)
      return alert("กรุณาใส่จำนวนที่ถูกต้อง");
    await fetch("/api/inventory", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: selectedItem.id,
        quantityToAdd: refillAmount,
      }),
    });
    setIsRefillOpen(false);
    setRefillAmount("");
    fetchInventory();
  };

  const handleEditSave = async () => {
    if (!editForm.name || !editForm.unit) return alert("กรุณากรอกข้อมูลให้ครบ");
    await fetch("/api/inventory", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editForm.id,
        name: editForm.name,
        unit: editForm.unit,
        exactQuantity: editForm.quantity,
      }),
    });
    setIsEditOpen(false);
    fetchInventory();
  };

  // 🛑 ฟังก์ชันใหม่: ลบวัตถุดิบ
  const handleDelete = async (id: string, name: string) => {
    if (
      !confirm(
        `⚠️ คุณแน่ใจหรือไม่ที่จะลบวัตถุดิบ "${name}" ?\n*หากวัตถุดิบนี้ถูกผูกไว้ในสูตรเครื่องดื่ม จะไม่สามารถลบได้`,
      )
    )
      return;

    const res = await fetch(`/api/inventory?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchInventory();
    } else {
      const data = await res.json();
      alert(`ลบไม่สำเร็จ: ${data.error}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-zinc-800">
          📦 คลังวัตถุดิบ (Inventory)
        </h1>
        <Button
          onClick={() => setIsAddOpen(true)}
          className="bg-zinc-900 text-white hover:bg-zinc-800"
        >
          + เพิ่มวัตถุดิบใหม่
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-100 text-zinc-600 font-medium border-b border-zinc-200">
            <tr>
              <th className="px-6 py-3">ชื่อวัตถุดิบ</th>
              <th className="px-6 py-3">ยอดคงเหลือ</th>
              <th className="px-6 py-3">หน่วย</th>
              <th className="px-6 py-3 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className="border-b border-zinc-100 hover:bg-zinc-50"
              >
                <td className="px-6 py-4 font-medium">{item.name}</td>
                <td className="px-6 py-4">
                  <span
                    className={`font-bold ${item.quantity <= 20 ? "text-red-500" : "text-emerald-600"}`}
                  >
                    {item.quantity}
                  </span>
                </td>
                <td className="px-6 py-4 text-zinc-500">{item.unit}</td>
                <td className="px-6 py-4 text-center flex justify-center gap-2">
                  {/* ปุ่มแก้ไข */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-300 text-blue-600 hover:bg-blue-50 cursor-pointer"
                    onClick={() => {
                      setEditForm({
                        id: item.id,
                        name: item.name,
                        quantity: item.quantity,
                        unit: item.unit,
                      });
                      setIsEditOpen(true);
                    }}
                  >
                    ✏️ แก้ไข
                  </Button>

                  {/* ปุ่มเติมสต็อก */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-emerald-500 text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                    onClick={() => {
                      setSelectedItem(item);
                      setIsRefillOpen(true);
                    }}
                  >
                    + เติมสต็อก
                  </Button>

                  {/* 🛑 ปุ่มลบ */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-300 text-red-600 hover:bg-red-50 cursor-pointer"
                    onClick={() => handleDelete(item.id, item.name)}
                  >
                    🗑️ ลบ
                  </Button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-10 text-zinc-400">
                  ยังไม่มีข้อมูลวัตถุดิบ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Popup: เพิ่มวัตถุดิบใหม่ */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เพิ่มวัตถุดิบใหม่</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="ชื่อวัตถุดิบ (เช่น น้ำเชื่อมวานิลลา)"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            />
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="ยอดตั้งต้น (เช่น 1000)"
                value={newItem.quantity}
                onChange={(e) =>
                  setNewItem({ ...newItem, quantity: e.target.value })
                }
              />
              <Input
                placeholder="หน่วย (เช่น ml, กรัม)"
                value={newItem.unit}
                onChange={(e) =>
                  setNewItem({ ...newItem, unit: e.target.value })
                }
              />
            </div>
            <Button
              className="w-full bg-zinc-900 text-white hover:bg-zinc-800"
              onClick={handleCreate}
            >
              บันทึก
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Popup: เติมสต็อก (บวกเพิ่ม) */}
      <Dialog open={isRefillOpen} onOpenChange={setIsRefillOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เติมสต็อก: {selectedItem?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-sm text-zinc-500 mb-2">
              ยอดปัจจุบัน:{" "}
              <span className="font-bold text-zinc-900">
                {selectedItem?.quantity} {selectedItem?.unit}
              </span>
            </div>
            <Input
              type="number"
              placeholder={`ใส่จำนวนที่ต้องการบวกเพิ่ม (${selectedItem?.unit})`}
              value={refillAmount}
              onChange={(e) => setRefillAmount(e.target.value)}
            />
            <Button
              className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={handleRefill}
            >
              ยืนยันการเติมสต็อก
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Popup: แก้ไขข้อมูล (เขียนทับ) */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไขข้อมูลวัตถุดิบ</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm text-zinc-500">ชื่อวัตถุดิบ</label>
              <Input
                placeholder="ชื่อวัตถุดิบ"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
              />
            </div>
            <div className="flex gap-2">
              <div className="space-y-2 flex-1">
                <label className="text-sm text-zinc-500">
                  ยอดคงเหลือ (แก้ไขได้เลย)
                </label>
                <Input
                  type="number"
                  value={editForm.quantity}
                  onChange={(e) =>
                    setEditForm({ ...editForm, quantity: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2 w-1/3">
                <label className="text-sm text-zinc-500">หน่วย</label>
                <Input
                  placeholder="หน่วย"
                  value={editForm.unit}
                  onChange={(e) =>
                    setEditForm({ ...editForm, unit: e.target.value })
                  }
                />
              </div>
            </div>
            <Button
              className="w-full bg-blue-600 text-white hover:bg-blue-700 mt-4"
              onClick={handleEditSave}
            >
              บันทึกการแก้ไข
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
