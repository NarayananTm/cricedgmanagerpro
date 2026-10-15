import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, CheckCircle2, X, Smartphone, CreditCard, User, Mail, Phone, Package, Info, ChevronRight, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from '../App';
import { Footer } from './Footer';
import { Ground } from '../types';
import { cn } from '../lib/utils';

export const GroundBookingInterface = () => {
  const [grounds, setGrounds] = useState<Ground[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGround, setSelectedGround] = useState<Ground | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState({ upi: '', bank: '', name: '' });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    date: '',
    startTime: '',
    endTime: '',
    paymentMethod: 'upi',
    upiAddress: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: ''
  });

  useEffect(() => {
    fetch('/api/grounds')
      .then(res => res.json())
      .then(data => {
        setGrounds(data);
        setLoading(false);
      });

    fetch('/api/settings/payment')
      .then(res => res.json())
      .then(data => setPaymentSettings(data));
  }, []);

  const calculateTotalPrice = () => {
    if (!selectedGround || !formData.startTime || !formData.endTime) return 0;
    const start = parseInt(formData.startTime.split(':')[0]);
    const end = parseInt(formData.endTime.split(':')[0]);
    const hours = Math.max(0, end - start);
    return hours * selectedGround.price_per_hour;
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGround) return;

    const totalPrice = calculateTotalPrice();
    const paymentDetails = formData.paymentMethod === 'upi' 
      ? formData.upiAddress 
      : `${formData.cardNumber} | ${formData.cardExpiry}`;

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ground_id: selectedGround.id,
          customer_name: formData.name,
          customer_email: formData.email,
          customer_mobile: formData.mobile,
          booking_date: formData.date,
          start_time: formData.startTime,
          end_time: formData.endTime,
          total_price: totalPrice,
          payment_method: formData.paymentMethod,
          payment_details: paymentDetails
        })
      });

      if (res.ok) {
        setBookingSuccess(true);
        setShowBookingModal(false);
        setFormData({
          name: '',
          email: '',
          mobile: '',
          date: '',
          startTime: '',
          endTime: '',
          paymentMethod: 'upi',
          upiAddress: '',
          cardNumber: '',
          cardExpiry: '',
          cardCvv: ''
        });
        setTimeout(() => setBookingSuccess(false), 5000);
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to place booking. Please try again.');
    }
  };

  const user = JSON.parse(localStorage.getItem('user_data') || 'null');
  const isPro = user?.plan === 'pro';

  if (loading) return <div className="p-12 text-center text-zinc-500">Loading grounds...</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tighter flex items-center gap-3">
              <Calendar className="h-8 w-8 text-emerald-500" />
              Ground <span className="text-emerald-500">Booking</span>
            </h1>
            <p className="text-zinc-500 mt-2">Book premium sports venues for your matches</p>
          </div>
          {isPro && (
            <Link 
              to="/admin/grounds" 
              className="bg-zinc-900 border border-white/10 px-6 py-3 rounded-2xl text-sm font-bold text-emerald-500 hover:bg-zinc-800 transition-all flex items-center gap-2"
            >
              <Package className="h-4 w-4" /> Manage Grounds
            </Link>
          )}
        </div>

        {/* Grounds Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {grounds.map(ground => (
            <motion.div 
              layout
              key={ground.id} 
              className="group rounded-3xl bg-zinc-900/30 border border-white/5 overflow-hidden hover:border-emerald-500/30 transition-all"
            >
              <div className="aspect-video bg-zinc-800 relative overflow-hidden">
                {ground.image_url ? (
                  <img 
                    src={ground.image_url} 
                    alt={ground.name} 
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <MapPin className="h-12 w-12 text-zinc-700" />
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest border border-white/10">
                    ₹{ground.price_per_hour}/hr
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-xl mb-2">{ground.name}</h3>
                <div className="flex items-center gap-2 text-zinc-500 text-sm mb-4">
                  <MapPin className="h-4 w-4" />
                  {ground.location}
                </div>
                <p className="text-xs text-zinc-500 mb-6 line-clamp-2">{ground.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {ground.amenities && ground.amenities.split(',').map(amenity => (
                    <span key={amenity} className="px-2 py-1 rounded-lg bg-zinc-900 border border-white/5 text-[10px] text-zinc-400 uppercase font-bold tracking-wider">
                      {amenity.trim()}
                    </span>
                  ))}
                </div>

                <button 
                  onClick={() => { setSelectedGround(ground); setShowBookingModal(true); }}
                  className="w-full py-3 rounded-2xl bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  Book Now <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {grounds.length === 0 && (
          <div className="py-24 text-center border border-dashed border-white/10 rounded-3xl text-zinc-500">
            <MapPin className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No grounds available for booking at the moment.</p>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && selectedGround && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between flex-shrink-0">
                <div>
                  <h2 className="text-xl font-bold">Book {selectedGround.name}</h2>
                  <p className="text-xs text-zinc-500 mt-1">{selectedGround.location}</p>
                </div>
                <button onClick={() => setShowBookingModal(false)} className="text-zinc-500 hover:text-white">
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleBooking} className="p-6 space-y-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Customer Details</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                          <input 
                            required
                            type="text"
                            className="w-full bg-black border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                          <input 
                            required
                            type="email"
                            className="w-full bg-black border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Mobile Number</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                          <input 
                            required
                            type="tel"
                            className="w-full bg-black border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                            placeholder="+91 98765 43210"
                            value={formData.mobile}
                            onChange={e => setFormData({...formData, mobile: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Booking Schedule</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Booking Date</label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                          <input 
                            required
                            type="date"
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full bg-black border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                            value={formData.date}
                            onChange={e => setFormData({...formData, date: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Start Time</label>
                          <div className="relative">
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                            <select 
                              required
                              className="w-full bg-black border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
                              value={formData.startTime}
                              onChange={e => setFormData({...formData, startTime: e.target.value})}
                            >
                              <option value="">Select</option>
                              {Array.from({length: 24}).map((_, i) => {
                                const hour = i % 12 || 12;
                                const ampm = i < 12 ? 'AM' : 'PM';
                                return (
                                  <option key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                                    {hour}:00 {ampm}
                                  </option>
                                );
                              })}
                            </select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">End Time</label>
                          <div className="relative">
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                            <select 
                              required
                              className="w-full bg-black border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
                              value={formData.endTime}
                              onChange={e => setFormData({...formData, endTime: e.target.value})}
                            >
                              <option value="">Select</option>
                              {Array.from({length: 24}).map((_, i) => {
                                const hour = i % 12 || 12;
                                const ampm = i < 12 ? 'AM' : 'PM';
                                return (
                                  <option key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                                    {hour}:00 {ampm}
                                  </option>
                                );
                              })}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Payment Method</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, paymentMethod: 'upi'})}
                      className={cn(
                        "flex items-center justify-center gap-2 p-4 rounded-xl border transition-all",
                        formData.paymentMethod === 'upi' 
                          ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" 
                          : "bg-black border-white/10 text-zinc-500 hover:border-white/20"
                      )}
                    >
                      <Smartphone className="h-4 w-4" />
                      <span className="text-sm font-bold">UPI</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, paymentMethod: 'card'})}
                      className={cn(
                        "flex items-center justify-center gap-2 p-4 rounded-xl border transition-all",
                        formData.paymentMethod === 'card' 
                          ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" 
                          : "bg-black border-white/10 text-zinc-500 hover:border-white/20"
                      )}
                    >
                      <CreditCard className="h-4 w-4" />
                      <span className="text-sm font-bold">Card</span>
                    </button>
                  </div>

                  {/* Receiver Info */}
                  <div className="p-4 rounded-2xl bg-black border border-white/5 space-y-2">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Send Payment To</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{paymentSettings.name}</span>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {formData.paymentMethod === 'upi' ? paymentSettings.upi : 'Bank Transfer'}
                      </span>
                    </div>
                    {formData.paymentMethod === 'card' && (
                      <p className="text-[10px] text-zinc-500 leading-relaxed pt-1 border-t border-white/5">
                        {paymentSettings.bank}
                      </p>
                    )}
                  </div>

                  <AnimatePresence mode="wait">
                    {formData.paymentMethod === 'upi' ? (
                      <motion.div
                        key="upi-fields"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2 overflow-hidden"
                      >
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">UPI ID (VPA)</label>
                        <div className="relative">
                          <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                          <input 
                            required
                            type="text"
                            className="w-full bg-black border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                            placeholder="username@upi"
                            value={formData.upiAddress}
                            onChange={e => setFormData({...formData, upiAddress: e.target.value})}
                          />
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="card-fields"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 overflow-hidden"
                      >
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Card Number</label>
                          <div className="relative">
                            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                            <input 
                              required
                              type="text"
                              className="w-full bg-black border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                              placeholder="0000 0000 0000 0000"
                              value={formData.cardNumber}
                              onChange={e => setFormData({...formData, cardNumber: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Expiry Date</label>
                            <input 
                              required
                              type="text"
                              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                              placeholder="MM/YY"
                              value={formData.cardExpiry}
                              onChange={e => setFormData({...formData, cardExpiry: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">CVV</label>
                            <input 
                              required
                              type="password"
                              maxLength={3}
                              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                              placeholder="***"
                              value={formData.cardCvv}
                              onChange={e => setFormData({...formData, cardCvv: e.target.value})}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="pt-4 flex-shrink-0">
                  <div className="flex items-center justify-between mb-4 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                    <div>
                      <span className="text-zinc-400 text-xs">Booking Total</span>
                      <p className="text-[10px] text-zinc-500">₹{selectedGround.price_per_hour}/hr</p>
                    </div>
                    <span className="text-2xl font-black text-emerald-500">₹{calculateTotalPrice()}</span>
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-emerald-500 text-black font-bold py-4 rounded-2xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Notification */}
      <AnimatePresence>
        {bookingSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] bg-emerald-500 text-black px-8 py-4 rounded-2xl font-bold shadow-2xl flex items-center gap-3"
          >
            <CheckCircle2 className="h-6 w-6" />
            Booking Request Sent!
          </motion.div>
        )}
      </AnimatePresence>
      <Footer />
    </div>
  );
};
