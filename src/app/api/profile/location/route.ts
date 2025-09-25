import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, latitude, longitude, city, country } = body;

    // Validate required fields
    if (!userId || isNaN(parseInt(userId))) {
      return NextResponse.json({ 
        error: 'Valid userId is required',
        code: 'MISSING_USER_ID'
      }, { status: 400 });
    }

    // Validate latitude if provided
    if (latitude !== undefined && latitude !== null) {
      if (isNaN(parseFloat(latitude)) || Math.abs(parseFloat(latitude)) > 90) {
        return NextResponse.json({ 
          error: 'Latitude must be a valid number between -90 and 90',
          code: 'INVALID_LATITUDE'
        }, { status: 400 });
      }
    }

    // Validate longitude if provided
    if (longitude !== undefined && longitude !== null) {
      if (isNaN(parseFloat(longitude)) || Math.abs(parseFloat(longitude)) > 180) {
        return NextResponse.json({ 
          error: 'Longitude must be a valid number between -180 and 180',
          code: 'INVALID_LONGITUDE'
        }, { status: 400 });
      }
    }

    // Mock updated profile
    const updatedProfile = {
      id: 1,
      userId: parseInt(userId),
      name: "Test User",
      email: "test@example.com",
      phone: "+1-555-0000",
      roles: ["buyer"],
      activeRole: "buyer",
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      city: city?.trim() || null,
      country: country?.trim() || null,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json(updatedProfile, { status: 200 });

  } catch (error) {
    console.error('POST /api/profile/location error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}