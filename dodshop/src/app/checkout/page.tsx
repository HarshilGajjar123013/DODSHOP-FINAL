"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle,
  CreditCard,
  Landmark,
  Truck,
  ArrowRight,
  ShoppingBag
} from "lucide-react";
import "./Checkout.scss";

export default function CheckoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");

  // Saved Addresses
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");

  // Zustand Store
  const cart = useStore((state) => state.cart);
  const clearCart = useStore((state) => state.clearCart);
  const user = useStore((state) => state.user);

  useEffect(() => {
    setMounted(true);
    if (user?.isLoggedIn && user?.name) {
      setFullName(user.name);
    }
  }, [user]);

  // Fetch Saved Addresses
  useEffect(() => {
    if (user?.isLoggedIn && user?.id) {
      const fetchAddresses = async () => {
        try {
          const res = await fetch(`/api/addresses?userId=${user.id}`);
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.addresses) {
              setSavedAddresses(data.addresses);
              // Auto-select default address if present
              const defaultAddr = data.addresses.find((a: any) => a.isDefault);
              if (defaultAddr) {
                setSelectedAddressId(defaultAddr.id);
                // Autofill
                setPhone(defaultAddr.phone || "");
                setAddress(defaultAddr.line1 + (defaultAddr.line2 ? ", " + defaultAddr.line2 : ""));
                setCity(defaultAddr.city || "");
                setPincode(defaultAddr.postalCode || "");
              }
            }
          }
        } catch (err) {
          console.error("Failed to load saved addresses for autofill:", err);
        }
      };
      fetchAddresses();
    }
  }, [user]);

  const handleSelectAddress = (addrId: string) => {
    setSelectedAddressId(addrId);
    const addr = savedAddresses.find(a => a.id === addrId);
    if (addr) {
      setPhone(addr.phone || "");
      setAddress(addr.line1 + (addr.line2 ? ", " + addr.line2 : ""));
      setCity(addr.city || "");
      setPincode(addr.postalCode || "");
    }
  };

  if (!mounted) return null;

  // Price Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.05); // 5% GST
  const shipping = subtotal > 1999 || subtotal === 0 ? 0 : 150;
  const grandTotal = subtotal + tax + shipping;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          phone,
          address,
          city,
          pincode,
          paymentMethod,
          cart,
          customerEmail: user?.email || 'guest@luxury.in',
          customerId: user?.id || 'guest-1',
        }),
      });

      const data = await response.json();
      if (data.success) {
        setOrderId(data.orderId);
        setOrderComplete(true);
        clearCart();
      } else {
        alert(data.error || "Failed to place order. Please check item stock levels.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative pt-[120px] pb-[100px] bg-white min-h-screen">
      {/* Decorative background jali */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='40' cy='40' r='38' fill='none' stroke='%23000000' stroke-width='0.5'/%3E%3C/svg%3E\")" }}
      />

      <div className="checkout-container">
        <AnimatePresence mode="wait">

          {orderComplete ? (
            // SUCCESS CHECKOUT PANEL
            <motion.div
              key="success-order"
              className="checkout-success text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="success-icon-wrapper">
                <CheckCircle size={48} className="text-emerald-500" />
              </div>
              <h2 className="success-title">Order Placed Successfully</h2>
              <p className="success-subtitle">Order ID: <strong>{orderId}</strong></p>

              <div className="success-card">
                <h4>Thank You for Booking Heritage</h4>
                <p>A confirmation SMS and email have been sent to your registered address. Our atelier courier partner will contact you shortly to coordinate the delivery of your handloom masterpiece.</p>
                <div className="delivery-badge">
                  <Truck size={16} />
                  <span>Estimated Delivery: 4-6 business days</span>
                </div>
              </div>

              <Link href="/collection" className="back-catalog-btn">
                <ArrowLeft size={16} />
                Continue Exploring
              </Link>
            </motion.div>
          ) : cart.length === 0 ? (
            <motion.div
              key="empty-checkout"
              className="checkout-empty text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="empty-icon-wrapper">
                <ShoppingBag size={48} />
              </div>
              <h2>Your Shopping Bag is Empty</h2>
              <p>You cannot check out with an empty shopping bag. Discover our handloom masterpieces to get started.</p>
              <Link href="/collection" className="empty-cta-btn">
                Browse Master Catalog
              </Link>
            </motion.div>
          ) : (
            // FULL CHECKOUT PAGE
            <motion.div
              key="checkout-content"
              className="checkout-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Left Column: Form */}
              <div className="checkout-form-column">
                <div className="column-header">
                  <Link href="/cart" className="back-link">
                    <ArrowLeft size={14} />
                    Back to Cart
                  </Link>
                  <h3>Secure Atelier Checkout</h3>
                </div>

                <form onSubmit={handleCheckoutSubmit} className="checkout-main-form">
                  <div className="form-section-card">
                    <h4>1. Delivery Information</h4>

                    {/* Saved addresses selector card style */}
                    {user?.isLoggedIn && savedAddresses.length > 0 && (
                      <div className="mb-6">
                        <label className="block text-sm font-semibold text-zinc-700 mb-2">Select from Saved Addresses</label>
                        <div className="address-selector-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px", marginBottom: "16px" }}>
                          {savedAddresses.map((addr) => (
                            <div
                              key={addr.id}
                              className={`address-select-card ${selectedAddressId === addr.id ? "is-active-card" : ""}`}
                              style={{
                                padding: "12px",
                                border: selectedAddressId === addr.id ? "2px solid #FF6A00" : "1px solid rgba(0,0,0,0.1)",
                                borderRadius: "10px",
                                backgroundColor: "#FAF9F6",
                                cursor: "pointer",
                                fontSize: "0.8rem",
                                position: "relative"
                              }}
                              onClick={() => handleSelectAddress(addr.id)}
                            >
                              <div className="flex justify-between font-bold mb-1" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontWeight: 700 }}>{addr.label}</span>
                                {addr.isDefault && <span className="text-[#FF6A00]" style={{ color: "#FF6A00", fontSize: "0.7rem", fontWeight: 700 }}>DEFAULT</span>}
                              </div>
                              <p className="text-zinc-600 text-xs truncate" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: "2px 0" }}>{addr.line1}</p>
                              <p className="text-zinc-500 text-xs" style={{ color: "rgba(0,0,0,0.5)" }}>{addr.city}, {addr.postalCode}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="form-grid">
                      <div className="form-group full-width">
                        <label>Full Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Priyanshu Sharma"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                        />
                      </div>

                      <div className="form-group full-width">
                        <label>Phone Number</label>
                        <input
                          type="tel"
                          required
                          pattern="[0-9]{10}"
                          placeholder="e.g. 9876543210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>

                      <div className="form-group full-width">
                        <label>Shipping Address</label>
                        <input
                          type="text"
                          required
                          placeholder="Street Address, Apartment, Suite"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>City</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Varanasi"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>Pincode</label>
                        <input
                          type="text"
                          required
                          pattern="[0-9]{6}"
                          placeholder="e.g. 221001"
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-section-card">
                    <h4>2. Select Payment Mode</h4>
                    <div className="payment-options">
                      <label className={`payment-option ${paymentMethod === "COD" ? "is-selected" : ""}`}>
                        <input
                          type="radio"
                          name="payment"
                          value="COD"
                          checked={paymentMethod === "COD"}
                          onChange={() => setPaymentMethod("COD")}
                        />
                        <div className="option-inner">
                          <Truck size={20} />
                          <span>Cash On Delivery</span>
                        </div>
                      </label>

                      <label className={`payment-option ${paymentMethod === "UPI" ? "is-selected" : ""}`}>
                        <input
                          type="radio"
                          name="payment"
                          value="UPI"
                          checked={paymentMethod === "UPI"}
                          onChange={() => setPaymentMethod("UPI")}
                        />
                        <div className="option-inner">
                          <Landmark size={20} />
                          <span>UPI Payment</span>
                        </div>
                      </label>

                      <label className={`payment-option ${paymentMethod === "CARD" ? "is-selected" : ""}`}>
                        <input
                          type="radio"
                          name="payment"
                          value="CARD"
                          checked={paymentMethod === "CARD"}
                          onChange={() => setPaymentMethod("CARD")}
                        />
                        <div className="option-inner">
                          <CreditCard size={20} />
                          <span>Credit / Debit Card</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="mobile-sticky-btn-wrapper">
                    <button
                      type="submit"
                      className="place-order-btn"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Placing Your Order..." : "Place Order Masterpiece"}
                      {!isSubmitting && <ArrowRight size={18} />}
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Column: Order Review */}
              <div className="checkout-review-column">
                <div className="review-card">
                  <h3>Order Review</h3>
                  <div className="review-items">
                    {cart.map((item) => (
                      <div key={`${item.product.id}-${item.size}`} className="review-item">
                        <div className="review-item__img-wrapper">
                          <Image
                            src={item.product.image}
                            alt={item.product.title}
                            fill
                            style={{ objectFit: 'cover' }}
                          />
                        </div>
                        <div className="review-item__details">
                          <span className="category">{item.product.subcategory}</span>
                          <h4 className="title">{item.product.title}</h4>
                          <span className="qty-size">Qty: {item.quantity} | Size: {item.size}</span>
                        </div>
                        <div className="review-item__price">
                          ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
                        </div>
                      </div>
                    ))}
                  </div>

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

                  <div className="divider" />

                  <div className="summary-row summary-row--total">
                    <span>Grand Total</span>
                    <span>₹{grandTotal.toLocaleString("en-IN")}</span>
                  </div>

                  <div className="summary-trust">
                    <ShieldCheck size={16} />
                    <span>Safe & Secured Atelier Checkout</span>
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
