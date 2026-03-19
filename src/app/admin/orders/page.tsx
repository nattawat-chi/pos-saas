// src/app/admin/orders/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function OrdersHistoryPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      const res = await fetch("/api/orders").then((r) => r.json());
      setOrders(res || []);
    };
    fetchOrders();
  }, []);
  const handleDelete = async (orderId: string) => {
    if (
      !confirm(
        `⚠️ คุณแน่ใจหรือไม่ที่จะยกเลิกบิล "${orderId}" ?\n*ยอดขายของบิลนี้จะถูกหักออกจาก Dashboard ทันที`,
      )
    )
      return;

    const res = await fetch(`/api/orders?id=${orderId}`, { method: "DELETE" });
    if (res.ok) {
      alert("ยกเลิกบิลสำเร็จ!");
      // เรียกฟังก์ชันดึงข้อมูลออเดอร์ของคุณใหม่ตรงนี้ เช่น fetchOrders()
      window.location.reload(); // หรือใช้วิธีรีเฟรชหน้าเว็บง่ายๆ แบบนี้ก็ได้ครับ
    } else {
      alert("เกิดข้อผิดพลาดในการลบออเดอร์");
    }
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("th-TH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold">
            สำเร็จ
          </span>
        );
      case "CANCELLED":
        return (
          <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">
            ยกเลิก
          </span>
        );
      case "PENDING":
        return (
          <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold">
            รอดำเนินการ
          </span>
        );
      default:
        return (
          <span className="bg-zinc-100 text-zinc-700 px-2 py-1 rounded text-xs font-bold">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-zinc-800">
        🧾 ประวัติออเดอร์ (Order History)
      </h1>

      <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-100 text-zinc-600 font-medium border-b border-zinc-200">
            <tr>
              <th className="px-6 py-3">เลขที่บิล</th>
              <th className="px-6 py-3">วัน/เวลา</th>
              <th className="px-6 py-3">พนักงาน</th>
              <th className="px-6 py-3">ยอดรวม</th>
              <th className="px-6 py-3">สถานะ</th>
              <th className="px-6 py-3 text-center">รายละเอียด</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-zinc-100 hover:bg-zinc-50"
              >
                <td className="px-6 py-4 font-mono text-zinc-500">
                  #{order.id.slice(-6).toUpperCase()}
                </td>
                <td className="px-6 py-4">{formatDate(order.createdAt)}</td>
                <td className="px-6 py-4">{order.user?.email || "ไม่ระบุ"}</td>
                <td className="px-6 py-4 font-bold">
                  ฿{order.totalAmount.toLocaleString()}
                </td>
                <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                <td className="px-6 py-4 text-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedOrder(order);
                      setIsDialogOpen(true);
                    }}
                  >
                    🔍 ดูบิล
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-300 text-red-600 hover:bg-red-50 cursor-pointer"
                    onClick={() => handleDelete(order.id)}
                  >
                    🗑️ ยกเลิกบิล
                  </Button>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-10 text-zinc-400">
                  ยังไม่มีประวัติการขาย
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Popup ดูรายละเอียดบิล */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center text-xl border-b pb-4">
              ใบเสร็จรับเงิน
              <br />
              <span className="text-sm font-normal text-zinc-500 font-mono">
                บิลเลขที่: #{selectedOrder?.id.slice(-8).toUpperCase()}
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2 text-sm">
            <div className="flex justify-between text-zinc-500">
              <span>
                วันที่:{" "}
                {selectedOrder ? formatDate(selectedOrder.createdAt) : ""}
              </span>
            </div>

            {/* 🛑 ส่วนที่แสดงรายการสินค้าและวิธีการชง (แก้มาให้แล้ว) */}
            <div className="border-y border-dashed py-4 space-y-3">
              {selectedOrder?.items.map((item: any) => (
                <div key={item.id} className="flex flex-col">
                  {/* บรรทัดบน: ชื่อเมนูและราคา */}
                  <div className="flex justify-between items-start">
                    <span className="font-medium">
                      {item.quantity}x {item.product?.name}
                    </span>
                    <span>
                      ฿{(item.product?.price * item.quantity).toLocaleString()}
                    </span>
                  </div>

                  {/* บรรทัดล่าง: รายละเอียดการชง */}
                  {(item.brewMethod ||
                    item.sweetness !== null ||
                    item.note) && (
                    <div className="text-xs text-zinc-500 pl-5 mt-0.5 flex flex-col gap-0.5">
                      {item.brewMethod && (
                        <span>• วิธีชง: {item.brewMethod}</span>
                      )}
                      {item.sweetness !== null && (
                        <span>• ความหวาน: {item.sweetness}%</span>
                      )}
                      {item.note && <span>• หมายเหตุ: {item.note}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center text-lg font-bold">
              <span>ยอดชำระสุทธิ</span>
              <span>฿{selectedOrder?.totalAmount.toLocaleString()}</span>
            </div>

            <div className="text-center pt-4 text-zinc-400 text-xs">
              พนักงาน: {selectedOrder?.user?.email}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
