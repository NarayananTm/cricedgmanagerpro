import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from '../App';
import { Footer } from './Footer';
import { 
  Mail, 
  MapPin, 
  Phone, 
  Send, 
  CheckCircle, 
  MessageSquare, 
  ShieldAlert, 
  Sparkles,
  Trophy,
  ArrowRight
} from 'lucide-react';

export const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Tournament Support',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setLoading(true);
    // Simulate real submission
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        subject: 'General Tournament Support',
        message: '',
      });
      setTimeout(() => setSubmitted(false), 5000);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      {/* Hero Header */}
      <section className="relative pt-32 pb-20 overflow-hidden border-b border-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
          <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-emerald-500/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-10 left-1/4 w-[400px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full" />
        </div>

        <div className="mx-auto max-w-4xl px-6 text-center relative z-10 space-y-6">
          <p className="text-emerald-500 text-xs font-black uppercase tracking-[0.4em]">Get in Touch</p>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.9]">
            Connect with <span className="text-zinc-800">GameZM</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Whether you have questions about custom rulesheets, stadium licensing, premium features, or need active game-day support, our squad is ready to assist.
          </p>
        </div>
      </section>

      {/* Primary Layout Sections */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Info Side */}
          <div className="space-y-12">
            <div>
              <h2 className="text-3xl font-black tracking-tighter uppercase mb-4">Contact Channels</h2>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Connect directly with our Bengaluru stadium operational desk, platform technicians, or league sales directors. We typically respond within two business hours.
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  icon: MapPin,
                  label: "Platform HQ",
                  value: "123 Cricket Stadium Road, Sports City, Bengaluru, Karnataka, IN (560002)",
                  color: "emerald"
                },
                {
                  icon: Mail,
                  label: "Corporate Relations",
                  value: "support@gamezm.com",
                  color: "blue"
                },
                {
                  icon: Phone,
                  label: "Inbound Support Desk",
                  value: "+91 (800) CRIC-PRO",
                  color: "purple"
                }
              ].map((item, index) => {
                const IconComp = item.icon;
                return (
                  <div key={index} className="flex gap-4 p-6 rounded-2xl bg-zinc-950 border border-white/[0.04]">
                    <div className={`h-12 w-12 rounded-xl shrink-0 flex items-center justify-center ${
                      item.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' :
                      item.color === 'blue' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'
                    }`}>
                      <IconComp className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-black block mb-1">{item.label}</span>
                      <p className="text-sm text-zinc-300 font-medium leading-relaxed">{item.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Support guarantee info */}
            <div className="p-6 rounded-2xl bg-zinc-900 border border-white/5 flex gap-4 max-w-md">
              <ShieldAlert className="h-5 w-5 text-emerald-500 shrink-0" />
              <div className="text-xs space-y-1">
                <p className="font-bold text-white">Scorer Integrity Commitment</p>
                <p className="text-zinc-500 leading-relaxed">
                  Platform bugs occurring during actively monitored games will bypass standard support lists for immediate live-agent technical routing.
                </p>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="p-8 md:p-12 rounded-[32px] bg-zinc-950 border border-white/10 relative overflow-hidden">
            <h3 className="text-xl font-black uppercase mb-2">Submit inquiry request</h3>
            <p className="text-xs text-zinc-500 mb-8">Enter your profile information and your specific support requirement details.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Your Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full text-xs p-3.5 rounded-xl bg-black border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500/40"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="r.sharma@example.com"
                    className="w-full text-xs p-3.5 rounded-xl bg-black border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500/40"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Inquiry Subject</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full text-xs p-3.5 rounded-xl bg-black border border-white/10 text-zinc-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500/40"
                >
                  <option value="General Tournament Support">General Tournament Support</option>
                  <option value="Custom Rules & Scorecards">Custom Rules & Scorecards</option>
                  <option value="Ground Booking Partner Slots">Ground Booking Partner Slots</option>
                  <option value="Auction Wallet Points Adjustments">Auction Wallet Points Adjustments</option>
                  <option value="Enterprise Custom White-Labeling">Enterprise Custom White-Labeling</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Detailed Message</label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Provide match references, team roster lists, or custom billing details..."
                  className="w-full text-xs p-3.5 rounded-xl bg-black border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500/40"
                />
              </div>

              {/* Status / Submit controls */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-emerald-500 text-black text-xs font-black uppercase tracking-widest hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    'Sending Message...'
                  ) : (
                    <>
                      Send Message <Send className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>

              <AnimatePresence>
                {submitted && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    <span>Inquiry submitted! Our support representatives will reach out shortly.</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
