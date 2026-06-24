'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAdminStore, Order } from '@/store/adminStore';
import { 
  Eye, Truck, FileText, CheckCircle2, AlertTriangle, 
  X, ArrowRight, Printer, ShieldAlert, CreditCard 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OrderManagement() {
  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  
  // Drawer & Invoice modal states
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<any | null>(null);

  // Tracking form inputs
  const [carrier, setCarrier] = useState('');
  const [trackingId, setTrackingId] = useState('');
  const [estDelivery, setEstDelivery] = useState('');

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadOrders();
  }, []);

  // Pre-fill tracking details when selecting order
  useEffect(() => {
    if (selectedOrder) {
      setCarrier(selectedOrder.trackingDetails?.carrier || 'DHL Express Cargo');
      setTrackingId(selectedOrder.trackingDetails?.trackingId || `DHL-DOD-${selectedOrder.id}`);
      setEstDelivery(selectedOrder.trackingDetails?.estimatedDelivery || '2026-06-30');
    }
  }, [selectedOrder]);

  if (!mounted) return null;

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.map(o => o.id === orderId ? data.order : o));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(data.order);
        }
      } else {
        alert(data.error || 'Failed to update order status');
      }
    } catch (e) {
      console.error(e);
      alert('Error updating order status');
    }
  };

  const handleUpdateTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carrier, trackingId, estimatedDelivery: estDelivery })
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.map(o => o.id === selectedOrder.id ? data.order : o));
        setSelectedOrder(data.order);
        alert('Tracking parameters updated successfully.');
      } else {
        alert(data.error || 'Failed to update tracking');
      }
    } catch (e) {
      console.error(e);
      alert('Error updating tracking');
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch = o.id.toLowerCase().includes(search.toLowerCase()) || 
                          o.customerName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'DELIVERED': return 'bg-green-50 text-[#0FA958] border-[rgba(15,169,88,0.15)]';
      case 'PROCESSING': return 'bg-amber-50 text-[#D99A00] border-[rgba(217,154,0,0.15)]';
      case 'SHIPPED': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'RETURNED': return 'bg-red-50 text-[#D83A3A] border-[rgba(216,58,58,0.15)]';
      case 'CANCELLED': return 'bg-gray-100 text-gray-500 border-gray-200';
      default: return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="border-b border-gray-100 pb-5">
          <h1 className="font-marcellus text-3xl font-light text-[#1A1A1A]">Order Management</h1>
          <p className="text-xs text-[#6E6E6E] font-poppins uppercase tracking-wider mt-1">Couture Logistics and Invoices</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by Order ID or Patron Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-3.5 bg-white border border-[rgba(0,0,0,0.06)] rounded-[16px] text-xs font-poppins focus:outline-none focus:border-[#C5A059] shadow-sm"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3.5 bg-white border border-[rgba(0,0,0,0.06)] rounded-[16px] text-xs font-poppins focus:outline-none focus:border-[#C5A059] text-gray-700 shadow-sm"
          >
            <option value="ALL">All Order Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="PACKED">Packed</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="RETURNED">Returned</option>
          </select>
        </div>

        {/* Order Table List */}
        <div className="glass-card rounded-[28px] p-6 shadow-luxury">
          <div className="overflow-x-auto">
            <table className="luxury-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Order Date</th>
                  <th>Grand Total</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((o) => (
                  <tr key={o.id}>
                    <td className="font-semibold text-xs text-gray-800 font-inter">{o.id}</td>
                    <td>
                      <div>
                        <p className="text-xs font-semibold text-gray-955">{o.customerName}</p>
                        <p className="text-[10px] text-gray-500">{o.customerEmail}</p>
                      </div>
                    </td>
                    <td className="text-xs text-gray-600 font-inter">
                      {new Date(o.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </td>
                    <td className="font-semibold text-xs text-gray-900 font-inter">
                      ₹{o.grandTotal.toLocaleString()}
                    </td>
                    <td>
                      <span className={`text-[9px] uppercase tracking-wider px-2.5 py-1 border rounded-full ${getStatusStyle(o.status)}`}>
                        {o.status}
                      </span>
                    </td>
                    <td>
                      <span className={`text-[9px] uppercase tracking-wider font-semibold font-inter ${
                        o.paymentStatus === 'PAID' ? 'text-[#0FA958]' : 'text-[#D99A00]'
                      }`}>
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="p-1.5 bg-white border border-gray-200 hover:border-[#C5A059] rounded-lg text-gray-600 hover:text-[#C5A059] transition-all flex items-center gap-1 text-[10px]"
                        >
                          <Eye size={12} /> Inspect
                        </button>
                        <button
                          onClick={() => setInvoiceOrder(o)}
                          className="p-1.5 bg-white border border-gray-200 hover:border-gray-800 rounded-lg text-gray-600 hover:text-gray-900 transition-all flex items-center gap-1 text-[10px]"
                        >
                          <FileText size={12} /> Invoice
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ORDER INSPECTION DRAWER */}
        <AnimatePresence>
          {selectedOrder && (
            <div className="fixed inset-0 z-50 flex justify-end">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedOrder(null)}
                className="absolute inset-0 bg-black"
              />

              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-full max-w-xl bg-white h-full relative shadow-2xl flex flex-col"
              >
                {/* Header */}
                <div className="h-20 border-b border-gray-100 flex items-center justify-between px-8 bg-gray-50">
                  <div>
                    <h3 className="font-marcellus text-lg text-gray-800 uppercase tracking-wider">
                      Inspect Order {selectedOrder.id}
                    </h3>
                    <p className="text-[10px] text-gray-500 font-inter">Placed: {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-all text-gray-500"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                  {/* Status update widget */}
                  <div className="border border-[rgba(197,160,89,0.2)] bg-[#FAF9F6] p-5 rounded-[20px] space-y-3">
                    <span className="text-[10px] uppercase font-bold text-[#C5A059] tracking-wider block">Fulfillment Action Center</span>
                    <div className="flex gap-2">
                      <select
                        value={selectedOrder.status}
                        onChange={(e) => {
                          handleUpdateOrderStatus(selectedOrder.id, e.target.value);
                        }}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs font-poppins focus:outline-none focus:border-[#C5A059] bg-white text-gray-700 font-semibold"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="PACKED">Packed</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                        <option value="RETURNED">Returned</option>
                      </select>

                      <button
                        onClick={() => setInvoiceOrder(selectedOrder)}
                        className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 bg-white hover:border-gray-800 hover:text-gray-900 transition-all flex items-center gap-1.5"
                      >
                        <Printer size={13} /> Print Invoice
                      </button>
                    </div>
                  </div>

                  {/* Customer information */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Patron Information</h4>
                    <div className="p-4 border border-gray-100 rounded-xl text-xs space-y-1">
                      <p className="font-semibold text-gray-900">{selectedOrder.customerName}</p>
                      <p className="text-gray-500">{selectedOrder.customerEmail}</p>
                      <p className="text-gray-500">{selectedOrder.shippingAddress.phone}</p>
                    </div>
                  </div>

                  {/* Shipping address */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Delivery Destination</h4>
                    <div className="p-4 border border-gray-100 rounded-xl text-xs space-y-1">
                      <p className="text-gray-700">{selectedOrder.shippingAddress.line1}</p>
                      {selectedOrder.shippingAddress.line2 && <p className="text-gray-700">{selectedOrder.shippingAddress.line2}</p>}
                      <p className="text-gray-700">
                        {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} — {selectedOrder.shippingAddress.postalCode}
                      </p>
                      <p className="text-gray-500 font-semibold uppercase text-[10px] mt-1">{selectedOrder.shippingAddress.country}</p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Items Breakdown</h4>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center p-3 border border-gray-100 rounded-xl text-xs">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-gray-50 overflow-hidden flex-shrink-0 relative">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{item.name}</p>
                              <p className="text-[10px] text-gray-400 font-inter">
                                SKU: {item.sku} | Size: {item.size} | Color Swatch
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-800 font-inter">₹{item.price.toLocaleString()}</p>
                            <p className="text-[10px] text-gray-400">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Courier tracking config */}
                  <div className="space-y-2 border-t border-gray-100 pt-4">
                    <h4 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Logistics & Tracking Configuration</h4>
                    <form onSubmit={handleUpdateTracking} className="p-4 border border-gray-100 rounded-xl space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[9px] uppercase font-bold text-gray-400 tracking-wider block mb-1">Logistics Carrier</label>
                          <input
                            type="text"
                            value={carrier}
                            onChange={(e) => setCarrier(e.target.value)}
                            placeholder="DHL Premium Cargo"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-poppins focus:outline-none focus:border-[#C5A059]"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] uppercase font-bold text-gray-400 tracking-wider block mb-1">Tracking ID Code</label>
                          <input
                            type="text"
                            value={trackingId}
                            onChange={(e) => setTrackingId(e.target.value)}
                            placeholder="DHL-DOD-8921"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-poppins focus:outline-none focus:border-[#C5A059]"
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-center gap-4">
                        <div className="flex-1">
                          <label className="text-[9px] uppercase font-bold text-gray-400 tracking-wider block mb-1">Estimated Delivery</label>
                          <input
                            type="date"
                            value={estDelivery}
                            onChange={(e) => setEstDelivery(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-inter focus:outline-none focus:border-[#C5A059]"
                          />
                        </div>
                        <button
                          type="submit"
                          className="bg-[#1A1A1A] hover:bg-[#C5A059] text-white px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all self-end"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* PRINT INVOICE MODAL */}
        <AnimatePresence>
          {invoiceOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                onClick={() => setInvoiceOrder(null)}
                className="absolute inset-0 bg-black"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl relative z-10 p-10 flex flex-col justify-between max-h-[90vh]"
              >
                {/* Print area */}
                <div id="print-area" className="flex-1 overflow-y-auto pr-2 space-y-8 print:p-0">
                  {/* Brand Header */}
                  <div className="flex justify-between items-start border-b border-gray-200 pb-6">
                    <div>
                      <span className="font-marcellus text-2xl tracking-[0.2em] uppercase font-light">
                        Designs of Dreams
                      </span>
                      <p className="text-[9px] uppercase tracking-[0.3em] text-[#C5A059] font-semibold">Atelier Couture</p>
                      <p className="text-[10px] text-gray-500 mt-2 font-poppins">Artisanal Hub: Sector 15, Noida, UP, India</p>
                      <p className="text-[10px] text-gray-500 font-poppins">Atelier GSTIN: 09AADCD1234F1Z5</p>
                    </div>
                    <div className="text-right">
                      <h3 className="font-marcellus text-2xl font-light text-gray-800 uppercase tracking-widest">Invoice</h3>
                      <p className="text-xs font-semibold text-gray-800 font-inter mt-1">#INV-{invoiceOrder.id}</p>
                      <p className="text-[10px] text-gray-500 mt-1 font-inter">Date: {new Date(invoiceOrder.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Customer Billing & Shipping */}
                  <div className="grid grid-cols-2 gap-8 text-xs font-poppins">
                    <div>
                      <h5 className="font-semibold text-gray-800 uppercase text-[10px] tracking-wider mb-2">Billed To:</h5>
                      <p className="font-bold text-gray-900">{invoiceOrder.customerName}</p>
                      <p className="text-gray-600 mt-1">{invoiceOrder.shippingAddress.line1}</p>
                      {invoiceOrder.shippingAddress.line2 && <p className="text-gray-600">{invoiceOrder.shippingAddress.line2}</p>}
                      <p className="text-gray-600">
                        {invoiceOrder.shippingAddress.city}, {invoiceOrder.shippingAddress.state} — {invoiceOrder.shippingAddress.postalCode}
                      </p>
                      <p className="text-gray-600 font-semibold">{invoiceOrder.shippingAddress.phone}</p>
                    </div>

                    <div className="text-right">
                      <h5 className="font-semibold text-gray-800 uppercase text-[10px] tracking-wider mb-2">Shipment details:</h5>
                      <p className="text-gray-700"><strong className="text-gray-900">Carrier:</strong> {invoiceOrder.trackingDetails?.carrier || 'Standard Atelier'}</p>
                      <p className="text-gray-700 mt-0.5"><strong className="text-gray-900">Tracking Code:</strong> {invoiceOrder.trackingDetails?.trackingId || 'N/A'}</p>
                      <p className="text-gray-700 mt-0.5"><strong className="text-gray-900">Method:</strong> {invoiceOrder.paymentMethod.replace('_', ' ')}</p>
                    </div>
                  </div>

                  {/* Items Invoice Table */}
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 text-[#C5A059] uppercase tracking-wider font-semibold text-[9px]">
                        <th className="py-3">Couture Piece</th>
                        <th className="py-3 text-center">SKU</th>
                        <th className="py-3 text-center">Qty</th>
                        <th className="py-3 text-right">Unit Price</th>
                        <th className="py-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoiceOrder.items.map((item: any, index: number) => (
                        <tr key={index} className="border-b border-gray-100 text-gray-700">
                          <td className="py-4 font-semibold">{item.name} ({item.size})</td>
                          <td className="py-4 text-center font-inter">{item.sku}</td>
                          <td className="py-4 text-center font-inter">{item.quantity}</td>
                          <td className="py-4 text-right font-inter">₹{item.price.toLocaleString()}</td>
                          <td className="py-4 text-right font-inter font-semibold">₹{(item.price * item.quantity).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Invoice Summary totals */}
                  <div className="flex justify-end pt-4">
                    <div className="w-64 space-y-2 text-xs font-poppins">
                      <div className="flex justify-between text-gray-500">
                        <span>Items Subtotal:</span>
                        <span className="font-semibold font-inter">₹{invoiceOrder.totalAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-gray-500">
                        <span>GST Tax (5% / 12%):</span>
                        <span className="font-semibold font-inter">₹{invoiceOrder.gstAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-gray-500">
                        <span>Delivery Fee:</span>
                        <span className="font-semibold font-inter">
                          {invoiceOrder.shippingAmount === 0 ? 'Free' : `₹${invoiceOrder.shippingAmount}`}
                        </span>
                      </div>
                      {invoiceOrder.discountAmount > 0 && (
                        <div className="flex justify-between text-[#FF6A00] font-semibold">
                          <span>Coupons Discount:</span>
                          <span className="font-inter">-₹{invoiceOrder.discountAmount.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-gray-900 font-bold border-t border-gray-200 pt-3 text-sm">
                        <span>Grand Total:</span>
                        <span className="text-[#C5A059] font-inter">₹{invoiceOrder.grandTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Terms & Signature */}
                  <div className="border-t border-gray-100 pt-6 mt-8 flex justify-between items-center text-[10px] text-gray-400 font-poppins">
                    <p className="max-w-xs leading-relaxed">
                      * All boutique purchases are subject to Atelier registration terms. Returns must be requested within 7 days of delivery.
                    </p>
                    <div className="text-center">
                      <div className="w-32 h-[1px] bg-gray-200 mb-2 mx-auto" />
                      <p className="uppercase tracking-widest font-semibold text-[8px] text-gray-500">Atelier Registrar</p>
                    </div>
                  </div>
                </div>

                {/* Print button & footer */}
                <div className="border-t border-gray-100 pt-6 mt-6 flex justify-between items-center bg-white z-20">
                  <span className="text-[10px] text-gray-400">Atelier Print Server v1.0</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setInvoiceOrder(null)}
                      className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 bg-white hover:bg-gray-50 transition-all"
                    >
                      Close Window
                    </button>
                    <button
                      onClick={() => {
                        window.print();
                      }}
                      className="px-5 py-2 bg-[#1A1A1A] text-white rounded-xl text-xs font-semibold hover:bg-[#C5A059] transition-all shadow-md flex items-center gap-1.5 uppercase tracking-wider"
                    >
                      <Printer size={14} /> Send to Printer
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
