// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Image Upload API — Local File Storage
// Saves to both Dashboard and Storefront public folders
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, copyFile } from 'fs/promises';
import path from 'path';
import { uploadToCloudinary } from '@/lib/cloudinary';

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

const isReadOnlyEnv = !!(process.env.VERCEL || process.env.NODE_ENV === 'production');

// Dashboard uploads directory (for admin preview)
const DASHBOARD_UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'products');

// Storefront uploads directory (for customer-facing site)
const STOREFRONT_UPLOAD_DIR = path.resolve(process.cwd(), '..', 'dodshop', 'public', 'uploads', 'products');

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      );
    }

    // Validate each file
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { success: false, error: `Invalid file type: ${file.type}. Allowed: JPEG, PNG, WEBP, AVIF` },
          { status: 400 }
        );
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { success: false, error: `File "${file.name}" exceeds 4MB limit (${(file.size / 1024 / 1024).toFixed(1)}MB)` },
          { status: 400 }
        );
      }
    }

    const isCloudinaryConfigured =
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_CLOUD_NAME !== 'your-cloud-name';

    if (isReadOnlyEnv && !isCloudinaryConfigured) {
      return NextResponse.json(
        {
          success: false,
          error: 'Local filesystem is read-only on Vercel. Please configure Cloudinary environment variables (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) to enable uploads in production.'
        },
        { status: 400 }
      );
    }

    // Save each file (Cloudinary if configured, otherwise local fallback for local development)
    const uploadResults = await Promise.all(
      files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        if (isCloudinaryConfigured) {
          const uploadRes = await uploadToCloudinary(buffer, 'dod_products');
          return {
            url: uploadRes.url,
            originalName: file.name,
          };
        } else {
          // Ensure upload directories exist
          await mkdir(DASHBOARD_UPLOAD_DIR, { recursive: true });
          await mkdir(STOREFRONT_UPLOAD_DIR, { recursive: true });

          // Generate unique filename
          const ext = path.extname(file.name) || '.jpg';
          const safeName = file.name
            .replace(/[^a-zA-Z0-9.-]/g, '_')
            .replace(ext, '');
          const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}${ext}`;

          // Save to Dashboard public folder
          const dashboardPath = path.join(DASHBOARD_UPLOAD_DIR, uniqueName);
          await writeFile(dashboardPath, buffer);

          // Also save to Storefront public folder so customers can view images
          try {
            const storefrontPath = path.join(STOREFRONT_UPLOAD_DIR, uniqueName);
            await copyFile(dashboardPath, storefrontPath);
          } catch {
            console.warn('[UPLOAD] Could not copy to storefront directory — images may not show on customer site');
          }

          return {
            url: `/uploads/products/${uniqueName}`,
            originalName: file.name,
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      images: uploadResults,
    });
  } catch (error: unknown) {
    console.error('[UPLOAD ERROR]', error);
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
