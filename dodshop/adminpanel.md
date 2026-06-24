# Designs of Dreams (DOD) Admin Panel Blueprint

This document details the architecture, design aesthetics, user flows, database APIs, and implementation specifications to construct a luxury admin panel console under `/admin` for Designs of Dreams management.

---

## 1. Design System & Aesthetics (Atelier Admin)

To maintain consistent high-end branding, the Admin Panel should avoid default sterile layouts (plain grids and dark boxes) and feature a refined, spacious dashboard matching our core visual themes:

*   **Color Scheme**: Off-white backdrop (`#FAF9F6`), charcoal text (`#1a1a1a`), gold accents (`#C5A059`), and brand orange (`#FF6A00`).
*   **Visual Assets**: Glassmorphic panels (`backdrop-filter: blur(10px)`), minimal thin borders (`rgba(0,0,0,0.06)`), and elegant serif accents (`Marcellus` font) for headings.
*   **Interactive Components**: Elegant status badges (Processing, Shipped, Returned) using soft translucent backgrounds, micro-animations on table row hover states, and smooth collapsible sidebar navigations.

---

## 2. Core Dashboard Layout & Navigation

The admin interface is nested under the `/admin` App Router directory (e.g., `src/app/admin/`) with a unified side navigation structure:

```
src/app/admin/
├── layout.tsx         # Persistent side nav panel and top stats banner
├── page.tsx           # Main overview dashboard (Charts & KPI metrics)
├── products/
│   ├── page.tsx       # Product inventory datatable
│   └── new/
│       └── page.tsx   # Add/Edit product form with image upload
├── orders/
│   ├── page.tsx       # Orders ledger & return claims tracker
│   └── [id]/
│       └── page.tsx   # Single order detail sheet
└── users/
    └── page.tsx       # Customer records list & roles editor
```

---

## 3. Key Feature Pages & Functional Modules

### A. Dashboard Overview (KPI Monitor)
*   **KPI Cards**: Large, spacious cards showing:
    1.  **Total Sales (Revenue)** (e.g., `₹4,89,500`) with a weekly growth indicator percentage.
    2.  **Total Orders** (e.g., `1,248`) with processing counts.
    3.  **Active Customers** (e.g., `852` verified members).
    4.  **Average Order Value (AOV)** (e.g., `₹8,240`).
*   **Sales Chart**: An area chart (using `recharts`) plotting monthly sales performance with smooth gradient fills.
*   **Recent Orders Widget**: A table displaying the 5 latest placed orders with a direct button to review details.

### B. Product Catalog Management (Weaving Inventory)
*   **Inventory Table**: Displays a searchable list of products with thumbnail previews, titles, categories, pricing, and sizing arrays.
*   **Product Creation Form**:
    *   Fields: Title, Subtitle, Category dropdown, Subcategory, Price, Fabrics (tags), features, description, and available sizes.
    *   **Atelier Image Dropzone**: Drag-and-drop file uploader. When a file is dropped, it uploads directly to Cloudinary and previews the product card live.

### C. Orders Ledger & Return Desk
*   **Order Table**: Filterable by status (`PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`).
*   **Order Status Controls**: A select dropdown within the single order page to dispatch orders:
    *   Clicking `SHIPPED` triggers an automated email notification with tracking IDs.
*   **Return & Refund Request Manager**:
    *   Lists active return claims with customer-submitted descriptions.
    *   Action buttons: `Approve Return` (notifies courier partner to fetch item), `Process Refund` (triggers UPI/Card gateway reversal), and `Reject Return` (requires text input for reason).

### D. Customer Registry
*   **User List Table**: Displays names, emails, dates of registration, and current roles (`USER` vs `ADMIN`).
*   **Role Promotion**: A toggle switch allowing master admins to promote staff members to admin roles securely.

---

## 4. Backend API Routes & Server Actions

All admin requests must be authenticated and validated through the server middleware (`src/middleware.ts`) or direct API role validation:

```typescript
// src/lib/admin.ts (Admin protection helper)
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function verifyAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login?error=AccessDenied");
  }
  return session.user;
}
```

### 1. Stats KPI API (`src/app/api/admin/stats/route.ts`)
Calculates sales, orders count, and AOV using Prisma aggregation:

```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAdmin } from "@/lib/admin";

export async function GET() {
  try {
    await verifyAdmin();

    const [totalRevenue, totalOrders, activeUsers] = await Promise.all([
      prisma.order.aggregate({
        _sum: { amount: true },
        where: { NOT: { status: "CANCELLED" } }
      }),
      prisma.order.count(),
      prisma.user.count({ where: { role: "USER" } })
    ]);

    const rev = totalRevenue._sum.amount || 0;
    const aov = totalOrders > 0 ? (rev / totalOrders) : 0;

    return NextResponse.json({
      revenue: rev,
      orders: totalOrders,
      users: activeUsers,
      aov: Math.round(aov)
    });
  } catch (error) {
    return NextResponse.json({ error: "Access Denied" }, { status: 403 });
  }
}
```

### 2. Product Management Actions (`src/app/api/admin/products/route.ts`)
*   **POST**: Insert new product directly into the Prisma database.
*   **PATCH**: Edit details of existing products.
*   **DELETE**: Remove product from database.

### 3. Orders Management Actions (`src/app/api/admin/orders/[id]/route.ts`)
*   **PATCH**: Modify order status. If `returnStatus` is updated to `REFUNDED`, the server automatically initiates verification check steps with Razorpay/Stripe APIs:

```typescript
// Sample return approval / refund trigger inside order PATCH route
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAdmin } from "@/lib/admin";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await verifyAdmin();
    const { status, returnStatus, refundAmount } = await req.json();

    const order = await prisma.order.findUnique({
      where: { id: params.id },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update order statuses
    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: {
        status: status || order.status,
        returnStatus: returnStatus || order.returnStatus,
      }
    });

    // If returnStatus is updated to REFUNDED, trigger payment gateway reversal API here
    if (returnStatus === "REFUNDED" && order.paymentId) {
      // Example: await stripe.refunds.create({ charge: order.paymentId });
      console.log(`Successfully refunded order payment: ${order.paymentId}`);
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    return NextResponse.json({ error: "Operation Failed" }, { status: 500 });
  }
}
```

---

## 5. Security Checklist for Admin Routes

1.  **Middleware Route Guarding**: Configure `src/middleware.ts` to intercept `/admin` routes. Check standard JWT tokens, validating that `user.role === 'ADMIN'` before matching page controllers.
2.  **CSRF Protection**: Ensure all post operations are performed via signed Next.js Server Actions or JWT-authenticated headers.
3.  **Sanitization**: Validate all incoming product description inputs using sanitizers to block XSS injection risks when adding product highlights.
