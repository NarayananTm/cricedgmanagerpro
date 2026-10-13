import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  Users, 
  Calendar, 
  Settings, 
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Play,
  Gavel,
  Trash2,
  Receipt,
  DollarSign,
  Power,
  PowerOff,
  Image as ImageIcon,
  ExternalLink,
  MessageSquare,
  Send,
  User,
  Sparkles,
  BarChart3,
  BookOpen,
  Edit2,
  Camera,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { Tournament, Team, Match, Player } from '../types';
import { cn } from '../lib/utils';

export const TournamentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'teams' | 'matches' | 'stats' | 'settings' | 'expenses' | 'players' | 'sponsors' | 'chat' | 'rules' | 'gallery'>('teams');
  const [stats, setStats] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);

  // Tournament Rules states
  const [tournamentRules, setTournamentRules] = useState('');
  const [isEditingRules, setIsEditingRules] = useState(false);
  const [editedRules, setEditedRules] = useState('');

  // Gallery states
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [galleryCaption, setGalleryCaption] = useState('');
  const [galleryUploadUrl, setGalleryUploadUrl] = useState('');
  const [isGeneratingGalleryImage, setIsGeneratingGalleryImage] = useState(false);

  // Player comparison states
  const [comparePlayerId1, setComparePlayerId1] = useState<string | number>('');
  const [comparePlayerId2, setComparePlayerId2] = useState<string | number>('');

  // Team Chat states
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const activeTabRef = useRef(activeTab);
  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);
  const [loadingChat, setLoadingChat] = useState(false);
  const [chatMessageText, setChatMessageText] = useState('');
  const [chatSenderName, setChatSenderName] = useState(() => {
    const saved = localStorage.getItem('user_data');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        return u.name || 'Manager';
      } catch (e) {}
    }
    return 'Manager';
  });
  const [chatTeamName, setChatTeamName] = useState('');
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newExpense, setNewExpense] = useState({ description: '', amount: 0, category: 'Other', date: new Date().toISOString().slice(0, 10) });
  const [editingExpense, setEditingExpense] = useState<any>(null);

  const exportExpensesCSV = () => {
    if (!expenses || expenses.length === 0) {
      alert("No expenses recorded to export.");
      return;
    }
    
    // Header
    const headers = ['ID', 'Description', 'Category', 'Amount (INR)', 'Date'];
    
    // Rows
    const rows = expenses.map(e => [
      e.id, 
      `"${(e.description || '').replace(/"/g, '""')}"`, 
      `"${(e.category || '').replace(/"/g, '""')}"`, 
      e.amount, 
      e.date ? new Date(e.date).toLocaleDateString() : ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `tournament_${tournament?.name || 'expenses'}_expenses.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportStatsCSV = () => {
    if (!stats || stats.length === 0) {
      alert("No player statistics available to export.");
      return;
    }
    
    let headers: string[] = [];
    let rows: any[][] = [];
    
    const isSoccer = tournament?.sport === 'soccer';
    const isBasketball = tournament?.sport === 'basketball';
    
    if (isSoccer) {
      headers = ['Rank', 'Player Name', 'Team Name', 'Goals', 'Yellow Cards', 'Red Cards', 'Fouls', 'MVP Points'];
      rows = stats.map((p, index) => [
        index + 1,
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.team_name.replace(/"/g, '""')}"`,
        p.goals || 0,
        p.yellow_cards || 0,
        p.red_cards || 0,
        p.fouls || 0,
        p.mvp_points || 0
      ]);
    } else if (isBasketball) {
      headers = ['Rank', 'Player Name', 'Team Name', 'Points', 'Fouls', 'MVP Points'];
      rows = stats.map((p, index) => [
        index + 1,
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.team_name.replace(/"/g, '""')}"`,
        p.basketball_points || 0,
        p.fouls || 0,
        p.mvp_points || 0
      ]);
    } else {
      // Cricket / Default
      headers = ['Rank', 'Player Name', 'Team Name', 'Runs', 'Wickets', 'Strike Rate', 'Economy', 'Sixes', 'Fours', 'MVP Points'];
      rows = stats.map((p, index) => [
        index + 1,
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.team_name.replace(/"/g, '""')}"`,
        p.batting?.runs || 0,
        p.bowling?.wickets || 0,
        p.batting?.sr || '0.0',
        p.bowling?.econ || '0.00',
        p.batting?.sixes || 0,
        p.batting?.fours || 0,
        p.mvp_points || 0
      ]);
    }
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `tournament_${tournament?.name || 'statistics'}_player_stats.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [sponsors, setSponsors] = useState<any[]>([]);
  const [loadingSponsors, setLoadingSponsors] = useState(false);
  const [showAddSponsor, setShowAddSponsor] = useState(false);
  const [newSponsor, setNewSponsor] = useState({ name: '', website_url: '', banner_url: '' });

  const fetchSponsors = async () => {
    setLoadingSponsors(true);
    try {
      const res = await fetch(`/api/tournaments/${id}/sponsors`);
      if (!res.ok) throw new Error('Failed to fetch sponsors');
      const data = await res.json();
      setSponsors(data);
    } catch (error) {
      console.error('Error fetching sponsors:', error);
    } finally {
      setLoadingSponsors(false);
    }
  };

  const addSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/tournaments/${id}/sponsors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSponsor)
      });
      if (!res.ok) throw new Error('Failed to add sponsor');
      setShowAddSponsor(false);
      setNewSponsor({ name: '', website_url: '', banner_url: '' });
      fetchSponsors();
    } catch (error) {
      console.error('Error adding sponsor:', error);
    }
  };

  const deleteSponsor = async (sponsorId: number) => {
    if (!window.confirm('Are you sure you want to delete this sponsor?')) return;
    try {
      const res = await fetch(`/api/sponsors/${sponsorId}`, { method: 'DELETE' });
      if (res.ok) fetchSponsors();
    } catch (error) {
      console.error('Error deleting sponsor:', error);
    }
  };

  const fetchExpenses = async () => {
    setLoadingExpenses(true);
    try {
      const res = await fetch(`/api/tournaments/${id}/expenses`);
      if (!res.ok) throw new Error('Failed to fetch expenses');
      const data = await res.json();
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoadingExpenses(false);
    }
  };

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch(`/api/tournaments/${id}/stats`);
      if (!res.ok) throw new Error('Failed to fetch stats');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchChatMessages = async () => {
    setLoadingChat(true);
    try {
      const res = await fetch(`/api/tournaments/${id}/chat`);
      if (res.ok) {
        const data = await res.json();
        setChatMessages(data);
      }
    } catch (e) {
      console.error('Error fetching chat:', e);
    } finally {
      setLoadingChat(false);
    }
  };

  const sendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatMessageText.trim()) return;
    try {
      const res = await fetch(`/api/tournaments/${id}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sender_name: chatSenderName || 'Manager',
          team_name: chatTeamName || 'Tournament Organizer',
          message: chatMessageText
        })
      });
      if (res.ok) {
        const newMessage = await res.json();
        setChatMessages(prev => {
          if (prev.some(m => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });
        setChatMessageText('');
      }
    } catch (error) {
      console.error('Error sending chat message:', error);
    }
  };

  // Real-time chat listener
  useEffect(() => {
    let socket: WebSocket | null = null;
    let isConnected = false;

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      socket = new WebSocket(`${protocol}//${window.location.host}`);

      socket.onopen = () => {
        isConnected = true;
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'TEAM_CHAT_MESSAGE' && parseInt(data.tournament_id) === parseInt(id || '')) {
            setChatMessages(prev => {
              if (prev.some(m => m.id === data.message.id)) return prev;
              if (activeTabRef.current !== 'chat') {
                setUnreadChatCount(c => c + 1);
              }
              return [...prev, data.message];
            });
          }
        } catch (error) {
          console.error('WebSocket parsing error:', error);
        }
      };

      socket.onerror = () => {
        isConnected = false;
      };

      socket.onclose = () => {
        isConnected = false;
      };
    } catch (e) {
      isConnected = false;
    }

    const pollInterval = setInterval(() => {
      if (!isConnected && activeTabRef.current === 'chat') {
        fetchChatMessages();
      }
    }, 5000);

    return () => {
      clearInterval(pollInterval);
      if (socket) {
        try { socket.close(); } catch (e) {}
      }
    };
  }, [id]);

  const fetchGalleryImages = async () => {
    setLoadingGallery(true);
    try {
      const res = await fetch(`/api/tournaments/${id}/gallery`);
      if (res.ok) {
        const data = await res.json();
        setGalleryImages(data);
      }
    } catch (e) {
      console.error('Error fetching gallery images:', e);
    } finally {
      setLoadingGallery(false);
    }
  };

  const saveTournamentRules = async () => {
    try {
      const res = await fetch(`/api/tournaments/${id}/rules`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules: editedRules })
      });
      if (res.ok) {
        setTournamentRules(editedRules);
        setIsEditingRules(false);
        setTournament(prev => prev ? { ...prev, rules: editedRules } : null);
      }
    } catch (e) {
      console.error('Error saving rules:', e);
    }
  };

  const uploadGalleryImage = async (url: string, captionText: string) => {
    if (!url) return;
    try {
      const res = await fetch(`/api/tournaments/${id}/gallery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: url, caption: captionText })
      });
      if (res.ok) {
        const newImg = await res.json();
        setGalleryImages(prev => [newImg, ...prev]);
        setGalleryCaption('');
        setGalleryUploadUrl('');
      }
    } catch (e) {
      console.error('Error uploading to gallery:', e);
    }
  };

  useEffect(() => {
    if (activeTab === 'stats') {
      fetchStats();
    }
    if (activeTab === 'expenses') {
      fetchExpenses();
    }
    if (activeTab === 'sponsors') {
      fetchSponsors();
    }
    if (activeTab === 'chat') {
      fetchChatMessages();
      setUnreadChatCount(0);
    }
    if (activeTab === 'gallery') {
      fetchGalleryImages();
    }
  }, [activeTab, id]);

  const fetchTournament = async () => {
    try {
      const res = await fetch(`/api/tournaments/${id}`);
      if (!res.ok) throw new Error('Failed to fetch tournament');
      const data = await res.json();
      setTournament(data);
      const fetchedRules = data.rules || '';
      setTournamentRules(fetchedRules);
      setEditedRules(fetchedRules);
      
      // Default to right role for sport
      const defaultRole = data.sport === 'soccer' ? 'forward' : data.sport === 'basketball' ? 'point_guard' : 'batsman';
      setNewPlayer(prev => ({ ...prev, role: defaultRole }));
    } catch (error) {
      console.error('Error fetching tournament:', error);
    }
  };

  useEffect(() => {
    fetchTournament();
  }, [id]);

  const approveTeam = async (teamId: number) => {
    try {
      const res = await fetch(`/api/teams/${teamId}/approve`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to approve team');
      fetchTournament();
    } catch (error) {
      console.error('Error approving team:', error);
    }
  };

  const generateFixtures = async () => {
    try {
      const res = await fetch(`/api/tournaments/${id}/generate-fixtures`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to generate fixtures');
      fetchTournament();
    } catch (error) {
      console.error('Error generating fixtures:', error);
    }
  };

  const deleteTournament = async () => {
    if (!window.confirm('Are you sure you want to delete this tournament? This will delete all teams, players, and matches associated with it.')) return;
    try {
      const res = await fetch(`/api/tournaments/${id}`, { method: 'DELETE' });
      if (res.ok) navigate('/admin');
    } catch (error) {
      console.error('Error deleting tournament:', error);
    }
  };

  const toggleTournamentStatus = async () => {
    const newStatus = tournament.status === 'active' ? 'deactivated' : 'active';
    try {
      const res = await fetch(`/api/tournaments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...tournament, status: newStatus })
      });
      if (res.ok) {
        fetchTournament();
      }
    } catch (error) {
      console.error('Error toggling tournament status:', error);
    }
  };

  const deleteTeam = async (teamId: number) => {
    if (!window.confirm('Are you sure you want to delete this team?')) return;
    try {
      const res = await fetch(`/api/teams/${teamId}`, { method: 'DELETE' });
      if (res.ok) fetchTournament();
    } catch (error) {
      console.error('Error deleting team:', error);
    }
  };

  const deletePlayer = async (playerId: number) => {
    if (!window.confirm('Are you sure you want to delete this player?')) return;
    try {
      const res = await fetch(`/api/players/${playerId}`, { method: 'DELETE' });
      if (res.ok) fetchTournament();
    } catch (error) {
      console.error('Error deleting player:', error);
    }
  };

  const [showAddTeam, setShowAddTeam] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: '', manager_name: '', logo_url: '' });
  const [showAddPlayer, setShowAddPlayer] = useState<number | null>(null);
  const [newPlayer, setNewPlayer] = useState({ 
    name: '', 
    age: 20, 
    role: 'batsman' as any, 
    base_price: 100000,
    image_url: '',
    phone: '',
    sport: 'cricket'
  });

  const [editingTeam, setEditingTeam] = useState<any>(null);
  const [editingPlayer, setEditingPlayer] = useState<any>(null);
  const [editingMatch, setEditingMatch] = useState<any>(null);
  const [isEditingTournament, setIsEditingTournament] = useState(false);
  const [editTournamentData, setEditTournamentData] = useState<any>(null);

  const [showManualFixture, setShowManualFixture] = useState(false);
  const [manualMatch, setManualMatch] = useState({
    team1_id: '',
    team2_id: '',
    match_date: new Date().toISOString().slice(0, 16),
    venue: 'Main Ground'
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'player' | 'team' | 'editPlayer' | 'editTeam' | 'sponsor') => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.includes('jpeg') && !file.type.includes('jpg')) {
        alert('Please upload a JPG image.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (type === 'editPlayer') {
          setEditingPlayer((prev: any) => ({ ...prev, image_url: result }));
        } else if (type === 'player') {
          setNewPlayer(prev => ({ ...prev, image_url: result }));
        } else if (type === 'team') {
          setNewTeam(prev => ({ ...prev, logo_url: result }));
        } else if (type === 'editTeam') {
          setEditingTeam((prev: any) => ({ ...prev, logo_url: result }));
        } else if (type === 'sponsor') {
          setNewSponsor(prev => ({ ...prev, banner_url: result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const updateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/tournaments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editTournamentData)
      });
      if (!res.ok) throw new Error('Failed to update tournament');
      setIsEditingTournament(false);
      fetchTournament();
    } catch (error) {
      console.error('Error updating tournament:', error);
    }
  };

  const updateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/teams/${editingTeam.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTeam)
      });
      if (!res.ok) throw new Error('Failed to update team');
      setEditingTeam(null);
      fetchTournament();
    } catch (error) {
      console.error('Error updating team:', error);
    }
  };

  const updatePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/players/${editingPlayer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPlayer)
      });
      if (!res.ok) throw new Error('Failed to update player');
      setEditingPlayer(null);
      fetchTournament();
    } catch (error) {
      console.error('Error updating player:', error);
    }
  };

  const updateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/matches/${editingMatch.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingMatch)
      });
      if (!res.ok) throw new Error('Failed to update match');
      setEditingMatch(null);
      fetchTournament();
    } catch (error) {
      console.error('Error updating match:', error);
    }
  };

  const deleteMatch = async (matchId: number) => {
    if (!window.confirm('Are you sure you want to delete this match? This will delete all scores and innings data for this match.')) return;
    try {
      const res = await fetch(`/api/matches/${matchId}`, { method: 'DELETE' });
      if (res.ok) fetchTournament();
    } catch (error) {
      console.error('Error deleting match:', error);
    }
  };

  const addManualMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualMatch.team1_id || !manualMatch.team2_id) {
      alert("Please select both Team 1 and Team 2.");
      return;
    }
    if (String(manualMatch.team1_id) === String(manualMatch.team2_id)) {
      alert("Team 1 and Team 2 cannot be the same.");
      return;
    }

    try {
      const res = await fetch(`/api/tournaments/${id}/matches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          team1_id: parseInt(manualMatch.team1_id),
          team2_id: parseInt(manualMatch.team2_id),
          match_date: manualMatch.match_date,
          venue: manualMatch.venue
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create match");
      }

      setShowManualFixture(false);
      setManualMatch({
        team1_id: '',
        team2_id: '',
        match_date: new Date().toISOString().slice(0, 16),
        venue: 'Main Ground'
      });
      fetchTournament();
    } catch (error: any) {
      console.error("Error adding manual match:", error);
      alert(error.message);
    }
  };

  const addExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/tournaments/${id}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExpense)
      });
      if (!res.ok) throw new Error('Failed to add expense');
      setShowAddExpense(false);
      setNewExpense({ description: '', amount: 0, category: 'other', date: new Date().toISOString().slice(0, 10) });
      fetchExpenses();
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const updateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/expenses/${editingExpense.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingExpense)
      });
      if (!res.ok) throw new Error('Failed to update expense');
      setEditingExpense(null);
      fetchExpenses();
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  const deleteExpense = async (expenseId: number) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      const res = await fetch(`/api/expenses/${expenseId}`, { method: 'DELETE' });
      if (res.ok) fetchExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const addTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/tournaments/${id}/teams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTeam)
      });
      if (!res.ok) throw new Error('Failed to add team');
      setNewTeam({ name: '', manager_name: '' });
      setShowAddTeam(false);
      fetchTournament();
    } catch (error) {
      console.error('Error adding team:', error);
    }
  };

  const addPlayer = async (e: React.FormEvent, teamId: number | null) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/teams/${teamId || 0}/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newPlayer, tournament_id: id })
      });
      if (!res.ok) throw new Error('Failed to add player');
      const defaultRole = tournament?.sport === 'soccer' ? 'forward' : tournament?.sport === 'basketball' ? 'point_guard' : 'batsman';
      setNewPlayer({ name: '', age: 20, role: defaultRole, base_price: 100000, image_url: '', phone: '', sport: tournament?.sport || 'cricket' });
      setShowAddPlayer(null);
      fetchTournament();
    } catch (error) {
      console.error('Error adding player:', error);
    }
  };

  if (!tournament) return <div className="p-8 text-center">Loading...</div>;

  const startMatch = async (matchId: number) => {
    try {
      const res = await fetch(`/api/matches/${matchId}/start`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to start match');
      fetchTournament();
    } catch (error) {
      console.error('Error starting match:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <Link to="/admin" className="text-sm text-zinc-500 hover:text-white mb-8 inline-block">← Back to Dashboard</Link>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold uppercase tracking-widest">
                {tournament.status}
              </span>
              <span className="text-zinc-500 text-sm">• {tournament.format}</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight">{tournament.name}</h1>
          </div>
          <div className="flex gap-3">
            <Link 
              to={`/tournament/${id}`}
              className="px-4 py-2 rounded-xl bg-zinc-900 border border-white/10 text-zinc-400 text-sm font-medium hover:text-white transition-all flex items-center gap-2"
            >
              View Public Page
            </Link>
            {tournament.is_auction_enabled === 1 && (
              <Link 
                to={`/admin/auction/${id}`}
                className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-bold hover:bg-emerald-500/20 transition-all flex items-center gap-2"
              >
                <Gavel className="h-4 w-4" /> Open Auction
              </Link>
            )}
            <button 
              onClick={() => setActiveTab('settings')}
              className="px-4 py-2 rounded-xl bg-zinc-900 border border-white/10 text-sm font-medium hover:bg-zinc-800 transition-all"
            >
              Edit Details
            </button>
            <button className="px-4 py-2 rounded-xl bg-emerald-500 text-sm font-bold hover:bg-emerald-400 transition-all">
              Activate Tournament
            </button>
          </div>
        </div>

        <div className="flex gap-8 border-b border-white/5 mb-8 overflow-x-auto no-scrollbar">
          {(() => {
            const allTabs = ['teams', 'matches', 'players', 'stats', 'expenses', 'sponsors', 'chat', 'rules', 'gallery', 'settings'] as const;
            let enabledTabs = [...allTabs];
            if (tournament?.sport_options) {
              try {
                const parsed = typeof tournament.sport_options === 'string' 
                  ? JSON.parse(tournament.sport_options) 
                  : tournament.sport_options;
                if (parsed && parsed.modules) {
                  enabledTabs = allTabs.filter(tab => {
                    if (tab === 'settings') return true;
                    const modName = tab === 'gallery' ? 'gallery' : tab;
                    return parsed.modules[modName] !== false;
                  });
                }
              } catch (e) {
                console.error("Error parsing sport options inside tab filter:", e);
              }
            }
            return enabledTabs;
          })().map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "pb-4 text-sm font-medium transition-all relative whitespace-nowrap",
                activeTab === tab ? "text-white" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {tab === 'stats' ? 'Statistics' : 
               tab === 'chat' ? (
                 <span className="inline-flex items-center gap-1.5">
                   Team Chat
                   {unreadChatCount > 0 && (
                     <span className="flex h-5 min-w-5 px-1.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white animate-pulse">
                       {unreadChatCount}
                     </span>
                   )}
                 </span>
               ) : 
               tab === 'rules' ? 'Tournament Rules' : 
               tab === 'gallery' ? 'Venue & Media' : 
               tab.charAt(0).toUpperCase() + tab.slice(1)}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
              )}
            </button>
          ))}
        </div>

        {activeTab === 'teams' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Registered Teams ({tournament.teams?.length || 0}/{tournament.teams_count})</h2>
              <div className="flex gap-3">
                {tournament.is_auction_enabled === 1 && (
                  <button 
                    onClick={() => setShowAddPlayer(showAddPlayer === 0 ? null : 0)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 text-zinc-400 text-sm font-bold hover:text-white transition-all border border-white/5"
                  >
                    <Plus className="h-4 w-4" /> Auction Pool
                  </button>
                )}
                <button 
                  onClick={() => setShowAddTeam(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 text-sm font-bold hover:bg-emerald-500/20 transition-all border border-emerald-500/20"
                >
                  <Plus className="h-4 w-4" /> Add Team
                </button>
              </div>
            </div>

            {showAddPlayer === 0 && (
              <div className="p-8 rounded-3xl bg-zinc-900 border border-emerald-500/20">
                <h3 className="text-lg font-bold mb-6">Add Player to Auction Pool</h3>
                <form onSubmit={(e) => addPlayer(e, null)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input 
                      required
                      placeholder="Player Name"
                      className="bg-black border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      value={newPlayer.name}
                      onChange={e => setNewPlayer({...newPlayer, name: e.target.value})}
                    />
                    <input 
                      required
                      type="number"
                      placeholder="Age"
                      className="bg-black border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      value={newPlayer.age}
                      onChange={e => setNewPlayer({...newPlayer, age: parseInt(e.target.value) || 0})}
                    />
                    <select 
                      className="bg-black border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      value={newPlayer.role}
                      onChange={e => setNewPlayer({...newPlayer, role: e.target.value as any})}
                    >
                      {tournament?.sport === 'soccer' ? (
                        <>
                          <option value="forward">Forward</option>
                          <option value="midfielder">Midfielder</option>
                          <option value="defender">Defender</option>
                          <option value="goalkeeper">Goalkeeper</option>
                        </>
                      ) : tournament?.sport === 'basketball' ? (
                        <>
                          <option value="point_guard">Point Guard</option>
                          <option value="shooting_guard">Shooting Guard</option>
                          <option value="small_forward">Small Forward</option>
                          <option value="power_forward">Power Forward</option>
                          <option value="center">Center</option>
                        </>
                      ) : (
                        <>
                          <option value="batsman">Batsman</option>
                          <option value="bowler">Bowler</option>
                          <option value="all_rounder">All-rounder</option>
                          <option value="wk">Wicket-keeper</option>
                        </>
                      )}
                    </select>
                    <input 
                      required
                      type="number"
                      placeholder="Base Price (₹)"
                      className="bg-black border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      value={newPlayer.base_price}
                      onChange={e => setNewPlayer({...newPlayer, base_price: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Player Image (JPG)</label>
                    <div className="flex items-center gap-4">
                      {newPlayer.image_url && (
                        <img src={newPlayer.image_url} alt="Preview" className="h-12 w-12 rounded-full object-cover border-2 border-emerald-500" />
                      )}
                      <input 
                        type="file" 
                        accept=".jpg,.jpeg"
                        onChange={(e) => handleImageChange(e, 'player')}
                        className="text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-500/10 file:text-emerald-500 hover:file:bg-emerald-500/20"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" className="bg-emerald-500 text-black px-6 py-2 rounded-xl text-sm font-bold">Add to Pool</button>
                    <button type="button" onClick={() => setShowAddPlayer(null)} className="text-zinc-500 text-sm">Cancel</button>
                  </div>
                </form>
              </div>
            )}

            {showAddTeam && (
              <form onSubmit={addTeam} className="p-6 rounded-2xl bg-zinc-900 border border-emerald-500/20 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    required
                    placeholder="Team Name"
                    className="bg-black border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    value={newTeam.name}
                    onChange={e => setNewTeam({...newTeam, name: e.target.value})}
                  />
                  <input 
                    required
                    placeholder="Manager Name"
                    className="bg-black border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    value={newTeam.manager_name}
                    onChange={e => setNewTeam({...newTeam, manager_name: e.target.value})}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Team Logo (JPG)</label>
                  <div className="flex items-center gap-4">
                    {newTeam.logo_url && (
                      <img src={newTeam.logo_url} alt="Logo Preview" className="h-12 w-12 rounded-xl object-cover border-2 border-emerald-500" />
                    )}
                    <input 
                      type="file" 
                      accept=".jpg,.jpeg"
                      onChange={(e) => handleImageChange(e, 'team')}
                      className="text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-500/10 file:text-emerald-500 hover:file:bg-emerald-500/20"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-bold">Save Team</button>
                  <button type="button" onClick={() => setShowAddTeam(false)} className="text-zinc-500 text-sm">Cancel</button>
                </div>
              </form>
            )}

            {editingTeam && (
              <form onSubmit={updateTeam} className="p-6 rounded-2xl bg-zinc-900 border border-blue-500/20 space-y-4">
                <h3 className="text-lg font-bold">Edit Team: {editingTeam.name}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    required
                    placeholder="Team Name"
                    className="bg-black border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    value={editingTeam.name}
                    onChange={e => setEditingTeam({...editingTeam, name: e.target.value})}
                  />
                  <input 
                    required
                    placeholder="Manager Name"
                    className="bg-black border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    value={editingTeam.manager_name}
                    onChange={e => setEditingTeam({...editingTeam, manager_name: e.target.value})}
                  />
                  <select 
                    className="bg-black border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    value={editingTeam.status}
                    onChange={e => setEditingTeam({...editingTeam, status: e.target.value})}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <input 
                    required
                    type="number"
                    placeholder="Remaining Budget"
                    className="bg-black border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    value={editingTeam.remaining_budget}
                    onChange={e => setEditingTeam({...editingTeam, remaining_budget: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Team Logo (JPG)</label>
                  <div className="flex items-center gap-4">
                    {editingTeam.logo_url && (
                      <img src={editingTeam.logo_url} alt="Logo Preview" className="h-12 w-12 rounded-xl object-cover border-2 border-emerald-500" />
                    )}
                    <input 
                      type="file" 
                      accept=".jpg,.jpeg"
                      onChange={(e) => handleImageChange(e, 'editTeam')}
                      className="text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-500/10 file:text-emerald-500 hover:file:bg-emerald-500/20"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold">Update Team</button>
                  <button type="button" onClick={() => setEditingTeam(null)} className="text-zinc-500 text-sm">Cancel</button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tournament.teams?.map((team: Team) => (
                <div key={team.id} className="flex flex-col gap-4 p-6 rounded-2xl bg-zinc-900/30 border border-white/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-zinc-800 flex items-center justify-center font-bold overflow-hidden border border-white/10">
                        {team.logo_url ? (
                          <img src={team.logo_url} alt={team.name} className="h-full w-full object-cover" />
                        ) : (
                          team.name[0]
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold">{team.name}</h3>
                        <p className="text-xs text-zinc-500">{team.manager_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => deleteTeam(team.id)}
                        className="text-zinc-500 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => setEditingTeam(team)}
                        className="text-zinc-500 hover:text-white transition-colors"
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                      {team.status === 'approved' ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <button 
                          onClick={() => approveTeam(team.id)}
                          className="text-xs font-bold text-emerald-500 hover:underline"
                        >
                          Approve
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Squad ({team.players?.length || 0})</span>
                      <button 
                        onClick={() => setShowAddPlayer(showAddPlayer === team.id ? null : team.id)}
                        className="text-emerald-500 text-xs font-bold hover:underline flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" /> Add Player
                      </button>
                    </div>

                    {showAddPlayer === team.id && (
                      <form onSubmit={(e) => addPlayer(e, team.id)} className="mb-4 p-4 rounded-xl bg-black/50 border border-emerald-500/20 space-y-3">
                        <input 
                          required
                          placeholder="Player Name"
                          className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white"
                          value={newPlayer.name}
                          onChange={e => setNewPlayer({...newPlayer, name: e.target.value})}
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input 
                            placeholder="Athlete Mobile No."
                            type="tel"
                            className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white font-mono"
                            value={newPlayer.phone || ''}
                            onChange={e => setNewPlayer({...newPlayer, phone: e.target.value})}
                          />
                          <select 
                            className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 text-zinc-300"
                            value={newPlayer.sport || 'cricket'}
                            onChange={e => setNewPlayer({...newPlayer, sport: e.target.value})}
                          >
                            <option value="cricket">Cricket 🏏</option>
                            <option value="soccer">Soccer ⚽</option>
                            <option value="basketball">Basketball 🏀</option>
                            <option value="tennis">Tennis 🎾</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input 
                            required
                            type="number"
                            placeholder="Age"
                            className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            value={newPlayer.age}
                            onChange={e => setNewPlayer({...newPlayer, age: parseInt(e.target.value) || 0})}
                          />
                          <select 
                            className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            value={newPlayer.role}
                            onChange={e => setNewPlayer({...newPlayer, role: e.target.value as any})}
                          >
                            {tournament?.sport === 'soccer' ? (
                              <>
                                <option value="forward">Forward</option>
                                <option value="midfielder">Midfielder</option>
                                <option value="defender">Defender</option>
                                <option value="goalkeeper">Goalkeeper</option>
                              </>
                            ) : tournament?.sport === 'basketball' ? (
                              <>
                                <option value="point_guard">Point Guard</option>
                                <option value="shooting_guard">Shooting Guard</option>
                                <option value="small_forward">Small Forward</option>
                                <option value="power_forward">Power Forward</option>
                                <option value="center">Center</option>
                              </>
                            ) : (
                              <>
                                <option value="batsman">Batsman</option>
                                <option value="bowler">Bowler</option>
                                <option value="all_rounder">All-rounder</option>
                                <option value="wk">Wicket-keeper</option>
                              </>
                            )}
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-zinc-500 uppercase font-bold">Image (JPG)</label>
                          <div className="flex items-center gap-2">
                            {newPlayer.image_url && (
                              <img src={newPlayer.image_url} alt="Preview" className="h-8 w-8 rounded-full object-cover border border-emerald-500" />
                            )}
                            <input 
                              type="file" 
                              accept=".jpg,.jpeg"
                              onChange={(e) => handleImageChange(e, 'player')}
                              className="text-[10px] text-zinc-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-emerald-500/10 file:text-emerald-500"
                            />
                          </div>
                        </div>
                        {tournament.is_auction_enabled === 1 && (
                          <input 
                            required
                            type="number"
                            placeholder="Base Price"
                            className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            value={newPlayer.base_price}
                            onChange={e => setNewPlayer({...newPlayer, base_price: parseInt(e.target.value) || 0})}
                          />
                        )}
                        <div className="flex gap-2">
                          <button type="submit" className="bg-emerald-500 text-white px-3 py-1 rounded-lg text-xs font-bold">Add</button>
                          <button type="button" onClick={() => setShowAddPlayer(null)} className="text-zinc-500 text-xs">Cancel</button>
                        </div>
                      </form>
                    )}

                    {editingPlayer && (
                      <form onSubmit={updatePlayer} className="mb-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-3">
                        <h4 className="text-[10px] font-bold uppercase text-blue-500">Edit Player</h4>
                        <input 
                          required
                          placeholder="Player Name"
                          className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-white"
                          value={editingPlayer.name}
                          onChange={e => setEditingPlayer({...editingPlayer, name: e.target.value})}
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input 
                            placeholder="Athlete Mobile No."
                            type="tel"
                            className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-white font-mono"
                            value={editingPlayer.phone || ''}
                            onChange={e => setEditingPlayer({...editingPlayer, phone: e.target.value})}
                          />
                          <select 
                            className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-300"
                            value={editingPlayer.sport || 'cricket'}
                            onChange={e => setEditingPlayer({...editingPlayer, sport: e.target.value})}
                          >
                            <option value="cricket">Cricket 🏏</option>
                            <option value="soccer">Soccer ⚽</option>
                            <option value="basketball">Basketball 🏀</option>
                            <option value="tennis">Tennis 🎾</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input 
                            required
                            type="number"
                            placeholder="Age"
                            className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={editingPlayer.age}
                            onChange={e => setEditingPlayer({...editingPlayer, age: parseInt(e.target.value) || 0})}
                          />
                          <select 
                            className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={editingPlayer.role}
                            onChange={e => setEditingPlayer({...editingPlayer, role: e.target.value as any})}
                          >
                            {tournament?.sport === 'soccer' ? (
                              <>
                                <option value="forward">Forward</option>
                                <option value="midfielder">Midfielder</option>
                                <option value="defender">Defender</option>
                                <option value="goalkeeper">Goalkeeper</option>
                              </>
                            ) : tournament?.sport === 'basketball' ? (
                              <>
                                <option value="point_guard">Point Guard</option>
                                <option value="shooting_guard">Shooting Guard</option>
                                <option value="small_forward">Small Forward</option>
                                <option value="power_forward">Power Forward</option>
                                <option value="center">Center</option>
                              </>
                            ) : (
                              <>
                                <option value="batsman">Batsman</option>
                                <option value="bowler">Bowler</option>
                                <option value="all_rounder">All-rounder</option>
                                <option value="wk">Wicket-keeper</option>
                              </>
                            )}
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-zinc-500 uppercase font-bold">Image (JPG)</label>
                          <div className="flex items-center gap-2">
                            {editingPlayer.image_url && (
                              <img src={editingPlayer.image_url} alt="Preview" className="h-8 w-8 rounded-full object-cover border border-blue-500" />
                            )}
                            <input 
                              type="file" 
                              accept=".jpg,.jpeg"
                              onChange={(e) => handleImageChange(e, 'editPlayer')}
                              className="text-[10px] text-zinc-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-blue-500/10 file:text-blue-500"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded-lg text-xs font-bold">Update</button>
                          <button type="button" onClick={() => setEditingPlayer(null)} className="text-zinc-500 text-xs">Cancel</button>
                        </div>
                      </form>
                    )}

                    <div className="space-y-1 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                      {team.players?.map(player => (
                        <div key={player.id} className="group flex items-center justify-between text-xs py-1.5 px-2 rounded bg-white/5">
                          <div className="flex items-center gap-3">
                            {player.image_url ? (
                              <img src={player.image_url} alt={player.name} className="h-8 w-8 rounded-full object-cover border border-white/10 shadow-sm" />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold border border-white/10">
                                {player.name[0]}
                              </div>
                            )}
                            <div className="flex flex-col">
                              <span className="font-medium text-white">{player.name}</span>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] text-zinc-500 uppercase">{player.role.replace('_', ' ')}</span>
                                {player.sport && (
                                  <span className="text-[9px] text-emerald-400 font-bold uppercase bg-emerald-500/10 px-1 rounded">
                                    {player.sport === 'soccer' ? '⚽ soccer' : player.sport === 'basketball' ? '🏀 basketball' : player.sport === 'tennis' ? '🎾 tennis' : '🏏 cricket'}
                                  </span>
                                )}
                              </div>
                              {player.phone && (
                                <span className="text-[9px] text-zinc-400 font-mono mt-0.5 bg-black/40 px-1 py-0.2 rounded w-fit">
                                  📞 {player.phone}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {tournament.is_auction_enabled === 1 && player.sold_price > 0 && (
                              <span className="text-emerald-500 font-bold">₹{(player.sold_price / 100000).toFixed(1)}L</span>
                            )}
                            <button 
                              onClick={() => deletePlayer(player.id)}
                              className="text-zinc-500 hover:text-red-500 transition-all"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                            <button 
                              onClick={() => setEditingPlayer(player)}
                              className="text-zinc-500 hover:text-white transition-all"
                            >
                              <Settings className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {(!team.players || team.players.length === 0) && (
                        <p className="text-[10px] text-zinc-600 italic">No players added yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {(!tournament.teams || tournament.teams.length === 0) && (
                <div className="col-span-full py-12 text-center border border-dashed border-white/10 rounded-2xl text-zinc-500">
                  No teams registered yet.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Tournament Expenses</h2>
              <div className="flex items-center gap-3">
                {expenses.length > 0 && (
                  <button 
                    onClick={exportExpensesCSV}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-white/10 hover:border-emerald-500/20 text-zinc-300 text-sm font-bold hover:text-white transition-all"
                    title="Export all logged tournament expenses to CSV / Excel format"
                  >
                    <Download className="h-4 w-4 text-emerald-500" />
                    <span>Export CSV</span>
                  </button>
                )}
                <button 
                  onClick={() => setShowAddExpense(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-black text-sm font-bold hover:bg-emerald-400 transition-all"
                >
                  <Plus className="h-4 w-4" /> Add Expense
                </button>
              </div>
            </div>

            {showAddExpense && (
              <form onSubmit={addExpense} className="p-8 rounded-3xl bg-zinc-900 border border-emerald-500/20 space-y-6">
                <h3 className="text-lg font-bold">Add New Expense</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-500 uppercase font-bold">Description</label>
                    <input 
                      required
                      placeholder="e.g., Ground Booking"
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      value={newExpense.description}
                      onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-500 uppercase font-bold">Amount (₹)</label>
                    <input 
                      required
                      type="number"
                      placeholder="0"
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      value={newExpense.amount}
                      onChange={e => setNewExpense({...newExpense, amount: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-500 uppercase font-bold">Category</label>
                    <select 
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      value={newExpense.category}
                      onChange={e => setNewExpense({...newExpense, category: e.target.value})}
                    >
                      <option value="Venue">Venue</option>
                      <option value="Umpire Fees">Umpire Fees</option>
                      <option value="Equipment">Equipment</option>
                      <option value="Travel">Travel</option>
                      <option value="Miscellaneous">Miscellaneous</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-500 uppercase font-bold">Date</label>
                    <input 
                      type="date"
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      value={newExpense.date}
                      onChange={e => setNewExpense({...newExpense, date: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <button type="submit" className="flex-1 py-4 rounded-2xl bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-all">
                    Add Expense
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowAddExpense(false)}
                    className="px-8 py-4 rounded-2xl bg-zinc-800 text-zinc-400 font-bold hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {editingExpense && (
              <form onSubmit={updateExpense} className="p-8 rounded-3xl bg-zinc-900 border border-blue-500/20 space-y-6">
                <h3 className="text-lg font-bold">Edit Expense</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-500 uppercase font-bold">Description</label>
                    <input 
                      required
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      value={editingExpense.description}
                      onChange={e => setEditingExpense({...editingExpense, description: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-500 uppercase font-bold">Amount (₹)</label>
                    <input 
                      required
                      type="number"
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      value={editingExpense.amount}
                      onChange={e => setEditingExpense({...editingExpense, amount: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-500 uppercase font-bold">Category</label>
                    <select 
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      value={editingExpense.category}
                      onChange={e => setEditingExpense({...editingExpense, category: e.target.value})}
                    >
                      <option value="Venue">Venue</option>
                      <option value="Umpire Fees">Umpire Fees</option>
                      <option value="Equipment">Equipment</option>
                      <option value="Travel">Travel</option>
                      <option value="Miscellaneous">Miscellaneous</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-500 uppercase font-bold">Date</label>
                    <input 
                      type="date"
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      value={editingExpense.date?.split('T')[0]}
                      onChange={e => setEditingExpense({...editingExpense, date: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <button type="submit" className="flex-1 py-4 rounded-2xl bg-blue-500 text-white font-bold hover:bg-blue-400 transition-all">
                    Update Expense
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setEditingExpense(null)}
                    className="px-8 py-4 rounded-2xl bg-zinc-800 text-zinc-400 font-bold hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 gap-4">
              {expenses.map(expense => (
                <div key={expense.id} className="p-6 rounded-2xl bg-zinc-900/30 border border-white/5 flex items-center justify-between group">
                  <div className="flex items-center gap-6">
                    <div className="h-12 w-12 rounded-xl bg-zinc-800 flex items-center justify-center">
                      <Receipt className="h-6 w-6 text-zinc-500" />
                    </div>
                    <div>
                      <p className="font-bold">{expense.description}</p>
                      <div className="flex items-center gap-3 text-xs text-zinc-500">
                        <span className="uppercase tracking-widest">{expense.category}</span>
                        <span>•</span>
                        <span>{new Date(expense.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <p className="text-xl font-black text-emerald-500">₹{expense.amount.toLocaleString()}</p>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setEditingExpense(expense)}
                        className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-all"
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => deleteExpense(expense.id)}
                        className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {expenses.length === 0 && (
                <div className="py-12 text-center border border-dashed border-white/10 rounded-2xl text-zinc-500">
                  No expenses recorded yet.
                </div>
              )}
            </div>

            <div className="p-8 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
              <div>
                <p className="text-xs text-emerald-500 uppercase tracking-widest font-bold mb-1">Total Expenses</p>
                <p className="text-3xl font-black text-emerald-500">
                  ₹{expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-12 w-12 text-emerald-500 opacity-20" />
            </div>
          </div>
        )}

        {activeTab === 'sponsors' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Tournament Sponsors</h2>
              <button 
                onClick={() => setShowAddSponsor(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-black text-sm font-bold hover:bg-emerald-400 transition-all"
              >
                <Plus className="h-4 w-4" /> Add Sponsor
              </button>
            </div>

            {showAddSponsor && (
              <form onSubmit={addSponsor} className="p-8 rounded-3xl bg-zinc-900 border border-emerald-500/20 space-y-6">
                <h3 className="text-lg font-bold">Add New Sponsor</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-500 uppercase font-bold">Sponsor Name</label>
                    <input 
                      required
                      placeholder="e.g., Nike"
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      value={newSponsor.name}
                      onChange={e => setNewSponsor({...newSponsor, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-500 uppercase font-bold">Website URL (Optional)</label>
                    <input 
                      placeholder="https://example.com"
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      value={newSponsor.website_url}
                      onChange={e => setNewSponsor({...newSponsor, website_url: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs text-zinc-500 uppercase font-bold">Banner Upload (JPG format required)</label>
                    <div className="flex items-center gap-6 p-6 rounded-2xl bg-black border border-white/10">
                      {newSponsor.banner_url ? (
                        <div className="relative group">
                          <img src={newSponsor.banner_url} alt="Banner Preview" className="h-24 rounded-lg object-cover border border-emerald-500/50" />
                          <button 
                            type="button"
                            onClick={() => setNewSponsor({...newSponsor, banner_url: ''})}
                            className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 text-white"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="h-24 w-48 rounded-lg bg-zinc-900 border border-dashed border-white/10 flex flex-col items-center justify-center text-zinc-600">
                          <ImageIcon className="h-8 w-8 mb-2 opacity-20" />
                          <span className="text-[10px] uppercase font-bold tracking-widest">No Banner Selected</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <input 
                          type="file" 
                          accept=".jpg,.jpeg"
                          onChange={(e) => handleImageChange(e, 'sponsor')}
                          className="w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-500/10 file:text-emerald-500 hover:file:bg-emerald-500/20"
                        />
                        <p className="text-[10px] text-zinc-500 mt-2">Recommended size: 1200x400px. Only .jpg or .jpeg allowed.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button type="submit" className="flex-1 py-4 rounded-2xl bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-all">
                    Save Sponsor
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowAddSponsor(false)}
                    className="px-8 py-4 rounded-2xl bg-zinc-800 text-zinc-400 font-bold hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sponsors.map(sponsor => (
                <div key={sponsor.id} className="rounded-3xl bg-zinc-900/50 border border-white/5 overflow-hidden group">
                  <div className="aspect-[3/1] bg-black relative">
                    {sponsor.banner_url ? (
                      <img src={sponsor.banner_url} alt={sponsor.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-800">
                        <ImageIcon className="h-8 w-8" />
                      </div>
                    )}
                    <button 
                      onClick={() => deleteSponsor(sponsor.id)}
                      className="absolute top-2 right-2 p-2 rounded-lg bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">{sponsor.name}</h3>
                      {sponsor.website_url && (
                        <a 
                          href={sponsor.website_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[10px] text-emerald-500 hover:underline flex items-center gap-1 mt-1 font-bold uppercase tracking-widest"
                        >
                          Visit Website <ExternalLink className="h-2 w-2" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {sponsors.length === 0 && (
                <div className="md:col-span-2 lg:col-span-3 py-12 text-center border border-dashed border-white/10 rounded-3xl text-zinc-500">
                  No sponsors added yet for this tournament.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-emerald-500" /> Team Managers Live Lobby
                </h2>
                <p className="text-xs text-zinc-500 mt-1">Real-time match notifications and communication portal for registered team managers</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 flex items-center gap-1">
                ● LIVE SYNC ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Profile / Preferences sidebar */}
              <div className="lg:col-span-1 p-6 rounded-2xl bg-zinc-900 border border-white/5 space-y-4 h-fit">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest block">Your Identity</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold block mb-1">Your Name</label>
                    <input 
                      type="text"
                      value={chatSenderName}
                      onChange={(e) => setChatSenderName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full text-xs p-3 rounded-xl bg-black border border-white/10 text-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold block mb-1">Representing Team</label>
                    <select
                      value={chatTeamName}
                      onChange={(e) => setChatTeamName(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl bg-black border border-white/10 text-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="">Tournament Organizer</option>
                      {tournament.teams?.map((team: any) => (
                        <option key={team.id} value={team.name}>{team.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="pt-4 border-t border-white/5 text-[10px] text-zinc-500 leading-relaxed">
                  Select your registered team to write on behalf of your franchise. All messages are streamed instantly to all connected monitors.
                </div>
              </div>

              {/* Main chat log */}
              <div className="lg:col-span-3 rounded-2xl bg-zinc-900 border border-white/5 flex flex-col h-[500px] overflow-hidden">
                {/* Messages channel wrapper */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4 no-scrollbar">
                  {loadingChat ? (
                    <div className="h-full flex items-center justify-center text-zinc-500 text-xs">
                      Loading communication log...
                    </div>
                  ) : chatMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-center space-y-2">
                      <MessageSquare className="h-10 w-10 text-zinc-700" />
                      <p className="text-xs text-zinc-500">No logs recorded. Be the first to start the conversation!</p>
                    </div>
                  ) : (
                    chatMessages.map((msg: any) => {
                      const isMe = msg.sender_name === chatSenderName;
                      return (
                        <div key={msg.id} className={cn("flex flex-col max-w-[85%] space-y-1", isMe ? "ml-auto items-end" : "mr-auto items-start")}>
                          {/* Sender title */}
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{msg.team_name}</span>
                            <span className="text-[9px] text-zinc-600 font-medium">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          
                          {/* Message bubble */}
                          <div className={cn(
                            "px-4 py-3 rounded-2xl text-xs leading-relaxed",
                            isMe 
                              ? "bg-emerald-500 text-black font-medium rounded-tr-none" 
                              : "bg-black border border-white/5 text-zinc-300 rounded-tl-none"
                          )}>
                            <p className="font-bold text-[9px] opacity-60 mb-1">{msg.sender_name}</p>
                            <p className="whitespace-pre-wrap">{msg.message}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Messaging footer form */}
                <form onSubmit={sendChatMessage} className="p-4 bg-black/40 border-t border-white/5 flex gap-2">
                  <input 
                    type="text"
                    value={chatMessageText}
                    onChange={(e) => setChatMessageText(e.target.value)}
                    placeholder="Type your match update or manager inquiry..."
                    className="flex-1 text-xs p-3 rounded-xl bg-black border border-white/10 text-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                  <button 
                    type="submit"
                    className="px-5 py-3 rounded-xl bg-emerald-500 text-black font-black hover:bg-emerald-400 transition-all flex items-center gap-1 text-xs"
                  >
                    <Send className="h-3 w-3" /> Send
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rules' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-emerald-500" /> Tournament League & Ground Rules
                </h2>
                <p className="text-xs text-zinc-500 mt-1">Official league statutes, local pitch specifications, and play conduct rules</p>
              </div>
              {!isEditingRules && (
                <button
                  onClick={() => setIsEditingRules(true)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 border border-white/10 hover:bg-zinc-800 text-xs font-bold text-white transition-all flex items-center gap-2"
                >
                  <Edit2 className="h-3 w-3" /> Edit Rulesheet
                </button>
              )}
            </div>

            {isEditingRules ? (
              <div className="p-8 rounded-3xl bg-zinc-900 border border-white/5 space-y-4">
                <h3 className="text-sm font-bold text-white">Modify Official Rulebook</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Enter specific tournament ground bylaws. Supports newline formatting. These regulations will be displayed instantly to all team managers, scorers, and fans.
                </p>
                <textarea
                  value={editedRules}
                  onChange={(e) => setEditedRules(e.target.value)}
                  placeholder="Define powerplay boundaries, super-over scenarios, dress code, matching fees, and severe climate delays..."
                  className="w-full h-80 p-4 rounded-2xl bg-black border border-white/10 text-zinc-300 text-xs font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => {
                      setEditedRules(tournamentRules);
                      setIsEditingRules(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-black border border-white/10 text-xs font-semibold text-zinc-400 hover:text-white transition-all"
                  >
                    Discard Changes
                  </button>
                  <button
                    onClick={saveTournamentRules}
                    className="px-5 py-2 rounded-xl bg-emerald-500 text-xs font-black text-black hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/10"
                  >
                    Save Rulebook
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-3xl bg-zinc-900 border border-white/5 space-y-6">
                {tournamentRules.trim() ? (
                  <div className="space-y-4 leading-relaxed text-sm text-zinc-300 whitespace-pre-wrap">
                    {tournamentRules}
                  </div>
                ) : (
                  <div className="py-12 text-center space-y-4">
                    <BookOpen className="h-12 w-12 text-zinc-700 mx-auto" />
                    <div>
                      <h4 className="font-bold text-sm text-zinc-300">No Custom Rules Defined Yet</h4>
                      <p className="text-xs text-zinc-500 max-w-md mx-auto mt-2">
                        Get started by adding localized ground protocols. You can also populate default professional guidelines below.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        let template = '';
                        if (tournament?.sport === 'soccer') {
                          template = `1. MATCH STRUCTURE & DURATION
- Soccer match of 2 halves of 45 minutes each, with a 15-minute half-time interval.
- Substitution: Maximum of 5 substitutions allowed per team in up to 3 stopping intervals.
- Extra Time: If tied during knockout phase, two extra periods of 15 minutes each will be played. If still tied, a Penalty Shootout (best of 5) takes place.

2. LAWS & FOULS
- Offside rule is strictly active and monitored by side referees.
- Slide tackling from behind directly targeting player legs is a mandatory Yellow Card.
- Serious foul play, spitting, or violent conduct incurs a direct Red Card, leading to suspension from subsequent games.

3. BALL & FIELD PROTOCOLS
- Match is played with standard FIFA Size 5 authorized balls.
- Matches must commence on turf within 15 minutes of scheduled time. Team failing to report is declared walkover (3-0 loss score).`;
                        } else if (tournament?.sport === 'basketball') {
                          template = `1. GAME CLOCK & PERIODS
- Game is comprised of 4 quarters of 10 or 12 minutes each.
- In case of a tie, 5-minute overtime periods are played until a winner emerges.
- Shot Clock: Standard 24-second shot clock is strictly applied and reset on rim touches.

2. ROSTER & FOULS LIMIT
- Direct foul-out limit is 5 personal fouls (or 6 under specific professional configurations).
- Bonus free throws are awarded after the 4th team foul in each quarter.

3. COURT PROTOCOLS
- Jump ball opens the match; arrow determines subsequent alternating possessions.
- High-tops and uniform standards apply for optimal court safety.`;
                        } else {
                          template = `1. MATCH STRUCTURE & OVERS
- Standard T20 format with 20 overs per innings unless curtailed by climate.
- Powerplay: First 6 overs are mandatory powerplays (only 2 fielders allowed outside 30-yard circle).
- Bowler Limit: Maximum 4 overs per bowler per match.

2. LOCAL GROUND BYLAWS & FREE HITS
- Any delivery landing off the synthetic mat pitch is declared a Dead Ball.
- Foot or line crease overstepping on No Balls incurs a 1-run penalty and mandates a Free Hit on the next delivery.
- Mankading (running out the non-striker before delivery release) is strictly prohibited as per local sport spirit.

3. DELAYS & PLAYOFF DETERMINATION
- In case of tied knockout games, team standings will be decided exclusively via a one-over Super Over.
- Minimum 5 overs per side are required to constitute a valid completed match.
- Rain delays scale target scores using standard G/D or localized run-rate calculations.`;
                        }
                        setEditedRules(template);
                        setIsEditingRules(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold hover:bg-emerald-500/20 transition-all"
                    >
                      Use Standard Tournament Template
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Camera className="h-5 w-5 text-emerald-500" /> Venue & Event Image Gallery
                </h2>
                <p className="text-xs text-zinc-500 mt-1">Staging gallery of grounds, training arenas, previous seasons, and memorable match moments</p>
              </div>
            </div>

            {/* AI Generator & manual link uploader */}
            <div className="p-6 rounded-3xl bg-zinc-900 border border-white/5 space-y-6">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-500 animate-pulse" /> Add Media via Curated Presets, Seed AI, or Direct Link
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4 pr-0 lg:pr-6 lg:border-r lg:border-white/5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold block mb-1">Upload via Web URL</label>
                      <input 
                        type="text"
                        value={galleryUploadUrl}
                        onChange={(e) => setGalleryUploadUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="w-full text-xs p-3 rounded-xl bg-black border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold block mb-1">Image Caption</label>
                      <input 
                        type="text"
                        value={galleryCaption}
                        onChange={(e) => setGalleryCaption(e.target.value)}
                        placeholder="e.g. Lords Cricket Stadium Grand Final"
                        className="w-full text-xs p-3 rounded-xl bg-black border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                    <button
                      onClick={() => {
                        const seedUrl = `https://picsum.photos/seed/${encodeURIComponent(galleryCaption || 'stadium-cricket-' + Date.now())}/800/600`;
                        uploadGalleryImage(seedUrl, galleryCaption || 'Generated venue overview');
                      }}
                      className="px-5 py-2.5 rounded-xl bg-emerald-500 text-xs font-black text-black hover:bg-emerald-400 transition-all flex items-center gap-1"
                    >
                      <Sparkles className="h-3 w-3" /> Generate Stadium Pic on seed
                    </button>

                    <button
                      onClick={() => {
                        if (!galleryUploadUrl) return;
                        uploadGalleryImage(galleryUploadUrl, galleryCaption || 'Uploaded picture');
                      }}
                      className="px-5 py-2.5 rounded-xl bg-zinc-800 border border-white/15 text-xs font-bold text-zinc-200 hover:bg-zinc-700 transition-all"
                    >
                      Add Custom URL
                    </button>
                  </div>
                </div>

                {/* Preset sports venue themes with Unsplash */}
                <div className="space-y-3">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold block">One-Click Curated Presets</span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: "Lords Stadium", url: "https://images.unsplash.com/photo-1540747737956-378724044453?w=800&auto=format&fit=crop" },
                      { name: "Crisp Turf Ball", url: "https://images.unsplash.com/photo-1531415080290-bc9b161a0fc2?w=800&auto=format&fit=crop" },
                      { name: "Grand Floodlights", url: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop" },
                      { name: "High Power Shot", url: "https://images.unsplash.com/photo-1624526261116-254e0c451bc0?w=800&auto=format&fit=crop" }
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => {
                          uploadGalleryImage(preset.url, preset.name);
                        }}
                        className="group relative h-16 rounded-xl overflow-hidden border border-white/10 hover:border-emerald-500/50 text-left transition-all"
                      >
                        <img 
                          src={preset.url} 
                          alt={preset.name} 
                          className="h-full w-full object-cover opacity-40 group-hover:opacity-60 transition-all"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-2 flex items-end">
                          <span className="text-[9px] font-bold text-white truncate w-full">{preset.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Gallery images display feed */}
            {loadingGallery ? (
              <div className="py-20 text-center text-zinc-500 text-xs">
                Fetching stadium media archive...
              </div>
            ) : galleryImages.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-white/5 bg-black/10 rounded-3xl text-zinc-500 space-y-2">
                <Camera className="h-8 w-8 text-zinc-700 mx-auto" />
                <p className="text-xs">No media uploaded in the venue archive yet.</p>
                <p className="text-[10px] text-zinc-600">Click some curated presets or generate seed photos to populate the album!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {galleryImages.map((img: any) => (
                  <div key={img.id} className="group rounded-2xl bg-zinc-900 border border-white/5 overflow-hidden flex flex-col justify-between hover:border-emerald-500/20 transition-all">
                    <div className="aspect-video relative overflow-hidden bg-black">
                      <img 
                        src={img.image_url} 
                        alt={img.caption || 'Venue Photo'} 
                        className="h-full w-full object-cover group-hover:scale-105 transition-all duration-300"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="p-3">
                      <p className="font-bold text-xs text-white truncate">{img.caption || 'Live Match Update'}</p>
                      <p className="text-[9px] text-zinc-600 mt-1">{new Date(img.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto">
            <div className="p-8 rounded-3xl bg-zinc-900 border border-white/5">
              <h2 className="text-2xl font-bold mb-8">Tournament Settings</h2>
              
              {!isEditingTournament ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-1">Tournament Name</p>
                      <p className="text-lg font-medium">{tournament.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-1">Status</p>
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-widest",
                          tournament.status === 'active' ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-500/10 text-zinc-500"
                        )}>
                          {tournament.status}
                        </span>
                        <button 
                          onClick={toggleTournamentStatus}
                          className={cn(
                            "p-1.5 rounded-lg transition-all",
                            tournament.status === 'active' ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20" : "bg-zinc-500/10 text-zinc-500 hover:bg-zinc-500/20"
                          )}
                          title={tournament.status === 'active' ? "Deactivate" : "Activate"}
                        >
                          {tournament.status === 'active' ? <Power className="h-3.5 w-3.5" /> : <PowerOff className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-1">Format</p>
                      <p className="text-lg font-medium capitalize">{tournament.format.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-1">Sport</p>
                      <p className="text-lg font-medium capitalize">{tournament.sport || 'Cricket'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-1">
                        {tournament.sport === 'cricket' ? 'Overs' : 'Duration'}
                      </p>
                      <p className="text-lg font-medium">{tournament.overs}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-1">Teams Count</p>
                      <p className="text-lg font-medium">{tournament.teams_count}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-1">Base Budget</p>
                      <p className="text-lg font-medium">₹{tournament.base_budget.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="pt-8 border-t border-white/5 flex flex-col gap-4">
                    <button 
                      onClick={() => {
                        setEditTournamentData(tournament);
                        setIsEditingTournament(true);
                      }}
                      className="w-full py-4 rounded-2xl bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-all"
                    >
                      Edit Tournament Details
                    </button>
                    <button 
                      onClick={deleteTournament}
                      className="w-full py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" /> Delete Tournament
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={updateTournament} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2 block">Tournament Name</label>
                      <input 
                        required
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        value={editTournamentData.name}
                        onChange={e => setEditTournamentData({...editTournamentData, name: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2 block">Format</label>
                        <select 
                          className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          value={editTournamentData.format}
                          onChange={e => setEditTournamentData({...editTournamentData, format: e.target.value})}
                        >
                          <option value="league">League</option>
                          <option value="knockout">Knockout</option>
                          <option value="group_knockout">Group + Knockout</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2 block">Sport</label>
                        <select 
                          className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          value={editTournamentData.sport || 'cricket'}
                          onChange={e => setEditTournamentData({...editTournamentData, sport: e.target.value})}
                        >
                          <option value="cricket">Cricket</option>
                          <option value="football">Football</option>
                          <option value="basketball">Basketball</option>
                          <option value="volleyball">Volleyball</option>
                          <option value="badminton">Badminton</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2 block">Status</label>
                        <select 
                          className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          value={editTournamentData.status}
                          onChange={e => setEditTournamentData({...editTournamentData, status: e.target.value})}
                        >
                          <option value="draft">Draft</option>
                          <option value="active">Active</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2 block">Overs</label>
                        <input 
                          type="number"
                          className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          value={editTournamentData.overs}
                          onChange={e => setEditTournamentData({...editTournamentData, overs: parseInt(e.target.value) || 0})}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2 block">Teams</label>
                        <input 
                          type="number"
                          className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          value={editTournamentData.teams_count}
                          onChange={e => setEditTournamentData({...editTournamentData, teams_count: parseInt(e.target.value) || 0})}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2 block">Budget</label>
                        <input 
                          type="number"
                          className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          value={editTournamentData.base_budget}
                          onChange={e => setEditTournamentData({...editTournamentData, base_budget: parseInt(e.target.value) || 0})}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <button type="submit" className="flex-1 py-4 rounded-2xl bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-all">
                      Save Changes
                    </button>
                    <button 
                      type="button"
                      onClick={() => setIsEditingTournament(false)}
                      className="px-8 py-4 rounded-2xl bg-zinc-800 text-zinc-400 font-bold hover:text-white transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Player Statistics & MVP Tracking</h2>
              <div className="flex items-center gap-4">
                {stats.length > 0 && (
                  <button 
                    onClick={exportStatsCSV}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-white/10 hover:border-emerald-500/20 text-zinc-300 text-xs font-bold hover:text-white transition-all"
                    title="Export all player statistics to CSV / Excel format"
                  >
                    <Download className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Export Stats CSV</span>
                  </button>
                )}
                <button 
                  onClick={fetchStats}
                  className="text-xs text-emerald-500 hover:underline"
                >
                  Refresh Stats
                </button>
              </div>
            </div>

            {loadingStats ? (
              <div className="py-12 text-center text-zinc-500">Calculating statistics...</div>
            ) : (
              <div className="grid grid-cols-1 gap-8">
                {/* MVP Leaderboard */}
                <div className="p-8 rounded-3xl bg-zinc-900 border border-emerald-500/20">
                  <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-emerald-500" /> MVP Leaderboard
                  </h3>
                  <div className="space-y-4">
                    {stats.slice(0, 5).map((player, index) => (
                      <div key={player.id} className="flex items-center justify-between p-4 rounded-2xl bg-black/30 border border-white/5">
                        <div className="flex items-center gap-4">
                          <span className="text-xl font-black text-zinc-800 w-6">{index + 1}</span>
                          <div className="h-12 w-12 rounded-full bg-zinc-800 overflow-hidden border-2 border-emerald-500/20">
                            {player.image_url ? (
                              <img src={player.image_url} alt={player.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center font-bold">{player.name[0]}</div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold">{player.name}</p>
                            <p className="text-xs text-zinc-500">{player.team_name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black text-emerald-500">{player.mvp_points}</p>
                          <p className="text-[10px] text-zinc-600 uppercase font-bold">MVP Points</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detailed Stats Table */}
                <div className="overflow-x-auto rounded-3xl border border-white/5 bg-zinc-900/30">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Player</th>
                        {tournament?.sport === 'soccer' ? (
                          <>
                            <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest text-center">Goals</th>
                            <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest text-center">Yellow Cards</th>
                            <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest text-center">Red Cards</th>
                            <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest text-center">Fouls</th>
                            <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest text-center">MVP Points</th>
                          </>
                        ) : tournament?.sport === 'basketball' ? (
                          <>
                            <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest text-center">Points</th>
                            <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest text-center">Fouls</th>
                            <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest text-center">MVP Points</th>
                          </>
                        ) : (
                          <>
                            <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest text-center">Runs</th>
                            <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest text-center">Wkts</th>
                            <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest text-center">SR</th>
                            <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest text-center">Econ</th>
                            <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest text-center">6s/4s</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {stats.map(player => (
                        <tr key={player.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-zinc-800 overflow-hidden">
                                {player.image_url ? (
                                  <img src={player.image_url} alt={player.name} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center text-[10px] font-bold">{player.name[0]}</div>
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-sm">{player.name}</p>
                                <p className="text-[10px] text-zinc-500">{player.team_name}</p>
                              </div>
                            </div>
                          </td>
                          {tournament?.sport === 'soccer' ? (
                            <>
                              <td className="px-6 py-4 text-center font-bold text-emerald-500">{player.goals || 0}</td>
                              <td className="px-6 py-4 text-center font-bold text-amber-500">{player.yellow_cards || 0}</td>
                              <td className="px-6 py-4 text-center font-bold text-red-500">{player.red_cards || 0}</td>
                              <td className="px-6 py-4 text-center text-sm text-zinc-400">{player.fouls || 0}</td>
                              <td className="px-6 py-4 text-center font-bold text-emerald-400">{player.mvp_points || 0}</td>
                            </>
                          ) : tournament?.sport === 'basketball' ? (
                            <>
                              <td className="px-6 py-4 text-center font-bold text-emerald-500">{player.basketball_points || 0}</td>
                              <td className="px-6 py-4 text-center text-sm text-zinc-400">{player.fouls || 0}</td>
                              <td className="px-6 py-4 text-center font-bold text-emerald-400">{player.mvp_points || 0}</td>
                            </>
                          ) : (
                            <>
                              <td className="px-6 py-4 text-center font-bold text-emerald-500">{player.batting?.runs || 0}</td>
                              <td className="px-6 py-4 text-center font-bold text-blue-500">{player.bowling?.wickets || 0}</td>
                              <td className="px-6 py-4 text-center text-sm text-zinc-400">{player.batting?.sr || '0.0'}</td>
                              <td className="px-6 py-4 text-center text-sm text-zinc-400">{player.bowling?.econ || '0.00'}</td>
                              <td className="px-6 py-4 text-center text-sm text-zinc-500">{(player.batting?.sixes || 0)}/{(player.batting?.fours || 0)}</td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Player Comparison Tool */}
                <div className="p-8 rounded-3xl bg-zinc-900 border border-white/5 space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
                    <div>
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-emerald-500" /> Player Performance Comparison
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1">Select any two roster players to run real-time metrics analysis</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Select Player A</label>
                      <select 
                        value={comparePlayerId1}
                        onChange={(e) => setComparePlayerId1(e.target.value)}
                        className="w-full p-3 rounded-xl bg-black border border-white/10 text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none text-zinc-300"
                      >
                        <option value="">-- Choose Player --</option>
                        {stats.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Select Player B</label>
                      <select 
                        value={comparePlayerId2}
                        onChange={(e) => setComparePlayerId2(e.target.value)}
                        className="w-full p-3 rounded-xl bg-black border border-white/10 text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none text-zinc-300"
                      >
                        <option value="">-- Choose Player --</option>
                        {stats.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {(() => {
                    const playerA1 = stats.find(p => p.id === parseInt(comparePlayerId1 as string));
                    const playerB2 = stats.find(p => p.id === parseInt(comparePlayerId2 as string));

                    if (playerA1 && playerB2) {
                      const isSoccer = tournament?.sport === 'soccer';
                      const isBasketball = tournament?.sport === 'basketball';

                      // Define sport-aware chart data
                      let chartData = [];
                      if (isSoccer) {
                        chartData = [
                          { name: 'Goals', [playerA1.name]: playerA1.goals || 0, [playerB2.name]: playerB2.goals || 0 },
                          { name: 'Yellow Cards', [playerA1.name]: playerA1.yellow_cards || 0, [playerB2.name]: playerB2.yellow_cards || 0 },
                          { name: 'Red Cards * 5', [playerA1.name]: (playerA1.red_cards || 0) * 5, [playerB2.name]: (playerB2.red_cards || 0) * 5 },
                          { name: 'Fouls', [playerA1.name]: playerA1.fouls || 0, [playerB2.name]: playerB2.fouls || 0 },
                          { name: 'MVP Points', [playerA1.name]: playerA1.mvp_points || 0, [playerB2.name]: playerB2.mvp_points || 0 }
                        ];
                      } else if (isBasketball) {
                        chartData = [
                          { name: 'Points', [playerA1.name]: playerA1.basketball_points || 0, [playerB2.name]: playerB2.basketball_points || 0 },
                          { name: 'Fouls * 5', [playerA1.name]: (playerA1.fouls || 0) * 5, [playerB2.name]: (playerB2.fouls || 0) * 5 },
                          { name: 'MVP Points', [playerA1.name]: playerA1.mvp_points || 0, [playerB2.name]: playerB2.mvp_points || 0 }
                        ];
                      } else {
                        chartData = [
                          { name: 'Runs', [playerA1.name]: playerA1.batting?.runs || 0, [playerB2.name]: playerB2.batting?.runs || 0 },
                          { name: 'SR / 2', [playerA1.name]: parseFloat(playerA1.batting?.sr) / 2 || 0, [playerB2.name]: parseFloat(playerB2.batting?.sr) / 2 || 0 },
                          { name: 'Wkts * 10', [playerA1.name]: (playerA1.bowling?.wickets || 0) * 10, [playerB2.name]: (playerB2.bowling?.wickets || 0) * 10 },
                          { name: 'Econ * 10', [playerA1.name]: parseFloat(playerA1.bowling?.econ) * 10 || 0, [playerB2.name]: parseFloat(playerB2.bowling?.econ) * 10 || 0 },
                          { name: 'MVP', [playerA1.name]: playerA1.mvp_points || 0, [playerB2.name]: playerB2.mvp_points || 0 }
                        ];
                      }

                      return (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
                          {/* Player 1 Card */}
                          <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex flex-col justify-between">
                            <div>
                              <p className="text-[9px] text-emerald-500 uppercase tracking-widest font-black mb-2">Player A</p>
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-zinc-800 overflow-hidden shrink-0 border border-emerald-500/30 flex items-center justify-center font-bold">
                                  {playerA1.image_url ? (
                                    <img src={playerA1.image_url} alt={playerA1.name} className="h-full w-full object-cover" />
                                  ) : (
                                    playerA1.name[0]
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <h4 className="font-bold text-sm text-white truncate">{playerA1.name}</h4>
                                  <p className="text-[10px] text-zinc-400 truncate">{playerA1.team_name || 'Unassigned'}</p>
                                </div>
                              </div>
                            </div>
                            <div className="mt-6 pt-4 border-t border-white/5 space-y-2">
                              {isSoccer ? (
                                <>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-zinc-500">Goals</span>
                                    <span className="font-bold text-emerald-500">{playerA1.goals || 0}</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-zinc-500">Yellow Cards</span>
                                    <span className="font-semibold text-amber-500">{playerA1.yellow_cards || 0}</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-zinc-500">Red Cards</span>
                                    <span className="font-bold text-red-500">{playerA1.red_cards || 0}</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-zinc-500">Fouls</span>
                                    <span className="font-semibold text-zinc-400">{playerA1.fouls || 0}</span>
                                  </div>
                                </>
                              ) : isBasketball ? (
                                <>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-zinc-500">Points</span>
                                    <span className="font-bold text-emerald-500">{playerA1.basketball_points || 0}</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-zinc-500">Fouls</span>
                                    <span className="font-semibold text-zinc-400">{playerA1.fouls || 0}</span>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-zinc-500">Runs</span>
                                    <span className="font-bold text-emerald-500">{playerA1.batting?.runs || 0}</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-zinc-500">Strike Rate</span>
                                    <span className="font-semibold text-zinc-300">{playerA1.batting?.sr || '0.00'}</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-zinc-500">Wickets</span>
                                    <span className="font-bold text-blue-400">{playerA1.bowling?.wickets || 0}</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-zinc-500">Economy</span>
                                    <span className="font-semibold text-zinc-300">{playerA1.bowling?.econ || '0.00'}</span>
                                  </div>
                                </>
                              )}
                              <div className="flex justify-between text-xs pt-2 border-t border-white/5">
                                <span className="text-zinc-500 font-bold">MVP Points</span>
                                <span className="font-bold text-emerald-400">{playerA1.mvp_points || 0}</span>
                              </div>
                            </div>
                          </div>

                          {/* Chart Column */}
                          <div className="h-72 bg-black/40 p-4 rounded-2xl border border-white/5">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                                <XAxis dataKey="name" stroke="#71717a" fontSize={9} />
                                <YAxis stroke="#71717a" fontSize={9} />
                                <ChartTooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff' }} />
                                <Legend wrapperStyle={{ fontSize: '9px' }} />
                                <Bar dataKey={playerA1.name} fill="#10b981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey={playerB2.name} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>

                          {/* Player 2 Card */}
                          <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex flex-col justify-between">
                            <div>
                              <p className="text-[9px] text-blue-500 uppercase tracking-widest font-black mb-2">Player B</p>
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-zinc-800 overflow-hidden shrink-0 border border-blue-500/30 flex items-center justify-center font-bold">
                                  {playerB2.image_url ? (
                                    <img src={playerB2.image_url} alt={playerB2.name} className="h-full w-full object-cover" />
                                  ) : (
                                    playerB2.name[0]
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <h4 className="font-bold text-sm text-white truncate">{playerB2.name}</h4>
                                  <p className="text-[10px] text-zinc-400 truncate">{playerB2.team_name || 'Unassigned'}</p>
                                </div>
                              </div>
                            </div>
                            <div className="mt-6 pt-4 border-t border-white/5 space-y-2">
                              {isSoccer ? (
                                <>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-zinc-500">Goals</span>
                                    <span className="font-bold text-emerald-500">{playerB2.goals || 0}</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-zinc-500">Yellow Cards</span>
                                    <span className="font-semibold text-amber-500">{playerB2.yellow_cards || 0}</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-zinc-500">Red Cards</span>
                                    <span className="font-bold text-red-500">{playerB2.red_cards || 0}</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-zinc-500">Fouls</span>
                                    <span className="font-semibold text-zinc-400">{playerB2.fouls || 0}</span>
                                  </div>
                                </>
                              ) : isBasketball ? (
                                <>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-zinc-500">Points</span>
                                    <span className="font-bold text-emerald-500">{playerB2.basketball_points || 0}</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-zinc-500">Fouls</span>
                                    <span className="font-semibold text-zinc-400">{playerB2.fouls || 0}</span>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-zinc-500">Runs</span>
                                    <span className="font-bold text-emerald-500">{playerB2.batting?.runs || 0}</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-zinc-500">Strike Rate</span>
                                    <span className="font-semibold text-zinc-300">{playerB2.batting?.sr || '0.00'}</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-zinc-500">Wickets</span>
                                    <span className="font-bold text-blue-400">{playerB2.bowling?.wickets || 0}</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-zinc-500">Economy</span>
                                    <span className="font-semibold text-zinc-300">{playerB2.bowling?.econ || '0.00'}</span>
                                  </div>
                                </>
                              )}
                              <div className="flex justify-between text-xs pt-2 border-t border-white/5">
                                <span className="text-zinc-500 font-bold">MVP Points</span>
                                <span className="font-bold text-emerald-400">{playerB2.mvp_points || 0}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div className="py-8 text-center rounded-2xl border border-dashed border-white/5 bg-black/10 text-zinc-500 text-xs">
                        Please select two players above to run comparison analytics.
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'players' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Tournament Players</h2>
              <div className="flex items-center gap-4">
                <span className="text-sm text-zinc-500">
                  Total Players: {tournament.teams?.reduce((acc: number, team: any) => acc + (team.players?.length || 0), 0)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tournament.teams?.map((team: any) => (
                <div key={team.id} className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900/50 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-zinc-800 flex items-center justify-center font-bold text-xs">
                        {team.name[0]}
                      </div>
                      <h3 className="font-bold text-sm">{team.name}</h3>
                    </div>
                    <span className="text-xs text-zinc-500">{team.players?.length || 0} Players</span>
                  </div>
                  <div className="space-y-2">
                    {team.players?.map((player: any) => (
                      <div key={player.id} className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-white/5 hover:border-white/10 transition-all group">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-zinc-800 overflow-hidden border border-white/10">
                            {player.image_url ? (
                              <img src={player.image_url} alt={player.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-[10px] font-bold">{player.name[0]}</div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{player.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              <span className="text-[10px] text-zinc-500 uppercase tracking-widest">{player.role.replace('_', ' ')}</span>
                              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">
                                {player.sport === 'soccer' ? '⚽ soccer' : player.sport === 'basketball' ? '🏀 basketball' : player.sport === 'tennis' ? '🎾 tennis' : '🏏 cricket'}
                              </span>
                            </div>
                            {player.phone && (
                              <p className="text-[10px] text-zinc-400 font-bold font-mono mt-1 flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-lg w-fit">
                                <span className="text-emerald-400 text-[8px]">📞</span> {player.phone}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => setEditingPlayer(player)}
                            className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-all"
                          >
                            <Settings className="h-3.5 w-3.5" />
                          </button>
                          <button 
                            onClick={() => deletePlayer(player.id)}
                            className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-red-500 transition-all"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {(!team.players || team.players.length === 0) && (
                      <div className="p-4 text-center border border-dashed border-white/5 rounded-xl text-zinc-600 text-xs">
                        No players registered
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'matches' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h2 className="text-xl font-bold">Fixtures & Schedule</h2>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowManualFixture(!showManualFixture)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 text-blue-500 text-sm font-bold hover:bg-blue-500/20 transition-all border border-blue-500/20"
                >
                  <Plus className="h-4 w-4" /> Manual Match
                </button>
                <button 
                  onClick={generateFixtures}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 text-sm font-bold hover:bg-emerald-500/20 transition-all border border-emerald-500/20"
                >
                  Generate Fixtures
                </button>
              </div>
            </div>

            {showManualFixture && (
              <form onSubmit={addManualMatch} className="p-6 rounded-2xl bg-zinc-900 border border-blue-500/25 space-y-4">
                <h3 className="text-md font-bold text-zinc-300">Add Match Manually</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 uppercase font-black">Team 1</label>
                    <select 
                      required
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      value={manualMatch.team1_id}
                      onChange={e => setManualMatch({...manualMatch, team1_id: e.target.value})}
                    >
                      <option value="">Select Team 1</option>
                      {tournament?.teams?.map((t: any) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 uppercase font-black">Team 2</label>
                    <select 
                      required
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      value={manualMatch.team2_id}
                      onChange={e => setManualMatch({...manualMatch, team2_id: e.target.value})}
                    >
                      <option value="">Select Team 2</option>
                      {tournament?.teams?.map((t: any) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 uppercase font-black">Date & Time</label>
                    <input 
                      required
                      type="datetime-local"
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 text-zinc-200"
                      value={manualMatch.match_date}
                      onChange={e => setManualMatch({...manualMatch, match_date: e.target.value})}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 uppercase font-black">Venue</label>
                    <input 
                      required
                      type="text"
                      placeholder="e.g. Main Stadium"
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 text-zinc-200"
                      value={manualMatch.venue}
                      onChange={e => setManualMatch({...manualMatch, venue: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button type="submit" className="bg-emerald-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-400 transition-all">
                    Create Match
                  </button>
                  <button type="button" onClick={() => setShowManualFixture(false)} className="text-zinc-500 text-sm font-medium hover:text-white transition-all">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {editingMatch && (
              <form onSubmit={updateMatch} className="p-6 rounded-2xl bg-zinc-900 border border-blue-500/20 space-y-4">
                <h3 className="text-lg font-bold">Edit Match</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-500 uppercase font-bold">Date & Time</label>
                    <input 
                      required
                      type="datetime-local"
                      className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      value={editingMatch.match_date ? new Date(editingMatch.match_date).toISOString().slice(0, 16) : ''}
                      onChange={e => setEditingMatch({...editingMatch, match_date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-500 uppercase font-bold">Venue</label>
                    <input 
                      required
                      placeholder="Venue"
                      className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      value={editingMatch.venue}
                      onChange={e => setEditingMatch({...editingMatch, venue: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-500 uppercase font-bold">Status</label>
                    <select 
                      className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      value={editingMatch.status}
                      onChange={e => setEditingMatch({...editingMatch, status: e.target.value})}
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="live">Live</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold">Update Match</button>
                  <button type="button" onClick={() => setEditingMatch(null)} className="text-zinc-500 text-sm">Cancel</button>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {tournament.matches?.map((match: Match) => (
                <div key={match.id} className="p-6 rounded-2xl bg-zinc-900/30 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                  <div className="flex items-center gap-8">
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-bold text-zinc-500">MATCH</span>
                      <span className="text-lg font-bold">#{match.id}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold">{match.team1_name || 'TBD'}</p>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-zinc-800 text-[10px] font-bold text-zinc-500">VS</div>
                      <div>
                        <p className="font-bold">{match.team2_name || 'TBD'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <Calendar className="h-3 w-3" /> {new Date(match.match_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <MapPin className="h-3 w-3" /> {match.venue}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setEditingMatch(match)}
                        className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-all"
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => deleteMatch(match.id)}
                        className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      {match.status === 'scheduled' ? (
                        <button 
                          onClick={() => startMatch(match.id)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 text-sm font-bold hover:bg-zinc-700 transition-all"
                        >
                          <Play className="h-3 w-3 fill-current" /> Start Match
                        </button>
                      ) : (
                        <Link to={`/admin/score/${match.id}`} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-sm font-bold hover:bg-emerald-400 transition-all">
                          <Play className="h-3 w-3 fill-current" /> {match.status === 'live' ? 'Continue Scoring' : 'View Scorecard'}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {(!tournament.matches || tournament.matches.length === 0) && (
                <div className="py-12 text-center border border-dashed border-white/10 rounded-2xl text-zinc-500">
                  No matches scheduled yet.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
