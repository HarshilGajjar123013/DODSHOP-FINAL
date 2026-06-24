import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fallbackDb } from '@/lib/fallbackDb';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const skip = (page - 1) * limit;

    let logs = [];
    let total = 0;
    let databaseConnected = true;

    try {
      logs = await prisma.inventoryLog.findMany({
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
      });
      total = await prisma.inventoryLog.count();
    } catch (dbError) {
      console.warn('⚠️ Database query failed. Falling back to local JSON database:', dbError);
      databaseConnected = false;
    }

    if (!databaseConnected) {
      const allLogs = fallbackDb.getCollection('inventoryLogs');
      // Sort desc
      allLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      total = allLogs.length;
      logs = allLogs.slice(skip, skip + limit);
    }

    return NextResponse.json({
      success: true,
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }
    });

  } catch (err: any) {
    console.error('Inventory logs GET error:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve inventory logs' },
      { status: 500 }
    );
  }
}
