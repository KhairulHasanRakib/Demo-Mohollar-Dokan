import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sellers, products, profiles } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sellerId = parseInt(params.id);
    
    if (isNaN(sellerId)) {
      return NextResponse.json(
        { error: 'Valid seller ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const sellerResults = await db
      .select({
        id: sellers.id,
        displayName: sellers.displayName,
        description: sellers.description,
        rating: sellers.rating,
        latitude: sellers.latitude,
        longitude: sellers.longitude,
        city: sellers.city,
        country: sellers.country,
        createdAt: sellers.createdAt,
      })
      .from(sellers)
      .where(eq(sellers.id, sellerId))
      .limit(1);

    if (sellerResults.length === 0) {
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      );
    }

    const seller = sellerResults[0];

    const productResults = await db
      .select({
        id: products.id,
        title: products.title,
        description: products.description,
        priceCents: products.priceCents,
        currency: products.currency,
        stock: products.stock,
        photos: products.photos,
        tags: products.tags,
        city: products.city,
        country: products.country,
        isActive: products.isActive,
        createdAt: products.createdAt,
      })
      .from(products)
      .where(eq(products.sellerId, sellerId))
      .orderBy(desc(products.createdAt));

    return NextResponse.json({
      ...seller,
      products: productResults,
    });
  } catch (error) {
    console.error('GET seller error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    const sellerId = parseInt(params.id);
    
    if (isNaN(sellerId)) {
      return NextResponse.json(
        { error: 'Valid seller ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    if (
      'userId' in body ||
      'user_id' in body ||
      'id' in body ||
      'createdAt' in body ||
      'updatedAt' in body
    ) {
      return NextResponse.json(
        { error: 'Restricted fields cannot be updated', code: 'RESTRICTED_FIELDS' },
        { status: 400 }
      );
    }

    const allowedFields = [
      'displayName',
      'description',
      'latitude',
      'longitude',
      'city',
      'country',
    ];

    const updates: Record<string, any> = {};
    let hasUpdates = false;

    for (const field of allowedFields) {
      if (field in body) {
        const value = body[field];
        if (field === 'displayName') {
          if (typeof value !== 'string' || value.trim().length === 0) {
            return NextResponse.json(
              { error: 'Display name must be a non-empty string', code: 'INVALID_DISPLAY_NAME' },
              { status: 400 }
            );
          }
          updates[field] = value.trim();
          hasUpdates = true;
        } else if (field === 'description') {
          if (value !== null && value !== undefined && typeof value !== 'string') {
            return NextResponse.json(
              { error: 'Description must be a string or null', code: 'INVALID_DESCRIPTION' },
              { status: 400 }
            );
          }
          updates[field] = value || null;
          hasUpdates = true;
        } else if (['latitude', 'longitude'].includes(field)) {
          if (value !== null && value !== undefined) {
            const num = parseFloat(value);
            if (isNaN(num)) {
              return NextResponse.json(
                { error: `${field} must be a valid number`, code: `INVALID_${field.toUpperCase()}` },
                { status: 400 }
              );
            }
            updates[field] = num;
            hasUpdates = true;
          } else {
            updates[field] = null;
            hasUpdates = true;
          }
        } else {
          if (value !== null && value !== undefined && typeof value !== 'string') {
            return NextResponse.json(
              { error: `${field} must be a string or null`, code: `INVALID_${field.toUpperCase()}` },
              { status: 400 }
            );
          }
          updates[field] = value || null;
          hasUpdates = true;
        }
      }
    }

    if (!hasUpdates) {
      return NextResponse.json(
        { error: 'No valid fields provided for update', code: 'NO_UPDATES' },
        { status: 400 }
      );
    }

    const profileResults = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1);

    if (profileResults.length === 0) {
      return NextResponse.json(
        { error: 'Profile not found', code: 'PROFILE_NOT_FOUND' },
        { status: 404 }
      );
    }

    const profileId = profileResults[0].id;

    const sellerCheck = await db
      .select({ id: sellers.id })
      .from(sellers)
      .where(and(eq(sellers.id, sellerId), eq(sellers.userId, profileId)))
      .limit(1);

    if (sellerCheck.length === 0) {
      return NextResponse.json(
        { error: 'Seller not found or access denied' },
        { status: 404 }
      );
    }

    const updatedSeller = await db
      .update(sellers)
      .set({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(sellers.id, sellerId))
      .returning();

    return NextResponse.json(updatedSeller[0]);
  } catch (error) {
    console.error('PATCH seller error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}