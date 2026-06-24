"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Calendar, Sparkles, Send, CheckCircle } from "lucide-react";
import "./Contact.scss";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    interest: "Saree",
    date: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          setForm({
            name: "",
            email: "",
            phone: "",
            interest: "Saree",
            date: "",
            message: ""
          });
        }, 4000);
      } else {
        alert(data.error || 'Failed to submit. Please try again.');
      }
    } catch (err) {
      console.error('Contact form error:', err);
      alert('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="contact-section">
      <div className="contact-section__container">

        {/* Left Side: Editorial Info */}
        <motion.div
          className="contact-info"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="contact-info__header">
            <span className="contact-info__tag">
              <Sparkles size={12} />
              Atelier Appointments
            </span>
            <h2 className="contact-info__title">Visit the <span>Atelier</span></h2>
            <p className="contact-info__desc">
              Experience the weight, drape, and texture of our heritage collections in person. Book a private styling consultation at our Peeli Kothi flagship workshop.
            </p>
          </div>

          <div className="contact-details">
            <div className="contact-card">
              <div className="contact-card__icon"><MapPin size={20} /></div>
              <div className="contact-card__content">
                <h4>Peeli Kothi Atelier</h4>
                <p>K-46/2, Near Peeli Kothi Crossing, Varanasi, UP, India</p>
              </div>
            </div>

            <div className="contact-card">
              <div className="contact-card__icon"><Phone size={20} /></div>
              <div className="contact-card__content">
                <h4>Private Styling Phone</h4>
                <p><a href="tel:+919876543210">+91 98765 43210</a></p>
              </div>
            </div>

            <div className="contact-card">
              <div className="contact-card__icon"><Mail size={20} /></div>
              <div className="contact-card__content">
                <h4>Atelier Inquiries</h4>
                <p><a href="mailto:appointments@sareestyle.com">appointments@sareestyle.com</a></p>
              </div>
            </div>

            <div className="contact-card">
              <div className="contact-card__icon"><Clock size={20} /></div>
              <div className="contact-card__content">
                <h4>Atelier Experience Hours</h4>
                <p>Monday – Saturday: 11:00 AM – 08:00 PM</p>
                <p className="highlight">Strictly by pre-booked appointment</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Appointment Booking Form */}
        <motion.div
          className="contact-booking"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="contact-booking__form-box">
            <h3>Request Styling Session</h3>
            <p>Fill out the details below, and our atelier concierge will contact you within 24 hours to confirm your private experience.</p>

            <form onSubmit={handleSubmit} className="booking-form">
              <div className="booking-form__group">
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your Full Name"
                  className="booking-form__input"
                />
                <span className="booking-form__line" />
              </div>

              <div className="booking-form__row">
                <div className="booking-form__group">
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="Email Address"
                    className="booking-form__input"
                  />
                  <span className="booking-form__line" />
                </div>

                <div className="booking-form__group">
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="Phone Number"
                    className="booking-form__input"
                  />
                  <span className="booking-form__line" />
                </div>
              </div>

              <div className="booking-form__row">
                <div className="booking-form__group">
                  <select
                    value={form.interest}
                    onChange={(e) => setForm({ ...form, interest: e.target.value })}
                    className="booking-form__input booking-form__select"
                  >
                    <option value="Saree">Saree Collection</option>
                    <option value="Kurti">Chikankari Kurti</option>
                    <option value="Lehenga">Custom Lehenga</option>
                    <option value="Blouse">Artisanal Blouse</option>
                  </select>
                  <span className="booking-form__line" />
                </div>

                <div className="booking-form__group booking-form__group--date">
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="booking-form__input booking-form__date"
                  />
                  <span className="booking-form__line" />
                  <Calendar size={16} className="booking-form__date-icon" />
                </div>
              </div>

              <div className="booking-form__group">
                <textarea
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Special requests or measurements (Optional)"
                  className="booking-form__input booking-form__textarea"
                />
                <span className="booking-form__line" />
              </div>

              <button type="submit" className="booking-form__btn" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Request Appointment'}
                {!submitting && <Send size={15} />}
              </button>
            </form>

            {/* Success Animation Notification */}
            <AnimatePresence>
              {submitted && (
                <motion.div
                  className="booking-form__success"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                >
                  <CheckCircle size={24} className="success-icon" />
                  <div>
                    <h5>Request Submitted</h5>
                    <p>We have received your appointment request. Check your inbox shortly for our confirmation call.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </motion.div>

      </div>
    </section>
  );
}
