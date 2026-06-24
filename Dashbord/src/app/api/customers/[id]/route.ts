import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fallbackDb } from '@/lib/fallbackDb';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await req.json();
    const { notes } = body;

    let databaseConnected = true;
    let updatedCustomer = null;

    try {
      const dbCust = await prisma.customer.update({
        where: { id },
        data: { notes },
        include: {
          orders: true,
          addresses: true,
          cartItems: { include: { product: true } },
          wishlistItems: { include: { product: true } }
        }
      });

      const totalSpent = dbCust.orders.reduce((sum, o) => sum + o.grandTotal, 0);
      updatedCustomer = {
        id: dbCust.id,
        name: dbCust.name,
        email: dbCust.email,
        phone: dbCust.phone || '',
        avatar: dbCust.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'P',
        totalOrders: dbCust.orders.length,
        totalSpent,
        notes: dbCust.notes || '',
        joinedDate: dbCust.joinedDate.toISOString().split('T')[0],
        wishlist: dbCust.wishlistItems.map(w => ({
          productId: w.productId,
          name: w.product.name,
          price: w.product.sellingPrice,
          image: w.product.images?.[0] || ''
        })),
        cart: dbCust.cartItems.map(ci => ({
          productId: ci.productId,
          name: ci.product.name,
          price: ci.product.sellingPrice,
          quantity: ci.quantity,
          image: ci.product.images?.[0] || ''
        })),
        addresses: dbCust.addresses.map(a => ({
          type: a.label,
          address: `${a.line1}, ${a.line2 ? a.line2 + ', ' : ''}${a.city}, ${a.state} ${a.postalCode}`
        }))
      };
      
    } catch (dbError) {
      console.warn('⚠️ Database patch failed, falling back to JSON DB:', dbError);
      databaseConnected = false;
    }

    if (!databaseConnected) {
      const customers = fallbackDb.getCollection('customers');
      const idx = customers.findIndex(c => c.id === id);
      if (idx === -1) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
      }

      customers[idx].notes = notes;
      fallbackDb.saveCollection('customers', customers);
      
      const orders = fallbackDb.getCollection('orders');
      const custOrders = orders.filter(o => o.customerName === customers[idx].name || o.customerId === customers[idx].id);
      const totalSpent = custOrders.reduce((sum, o) => sum + o.grandTotal, 0);
      
      updatedCustomer = {
        ...customers[idx],
        totalOrders: custOrders.length,
        totalSpent,
      };
    }

    return NextResponse.json({
      success: true,
      customer: updatedCustomer
    });

  } catch (err: any) {
    console.error('Customer PATCH error:', err);
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}
