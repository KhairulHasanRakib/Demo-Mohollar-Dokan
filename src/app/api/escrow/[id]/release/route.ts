import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { profiles, escrows, orders, audits } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid escrow ID is required",
        code: "INVALID_ESCROW_ID" 
      }, { status: 400 });
    }

    const profile = await db.select()
      .from(profiles)
      .where(eq(profiles.userId, 1)) // Mock auth - replace with actual auth
      .limit(1);

    if (profile.length === 0) {
      return NextResponse.json({ 
        error: "Profile not found",
        code: "PROFILE_NOT_FOUND" 
      }, { status: 401 });
    }

    const userRoles = profile[0].roles as string[];
    
    if (!userRoles.includes('admin')) {
      return NextResponse.json({ 
        error: "Admin access required",
        code: "INSUFFICIENT_PRIVILEGES" 
      }, { status: 403 });
    }

    const escrow = await db.select()
      .from(escrows)
      .where(eq(escrows.id, parseInt(id)))
      .limit(1);

    if (escrow.length === 0) {
      return NextResponse.json({ 
        error: "Escrow not found",
        code: "ESCROW_NOT_FOUND" 
      }, { status: 404 });
    }

    const currentEscrow = escrow[0];
    
    if (currentEscrow.status !== 'frozen') {
      return NextResponse.json({ 
        error: "Escrow must be in frozen status to release",
        code: "INVALID_ESCROW_STATUS" 
      }, { status: 400 });
    }

    const updatedEscrow = await db.update(escrows)
      .set({
        status: 'released',
        updatedAt: new Date().toISOString()
      })
      .where(eq(escrows.id, parseInt(id)))
      .returning();

    await db.insert(audits).values({
      actorProfileId: profile[0].id,
      action: 'escrow_released',
      entityType: 'escrow',
      entityId: parseInt(id),
      meta: { 
        previousStatus: 'frozen', 
        newStatus: 'released',
        amount: currentEscrow.amountCents,
        currency: currentEscrow.currency 
      },
      createdAt: new Date().toISOString()
    });

    const relatedOrder = await db.select()
      .from(orders)
      .where(eq(orders.escrowId, parseInt(id)))
      .limit(1);

    if (relatedOrder.length > 0) {
      await db.update(orders)
        .set({
          status: 'released',
          updatedAt: new Date().toISOString()
        })
        .where(eq(orders.escrowId, parseInt(id)));
    }

    return NextResponse.json(updatedEscrow[0]);
  } catch (error) {
    console.error('POST escrow release error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}