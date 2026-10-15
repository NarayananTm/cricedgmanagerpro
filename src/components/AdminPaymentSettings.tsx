import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Save, Smartphone, Landmark, User, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AdminPaymentSettings = () => {
  const [settings, setSettings] = useState({
    upi: '',
    bank: '',
    name: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/settings/payment')
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/settings/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-zinc-500">Loading settings...</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link 
          to="/admin" 
          className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>

        <div className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight">Payment Receiver Settings</h1>
          <p className="text-zinc-400 mt-1">Configure the account details where customers should send payments</p>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          <div className="p-8 rounded-3xl bg-zinc-900/50 border border-white/5 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <User className="h-3 w-3" /> Receiver Name
              </label>
              <input 
                required
                type="text"
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="e.g. CricEdgPro Admin"
                value={settings.name}
                onChange={e => setSettings({...settings, name: e.target.value})}
              />
              <p className="text-[10px] text-zinc-500">The name displayed to customers during checkout.</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <Smartphone className="h-3 w-3" /> UPI ID (VPA)
              </label>
              <input 
                required
                type="text"
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="e.g. admin@upi"
                value={settings.upi}
                onChange={e => setSettings({...settings, upi: e.target.value})}
              />
              <p className="text-[10px] text-zinc-500">Your UPI ID for direct mobile payments.</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <Landmark className="h-3 w-3" /> Bank Account Details
              </label>
              <textarea 
                required
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 min-h-[100px]"
                placeholder="e.g. Bank: HDFC, A/C: 1234567890, IFSC: HDFC0001234"
                value={settings.bank}
                onChange={e => setSettings({...settings, bank: e.target.value})}
              />
              <p className="text-[10px] text-zinc-500">Full bank details for IMPS/NEFT transfers.</p>
            </div>
          </div>

          <button 
            type="submit"
            disabled={saving}
            className="w-full bg-emerald-500 text-black font-bold py-4 rounded-2xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? 'Saving...' : (
              <>
                <Save className="h-5 w-5" /> Save Payment Settings
              </>
            )}
          </button>
        </form>
      </div>

      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] bg-emerald-500 text-black px-8 py-4 rounded-2xl font-bold shadow-2xl flex items-center gap-3"
          >
            <CheckCircle2 className="h-6 w-6" />
            Settings Saved Successfully!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
