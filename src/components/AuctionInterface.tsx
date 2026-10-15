import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ChevronLeft,
  Gavel,
  Users,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Search,
  Trash2,
  Share2,
  Award,
  Dices,
  Shuffle,
  Eye,
  EyeOff,
  Hash,
  Sparkles,
  Lock,
  ArrowRight,
  Check,
  RotateCcw,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Player, Team, Tournament } from '../types';
import { AuctionInviteModal } from './AuctionInviteModal';
import { AuctionPoolEditModal } from './AuctionPoolEditModal';
import { getSportConfig, parseSportDetails } from '../lib/sportConfigs';

export const AuctionInterface = () => {
  const { id } = useParams();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [playerPool, setPlayerPool] = useState<Player[]>([]);
  const [activePlayerId, setActivePlayerId] = useState<number | null>(null);
  const [nextQueuedId, setNextQueuedId] = useState<number | null>(null);
  
  // Next player selection mode: random draw, manual selection, or sequential order
  const [selectionMode, setSelectionMode] = useState<'random' | 'manual' | 'sequential'>('random');
  
  // Upcoming display mode: default is numbers-based (hidden details) as requested
  const [showDetailsInUpcoming, setShowDetailsInUpcoming] = useState(false);
  const [numberFilter, setNumberFilter] = useState('');
  
  // Random draw state & animation
  const [isDrawingRandom, setIsDrawingRandom] = useState(false);
  const [animatedNumber, setAnimatedNumber] = useState<number | string | null>(null);
  const [drawAnnouncement, setDrawAnnouncement] = useState<string | null>(null);
  
  const [bidAmount, setBidAmount] = useState(0);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showPoolEditModal, setShowPoolEditModal] = useState(false);

  const fetchData = async (isRetry = false) => {
    try {
      setErrorMessage(null);
      const [tRes, pRes] = await Promise.all([
        fetch(`/api/tournaments/${id}`),
        fetch(`/api/tournaments/${id}/auction/pool`)
      ]);
      
      if (!tRes.ok || !pRes.ok) {
        throw new Error(!tRes.ok && tRes.status === 404 ? 'Tournament not found' : 'Failed to fetch auction data');
      }
      
      const tData = await tRes.json();
      const pData: Player[] = await pRes.json();
      
      setTournament(tData);
      setTeams(tData.teams || []);
      setPlayerPool(pData);
      
      if (pData.length > 0) {
        setActivePlayerId(prev => {
          if (prev && pData.some(p => p.id === prev)) {
            return prev;
          }
          setBidAmount(pData[0].base_price);
          return pData[0].id;
        });
      } else {
        setActivePlayerId(null);
      }
      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching auction data:', error);
      if (!isRetry) {
        setTimeout(() => fetchData(true), 1200);
      } else {
        setErrorMessage(error?.message || 'Failed to connect to auction server');
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();

    let ws: WebSocket | null = null;
    let isConnected = false;

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      ws = new WebSocket(`${protocol}//${window.location.host}`);
      
      ws.onopen = () => {
        isConnected = true;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'AUCTION_UPDATE') {
            fetchData();
          }
        } catch (e) {
          console.error('Error parsing WebSocket message:', e);
        }
      };

      ws.onerror = () => {
        isConnected = false;
      };

      ws.onclose = () => {
        isConnected = false;
      };
    } catch (e) {
      isConnected = false;
    }

    const pollInterval = setInterval(() => {
      if (!isConnected) {
        fetchData();
      }
    }, 4000);

    return () => {
      clearInterval(pollInterval);
      if (ws) {
        try { ws.close(); } catch (e) {}
      }
    };
  }, [id]);

  // The active player currently on the auction block
  const currentPlayer = playerPool.find(p => p.id === activePlayerId) || (playerPool.length > 0 ? playerPool[0] : null);

  // Directly call any player to the auction stage
  const handleCallToStage = (player: Player) => {
    setActivePlayerId(player.id);
    setBidAmount(player.base_price);
    setSelectedTeamId(null);
    if (nextQueuedId === player.id) {
      setNextQueuedId(null);
    }
  };

  // Draw a random player from the remaining pool
  const handleDrawRandom = () => {
    const candidates = playerPool.filter(p => p.id !== currentPlayer?.id);
    if (candidates.length === 0) {
      if (playerPool.length > 0 && (!currentPlayer || currentPlayer.id !== playerPool[0].id)) {
        handleCallToStage(playerPool[0]);
      }
      return;
    }

    setIsDrawingRandom(true);
    let count = 0;
    const interval = setInterval(() => {
      const randCand = candidates[Math.floor(Math.random() * candidates.length)];
      setAnimatedNumber(randCand.id);
      count++;
      if (count > 14) {
        clearInterval(interval);
        const chosen = candidates[Math.floor(Math.random() * candidates.length)];
        setAnimatedNumber(chosen.id);
        setDrawAnnouncement(`Lot #${chosen.id} Drawn!`);
        setTimeout(() => {
          setIsDrawingRandom(false);
          setAnimatedNumber(null);
          setDrawAnnouncement(null);
          handleCallToStage(chosen);
        }, 700);
      }
    }, 70);
  };

  // Determine and pick the next player after a sale or unsold event
  const advanceToNext = (poolAfterEvent: Player[]) => {
    if (poolAfterEvent.length === 0) {
      setActivePlayerId(null);
      return;
    }

    // 1. If user queued a specific lot number, take it
    if (nextQueuedId && poolAfterEvent.some(p => p.id === nextQueuedId)) {
      const nextP = poolAfterEvent.find(p => p.id === nextQueuedId)!;
      setActivePlayerId(nextP.id);
      setBidAmount(nextP.base_price);
      setNextQueuedId(null);
      return;
    }

    // 2. Random mode: pick random number
    if (selectionMode === 'random') {
      const randIdx = Math.floor(Math.random() * poolAfterEvent.length);
      const nextP = poolAfterEvent[randIdx];
      setActivePlayerId(nextP.id);
      setBidAmount(nextP.base_price);
      return;
    }

    // 3. Sequential or Manual mode: default to first in list
    const nextP = poolAfterEvent[0];
    setActivePlayerId(nextP.id);
    setBidAmount(nextP.base_price);
  };

  const handleSell = async () => {
    if (!selectedTeamId || !currentPlayer) return;
    
    const player = currentPlayer;
    const team = teams.find(t => t.id === selectedTeamId);
    
    if (team && team.remaining_budget < bidAmount) {
      alert("Team doesn't have enough budget!");
      return;
    }

    try {
      const response = await fetch('/api/auction/sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_id: player.id,
          team_id: selectedTeamId,
          sold_price: bidAmount
        })
      });

      if (!response.ok) throw new Error('Failed to sell player');
      
      const updatedPool = playerPool.filter(p => p.id !== player.id);
      setPlayerPool(updatedPool);
      setSelectedTeamId(null);

      advanceToNext(updatedPool);
      fetchData();
    } catch (error) {
      console.error('Error selling player:', error);
      alert('Failed to complete sale. Please try again.');
    }
  };

  const handleUnsold = () => {
    if (!currentPlayer) return;
    
    if (playerPool.length <= 1) {
      alert('This is the only remaining player in the auction pool.');
      return;
    }

    // Rotate current player to the back of the pool
    const currentId = currentPlayer.id;
    const remaining = playerPool.filter(p => p.id !== currentId);
    const reorderedPool = [...remaining, currentPlayer];
    setPlayerPool(reorderedPool);
    setSelectedTeamId(null);

    advanceToNext(remaining);
  };

  const handleUnsell = async (playerId: number) => {
    if (!window.confirm('Are you sure you want to unsell this player? This will return the player to the pool and refund the team budget.')) return;
    try {
      const response = await fetch('/api/auction/unsell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_id: playerId })
      });
      if (!response.ok) throw new Error('Failed to unsell player');
      fetchData();
    } catch (error) {
      console.error('Error unselling player:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <div className="h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-zinc-400 font-medium text-sm">Loading Auction Room...</p>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
          <AlertCircle className="h-8 w-8 text-red-400" />
        </div>
        <h2 className="text-xl font-bold mb-2">Auction Not Available</h2>
        <p className="text-zinc-400 text-sm max-w-md mb-6">
          {errorMessage || "Unable to load tournament auction data. Please verify your connection or try again."}
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => { setLoading(true); fetchData(true); }}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-bold transition-all cursor-pointer"
          >
            Retry Connection
          </button>
          <Link
            to="/admin"
            className="px-5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 hover:bg-zinc-800 text-sm font-bold transition-all"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const currentSportConfig = currentPlayer ? getSportConfig(currentPlayer.sport) : null;
  const currentSportDetails = currentPlayer ? parseSportDetails(currentPlayer.sport_details) : {};

  // Upcoming players: all in playerPool except the active player on the stage
  const upcomingPlayers = playerPool.filter(p => p.id !== currentPlayer?.id);
  const filteredUpcoming = numberFilter.trim() === ''
    ? upcomingPlayers
    : upcomingPlayers.filter(p => 
        String(p.id).includes(numberFilter.trim()) || 
        p.name.toLowerCase().includes(numberFilter.toLowerCase())
      );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Random Draw Overlay Animation */}
      {isDrawingRandom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-emerald-500/30 rounded-3xl p-8 max-w-sm w-full text-center space-y-6 shadow-2xl shadow-emerald-500/10">
            <div className="mx-auto w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center animate-pulse">
              <Dices className="h-10 w-10 text-emerald-400 animate-spin" style={{ animationDuration: '3s' }} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-emerald-400 font-extrabold mb-1">
                Random Draw in Progress
              </p>
              <h3 className="text-xl font-black text-white">Selecting Next Player Lot</h3>
            </div>
            <div className="p-6 rounded-2xl bg-black border border-white/10">
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-2">Registration No.</p>
              <div className="text-5xl font-black tracking-tight text-emerald-400 tabular-nums">
                #{animatedNumber || '??'}
              </div>
            </div>
            {drawAnnouncement && (
              <p className="text-sm font-bold text-emerald-300 animate-bounce">{drawAnnouncement}</p>
            )}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <Link to={`/admin/tournament/${id}`} className="text-zinc-500 hover:text-white flex items-center gap-1 text-sm">
            <ChevronLeft className="h-4 w-4" /> Exit Auction
          </Link>
          <div className="flex items-center gap-3">
            <Gavel className="h-6 w-6 text-emerald-500" />
            <h1 className="text-2xl font-bold tracking-tight">Player Auction</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
              Live Draft
            </span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setShowPoolEditModal(true)}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/10 text-xs font-bold transition-all flex items-center gap-2"
            >
              <Gavel className="h-3.5 w-3.5 text-emerald-400" />
              <span>Auction Pool Edit</span>
            </button>
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/10"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Invite Players</span>
            </button>
            <div className="text-right">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Tournament</p>
              <p className="font-bold text-sm text-white">{tournament?.name}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Active Player Card & Upcoming Pool */}
          <div className="lg:col-span-2 space-y-8">
            {currentPlayer ? (
              <div className="relative overflow-hidden rounded-3xl bg-zinc-900 border border-white/5 p-8 shadow-2xl">
                {/* Registration Number Header Tag */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-400 text-sm font-black tracking-wider border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
                      <Hash className="h-4 w-4" />
                      <span>REGISTRATION #{currentPlayer.id}</span>
                    </span>
                    <span className="px-3 py-1 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold border border-white/10">
                      Lot #{playerPool.findIndex(p => p.id === currentPlayer.id) + 1} of {playerPool.length}
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-widest border border-emerald-500/20">
                      ON AUCTION BLOCK
                    </span>
                  </div>

                  {/* Quick Next Selector */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDrawRandom}
                      disabled={upcomingPlayers.length === 0}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                      title="Draw a random player lot next"
                    >
                      <Dices className="h-3.5 w-3.5" />
                      <span>Draw Random</span>
                    </button>
                    {upcomingPlayers.length > 0 && (
                      <select
                        onChange={(e) => {
                          const p = playerPool.find(x => x.id === parseInt(e.target.value));
                          if (p) handleCallToStage(p);
                        }}
                        value=""
                        className="bg-black/60 border border-white/10 rounded-xl px-2.5 py-1 text-xs font-bold text-zinc-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="">Call Lot #...</option>
                        {upcomingPlayers.map((p, idx) => (
                          <option key={p.id} value={p.id}>
                            Lot #{idx + 1} (Reg #{p.id})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                <div className="absolute top-14 right-0 p-8 pointer-events-none opacity-20">
                  <span className="text-7xl font-black text-white/10 uppercase select-none">{currentPlayer.role}</span>
                </div>
                
                <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                  <div className="h-48 w-48 rounded-2xl bg-zinc-800 flex items-center justify-center border border-white/10 overflow-hidden shrink-0 shadow-lg relative group">
                    {currentPlayer.image_url ? (
                      <img src={currentPlayer.image_url} alt={currentPlayer.name} className="h-full w-full object-cover" />
                    ) : (
                      <Users className="h-24 w-24 text-zinc-700" />
                    )}
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-sm text-[10px] font-black text-emerald-400 border border-white/10">
                      REG #{currentPlayer.id}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-widest border border-emerald-500/20">
                        {currentPlayer.role.replace(/_/g, ' ')}
                      </span>
                      {currentSportConfig && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${currentSportConfig.badgeClass} flex items-center gap-1`}>
                          <span>{currentSportConfig.icon}</span>
                          <span>{currentSportConfig.name}</span>
                        </span>
                      )}
                      <span className="text-zinc-500 text-sm">Age: {currentPlayer.age}</span>
                    </div>
                    <h2 className="text-4xl sm:text-5xl font-black tracking-tighter mb-4 truncate text-white">{currentPlayer.name}</h2>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Base Price</p>
                        <p className="text-2xl font-bold text-emerald-500">₹{currentPlayer.base_price.toLocaleString()}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                        <p className="text-xs text-emerald-500 uppercase tracking-widest mb-1">Current Bid</p>
                        <p className="text-2xl font-bold text-emerald-500">₹{bidAmount.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Sport-Specific Attribute Highlights */}
                    {currentSportConfig && currentSportConfig.attributes.length > 0 && (
                      <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-white/5 space-y-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                          <Award className="h-3 w-3 text-emerald-400" />
                          <span>{currentSportConfig.name} Athlete Specs</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {currentSportConfig.attributes.slice(0, 6).map(attr => {
                            const val = currentSportDetails[attr.key] !== undefined ? currentSportDetails[attr.key] : attr.defaultValue;
                            if (val === undefined || val === '') return null;
                            return (
                              <div key={attr.key} className="p-2 rounded-xl bg-black/40 border border-white/5">
                                <span className="text-[9px] text-zinc-500 uppercase block font-semibold truncate">{attr.label}</span>
                                <span className="text-xs font-bold text-zinc-200 mt-0.5 block truncate">
                                  {val} {attr.unit ? <span className="text-zinc-500 font-normal">{attr.unit}</span> : ''}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bidding Controls */}
                <div className="mt-10 pt-8 border-t border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Bidding Controls</h3>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-zinc-500">Next Pick Mode:</span>
                      <div className="flex items-center bg-black/60 rounded-xl p-1 border border-white/10">
                        <button
                          onClick={() => setSelectionMode('random')}
                          className={cn(
                            "px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all",
                            selectionMode === 'random' ? "bg-emerald-500 text-black shadow-sm" : "text-zinc-400 hover:text-white"
                          )}
                        >
                          <Dices className="h-3 w-3" />
                          <span>Random</span>
                        </button>
                        <button
                          onClick={() => setSelectionMode('manual')}
                          className={cn(
                            "px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all",
                            selectionMode === 'manual' ? "bg-emerald-500 text-black shadow-sm" : "text-zinc-400 hover:text-white"
                          )}
                        >
                          <SlidersHorizontal className="h-3 w-3" />
                          <span>Manual</span>
                        </button>
                        <button
                          onClick={() => setSelectionMode('sequential')}
                          className={cn(
                            "px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all",
                            selectionMode === 'sequential' ? "bg-emerald-500 text-black shadow-sm" : "text-zinc-400 hover:text-white"
                          )}
                        >
                          <ArrowRight className="h-3 w-3" />
                          <span>Sequential</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 mb-8">
                    {[5000, 10000, 50000, 100000, 500000].map(increment => (
                      <button 
                        key={increment}
                        onClick={() => setBidAmount(prev => prev + increment)}
                        className="px-5 py-2.5 rounded-xl bg-zinc-800 border border-white/10 font-bold hover:bg-zinc-700 transition-all text-sm"
                      >
                        + ₹{increment.toLocaleString()}
                      </button>
                    ))}
                    <button 
                      onClick={() => setBidAmount(currentPlayer.base_price)}
                      className="px-5 py-2.5 rounded-xl bg-zinc-800 border border-white/10 font-bold text-zinc-500 hover:text-white transition-all text-sm"
                    >
                      Reset
                    </button>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <select 
                        className="w-full h-14 rounded-xl bg-black border border-white/10 px-4 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        value={selectedTeamId || ''}
                        onChange={e => setSelectedTeamId(parseInt(e.target.value))}
                      >
                        <option value="">Select Bidding Team</option>
                        {teams.map(team => (
                          <option key={team.id} value={team.id}>
                            {team.name} (Remaining: ₹{team.remaining_budget.toLocaleString()})
                          </option>
                        ))}
                      </select>
                    </div>
                    <button 
                      onClick={handleSell}
                      disabled={!selectedTeamId}
                      className="h-14 px-10 rounded-xl bg-emerald-500 text-black font-black uppercase tracking-widest hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                    >
                      <Check className="h-5 w-5" />
                      <span>SOLD</span>
                    </button>
                    <button 
                      onClick={handleUnsold}
                      className="h-14 px-7 rounded-xl bg-zinc-900 border border-white/10 text-zinc-400 font-bold uppercase tracking-widest hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>UNSOLD</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-24 text-center border border-dashed border-white/10 rounded-3xl p-8 space-y-4 bg-zinc-950/40">
                {playerPool.length === 0 ? (
                  <>
                    <AlertCircle className="h-12 w-12 text-zinc-500 mx-auto mb-2" />
                    <h2 className="text-2xl font-bold mb-1">No Players in Auction Pool</h2>
                    <p className="text-zinc-500 max-w-sm mx-auto text-sm">
                      There are currently no unauctioned players waiting in the pool. Invite athletes or add players via the Auction Pool Edit.
                    </p>
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                      <button
                        onClick={() => setShowInviteModal(true)}
                        className="px-6 py-3 rounded-xl bg-emerald-500 text-black font-extrabold text-xs uppercase tracking-wider hover:bg-emerald-400 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                      >
                        <Share2 className="h-4 w-4" />
                        <span>Invite Players to Auction</span>
                      </button>
                      <button
                        onClick={() => setShowPoolEditModal(true)}
                        className="px-6 py-3 rounded-xl bg-zinc-800 text-zinc-200 font-bold text-xs hover:text-white transition-all flex items-center gap-2"
                      >
                        <Gavel className="h-4 w-4 text-emerald-400" />
                        <span>Auction Pool Edit</span>
                      </button>
                      <Link 
                        to={`/admin/tournament/${id}`} 
                        className="px-5 py-3 rounded-xl bg-zinc-800 text-zinc-300 font-bold text-xs hover:text-white transition-all"
                      >
                        Dashboard
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-2" />
                    <h2 className="text-2xl font-bold mb-1">All Current Lots Completed!</h2>
                    <p className="text-zinc-500 text-sm">All players in this pool cycle have been called to the auction block.</p>
                    <div className="pt-2 flex items-center justify-center gap-3">
                      <button
                        onClick={() => setShowPoolEditModal(true)}
                        className="px-5 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 font-bold text-xs hover:text-white transition-all flex items-center gap-1.5"
                      >
                        <Gavel className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Manage Pool Lots</span>
                      </button>
                      <button
                        onClick={() => setShowInviteModal(true)}
                        className="px-5 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 font-bold text-xs hover:text-white transition-all flex items-center gap-1.5"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                        <span>Invite More Players</span>
                      </button>
                      <Link to={`/admin/tournament/${id}`} className="px-5 py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400">
                        View Team Rosters
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* UPCOMING PLAYERS POOL (Numbers-Based Display) */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-900/60 border border-white/5">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Hash className="h-4 w-4 text-emerald-400" />
                      <span>Upcoming Players Pool</span>
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                      {upcomingPlayers.length} Numbers Remaining
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {showDetailsInUpcoming 
                      ? 'Detailed view active (Admin override)' 
                      : 'Numbers-Based Blind Pool: Player identities hidden until drawn to the auction podium'}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Random draw button */}
                  <button
                    onClick={handleDrawRandom}
                    disabled={upcomingPlayers.length === 0}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-black text-xs uppercase tracking-wider hover:opacity-95 transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Dices className="h-4 w-4" />
                    <span>Draw Random Number</span>
                  </button>

                  {/* Toggle numbers-only vs revealed details */}
                  <button
                    onClick={() => setShowDetailsInUpcoming(!showDetailsInUpcoming)}
                    className={cn(
                      "px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5",
                      showDetailsInUpcoming 
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/30" 
                        : "bg-zinc-800 text-zinc-300 border-white/10 hover:text-white"
                    )}
                    title={showDetailsInUpcoming ? "Switch to Numbers-Only Mode" : "Peek player details"}
                  >
                    {showDetailsInUpcoming ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    <span>{showDetailsInUpcoming ? 'Hide Details' : 'Numbers Mode'}</span>
                  </button>

                  <button
                    onClick={() => setShowPoolEditModal(true)}
                    className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/10 text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Gavel className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Pool Edit</span>
                  </button>
                </div>
              </div>

              {/* Pool Control Bar: Filter and Mode Indicator */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1">
                <div className="relative w-full sm:w-64">
                  <Search className="h-3.5 w-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={numberFilter}
                    onChange={(e) => setNumberFilter(e.target.value)}
                    placeholder="Search Registration No. #"
                    className="w-full h-9 pl-9 pr-3 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  {numberFilter && (
                    <button
                      onClick={() => setNumberFilter('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="text-xs text-zinc-500 flex items-center gap-2">
                  <span>Selection Method:</span>
                  <span className="font-bold text-emerald-400 capitalize flex items-center gap-1">
                    {selectionMode === 'random' && <Dices className="h-3 w-3" />}
                    {selectionMode === 'manual' && <SlidersHorizontal className="h-3 w-3" />}
                    {selectionMode === 'sequential' && <ArrowRight className="h-3 w-3" />}
                    {selectionMode === 'random' ? 'Random Numbers Draw' : selectionMode === 'manual' ? 'Manual Lot Pick' : 'Sequential Order'}
                  </span>
                </div>
              </div>

              {/* Upcoming Numbers Grid */}
              {filteredUpcoming.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-zinc-900/30 border border-dashed border-white/10 text-zinc-500 text-sm">
                  {numberFilter ? `No player found matching "${numberFilter}"` : 'No upcoming players in the pool.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredUpcoming.map((player, idx) => {
                    const isQueued = nextQueuedId === player.id;
                    const sportCfg = player.sport ? getSportConfig(player.sport) : null;

                    return (
                      <div 
                        key={player.id} 
                        className={cn(
                          "relative rounded-2xl p-4 transition-all duration-200 border flex flex-col justify-between group",
                          isQueued 
                            ? "bg-emerald-950/30 border-emerald-500/40 shadow-lg shadow-emerald-500/10" 
                            : "bg-zinc-900/40 hover:bg-zinc-900/80 border-white/5 hover:border-white/15"
                        )}
                      >
                        {isQueued && (
                          <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-emerald-500 text-black text-[9px] font-black uppercase tracking-wider shadow">
                            Queued Next
                          </div>
                        )}

                        {!showDetailsInUpcoming ? (
                          /* NUMBERS-BASED MYSTERY CARD (Requested: don't show player details, show numbers based) */
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                Lot #{idx + 1}
                              </span>
                              {sportCfg && (
                                <span className="text-xs" title={sportCfg.name}>
                                  {sportCfg.icon}
                                </span>
                              )}
                            </div>

                            {/* Prominent Registration Number Display */}
                            <div className="flex items-center gap-3 py-1">
                              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center shrink-0 shadow-inner group-hover:border-emerald-500/40 transition-colors">
                                <Hash className="h-5 w-5 text-emerald-400" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-2xl font-black text-white tracking-tight flex items-baseline gap-1">
                                  <span>#{player.id}</span>
                                </div>
                                <div className="flex items-center gap-1 text-[11px] text-zinc-500 font-medium">
                                  <Lock className="h-3 w-3 text-zinc-600" />
                                  <span>Mystery Player Lot</span>
                                </div>
                              </div>
                            </div>

                            <p className="text-[10px] text-zinc-500 italic">
                              Identity revealed on auction podium
                            </p>
                          </div>
                        ) : (
                          /* REVEALED CARD (When Admin explicitly clicks "Peek Details") */
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                Lot #{idx + 1} • Reg #{player.id}
                              </span>
                              <span className="text-xs font-black text-emerald-400">
                                ₹{player.base_price.toLocaleString()}
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                                {player.image_url ? (
                                  <img src={player.image_url} alt={player.name} className="h-full w-full object-cover" />
                                ) : (
                                  <Users className="h-5 w-5 text-zinc-600" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-bold text-sm text-white truncate">{player.name}</p>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-tight">{player.role.replace(/_/g, ' ')}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Interactive Manual Action Buttons */}
                        <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2">
                          <button
                            onClick={() => handleCallToStage(player)}
                            className="flex-1 py-1.5 px-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/20 text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-sm"
                          >
                            <Sparkles className="h-3 w-3" />
                            <span>Call #{player.id} Now</span>
                          </button>
                          <button
                            onClick={() => setNextQueuedId(isQueued ? null : player.id)}
                            className={cn(
                              "py-1.5 px-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1",
                              isQueued 
                                ? "bg-emerald-500 text-black border-emerald-400 font-black" 
                                : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white border-white/10"
                            )}
                            title="Set as the next player to come up automatically"
                          >
                            <span>{isQueued ? 'Queued' : 'Set Next'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sold Players Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">
                  Sold Players ({teams.flatMap(t => t.players || []).length})
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teams.flatMap(t => t.players || []).sort((a, b) => (b.id || 0) - (a.id || 0)).slice(0, 8).map(player => (
                  <div key={player.id} className="p-4 rounded-2xl bg-zinc-900/30 border border-white/5 flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500 overflow-hidden relative">
                        {player.image_url ? (
                          <img src={player.image_url} alt={player.name} className="h-full w-full object-cover" />
                        ) : (
                          <Users className="h-5 w-5" />
                        )}
                        <span className="absolute bottom-0 right-0 bg-black/80 text-[8px] font-bold text-emerald-400 px-1 rounded-tl">
                          #{player.id}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-sm text-white">{player.name}</p>
                          <span className="text-[10px] text-zinc-500 font-mono">#{player.id}</span>
                        </div>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-tighter">{player.team_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-xs font-bold text-emerald-500">₹{player.sold_price?.toLocaleString()}</p>
                      <button 
                        onClick={() => handleUnsell(player.id)}
                        className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all opacity-0 group-hover:opacity-100"
                        title="Return player to pool and refund team budget"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Team Standings & Budgets */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Team Budgets
            </h3>
            <div className="space-y-3">
              {teams.sort((a, b) => b.remaining_budget - a.remaining_budget).map(team => (
                <div key={team.id} className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-zinc-800 flex items-center justify-center text-[10px] font-bold overflow-hidden border border-white/10">
                        {team.logo_url ? (
                          <img src={team.logo_url} alt={team.name} className="h-full w-full object-cover" />
                        ) : (
                          team.name[0]
                        )}
                      </div>
                      <span className="font-bold text-sm text-white">{team.name}</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-500">₹{team.remaining_budget.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-1.5 bg-black rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-500" 
                      style={{ width: `${(team.remaining_budget / (tournament?.base_budget || 1)) * 100}%` }}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[10px] text-zinc-500">
                    <span>Players: {team.players?.length || 0}</span>
                    <span>Spent: ₹{((tournament?.base_budget || 0) - team.remaining_budget).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Auction Player Invite Modal */}
      {id && (
        <AuctionInviteModal
          tournamentId={id}
          tournamentName={tournament?.name}
          tournamentSport={tournament?.sport}
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          onPlayerAddedToPool={fetchData}
        />
      )}

      {/* Auction Pool Edit Modal */}
      {id && (
        <AuctionPoolEditModal
          tournamentId={id}
          tournament={tournament}
          isOpen={showPoolEditModal}
          onClose={() => setShowPoolEditModal(false)}
          onPoolUpdated={fetchData}
          onOpenInviteModal={() => setShowInviteModal(true)}
        />
      )}
    </div>
  );
};
