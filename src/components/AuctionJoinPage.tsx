import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  Gavel, 
  CheckCircle2, 
  User, 
  Phone, 
  DollarSign, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Users,
  Award,
  ChevronLeft
} from 'lucide-react';
import { getSportConfig } from '../lib/sportConfigs';
import { SportPlayerFields } from './SportPlayerFields';

export const AuctionJoinPage: React.FC = () => {
  const { code } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const tournamentIdParam = searchParams.get('tournament_id');

  const [loading, setLoading] = useState(true);
  const [tournament, setTournament] = useState<any>(null);
  const [inviteData, setInviteData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    age: 22,
    sport: 'cricket',
    role: 'all_rounder',
    base_price: 100000,
    phone: '',
    email: '',
    image_url: '',
    sport_details: {} as Record<string, any>,
  });

  const [submitting, setSubmitting] = useState(false);
  const [registeredPlayer, setRegisteredPlayer] = useState<{ id: number; name: string } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (code) {
          // Fetch invite by unique code
          const res = await fetch(`/api/auction/invite/${code}`);
          if (!res.ok) throw new Error('Invalid or expired invitation link');
          const data = await res.json();
          setInviteData(data);
          setTournament({
            id: data.tournament_id,
            name: data.tournament_name,
            sport: data.tournament_sport,
            format: data.tournament_format,
            base_budget: data.base_budget,
          });

          // Pre-fill form from invite
          setFormData((prev) => ({
            ...prev,
            name: data.player_name || prev.name,
            phone: data.phone || prev.phone,
            email: data.email || prev.email,
            sport: data.sport || data.tournament_sport || prev.sport,
          }));
        } else if (tournamentIdParam) {
          // Fetch tournament directly
          const res = await fetch(`/api/tournaments/${tournamentIdParam}`);
          if (!res.ok) throw new Error('Tournament not found');
          const data = await res.json();
          setTournament(data);
          setFormData((prev) => ({
            ...prev,
            sport: data.sport || 'cricket',
          }));
        } else {
          // Fallback: fetch latest active tournament
          const res = await fetch('/api/tournaments');
          if (res.ok) {
            const list = await res.json();
            if (list.length > 0) {
              const active = list.find((t: any) => t.is_auction_enabled) || list[0];
              setTournament(active);
              setFormData((prev) => ({
                ...prev,
                sport: active.sport || 'cricket',
              }));
            }
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load auction invitation details');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [code, tournamentIdParam]);

  // Update default role when sport changes
  const handleSportChange = (newSport: string) => {
    const cfg = getSportConfig(newSport);
    setFormData((prev) => ({
      ...prev,
      sport: newSport,
      role: cfg.roles[0]?.value || 'player',
      sport_details: {},
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tournament?.id) {
      alert('Tournament information is missing.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        invite_code: code || null,
        tournament_id: tournament.id,
        name: formData.name,
        age: formData.age,
        role: formData.role,
        sport: formData.sport,
        sport_details: formData.sport_details,
        phone: formData.phone,
        email: formData.email,
        base_price: formData.base_price,
        image_url: formData.image_url,
      };

      const res = await fetch('/api/auction/invite/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to register for auction');
      }

      const result = await res.json();
      setRegisteredPlayer({
        id: result.playerId,
        name: formData.name,
      });
    } catch (err: any) {
      alert(err.message || 'Error completing registration');
    } finally {
      setSubmitting(false);
    }
  };

  const sportConfig = getSportConfig(formData.sport);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          <p className="text-xs text-zinc-400 font-mono">Loading Auction Entry Portal...</p>
        </div>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-3xl bg-zinc-900 border border-white/10 text-center space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
            <Gavel className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Invitation Not Found</h2>
          <p className="text-xs text-zinc-400">{error || 'Unable to locate this auction portal.'}</p>
          <Link
            to="/tournaments"
            className="inline-block px-6 py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-xs"
          >
            Browse Tournaments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Navigation link */}
        <Link
          to={`/tournament/${tournament.id}`}
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Tournament Details</span>
        </Link>

        {/* Success Confirmation Card */}
        {registeredPlayer ? (
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-emerald-500/30 text-center space-y-6 animate-in zoom-in-95 duration-300 shadow-2xl">
            <div className="h-16 w-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="h-8 w-8 stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-black uppercase tracking-wider border border-emerald-500/20">
                Official Auction Entry Confirmed
              </span>
              <h1 className="text-3xl font-black tracking-tight text-white">
                Welcome to the Auction Pool, {registeredPlayer.name}!
              </h1>
              <p className="text-sm text-zinc-400 max-w-md mx-auto">
                Your athlete profile is officially active for <strong>{tournament.name}</strong>. Team managers and bidders will be able to review your specs and place bids during the live draft.
              </p>
            </div>

            {/* Official Athlete Draft Badge */}
            <div className="max-w-md mx-auto p-6 rounded-2xl bg-zinc-900/80 border border-white/10 text-left space-y-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest block">
                    Tournament
                  </span>
                  <span className="text-sm font-bold text-white">{tournament.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest block">
                    Sport
                  </span>
                  <span className="text-xs font-bold text-emerald-400 capitalize flex items-center gap-1 justify-end">
                    <span>{sportConfig.icon}</span>
                    <span>{formData.sport}</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest block">
                    Discipline / Role
                  </span>
                  <span className="text-xs font-bold text-white capitalize">
                    {formData.role.replace(/_/g, ' ')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest block">
                    Draft Base Price
                  </span>
                  <span className="text-xs font-black text-emerald-400">
                    ₹{formData.base_price.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to={`/tournament/${tournament.id}`}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20"
              >
                View Tournament Public Page
              </Link>
              <button
                onClick={() => setRegisteredPlayer(null)}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs transition-all"
              >
                Register Another Athlete
              </button>
            </div>
          </div>
        ) : (
          /* Registration Form */
          <div className="space-y-8">
            {/* Tournament Hero Header */}
            <div className="p-8 rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900/80 to-zinc-950 border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none select-none">
                <Gavel className="h-44 w-44 text-emerald-400" />
              </div>

              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/20">
                    Player Auction Entry Portal
                  </span>
                  {code && (
                    <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-[10px] font-mono">
                      Invite: {code}
                    </span>
                  )}
                </div>

                <div>
                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                    {tournament.name}
                  </h1>
                  <p className="text-xs text-zinc-400 mt-1 max-w-xl">
                    Register your athlete credentials, select your sport discipline, and enter the official player auction pool.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-zinc-300">
                  <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5">
                    <Trophy className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="capitalize">{tournament.sport || 'Multi-Sport'} Tournament</span>
                  </div>
                  {tournament.base_budget && (
                    <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5">
                      <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                      <span>₹{(tournament.base_budget / 10000000).toFixed(1)} Cr Team Purse</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Verified Draft</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Base Athlete Info */}
              <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/50 border border-white/5 space-y-6">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Step 1: Personal & Contact Information</span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Full Athlete Name
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Lakshya Sen / Rohit Patel"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-xl bg-zinc-900 border border-white/10 px-4 py-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Age
                    </label>
                    <input
                      required
                      type="number"
                      min={12}
                      max={65}
                      value={formData.age}
                      onChange={(e) =>
                        setFormData({ ...formData, age: parseInt(e.target.value) || 20 })
                      }
                      className="w-full rounded-xl bg-zinc-900 border border-white/10 px-4 py-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Mobile / WhatsApp Number
                    </label>
                    <input
                      required
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full rounded-xl bg-zinc-900 border border-white/10 px-4 py-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="athlete@gmail.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-xl bg-zinc-900 border border-white/10 px-4 py-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Profile Photo URL (JPG/PNG)
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-... (or leave blank for placeholder)"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full rounded-xl bg-zinc-900 border border-white/10 px-4 py-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Step 2: Sport & Sport-Specific Athlete Details */}
              <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/50 border border-white/5 space-y-6">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    <span>Step 2: Sport Category & Performance Specs</span>
                  </h2>
                </div>

                {/* Sport Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Sport Discipline
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { id: 'cricket', name: 'Cricket', icon: '🏏' },
                      { id: 'badminton', name: 'Badminton', icon: '🏸' },
                      { id: 'tennis', name: 'Tennis', icon: '🎾' },
                      { id: 'soccer', name: 'Football', icon: '⚽' },
                      { id: 'basketball', name: 'Basketball', icon: '🏀' },
                    ].map((sp) => (
                      <button
                        key={sp.id}
                        type="button"
                        onClick={() => handleSportChange(sp.id)}
                        className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                          formData.sport === sp.id
                            ? 'bg-emerald-500/15 border-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/10'
                            : 'bg-zinc-950/60 border-white/5 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                        }`}
                      >
                        <span className="text-xl">{sp.icon}</span>
                        <span className="text-xs">{sp.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sport-Specific Dynamic Attributes & Roles */}
                <SportPlayerFields
                  sport={formData.sport}
                  role={formData.role}
                  onRoleChange={(newRole) => setFormData({ ...formData, role: newRole })}
                  sportDetails={formData.sport_details}
                  onDetailsChange={(newDetails) =>
                    setFormData({ ...formData, sport_details: newDetails })
                  }
                />
              </div>

              {/* Step 3: Auction Reserve Base Price */}
              <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/50 border border-white/5 space-y-6">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span>Step 3: Auction Reserve Base Price</span>
                  </h2>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Base Starting Bid (₹)
                    </label>
                    <span className="text-base font-black text-emerald-400 font-mono">
                      ₹{formData.base_price.toLocaleString()}
                    </span>
                  </div>

                  <input
                    type="range"
                    min={10000}
                    max={5000000}
                    step={10000}
                    value={formData.base_price}
                    onChange={(e) =>
                      setFormData({ ...formData, base_price: parseInt(e.target.value) || 100000 })
                    }
                    className="w-full accent-emerald-500 cursor-pointer h-2 bg-zinc-800 rounded-lg appearance-none"
                  />

                  <div className="flex flex-wrap gap-2 pt-1">
                    {[50000, 100000, 200000, 500000, 1000000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setFormData({ ...formData, base_price: preset })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          formData.base_price === preset
                            ? 'bg-emerald-500 text-black'
                            : 'bg-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        ₹{(preset / 100000).toFixed(preset >= 100000 ? 1 : 2)}L
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-wider text-sm transition-all shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span>Submitting to Auction Room...</span>
                ) : (
                  <>
                    <Gavel className="h-4 w-4" />
                    <span>Register for Player Auction</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
