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
  Trash2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Player, Team, Tournament } from '../types';

export const AuctionInterface = () => {
  const { id } = useParams();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [playerPool, setPlayerPool] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [bidAmount, setBidAmount] = useState(0);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [tRes, pRes] = await Promise.all([
        fetch(`/api/tournaments/${id}`),
        fetch(`/api/tournaments/${id}/auction/pool`)
      ]);
      
      if (!tRes.ok || !pRes.ok) throw new Error('Failed to fetch auction data');
      
      const tData = await tRes.json();
      const pData = await pRes.json();
      
      setTournament(tData);
      setTeams(tData.teams || []);
      setPlayerPool(pData);
      if (pData.length > 0) {
        setBidAmount(pData[0].base_price);
      }
    } catch (error) {
      console.error('Error fetching auction data:', error);
    } finally {
      setLoading(false);
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

  const handleSell = async () => {
    if (!selectedTeamId || !playerPool[currentPlayerIndex]) return;
    
    const player = playerPool[currentPlayerIndex];
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
      
      setSelectedTeamId(null);
      if (currentPlayerIndex < playerPool.length - 1) {
        setCurrentPlayerIndex(prev => prev + 1);
        setBidAmount(playerPool[currentPlayerIndex + 1].base_price);
      } else {
        setCurrentPlayerIndex(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error selling player:', error);
      alert('Failed to complete sale. Please try again.');
    }
  };

  const handleUnsold = async () => {
    if (!playerPool[currentPlayerIndex]) return;
    
    // Just move to next player for now, or we could mark as UNSOLD in DB
    if (currentPlayerIndex < playerPool.length - 1) {
      setCurrentPlayerIndex(prev => prev + 1);
      setBidAmount(playerPool[currentPlayerIndex + 1].base_price);
    } else {
      setCurrentPlayerIndex(prev => prev + 1); // Triggers "Completed" view
    }
    setSelectedTeamId(null);
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
    } catch (error) {
      console.error('Error unselling player:', error);
    }
  };

  const currentPlayer = playerPool[currentPlayerIndex];

  if (loading) return <div className="p-8 text-center text-zinc-500">Loading Auction...</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link to={`/admin/tournament/${id}`} className="text-zinc-500 hover:text-white flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" /> Exit Auction
          </Link>
          <div className="flex items-center gap-3">
            <Gavel className="h-6 w-6 text-emerald-500" />
            <h1 className="text-2xl font-bold tracking-tight">Player Auction</h1>
          </div>
          <div className="text-right">
            <p className="text-xs text-zinc-500 uppercase tracking-widest">Tournament</p>
            <p className="font-bold">{tournament?.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Player Card */}
          <div className="lg:col-span-2 space-y-8">
            {currentPlayer ? (
              <div className="relative overflow-hidden rounded-3xl bg-zinc-900 border border-white/5 p-8">
                <div className="absolute top-0 right-0 p-8">
                  <span className="text-6xl font-black text-white/5 uppercase select-none">{currentPlayer.role}</span>
                </div>
                
                <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                  <div className="h-48 w-48 rounded-2xl bg-zinc-800 flex items-center justify-center border border-white/10 overflow-hidden">
                    {currentPlayer.image_url ? (
                      <img src={currentPlayer.image_url} alt={currentPlayer.name} className="h-full w-full object-cover" />
                    ) : (
                      <Users className="h-24 w-24 text-zinc-700" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold uppercase tracking-widest">
                        {currentPlayer.role.replace('_', ' ')}
                      </span>
                      <span className="text-zinc-500 text-sm">Age: {currentPlayer.age}</span>
                    </div>
                    <h2 className="text-5xl font-black tracking-tighter mb-6">{currentPlayer.name}</h2>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Base Price</p>
                        <p className="text-2xl font-bold text-emerald-500">₹{currentPlayer.base_price.toLocaleString()}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                        <p className="text-xs text-emerald-500 uppercase tracking-widest mb-1">Current Bid</p>
                        <p className="text-2xl font-bold text-emerald-500">₹{bidAmount.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-white/5">
                  <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6">Bidding Controls</h3>
                  <div className="flex flex-wrap gap-4 mb-8">
                    {[5000, 10000, 50000, 100000, 500000].map(increment => (
                      <button 
                        key={increment}
                        onClick={() => setBidAmount(prev => prev + increment)}
                        className="px-6 py-3 rounded-xl bg-zinc-800 border border-white/10 font-bold hover:bg-zinc-700 transition-all"
                      >
                        + ₹{increment.toLocaleString()}
                      </button>
                    ))}
                    <button 
                      onClick={() => setBidAmount(currentPlayer.base_price)}
                      className="px-6 py-3 rounded-xl bg-zinc-800 border border-white/10 font-bold text-zinc-500 hover:text-white transition-all"
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
                            {team.name} (₹{team.remaining_budget.toLocaleString()})
                          </option>
                        ))}
                      </select>
                    </div>
                    <button 
                      onClick={handleSell}
                      disabled={!selectedTeamId}
                      className="h-14 px-12 rounded-xl bg-emerald-500 text-black font-black uppercase tracking-widest hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/20"
                    >
                      SOLD
                    </button>
                    <button 
                      onClick={handleUnsold}
                      className="h-14 px-8 rounded-xl bg-zinc-900 border border-white/10 text-zinc-500 font-bold uppercase tracking-widest hover:text-white transition-all"
                    >
                      UNSOLD
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-32 text-center border border-dashed border-white/10 rounded-3xl">
                {playerPool.length === 0 ? (
                  <>
                    <AlertCircle className="h-12 w-12 text-zinc-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">No Players to Auction</h2>
                    <p className="text-zinc-500 max-w-xs mx-auto">There are currently no players in the auction pool. Add unassigned players from the tournament dashboard.</p>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Auction Completed!</h2>
                    <p className="text-zinc-500">All players in the pool have been auctioned.</p>
                  </>
                )}
                <Link to={`/admin/tournament/${id}`} className="mt-8 inline-block text-emerald-500 font-bold hover:underline">
                  Back to Tournament Details
                </Link>
              </div>
            )}

            {/* Player Queue */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Upcoming Players</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {playerPool.slice(currentPlayerIndex + 1, currentPlayerIndex + 5).map(player => (
                  <div key={player.id} className="p-4 rounded-2xl bg-zinc-900/30 border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500 overflow-hidden">
                        {player.image_url ? (
                          <img src={player.image_url} alt={player.name} className="h-full w-full object-cover" />
                        ) : (
                          <User className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{player.name}</p>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-tighter">{player.role}</p>
                      </div>
                    </div>
                    <p className="text-xs font-bold text-emerald-500">₹{player.base_price.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sold Players */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Sold Players</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teams.flatMap(t => t.players || []).sort((a, b) => (b.id || 0) - (a.id || 0)).slice(0, 6).map(player => (
                  <div key={player.id} className="p-4 rounded-2xl bg-zinc-900/30 border border-white/5 flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500 overflow-hidden">
                        {player.image_url ? (
                          <img src={player.image_url} alt={player.name} className="h-full w-full object-cover" />
                        ) : (
                          <User className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{player.name}</p>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-tighter">{player.team_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-xs font-bold text-emerald-500">₹{player.sold_price?.toLocaleString()}</p>
                      <button 
                        onClick={() => handleUnsell(player.id)}
                        className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Team Standings */}
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
                      <span className="font-bold text-sm">{team.name}</span>
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
    </div>
  );
};

const User = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
