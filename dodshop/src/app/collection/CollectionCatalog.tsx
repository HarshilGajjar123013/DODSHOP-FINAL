"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useStore, Product } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, ShoppingBag, X, Star, Check, ChevronRight, SlidersHorizontal } from "lucide-react";
import "./CollectionCatalog.scss";

export default function CollectionCatalog({ initialProducts }: { initialProducts?: Product[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Zustand Store
  const storeProducts = useStore((state) => state.products);
  const products = initialProducts || storeProducts;
  const cart = useStore((state) => state.cart);
  const wishlist = useStore((state) => state.wishlist);
  const addToCart = useStore((state) => state.addToCart);
  const toggleWishlist = useStore((state) => state.toggleWishlist);

  // States
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("default");
  


  // Parse query params on mount/change
  useEffect(() => {
    const category = searchParams.get("category");
    const sub = searchParams.get("sub");
    const search = searchParams.get("search");
    
    if (category) {
      setSelectedCategory(category);
    } else {
      setSelectedCategory("All");
    }

    if (sub) {
      setActiveSubcategory(sub);
    } else {
      setActiveSubcategory(null);
    }

    if (search) {
      setSearchQuery(search);
    } else {
      setSearchQuery("");
    }
  }, [searchParams]);

  // Handle category tab click
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setActiveSubcategory(null); // Clear subcategory on main category switch
    
    // Update URL params
    const params = new URLSearchParams();
    if (category !== "All") {
      params.set("category", category);
    }
    router.push(`/collection?${params.toString()}`);
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const pCat = p.category.toLowerCase();
    const pSub = p.subcategory.toLowerCase();
    const selCat = selectedCategory.toLowerCase();
    
    const matchCategory = selectedCategory === "All" || 
                          pCat.includes(selCat) || 
                          pSub.includes(selCat) ||
                          (selCat === "saree" && pCat.includes("weave"));
                          
    const matchSubcategory = !activeSubcategory || pSub === activeSubcategory.toLowerCase();
    const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        p.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.desc.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchCategory && matchSubcategory && matchSearch;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    if (sortBy === "rating") return b.rating - a.rating;
    return String(a.id).localeCompare(String(b.id)); // Default / ID sort
  });



  const isFavorited = (productId: string) => wishlist.some((item) => String(item.id) === String(productId));

  return (
    <section className="catalog-section">
      <div className="catalog-section__container">
        
        {/* Page Editorial Header */}
        <div className="catalog-header">
          <span className="catalog-header__tag">Designs of Dreams</span>
          <h1 className="catalog-header__title">
            {activeSubcategory ? activeSubcategory : `${selectedCategory} Collection`}
          </h1>
          <p className="catalog-header__desc">
            Explore our curated catalog of traditional handlooms, heavy bridal zardozi, and contemporary silhouettes.
          </p>
        </div>

        {/* Filters Controls Panel */}
        <div className="catalog-controls">
          {/* Category Tabs */}
          <div className="catalog-tabs">
            {["All", "Saree", "Kurti", "Blouse", "Dupatta"].map((cat) => (
              <button
                key={cat}
                className={`catalog-tabs__btn ${selectedCategory === cat ? "is-active" : ""}`}
                onClick={() => handleCategoryChange(cat)}
              >
                {cat === "All" ? "All Masterpieces" : `${cat}s`}
              </button>
            ))}
          </div>

          {/* Search and Sort Toolbar */}
          <div className="catalog-toolbar">
            <div className="search-box">
              <Search size={18} className="search-box__icon" />
              <input 
                type="text" 
                placeholder="Search catalog..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-box__input"
              />
            </div>

            <div className="sort-box">
              <SlidersHorizontal size={16} className="sort-box__icon" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-box__select"
              >
                <option value="default">Default Sort</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Subcategory Tag Indicator */}
        {activeSubcategory && (
          <div className="subcategory-indicator">
            <span>Filtering by Subcategory: <strong>{activeSubcategory}</strong></span>
            <button 
              onClick={() => {
                setActiveSubcategory(null);
                const params = new URLSearchParams();
                if (selectedCategory !== "All") params.set("category", selectedCategory);
                router.push(`/collection?${params.toString()}`);
              }}
              className="subcategory-indicator__clear"
            >
              Clear Filter <X size={14} />
            </button>
          </div>
        )}

        {/* Products Grid */}
        {sortedProducts.length === 0 ? (
          <div className="catalog-empty text-center">
            <h3>No items found</h3>
            <p>We couldn't find any products matching your active filters. Try resetting search queries or tabs.</p>
            <button 
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setActiveSubcategory(null);
                router.push("/collection");
              }}
              className="catalog-empty__btn"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <motion.div 
            className="product-grid"
            layout
          >
            <AnimatePresence mode="popLayout">
              {sortedProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layoutId={`product-${product.id}`}
                  className="product-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* Image wrapper */}
                  <div className="product-card__image-box" onClick={() => router.push(`/product/${product.id}`)}>
                    <Image
                      src={product.image}
                      alt={product.title}
                      fill
                      sizes="(max-width: 600px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="product-card__img"
                    />
                    <div className="product-card__overlay" />
                    <span className="product-card__badge">{product.badge}</span>
                    
                    {/* Hover Actions */}
                    <div className="product-card__actions" onClick={(e) => e.stopPropagation()}>
                      <button 
                        className={`action-btn ${isFavorited(product.id) ? "is-active" : ""}`}
                        onClick={() => toggleWishlist(product)}
                        title="Add to Wishlist"
                      >
                        <Heart size={18} fill={isFavorited(product.id) ? "var(--color-primary)" : "none"} />
                      </button>
                      <button 
                        className="action-btn"
                        onClick={() => router.push(`/product/${product.id}`)}
                        title="View Details"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="product-card__info">
                    <span className="product-card__category">{product.subcategory}</span>
                    <h3 className="product-card__title" onClick={() => router.push(`/product/${product.id}`)}>
                      {product.title}
                    </h3>
                    
                    <div className="product-card__meta">
                      <span className="price">₹{product.price.toLocaleString("en-IN")}</span>
                      <div className="rating">
                        <Star size={12} fill="currentColor" />
                        <span>{product.rating}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

      </div>



    </section>
  );
}
