# Designs of Dreams (DOD Shop) — Luxury Heritage Atelier

Welcome to the official repository of **Designs of Dreams (DOD)**, a premium e-commerce platform dedicated to showcasing certified, handcrafted Indian ethnic wear. Born in the historical weaving district of **Peeli Kothi, Varanasi**, DOD bridges the centuries-old craftsmanship of master weavers with a state-of-the-art digital shopping experience.

---

## Table of Contents
1. [Brand & Vision](#brand--vision)
2. [Key Product Collections](#key-product-collections)
3. [E-Commerce Features (A to Z)](#e-commerce-features-a-to-z)
4. [Technology Stack](#technology-stack)
5. [Architecture & Folder Structure](#architecture--folder-structure)
6. [Local Development & Setup](#local-development--setup)
7. [Supabase Database Setup (Future Scope)](#supabase-database-setup-future-scope)

---

## Brand & Vision

DOD is designed for the modern connoisseur of luxury ethnic wear. We work directly with over 120+ generational master weavers and artisans in Varanasi and Lucknow. Our mission is to preserve the integrity of slow fashion, traditional hand-block printing, Chikankari hand-embroidery, and pure silver/gold zari weaving against the rise of powerlooms.

---

## Key Product Collections

The store showcases four signature collections, each with distinct fabric profiles and artisanal specifications:

*   **Saree (Banarasi & Heritage)**
    *   *Fabrics:* Premium Katan Silk, Organza, Chanderi.
    *   *Details:* Pure gold/silver zari work, Kadwa weaves, hand-scalloped margins, and intricate paisley pallus.
*   **Kurti (Chikankari & Designer)**
    *   *Fabrics:* Georgette, Premium Cotton, Mulmul Silk.
    *   *Details:* Authentic Lucknowi hand shadow-work embroidery (Bakhiya, Phanda, Keel Kangan motifs).
*   **Blouse (Artisanal & Tailored)**
    *   *Fabrics:* Raw Silk, Micro Velvet, Banarasi Brocade.
    *   *Details:* Hand-embroidered zardozi wires, beads, stone settings, custom sweetheart cuts, and padded styling.
*   **Dupatta (Signature Stoles)**
    *   *Fabrics:* Pure Silk, Chiffon, Cotton-Silk blend.
    *   *Details:* Gota Patti borders, handmade mirror inserts, and traditional Rajasthani Bandhani tie-dye dots.

---

## E-Commerce Features (A to Z)

*   **Appointments (Private Styling consultations):** Customers can schedule private fitting and consultation sessions at the Peeli Kothi flagship workshop. The booking form processes full names, contact channels, styling interest, and dates.
*   **Artisan Weaving Process Gallery:** A graphical lookbook showcasing authentic silk-spinning, hand-loom weaving, and block-printing stages, supporting modal previews and zoom transitions.
*   **Authentic Preloader:** A luxury introduction preloader displaying elegant calligraphic loaders and fade transitions.
*   **Cart & Checkout Systems:**
    *   Dynamic shopping cart side-drawers tracking quantities, custom sizes, and removals.
    *   Live checkout engine calculating GST (5%), shipping margins (free shipping on orders above ₹1,999), and total costs.
    *   Supports Cash on Delivery (COD), UPI transfer protocols, and Credit/Debit card layouts.
*   **Client Concierge FAQ (Interactive Accordion):** An accordion interface with categorized queries (Our Products, Shipping, Care & Returns) providing answers on silk storage, weaving timelines, and custom exchange guidelines.
*   **Collections Catalog:**
    *   Filtered catalog by category (Kurtis, Sarees, Blouses, Dupattas) and subcategories.
    *   Sort parameters for prices (low-to-high, high-to-low) and ratings.
    *   Search panel with dynamic suggestions (e.g., Banarasi, Anarkali).
*   **Detail Quick View:** Modal popping on product clicks showing description paragraphs, active fabrics, designer highlights, and size matrices.
*   **Hero & Heritage Showcase (Home Page):** Cinematic banners displaying high-resolution lookup cards, tagline rotations, and dynamic cursor-responsive styling.
*   **Newsletter Subscription:** Contact footers collecting email subscriptions for seasonal releases and exclusive pre-sales.
*   **Progressive Web App (PWA):** Equipped with `@ducanh2912/next-pwa` providing install banners and off-line fallback service workers for cellular applications.
*   **Sign In & Sign Up (Authentication):** Fully animated credentials input views utilizing split layouts, social login integrations (Google, Apple, Facebook), custom mobile/phone fields, and client-side password matching.
*   **State Persistence:** Powered by Zustand persisted storage, keeping cart line items, wishlist selections, and profile authentication cookies local to client sessions.
*   **Storytelling Sliders:** Login page features dual-split layouts with interactive slideshows outlining the history of Peeli Kothi.
*   **Wishlist:** Dedicated stateful list enabling shoppers to flag favorite designs with immediate client updates.

---

## Styling Atelier & Appointment System (Contact Page)

The contact route hosts the **Atelier Experience & Appointment Booking Engine**, allowing clients to book private styling consultations at the flagship workshop.

### 1. Flagship Showroom Specifications
*   **Location:** Peeli Kothi flagship workshop (K-46/2, Near Peeli Kothi Crossing, Varanasi, UP, India).
*   **Operating Hours:** Monday – Saturday: 11:00 AM – 08:00 PM (Bespoke consultations by pre-booked slots).
*   **Dedicated Channels:** Private line (`+91 98765 43210`) and booking inbox (`appointments@sareestyle.com`).

### 2. Styling Request Form Fields
*   **Guest Name:** Captures the full name of the client.
*   **Contact Channels:** Validates the shopper's email address and telephone/mobile numbers.
*   **Atelier Interest:** Categorized select input matching specific clothing lines:
    *   *Saree Collection*
    *   *Chikankari Kurti*
    *   *Custom Lehenga*
    *   *Artisanal Blouse*
*   **Booking Date:** Date-picker input bound to a calendar interface.
*   **Bespoke Customizations:** Multi-line text area to submit custom body measurements, pattern specifications, or fabric instructions.

### 3. Submission Logic & UI Feedback
*   Clicking the **Request Appointment** button triggers standard HTML5 field validation.
*   Upon submission, the page activates a highly visual success alert banner: *"Request Submitted — We have received your appointment request. Check your inbox shortly for our confirmation call."*
*   Form fields automatically reset, and the success card smoothly fades out after 4 seconds using Framer Motion animations.

---

## Technology Stack

The platform is built on modern, lightweight, and performant web technologies:

*   **Core Framework:** [Next.js 16 (App Router)](https://nextjs.org/) for optimized client routing, page layouts, and SEO handling.
*   **UI Library:** [React 19](https://react.dev/) and TypeScript for structured components.
*   **Styling System:** Custom [Sass (SCSS)](https://sass-lang.com/) for rich layouts and [TailwindCSS v4](https://tailwindcss.com/) for helper utilities.
*   **State Engine:** [Zustand](https://github.com/pmndrs/zustand) for client store management and cache control.
*   **Motion & Effects:** [Framer Motion](https://www.framer.com/motion/) for micro-interactions/modals and [GSAP (GreenSock)](https://gsap.com/) for scroll timelines.
*   **Forms & Validation:** [React Hook Form](https://react-hook-form.com/) combined with [Zod Schemas](https://zod.dev/) for inputs validation.
*   **Icons:** [Lucide React](https://lucide.dev/) outline vectors and [React Icons](https://react-icons.github.io/react-icons/) for social integrations.

---

## Architecture & Folder Structure

```
dodshop/
├── public/                 # Static assets (images, logos, PWA manifests)
├── src/
│   ├── app/                # Next.js App Router Page directories
│   │   ├── about/          # About page component entrypoint
│   │   ├── cart/           # Checkout summary & drawer forms
│   │   ├── collection/     # Dynamic product catalog, sorting & filtering
│   │   ├── contact/        # Styling appointments
│   │   ├── login/          # Split authentication page (login & signup forms)
│   │   ├── wishlist/       # Favorite products grid
│   │   ├── globals.scss    # Global design rules & SCSS mixins
│   │   ├── layout.tsx      # Main layout wrapper
│   │   └── page.tsx        # Homepage (Hero, collections, FAQ, gallery)
│   ├── components/
│   │   ├── common/         # Global widgets (Navbar, Footer, Preloader, PWA prompts)
│   │   └── sections/       # UI sections (Hero, Gallery, Timeline, FAQ)
│   ├── constants/          # Static layout variables
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # AXIOS configurations, SEO setup, utility functions
│   ├── services/           # Service-level API files (e.g., authService)
│   ├── store/              # Zustand global ecommerce stores (useStore)
│   ├── styles/             # Modular SCSS design tokens
│   └── types/              # TypeScript typings
├── tailwind.config.js      # Tailwind configuration file
├── tsconfig.json           # TypeScript compilation configurations
└── package.json            # Node dependencies and scripts
```

---

## Local Development & Setup

Follow these steps to run the DOD shop environment locally:

### 1. Prerequisites
Ensure you have [Node.js (v18 or higher)](https://nodejs.org/) installed on your machine.

### 2. Clone and Install Dependencies
```bash
# Clone the repository
git clone <repository-url>
cd dodshop

# Install packages
npm install
```

### 3. Run Dev Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

### 4. Build Production Bundle
To compile optimized static bundles:
```bash
npm run build
npm run start
```

---

## Supabase Database Setup (Future Scope)

To integrate a dynamic database backend, you can configure Supabase tables.

### 1. Environment Configuration
Create a `.env.local` file in the project root:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 2. Database Schema
Execute the following SQL commands in your Supabase SQL Editor:

```sql
-- 1. Create Products Table
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  subtitle TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  desc_text TEXT,
  long_desc TEXT,
  price NUMERIC NOT NULL,
  image TEXT,
  badge TEXT,
  fabrics TEXT[] DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  sizes TEXT[] DEFAULT '{}',
  rating NUMERIC DEFAULT 5.0
);

-- 2. Create Orders Table
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  customer_name TEXT,
  customer_email TEXT,
  address TEXT,
  city TEXT,
  pincode TEXT,
  payment_method TEXT DEFAULT 'COD',
  subtotal NUMERIC,
  tax NUMERIC,
  shipping NUMERIC,
  grand_total NUMERIC,
  status TEXT DEFAULT 'Pending',
  items JSONB DEFAULT '[]'
);

-- 3. Create Styling Appointments Table
CREATE TABLE appointments (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  interest TEXT DEFAULT 'Saree',
  booking_date DATE,
  message TEXT,
  status TEXT DEFAULT 'Pending'
);
```
