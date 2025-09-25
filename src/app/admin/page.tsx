"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AdminPage() {
  const [escrowId, setEscrowId] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const doAction = async (action: "release" | "refund") => {
    if (!escrowId) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/escrow/${encodeURIComponent(escrowId)}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action === "refund" ? { reason } : {}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `Failed to ${action} escrow`);
      setMessage(`Escrow ${action} successful (id ${escrowId}).`);
    } catch (e: any) {
      setError(e.message || `Failed to ${action} escrow`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
            <div className="md:col-span-2">
              <Label htmlFor="escrow">Escrow ID</Label>
              <Input id="escrow" placeholder="e.g. 1" value={escrowId} onChange={(e) => setEscrowId(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Button onClick={() => doAction("release")} disabled={!escrowId || loading}>
                {loading ? "Processing..." : "Release Escrow"}
              </Button>
            </div>
            <div className="md:col-span-2">
              <Button variant="destructive" onClick={() => doAction("refund")} disabled={!escrowId || loading}>
                Refund Escrow
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="reason">Refund reason (optional)</Label>
            <Textarea id="reason" placeholder="Reason for refund" value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-green-700">{message}</p>}
        </CardContent>
      </Card>
    </div>
  );
}