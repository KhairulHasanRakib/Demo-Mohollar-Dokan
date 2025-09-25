import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const currentTime = new Date().toISOString();
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: currentTime,
      database: {
        status: 'skipped - basic health check',
        responseTimeMs: Date.now() - startTime
      },
      uptime: process.uptime()
    });
    
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 });
  }
}