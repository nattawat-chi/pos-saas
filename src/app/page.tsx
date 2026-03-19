// src/app/page.tsx
"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState, useMemo } from "react";
import { useCartStore, Product as StoreProduct } from "@/store/useCartStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

// สร้าง Type มารับข้อมูลที่ได้จาก API
interface APIProduct extends StoreProduct {
  category: {
    id: string;
    name: string;
  };
}

export default function POSPage() {
  const { data: session } = useSession(); // ดึงข้อมูล Session มาเช็คว่ายังล็อกอินอยู่ไหม

  const [selectedProduct, setSelectedProduct] = useState<APIProduct | null>(
    null,
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { items, addItem, removeItem, getTotal, clearCart } = useCartStore();
  const [products, setProducts] = useState<APIProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ดึงข้อมูลจาก API เมื่อเปิดหน้าเว็บ
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();

        // 🛑 ป้องกันจอพัง: เช็คก่อนว่าโหลดสำเร็จ และข้อมูลที่ได้มาเป็น Array จริงๆ
        if (res.ok && Array.isArray(data)) {
          setProducts(data);
        } else {
          setProducts([]); // ถ้ายังไม่ล็อกอิน ให้เมนูเป็นจอว่างๆ ไว้
        }
      } catch (error) {
        console.error("Failed to load menu", error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    // 🛑 บังคับให้โหลดข้อมูลใหม่เสมอ ถ้ามีคนล็อกอินหรือล็อกเอาท์
    fetchProducts();
  }, [session]);

  // ฟังก์ชันจัดการตอนกดปุ่มชำระเงิน
  const handleCheckout = async () => {
    if (!session) {
      alert("⚠️ ไม่อนุญาตให้ทำรายการ: กรุณาเข้าสู่ระบบก่อนชำระเงินครับ");
      return; // สั่ง return เพื่อหยุดการทำงานของโค้ดด้านล่างทั้งหมดทันที
    }
    if (items.length === 0) return alert("ตะกร้าว่างเปล่า");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, totalAmount: getTotal() }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(`ชำระเงินสำเร็จ! (Order ID: ${data.orderId})`);
        clearCart(); // ล้างตะกร้าหลังจ่ายเงินเสร็จ
      } else {
        alert(`เกิดข้อผิดพลาด: ${data.error}`);
      }
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
    }
  };

  // สกัดชื่อหมวดหมู่ทั้งหมดออกมาแบบไม่ให้ซ้ำกัน และจัดเรียงลำดับใหม่
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(products.map((p) => p.category.name)),
    );

    // จัดเรียง (Sort) ให้ Espresso ขึ้นก่อนเสมอ ส่วนอันอื่นเรียงตามตัวอักษร
    return uniqueCategories.sort((a, b) => {
      if (a === "Espresso") return -1; // ดัน a ไปข้างหน้าสุด
      if (b === "Espresso") return 1; // ดัน b ไปข้างหน้าสุด
      return a.localeCompare(b); // ตัวอื่นๆ เรียงตาม A-Z
    });
  }, [products]);

  // Component ย่อยสำหรับจัดเรียง Grid ของสินค้า (สร้างแยกไว้จะได้ไม่ต้องเขียนโค้ดซ้ำ)
  const ProductGrid = ({
    displayProducts,
  }: {
    displayProducts: APIProduct[];
  }) => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
      {displayProducts.map((product) => (
        <Card
          key={product.id}
          className="cursor-pointer hover:border-zinc-400 transition-colors shadow-sm"
          onClick={() => {
            if (product.category.name === "Slow Bar") {
              setSelectedProduct(product);
              setIsDialogOpen(true);
            } else {
              addItem(product);
            }
          }}
        >
          <CardContent className="p-4 flex flex-col h-full justify-between items-center text-center">
            <div className="h-24 w-24 bg-zinc-200 rounded-md mb-4 flex items-center justify-center text-3xl">
              {product.category.name === "Bakery" ? (
                "🥐"
              ) : product.category.name === "น้ำแพ็ค" ? (
                <img
                  src="/water-bottle.png"
                  alt="Water Bottle"
                  className="w-16 h-16 object-contain"
                />
              ) : (
                "☕"
              )}
            </div>
            <h3 className="font-medium text-sm text-zinc-700">
              {product.name}
            </h3>
            <p className="font-semibold text-zinc-900 mt-2">฿{product.price}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="flex h-screen bg-zinc-50 overflow-hidden">
      {/* ฝั่งซ้าย: โซนเลือกเมนู */}
      <div className="flex-1 p-6 flex flex-col h-full">
        {/* เริ่ม: แถบ Header โฉมใหม่ */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-zinc-800">Menu</h1>

          <div className="flex items-center gap-4">
            {session ? (
              <>
                <div className="text-sm text-zinc-600 bg-white px-3 py-1.5 rounded-full border border-zinc-200">
                  พนักงาน:{" "}
                  <span className="font-semibold text-zinc-900">
                    {session.user?.email}
                  </span>
                </div>

                {/* เช็คสิทธิ์: ให้เห็นได้ทั้ง admin และ superadmin */}
                {["admin", "superadmin"].includes(
                  (session.user as any)?.role?.toLowerCase(),
                ) && (
                  <Link href="/admin">
                    <Button
                      variant="outline"
                      className="border-zinc-300 cursor-pointer"
                    >
                      ⚙️ จัดการร้าน (Admin)
                    </Button>
                  </Link>
                )}

                <Button
                  variant="ghost"
                  onClick={() => signOut()}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  ออกจากระบบ
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button className="bg-zinc-900 text-white hover:bg-zinc-800">
                  เข้าสู่ระบบ
                </Button>
              </Link>
            )}
          </div>
        </div>
        {/* จบ: แถบ Header โฉมใหม่ */}

        {isLoading ? (
          <div className="flex items-center justify-center h-full text-zinc-500">
            กำลังโหลดข้อมูลเมนู...
          </div>
        ) : (
          <Tabs defaultValue="All" className="flex-1 flex flex-col min-h-0">
            {/* แถบกดเลือกหมวดหมู่ */}
            {/* แถบกดเลือกหมวดหมู่ (ปรับขนาดให้ใหญ่ขึ้นสำหรับ iPad) */}
            <TabsList className="mb-6 justify-start w-full bg-zinc-200/50 h-auto p-2 overflow-x-auto">
              <TabsTrigger
                value="All"
                className="text-base md:text-lg px-6 py-3 rounded-md min-w-30 data-[state=active]:shadow-sm"
              >
                All Menu
              </TabsTrigger>
              {categories.map((cat) => (
                <TabsTrigger
                  key={cat}
                  value={cat}
                  className="text-base md:text-lg px-6 py-3 rounded-md min-w-30 data-[state=active]:shadow-sm"
                >
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>

            <ScrollArea className="flex-1 -mx-6 px-6">
              {/* หน้าต่างแสดงผล: ทุกหมวดหมู่ */}
              <TabsContent value="All" className="mt-0">
                <ProductGrid displayProducts={products} />
              </TabsContent>

              {/* หน้าต่างแสดงผล: แยกตามหมวดหมู่ */}
              {categories.map((cat) => (
                <TabsContent key={cat} value={cat} className="mt-0">
                  <ProductGrid
                    displayProducts={products.filter(
                      (p) => p.category.name === cat,
                    )}
                  />
                </TabsContent>
              ))}
            </ScrollArea>
          </Tabs>
        )}
      </div>

      {/* ฝั่งขวา: โซนตะกร้าคิดเงิน (โค้ดเดิม) */}
      <div className="w-100 bg-white border-l border-zinc-200 p-6 flex flex-col shadow-xl z-10">
        <h2 className="text-xl font-bold mb-6 text-zinc-800">Current Order</h2>
        <ScrollArea className="flex-1 pr-4 -mr-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-400">
              <p>ยังไม่มีรายการสินค้า</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.cartItemId}
                  className="flex justify-between items-start"
                >
                  <div>
                    <p className="font-medium text-zinc-800">{item.name}</p>
                    {item.brewMethod && (
                      <p className="text-xs text-zinc-500">
                        Method: {item.brewMethod}
                      </p>
                    )}
                    <p className="text-sm text-zinc-500">
                      ฿{item.price} x {item.quantity}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="font-semibold text-zinc-900">
                      ฿{item.price * item.quantity}
                    </p>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => removeItem(item.cartItemId)}
                    >
                      ลบ
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="pt-6 mt-6 border-t border-zinc-200">
          <div className="flex justify-between items-center mb-6">
            <span className="text-zinc-500 font-medium">Total</span>
            <span className="text-3xl font-bold text-zinc-900">
              ฿{getTotal()}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="w-full cursor-pointer"
              onClick={clearCart}
            >
              ยกเลิกออเดอร์
            </Button>
            <Button
              className="w-full cursor-pointer bg-zinc-900 text-white hover:bg-zinc-800 disabled:bg-zinc-300"
              onClick={handleCheckout}
              disabled={items.length === 0 || !session} // ปิดปุ่มถ้าไม่มีสินค้าในตะกร้าหรือยังไม่ได้ล็อกอิน
            >
              ชำระเงิน
            </Button>
          </div>
        </div>
      </div>
      {/* Popup สำหรับเลือกวิธีการชง */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-107">
          <DialogHeader>
            <DialogTitle>เลือกวิธีการชง (Brew Method)</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            {[
              "AeroPress",
              "Pour Over (V60)",
              "French Press",
              "Syphon",
              "Drip",
              "Other",
            ].map((method) => (
              <Button
                key={method}
                variant="outline"
                className="h-16 text-lg hover:bg-zinc-100"
                onClick={() => {
                  if (selectedProduct) {
                    addItem(selectedProduct, method);
                    setIsDialogOpen(false);
                    setSelectedProduct(null);
                  }
                }}
              >
                {method}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
