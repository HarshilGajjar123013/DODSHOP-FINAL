import { prisma, fallbackDb } from '@dod/database';

export { prisma, fallbackDb };

export async function getDbProducts() {
  try {
    const products = await prisma.product.findMany({
      where: { status: 'ACTIVE' },
      include: {
        category: { select: { id: true, name: true } },
        collection: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return products;
  } catch (err) {
    console.warn('⚠️ Website: Database query failed, using fallback JSON DB.');
    const products = fallbackDb.getCollection('products');
    const categories = fallbackDb.getCollection('categories');
    const collections = fallbackDb.getCollection('collections');
    
    return products
      .filter(p => p.status === 'ACTIVE')
      .map(p => {
        const cat = categories.find(c => c.id === p.categoryId);
        const coll = collections.find(c => c.id === p.collectionId);
        return {
          ...p,
          category: cat ? { id: cat.id, name: cat.name } : null,
          collection: coll ? { id: coll.id, name: coll.name } : null,
        };
      });
  }
}

export async function getDbProductById(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true } },
        collection: { select: { id: true, name: true } }
      }
    });
    return product;
  } catch (err) {
    console.warn(`⚠️ Website: Database query failed for ID ${id}, using fallback JSON DB.`);
    const products = fallbackDb.getCollection('products');
    const categories = fallbackDb.getCollection('categories');
    const collections = fallbackDb.getCollection('collections');
    
    const p = products.find(prod => prod.id === id);
    if (!p) return null;
    
    const cat = categories.find(c => c.id === p.categoryId);
    const coll = collections.find(c => c.id === p.collectionId);
    return {
      ...p,
      category: cat ? { id: cat.id, name: cat.name } : null,
      collection: coll ? { id: coll.id, name: coll.name } : null,
    };
  }
}
