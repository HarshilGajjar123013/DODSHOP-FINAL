"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Heart, Users, Compass, ShieldCheck, Sun } from "lucide-react";
import "./About.scss";

const pillars = [
  {
    icon: <Compass size={24} />,
    title: "Heritage Preservation",
    desc: "We work directly with Varanasi's generational master weavers to preserve the traditional techniques of pure zari handloom weaving."
  },
  {
    icon: <Heart size={24} />,
    title: "Artisanal Integrity",
    desc: "Every Chikankari shadow stitch and Zardozi knot is done completely by hand, celebrating human touch and imperfection."
  },
  {
    icon: <ShieldCheck size={24} />,
    title: "Authentic Materials",
    desc: "We use only pure mulberry silks, certified natural cottons, and genuine metallic threads to ensure heirloom-quality garments."
  }
];

const timelineMilestones = [
  {
    year: "1994",
    title: "The First Handloom",
    desc: "Started as a small collection of two traditional handlooms in the heritage lanes of Peeli Kothi, Varanasi, weaving custom Banarasi sarees."
  },
  {
    year: "2008",
    title: "Artisan Collective",
    desc: "Expanded into a community collective supporting over 50 weaver families, guaranteeing fair wages and reviving near-extinct patterns."
  },
  {
    year: "2018",
    title: "Designs of Dreams Atelier",
    desc: "Launched our first boutique atelier experience, bringing direct-from-weaver luxury to a modern retail space."
  },
  {
    year: "2026",
    title: "Global Legacy",
    desc: "Taking the craftsmanship of Banaras and Lucknow to the global stage, showcasing that tradition is the ultimate luxury."
  }
];

export default function About() {
  // Animation presets
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <section className="about-section">
      <div className="about-section__container">
        
        {/* ── Editorial Header ── */}
        <motion.div 
          className="about-header"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
        >
          <span className="about-header__tag">
            <Sparkles size={12} />
            Our Heritage
          </span>
          <h2 className="about-header__title">Designs of <span>Dreams</span></h2>
          <p className="about-header__desc">
            A celebration of hand-spun heritage, slow fashion, and the timeless artistry of Indian weavers.
          </p>
        </motion.div>

        {/* ── Section 1: Split Story Block ── */}
        <div className="about-story">
          <motion.div 
            className="about-story__image-wrapper"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <img 
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80" 
              alt="Heritage Handloom Weaving" 
              className="about-story__image"
            />
            <div className="about-story__image-border" />
          </motion.div>

          <motion.div 
            className="about-story__content"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="section-subtitle">Since 1994</span>
            <h3 className="section-title">The Legend of Peeli Kothi</h3>
            <p className="story-paragraph">
              Born in the historic silk weaving district of Varanasi, Designs of Dreams (DOD) represents an unbroken link to India's textile history. We believe that a saree is not just attire, but a canvas of culture, woven one thread at a time by hands that have inherited the craft over generations.
            </p>
            <p className="story-paragraph">
              Our journey began with a simple mission: to rescue traditional handloom motifs from the threat of mass-produced powerlooms. By collaborating directly with weavers at our Peeli Kothi atelier, we ensure that every design preserves its authentic weight, texture, and soul.
            </p>
          </motion.div>
        </div>

        {/* ── Section 2: Craftsmanship Pillars ── */}
        <motion.div 
          className="about-pillars"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <div className="about-pillars__grid">
            {pillars.map((pillar, index) => (
              <motion.div 
                key={index}
                className="pillar-card"
                variants={fadeUp}
              >
                <div className="pillar-card__icon-box">
                  {pillar.icon}
                </div>
                <h4 className="pillar-card__title">{pillar.title}</h4>
                <p className="pillar-card__desc">{pillar.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Section 3: Staggered Timeline ── */}
        <div className="about-timeline">
          <motion.div 
            className="timeline-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <span className="section-subtitle">Chronology</span>
            <h3 className="section-title">Our Sacred Journey</h3>
          </motion.div>

          <div className="timeline-track">
            <div className="timeline-line" />
            
            {timelineMilestones.map((milestone, index) => (
              <motion.div 
                key={index} 
                className={`timeline-item ${index % 2 === 0 ? "timeline-item--left" : "timeline-item--right"}`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="timeline-dot" />
                <div className="timeline-card">
                  <span className="timeline-card__year">{milestone.year}</span>
                  <h4 className="timeline-card__title">{milestone.title}</h4>
                  <p className="timeline-card__desc">{milestone.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Section 4: Tribute to Weavers ── */}
        <motion.div 
          className="about-tribute"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
        >
          <div className="about-tribute__box">
            <div className="about-tribute__left">
              <Sun size={32} className="about-tribute__icon" />
              <h3>The Hands of Banaras</h3>
              <p>
                Behind every luxury garment in our catalog is an artisan whose family has practiced weaving for generations. Our atelier supports sustainable wages, safe working conditions, and funds educational resources for our community's children.
              </p>
              <div className="about-tribute__stat">
                <span className="number">120+</span>
                <span className="label">Master Weavers & Craftspeople Supported</span>
              </div>
            </div>
            <div className="about-tribute__right">
              <img 
                src="https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=800&q=80" 
                alt="Artisan Spinning Silk Thread" 
                className="about-tribute__img"
              />
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
