import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = parseInt(params.id);
    if (isNaN(orderId)) {
      return NextResponse.json({ error: 'Valid order ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { deliveryCode } = body;

    if (!deliveryCode) {
      return NextResponse.json({ error: 'Delivery code is required' }, { status: 400 });
    }

    const currentTime = new Date().toISOString();

    // Mock delivery verification - Complete order and release escrow
    const finalOrder = {
      id: orderId,
      buyerId: 1,
      sellerId: 1,
      productId: 1,
      quantity: 1,
      itemPriceCents: 99999,
      totalCents: 99999,
      currency: "USD",
      status: 'completed', // Final status
      pickupCode: "ABC123",
      deliveryCode: deliveryCode,
      escrowId: 1,
      createdAt: "2024-01-20T00:00:00.000Z",
      updatedAt: currentTime
    };

    // Mock updated escrow - Released
    const updatedEscrow = {
      id: 1,
      orderId: orderId,
      amountCents: 99999,
      currency: "USD",
      status: 'released', // Released to seller
      createdAt: "2024-01-20T00:00:00.000Z",
      updatedAt: currentTime
    };

    // Mock updated assignment - Delivered
    const updatedAssignment = {
      id: 1,
      orderId: orderId,
      workerId: 1,
      status: 'delivered',
      createdAt: "2024-01-20T00:00:00.000Z",
      updatedAt: currentTime
    };

    return NextResponse.json({
      order: finalOrder,
      escrow: updatedEscrow,
      assignment: updatedAssignment,
      message: "Delivery verified, order completed, and escrow released"
    });
  } catch (error) {
    console.error('Delivery verification error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}