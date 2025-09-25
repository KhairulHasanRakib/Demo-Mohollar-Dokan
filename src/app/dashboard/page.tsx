"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient, useSession } from "@/lib/auth-client";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending, refetch } = useSession();

  // Buyer orders state
  const [buyerId, setBuyerId] = useState("");
  const [buyerOrders, setBuyerOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [deliveryCodes, setDeliveryCodes] = useState<Record<number, string>>({});

  const signOut = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : "";
    await authClient.signOut({ fetchOptions: { headers: { Authorization: `Bearer ${token}` } } });
    localStorage.removeItem("bearer_token");
    refetch();
    router.push("/");
  };

  const loadBuyerOrders = async () => {
    if (!buyerId) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/orders?role=buyer&buyerId=${encodeURIComponent(buyerId)}&limit=50`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load orders");
      setBuyerOrders(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const verifyDelivery = async (orderId: number) => {
    setError(null);
    setMessage(null);
    const code = deliveryCodes[orderId];
    if (!code) {
      setError("Enter the delivery code for this order.");
      return;
    }
    try {
      const res = await fetch(`/api/orders/${orderId}/delivery-verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryCode: code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Delivery verification failed");
      setMessage(`Delivery verified for order #${orderId}. Escrow released.`);
      loadBuyerOrders();
    } catch (e: any) {
      setError(e.message || "Delivery verification failed");
    }
  };

  if (isPending) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Welcome{session?.user ? `, ${session.user.email}` : ""}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button onClick={() => router.push("/seller")}>Seller</Button>
          <Button onClick={() => router.push("/worker")} variant="secondary">Worker</Button>
          <Button onClick={() => router.push("/admin")} variant="outline">Admin</Button>
          <Button onClick={signOut} className="ml-auto" variant="destructive">Sign out</Button>
        </CardContent>
      </Card>

      {/* Buyer Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Your Orders (Buyer)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
            <div className="md:col-span-2">
              <Label htmlFor="buyerId">Your Buyer Profile ID</Label>
              <Input id="buyerId" placeholder="e.g. 7" value={buyerId} onChange={(e) => setBuyerId(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Button onClick={loadBuyerOrders} disabled={!buyerId || loading}>{loading ? "Loading..." : "Load Orders"}</Button>
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-green-700">{message}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {buyerOrders.map((o) => (
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
                    <div className="md:col-span-2">
                      <Label htmlFor={`code-${o.id}`}>Delivery Code</Label>
                      <Input
                        id={`code-${o.id}`}
                        placeholder="Enter delivery code"
                        value={deliveryCodes[o.id] || ""}
                        onChange={(e) => setDeliveryCodes((prev) => ({ ...prev, [o.id]: e.target.value }))}
                      />
                    </div>
                    <Button onClick={() => verifyDelivery(o.id)} disabled={o.status !== "picked_up"}>
                      Verify Delivery
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {!loading && buyerOrders.length === 0 && (
              <p className="text-sm text-muted-foreground">No orders found. Enter your buyer ID and load orders.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}