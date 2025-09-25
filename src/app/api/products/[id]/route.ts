import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products, profiles, sellers } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ 
        error: 'Valid product ID is required',
        code: 'INVALID_ID'
      }, { status: 400 });
    }

    const body = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body || 'sellerId' in body || 'seller_id' in body) {
      return NextResponse.json({ 
        error: 'User/seller ID cannot be provided in request body',
        code: 'USER_ID_NOT_ALLOWED'
      }, { status: 400 });
    }

    // Get profile for current user
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1);

    if (!profile || profile.activeRole !== 'seller') {
      return NextResponse.json({ 
        error: 'Only sellers can update products',
        code: 'SELLER_REQUIRED'
      }, { status: 403 });
    }

    // Get seller profile
    const [sellerProfile] = await db
      .select()
      .from(sellers)
      .where(eq(sellers.userId, profile.id))
      .limit(1);

    if (!sellerProfile) {
      return NextResponse.json({ 
        error: 'Seller profile not found',
        code: 'SELLER_NOT_FOUND'
      }, { status: 404 });
    }

    // Get product and check ownership
    const [product] = await db
      .select()
      .from(products)
      .where(and(eq(products.id, id), eq(products.sellerId, sellerProfile.id)))
      .limit(1);

    if (!product) {
      return NextResponse.json({ 
        error: 'Product not found or you do not have permission to update it',
        code: 'PRODUCT_NOT_FOUND_OR_UNAUTHORIZED'
      }, { status: 404 });
    }

    // Validate provided fields
    const updates: any = {};
    const allowedFields = ['title', 'description', 'priceCents', 'currency', 'stock', 'photos', 'tags', 'latitude', 'longitude', 'city', 'country', 'isActive'];

    for (const field of allowedFields) {
      if (field in body) {
        if (field === 'title' && typeof body[field] !== 'string') {
          return NextResponse.json({ 
            error: 'Title must be a string',
            code: 'INVALID_TITLE'
          }, { status: 400 });
        }
        if (field === 'description' && body[field] !== null && body[field] !== undefined && typeof body[field] !== 'string') {
          return NextResponse.json({ 
            error: 'Description must be a string or null',
            code: 'INVALID_DESCRIPTION'
          }, { status: 400 });
        }
        if ((field === 'priceCents' || field === 'stock') && typeof body[field] !== 'number') {
          return NextResponse.json({ 
            error: `${field} must be a number`,
            code: `INVALID_${field.toUpperCase()}`
          }, { status: 400 });
        }
        if (field === 'currency' && typeof body[field] !== 'string') {
          return NextResponse.json({ 
            error: 'Currency must be a string',
            code: 'INVALID_CURRENCY'
          }, { status: 400 });
        }
        if ((field === 'latitude' || field === 'longitude') && body[field] !== null && body[field] !== undefined && typeof body[field] !== 'number') {
          return NextResponse.json({ 
            error: `${field} must be a number or null`,
            code: `INVALID_${field.toUpperCase()}`
          }, { status: 400 });
        }
        if ((field === 'city' || field === 'country') && body[field] !== null && body[field] !== undefined && typeof body[field] !== 'string') {
          return NextResponse.json({ 
            error: `${field} must be a string or null`,
            code: `INVALID_${field.toUpperCase()}`
          }, { status: 400 });
        }
        if (field === 'isActive' && typeof body[field] !== 'boolean') {
          return NextResponse.json({ 
            error: 'isActive must be a boolean',
            code: 'INVALID_IS_ACTIVE'
          }, { status: 400 });
        }

        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ 
        error: 'No valid fields provided for update',
        code: 'NO_UPDATES'
      }, { status: 400 });
    }

    updates.updatedAt = new Date().toISOString();

    // Update product
    const [updatedProduct] = await db
      .update(products)
      .set(updates)
      .where(and(eq(products.id, id), eq(products.sellerId, sellerProfile.id)))
      .returning();

    return NextResponse.json(updatedProduct, { status: 200 });

  } catch (error) {
    console.error('PATCH product error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}