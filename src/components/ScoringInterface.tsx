import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ChevronLeft,
  Circle,
  User,
  History,
  AlertCircle,
  CheckCircle2,
  Settings,
  X,
  Video,
  Trophy,
  Users,
  Play,
  XCircle,
  MessageSquare,
  PlusCircle,
  Flag,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export const ScoringInterface = () => {
  const { matchId } = useParams();
  const [match, setMatch] = useState<any>(null);
  const [innings, setInnings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showPlayerSelection, setShowPlayerSelection] = useState(false);
  const [selectionType, setSelectionType] = useState<'striker' | 'non_striker' | 'bowler'>('striker');
  const [team1Players, setTeam1Players] = useState<any[]>([]);
  const [team2Players, setTeam2Players] = useState<any[]>([]);
  const [team1SelectedPlayerId, setTeam1SelectedPlayerId] = useState<string>('');
  const [team2SelectedPlayerId, setTeam2SelectedPlayerId] = useState<string>('');
  const [events, setEvents] = useState<any[]>([]);
  const [newCommentary, setNewCommentary] = useState('');
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventFormData, setEventFormData] = useState({
    event_type: 'commentary',
    team_id: '',
    player_id: '',
    description: ''
  });
  const [settingsData, setSettingsData] = useState({
    toss_winner_id: null,
    toss_decision: 'bat',
    striker_id: null,
    non_striker_id: null,
    bowler_id: null,
    live_stream_url: ''
  });

  const [genericScores, setGenericScores] = useState({
    team1_score: 0,
    team2_score: 0
  });

  const handleGenericScoreUpdate = async (teamNum: 1 | 2, points: number, event_type: string, description: string, player_id: string | null = null, team_id: string | null = null) => {
    const nextScores = {
      team1_score: teamNum === 1 ? (genericScores.team1_score || 0) + points : (genericScores.team1_score || 0),
      team2_score: teamNum === 2 ? (genericScores.team2_score || 0) + points : (genericScores.team2_score || 0)
    };

    setGenericScores(nextScores);

    try {
      const res = await fetch(`/api/matches/${matchId}/score-generic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team1_score: nextScores.team1_score,
          team2_score: nextScores.team2_score,
          description,
          event_type,
          player_id,
          team_id
        })
      });
      if (res.ok) {
        fetchMatchData();
      }
    } catch (e) {
      console.error('Error saving generic score:', e);
    }
  };

  const fetchMatchData = async () => {
    try {
      const res = await fetch(`/api/matches/live`);
      if (!res.ok) throw new Error('Failed to fetch live matches');
      const liveMatches = await res.json();
      const currentMatch = liveMatches.find((m: any) => m.id === parseInt(matchId!));
      if (currentMatch) {
        setMatch(currentMatch);
        if (currentMatch.sport === 'soccer' || currentMatch.sport === 'basketball') {
          setInnings(null);
          setGenericScores({
            team1_score: currentMatch.team1_score || 0,
            team2_score: currentMatch.team2_score || 0
          });
        } else {
          setInnings(currentMatch.innings?.[0] || null);
        }
        setSettingsData({
          toss_winner_id: currentMatch.toss_winner_id,
          toss_decision: currentMatch.toss_decision || 'bat',
          striker_id: currentMatch.striker_id,
          non_striker_id: currentMatch.non_striker_id,
          bowler_id: currentMatch.bowler_id,
          live_stream_url: currentMatch.live_stream_url || ''
        });

        // Fetch players for both teams
        const t1Res = await fetch(`/api/tournaments/${currentMatch.tournament_id}`);
        const tournamentData = await t1Res.json();
        const t1 = tournamentData.teams.find((t: any) => t.id === currentMatch.team1_id);
        const t2 = tournamentData.teams.find((t: any) => t.id === currentMatch.team2_id);
        setTeam1Players(t1?.players || []);
        setTeam2Players(t2?.players || []);

        // Fetch events
        const eventsRes = await fetch(`/api/matches/${matchId}/events`);
        const eventsData = await eventsRes.json();
        setEvents(eventsData);
      }
    } catch (error) {
      console.error('Error fetching match data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatchData();

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
          if (data.type === 'SCORE_UPDATE' && data.match_id === matchId) {
            setInnings(data.innings);
            
            // Check for over completion
            const balls = Math.round((data.innings.overs_bowled % 1) * 10);
            if (balls === 0 && data.innings.overs_bowled > 0) {
              setSelectionType('bowler');
              setShowPlayerSelection(true);
            }
          }
          if (data.type === 'SCORE_UPDATE_GENERIC' && data.match_id === matchId) {
            setGenericScores({
              team1_score: data.team1_score,
              team2_score: data.team2_score
            });
            if (data.event) {
              setEvents(prev => [data.event, ...prev]);
            }
          }
          if (data.type === 'MATCH_SETTINGS_UPDATE' && data.match_id === matchId) {
            fetchMatchData();
          }
          if (data.type === 'MATCH_EVENT' && data.match_id === matchId) {
            setEvents(prev => [data.event, ...prev]);
          }
        } catch (e) {
          console.error('Error parsing WebSocket message:', e);
        }
      };

      ws.onerror = () => {
        // Fallback cleanly on serverless hosts like Vercel
        isConnected = false;
      };

      ws.onclose = () => {
        isConnected = false;
      };
    } catch (e) {
      isConnected = false;
    }

    // Polling fallback: if WebSocket is unavailable (e.g. Vercel deployment), refresh periodically
    const pollInterval = setInterval(() => {
      if (!isConnected) {
        fetchMatchData();
      }
    }, 4000);

    return () => {
      clearInterval(pollInterval);
      if (ws) {
        try { ws.close(); } catch (e) {}
      }
    };
  }, [matchId]);

  const handleBall = async (runs: number, extra: string | null = null, wicket: string | null = null) => {
    if (!innings || !settingsData.striker_id || !settingsData.bowler_id) {
      alert('Please select striker and bowler first');
      setShowSettings(true);
      return;
    }

    try {
      const response = await fetch(`/api/matches/${matchId}/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          innings_id: innings.id,
          over_number: Math.floor(innings.overs_bowled || 0),
          ball_number: Math.round(((innings.overs_bowled || 0) % 1 * 10) + 1),
          runs,
          extras: extra ? 1 : 0,
          extra_type: extra,
          wicket_type: wicket,
          batsman_id: settingsData.striker_id,
          bowler_id: settingsData.bowler_id
        })
      });

      if (!response.ok) throw new Error('Failed to update score');
      
      // If wicket, prompt for new batsman
      if (wicket) {
        setSelectionType('striker');
        setShowPlayerSelection(true);
      } else if (runs % 2 !== 0 && !extra) {
        // Simple strike rotation
        setSettingsData(prev => ({
          ...prev,
          striker_id: prev.non_striker_id,
          non_striker_id: prev.striker_id
        }));
      }
    } catch (error) {
      console.error('Error updating score:', error);
      alert('Failed to update score. Please try again.');
    }
  };

  const undoLastBall = async () => {
    if (!innings) return;
    if (!window.confirm('Are you sure you want to undo the last ball?')) return;
    try {
      const res = await fetch(`/api/innings/${innings.id}/undo`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to undo ball');
    } catch (error) {
      console.error('Error undoing ball:', error);
      alert('Failed to undo ball');
    }
  };

  const saveSettings = async (newData: any = settingsData) => {
    try {
      const res = await fetch(`/api/matches/${matchId}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData)
      });
      if (res.ok) {
        setShowSettings(false);
        setShowPlayerSelection(false);
        fetchMatchData();
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const endMatch = async () => {
    if (!window.confirm('Are you sure you want to end this match? This will mark the match as completed.')) return;
    
    let winnerId: number | null = null;
    if (match?.sport && match?.sport !== 'cricket') {
      if (genericScores.team1_score > genericScores.team2_score) {
        winnerId = match.team1_id;
      } else if (genericScores.team2_score > genericScores.team1_score) {
        winnerId = match.team2_id;
      }
    }
    
    try {
      const res = await fetch(`/api/matches/${matchId}/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winner_id: winnerId })
      });
      if (res.ok) {
        if (match) {
          window.location.href = `/admin/tournament/${match.tournament_id}`;
        } else {
          window.location.href = '/admin';
        }
      }
    } catch (error) {
      console.error('Error ending match:', error);
    }
  };

  const addEvent = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      const res = await fetch(`/api/matches/${matchId}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventFormData)
      });
      if (res.ok) {
        setEventFormData({
          event_type: 'commentary',
          team_id: '',
          player_id: '',
          description: ''
        });
        setShowEventModal(false);
      }
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const addQuickCommentary = async () => {
    if (!newCommentary.trim()) return;
    try {
      const res = await fetch(`/api/matches/${matchId}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'commentary',
          description: newCommentary
        })
      });
      if (res.ok) {
        setNewCommentary('');
      }
    } catch (error) {
      console.error('Error adding commentary:', error);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  const battingTeamId = innings?.batting_team_id;
  const bowlingTeamId = innings?.bowling_team_id;
  const battingPlayers = battingTeamId === match?.team1_id ? team1Players : team2Players;
  const bowlingPlayers = bowlingTeamId === match?.team1_id ? team1Players : team2Players;

  const striker = battingPlayers.find(p => p.id === settingsData.striker_id);
  const nonStriker = battingPlayers.find(p => p.id === settingsData.non_striker_id);
  const bowler = bowlingPlayers.find(p => p.id === settingsData.bowler_id);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link to="/admin" className="text-zinc-500 hover:text-white flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" /> Exit
          </Link>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-bold tracking-widest uppercase">Live Scoring</span>
          </div>
          <button 
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 text-xs font-bold text-emerald-500 hover:text-emerald-400 transition-colors"
          >
            <Settings className="h-4 w-4" /> Settings
          </button>
        </div>

        {/* Scoreboard for Soccer and Basketball */}
        {match?.sport && match?.sport !== 'cricket' && (
          <div className="p-8 rounded-3xl bg-zinc-900 border border-white/5 relative overflow-hidden mb-8">
            <div className="absolute top-0 right-0 h-40 w-40 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
            <div className="flex items-center justify-between mb-8">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
                {match.sport === 'soccer' ? 'Soccer Match ⚽' : 'Basketball Match 🏀'}
              </span>
              {match.live_stream_url && (
                <a 
                  href={match.live_stream_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs font-bold text-red-500 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20"
                >
                  <Video className="h-3 w-3" /> Live Stream
                </a>
              )}
            </div>
            
            <div className="grid grid-cols-3 items-center text-center gap-4">
              <div className="flex flex-col items-center">
                <div className="h-16 w-16 mb-4 rounded-2xl bg-zinc-800/80 flex items-center justify-center font-black border border-white/5 text-2xl">
                  {match.team1_name?.[0]}
                </div>
                <h2 className="text-xl font-bold text-zinc-100">{match.team1_name}</h2>
                <span className="text-xs text-zinc-500 mt-1 uppercase font-bold">HOME</span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="text-6xl font-black tracking-wider text-white select-none">
                  {genericScores.team1_score} <span className="text-zinc-700 text-4xl">:</span> {genericScores.team2_score}
                </div>
                <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-wider animate-pulse">
                  Live Stream Active
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="h-16 w-16 mb-4 rounded-2xl bg-zinc-800/80 flex items-center justify-center font-black border border-white/5 text-2xl">
                  {match.team2_name?.[0]}
                </div>
                <h2 className="text-xl font-bold text-zinc-100">{match.team2_name}</h2>
                <span className="text-xs text-zinc-500 mt-1 uppercase font-bold">AWAY</span>
              </div>
            </div>
          </div>
        )}

        {/* Cricket Scoreboard & Players */}
        {(!match?.sport || match?.sport === 'cricket') && (
          <>
            {/* Scoreboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="md:col-span-2 p-8 rounded-3xl bg-zinc-900 border border-white/5 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">{match?.batting_team_name || 'Batting Team'}</h2>
                  <div className="flex items-center gap-4">
                    {match?.live_stream_url && (
                      <a 
                        href={match.live_stream_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs font-bold text-red-500 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20"
                      >
                        <Video className="h-3 w-3" /> Live Stream
                      </a>
                    )}
                    <span className="text-sm text-zinc-500">Innings {innings?.innings_number}</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-4">
                  <h1 className="text-7xl font-black tracking-tighter">
                    {innings?.runs || 0}/{innings?.wickets || 0}
                  </h1>
                  <span className="text-2xl text-zinc-500 font-medium">({innings?.overs_bowled?.toFixed(1) || '0.0'})</span>
                </div>
                <div className="mt-8 flex items-center gap-6 text-sm">
                  <div className="flex flex-col">
                    <span className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest">CRR</span>
                    <span className="font-bold">
                      {innings?.overs_bowled > 0 ? (innings.runs / (Math.floor(innings.overs_bowled) + (Math.round((innings.overs_bowled % 1) * 10) / 6))).toFixed(2) : '0.00'}
                    </span>
                  </div>
                  {match?.toss_winner_id && (
                    <div className="flex flex-col border-l border-white/10 pl-6">
                      <span className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest">Toss</span>
                      <span className="text-xs text-zinc-300">
                        {match.toss_winner_id === match.team1_id ? match.team1_name : match.team2_name} won & chose to {match.toss_decision}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-8 rounded-3xl bg-zinc-900 border border-white/5">
                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6">Current Over</h3>
                <div className="flex flex-wrap gap-3">
                  {/* This would ideally come from the balls table */}
                  {[].map((ball, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm border",
                        ball === 'W' ? "bg-red-500/10 border-red-500/20 text-red-500" :
                        "bg-zinc-800 border-white/5 text-zinc-400"
                      )}
                    >
                      {ball}
                    </div>
                  ))}
                  <div className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm border border-dashed border-white/10 text-zinc-600">
                    {innings ? (Math.round((innings.overs_bowled % 1) * 10) + 1) : 1}
                  </div>
                </div>
              </div>
            </div>

            {/* Players */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Batting</h3>
                  <button 
                    onClick={() => { setSelectionType('striker'); setShowPlayerSelection(true); }}
                    className="text-[10px] font-bold text-emerald-500 uppercase"
                  >
                    Change
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="font-bold">{striker?.name || 'Select Batsman'}*</span>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="font-bold">0</span>
                      <span className="text-zinc-500">0b</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-transparent" />
                      <span className="font-medium text-zinc-300">{nonStriker?.name || 'Select Batsman'}</span>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="font-bold">0</span>
                      <span className="text-zinc-500">0b</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Bowling</h3>
                  <button 
                    onClick={() => { setSelectionType('bowler'); setShowPlayerSelection(true); }}
                    className="text-[10px] font-bold text-emerald-500 uppercase"
                  >
                    Change
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="font-bold">{bowler?.name || 'Select Bowler'}*</span>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span className="font-bold">0/0</span>
                    <span className="text-zinc-500">0.0 ov</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Dynamic Sport Controls */}
        <div className="space-y-6">
          {/* Cricket Scoring Buttons */}
          {(!match?.sport || match?.sport === 'cricket') && (
            <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
              {[0, 1, 2, 3, 4, 6].map(runs => (
                <button 
                  key={runs}
                  onClick={() => handleBall(runs)}
                  className="h-16 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-xl font-black hover:bg-zinc-800 active:scale-95 transition-all"
                >
                  {runs}
                </button>
              ))}
              <button 
                onClick={() => handleBall(0, 'wide')}
                className="h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-sm font-bold text-blue-500 hover:bg-blue-500/20 transition-all"
              >
                WD
              </button>
              <button 
                onClick={() => handleBall(0, 'no_ball')}
                className="h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-sm font-bold text-orange-500 hover:bg-orange-500/20 transition-all"
              >
                NB
              </button>
              <button 
                onClick={() => handleBall(0, null, 'out')}
                className="h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-sm font-bold text-red-500 hover:bg-red-500/20 transition-all col-span-2"
              >
                WICKET
              </button>
              <button 
                onClick={() => handleBall(0, 'bye')}
                className="h-16 rounded-2xl bg-zinc-800 border border-white/10 flex items-center justify-center text-sm font-bold text-zinc-400 hover:bg-zinc-700 transition-all"
              >
                BYE
              </button>
              <button 
                onClick={() => handleBall(0, 'leg_bye')}
                className="h-16 rounded-2xl bg-zinc-800 border border-white/10 flex items-center justify-center text-sm font-bold text-zinc-400 hover:bg-zinc-700 transition-all"
              >
                LB
              </button>
              <button 
                onClick={undoLastBall}
                className="h-16 rounded-2xl bg-zinc-800 border border-white/10 flex items-center justify-center text-sm font-bold text-zinc-400 hover:bg-zinc-700 transition-all"
              >
                UNDO
              </button>
            </div>
          )}

          {/* Football / Soccer Scoring Buttons */}
          {match?.sport === 'soccer' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl bg-zinc-900 border border-white/5 space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">{match.team1_name} Actions</h3>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold">Scoring</span>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Select Player</label>
                  <select 
                    value={team1SelectedPlayerId}
                    onChange={e => setTeam1SelectedPlayerId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg bg-black border border-white/5 text-zinc-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="">-- Generic Event (No Specific Player) --</option>
                    {team1Players.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.role || 'Player'})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => {
                      const pl = team1Players.find((p: any) => p.id === parseInt(team1SelectedPlayerId));
                      const plName = pl ? pl.name : prompt("Enter goal scorer name (optional):");
                      const desc = plName ? `⚽ GOAL! ${plName} scores for ${match.team1_name}!` : `⚽ GOAL! ${match.team1_name} scores!`;
                      handleGenericScoreUpdate(1, 1, 'goal', desc, pl?.id ? String(pl.id) : null);
                      setTeam1SelectedPlayerId('');
                    }}
                    className="py-3 rounded-xl bg-emerald-500 text-black font-extrabold text-xs hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/10"
                  >
                    Goal (+1) ⚽
                  </button>
                  <button 
                    onClick={() => {
                      const pl = team1Players.find((p: any) => p.id === parseInt(team1SelectedPlayerId));
                      const plName = pl ? pl.name : prompt("Enter player name (optional):");
                      const desc = plName ? `🟨 Yellow Card shown to ${plName} (${match.team1_name}).` : `🟨 Yellow Card shown to ${match.team1_name}.`;
                      handleGenericScoreUpdate(1, 0, 'card', desc, pl?.id ? String(pl.id) : null);
                      setTeam1SelectedPlayerId('');
                    }}
                    className="py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 font-bold text-xs hover:bg-amber-500/25 transition-all"
                  >
                    Yellow Card 🟨
                  </button>
                  <button 
                    onClick={() => {
                      const pl = team1Players.find((p: any) => p.id === parseInt(team1SelectedPlayerId));
                      const plName = pl ? pl.name : prompt("Enter player name (optional):");
                      const desc = plName ? `🟥 Red Card shown to ${plName} (${match.team1_name})!` : `🟥 Red Card shown to ${match.team1_name}!`;
                      handleGenericScoreUpdate(1, 0, 'card_red', desc, pl?.id ? String(pl.id) : null);
                      setTeam1SelectedPlayerId('');
                    }}
                    className="py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold text-xs hover:bg-red-500/25 transition-all"
                  >
                    Red Card 🟥
                  </button>
                  <button 
                    onClick={() => {
                      const pl = team1Players.find((p: any) => p.id === parseInt(team1SelectedPlayerId));
                      const plName = pl ? pl.name : null;
                      const desc = plName ? `⚠️ Foul committed by ${plName} (${match.team1_name}).` : `⚠️ Foul committed by ${match.team1_name}.`;
                      handleGenericScoreUpdate(1, 0, 'foul', desc, pl?.id ? String(pl.id) : null);
                      setTeam1SelectedPlayerId('');
                    }}
                    className="py-3 rounded-xl bg-zinc-800 border border-white/5 text-zinc-400 text-xs hover:bg-zinc-700 transition-all"
                  >
                    Foul Play ⚠️
                  </button>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-zinc-900 border border-white/5 space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">{match.team2_name} Actions</h3>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold">Scoring</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Select Player</label>
                  <select 
                    value={team2SelectedPlayerId}
                    onChange={e => setTeam2SelectedPlayerId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg bg-black border border-white/5 text-zinc-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="">-- Generic Event (No Specific Player) --</option>
                    {team2Players.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.role || 'Player'})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => {
                      const pl = team2Players.find((p: any) => p.id === parseInt(team2SelectedPlayerId));
                      const plName = pl ? pl.name : prompt("Enter goal scorer name (optional):");
                      const desc = plName ? `⚽ GOAL! ${plName} scores for ${match.team2_name}!` : `⚽ GOAL! ${match.team2_name} scores!`;
                      handleGenericScoreUpdate(2, 1, 'goal', desc, pl?.id ? String(pl.id) : null);
                      setTeam2SelectedPlayerId('');
                    }}
                    className="py-3 rounded-xl bg-emerald-500 text-black font-extrabold text-xs hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/10"
                  >
                    Goal (+1) ⚽
                  </button>
                  <button 
                    onClick={() => {
                      const pl = team2Players.find((p: any) => p.id === parseInt(team2SelectedPlayerId));
                      const plName = pl ? pl.name : prompt("Enter player name (optional):");
                      const desc = plName ? `🟨 Yellow Card shown to ${plName} (${match.team2_name}).` : `🟨 Yellow Card shown to ${match.team2_name}.`;
                      handleGenericScoreUpdate(2, 0, 'card', desc, pl?.id ? String(pl.id) : null);
                      setTeam2SelectedPlayerId('');
                    }}
                    className="py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 font-bold text-xs hover:bg-amber-500/25 transition-all"
                  >
                    Yellow Card 🟨
                  </button>
                  <button 
                    onClick={() => {
                      const pl = team2Players.find((p: any) => p.id === parseInt(team2SelectedPlayerId));
                      const plName = pl ? pl.name : prompt("Enter player name (optional):");
                      const desc = plName ? `🟥 Red Card shown to ${plName} (${match.team2_name})!` : `🟥 Red Card shown to ${match.team2_name}!`;
                      handleGenericScoreUpdate(2, 0, 'card_red', desc, pl?.id ? String(pl.id) : null);
                      setTeam2SelectedPlayerId('');
                    }}
                    className="py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold text-xs hover:bg-red-500/25 transition-all"
                  >
                    Red Card 🟥
                  </button>
                  <button 
                    onClick={() => {
                      const pl = team2Players.find((p: any) => p.id === parseInt(team2SelectedPlayerId));
                      const plName = pl ? pl.name : null;
                      const desc = plName ? `⚠️ Foul committed by ${plName} (${match.team2_name}).` : `⚠️ Foul committed by ${match.team2_name}.`;
                      handleGenericScoreUpdate(2, 0, 'foul', desc, pl?.id ? String(pl.id) : null);
                      setTeam2SelectedPlayerId('');
                    }}
                    className="py-3 rounded-xl bg-zinc-800 border border-white/5 text-zinc-400 text-xs hover:bg-zinc-700 transition-all"
                  >
                    Foul Play ⚠️
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Basketball Scoring Buttons */}
          {match?.sport === 'basketball' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl bg-zinc-900 border border-white/5 space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">{match.team1_name} Scoring</h3>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold">Scoring</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Select Player</label>
                  <select 
                    value={team1SelectedPlayerId}
                    onChange={e => setTeam1SelectedPlayerId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg bg-black border border-white/5 text-zinc-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="">-- Generic Event (No Specific Player) --</option>
                    {team1Players.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.role || 'Player'})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => {
                      const pl = team1Players.find((p: any) => p.id === parseInt(team1SelectedPlayerId));
                      const plName = pl ? pl.name : prompt("Enter player name (optional):");
                      const desc = plName ? `🏀 ${plName} scores 1pt (free-throw) for ${match.team1_name}.` : `Free throw (1pt) won by ${match.team1_name}.`;
                      handleGenericScoreUpdate(1, 1, 'point', desc, pl?.id ? String(pl.id) : null);
                      setTeam1SelectedPlayerId('');
                    }}
                    className="py-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 font-bold text-xs hover:bg-orange-500/25 transition-all text-center"
                  >
                    +1 FT
                  </button>
                  <button 
                    onClick={() => {
                      const pl = team1Players.find((p: any) => p.id === parseInt(team1SelectedPlayerId));
                      const plName = pl ? pl.name : prompt("Enter player name (optional):");
                      const desc = plName ? `🏀 ${plName} scored 2 points for ${match.team1_name}!` : `2-point field goal for ${match.team1_name}!`;
                      handleGenericScoreUpdate(1, 2, 'point', desc, pl?.id ? String(pl.id) : null);
                      setTeam1SelectedPlayerId('');
                    }}
                    className="py-3 rounded-xl bg-orange-550 text-orange-400 border border-orange-500/20 font-bold text-xs hover:bg-orange-500/10 transition-all text-center"
                  >
                    +2 Pts
                  </button>
                  <button 
                    onClick={() => {
                      const pl = team1Players.find((p: any) => p.id === parseInt(team1SelectedPlayerId));
                      const plName = pl ? pl.name : prompt("Enter player name (optional):");
                      const desc = plName ? `🎯 ${plName} drills a clean 3-pointer! 🏀` : `3-point score for ${match.team1_name}!`;
                      handleGenericScoreUpdate(1, 3, 'point', desc, pl?.id ? String(pl.id) : null);
                      setTeam1SelectedPlayerId('');
                    }}
                    className="py-3 rounded-xl bg-emerald-500 text-black font-extrabold text-xs hover:bg-emerald-400 transition-all text-center"
                  >
                    +3 Pts 🎯
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-3">
                  <button 
                    onClick={() => {
                      const pl = team1Players.find((p: any) => p.id === parseInt(team1SelectedPlayerId));
                      const plName = pl ? pl.name : prompt("Player name (optional):");
                      const desc = plName ? `Personal foul logged on ${plName} (${match.team1_name}).` : `Personal foul called on ${match.team1_name}.`;
                      handleGenericScoreUpdate(1, 0, 'foul', desc, pl?.id ? String(pl.id) : null);
                      setTeam1SelectedPlayerId('');
                    }}
                    className="py-2 rounded-lg bg-zinc-800 border border-white/5 text-zinc-400 text-[11px] hover:bg-zinc-700 transition-all"
                  >
                    Foul
                  </button>
                  <button 
                    onClick={() => {
                      const pl = team1Players.find((p: any) => p.id === parseInt(team1SelectedPlayerId));
                      const plName = pl ? pl.name : prompt("Player name (optional):");
                      const desc = plName ? `Defensive Rebound by ${plName} (${match.team1_name}).` : `Rebound by ${match.team1_name}.`;
                      handleGenericScoreUpdate(1, 0, 'rebound', desc, pl?.id ? String(pl.id) : null);
                      setTeam1SelectedPlayerId('');
                    }}
                    className="py-2 rounded-lg bg-zinc-800 border border-white/5 text-zinc-400 text-[11px] hover:bg-zinc-700 transition-all"
                  >
                    Rebound
                  </button>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-zinc-900 border border-white/5 space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">{match.team2_name} Scoring</h3>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold">Scoring</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Select Player</label>
                  <select 
                    value={team2SelectedPlayerId}
                    onChange={e => setTeam2SelectedPlayerId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg bg-black border border-white/5 text-zinc-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="">-- Generic Event (No Specific Player) --</option>
                    {team2Players.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.role || 'Player'})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => {
                      const pl = team2Players.find((p: any) => p.id === parseInt(team2SelectedPlayerId));
                      const plName = pl ? pl.name : prompt("Enter player name (optional):");
                      const desc = plName ? `🏀 ${plName} scores 1pt (free-throw) for ${match.team2_name}.` : `Free throw (1pt) won by ${match.team2_name}.`;
                      handleGenericScoreUpdate(2, 1, 'point', desc, pl?.id ? String(pl.id) : null);
                      setTeam2SelectedPlayerId('');
                    }}
                    className="py-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 font-bold text-xs hover:bg-orange-500/25 transition-all text-center"
                  >
                    +1 FT
                  </button>
                  <button 
                    onClick={() => {
                      const pl = team2Players.find((p: any) => p.id === parseInt(team2SelectedPlayerId));
                      const plName = pl ? pl.name : prompt("Enter player name (optional):");
                      const desc = plName ? `🏀 ${plName} scored 2 points for ${match.team2_name}!` : `2-point field goal for ${match.team2_name}!`;
                      handleGenericScoreUpdate(2, 2, 'point', desc, pl?.id ? String(pl.id) : null);
                      setTeam2SelectedPlayerId('');
                    }}
                    className="py-3 rounded-xl bg-orange-550 text-orange-400 border border-orange-500/20 font-bold text-xs hover:bg-orange-500/10 transition-all text-center"
                  >
                    +2 Pts
                  </button>
                  <button 
                    onClick={() => {
                      const pl = team2Players.find((p: any) => p.id === parseInt(team2SelectedPlayerId));
                      const plName = pl ? pl.name : prompt("Enter player name (optional):");
                      const desc = plName ? `🎯 ${plName} drills a clean 3-pointer! 🏀` : `3-point score for ${match.team2_name}!`;
                      handleGenericScoreUpdate(2, 3, 'point', desc, pl?.id ? String(pl.id) : null);
                      setTeam2SelectedPlayerId('');
                    }}
                    className="py-3 rounded-xl bg-emerald-500 text-black font-extrabold text-xs hover:bg-emerald-400 transition-all text-center"
                  >
                    +3 Pts 🎯
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-3">
                  <button 
                    onClick={() => {
                      const pl = team2Players.find((p: any) => p.id === parseInt(team2SelectedPlayerId));
                      const plName = pl ? pl.name : prompt("Player name (optional):");
                      const desc = plName ? `Personal foul logged on ${plName} (${match.team2_name}).` : `Personal foul called on ${match.team2_name}.`;
                      handleGenericScoreUpdate(2, 0, 'foul', desc, pl?.id ? String(pl.id) : null);
                      setTeam2SelectedPlayerId('');
                    }}
                    className="py-2 rounded-lg bg-zinc-800 border border-white/5 text-zinc-400 text-[11px] hover:bg-zinc-700 transition-all"
                  >
                    Foul
                  </button>
                  <button 
                    onClick={() => {
                      const pl = team2Players.find((p: any) => p.id === parseInt(team2SelectedPlayerId));
                      const plName = pl ? pl.name : prompt("Player name (optional):");
                      const desc = plName ? `Defensive Rebound by ${plName} (${match.team2_name}).` : `Rebound by ${match.team2_name}.`;
                      handleGenericScoreUpdate(2, 0, 'rebound', desc, pl?.id ? String(pl.id) : null);
                      setTeam2SelectedPlayerId('');
                    }}
                    className="py-2 rounded-lg bg-zinc-800 border border-white/5 text-zinc-400 text-[11px] hover:bg-zinc-700 transition-all"
                  >
                    Rebound
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Commentary Input */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-white/5 space-y-4">
             <div className="flex items-center gap-2 text-zinc-500 mb-2">
               <MessageSquare className="h-4 w-4" />
               <span className="text-xs font-bold uppercase tracking-widest">Live Commentary</span>
             </div>
             <div className="flex gap-3">
               <input 
                 type="text" 
                 placeholder="Enter live commentary..."
                 className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                 value={newCommentary}
                 onChange={e => setNewCommentary(e.target.value)}
                 onKeyDown={e => e.key === 'Enter' && addQuickCommentary()}
               />
               <button 
                 onClick={addQuickCommentary}
                 disabled={!newCommentary.trim()}
                 className="bg-emerald-500 text-black font-bold px-6 rounded-xl hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 transition-all"
               >
                 Post
               </button>
             </div>
          </div>

          {/* Commentary/Events List */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest px-2">Recent Timeline</h3>
            <div className="space-y-2">
              {events.slice(0, 5).map((event, index) => (
                <div key={event.id || `${event.timestamp || ''}-${index}`} className="p-4 rounded-2xl bg-zinc-900 border border-white/5 flex items-start gap-4">
                  <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                    event.event_type === 'goal' || event.event_type === 'point' ? "bg-emerald-500/10 text-emerald-500" :
                    event.event_type === 'wicket' || event.event_type === 'out' ? "bg-red-500/10 text-red-500" :
                    "bg-zinc-800 text-zinc-500"
                  )}>
                    {event.event_type === 'commentary' ? <MessageSquare className="h-4 w-4" /> : <Target className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-zinc-200">{event.description}</p>
                    <p className="text-[10px] text-zinc-600 uppercase font-bold mt-1">
                      {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              {events.length === 0 && (
                <div className="text-center py-8 text-zinc-600 text-sm italic">No events recorded yet</div>
              )}
            </div>
          </div>
        </div>

        {/* Settings Modal ... existing code ... */}
        <AnimatePresence>
          {showSettings && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
              >
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Settings className="h-5 w-5 text-emerald-500" />
                    Match Settings
                  </h2>
                  <button onClick={() => setShowSettings(false)} className="text-zinc-500 hover:text-white">
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                  {/* Toss Section */}
                  {(!match?.sport || match?.sport === 'cricket') && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Toss Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs text-zinc-400">Toss Winner</label>
                          <select 
                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                            value={settingsData.toss_winner_id || ''}
                            onChange={e => setSettingsData({...settingsData, toss_winner_id: parseInt(e.target.value) as any})}
                          >
                            <option value="">Select Team</option>
                            <option value={match?.team1_id}>{match?.team1_name}</option>
                            <option value={match?.team2_id}>{match?.team2_name}</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs text-zinc-400">Decision</label>
                          <div className="flex bg-black rounded-xl p-1 border border-white/10">
                            <button 
                              onClick={() => setSettingsData({...settingsData, toss_decision: 'bat'})}
                              className={cn(
                                "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                                settingsData.toss_decision === 'bat' ? "bg-emerald-500 text-white" : "text-zinc-500"
                              )}
                            >
                              BAT
                            </button>
                            <button 
                              onClick={() => setSettingsData({...settingsData, toss_decision: 'bowl'})}
                              className={cn(
                                "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                                settingsData.toss_decision === 'bowl' ? "bg-emerald-500 text-white" : "text-zinc-500"
                              )}
                            >
                              BOWL
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Live Stream Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Live Stream</h3>
                    <div className="space-y-2">
                      <label className="text-xs text-zinc-400">Stream URL (YouTube/Facebook/Twitch)</label>
                      <div className="relative">
                        <Video className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        <input 
                          type="url"
                          placeholder="https://youtube.com/live/..."
                          className="w-full bg-black border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                          value={settingsData.live_stream_url}
                          onChange={e => setSettingsData({...settingsData, live_stream_url: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Player Selection Section */}
                  {(!match?.sport || match?.sport === 'cricket') && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Current Players</h3>
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs text-zinc-400">Striker</label>
                          <select 
                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                            value={settingsData.striker_id || ''}
                            onChange={e => setSettingsData({...settingsData, striker_id: parseInt(e.target.value) as any})}
                          >
                            <option value="">Select Striker</option>
                            {battingPlayers.map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs text-zinc-400">Non-Striker</label>
                          <select 
                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                            value={settingsData.non_striker_id || ''}
                            onChange={e => setSettingsData({...settingsData, non_striker_id: parseInt(e.target.value) as any})}
                          >
                            <option value="">Select Non-Striker</option>
                            {battingPlayers.map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs text-zinc-400">Current Bowler</label>
                          <select 
                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                            value={settingsData.bowler_id || ''}
                            onChange={e => setSettingsData({...settingsData, bowler_id: parseInt(e.target.value) as any})}
                          >
                            <option value="">Select Bowler</option>
                            {bowlingPlayers.map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6 bg-zinc-800/50 border-t border-white/5 space-y-3">
                  <button 
                    onClick={() => saveSettings()}
                    className="w-full bg-emerald-500 text-white font-bold py-4 rounded-xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
                  >
                    Save & Update Match
                  </button>
                  <button 
                    onClick={endMatch}
                    className="w-full bg-red-500/10 border border-red-500/20 text-red-500 font-bold py-4 rounded-xl hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <XCircle className="h-4 w-4" /> End Match
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        
        {/* Event Modal */}
        <AnimatePresence>
          {showEventModal && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
              >
                <form onSubmit={addEvent}>
                  <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center gap-2 capitalize">
                      Add {eventFormData.event_type}
                    </h2>
                    <button type="button" onClick={() => setShowEventModal(false)} className="text-zinc-500 hover:text-white">
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs text-zinc-400">Team</label>
                      <select 
                        required
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        value={eventFormData.team_id}
                        onChange={e => setEventFormData({...eventFormData, team_id: e.target.value})}
                      >
                        <option value="">Select Team</option>
                        <option value={match?.team1_id}>{match?.team1_name}</option>
                        <option value={match?.team2_id}>{match?.team2_name}</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs text-zinc-400">Player (Optional)</label>
                      <select 
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        value={eventFormData.player_id}
                        onChange={e => setEventFormData({...eventFormData, player_id: e.target.value})}
                      >
                        <option value="">Select Player</option>
                        {(eventFormData.team_id === match?.team1_id ? team1Players : team2Players).map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs text-zinc-400">Description</label>
                      <input 
                        required
                        type="text" 
                        placeholder={eventFormData.event_type === 'goal' ? "Spectacular overhead kick!" : "Explain the event..."}
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        value={eventFormData.description}
                        onChange={e => setEventFormData({...eventFormData, description: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="p-6 border-t border-white/5 flex gap-3">
                    <button 
                      type="button"
                      onClick={() => setShowEventModal(false)}
                      className="flex-1 py-3 text-sm font-bold text-zinc-500 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 py-3 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-all"
                    >
                      Add Event
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Quick Player Selection Modal */}
        <AnimatePresence>
          {showPlayerSelection && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
              >
                <div className="p-6 border-b border-white/5">
                  <h2 className="text-xl font-bold text-center">
                    Select {selectionType === 'bowler' ? 'New Bowler' : 'New Batsman'}
                  </h2>
                </div>
                <div className="p-4 grid grid-cols-1 gap-2 max-h-[60vh] overflow-y-auto">
                  {(selectionType === 'bowler' ? bowlingPlayers : battingPlayers).map(player => (
                    <button 
                      key={player.id}
                      onClick={() => {
                        const newData = { ...settingsData };
                        if (selectionType === 'striker') newData.striker_id = player.id;
                        if (selectionType === 'non_striker') newData.non_striker_id = player.id;
                        if (selectionType === 'bowler') newData.bowler_id = player.id;
                        setSettingsData(newData);
                        saveSettings(newData);
                      }}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-black border border-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-left group"
                    >
                      <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-emerald-500">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold">{player.name}</p>
                        <p className="text-xs text-zinc-500 uppercase">{player.role}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="p-4 border-t border-white/5">
                  <button 
                    onClick={() => setShowPlayerSelection(false)}
                    className="w-full py-3 text-sm font-bold text-zinc-500 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
