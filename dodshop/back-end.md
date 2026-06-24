# Designs of Dreams (DOD) Backend Integration Blueprint

This document outlines the architecture, step-by-step implementation details, schema designs, and code structures required to replace the current client-side mock configurations with a fully functional, production-ready full-stack backend.

---

## 1. Technology Stack Selection

To maintain compatibility with the Next.js App Router (Turbopack) and TypeScript environment, the recommended backend stack is **Next.js Full-Stack (Serverless Route Handlers & Server Actions)** coupled with:

*   **Database**: **PostgreSQL** (Managed via Neon or Supabase for relational integrity across Users, Products, Carts, and Orders).
*   **Database ORM**: **Prisma ORM** (Provides full type safety, auto-generated migrations, and tight integration with TypeScript).
*   **Authentication**: **Auth.js v5 (formerly NextAuth.js)** (Supports Credentials Provider and OAuth via Google/Apple).
*   **Media Storage**: **Cloudinary API** or **Amazon S3** (For uploading and serving user profile photos).
*   **Payment Gateway**: **Razorpay API** or **Stripe** (For secure transaction processing during checkout).

---

## 2. Database Schema Design (Prisma)

Here is the proposed relational schema for `prisma/schema.prisma` mapping out the core user profile, shopping behavior, and order tracking models.

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  USER
  ADMIN
}

enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}

enum ReturnStatus {
  NONE
  REQUESTED
  APPROVED
  COLLECTED
  REFUNDED
  REJECTED
}

model User {
  id            String    @id @default(uuid())
  name          String
  email         String    @unique
  passwordHash  String?   // Nullable for Social Login OAuth users
  mobileNumber  String?
  avatar        String?   // URL string pointing to Cloudinary/S3
  role          Role      @default(USER)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relationships
  cartItems     CartItem[]
  wishlistItems WishlistItem[]
  orders        Order[]
  preferences   UserPreferences?
}

model UserPreferences {
  id               String  @id @default(uuid())
  userId           String  @unique
  user             User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  marketingEmails  Boolean @default(true)
  twoFactorEnabled Boolean @default(false)
  analyticsCookies Boolean @default(true)
}

model Product {
  id           String         @id @default(uuid())
  title        String
  subtitle     String
  category     String
  subcategory  String
  desc         String
  longDesc     String
  price        Float
  image        String
  badge        String?
  fabrics      String[]
  features     String[]
  sizes        String[]
  rating       Float          @default(4.5)
  createdAt    DateTime       @default(now())
  
  // Relationships
  cartItems    CartItem[]
  wishlistItems WishlistItem[]
  orderItems   OrderItem[]
}

model CartItem {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  quantity  Int      @default(1)
  size      String
  createdAt DateTime @default(now())

  @@unique([userId, productId, size])
}

model WishlistItem {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@unique([userId, productId])
}

model Order {
  id            String       @id @default(uuid()) // Can format to e.g., "DOD-XXXXXX" in API
  userId        String
  user          User         @relation(fields: [userId], references: [id])
  status        OrderStatus  @default(PENDING)
  returnStatus  ReturnStatus @default(NONE)
  amount        Float
  address       String
  paymentMode   String
  paymentId     String?      // Gateway Transaction Ref
  cancelReason  String?
  returnReason  String?
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  orderItems    OrderItem[]
}

