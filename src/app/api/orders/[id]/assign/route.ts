import { NextRequest, NextResponse } from 'next/server';

function generateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = parseInt(params.id);
    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: 'Valid order ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { workerId } = body;

    if (!workerId || isNaN(parseInt(workerId))) {
      return NextResponse.json(
        { error: 'Valid workerId is required', code: 'MISSING_WORKER_ID' },
        { status: 400 }
      );
    }

    // Generate pickup and delivery codes
    const pickupCode = generateCode();
    const deliveryCode = generateCode();

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
      status: 'worker_assigned',
      pickupCode,
      deliveryCode,
      escrowId: 1,
      createdAt: "2024-01-20T00:00:00.000Z",
      updatedAt: new Date().toISOString()
    };

    // Mock assignment
    const assignment = {
      id: Math.floor(Math.random() * 1000) + 100,
      orderId: orderId,
      workerId: parseInt(workerId),
      status: 'requested',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      order: updatedOrder,
      assignment,
      pickupCode,
      deliveryCode,
      message: "Worker assigned successfully"
    });

  } catch (error) {
    console.error('Assign worker error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error, code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}