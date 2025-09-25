import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = parseInt(params.id);
    if (isNaN(orderId)) {
      return NextResponse.json({ 
        error: 'Valid order ID is required',
        code: 'INVALID_ORDER_ID'
      }, { status: 400 });
    }

    // Mock order acceptance
    const updatedOrder = {
      id: orderId,
      buyerId: 1,
      sellerId: 1,
      productId: 1,
      quantity: 1,
      itemPriceCents: 99999,
      totalCents: 99999,
      currency: "USD",
      status: 'seller_accepted', // Updated status
      escrowId: 1,
      createdAt: "2024-01-20T00:00:00.000Z",
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      order: updatedOrder,
      message: "Order accepted by seller"
    }, { status: 200 });

  } catch (error) {
    console.error('Order accept error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error,
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}