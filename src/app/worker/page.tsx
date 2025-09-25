"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function WorkerPage() {
  const [workerId, setWorkerId] = useState<string>("");
  const [pickupCode, setPickupCode] = useState<string>("");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadAssignments = async () => {
    if (!workerId) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/orders?role=worker&workerId=${encodeURIComponent(workerId)}&limit=50`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load assignments");
      setOrders(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e.message || "Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  const verifyPickup = async (orderId: number) => {
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/pickup-verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pickupCode, workerId: Number(workerId) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Pickup verification failed");
      setMessage(`Pickup verified for order #${orderId}`);
      loadAssignments();
    } catch (e: any) {
      setError(e.message || "Pickup verification failed");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Worker Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
            <div className="md:col-span-2">
              <Label htmlFor="workerId">Your Worker ID</Label>
              <Input id="workerId" placeholder="e.g. 5" value={workerId} onChange={(e) => setWorkerId(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Button onClick={loadAssignments} disabled={!workerId || loading}>{loading ? "Loading..." : "Load Assignments"}</Button>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="pickup">Pickup Code</Label>
              <Input id="pickup" placeholder="Enter pickup code" value={pickupCode} onChange={(e) => setPickupCode(e.target.value)} />
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
              <p>Pickup Code: <span className="font-mono">{o.pickupCode || "—"}</span></p>
              <p>Delivery Code: <span className="font-mono">{o.deliveryCode || "—"}</span></p>
              <div className="flex gap-2">
                <Button onClick={() => verifyPickup(o.id)} disabled={!pickupCode || o.status !== "worker_assigned"}>Verify Pickup</Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {!loading && orders.length === 0 && (
          <p className="text-sm text-muted-foreground">No assignments found. Enter your worker ID and load assignments.</p>
        )}
      </div>
    </div>
  );
}