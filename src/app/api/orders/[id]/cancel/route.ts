import { NextRequest, NextResponse } from 'next/server';

const CANCELABLE_STATUSES = ['pending_payment', 'payment_frozen', 'seller_accepted', 'worker_assigned', 'picked_up'];

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = parseInt(params.id);
    
    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: 'Invalid order ID', code: 'INVALID_ORDER_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { reason } = body;

    if (reason && typeof reason !== 'string') {
      return NextResponse.json(
        { error: 'Reason must be a string', code: 'INVALID_REASON' },
        { status: 400 }
      );
    }

    // Mock order cancellation
    const cancelledOrder = {
      id: orderId,
      buyerId: 1,
      sellerId: 1,
      productId: 1,
      quantity: 1,
      itemPriceCents: 99999,
      totalCents: 99999,
      currency: "USD",
      status: 'cancelled',
      escrowId: 1,
      createdAt: "2024-01-20T00:00:00.000Z",
      updatedAt: new Date().toISOString()
    };

    // Mock refunded escrow
    const refundedEscrow = {
      id: 1,
      orderId: orderId,
      amountCents: 99999,
      currency: "USD",
      status: 'refunded',
      createdAt: "2024-01-20T00:00:00.000Z",
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      order: cancelledOrder,
      escrow: refundedEscrow,
      message: 'Order cancelled successfully',
      reason: reason || null
    });

  } catch (error) {
    console.error('Order cancellation error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error, code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}