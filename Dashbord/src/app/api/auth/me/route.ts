import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { fallbackDb } from '@/lib/fallbackDb';

export async function GET() {
  let databaseConnected = true;
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Try to get fresh details from the DB (if connected)
    try {
      const admin = await prisma.adminUser.findUnique({
        where: { id: session.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          status: true,
        }
      });

      if (admin) {
        if (admin.status !== 'ACTIVE') {
          return NextResponse.json(
            { error: 'Account has been deactivated' },
            { status: 403 }
          );
        }

        return NextResponse.json({
          authenticated: true,
          user: {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
            avatar: admin.avatar || admin.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
          }
        });
      }
    } catch (dbError) {
      console.warn('⚠️ Database disconnected during me query, using JSON fallback DB or token data.');
      databaseConnected = false;
    }

    if (!databaseConnected) {
      const admins = fallbackDb.getCollection('admins');
      const admin = admins.find(a => a.id === session.id);
      if (admin) {
        if (admin.status !== 'ACTIVE') {
          return NextResponse.json(
            { error: 'Account has been deactivated' },
            { status: 403 }
          );
        }
        return NextResponse.json({
          authenticated: true,
          user: {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
            avatar: admin.avatar || admin.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
          }
        });
      }
    }

    // Fallback: Return JWT payload directly if DB and fallback DB are disconnected or mock user
    const avatar = session.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.id,
        name: session.name,
        email: session.email,
        role: session.role,
        avatar: avatar,
      }
    });

  } catch (err: any) {
    console.error('Session query error:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve active session' },
      { status: 500 }
    );
  }
}
