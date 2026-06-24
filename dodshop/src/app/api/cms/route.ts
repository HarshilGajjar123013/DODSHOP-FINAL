import { NextResponse } from 'next/server';
import { prisma, fallbackDb } from '@/lib/db';

export async function GET() {
  try {
    let cmsConfig = null;
    let databaseConnected = true;

    try {
      cmsConfig = await prisma.cMSConfig.findUnique({
        where: { id: 'singleton' }
      });
    } catch (dbError) {
      databaseConnected = false;
    }

    if (!databaseConnected || !cmsConfig) {
      cmsConfig = fallbackDb.getCmsConfig();
    }

    return NextResponse.json({
      success: true,
      cms: cmsConfig
    });
  } catch (err: any) {
    console.error('[CMS CONFIG GET ERROR]', err);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve CMS configuration' },
      { status: 500 }
    );
  }
}
