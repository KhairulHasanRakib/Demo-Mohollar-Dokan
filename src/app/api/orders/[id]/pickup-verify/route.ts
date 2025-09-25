import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = parseInt(params.id);
    if (isNaN(orderId)) {
      return NextResponse.json({ 
        error: "Valid order ID is required",
        code: "INVALID_ORDER_ID" 
      }, { status: 400 });
    }

    const { pickupCode, workerId } = await request.json();
    
    if (!pickupCode || typeof pickupCode !== 'string') {
      return NextResponse.json({ 
        error: "Pickup code is required",
        code: "MISSING_PICKUP_CODE" 
      }, { status: 400 });
    }

    if (!workerId || isNaN(parseInt(workerId.toString()))) {
      return NextResponse.json({ 
        error: "Valid worker ID is required",
        code: "MISSING_WORKER_ID" 
      }, { status: 400 });
    }

    // Mock pickup verification (in real app, validate pickup code matches order)
    const now = new Date().toISOString();

    // Mock updated order
    const updatedOrder = {
      id: orderId,
      buyerId: 1,
      sellerId: 1,
      productId: 1,
      quantity: 1,
      itemPriceCents: 99999,
      totalCents: 99999,
      currency: "USD",
      status: 'picked_up',
      pickupCode: pickupCode,
      deliveryCode: "XYZ789",
      escrowId: 1,
      createdAt: "2024-01-20T00:00:00.000Z",
      updatedAt: now
    };

    // Mock updated assignment
    const updatedAssignment = {
      id: 1,
      orderId: orderId,
      workerId: parseInt(workerId.toString()),
      status: 'picked_up',
      createdAt: "2024-01-20T00:00:00.000Z",
      updatedAt: now
    };

    return NextResponse.json({
      order: updatedOrder,
      assignment: updatedAssignment,
      message: "Pickup verified successfully"
    }, { status: 200 });

  } catch (error) {
    console.error('Pickup verification error:', error);
    return NextResponse.json({ 
      error: 'Internal server error during pickup verification: ' + error 
    }, { status: 500 });
  }
}