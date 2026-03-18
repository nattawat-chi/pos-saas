// src/app/superadmin/page.tsx
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
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SuperAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [shops, setShops] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State สำหรับ Popup สร้างร้าน
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [shopName, setShopName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  // 🛑 State สำหรับ Popup แก้ไขร้าน (อัปเกรดใหม่ เก็บได้ทุกค่า)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editShopId, setEditShopId] = useState("");
  const [editShopName, setEditShopName] = useState("");
  const [editUserId, setEditUserId] = useState("");
  const [editAdminName, setEditAdminName] = useState("");
  const [editAdminEmail, setEditAdminEmail] = useState("");
  const [editAdminPassword, setEditAdminPassword] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (
      status === "authenticated" &&
      (session?.user as any)?.role?.toUpperCase() !== "SUPERADMIN"
    ) {
      router.push("/");
    } else if (status === "authenticated") {
      fetchShops();
    }
  }, [status, session, router]);

  const fetchShops = async () => {
    setIsLoading(true);
    const res = await fetch("/api/superadmin/shops");
    if (res.ok) {
      const data = await res.json();
      setShops(data);
    }
    setIsLoading(false);
  };

  // --- สร้างร้านใหม่ ---
  const handleOpenCreate = () => {
    setShopName("");
    setAdminName("");
    setAdminEmail("");
    setAdminPassword("");
    setIsDialogOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName || !adminName || !adminEmail || !adminPassword)
      return alert("กรุณากรอกข้อมูลให้ครบถ้วน");

    const res = await fetch("/api/superadmin/shops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shopName, adminName, adminEmail, adminPassword }),
    });

    const data = await res.json();
    if (res.ok) {
      alert("เปิดร้านใหม่สำเร็จ!");
      setIsDialogOpen(false);
      fetchShops();
    } else {
      alert(`เกิดข้อผิดพลาด: ${data.error}`);
    }
  };

  // --- 🛑 แก้ไขร้านและบัญชีผู้ใช้ ---
  const handleOpenEdit = (shop: any) => {
    const owner = shop.users?.[0]; // ดึงข้อมูลเจ้าของร้านมา

    setEditShopId(shop.id);
    setEditShopName(shop.name);

    // ตั้งค่าตัวแปรของเจ้าของร้าน
    setEditUserId(owner?.id || "");
    setEditAdminName(owner?.name || "");
    setEditAdminEmail(owner?.email || "");
    setEditAdminPassword(""); // ทิ้งว่างไว้ ถ้าไม่ต้องการเปลี่ยนรหัส

    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editShopName.trim()) return alert("กรุณากรอกชื่อร้าน");

    const res = await fetch("/api/superadmin/shops", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shopId: editShopId,
        shopName: editShopName,
        userId: editUserId,
        adminName: editAdminName,
        adminEmail: editAdminEmail,
        adminPassword: editAdminPassword, // ถ้าว่าง ระบบหลังบ้านจะไม่แตะรหัสเดิม
      }),
    });

    if (res.ok) {
      alert("อัปเดตข้อมูลสำเร็จ!");
      setIsEditDialogOpen(false);
      fetchShops();
    } else {
      alert("เกิดข้อผิดพลาดในการแก้ไขข้อมูล");
    }
  };

  // --- ลบร้าน ---
  const handleDelete = async (id: string, name: string) => {
    if (
      !confirm(
        `⚠️ อันตราย! คุณแน่ใจหรือไม่ที่จะลบร้าน "${name}"?\nข้อมูลผู้ใช้ทั้งหมดในร้านนี้จะถูกลบถาวร!`,
      )
    )
      return;

    const res = await fetch(`/api/superadmin/shops?id=${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      alert("ลบร้านค้าสำเร็จ!");
      fetchShops();
    } else {
      const data = await res.json();
      alert(`ลบไม่สำเร็จ: ${data.error}`);
    }
  };

  if (status === "loading" || isLoading)
    return <div className="p-10 text-center">กำลังตรวจสอบสิทธิ์...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 bg-zinc-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">
            👑 Super Admin Dashboard
          </h1>
          <p className="text-zinc-500 mt-1">ระบบจัดการลูกค้าแฟรนไชส์ SaaS</p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          + เปิดร้านใหม่ให้ลูกค้า
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-100 text-zinc-600 font-medium border-b border-zinc-200">
            <tr>
              <th className="px-6 py-4">ชื่อร้าน (Shop)</th>
              <th className="px-6 py-4">ชื่อแอดมินร้าน</th>
              <th className="px-6 py-4">อีเมลล็อกอิน</th>
              <th className="px-6 py-4 text-center">วันที่สมัคร</th>
              <th className="px-6 py-4 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {shops.map((shop) => (
              <tr
                key={shop.id}
                className="border-b border-zinc-100 hover:bg-zinc-50"
              >
                <td className="px-6 py-4 font-bold text-zinc-800">
                  {shop.name}
                </td>
                <td className="px-6 py-4 text-zinc-600">
                  {shop.users?.[0]?.name || "-"}
                </td>
                <td className="px-6 py-4 text-zinc-600">
                  {shop.users?.[0]?.email || "-"}
                </td>
                <td className="px-6 py-4 text-center text-zinc-500">
                  {new Date(shop.createdAt).toLocaleDateString("th-TH")}
                </td>
                <td className="px-6 py-4 text-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEdit(shop)}
                  >
                    ✏️ แก้ไข
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(shop.id, shop.name)}
                  >
                    🗑️ ลบ
                  </Button>
                </td>
              </tr>
            ))}
            {shops.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-10 text-zinc-400">
                  ยังไม่มีร้านค้าในระบบ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Popup: เปิดร้านใหม่ */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {/* ... (โค้ด Popup สร้างร้านใหม่ เหมือนเดิม) ... */}
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>✨ เปิดร้านค้าใหม่ (Provision Tenant)</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>ชื่อร้านกาแฟ (Shop Name)</Label>
              <Input
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="เช่น ร้านเพื่อน A Cafe"
              />
            </div>
            <div className="space-y-2">
              <Label>ชื่อเจ้าของร้าน (Admin Name)</Label>
              <Input
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="เช่น สมชาย"
              />
            </div>
            <div className="space-y-2">
              <Label>อีเมลสำหรับล็อกอิน</Label>
              <Input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="เช่น somchai@cafe.com"
              />
            </div>
            <div className="space-y-2">
              <Label>รหัสผ่าน (Password)</Label>
              <Input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="ตั้งรหัสผ่านเริ่มต้น"
              />
            </div>
            <Button
              type="submit"
              className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              สร้างร้านและบัญชีผู้ใช้
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* 🛑 Popup: แก้ไขข้อมูลร้านและบัญชี (อัปเกรดให้แก้ได้ทุกอย่าง) */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>✏️ แก้ไขข้อมูลร้าน</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>ชื่อร้านกาแฟ</Label>
              <Input
                value={editShopName}
                onChange={(e) => setEditShopName(e.target.value)}
                placeholder="พิมพ์ชื่อร้าน"
                required
              />
            </div>

            <div className="pt-4 border-t border-zinc-100">
              <h4 className="text-sm font-semibold text-zinc-800 mb-4">
                ข้อมูลบัญชีผู้จัดการร้าน
              </h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>ชื่อผู้ใช้</Label>
                  <Input
                    value={editAdminName}
                    onChange={(e) => setEditAdminName(e.target.value)}
                    placeholder="ชื่อแอดมิน"
                  />
                </div>
                <div className="space-y-2">
                  <Label>อีเมลเข้าสู่ระบบ</Label>
                  <Input
                    type="email"
                    value={editAdminEmail}
                    onChange={(e) => setEditAdminEmail(e.target.value)}
                    placeholder="อีเมล"
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    รหัสผ่านใหม่{" "}
                    <span className="text-zinc-400 text-xs font-normal">
                      (เว้นว่างไว้หากไม่ต้องการเปลี่ยนรหัสผ่าน)
                    </span>
                  </Label>
                  <Input
                    type="password"
                    value={editAdminPassword}
                    onChange={(e) => setEditAdminPassword(e.target.value)}
                    placeholder="พิมพ์รหัสผ่านใหม่"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full mt-6 bg-zinc-900 text-white hover:bg-zinc-800"
            >
              บันทึกการเปลี่ยนแปลง
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
