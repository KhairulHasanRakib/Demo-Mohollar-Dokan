import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get('role') as 'buyer' | 'seller' | 'worker';

    if (!role || !['buyer', 'seller', 'worker'].includes(role)) {
      return NextResponse.json({ 
        error: "Valid role parameter is required: buyer, seller, or worker",
        code: "INVALID_ROLE" 
      }, { status: 400 });
    }

    // Mock orders data for each role
    const mockOrders = {
      buyer: [
        {
          id: 1,
          buyerId: 1,
          sellerId: 1,
          productId: 1,
          quantity: 1,
          itemPriceCents: 99999,
          totalCents: 99999,
          currency: "USD",
          status: "payment_frozen",
          escrowId: 1,
          createdAt: "2024-01-20T00:00:00.000Z",
          product: {
            title: "iPhone 15 Pro",
            description: "Premium smartphone"
          },
          escrow: {
            id: 1,
            amountCents: 99999,
            status: "frozen"
          }
        }
      ],
      seller: [
        {
          id: 2,
          buyerId: 2,
          sellerId: 1,
          productId: 2,
          quantity: 1,
          itemPriceCents: 129999,
          totalCents: 129999,
          currency: "USD",
          status: "seller_accepted",
          escrowId: 2,
          createdAt: "2024-01-21T00:00:00.000Z",
          product: {
            title: "MacBook Air M3",
            description: "Supercharged by M3 chip"
          }
        }
      ],
      worker: [
        {
          id: 3,
          buyerId: 3,
          sellerId: 2,
          productId: 3,
          quantity: 2,
          itemPriceCents: 12999,
          totalCents: 25998,
          currency: "USD",
          status: "worker_assigned",
          pickupCode: "ABC123",
          deliveryCode: "XYZ789",
          createdAt: "2024-01-22T00:00:00.000Z"
        }
      ]
    };

    return NextResponse.json(mockOrders[role] || []);
  } catch (error) {
    console.error('GET /api/orders error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { buyerId, sellerId, productId, quantity } = body;

    // Validate required fields
    if (!buyerId || !sellerId || !productId || !quantity) {
      return NextResponse.json({ 
        error: "Missing required fields: buyerId, sellerId, productId, quantity",
        code: "MISSING_FIELDS" 
      }, { status: 400 });
    }

    // Mock price calculation
    const mockItemPrice = 99999; // $999.99
    const totalCents = quantity * mockItemPrice;

    // Mock order creation with escrow
    const orderId = Math.floor(Math.random() * 1000) + 100;
    const escrowId = Math.floor(Math.random() * 1000) + 100;

    const newOrder = {
      id: orderId,
      buyerId: parseInt(buyerId),
      sellerId: parseInt(sellerId),
      productId: parseInt(productId),
      quantity: parseInt(quantity),
      itemPriceCents: mockItemPrice,
      totalCents: totalCents,
      currency: "USD",
      status: "payment_frozen", // Simulated payment processed
      escrowId: escrowId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const escrow = {
      id: escrowId,
      orderId: orderId,
      amountCents: totalCents,
      currency: "USD", 
      status: "frozen",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      ...newOrder,
      escrow: escrow
    }, { status: 201 });

  } catch (error) {
    console.error('POST /api/orders error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}