import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { escrows, orders, profiles, audits } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const escrowId = parseInt(params.id);
    if (isNaN(escrowId)) {
      return NextResponse.json(
        { error: 'Valid escrow ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const profile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1);

    if (profile.length === 0) {
      return NextResponse.json(
        { error: 'Profile not found', code: 'PROFILE_NOT_FOUND' },
        { status: 404 }
      );
    }

    const userRoles = profile[0].roles as string[];
    if (!userRoles.includes('admin')) {
      return NextResponse.json(
        { error: 'Admin privileges required', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { reason } = body;

    if (reason !== undefined && typeof reason !== 'string') {
      return NextResponse.json(
        { error: 'Reason must be a string', code: 'INVALID_REASON' },
        { status: 400 }
      );
    }

    const escrow = await db
      .select()
      .from(escrows)
      .where(eq(escrows.id, escrowId))
      .limit(1);

    if (escrow.length === 0) {
      return NextResponse.json(
        { error: 'Escrow not found', code: 'ESCROW_NOT_FOUND' },
        { status: 404 }
      );
    }

    const existingEscrow = escrow[0];

    if (existingEscrow.status !== 'frozen') {
      return NextResponse.json(
        { 
          error: 'Escrow must be in frozen status to refund', 
          code: 'INVALID_STATUS' 
        },
        { status: 400 }
      );
    }

    const updatedEscrow = await db
      .update(escrows)
      .set({
        status: 'refunded',
        updatedAt: new Date().toISOString()
      })
      .where(eq(escrows.id, escrowId))
      .returning();

    const relatedOrder = await db
      .select()
      .from(orders)
      .where(eq(orders.escrowId, escrowId))
      .limit(1);

    if (relatedOrder.length > 0) {
      await db
        .update(orders)
        .set({
          status: 'cancelled',
          updatedAt: new Date().toISOString()
        })
        .where(eq(orders.id, relatedOrder[0].id));
    }

    const auditEntry = await db
      .insert(audits)
      .values({
        actorProfileId: profile[0].id,
        action: 'escrow_refund',
        entityType: 'escrow',
        entityId: escrowId,
        meta: {
          reason: reason || null,
          previousStatus: 'frozen',
          newStatus: 'refunded',
          refundedAmountCents: existingEscrow.amountCents,
          currency: existingEscrow.currency
        },
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json({
      ...updatedEscrow[0],
      auditLogId: auditEntry[0].id
    });
  } catch (error) {
    console.error('Escrow refund error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}