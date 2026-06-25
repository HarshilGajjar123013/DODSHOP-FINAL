import { MetadataRoute } from 'next';
import { getDbProducts } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://designsofdreams.com';

  // Base storefront routes
  const baseRoutes = ['', '/about', '/contact', '/gallery', '/login', '/cart', '/wishlist'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  try {
    // Dynamic product paths from database or fallback DB
    const products = await getDbProducts();
    const productRoutes = products.map((product: any) => ({
      url: `${baseUrl}/product/${product.id}`,
      lastModified: new Date(product.updatedAt || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    return [...baseRoutes, ...productRoutes];
  } catch (error) {
    console.error('Error generating dynamic sitemap:', error);
    return baseRoutes;
  }
}
