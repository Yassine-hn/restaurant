import React from "react";
import { notFound } from "next/navigation";
import { StorageService } from "@/lib/storage";
import { OrderTracker } from "@/components/OrderTracker";
import { Navbar } from "@/components/Navbar";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = StorageService.getOrderById(id);

  if (!order) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <OrderTracker initialOrder={order} />
      </main>
    </div>
  );
}
