import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  X, 
  UserPlus, 
  PlayCircle, 
  CalendarPlus, 
  Trophy, 
  ShoppingBag, 
  MapPin, 
  Check, 
  ExternalLink, 
  ChevronRight,
  Shield,
  Activity,
  Plus,
  RefreshCw,
  Clock,
  Sparkles
} from 'lucide-react';
import { Tournament } from '../types';

interface QuickActionsMenuProps {
  onRefresh?: () => void;
  tournaments?: Tournament[];
}

export const QuickActionsMenu: React.FC<QuickActionsMenuProps> = ({ onRefresh, tournaments: initialTournaments }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  
  // Modals state
  const [activeModal, setActiveModal] = useState<'add_player' | 'update_score' | 'create_match' | null>(null);

  // Common data
  const [tournaments, setTournaments] = useState<Tournament[]>(initialTournaments || []);
  const [teams, setTeams] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states - Add Player
  const [playerForm, setPlayerForm] = useState({
    name: '',
    age: 22,
    role: 'all_rounder',
    sport: 'cricket',
    phone: '',
    base_price: 100000,
    tournament_id: '',
    team_id: '',
    image_url: ''
  });

  // Form states - Create Match
  const [matchForm, setMatchForm] = useState({
    tournament_id: '',
    team1_id: '',
    team2_id: '',
    venue: 'Main Sports Complex',
    match_date: new Date().toISOString().slice(0, 16),
    status: 'scheduled'
  });

  // Form states - Quick Score
  const [selectedMatchId, setSelectedMatchId] = useState<string>('');
  const [scoreFilter, setScoreFilter] = useState<'all' | 'live'>('live');
  const [quickScoreForm, setQuickScoreForm] = useState({
    runs: 0,
    wickets: 0,
    overs_bowled: 0,
    status: 'live',
    team1_score: 0,
    team2_score: 0
  });

  // Fetch helper data
  const loadInitialData = async () => {
    try {
      const [tRes, mRes] = await Promise.all([
        fetch('/api/tournaments').then(r => r.json()).catch(() => []),
        fetch('/api/matches').then(r => r.json()).catch(() => [])
      ]);
      if (Array.isArray(tRes)) setTournaments(tRes);
      if (Array.isArray(mRes)) setMatches(mRes);
    } catch (e) {
      console.error('Error loading quick actions data:', e);
    }
  };

  useEffect(() => {
    if (isOpen || activeModal) {
      loadInitialData();
    }
  }, [isOpen, activeModal]);

  // Load teams when tournament selected in create match or add player
  const fetchTeamsForTournament = async (tId: string) => {
    if (!tId) {
      setTeams([]);
      return;
    }
    try {
      const res = await fetch(`/api/teams?tournament_id=${tId}`);
      if (res.ok) {
        const data = await res.json();
        setTeams(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Sync teams when matchForm.tournament_id changes
  useEffect(() => {
    if (matchForm.tournament_id) {
      fetchTeamsForTournament(matchForm.tournament_id);
    }
  }, [matchForm.tournament_id]);

  // Sync teams when playerForm.tournament_id changes
  useEffect(() => {
    if (playerForm.tournament_id) {
      fetchTeamsForTournament(playerForm.tournament_id);
    }
  }, [playerForm.tournament_id]);

  // When selectedMatchId changes, update quickScoreForm
  useEffect(() => {
    if (!selectedMatchId) return;
    const match = matches.find(m => String(m.id) === String(selectedMatchId));
    if (match) {
      const currentInnings = match.innings?.[0];
      setQuickScoreForm({
        runs: currentInnings?.runs || 0,
        wickets: currentInnings?.wickets || 0,
        overs_bowled: currentInnings?.overs_bowled || 0,
        status: match.status || 'live',
        team1_score: match.team1_score || 0,
        team2_score: match.team2_score || 0
      });
    }
  }, [selectedMatchId, matches]);

  // Handle Add Player Submit
  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerForm.name.trim()) {
      setErrorMessage('Player name is required');
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...playerForm,
          tournament_id: playerForm.tournament_id ? Number(playerForm.tournament_id) : null,
          team_id: playerForm.team_id ? Number(playerForm.team_id) : null,
          image_url: playerForm.image_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(playerForm.name)}`
        })
      });

      if (!res.ok) throw new Error('Failed to add player');
      setSuccessMessage(`Player "${playerForm.name}" added successfully!`);
      setPlayerForm({
        name: '',
        age: 22,
        role: 'all_rounder',
        sport: 'cricket',
        phone: '',
        base_price: 100000,
        tournament_id: '',
        team_id: '',
        image_url: ''
      });
      if (onRefresh) onRefresh();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error creating player');
    } finally {
      setLoading(false);
    }
  };

  // Handle Create Match Submit
  const [createdMatchId, setCreatedMatchId] = useState<number | null>(null);
  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchForm.tournament_id || !matchForm.team1_id || !matchForm.team2_id) {
      setErrorMessage('Tournament, Team 1, and Team 2 are required');
      return;
    }
    if (matchForm.team1_id === matchForm.team2_id) {
      setErrorMessage('Team 1 and Team 2 must be different teams');
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tournament_id: Number(matchForm.tournament_id),
          team1_id: Number(matchForm.team1_id),
          team2_id: Number(matchForm.team2_id),
          venue: matchForm.venue,
          match_date: matchForm.match_date,
          status: matchForm.status
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create match');

      setSuccessMessage('Match created successfully!');
      setCreatedMatchId(data.match_id);
      loadInitialData();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error creating match');
    } finally {
      setLoading(false);
    }
  };

  // Handle Quick Score Submit
  const handleSaveScore = async () => {
    if (!selectedMatchId) {
      setErrorMessage('Please select a match first');
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/matches/${selectedMatchId}/quick-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          runs: Number(quickScoreForm.runs),
          wickets: Number(quickScoreForm.wickets),
          overs_bowled: Number(quickScoreForm.overs_bowled),
          status: quickScoreForm.status,
          team1_score: Number(quickScoreForm.team1_score),
          team2_score: Number(quickScoreForm.team2_score)
        })
      });

      if (!res.ok) throw new Error('Failed to update score');
      setSuccessMessage('Score updated and broadcast in real-time!');
      loadInitialData();
      if (onRefresh) onRefresh();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error updating score');
    } finally {
      setLoading(false);
    }
  };

  // Quick increments for score
  const adjustRuns = (amount: number) => {
    setQuickScoreForm(prev => ({ ...prev, runs: Math.max(0, prev.runs + amount) }));
  };

  const adjustWicket = (amount: number) => {
    setQuickScoreForm(prev => ({ ...prev, wickets: Math.min(10, Math.max(0, prev.wickets + amount)) }));
  };

  const adjustBall = () => {
    setQuickScoreForm(prev => {
      let overs = Math.floor(prev.overs_bowled);
      let balls = Math.round((prev.overs_bowled % 1) * 10) + 1;
      if (balls >= 6) {
        overs += 1;
        balls = 0;
      }
      return { ...prev, overs_bowled: Number((overs + balls / 10).toFixed(1)) };
    });
  };

  const filteredMatchesForScoring = matches.filter(m => {
    if (scoreFilter === 'live') return m.status === 'live';
    return true;
  });

  return (
    <>
      {/* Floating Trigger Container */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
        {/* Expanded Speed-Dial / Floating Menu */}
        {isOpen && (
          <div className="mb-3 w-80 rounded-2xl bg-zinc-950/95 border border-white/10 p-3 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5 duration-200">
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">Quick Actions</h3>
                  <p className="text-[10px] text-zinc-400">One-click admin shortcuts</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all"
                title="Close Quick Actions"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1">
              {/* Quick Action: Add Player */}
              <button
                onClick={() => {
                  setActiveModal('add_player');
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl text-left bg-zinc-900/50 hover:bg-emerald-500/10 hover:border-emerald-500/30 border border-transparent transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20">
                    <UserPlus className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-emerald-400 flex items-center gap-1.5">
                      Add Player
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-blue-500/20 text-blue-300 font-mono">Pool / Team</span>
                    </div>
                    <div className="text-[10px] text-zinc-400">Register player or auction pool entrant</div>
                  </div>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* Quick Action: Update Score */}
              <button
                onClick={() => {
                  setActiveModal('update_score');
                  setIsOpen(false);
                  if (matches.length > 0 && !selectedMatchId) {
                    const firstLive = matches.find(m => m.status === 'live') || matches[0];
                    setSelectedMatchId(String(firstLive.id));
                  }
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl text-left bg-zinc-900/50 hover:bg-emerald-500/10 hover:border-emerald-500/30 border border-transparent transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-500/10 text-red-400 group-hover:bg-red-500/20">
                    <PlayCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-emerald-400 flex items-center gap-1.5">
                      Update Score
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-red-500/20 text-red-400 font-mono animate-pulse">Live</span>
                    </div>
                    <div className="text-[10px] text-zinc-400">Quick adjust runs, wickets, or open scorer</div>
                  </div>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* Quick Action: Create Match */}
              <button
                onClick={() => {
                  setActiveModal('create_match');
                  setIsOpen(false);
                  if (tournaments.length > 0 && !matchForm.tournament_id) {
                    setMatchForm(prev => ({ ...prev, tournament_id: String(tournaments[0].id) }));
                  }
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl text-left bg-zinc-900/50 hover:bg-emerald-500/10 hover:border-emerald-500/30 border border-transparent transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20">
                    <CalendarPlus className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-emerald-400 flex items-center gap-1.5">
                      Create Match
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-300 font-mono">Fixture</span>
                    </div>
                    <div className="text-[10px] text-zinc-400">Schedule tournament match between teams</div>
                  </div>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* Quick Link: Create Tournament */}
              <button
                onClick={() => {
                  navigate('/admin/create');
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl text-left bg-zinc-900/50 hover:bg-purple-500/10 hover:border-purple-500/30 border border-transparent transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20">
                    <Trophy className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-purple-400">
                      Create Tournament
                    </div>
                    <div className="text-[10px] text-zinc-400">Launch new league, auction & sport format</div>
                  </div>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* Quick Link: Manage Shop */}
              <button
                onClick={() => {
                  navigate('/admin/shop');
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl text-left bg-zinc-900/50 hover:bg-amber-500/10 hover:border-amber-500/30 border border-transparent transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20">
                    <ShoppingBag className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-amber-400">
                      Store Merchandise
                    </div>
                    <div className="text-[10px] text-zinc-400">Manage products, stocks and orders</div>
                  </div>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* Quick Link: Ground Venue */}
              <button
                onClick={() => {
                  navigate('/admin/grounds');
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl text-left bg-zinc-900/50 hover:bg-cyan-500/10 hover:border-cyan-500/30 border border-transparent transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-cyan-400">
                      Ground Venues
                    </div>
                    <div className="text-[10px] text-zinc-400">Slots, pitch bookings & rentals</div>
                  </div>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>

            {/* Quick Refresh Button */}
            {onRefresh && (
              <div className="mt-2 pt-2 border-t border-white/5">
                <button
                  onClick={() => {
                    onRefresh();
                    loadInitialData();
                  }}
                  className="w-full py-1.5 px-3 rounded-lg text-[10px] font-semibold text-zinc-400 hover:text-white hover:bg-white/5 flex items-center justify-center gap-2 transition-all"
                >
                  <RefreshCw className="h-3 w-3" /> Refresh Dashboard Data
                </button>
              </div>
            )}
          </div>
        )}

        {/* Floating Button Trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2.5 rounded-full px-5 py-3.5 font-bold shadow-2xl transition-all duration-300 ${
            isOpen 
              ? 'bg-zinc-800 text-white ring-2 ring-emerald-500/50' 
              : 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black hover:scale-105 hover:shadow-emerald-500/30 ring-4 ring-black/40'
          }`}
          title="Open Quick Actions Menu"
        >
          <div className="relative">
            <Zap className={`h-5 w-5 transition-transform duration-300 ${isOpen ? 'rotate-90' : 'fill-current'}`} />
            {!isOpen && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
              </span>
            )}
          </div>
          <span className="text-xs uppercase tracking-wider font-black">
            {isOpen ? 'Close Menu' : 'Quick Actions'}
          </span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* MODAL 1: ADD PLAYER                                             */}
      {/* ============================================================== */}
      {activeModal === 'add_player' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl bg-zinc-950 border border-white/10 p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
                  <UserPlus className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Add New Player</h3>
                  <p className="text-xs text-zinc-400">Quickly register player into tournament or auction pool</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setActiveModal(null);
                  setSuccessMessage(null);
                  setErrorMessage(null);
                }}
                className="text-zinc-500 hover:text-white p-2 rounded-xl hover:bg-white/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {successMessage && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-3">
                <Check className="h-5 w-5 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleAddPlayer} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Player Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Virat Sharma"
                    value={playerForm.name}
                    onChange={e => setPlayerForm({ ...playerForm, name: e.target.value })}
                    className="w-full rounded-xl bg-zinc-900 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Role
                  </label>
                  <select
                    value={playerForm.role}
                    onChange={e => setPlayerForm({ ...playerForm, role: e.target.value })}
                    className="w-full rounded-xl bg-zinc-900 border border-white/10 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="batsman">Batsman</option>
                    <option value="bowler">Bowler</option>
                    <option value="all_rounder">All-Rounder</option>
                    <option value="wk">Wicket-Keeper</option>
                    <option value="singles_specialist">Singles Specialist (Badminton/Tennis)</option>
                    <option value="doubles_specialist">Doubles Specialist (Badminton/Tennis)</option>
                    <option value="all_court">All-Court / Mixed Doubles</option>
                    <option value="forward">Forward / Striker</option>
                    <option value="midfielder">Midfielder</option>
                    <option value="defender">Defender</option>
                    <option value="goalkeeper">Goalkeeper</option>
                    <option value="point_guard">Point Guard</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Sport
                  </label>
                  <select
                    value={playerForm.sport}
                    onChange={e => setPlayerForm({ ...playerForm, sport: e.target.value })}
                    className="w-full rounded-xl bg-zinc-900 border border-white/10 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="cricket">Cricket</option>
                    <option value="soccer">Football / Soccer</option>
                    <option value="basketball">Basketball</option>
                    <option value="tennis">Tennis</option>
                    <option value="badminton">Badminton</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Age
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="65"
                    value={playerForm.age}
                    onChange={e => setPlayerForm({ ...playerForm, age: Number(e.target.value) })}
                    className="w-full rounded-xl bg-zinc-900 border border-white/10 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Base Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={playerForm.base_price}
                    onChange={e => setPlayerForm({ ...playerForm, base_price: Number(e.target.value) })}
                    className="w-full rounded-xl bg-zinc-900 border border-white/10 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Assign Tournament (Optional)
                  </label>
                  <select
                    value={playerForm.tournament_id}
                    onChange={e => setPlayerForm({ ...playerForm, tournament_id: e.target.value, team_id: '' })}
                    className="w-full rounded-xl bg-zinc-900 border border-white/10 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="">Global / Unassigned Pool</option>
                    {tournaments.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.sport || 'Cricket'})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Assign Team (Optional)
                  </label>
                  <select
                    value={playerForm.team_id}
                    onChange={e => setPlayerForm({ ...playerForm, team_id: e.target.value })}
                    className="w-full rounded-xl bg-zinc-900 border border-white/10 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="">Auction Pool / Unsold</option>
                    {teams.map(tm => (
                      <option key={tm.id} value={tm.id}>{tm.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Phone Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={playerForm.phone}
                  onChange={e => setPlayerForm({ ...playerForm, phone: e.target.value })}
                  className="w-full rounded-xl bg-zinc-900 border border-white/10 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 text-black text-xs font-black uppercase tracking-wider hover:bg-emerald-400 transition-all disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Player Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: UPDATE SCORE                                           */}
      {/* ============================================================== */}
      {activeModal === 'update_score' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-zinc-950 border border-white/10 p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400">
                  <PlayCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Quick Update Score</h3>
                  <p className="text-xs text-zinc-400">Adjust live scores directly or launch full live scoring console</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setActiveModal(null);
                  setSuccessMessage(null);
                  setErrorMessage(null);
                }}
                className="text-zinc-500 hover:text-white p-2 rounded-xl hover:bg-white/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setScoreFilter('live')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    scoreFilter === 'live'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  🔴 Live Matches ({matches.filter(m => m.status === 'live').length})
                </button>
                <button
                  onClick={() => setScoreFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    scoreFilter === 'all'
                      ? 'bg-zinc-800 text-white border border-white/20'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  All Matches ({matches.length})
                </button>
              </div>

              {selectedMatchId && (
                <button
                  onClick={() => {
                    navigate(`/admin/score/${selectedMatchId}`);
                    setActiveModal(null);
                  }}
                  className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-bold hover:underline"
                >
                  Open Full Ball-by-Ball Scorer <ExternalLink className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {successMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {errorMessage}
              </div>
            )}

            {/* Match Selector */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Select Match
              </label>
              {filteredMatchesForScoring.length === 0 ? (
                <div className="p-6 rounded-2xl bg-zinc-900/40 border border-dashed border-white/10 text-center text-zinc-500 text-xs">
                  {scoreFilter === 'live' ? 'No live matches found right now. Switch to "All Matches" to score a scheduled match.' : 'No matches found.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
                  {filteredMatchesForScoring.map(m => {
                    const isSelected = String(m.id) === String(selectedMatchId);
                    return (
                      <div
                        key={m.id}
                        onClick={() => setSelectedMatchId(String(m.id))}
                        className={`p-3 rounded-xl cursor-pointer border transition-all text-left ${
                          isSelected
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-white shadow-lg'
                            : 'bg-zinc-900/60 border-white/5 text-zinc-300 hover:bg-zinc-900 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] mb-1">
                          <span className="text-zinc-500">{m.tournament_name || 'Tournament'}</span>
                          <span className={`px-1.5 py-0.5 rounded font-mono font-bold uppercase text-[9px] ${
                            m.status === 'live' ? 'bg-red-500/20 text-red-400' : 'bg-zinc-800 text-zinc-400'
                          }`}>
                            {m.status}
                          </span>
                        </div>
                        <div className="font-bold text-xs truncate">
                          {m.team1_name || 'Team 1'} vs {m.team2_name || 'Team 2'}
                        </div>
                        {m.innings?.[0] && (
                          <div className="text-[11px] font-mono text-emerald-400 mt-1 font-semibold">
                            {m.innings[0].runs}/{m.innings[0].wickets} ({m.innings[0].overs_bowled} ov)
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Score Editing Controls */}
            {selectedMatchId && (
              <div className="p-5 rounded-2xl bg-zinc-900/80 border border-white/10 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Active Match Controls</span>
                    <h4 className="text-sm font-black text-white">
                      {matches.find(m => String(m.id) === String(selectedMatchId))?.team1_name} vs {matches.find(m => String(m.id) === String(selectedMatchId))?.team2_name}
                    </h4>
                  </div>

                  {/* Match Status Selector */}
                  <select
                    value={quickScoreForm.status}
                    onChange={e => setQuickScoreForm({ ...quickScoreForm, status: e.target.value })}
                    className="rounded-lg bg-zinc-800 border border-white/10 px-2.5 py-1 text-xs text-white focus:outline-none"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="live">🔴 LIVE</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                {/* Cricket Score Display & Direct Inputs */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-center">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">Total Runs</span>
                    <input
                      type="number"
                      min="0"
                      value={quickScoreForm.runs}
                      onChange={e => setQuickScoreForm({ ...quickScoreForm, runs: Number(e.target.value) })}
                      className="w-full text-center font-mono text-2xl font-black bg-transparent text-emerald-400 focus:outline-none"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-center">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">Wickets</span>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={quickScoreForm.wickets}
                      onChange={e => setQuickScoreForm({ ...quickScoreForm, wickets: Number(e.target.value) })}
                      className="w-full text-center font-mono text-2xl font-black bg-transparent text-red-400 focus:outline-none"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-center">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">Overs Bowled</span>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={quickScoreForm.overs_bowled}
                      onChange={e => setQuickScoreForm({ ...quickScoreForm, overs_bowled: Number(e.target.value) })}
                      className="w-full text-center font-mono text-2xl font-black bg-transparent text-blue-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Quick Action Increments */}
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold block mb-2">
                    One-Click Score Increments
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    <button
                      type="button"
                      onClick={() => adjustRuns(1)}
                      className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 font-mono text-xs font-bold text-white transition-all text-center"
                    >
                      +1 Run
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustRuns(2)}
                      className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 font-mono text-xs font-bold text-white transition-all text-center"
                    >
                      +2 Runs
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustRuns(4)}
                      className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 font-mono text-xs font-bold transition-all text-center border border-emerald-500/30"
                    >
                      +4 Four
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustRuns(6)}
                      className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 font-mono text-xs font-bold transition-all text-center border border-purple-500/30"
                    >
                      +6 Six
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustWicket(1)}
                      className="p-2.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 font-mono text-xs font-bold transition-all text-center border border-red-500/30"
                    >
                      + Wicket
                    </button>
                    <button
                      type="button"
                      onClick={adjustBall}
                      className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 font-mono text-xs font-bold transition-all text-center border border-blue-500/30"
                    >
                      +0.1 Over
                    </button>
                  </div>
                </div>

                {/* Actions bottom */}
                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      navigate(`/admin/score/${selectedMatchId}`);
                      setActiveModal(null);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold hover:bg-zinc-700 transition-all"
                  >
                    Open Live Scorer <ExternalLink className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleSaveScore}
                    className="flex items-center gap-2 px-6 py-2 rounded-xl bg-emerald-500 text-black text-xs font-black uppercase tracking-wider hover:bg-emerald-400 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Score Now'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: CREATE MATCH                                          */}
      {/* ============================================================== */}
      {activeModal === 'create_match' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl bg-zinc-950 border border-white/10 p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <CalendarPlus className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Create Match Fixture</h3>
                  <p className="text-xs text-zinc-400">Quickly schedule a new tournament match between two teams</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setActiveModal(null);
                  setSuccessMessage(null);
                  setErrorMessage(null);
                  setCreatedMatchId(null);
                }}
                className="text-zinc-500 hover:text-white p-2 rounded-xl hover:bg-white/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {successMessage && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                <div className="flex items-center gap-2 font-bold mb-2">
                  <Check className="h-4 w-4" /> {successMessage}
                </div>
                {createdMatchId && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => {
                        navigate(`/admin/score/${createdMatchId}`);
                        setActiveModal(null);
                      }}
                      className="px-4 py-2 rounded-lg bg-emerald-500 text-black text-xs font-black uppercase tracking-wider hover:bg-emerald-400"
                    >
                      Start Scoring Match Now →
                    </button>
                    <button
                      onClick={() => {
                        setCreatedMatchId(null);
                        setSuccessMessage(null);
                      }}
                      className="px-4 py-2 rounded-lg bg-zinc-800 text-white text-xs font-bold hover:bg-zinc-700"
                    >
                      Schedule Another
                    </button>
                  </div>
                )}
              </div>
            )}

            {errorMessage && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {errorMessage}
              </div>
            )}

            {!createdMatchId && (
              <form onSubmit={handleCreateMatch} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Tournament *
                  </label>
                  <select
                    required
                    value={matchForm.tournament_id}
                    onChange={e => setMatchForm({ ...matchForm, tournament_id: e.target.value, team1_id: '', team2_id: '' })}
                    className="w-full rounded-xl bg-zinc-900 border border-white/10 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="">-- Choose Tournament --</option>
                    {tournaments.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.sport || 'Cricket'} - {t.format || 'League'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                      Team 1 *
                    </label>
                    <select
                      required
                      disabled={!matchForm.tournament_id || teams.length === 0}
                      value={matchForm.team1_id}
                      onChange={e => setMatchForm({ ...matchForm, team1_id: e.target.value })}
                      className="w-full rounded-xl bg-zinc-900 border border-white/10 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
                    >
                      <option value="">-- Select Team 1 --</option>
                      {teams.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                      Team 2 *
                    </label>
                    <select
                      required
                      disabled={!matchForm.tournament_id || teams.length === 0}
                      value={matchForm.team2_id}
                      onChange={e => setMatchForm({ ...matchForm, team2_id: e.target.value })}
                      className="w-full rounded-xl bg-zinc-900 border border-white/10 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
                    >
                      <option value="">-- Select Team 2 --</option>
                      {teams.filter(t => String(t.id) !== String(matchForm.team1_id)).map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {matchForm.tournament_id && teams.length < 2 && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                    This tournament has {teams.length} team(s). At least 2 teams are required to schedule a match.
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                      Venue / Ground
                    </label>
                    <input
                      type="text"
                      value={matchForm.venue}
                      onChange={e => setMatchForm({ ...matchForm, venue: e.target.value })}
                      className="w-full rounded-xl bg-zinc-900 border border-white/10 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                      Match Status
                    </label>
                    <select
                      value={matchForm.status}
                      onChange={e => setMatchForm({ ...matchForm, status: e.target.value })}
                      className="w-full rounded-xl bg-zinc-900 border border-white/10 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="live">Live Immediately</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Match Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={matchForm.match_date}
                    onChange={e => setMatchForm({ ...matchForm, match_date: e.target.value })}
                    className="w-full rounded-xl bg-zinc-900 border border-white/10 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || teams.length < 2}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 text-black text-xs font-black uppercase tracking-wider hover:bg-emerald-400 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Match Fixture'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};
