"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useStore } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, ShoppingBag, ArrowLeft, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import "./Cart.scss";

export default function CartPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Zustand Store
  const cart = useStore((state) => state.cart);
  const updateQuantity = useStore((state) => state.updateQuantity);
  const removeFromCart = useStore((state) => state.removeFromCart);
  const user = useStore((state) => state.user);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Price Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.05); // 5% GST
  const shipping = subtotal > 1999 || subtotal === 0 ? 0 : 150;
  const grandTotal = subtotal + tax + shipping;

  return (
    <main className="relative pt-[120px] pb-[100px] bg-white min-h-screen">
      {/* Decorative background jali */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none" 
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='40' cy='40' r='38' fill='none' stroke='%23000000' stroke-width='0.5'/%3E%3C/svg%3E\")" }} 
      />

      <div className="cart-container">
        <AnimatePresence mode="wait">
          
          {cart.length === 0 ? (
            // EMPTY CART STATE
            <motion.div 
              key="empty-cart"
              className="cart-empty text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="empty-icon-wrapper">
                <ShoppingBag size={48} />
              </div>
              <h2>Your Shopping Bag is Empty</h2>
              <p>You haven't added any designer wear to your bag yet. Drape yourself in heritage with our handloom catalog.</p>
              <Link href="/collection" className="empty-cta-btn">
                Browse Master Catalog
              </Link>
            </motion.div>
          ) : (
            // FULL CART LIST & SUMMARY
            <motion.div 
              key="cart-content"
              className="cart-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Left Column: Items List */}
              <div className="cart-items-column">
                <div className="column-header">
                  <h3>Shopping Bag ({cart.length})</h3>
                  <Link href="/collection" className="back-link">
                    <ArrowLeft size={14} />
                    Back to Catalog
                  </Link>
                </div>

                <div className="items-list">
                  {cart.map((item) => (
                    <div key={`${item.product.id}-${item.size}`} className="cart-item-card">
                      <div className="cart-item-card__img-wrapper">
                        <Image 
                          src={item.product.image} 
                          alt={item.product.title} 
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                      
                      <div className="cart-item-card__details">
                        <span className="category">{item.product.subcategory}</span>
                        <h4 className="title">{item.product.title}</h4>
                        <span className="size">Size: <strong>{item.size}</strong></span>
                        <span className="price-unit">₹{item.product.price.toLocaleString("en-IN")} each</span>
                      </div>

                      {/* Quantity Controls */}
                      <div className="cart-item-card__qty">
                        <button onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}>+</button>
                      </div>

                      <div className="cart-item-card__total-price">
                        <span>₹{(item.product.price * item.quantity).toLocaleString("en-IN")}</span>
                      </div>

                      <button 
                        className="cart-item-card__remove"
                        onClick={() => removeFromCart(item.product.id, item.size)}
                        title="Remove Item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Checkout Summary */}
              <div className="cart-summary-column">
                <div className="summary-card">
                  <h3>Order Summary</h3>
                  <div className="divider" />
                  
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>

                  <div className="summary-row">
                    <span>GST (5%)</span>
                    <span>₹{tax.toLocaleString("en-IN")}</span>
                  </div>

                  <div className="summary-row">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
                  </div>

                  {shipping > 0 && (
                    <p className="shipping-alert">
                      Add <strong>₹{(2000 - subtotal).toLocaleString("en-IN")}</strong> more to get free shipping!
                    </p>
                  )}

                  <div className="divider" />

                  <div className="summary-row summary-row--total">
                    <span>Grand Total</span>
                    <span>₹{grandTotal.toLocaleString("en-IN")}</span>
                  </div>

                  {/* Checkout Button */}
                  <button 
                    className="checkout-trigger-btn"
                    onClick={() => router.push("/checkout")}
                  >
                    Proceed to Checkout
                  </button>

                  <div className="summary-trust">
                    <ShieldCheck size={16} />
                    <span>Safe & Secured Checkout</span>
                  </div>
                </div>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </main>
  );
}
