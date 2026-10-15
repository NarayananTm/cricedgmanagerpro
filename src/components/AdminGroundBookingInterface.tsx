import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Edit2, MapPin, Image as ImageIcon, Tag, DollarSign, List, Calendar, CheckCircle2, Clock, Upload, Smartphone, CreditCard, X, Search, ArrowLeft, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Ground, GroundBooking } from '../types';
import { cn } from '../lib/utils';

export const AdminGroundBookingInterface = () => {
  const [grounds, setGrounds] = useState<Ground[]>([]);
  const [bookings, setBookings] = useState<GroundBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGround, setEditingGround] = useState<Ground | null>(null);
  const [activeTab, setActiveTab] = useState<'grounds' | 'bookings'>('grounds');

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    price_per_hour: '',
    image_url: '',
    amenities: ''
  });

  const fetchData = async () => {
    setLoading(true);
    const [gRes, bRes] = await Promise.all([
      fetch('/api/grounds'),
      fetch('/api/bookings')
    ]);
    const gData = await gRes.json();
    const bData = await bRes.json();
    setGrounds(gData);
    setBookings(bData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image_url: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingGround ? `/api/grounds/${editingGround.id}` : '/api/grounds';
    const method = editingGround ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price_per_hour: parseFloat(formData.price_per_hour)
        })
      });

      if (res.ok) {
        setShowAddModal(false);
        setEditingGround(null);
        setFormData({
          name: '',
          location: '',
          description: '',
          price_per_hour: '',
          image_url: '',
          amenities: ''
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error saving ground:', error);
    }
  };

  const deleteGround = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this ground?')) return;
    try {
      const res = await fetch(`/api/grounds/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (error) {
      console.error('Error deleting ground:', error);
    }
  };

  const updateBookingStatus = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchData();
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  if (loading) return <div className="p-12 text-center text-zinc-500">Loading booking data...</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <Link 
          to="/admin" 
          className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Ground Management</h1>
            <p className="text-zinc-400 mt-1">Manage venues and customer bookings</p>
          </div>
          <div className="flex bg-zinc-900 rounded-xl p-1 border border-white/10">
            <button 
              onClick={() => setActiveTab('grounds')}
              className={cn(
                "px-6 py-2 rounded-lg text-sm font-bold transition-all",
                activeTab === 'grounds' ? "bg-emerald-500 text-black" : "text-zinc-500 hover:text-white"
              )}
            >
              Grounds
            </button>
            <button 
              onClick={() => setActiveTab('bookings')}
              className={cn(
                "px-6 py-2 rounded-lg text-sm font-bold transition-all",
                activeTab === 'bookings' ? "bg-emerald-500 text-black" : "text-zinc-500 hover:text-white"
              )}
            >
              Bookings
            </button>
          </div>
        </div>

        {activeTab === 'grounds' ? (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 bg-emerald-500 text-black px-6 py-3 rounded-xl font-bold hover:bg-emerald-400 transition-all"
              >
                <Plus className="h-4 w-4" /> Add New Ground
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {grounds.map(ground => (
                <div key={ground.id} className="bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden group">
                  <div className="aspect-video bg-zinc-800 relative">
                    {ground.image_url ? (
                      <img src={ground.image_url} alt={ground.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-700">
                        <ImageIcon className="h-12 w-12" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button 
                        onClick={() => {
                          setEditingGround(ground);
                          setFormData({
                            name: ground.name,
                            location: ground.location,
                            description: ground.description,
                            price_per_hour: ground.price_per_hour.toString(),
                            image_url: ground.image_url,
                            amenities: ground.amenities
                          });
                          setShowAddModal(true);
                        }}
                        className="p-2 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-white hover:text-black transition-all"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => deleteGround(ground.id)}
                        className="p-2 rounded-lg bg-red-500/20 backdrop-blur-md border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-lg mb-1">{ground.name}</h3>
                    <p className="text-zinc-500 text-sm mb-4 flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {ground.location}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-500 font-black">₹{ground.price_per_hour}/hr</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-zinc-900/30 border border-white/5 rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-zinc-900/50">
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Booking ID</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Ground</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Customer</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Schedule</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Total</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {bookings.map(booking => (
                    <tr key={booking.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <Link to={`/admin/booking/${booking.id}`} className="font-mono text-xs text-emerald-500 hover:underline">
                          #{booking.id.toString().padStart(5, '0')}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-zinc-800 overflow-hidden">
                            {booking.ground_image && <img src={booking.ground_image} alt="" className="h-full w-full object-cover" />}
                          </div>
                          <span className="font-bold text-sm">{booking.ground_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="font-bold">{booking.customer_name}</p>
                          <p className="text-zinc-500 text-xs">{booking.customer_mobile}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="font-bold">{booking.booking_date}</p>
                          <p className="text-zinc-500 text-xs">{formatTime(booking.start_time)} - {formatTime(booking.end_time)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-500">₹{booking.total_price}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                          booking.status === 'pending' ? "bg-yellow-500/10 text-yellow-500" :
                          booking.status === 'confirmed' ? "bg-emerald-500/10 text-emerald-500" :
                          "bg-red-500/10 text-red-500"
                        )}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <select 
                            value={booking.status}
                            onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                            className="bg-black border border-white/10 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirm</option>
                            <option value="cancelled">Cancel</option>
                          </select>
                          <Link 
                            to={`/admin/booking/${booking.id}`}
                            className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-all"
                          >
                            <Info className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {bookings.length === 0 && (
              <div className="py-12 text-center text-zinc-500">No bookings found.</div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Ground Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-xl font-bold">{editingGround ? 'Edit Ground' : 'Add New Ground'}</h2>
                <button onClick={() => { setShowAddModal(false); setEditingGround(null); }} className="text-zinc-500 hover:text-white">
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Ground Name</label>
                    <input 
                      required
                      type="text"
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      placeholder="Lords Cricket Ground"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Location</label>
                    <input 
                      required
                      type="text"
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      placeholder="London, UK"
                      value={formData.location}
                      onChange={e => setFormData({...formData, location: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Description</label>
                  <textarea 
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 min-h-[100px]"
                    placeholder="Describe the ground facilities..."
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Price per Hour (₹)</label>
                    <input 
                      required
                      type="number"
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      placeholder="1500"
                      value={formData.price_per_hour}
                      onChange={e => setFormData({...formData, price_per_hour: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Amenities (Comma separated)</label>
                    <input 
                      type="text"
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      placeholder="Floodlights, Parking, Changing Rooms"
                      value={formData.amenities}
                      onChange={e => setFormData({...formData, amenities: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Ground Image</label>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <input 
                        type="text"
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        placeholder="Image URL"
                        value={formData.image_url}
                        onChange={e => setFormData({...formData, image_url: e.target.value})}
                      />
                    </div>
                    <label className="cursor-pointer bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-2 hover:bg-zinc-700 transition-all">
                      <Upload className="h-4 w-4" />
                      <span className="text-xs font-bold">Upload</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-emerald-500 text-black font-bold py-4 rounded-2xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
                >
                  {editingGround ? 'Update Ground' : 'Add Ground'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
