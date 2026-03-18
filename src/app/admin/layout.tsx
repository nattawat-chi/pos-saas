// src/app/admin/layout.tsx
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-zinc-50">
      {/* แถบเมนูด้านข้าง (Sidebar) */}
      <aside className="w-64 bg-zinc-900 text-white p-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-8">POS Admin</h2>
        <nav className="flex flex-col gap-4">
          <Link href="/admin" className="hover:text-zinc-300 transition-colors">
            📊 Dashboard
          </Link>
          <Link
            href="/admin/products"
            className="hover:text-zinc-300 transition-colors"
          >
            ☕ จัดการเมนู (Products)
          </Link>
          <Link
            href="/admin/recipes"
            className="hover:text-zinc-300 transition-colors"
          >
            📋 จัดการสูตร (Recipes)
          </Link>
          <Link
            href="/admin/inventory"
            className="hover:text-zinc-300 transition-colors"
          >
            📦 คลังวัตถุดิบ (Inventory)
          </Link>
          <Link
            href="/admin/orders"
            className="hover:text-zinc-300 transition-colors"
          >
            🧾 ประวัติออเดอร์ (Orders)
          </Link>
          <Link
            href="/"
            className="hover:text-zinc-300 transition-colors mt-auto pt-4 border-t border-zinc-700"
          >
            ⬅️ กลับหน้าร้าน
          </Link>
        </nav>
      </aside>

      {/* พื้นที่แสดงเนื้อหาหลัก */}
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
