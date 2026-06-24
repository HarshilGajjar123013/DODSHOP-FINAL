# Designs of Dreams (DOD) - Industry-Level Production Checklist & Implementation Guide

This document acts as the definitive roadmap and engineering specification to transition the **Designs of Dreams (DOD)** e-commerce frontend prototype to a secure, highly scalable, and SEO-optimized production application.

---

## 1. Database & Persistence Layer (Pending)

To handle user profiles, inventory management, transactions, and persistent sessions, DOD requires a robust relational database with an ORM.

### Database Design & Schema
We will use **PostgreSQL** (hosted via Supabase or Neon) paired with **Prisma ORM**. Below is the production-grade schema:

```prisma
// prisma/schema.prisma

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // Used for serverless migrations
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  USER
  ADMIN
  DESIGNER
}

enum OrderStatus {
  PENDING
  CONFIRMED
  SHIPPED
  DELIVERED
  CANCELLED
  RETURNED
}

model User {
  id            String        @id @default(uuid())
  name          String?
  email         String        @unique
  emailVerified DateTime?
  password      String?       // Hashed with bcrypt
  image         String?       // Profile Photo URL (Cloudinary/S3)
  role          Role          @default(USER)
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  
  // Relations
  addresses     Address[]
  orders        Order[]
  cartItems     CartItem[]
  wishlist      WishlistItem[]
  accounts      Account[]     // For OAuth providers (Google, Apple)
}

model Account {
  id                String  @id @default(uuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Address {
  id           String   @id @default(uuid())
  userId       String
  street       String
  city         String
  state        String
  postalCode   String
  country      String   @default("India")
  phoneNumber  String
  isDefault    Boolean  @default(false)
  
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Product {
  id           String        @id @default(uuid())
  title        String
  description  String        @db.Text
  price        Float
  comparePrice Float?        // For discount display
  sku          String        @unique
  stock        Int           @default(0)
  category     String        // e.g. "Saree", "Anarkali"
  collection   String?       // e.g. "Banarasi Heritage"
  images       String[]      // Array of Cloudinary URLs
  sizes        String[]      // ["XS", "S", "M", "L", "XL"]
  colors       String[]      // ["Gold", "Ivory", "Crimson"]
  isFeatured   Boolean       @default(false)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  // Relations
  cartItems    CartItem[]
  wishlistItems WishlistItem[]
  orderItems   OrderItem[]
}

model CartItem {
  id        String   @id @default(uuid())
  userId    String
  productId String
  quantity  Int      @default(1)
  size      String
  color     String

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  @@unique([userId, productId, size, color])
}

model WishlistItem {
  id        String   @id @default(uuid())
  userId    String
  productId String

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([userId, productId])
}

model Order {
  id            String      @id @default(uuid())
  userId        String
  status        OrderStatus @default(PENDING)
  totalAmount   Float
  paymentId     String?     // Razorpay Payment ID
  orderId       String?     // Razorpay Order ID
  signature     String?     // Razorpay Signature hash
  trackingNumber String?    // Shiprocket tracking ID
  carrier       String?     // e.g., "Delhivery"
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  user          User        @relation(fields: [userId], references: [id])
  items         OrderItem[]
}

model OrderItem {
  id        String  @id @default(uuid())
  orderId   String
  productId String
  quantity  Int
  price     Float   @db.DoublePrecision
  size      String
  color     String

  order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product   Product @relation(fields: [productId], references: [id])
}
```

### Action Checklist
*   [ ] **Database Setup**: Spin up database on Neon/Supabase, obtain `DATABASE_URL` and `DIRECT_URL`.
*   [ ] **Prisma Hook**: Initialize Prisma (`npx prisma init`), write schema, and deploy initial migration (`npx prisma migrate dev --name init`).
*   [ ] **Sync Zustand Store with Database**: Create backend API routes (`/api/cart` and `/api/wishlist`) so additions, updates, and removals write directly to the DB when logged in. Implement a merge algorithm to sync local storage items into the database at login.

---

## 2. Authentication & Route Guards (Pending)

DOD currently utilizes client-side simulated state. We must integrate **Auth.js v5 (NextAuth)** to manage secure JSON Web Tokens (JWT) or database sessions.

### NextAuth Setup & Middleware Guards
Create custom authentication API endpoints and Next.js middleware guards to block unauthenticated visitors:

```typescript
// src/middleware.ts
import { NextResponse } from "next/server";
import { auth } from "./auth"; // Auth.js initialized helper

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;

  const isProtectedRoute = ["/profile", "/order", "/settings"].some((route) =>
    nextUrl.pathname.startsWith(route)
  );
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isAuthRoute = nextUrl.pathname === "/login";

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  if (isAdminRoute) {
    const userRole = req.auth?.user?.role;
    if (!isLoggedIn || userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/profile", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/profile/:path*", "/order/:path*", "/settings/:path*", "/admin/:path*", "/login"],
};
```

