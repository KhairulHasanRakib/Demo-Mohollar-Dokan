import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock sellers data
    const mockSellers = [
      {
        id: 1,
        displayName: "TechHub SF",
        description: "Premium electronics and gadgets store in San Francisco",
        rating: 4.8,
        city: "San Francisco",
        country: "United States",
        latitude: 37.7749,
        longitude: -122.4194,
        createdAt: "2024-01-10T00:00:00.000Z"
      },
      {
        id: 2,
        displayName: "StyleWorks LA",
        description: "Trendy fashion and accessories for modern lifestyle",
        rating: 4.5,
        city: "Los Angeles", 
        country: "United States",
        latitude: 34.0522,
        longitude: -118.2437,
        createdAt: "2024-02-05T00:00:00.000Z"
      },
      {
        id: 3,
        displayName: "ElectroMart Chicago",
        description: "Affordable consumer electronics and computer parts",
        rating: 4.2,
        city: "Chicago",
        country: "United States", 
        latitude: 41.8781,
        longitude: -87.6298,
        createdAt: "2024-03-12T00:00:00.000Z"
      }
    ];

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('q') || '';
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    let filtered = mockSellers;

    if (search) {
      filtered = filtered.filter(s => 
        s.displayName.toLowerCase().includes(search.toLowerCase())
      );
    }

    const results = filtered.slice(offset, offset + limit);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET /api/sellers error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error,
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, displayName } = body;

    if (!userId || !displayName) {
      return NextResponse.json({ 
        error: 'userId and displayName are required',
        code: 'MISSING_FIELDS'
      }, { status: 400 });
    }

    // Mock created seller
    const newSeller = {
      id: Math.floor(Math.random() * 1000) + 100,
      userId: parseInt(userId),
      displayName: displayName.trim(),
      description: body.description || null,
      rating: 0,
      city: body.city || null,
      country: body.country || null,
      latitude: body.latitude || null,
      longitude: body.longitude || null,
      createdAt: new Date().toISOString()
    };

    return NextResponse.json(newSeller, { status: 201 });
  } catch (error) {
    console.error('POST /api/sellers error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error,
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}