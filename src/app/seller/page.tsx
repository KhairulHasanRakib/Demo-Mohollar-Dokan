"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function SellerPage() {
  const [sellerId, setSellerId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [workerId, setWorkerId] = useState<string>("");

  const fetchOrders = async () => {
    if (!sellerId) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/orders?role=seller&sellerId=${encodeURIComponent(sellerId)}&limit=50`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load orders");
      setOrders(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const acceptOrder = async (id: number) => {
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/orders/${id}/accept`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to accept order");
      setMessage(`Order #${id} accepted.`);
      fetchOrders();
    } catch (e: any) {
      setError(e.message || "Failed to accept order");
    }
  };

  const assignWorker = async (id: number) => {
    setError(null);
    setMessage(null);
    if (!workerId) {
      setError("Enter a worker ID to assign.");
      return;
    }
    try {
      const res = await fetch(`/api/orders/${id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workerId: Number(workerId) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to assign worker");
      setMessage(`Worker assigned to order #${id}. Pickup/Delivery codes generated.`);
      fetchOrders();
    } catch (e: any) {
      setError(e.message || "Failed to assign worker");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Seller Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
            <div className="md:col-span-2">
              <Label htmlFor="sellerId">Your Seller ID</Label>
              <Input id="sellerId" placeholder="e.g. 1" value={sellerId} onChange={(e) => setSellerId(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Button onClick={fetchOrders} disabled={!sellerId || loading}>{loading ? "Loading..." : "Load Orders"}</Button>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="workerId">Worker ID (for assignment)</Label>
              <Input id="workerId" placeholder="e.g. 5" value={workerId} onChange={(e) => setWorkerId(e.target.value)} />
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-green-700">{message}</p>}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {orders.map((o) => (
          <Card key={o.id}>
            <CardHeader>
              <CardTitle className="text-base">Order #{o.id}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>Status: <span className="font-medium">{o.status}</span></p>
              {o.product && (
                <p>Product: {o.product.title} — ${(o.itemPriceCents / 100).toFixed(2)} × {o.quantity}</p>
              )}
              <p>Total: <span className="font-medium">${(o.totalCents / 100).toFixed(2)}</span></p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => acceptOrder(o.id)} disabled={o.status !== "payment_frozen"}>Accept</Button>
                <Button onClick={() => assignWorker(o.id)} variant="secondary" disabled={o.status !== "seller_accepted" || !workerId}>Assign Worker</Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {!loading && orders.length === 0 && (
          <p className="text-sm text-muted-foreground">No orders found. Enter your seller ID and load orders.</p>
        )}
      </div>
    </div>
  );
}