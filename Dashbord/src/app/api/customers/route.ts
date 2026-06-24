import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fallbackDb } from '@/lib/fallbackDb';

export async function GET(req: Request) {
  try {
    let customers: any[] = [];
    let databaseConnected = true;

    try {
      const dbCustomers = await prisma.customer.findMany({
        include: {
          orders: true,
          addresses: true,
          cartItems: { include: { product: true } },
          wishlistItems: { include: { product: true } }
        }
      });

      customers = dbCustomers.map(c => {
        const totalSpent = c.orders.reduce((sum, o) => sum + o.grandTotal, 0);
        return {
          id: c.id,
          name: c.name,
          email: c.email,
          phone: c.phone || '',
          avatar: c.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'P',
          totalOrders: c.orders.length,
          totalSpent,
          notes: c.notes || '',
          joinedDate: c.joinedDate.toISOString().split('T')[0],
          wishlist: c.wishlistItems.map(w => ({
            productId: w.productId,
            name: w.product.name,
            price: w.product.sellingPrice,
            image: w.product.images?.[0] || ''
          })),
          cart: c.cartItems.map(ci => ({
            productId: ci.productId,
            name: ci.product.name,
            price: ci.product.sellingPrice,
            quantity: ci.quantity,
            image: ci.product.images?.[0] || ''
          })),
          addresses: c.addresses.map(a => ({
            type: a.label,
            address: `${a.line1}, ${a.line2 ? a.line2 + ', ' : ''}${a.city}, ${a.state} ${a.postalCode}`
          }))
        };
      });

    } catch (dbError) {
      console.warn('⚠️ Database query failed, using fallback JSON DB.');
      databaseConnected = false;
    }

    if (!databaseConnected) {
      const allCust = fallbackDb.getCollection('customers');
      const orders = fallbackDb.getCollection('orders');
      
      // Calculate derived totals from fallback orders list to be dynamic
      customers = allCust.map(c => {
        const custOrders = orders.filter(o => o.customerName === c.name || o.customerId === c.id);
        const totalSpent = custOrders.reduce((sum, o) => sum + o.grandTotal, 0);
        return {
          ...c,
          totalOrders: custOrders.length,
          totalSpent,
        };
      });
    }

    return NextResponse.json({
      success: true,
      customers
    });

  } catch (err: any) {
    console.error('Customers GET error:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve customer records' },
      { status: 500 }
    );
  }
}
