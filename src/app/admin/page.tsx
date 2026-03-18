// src/app/admin/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [view, setView] = useState<"day" | "month" | "year">("day");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((res) => {
        setData(res);
        setIsLoading(false);
      });
  }, []);

  if (isLoading)
    return <div className="p-10 text-center">กำลังโหลดข้อมูล...</div>;
  if (!data || data.error)
    return (
      <div className="p-10 text-center text-red-500">
        เกิดข้อผิดพลาดในการโหลดข้อมูล โปรดล็อกอินใหม่
      </div>
    );

  // เลือกข้อมูลที่จะแสดงตาม Tab ที่เลือก
  const chartData =
    view === "day"
      ? data.dailySales
      : view === "month"
        ? data.monthlySales
        : data.yearlySales;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-zinc-800">📊 สรุปยอดขาย</h1>

      {/* บัตรสรุปข้อมูล */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
          <p className="text-zinc-500 text-sm">วันนี้ขายได้</p>
          <p className="text-3xl font-bold text-emerald-600">
            ฿{data.salesToday.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
          <p className="text-zinc-500 text-sm">รายได้รวมทั้งหมด</p>
          <p className="text-3xl font-bold text-zinc-800">
            ฿{data.totalRevenue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* ส่วนของกราฟและปุ่มสลับ */}
      <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-zinc-800">แนวโน้มยอดขาย</h2>

          {/* ปุ่มสลับมุมมอง */}
          <div className="flex bg-zinc-100 p-1 rounded-lg">
            <button
              onClick={() => setView("day")}
              className={`px-4 py-1.5 text-sm rounded-md transition-all ${view === "day" ? "bg-white shadow-sm font-bold" : "text-zinc-500"}`}
            >
              รายวัน
            </button>
            <button
              onClick={() => setView("month")}
              className={`px-4 py-1.5 text-sm rounded-md transition-all ${view === "month" ? "bg-white shadow-sm font-bold" : "text-zinc-500"}`}
            >
              รายเดือน
            </button>
            <button
              onClick={() => setView("year")}
              className={`px-4 py-1.5 text-sm rounded-md transition-all ${view === "year" ? "bg-white shadow-sm font-bold" : "text-zinc-500"}`}
            >
              รายปี
            </button>
          </div>
        </div>

        <div className="h-87.5 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f4f4f5"
              />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#a1a1aa", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#a1a1aa", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                }}
              />
              <Line
                type="monotone"
                dataKey="amount"
                name="ยอดขาย"
                stroke="#10b981"
                strokeWidth={4}
                dot={{ r: 4, fill: "#10b981" }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
