import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock data for demonstration
    const mockProducts = [
      {
        id: 1,
        sellerId: 1,
        title: "iPhone 15 Pro",
        description: "Premium smartphone with titanium design",
        priceCents: 99999,
        currency: "USD",
        stock: 25,
        photos: ["https://images.unsplash.com/photo-1696446701796-da61225697cc"],
        tags: ["smartphone", "apple", "premium"],
        city: "San Francisco",
        country: "United States",
        isActive: true,
        createdAt: "2024-01-15T00:00:00.000Z"
      },
      {
        id: 2,
        sellerId: 1,
        title: "MacBook Air M3",
        description: "Supercharged by the M3 chip",
        priceCents: 129999,
        currency: "USD",
        stock: 15,
        photos: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8"],
        tags: ["laptop", "apple", "business"],
        city: "San Francisco",
        country: "United States",
        isActive: true,
        createdAt: "2024-01-16T00:00:00.000Z"
      }
    ];

    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get('city');
    const q = searchParams.get('q');
    const sellerId = searchParams.get('sellerId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);

    let filtered = mockProducts;

    if (city) {
      filtered = filtered.filter(p => p.city === city);
    }

    if (q) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(q.toLowerCase()) || 
        p.description.toLowerCase().includes(q.toLowerCase())
      );
    }

    if (sellerId) {
      filtered = filtered.filter(p => p.sellerId === parseInt(sellerId));
    }

    const results = filtered.slice(0, limit);

    return NextResponse.json(results);
  } catch (error) {
    console.error('GET products error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error,
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sellerId, title, priceCents, stock } = body;

    // Basic validation
    if (!sellerId || !title || !priceCents || stock === undefined) {
      return NextResponse.json({ 
        error: 'Missing required fields: sellerId, title, priceCents, stock',
        code: 'MISSING_FIELDS'
      }, { status: 400 });
    }

    // Mock created product
    const newProduct = {
      id: Math.floor(Math.random() * 1000) + 100,
      sellerId: parseInt(sellerId),
      title: title.trim(),
      description: body.description || null,
      priceCents: parseInt(priceCents),
      currency: body.currency || 'USD',
      stock: parseInt(stock),
      photos: body.photos || [],
      tags: body.tags || [],
      city: body.city || null,
      country: body.country || null,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('POST product error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error,
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}