### Action Checklist
*   [ ] **Install Authentication Dependencies**: Add `bcryptjs` and `@types/bcryptjs` for encryption, along with `next-auth@5.0.0-beta`.
*   [ ] **OAuth credentials**: Register App Credentials on Google Cloud Console and Apple Developer Console to configure Google and Apple Sign-In.
*   [ ] **Two-Factor OTP Security**: Wire SMS or Email verification triggers using Resend API to verify users logging in from new devices.

---

## 3. Core E-Commerce API Endpoints (Pending)

Create secure backend routes under `src/app/api/` that execute Server-Side validation.

### Key API Endpoints
1.  **`/api/products` (GET/POST)**:
    *   Filters: `?category=Saree&size=M&color=Gold&sort=price_desc&search=Silk&page=1&limit=12`.
    *   Ensures clean cursor or offset pagination to keep product lists performant.
2.  **`/api/checkout` (POST)**:
    *   Receives `cartItems` and quantities.
    *   Queries the DB to fetch current prices, recalculates totals on the server (never trust client-supplied prices), updates stock counts, and invokes the payment Gateway.
3.  **`/api/orders` (GET/POST/PUT)**:
    *   Creates order records, updates tracking info, and queries user order histories.

---

## 4. Media Storage & Image Management (Pending)

Avoid uploading base64 data URLs directly into databases. Use Cloudinary or AWS S3 for digital asset hosting.

```typescript
// src/app/api/profile/upload/route.ts
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { auth } from "@/auth";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.formData();
    const file = data.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "dod_avatars", transformation: [{ width: 400, height: 400, crop: "fill" }] },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    const imageUrl = (uploadResponse as any).secure_url;

    // Update database record
    // await db.user.update({ where: { id: session.user.id }, data: { image: imageUrl } });

    return NextResponse.json({ url: imageUrl });
  } catch (error) {
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}
```

### Action Checklist
*   [ ] Setup S3 or Cloudinary cloud dashboard project bucket.
*   [ ] Replace all standard HTML `<img>` elements with Next.js optimized `<Image>` tags. Configure remote domains in `next.config.ts`.

---

## 5. Payments, Shipping & Notifications (Pending)

### Razorpay checkout flow
1.  Frontend requests checkout payload `/api/checkout`.
2.  Backend contacts Razorpay API (`razorpay` npm library) and creates a transaction order:
    ```typescript
    const paymentOrder = await razorpay.orders.create({
      amount: orderTotal * 100, // Amount in paise
      currency: "INR",
      receipt: `order_rcpt_${dbOrderId}`,
    });
    ```
3.  Frontend opens the Razorpay popup using the returned `order_id`.
4.  User completes payment. Razorpay posts verification signatures.
5.  Backend validates payment signature:
    ```typescript
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(order_id + "|" + razorpay_payment_id)
      .digest("hex");
    if (generated_signature !== razorpay_signature) throw new Error("Invalid signature");
    ```

### Logistics & Shiprocket API
*   Send order data directly to Shiprocket `/api/v1/custom/shipments/create` to schedule pickup once verified.

### Alerts & Notifications
*   [ ] Send order confirmations via transactional emails (using **Resend**).

---

## 6. SEO, Performance & Core Web Vitals (Pending)

To rank as a premium Indian couture shop, SEO markup must be search-engine optimized.

### Rich Product Schema (JSON-LD)
Embed structured product markup dynamically in `/product/[id]/page.tsx` for rich Google search cards:

```typescript
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": product.title,
  "image": product.images[0],
  "description": product.description,
  "sku": product.sku,
  "offers": {
    "@type": "Offer",
    "priceCurrency": "INR",
    "price": product.price,
    "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    "url": `https://designsofdreams.com/product/${product.id}`
  }
};

return (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
  />
);
```

### Action Checklist
*   [ ] **Sitemap Automation**: Implement `src/app/sitemap.ts` to crawl DB and auto-generate sitemaps dynamically.
*   [ ] **Metadata Generation**: Use `generateMetadata` function on dynamic routes (`/product/[id]`) for responsive page-specific title tags.

---

## 7. DevOps & CI/CD Pipelines (Pending)

Ensure zero-downtime deployments and quality checks using GitHub workflows.

```yaml
# .github/workflows/deploy.yml
name: DOD Build & Lint Verification
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-size: 20
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run Prisma Validation
        run: npx prisma validate
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}

      - name: Code Linter
        run: npm run lint

      - name: Build Next.js Web App
        run: npm run build
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
```
