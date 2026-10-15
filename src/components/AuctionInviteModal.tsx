import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  Copy, 
  Check, 
  QrCode, 
  Share2, 
  MessageSquare, 
  Mail, 
  Users, 
  UserPlus, 
  Trash2, 
  ExternalLink,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { AuctionInvite } from '../types';
import { getSportConfig } from '../lib/sportConfigs';

interface AuctionInviteModalProps {
  tournamentId: number | string;
  tournamentName?: string;
  tournamentSport?: string;
  isOpen: boolean;
  onClose: () => void;
  onPlayerAddedToPool?: () => void;
}

export const AuctionInviteModal: React.FC<AuctionInviteModalProps> = ({
  tournamentId,
  tournamentName = 'Tournament',
  tournamentSport = 'cricket',
  isOpen,
  onClose,
  onPlayerAddedToPool,
}) => {
  const [activeTab, setActiveTab] = useState<'link' | 'direct' | 'list'>('link');
  const [invites, setInvites] = useState<AuctionInvite[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);

  // New Invite Form State
  const [formData, setFormData] = useState({
    player_name: '',
    phone: '',
    email: '',
    sport: tournamentSport || 'cricket',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [justCreatedInvite, setJustCreatedInvite] = useState<AuctionInvite | null>(null);

  // Host origin for invite links
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const generalInviteUrl = `${origin}/auction/join?tournament_id=${tournamentId}`;

  const fetchInvites = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/tournaments/${tournamentId}/auction/invites`);
      if (res.ok) {
        const data = await res.json();
        setInvites(data);
      }
    } catch (e) {
      console.error('Error fetching auction invites:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchInvites();
      setFormData(prev => ({ ...prev, sport: tournamentSport || 'cricket' }));
    }
  }, [isOpen, tournamentId, tournamentSport]);

  if (!isOpen) return null;

  const handleCopy = (text: string, isGeneral: boolean = true, code?: string) => {
    navigator.clipboard.writeText(text);
    if (isGeneral) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else if (code) {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.player_name && !formData.phone && !formData.email) return;

    try {
      setSubmitting(true);
      const res = await fetch(`/api/tournaments/${tournamentId}/auction/invites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        setJustCreatedInvite(data.invite);
        setFormData({
          player_name: '',
          phone: '',
          email: '',
          sport: tournamentSport || 'cricket',
          notes: '',
        });
        fetchInvites();
      }
    } catch (e) {
      console.error('Error creating invite:', e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteInvite = async (id: number) => {
    if (!window.confirm('Delete this auction invite?')) return;
    try {
      const res = await fetch(`/api/auction/invites/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setInvites(prev => prev.filter(inv => inv.id !== id));
      }
    } catch (e) {
      console.error('Error deleting invite:', e);
    }
  };

  // WhatsApp share message
  const shareText = encodeURIComponent(
    `🏏 You're invited to register for the official Player Auction for "${tournamentName}"!\n\nSubmit your athlete profile and enter the bidding pool here:\n${generalInviteUrl}`
  );
  const whatsappUrl = `https://wa.me/?text=${shareText}`;
  const mailtoUrl = `mailto:?subject=${encodeURIComponent(`Auction Player Invitation: ${tournamentName}`)}&body=${shareText}`;
  const smsUrl = `sms:?body=${shareText}`;

  // Simple clean SVG QR code placeholder / generator
  const qrSvgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(generalInviteUrl)}&bgcolor=18181b&color=10b981&margin=10`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl rounded-3xl bg-zinc-900 border border-white/10 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-white/10 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white tracking-tight">
                  Auction Player Invites
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/20">
                  Self-Registration Portal
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Invite athletes to submit their details and register into {tournamentName}'s auction pool
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/5 bg-zinc-900/40 px-6 gap-6">
          <button
            onClick={() => setActiveTab('link')}
            className={`py-3.5 text-xs font-bold transition-all relative border-b-2 flex items-center gap-2 ${
              activeTab === 'link'
                ? 'border-emerald-500 text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Share2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>Public Invite Link & QR</span>
          </button>

          <button
            onClick={() => setActiveTab('direct')}
            className={`py-3.5 text-xs font-bold transition-all relative border-b-2 flex items-center gap-2 ${
              activeTab === 'direct'
                ? 'border-emerald-500 text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <UserPlus className="h-3.5 w-3.5 text-emerald-400" />
            <span>Send Direct Invite</span>
          </button>

          <button
            onClick={() => setActiveTab('list')}
            className={`py-3.5 text-xs font-bold transition-all relative border-b-2 flex items-center gap-2 ${
              activeTab === 'list'
                ? 'border-emerald-500 text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Users className="h-3.5 w-3.5 text-emerald-400" />
            <span>Invited Athletes ({invites.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* TAB 1: Public Link & Social Invite */}
          {activeTab === 'link' && (
            <div className="space-y-6">
              {/* Shareable Link Box */}
              <div className="p-5 rounded-2xl bg-zinc-950 border border-white/10 space-y-3">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                  <span>General Auction Registration Link</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Instant Pool Access</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    type="text"
                    value={generalInviteUrl}
                    className="flex-1 bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-zinc-300 font-mono focus:outline-none"
                  />
                  <button
                    onClick={() => handleCopy(generalInviteUrl, true)}
                    className="h-11 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-2 transition-all shrink-0 shadow-lg shadow-emerald-500/20"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="h-4 w-4 stroke-[3]" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-zinc-500">
                  Any athlete with this link can open the registration portal, select their sport, enter profile & gear specs, and join the auction pool.
                </p>
              </div>

              {/* 1-Click Fast Sharing Channels */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  One-Click Invite Channels
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/20 hover:border-emerald-500/50 hover:bg-emerald-900/30 transition-all flex items-center gap-3 group text-left"
                  >
                    <div className="h-9 w-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">WhatsApp</p>
                      <p className="text-[10px] text-zinc-400">Send to player groups</p>
                    </div>
                  </a>

                  <a
                    href={mailtoUrl}
                    className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-500/20 hover:border-blue-500/50 hover:bg-blue-900/30 transition-all flex items-center gap-3 group text-left"
                  >
                    <div className="h-9 w-9 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Email</p>
                      <p className="text-[10px] text-zinc-400">Formal invitation</p>
                    </div>
                  </a>

                  <a
                    href={smsUrl}
                    className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/20 hover:border-purple-500/50 hover:bg-purple-900/30 transition-all flex items-center gap-3 group text-left"
                  >
                    <div className="h-9 w-9 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                      <Send className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">SMS Message</p>
                      <p className="text-[10px] text-zinc-400">Direct mobile text</p>
                    </div>
                  </a>
                </div>
              </div>

              {/* QR Code Scan for Trials & Academies */}
              <div className="p-5 rounded-2xl bg-zinc-950/80 border border-white/5 flex flex-col sm:flex-row items-center gap-6">
                <div className="h-32 w-32 rounded-2xl bg-zinc-900 border border-emerald-500/20 p-2 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                  <img
                    src={qrSvgUrl}
                    alt="Auction QR Code"
                    className="h-full w-full object-contain rounded-xl"
                  />
                </div>
                <div className="space-y-2 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <QrCode className="h-4 w-4 text-emerald-400" />
                    <h4 className="text-sm font-bold text-white">
                      Scan to Register at Ground / Academy
                    </h4>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Display or print this QR code at selection trials, academy noticeboards, or match venues so visiting players can register directly using their smartphone camera.
                  </p>
                  <a
                    href={generalInviteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:underline pt-1"
                  >
                    <span>Preview Athlete Portal</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Direct Named Invite Form */}
          {activeTab === 'direct' && (
            <div className="space-y-6">
              <form onSubmit={handleCreateInvite} className="space-y-4">
                <div className="p-5 rounded-2xl bg-zinc-950 border border-white/10 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                        Player / Athlete Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Rahul Sharma"
                        value={formData.player_name}
                        onChange={(e) => setFormData({ ...formData, player_name: e.target.value })}
                        className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                        Sport
                      </label>
                      <select
                        value={formData.sport}
                        onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                        className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="cricket">🏏 Cricket</option>
                        <option value="badminton">🏸 Badminton</option>
                        <option value="tennis">🎾 Tennis</option>
                        <option value="soccer">⚽ Football (Soccer)</option>
                        <option value="basketball">🏀 Basketball</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                        Mobile / Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        placeholder="athlete@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Organizer Notes / Target Base Price
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Recommended Base Price ₹2,00,000 / Opening Batsman / State Champ"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Generating Unique Invite...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Generate Personalized Invite Code</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Just Created Invite Card */}
              {justCreatedInvite && (
                <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-emerald-400" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Personalized Invite Created for {justCreatedInvite.player_name}!
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-black/40 text-[10px] font-mono text-emerald-400 font-bold">
                      {justCreatedInvite.invite_code}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      type="text"
                      value={`${origin}/auction/invite/${justCreatedInvite.invite_code}`}
                      className="flex-1 bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-zinc-300 font-mono"
                    />
                    <button
                      onClick={() =>
                        handleCopy(
                          `${origin}/auction/invite/${justCreatedInvite.invite_code}`,
                          false,
                          justCreatedInvite.invite_code
                        )
                      }
                      className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1.5"
                    >
                      {copiedCode === justCreatedInvite.invite_code ? (
                        <>
                          <Check className="h-3.5 w-3.5 stroke-[3]" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: List of Sent Invites */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-zinc-400">
                  Track sent invitations and their live registration status in the auction pool
                </p>
                <button
                  onClick={fetchInvites}
                  className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-all text-xs flex items-center gap-1"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Refresh</span>
                </button>
              </div>

              {loading ? (
                <div className="py-12 text-center text-zinc-500 text-xs">Loading invites...</div>
              ) : invites.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-white/10 rounded-2xl text-zinc-500 space-y-2">
                  <Users className="h-8 w-8 mx-auto text-zinc-600" />
                  <p className="text-xs">No direct athlete invites created yet.</p>
                  <button
                    onClick={() => setActiveTab('direct')}
                    className="text-xs text-emerald-400 font-bold hover:underline"
                  >
                    + Create First Direct Invite
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                  {invites.map((inv) => {
                    const personalUrl = `${origin}/auction/invite/${inv.invite_code}`;
                    const sportCfg = getSportConfig(inv.sport);

                    return (
                      <div
                        key={inv.id}
                        className="p-4 rounded-2xl bg-zinc-950/60 border border-white/5 hover:border-white/10 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-white">
                              {inv.player_name || 'Invited Athlete'}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300">
                              {inv.invite_code}
                            </span>
                            <span
                              className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                                inv.status === 'registered'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              }`}
                            >
                              {inv.status === 'registered' ? 'Registered in Pool' : 'Pending Invite'}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-zinc-400 flex-wrap">
                            <span className="flex items-center gap-1">
                              <span>{sportCfg.icon}</span>
                              <span className="capitalize">{inv.sport || 'Cricket'}</span>
                            </span>
                            {inv.phone && <span>📞 {inv.phone}</span>}
                            {inv.email && <span>✉️ {inv.email}</span>}
                          </div>

                          {inv.notes && (
                            <p className="text-[11px] text-zinc-500 italic">"{inv.notes}"</p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleCopy(personalUrl, false, inv.invite_code)}
                            title="Copy personalized invite link"
                            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all text-xs flex items-center gap-1.5"
                          >
                            {copiedCode === inv.invite_code ? (
                              <Check className="h-3.5 w-3.5 text-emerald-400 stroke-[3]" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                            <span className="text-[11px]">Copy Link</span>
                          </button>

                          <a
                            href={personalUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all"
                            title="Open registration page"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>

                          <button
                            onClick={() => handleDeleteInvite(inv.id)}
                            className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                            title="Delete invite"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-950 border-t border-white/5 flex items-center justify-between text-xs text-zinc-500">
          <span>Registered athletes automatically appear in the Live Auction Room.</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
