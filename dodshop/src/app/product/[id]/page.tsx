import React from "react";
import ProductDetails from "./ProductDetails";
import { getDbProductById } from "@/lib/db";
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const dbProduct = await getDbProductById(id);

  if (!dbProduct) {
    return {
      title: "Designs Of Dreams - Masterpiece Collection",
      description: "Discover handcrafted luxury Indian ethnic wear.",
    };
  }

  const title = `${dbProduct.name} - Designs Of Dreams`;
  const description = dbProduct.description || `${dbProduct.name} - Pure handloom ethnic wear from Peeli Kothi Varanasi.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `https://designsofdreams.com/product/${id}`,
      images: [
        {
          url: dbProduct.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600',
          width: 800,
          height: 600,
          alt: dbProduct.name,
        },
      ],
    },
    alternates: {
      canonical: `/product/${id}`,
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const dbProduct = await getDbProductById(id);
  let websiteProduct = null;

  if (dbProduct) {
    websiteProduct = {
      id: dbProduct.id,
      title: dbProduct.name,
      subtitle: dbProduct.fabric || dbProduct.subCategory || '',
      category: (dbProduct.category as any)?.name || 'Saree',
      subcategory: dbProduct.subCategory,
      desc: dbProduct.description,
      longDesc: dbProduct.description,
      price: dbProduct.sellingPrice,
      mrp: dbProduct.mrp,
      discountPercent: dbProduct.discount,
      image: dbProduct.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600',
      badge: dbProduct.featured ? "Featured" : dbProduct.newArrival ? "New Arrival" : dbProduct.bestSeller ? "Best Seller" : "",
      fabrics: [dbProduct.fabric],
      features: dbProduct.features || [],
      sizes: dbProduct.sizes || ['Free Size'],
      rating: dbProduct.rating || 5.0,
      images: dbProduct.images || []
    };
  }

  return <ProductDetails initialProduct={websiteProduct} />;
}
