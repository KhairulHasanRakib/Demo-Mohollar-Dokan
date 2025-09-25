"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

type Role = "buyer" | "seller" | "worker";

type Product = {
  id: number;
  sellerId: number;
  title: string;
  description?: string | null;
  priceCents: number;
  currency: string;
  stock: number;
  photos?: string[] | string | null;
  tags?: string[] | string | null;
  city?: string | null;
  country?: string | null;
  createdAt?: string;
};

function formatPrice(cents: number, currency = "USD") {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(cents / 100);
  } catch {
    return `$${(cents / 100).toFixed(2)}`;
  }
}

export default function HomePage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("buyer");
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState(10);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Order dialog state
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [buyerId, setBuyerId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [orderMessage, setOrderMessage] = useState<string | null>(null);

  const nearParam = useMemo(() => (coords ? `${coords.lat},${coords.lon}` : null), [coords]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (city) params.set("city", city);
      if (nearParam) params.set("near", nearParam);
      if (nearParam) params.set("radiusKm", String(radiusKm));
      params.set("limit", "24");
      const res = await fetch(`/api/products?${params.toString()}`);
      if (!res.ok) throw new Error(`Failed to load products (${res.status})`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(5));
        const lon = Number(pos.coords.longitude.toFixed(5));
        setCoords({ lat, lon });
      },
      (err) => setError(err.message || "Failed to get location"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    // refetch when filters change
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, query, nearParam, radiusKm]);

  const openOrderDialog = (p: Product) => {
    setSelectedProduct(p);
    setQuantity(1);
    setOrderMessage(null);
    setOpen(true);
  };

  const createOrder = async () => {
    if (!selectedProduct) return;
    if (!buyerId) {
      setOrderMessage("Please enter your buyer profile ID.");
      return;
    }
    setCreatingOrder(true);
    setOrderMessage(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerId: Number(buyerId),
          sellerId: selectedProduct.sellerId,
          productId: selectedProduct.id,
          quantity: Number(quantity),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Order creation failed");
      }
      setOrderMessage("Order created with escrow frozen. You can track it in your dashboard.");
    } catch (e: any) {
      setOrderMessage(e.message || "Order failed");
    } finally {
      setCreatingOrder(false);
    }
  };

  const heroImage = "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=1600&auto=format&fit=crop";

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative h-[320px] w-full overflow-hidden rounded-b-xl">
        <Image src={heroImage} alt="Marketplace" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-3xl md:text-5xl font-bold">Trusted Marketplace with Escrow</h1>
            <p className="mt-3 max-w-2xl mx-auto text-white/80">
              Shop locally, sell confidently, and deliver securely with code verification.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <Button variant="secondary" onClick={() => router.push("/sign-in")}>Sign in</Button>
              <Button onClick={() => router.push("/sign-up")}>Create account</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <Card>
          <CardHeader className="gap-2">
            <CardTitle>Browse products</CardTitle>
            <CardDescription>Filter by role, search, and your location.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Role */}
            <div className="md:col-span-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v: Role) => setRole(v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="buyer">Customer</SelectItem>
                  <SelectItem value="seller">Seller</SelectItem>
                  <SelectItem value="worker">Worker</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* City */}
            <div className="md:col-span-3">
              <Label htmlFor="city">City</Label>
              <Input id="city" placeholder="e.g. San Francisco" className="mt-1" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>

            {/* Search */}
            <div className="md:col-span-4">
              <Label htmlFor="q">Search</Label>
              <Input id="q" placeholder="Search products" className="mt-1" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>

            {/* Location */}
            <div className="md:col-span-3">
              <Label>Location filter</Label>
              <div className="mt-1 flex gap-2">
                <Button variant="outline" onClick={detectLocation}>Detect</Button>
                <Input
                  placeholder="lat,lon"
                  value={coords ? `${coords.lat},${coords.lon}` : ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    const parts = val.split(",");
                    if (parts.length === 2) {
                      const lat = parseFloat(parts[0]);
                      const lon = parseFloat(parts[1]);
                      if (!isNaN(lat) && !isNaN(lon)) setCoords({ lat, lon });
                    }
                  }}
                />
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Label htmlFor="radius" className="text-sm text-muted-foreground">Radius (km)</Label>
                <Input id="radius" type="number" min={1} max={100} className="w-24" value={radiusKm} onChange={(e) => setRadiusKm(Number(e.target.value || 10))} />
                <Button variant="secondary" onClick={fetchProducts}>Apply</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <div className="mt-4 p-3 rounded-md bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Products Grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading && Array.from({ length: 6 }).map((_, i) => (
            <Card key={`skeleton-${i}`}>
              <Skeleton className="h-40 w-full" />
              <CardContent className="space-y-2 pt-4">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}

          {!loading && products.map((p) => {
            const photos = Array.isArray(p.photos)
              ? p.photos
              : typeof p.photos === "string"
              ? (() => { try { const arr = JSON.parse(p.photos); return Array.isArray(arr) ? arr : []; } catch { return []; } })()
              : [];
            const photo = photos[0] || "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?q=80&w=1200&auto=format&fit=crop";
            return (
              <Card key={p.id} className="overflow-hidden">
                <div className="relative h-40 w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo} alt={p.title} className="h-40 w-full object-cover" />
                </div>
                <CardHeader className="py-3">
                  <CardTitle className="text-base line-clamp-1">{p.title}</CardTitle>
                  <CardDescription className="flex items-center justify-between">
                    <span>{formatPrice(p.priceCents, p.currency)}</span>
                    <span className="text-xs">{p.city || "—"}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center gap-2">
                  <Button className="w-full" onClick={() => openOrderDialog(p)} disabled={role !== "buyer"}>
                    {role === "buyer" ? "Buy with Escrow" : "Switch to Customer to buy"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Order Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Product</Label>
              <div className="text-sm text-muted-foreground mt-1">{selectedProduct?.title}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="buyerId">Your Buyer Profile ID</Label>
                <Input id="buyerId" placeholder="e.g. 7" value={buyerId} onChange={(e) => setBuyerId(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="qty">Quantity</Label>
                <Input id="qty" type="number" min={1} value={quantity} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value || 1)))} />
              </div>
            </div>
            {orderMessage && <p className="text-sm text-muted-foreground">{orderMessage}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
            <Button onClick={createOrder} disabled={creatingOrder}>
              {creatingOrder ? "Creating..." : "Create Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto p-6 text-sm text-muted-foreground">
        <p>
          This demo uses role-based navigation and an escrow workflow. Visit your <button className="underline" onClick={() => router.push("/dashboard")}>dashboard</button> to manage orders.
        </p>
      </footer>
    </div>
  );
}