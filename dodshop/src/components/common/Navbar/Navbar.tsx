"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  User,
  Heart,
  ShoppingBag,
  ChevronRight,
  ChevronLeft,
  Mail,
  Phone,
  X,
  Menu,
  Home,
  Info,
  Layers,
  PhoneCall,
  LogIn,
  Gift,
} from "lucide-react";
import { useStore } from "@/store/useStore";

// ── DATA STRUCTURE ───────────────────────────────────────────────────────────
const taglines = [
  "Elegant Ethnic Wear for Every You",
  "Free Shipping on All Orders Above ₹1999",
  "Handcrafted with Love in India",
  "New Festive Collection Out Now!"
];

const megaMenuData: any = {
  Kurti: {
    title: "Kurti",
    image: "/mobile/kurti.jpg",
    description: "Stylish Kurtis for Every Occasion",
    sections: [
      {
        id: "categories",
        title: "Kurti Categories",
        links: ["Anarkali Kurti", "A-Line Kurti", "Straight Kurti", "Short Kurti", "Long Kurti", "Party Wear Kurti", "Printed Kurti", "Embroidered Kurti"],
        viewAll: "View All Kurtis"
      },
      {
        id: "fabrics",
        title: "Kurti Fabrics",
        links: ["Cotton", "Rayon", "Silk", "Georgette", "Chiffon", "Linen", "Khadi", "Crepe"],
        viewAll: "View All Fabrics"
      },
      {
        id: "designs",
        title: "Kurti Designs",
        links: ["Embroidered", "Printed", "Plain", "Floral", "Mirror Work", "Aari Work", "Handwork", "Block Print"],
        viewAll: "View All Designs"
      }
    ]
  },
  Saree: {
    title: "Saree",
    image: "/mobile/saree.jpg",
    description: "Elegant Sarees for Every You",
    sections: [
      { id: "types", title: "Saree Types", links: ["Banarasi", "Silk", "Chiffon", "Net", "Cotton"], viewAll: "View All" }
    ]
  },
  Blouse: {
    title: "Blouse",
    image: "/mobile/blouse.jpg",
    description: "Trendy Blouses in Latest Designs",
    sections: [
      { id: "styles", title: "Blouse Styles", links: ["Ready Made", "Custom", "Designer"], viewAll: "View All" }
    ]
  },
  Dupatta: {
    title: "Dupatta",
    image: "/mobile/dupatta.jpg",
    description: "Beautiful Dupattas to Complete Your Look",
    sections: [
      { id: "styles", title: "Styles", links: ["Heavy", "Light", "Floral"], viewAll: "View All" }
    ]
  }
};

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";
  const [isScrolled, setIsScrolled] = useState(false);
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [isMegaOpen, setIsMegaOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<keyof typeof megaMenuData>("Kurti");
  const [mounted, setMounted] = useState(false);

  // Profile dropdown states
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [activeDropdownSection, setActiveDropdownSection] = useState<string | null>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Search overlay states
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [navSearchQuery, setNavSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!navSearchQuery.trim()) return;
    setIsSearchOpen(false);
    router.push(`/collection?search=${encodeURIComponent(navSearchQuery.trim())}`);
  };

  const handleSuggestionClick = (tag: string) => {
    setIsSearchOpen(false);
    setNavSearchQuery(tag);
    router.push(`/collection?search=${encodeURIComponent(tag)}`);
  };

  // Store connection
  const cart = useStore((state) => state.cart);
  const wishlist = useStore((state) => state.wishlist);
  const user = useStore((state) => state.user);
  const logoutAction = useStore((state) => state.logout);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    const interval = setInterval(() => setTaglineIndex((p) => (p + 1) % taglines.length), 4000);
    return () => { window.removeEventListener("scroll", handleScroll); clearInterval(interval); };
  }, []);

  if (pathname === "/login") return null;

  const shouldBeSolid = !isHome || isScrolled;

  const cartCount = mounted ? cart.reduce((acc, item) => acc + item.quantity, 0) : 0;
  const wishlistCount = mounted ? wishlist.length : 0;
  const userLoggedIn = mounted ? !!user?.isLoggedIn : false;

  return (
    <header className={`navbar-wrapper ${shouldBeSolid ? "is-scrolled" : ""}`}>
      {/* ── TOP BAR (Hidden on Mobile) ────────────────────────────────────── */}
      <div className="navbar-top">
        <div className="navbar-top__container">
          <div className="navbar-top__left">
            <Mail size={14} className="navbar-top__icon" />
            <a href="mailto:hello@sareestyle.com">hello@sareestyle.com</a>
          </div>
          <div className="navbar-top__center">
            <span className="navbar-top__line" />
            <span className="navbar-top__dot" />
            <div className="navbar-top__slider">
              <AnimatePresence mode="wait">
                <motion.p key={taglineIndex} initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -15, opacity: 0 }} transition={{ duration: 0.5 }}>
                  {taglines[taglineIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
            <span className="navbar-top__dot" />
            <span className="navbar-top__line" />
          </div>
          <div className="navbar-top__right">
            <Phone size={14} className="navbar-top__icon" />
            <a href="tel:+919876543210">+91 98765 43210</a>
          </div>
        </div>
      </div>

      {/* ── MAIN NAVBAR ─────────────────────────────────────────────────────── */}
      <div className="navbar-main">
        <div className="navbar-main__container">
          {/* Brand Logo Box */}
          <Link href="/" className="navbar-brand">
            <div className="navbar-brand__logo-img">
              <img src="/logo.png" alt="Logo" />
            </div>
            <div className="navbar-brand__text">
              <h1 className="navbar-brand__title">DESIGNS OF DREAMS</h1>
              <p className="navbar-brand__tagline">Grace in Every Drape</p>
            </div>
          </Link>

          {/* Desktop Nav (Hidden on Mobile) */}
          <nav className="navbar-nav desktop-only">
            <ul className="navbar-nav__list">
              <li className="navbar-nav__item"><Link href="/" className="navbar-nav__link">Home</Link></li>
              <li className="navbar-nav__item"><Link href="/about" className="navbar-nav__link">About</Link></li>
              {/* MEGA MENU ITEM */}
              <li
                className="navbar-nav__item has-mega"
                onMouseEnter={() => setIsMegaOpen(true)}
                onMouseLeave={() => setIsMegaOpen(false)}
              >
                <div
                  className="navbar-nav__link"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setIsMegaOpen(!isMegaOpen)}
                >
                  Collection <ChevronRight size={14} style={{ transform: isMegaOpen ? 'rotate(-90deg)' : 'rotate(90deg)', transition: 'transform 0.3s' }} />
                </div>

                <AnimatePresence>
                  {isMegaOpen && (
                    <motion.div
                      className="mega-menu"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="mega-menu__container" onClick={(e) => e.stopPropagation()}>
                        {/* Sidebar Tabs */}
                        <div className="mega-menu__sidebar">
                          {Object.keys(megaMenuData).map((key) => (
                            <button
                              key={key}
                              className={`mega-menu__tab ${activeTab === key ? "is-active" : ""}`}
                              onMouseEnter={() => setActiveTab(key as any)}
                            >
                              {key}
                              <ChevronRight size={16} />
                            </button>
                          ))}
                        </div>

                        {/* Content Grid */}
                        <div className="mega-menu__content">
                          <div className="mega-menu__grid">
                            {megaMenuData[activeTab].sections.map((section: any) => (
                              <div key={section.id} className="mega-menu__column">
                                <div className="mega-menu__icon-circle">
                                  <Layers size={24} />
                                </div>
                                <h4 className="mega-menu__column-title">{section.title}</h4>
                                <ul className="mega-menu__links">
                                  {section.links.map((link: string) => (
                                    <li key={link}>
                                      <Link href={`/collection?category=${activeTab as string}&sub=${encodeURIComponent(link)}`} className="mega-menu__link" onClick={() => setIsMegaOpen(false)}>
                                        {link}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                                <Link href={`/collection?category=${activeTab as string}`} className="mega-menu__view-all" onClick={() => setIsMegaOpen(false)}>
                                  {section.viewAll} <ChevronRight size={14} />
                                </Link>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
              <li className="navbar-nav__item"><Link href="/contact" className="navbar-nav__link">Contact</Link></li>
            </ul>
          </nav>

          {/* Icons & Hamburger */}
          <div className="navbar-actions">
            {/* Search Icon Button: Now visible on both mobile and desktop */}
            <button
              className="navbar-actions__btn"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Open Search"
            >
              <Search size={22} />
            </button>
            <Link href="/cart" className="navbar-actions__btn navbar-actions__btn--badge desktop-only">
              <ShoppingBag size={22} />
              {cartCount > 0 && <span className="navbar-actions__count">{cartCount}</span>}
            </Link>
            <Link href="/wishlist" className="navbar-actions__btn navbar-actions__btn--badge desktop-only">
              <Heart size={22} />
              {wishlistCount > 0 && <span className="navbar-actions__count">{wishlistCount}</span>}
            </Link>
            {userLoggedIn ? (
              <div className="navbar-profile-container desktop-only" ref={profileDropdownRef} style={{ position: "relative" }}>
                <button
                  type="button"
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="navbar-actions__btn"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FF6A00' }}
                  aria-expanded={isProfileDropdownOpen}
                >
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "cover", border: "1.5px solid #FF6A00" }} 
                    />
                  ) : (
                    <User size={22} style={{ stroke: '#FF6A00' }} />
                  )}
                  <span style={{ fontSize: '11px', fontFamily: 'var(--font-poppins)', fontWeight: 600, color: '#FF6A00' }}>
                    {user?.name}
                  </span>
                </button>

                <AnimatePresence>
                  {isProfileDropdownOpen && (
                    <motion.div
                      className="profile-dropdown"
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="profile-dropdown__header">
                        <span className="user-email">{user?.email}</span>
                      </div>
                      <div className="profile-dropdown__menu-items">
                        
                        {/* Profile Link */}
                        <div className="dropdown-section">
                          <Link 
                            href="/profile"
                            className="section-trigger"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            <span>Profile</span>
                          </Link>
                        </div>

                        {/* Order Link */}
                        <div className="dropdown-section">
                          <Link 
                            href="/order"
                            className="section-trigger"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            <span>Order</span>
                          </Link>
                        </div>

                        {/* Settings Link */}
                        <div className="dropdown-section">
                          <Link 
                            href="/settings"
                            className="section-trigger"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            <span>Settings</span>
                          </Link>
                        </div>

                        {/* Logout */}
                        <div className="dropdown-section dropdown-section--logout">
                          <button 
                            type="button"
                            className="section-trigger"
                            onClick={() => {
                              setIsProfileDropdownOpen(false);
                              logoutAction();
                              router.push("/login");
                            }}
                          >
                            <span>Logout</span>
                          </button>
                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link href="/login" className="navbar-actions__btn desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={22} />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── SEARCH OVERLAY ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            className="navbar-search-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button
              className="navbar-search-overlay__close"
              onClick={() => setIsSearchOpen(false)}
              aria-label="Close search"
            >
              <X size={32} />
            </button>

            <motion.div
              className="navbar-search-overlay__content"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="navbar-search-overlay__subtitle">Discover Our Masterpieces</span>
              <h2 className="navbar-search-overlay__title">What are you looking for?</h2>

              <form onSubmit={handleSearchSubmit} className="navbar-search-overlay__form">
                <div className="navbar-search-overlay__input-wrapper">
                  <input
                    type="text"
                    placeholder="Search for sarees, kurtis, blouses..."
                    value={navSearchQuery}
                    onChange={(e) => setNavSearchQuery(e.target.value)}
                    className="navbar-search-overlay__input"
                    autoFocus
                  />
                  <button type="submit" className="navbar-search-overlay__submit-btn">
                    <Search size={28} />
                  </button>
                </div>
              </form>

              <div className="navbar-search-overlay__suggestions">
                <p>Trending Searches:</p>
                <div className="suggestion-tags">
                  {["Banarasi", "Kurti", "Blouse", "Dupatta", "Anarkali", "Silk Saree"].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleSuggestionClick(tag)}
                      className="suggestion-tag"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
