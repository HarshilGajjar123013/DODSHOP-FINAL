import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fallbackDb } from '@/lib/fallbackDb';
import { cmsConfigSchema } from '@/lib/validators';
import { randomUUID } from 'crypto';

export async function GET() {
  try {
    let cmsConfig = null;
    let databaseConnected = true;

    try {
      cmsConfig = await prisma.cMSConfig.findUnique({
        where: { id: 'singleton' }
      });
    } catch (dbError) {
      console.warn('⚠️ Database query failed, using fallback JSON DB.');
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
    console.error('CMS GET error:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve CMS configuration' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const userRole = req.headers.get('x-user-role') || 'SUPER_ADMIN';
    const userId = req.headers.get('x-user-id') || 'system';

    const body = await req.json();
    
    // Validate request
    const parsed = cmsConfigSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const updates = parsed.data;

    let cmsConfig = null;
    let databaseConnected = true;

    try {
      // Upsert singleton config
      const existing = await prisma.cMSConfig.findUnique({
        where: { id: 'singleton' }
      });

      if (existing) {
        cmsConfig = await prisma.cMSConfig.update({
          where: { id: 'singleton' },
          data: updates
        });
      } else {
        cmsConfig = await prisma.cMSConfig.create({
          data: {
            id: 'singleton',
            heroTitle: updates.heroTitle || 'Designs of Dreams — Heritage & Couture Atelier',
            heroSubtitle: updates.heroSubtitle || 'Hand-woven luxury ethnic wear preserving the royal weaves of India.',
            heroImage: updates.heroImage || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200',
            announcementText: updates.announcementText || 'Atelier Booking Alert: Virtual consultations for the Autumn/Winter Bridal Collection are now open.',
            announcementLink: updates.announcementLink || '/bookings',
            announcementActive: updates.announcementActive !== undefined ? updates.announcementActive : true,
            featuredCollections: updates.featuredCollections || [
              { id: 'coll-1', name: 'Bridal Collections', image: 'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?q=80&w=300', count: 18 },
              { id: 'coll-2', name: 'Heritage Weaves', image: 'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?q=80&w=300', count: 24 },
              { id: 'coll-3', name: 'Premium Kurtis & Sets', image: 'https://images.unsplash.com/photo-1609357518652-6cf0416f0cbe?q=80&w=300', count: 12 }
            ],
            bannerMiddle: updates.bannerMiddle || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200',
            footerBio: updates.footerBio || 'Designs of Dreams is a curated marketplace celebrating premium Indian heritage textiles.',
            seoTitle: updates.seoTitle || 'Designs of Dreams — Luxury Indian Ethnic Wear & Bridal Couture',
            seoDescription: updates.seoDescription || 'Discover hand-woven Kanjeevarams, double-ikat Patan Patolas, zardozi blouses, and bespoke chikankari kurtis.',
            ...updates
          } as any
        });
      }

      // Audit Log
      await prisma.securityLog.create({
        data: {
          action: 'Updated Homepage CMS Configurations',
          adminName: `Admin ID: ${userId}`,
          role: userRole,
          status: 'SUCCESS'
        }
      });
    } catch (dbError) {
      console.warn('⚠️ Database patch failed, falling back to JSON DB:', dbError);
      databaseConnected = false;
    }

    if (!databaseConnected) {
      const current = fallbackDb.getCmsConfig();
      const newConfig = {
        ...current,
        ...updates
      };
      fallbackDb.saveCmsConfig(newConfig);
      cmsConfig = newConfig;

      // Audit Log Fallback
      const secLogs = fallbackDb.getCollection('securityLogs');
      secLogs.push({
        id: randomUUID(),
        timestamp: new Date().toISOString(),
        action: 'Updated Homepage CMS Configurations (Fallback)',
        adminName: `Admin ID: ${userId}`,
        role: userRole,
        status: 'SUCCESS'
      });
      fallbackDb.saveCollection('securityLogs', secLogs);
    }

    return NextResponse.json({
      success: true,
      cms: cmsConfig
    });
  } catch (err: any) {
    console.error('CMS PATCH error:', err);
    return NextResponse.json(
      { error: 'Failed to update CMS configuration' },
      { status: 500 }
    );
  }
}