model OrderItem {
  id        String  @id @default(uuid())
  orderId   String
  order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId String
  product   Product @relation(fields: [productId], references: [id])
  quantity  Int
  price     Float   // Historical price at purchase time
  size      String
}
```

---

## 3. Step-by-Step Backend Integration Roadmap

### Step 1: Database Setup & Migration
1.  Initialize Prisma in the directory:
    ```bash
    npm install @prisma/client
    npm install prisma --save-dev
    npx prisma init
    ```
2.  Paste the schema above into `prisma/schema.prisma`.
3.  Configure `DATABASE_URL` in your `.env` file pointing to your PostgreSQL instance.
4.  Run migrations to generate tables:
    ```bash
    npx prisma migrate dev --name init
    ```

### Step 2: Set Up Authentication (Auth.js)
1.  Install Auth.js:
    ```bash
    npm install next-auth@5.0.0-beta.25
    ```
2.  Configure authentication handlers inside `src/auth.ts`:
    *   Setup **CredentialsProvider** executing safe bcrypt validation on user emails/passwords.
    *   Setup **OAuthProvider** for Google and Apple APIs.
3.  Implement Route Handlers inside `src/app/api/auth/[...nextauth]/route.ts` to expose session tokens:
    ```typescript
    import { handlers } from "@/auth"
    export const { GET, POST } = handlers
    ```
4.  Replace mock store states in components (`Navbar`, `MobileBottomNav`, `LoginPage`, `Checkout`) with standard session management queries:
    ```typescript
    import { useSession, signIn, signOut } from "next-auth/react";
    const { data: session } = useSession();
    ```

### Step 3: API Route Handlers

Create API endpoints under `/api` in the Next.js app directory to support CRUD operations:

#### 1. Products API (`src/app/api/products/route.ts`)
*   **GET**: Fetch paginated list of sarees, kurtis, etc. supports parameters for `category`, `search` query, and sorting rates.
*   **POST** (Admin only): Add custom handloom releases to inventory.

#### 2. Cart & Wishlist Synchronization (`src/app/api/cart/route.ts` & `src/app/api/wishlist/route.ts`)
*   When a user adds items on mobile, the app syncs local items to the DB.
*   **POST**: Insert/Update item quantity in `CartItem` table.
*   **DELETE**: Remove cart items or clear tables.

#### 3. Orders API (`src/app/api/orders/route.ts`)
*   **POST**: Create order on checkout. Verifies the total pricing calculated server-side matches client inputs before inserting.
*   **GET**: Retrieve user order history logs for `/order` tracker screens.

#### 4. Order Cancellations & Returns (`src/app/api/orders/[id]/route.ts`)
*   **PATCH**: Allows users to post cancel/return reasons. Updates `OrderStatus` or `ReturnStatus` on confirmation.

### Step 4: Profile Avatar File Uploader (Cloudinary/S3 Integration)
Instead of storing heavy Base64 strings in local storage, implement a secure serverless upload flow:

1.  **Configure API Route (`src/app/api/profile/upload/route.ts`)**:
    *   Parses incoming form data files.
    *   Uploads buffer directly to Cloudinary or AWS S3 buckets.
    *   Returns secure image URL (e.g., `https://res.cloudinary.com/...`).
2.  **Update Database Profile Record**:
    *   Write the returned URL to the `User` model's `avatar` property.
    *   Prisma updates the state, reflecting globally.

```typescript
// Sample API Route Handler for profile photo upload
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to array buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "dod_avatars" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    // Update avatar link in DB
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { avatar: uploadResult.secure_url },
    });

    return NextResponse.json({ url: updatedUser.avatar });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
```

### Step 5: Checkout Payments Gateway Integration
1.  **Install Razorpay SDK**:
    ```bash
    npm install razorpay
    ```
2.  **Order Creation Route (`src/app/api/payment/orders/route.ts`)**:
    *   Triggers gateway API on checkout to create Razorpay Order ID.
    *   Sends order details to client.
3.  **Payment Verification Route (`src/app/api/payment/verify/route.ts`)**:
    *   Verifies signature matching algorithms (`razorpay_signature` + HmacSHA256) server-side.
    *   Ensures client payment is validated before writing order records into DB.

---

## 4. Frontend State & Hook Integrations

The existing client-side Zustand store should be adapted to fetch its initial data from the database upon user authentication:

```typescript
// src/store/useStore.ts (Backend Adaption snippet)
import { create } from "zustand";

interface ECommerceStore {
  cart: CartItem[];
  wishlist: Product[];
  user: UserSession | null;
  
  // Hydrate state from backend DB upon login
  hydrateSession: () => Promise<void>;
  
  // Sync state actions
  syncCartWithBackend: (cartItems: CartItem[]) => Promise<void>;
  toggleWishlistOnBackend: (product: Product) => Promise<void>;
}
```

Once the database endpoints are wired up, this unified full-stack ecosystem will support real-time data persistence, secure payments, and cross-device account syncing under your brand's curated handloom aesthetic.
