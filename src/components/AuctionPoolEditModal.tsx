import React, { useState, useEffect } from 'react';
import { 
  X, 
  Gavel, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Search, 
  Filter, 
  ArrowUpDown, 
  ChevronUp, 
  ChevronDown, 
  DollarSign, 
  Users, 
  Share2, 
  Sparkles, 
  ExternalLink,
  Save,
  AlertCircle
} from 'lucide-react';
import { Player, Tournament } from '../types';
import { getSportConfig, parseSportDetails } from '../lib/sportConfigs';
import { SportPlayerFields } from './SportPlayerFields';

interface AuctionPoolEditModalProps {
  tournamentId: number | string;
  isOpen: boolean;
  onClose: () => void;
  tournament?: Tournament | null;
  onPoolUpdated?: () => void;
  onOpenInviteModal?: () => void;
}

export const AuctionPoolEditModal: React.FC<AuctionPoolEditModalProps> = ({
  tournamentId,
  isOpen,
  onClose,
  tournament,
  onPoolUpdated,
  onOpenInviteModal,
}) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sportFilter, setSportFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'id' | 'name' | 'base_price' | 'role'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Inline editing state: { [playerId]: Partial<Player> }
  const [editingPlayerId, setEditingPlayerId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [savingId, setSavingId] = useState<number | null>(null);

  // Manual Add Player to Pool state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    age: 22,
    role: 'all_rounder',
    base_price: 100000,
    phone: '',
    sport: tournament?.sport || 'cricket',
    sport_details: {} as Record<string, any>,
    image_url: ''
  });
  const [addingPlayer, setAddingPlayer] = useState(false);

  // Bulk Base Price update state
  const [showBulkPriceModal, setShowBulkPriceModal] = useState(false);
  const [bulkPriceValue, setBulkPriceValue] = useState<number>(100000);
  const [applyingBulk, setApplyingBulk] = useState(false);

  const fetchPool = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/tournaments/${tournamentId}/auction/pool`);
      if (res.ok) {
        const data = await res.json();
        setPlayers(data);
      }
    } catch (e) {
      console.error('Failed to load auction pool:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPool();
      if (tournament?.sport) {
        const cfg = getSportConfig(tournament.sport);
        setNewPlayer(prev => ({
          ...prev,
          sport: tournament.sport,
          role: cfg.roles[0]?.value || 'player'
        }));
      }
    }
  }, [isOpen, tournamentId, tournament]);

  if (!isOpen) return null;

  const handleStartEdit = (player: Player) => {
    setEditingPlayerId(player.id);
    setEditForm({
      name: player.name,
      age: player.age,
      role: player.role,
      base_price: player.base_price,
      phone: player.phone || '',
      sport: player.sport || tournament?.sport || 'cricket',
      sport_details: parseSportDetails(player.sport_details),
      image_url: player.image_url || ''
    });
  };

  const handleSaveEdit = async (playerId: number) => {
    try {
      setSavingId(playerId);
      const res = await fetch(`/api/players/${playerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editForm,
          is_sold: 0,
          team_id: null,
          sold_price: 0
        })
      });

      if (!res.ok) throw new Error('Failed to update player');

      setEditingPlayerId(null);
      setEditForm(null);
      await fetchPool();
      if (onPoolUpdated) onPoolUpdated();
    } catch (e: any) {
      alert(e.message || 'Failed to save changes');
    } finally {
      setSavingId(null);
    }
  };

  const handleDeletePlayer = async (playerId: number, playerName: string) => {
    if (!window.confirm(`Are you sure you want to remove ${playerName} from the auction pool?`)) return;

    try {
      const res = await fetch(`/api/players/${playerId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete player');
      setPlayers(prev => prev.filter(p => p.id !== playerId));
      if (onPoolUpdated) onPoolUpdated();
    } catch (e: any) {
      alert(e.message || 'Failed to remove player');
    }
  };

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayer.name.trim()) return;

    try {
      setAddingPlayer(true);
      const res = await fetch(`/api/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newPlayer,
          tournament_id: tournamentId,
          team_id: null,
          is_sold: 0,
          sold_price: 0
        })
      });

      if (!res.ok) throw new Error('Failed to add player');

      const defaultCfg = getSportConfig(tournament?.sport || 'cricket');
      setNewPlayer({
        name: '',
        age: 22,
        role: defaultCfg.roles[0]?.value || 'all_rounder',
        base_price: 100000,
        phone: '',
        sport: tournament?.sport || 'cricket',
        sport_details: {},
        image_url: ''
      });
      setShowAddForm(false);
      await fetchPool();
      if (onPoolUpdated) onPoolUpdated();
    } catch (e: any) {
      alert(e.message || 'Failed to add player');
    } finally {
      setAddingPlayer(false);
    }
  };

  const handleApplyBulkPrice = async () => {
    if (!bulkPriceValue || bulkPriceValue < 0) return;
    if (!window.confirm(`Set base price to ₹${bulkPriceValue.toLocaleString()} for all ${players.length} players in the pool?`)) return;

    try {
      setApplyingBulk(true);
      await Promise.all(
        players.map(p =>
          fetch(`/api/players/${p.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: p.name,
              age: p.age,
              role: p.role,
              base_price: bulkPriceValue,
              phone: p.phone,
              sport: p.sport,
              sport_details: p.sport_details,
              is_sold: 0,
              team_id: null,
              sold_price: 0
            })
          })
        )
      );

      setShowBulkPriceModal(false);
      await fetchPool();
      if (onPoolUpdated) onPoolUpdated();
    } catch (e: any) {
      alert('Error applying bulk base price: ' + e.message);
    } finally {
      setApplyingBulk(false);
    }
  };

  // Filter and sort players
  const filteredPlayers = players.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.phone && p.phone.includes(searchQuery));
    const matchesSport = sportFilter === 'all' || p.sport === sportFilter;
    return matchesSearch && matchesSport;
  }).sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortBy === 'base_price') {
      comparison = a.base_price - b.base_price;
    } else if (sortBy === 'role') {
      comparison = a.role.localeCompare(b.role);
    } else {
      comparison = a.id - b.id;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const totalPoolValuation = players.reduce((sum, p) => sum + (p.base_price || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-5xl rounded-3xl bg-zinc-900 border border-white/10 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-white/10 flex items-center justify-between bg-zinc-950/70">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Gavel className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-tight">Auction Pool Edit</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/20">
                  {players.length} Draft Lots
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Manage players in the auction pool, modify reserve base prices, sports roles, or add invited athletes
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

        {/* Action Toolbar */}
        <div className="p-4 bg-zinc-950/40 border-b border-white/5 flex flex-wrap items-center justify-between gap-3">
          {/* Search & Filter */}
          <div className="flex items-center gap-2 flex-1 min-w-[280px]">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search athlete by name, role, or phone..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <select
              value={sportFilter}
              onChange={e => setSportFilter(e.target.value)}
              className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none"
            >
              <option value="all">All Sports</option>
              <option value="cricket">🏏 Cricket</option>
              <option value="badminton">🏸 Badminton</option>
              <option value="tennis">🎾 Tennis</option>
              <option value="soccer">⚽ Football</option>
              <option value="basketball">🏀 Basketball</option>
            </select>

            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={e => {
                const [sb, so] = e.target.value.split('-');
                setSortBy(sb as any);
                setSortOrder(so as any);
              }}
              className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none"
            >
              <option value="id-asc">Lot # (Asc)</option>
              <option value="id-desc">Lot # (Desc)</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="base_price-desc">Base Price (High → Low)</option>
              <option value="base_price-asc">Base Price (Low → High)</option>
            </select>
          </div>

          {/* Quick Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBulkPriceModal(true)}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
              <span>Bulk Set Base Price</span>
            </button>

            {onOpenInviteModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenInviteModal();
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>Invite Players</span>
              </button>
            )}

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
            >
              <Plus className="h-4 w-4" />
              <span>Add Player to Pool</span>
            </button>
          </div>
        </div>

        {/* Pool Summary Stats */}
        <div className="px-6 py-2.5 bg-black/40 border-b border-white/5 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-4">
            <span>Pool Size: <strong className="text-white">{players.length} athletes</strong></span>
            <span>Filtered: <strong className="text-emerald-400">{filteredPlayers.length}</strong></span>
            <span>Total Starting Purse: <strong className="text-emerald-400 font-mono">₹{totalPoolValuation.toLocaleString()}</strong></span>
          </div>
          <span className="text-[11px] text-zinc-500 italic">
            Changes apply instantly to the Live Auction drafting order
          </span>
        </div>

        {/* Add Player Form Drawer */}
        {showAddForm && (
          <div className="p-6 bg-zinc-950 border-b border-emerald-500/20 animate-in slide-in-from-top-4 duration-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <span>Add Athlete to Auction Pool</span>
              </h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-xs text-zinc-500 hover:text-white"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleAddPlayer} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 uppercase font-bold">Athlete Name</label>
                  <input
                    required
                    placeholder="Full Name"
                    value={newPlayer.name}
                    onChange={e => setNewPlayer({ ...newPlayer, name: e.target.value })}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 uppercase font-bold">Age</label>
                  <input
                    required
                    type="number"
                    min={12}
                    max={65}
                    value={newPlayer.age}
                    onChange={e => setNewPlayer({ ...newPlayer, age: parseInt(e.target.value) || 20 })}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 uppercase font-bold">Sport</label>
                  <select
                    value={newPlayer.sport}
                    onChange={e => {
                      const sp = e.target.value;
                      const cfg = getSportConfig(sp);
                      setNewPlayer({
                        ...newPlayer,
                        sport: sp,
                        role: cfg.roles[0]?.value || 'player',
                        sport_details: {}
                      });
                    }}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none"
                  >
                    <option value="cricket">Cricket 🏏</option>
                    <option value="badminton">Badminton 🏸</option>
                    <option value="tennis">Tennis 🎾</option>
                    <option value="soccer">Football ⚽</option>
                    <option value="basketball">Basketball 🏀</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 uppercase font-bold">Base Price (₹)</label>
                  <input
                    required
                    type="number"
                    min={0}
                    step={10000}
                    value={newPlayer.base_price}
                    onChange={e => setNewPlayer({ ...newPlayer, base_price: parseInt(e.target.value) || 0 })}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 uppercase font-bold">Mobile / WhatsApp</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={newPlayer.phone}
                    onChange={e => setNewPlayer({ ...newPlayer, phone: e.target.value })}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 uppercase font-bold">Photo URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newPlayer.image_url}
                    onChange={e => setNewPlayer({ ...newPlayer, image_url: e.target.value })}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              {/* Adaptive sport fields */}
              <SportPlayerFields
                compact
                sport={newPlayer.sport}
                role={newPlayer.role}
                onRoleChange={r => setNewPlayer({ ...newPlayer, role: r })}
                sportDetails={newPlayer.sport_details}
                onDetailsChange={d => setNewPlayer({ ...newPlayer, sport_details: d })}
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingPlayer}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
                >
                  {addingPlayer ? 'Adding...' : 'Add to Pool'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Bulk Base Price Modal */}
        {showBulkPriceModal && (
          <div className="p-6 bg-zinc-950 border-b border-white/10 animate-in slide-in-from-top-4 duration-200">
            <div className="max-w-xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-emerald-400" />
                  <span>Bulk Update Reserve Base Price for Pool</span>
                </h4>
                <button
                  onClick={() => setShowBulkPriceModal(false)}
                  className="text-xs text-zinc-500 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <p className="text-xs text-zinc-400">
                This will reset the starting reserve price for all {players.length} unassigned auction pool players at once.
              </p>

              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={10000}
                  step={10000}
                  value={bulkPriceValue}
                  onChange={e => setBulkPriceValue(parseInt(e.target.value) || 0)}
                  className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-emerald-400 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />

                <div className="flex gap-2">
                  {[50000, 100000, 200000, 500000].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setBulkPriceValue(val)}
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-800 text-[11px] font-bold text-zinc-300 hover:text-white"
                    >
                      ₹{(val / 100000).toFixed(val >= 100000 ? 1 : 2)}L
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleApplyBulkPrice}
                  disabled={applyingBulk}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold"
                >
                  {applyingBulk ? 'Applying...' : 'Apply All'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Players List Table */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {loading ? (
            <div className="py-16 text-center text-zinc-500 text-xs">Loading auction pool...</div>
          ) : filteredPlayers.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-white/10 rounded-2xl text-zinc-500 space-y-3">
              <Users className="h-10 w-10 mx-auto text-zinc-600" />
              <p className="text-sm font-medium">No players found in auction pool matching your query.</p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-black text-xs font-bold"
                >
                  + Add First Athlete
                </button>
                {onOpenInviteModal && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenInviteModal();
                    }}
                    className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold"
                  >
                    Invite via Link
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredPlayers.map((player, idx) => {
                const isEditing = editingPlayerId === player.id;
                const sportCfg = getSportConfig(player.sport);

                return (
                  <div
                    key={player.id}
                    className={`rounded-2xl border transition-all ${
                      isEditing
                        ? 'bg-zinc-950 border-emerald-500/40 p-4 shadow-xl'
                        : 'bg-zinc-950/60 border-white/5 hover:border-white/10 p-3.5 flex items-center justify-between gap-4'
                    }`}
                  >
                    {isEditing ? (
                      /* Inline Edit Form */
                      <div className="space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-white/5">
                          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                            Editing Lot #{player.id}: {player.name}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">ID: {player.id}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] text-zinc-400 uppercase font-bold">Athlete Name</label>
                            <input
                              required
                              value={editForm.name}
                              onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-zinc-400 uppercase font-bold">Age</label>
                            <input
                              type="number"
                              value={editForm.age}
                              onChange={e => setEditForm({ ...editForm, age: parseInt(e.target.value) || 20 })}
                              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-zinc-400 uppercase font-bold">Sport</label>
                            <select
                              value={editForm.sport}
                              onChange={e => {
                                const sp = e.target.value;
                                const cfg = getSportConfig(sp);
                                setEditForm({
                                  ...editForm,
                                  sport: sp,
                                  role: cfg.roles[0]?.value || 'player',
                                  sport_details: {}
                                });
                              }}
                              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-300"
                            >
                              <option value="cricket">Cricket 🏏</option>
                              <option value="badminton">Badminton 🏸</option>
                              <option value="tennis">Tennis 🎾</option>
                              <option value="soccer">Football ⚽</option>
                              <option value="basketball">Basketball 🏀</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-zinc-400 uppercase font-bold">Base Price (₹)</label>
                            <input
                              type="number"
                              step={10000}
                              value={editForm.base_price}
                              onChange={e => setEditForm({ ...editForm, base_price: parseInt(e.target.value) || 0 })}
                              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono font-bold"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] text-zinc-400 uppercase font-bold">Mobile Phone</label>
                            <input
                              type="tel"
                              value={editForm.phone}
                              onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-zinc-400 uppercase font-bold">Image URL</label>
                            <input
                              type="url"
                              value={editForm.image_url}
                              onChange={e => setEditForm({ ...editForm, image_url: e.target.value })}
                              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                            />
                          </div>
                        </div>

                        {/* Adaptive Sport Attributes */}
                        <SportPlayerFields
                          compact
                          sport={editForm.sport}
                          role={editForm.role}
                          onRoleChange={r => setEditForm({ ...editForm, role: r })}
                          sportDetails={editForm.sport_details}
                          onDetailsChange={d => setEditForm({ ...editForm, sport_details: d })}
                        />

                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPlayerId(null);
                              setEditForm(null);
                            }}
                            className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(player.id)}
                            disabled={savingId === player.id}
                            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-1.5"
                          >
                            <Save className="h-3.5 w-3.5" />
                            <span>{savingId === player.id ? 'Saving...' : 'Save Changes'}</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Normal Row Display */
                      <>
                        <div className="flex items-center gap-3.5 min-w-0">
                          {/* Lot Number badge */}
                          <span className="h-7 w-7 rounded-lg bg-zinc-800 text-[10px] font-mono text-zinc-400 flex items-center justify-center shrink-0">
                            #{idx + 1}
                          </span>

                          {/* Avatar */}
                          <div className="h-10 w-10 rounded-xl bg-zinc-800 flex items-center justify-center overflow-hidden border border-white/10 shrink-0">
                            {player.image_url ? (
                              <img src={player.image_url} alt={player.name} className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-xs font-bold text-zinc-400">{player.name[0]}</span>
                            )}
                          </div>

                          {/* Info */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm text-white truncate">{player.name}</span>
                              <span className="text-[10px] text-zinc-400">Age: {player.age}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${sportCfg.badgeClass} flex items-center gap-1`}>
                                <span>{sportCfg.icon}</span>
                                <span>{player.sport || 'cricket'}</span>
                              </span>
                            </div>

                            <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-400 flex-wrap">
                              <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider bg-white/5 px-1.5 py-0.5 rounded">
                                {player.role.replace(/_/g, ' ')}
                              </span>
                              {player.phone && (
                                <span className="text-[10px] font-mono text-zinc-400">
                                  📞 {player.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right: Base Price & Action Buttons */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <span className="text-[9px] text-zinc-500 uppercase tracking-widest block font-bold">Base Price</span>
                            <span className="text-sm font-black text-emerald-400 font-mono">
                              ₹{player.base_price.toLocaleString()}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleStartEdit(player)}
                              title="Edit player attributes & base price"
                              className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all text-xs flex items-center gap-1"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline text-[11px] font-bold">Edit</span>
                            </button>

                            <button
                              onClick={() => handleDeletePlayer(player.id, player.name)}
                              title="Remove player from pool"
                              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all text-xs"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-zinc-950 border-t border-white/5 flex items-center justify-between text-xs text-zinc-500">
          <span>Active in draft pool: {players.length} registered players.</span>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 font-bold text-xs text-black transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
