import React, { useState, useEffect } from 'react';
import { 
  User, 
  Lock, 
  CreditCard, 
  Calendar, 
  ShoppingBag, 
  Settings as SettingsIcon, 
  ChevronRight, 
  Save,
  Shield,
  Bell,
  Eye,
  EyeOff,
  ArrowLeft,
  LogOut,
  Trophy,
  Sparkles,
  MessageSquare,
  Mail,
  Activity,
  TrendingUp,
  Send,
  Clock,
  CheckCircle2,
  MapPin,
  Truck,
  Navigation,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Link, useNavigate } from 'react-router-dom';

interface SettingsPageProps {
  isAdmin: boolean;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ isAdmin }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab ] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('Changes Saved Successfully!');
  const [themePreference, setThemePreference] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme-preference') || 'dark';
    }
    return 'dark';
  });

  const [profileData, setProfileData] = useState({
    name: isAdmin ? 'Admin User' : 'Normal User',
    email: isAdmin ? 'admin@gamezm.com' : 'user@example.com',
    phone: '+91 98765 43210',
    age: '24',
    location: 'Mumbai, India',
    sport: 'cricket',
    // Cricket specific
    specialization: 'Batsman',
    battingStyle: 'Right-hand Bat',
    bowlingStyle: 'Right-arm Spin',
    jerseyNumber: '18',
    // Soccer specific
    soccerPosition: 'Midfielder',
    soccerFoot: 'Right-footed',
    soccerStyle: 'Playmaker',
    soccerJerseyNumber: '10',
    // Basketball specific
    basketballPosition: 'Point Guard',
    basketballHand: 'Right-hand',
    basketballPlaystyle: 'Playmaking',
    basketballJerseyNumber: '23',
    // Tennis specific
    tennisPlayType: 'Singles',
    tennisHand: 'Right-hand',
    tennisStyle: 'All-Court Player',
    tennisRacketTension: '55 lbs'
  });

  const [historySportTab, setHistorySportTab] = useState<string>('cricket');
  const [selectedTrackingOrderId, setSelectedTrackingOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (profileData.sport) {
      setHistorySportTab(profileData.sport);
    }
  }, [profileData.sport]);

  const [loginData, setLoginData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [userPlan, setUserPlan] = useState<string>('starter');

  // Load user data from localStorage if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem('user_data');
      if (saved) {
        const u = JSON.parse(saved);
        setProfileData(prev => ({
          ...prev,
          name: u.name || prev.name,
          email: u.email || prev.email,
        }));
        if (u.plan) setUserPlan(u.plan);
      }

      const storedProfile = localStorage.getItem('player_profile');
      if (storedProfile) {
        const p = JSON.parse(storedProfile);
        setProfileData(prev => ({
          ...prev,
          ...p
        }));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      try {
        localStorage.setItem('player_profile', JSON.stringify(profileData));
        const saved = localStorage.getItem('user_data');
        const userData = saved ? JSON.parse(saved) : {};
        userData.name = profileData.name;
        userData.email = profileData.email;
        localStorage.setItem('user_data', JSON.stringify(userData));
      } catch (err) {
        console.error(err);
      }
      setSuccessMsg('Player Profile Saved Successfully on KYNTRIVO!');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 1000);
  };

  const handleUpdateLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginData.newPassword !== loginData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSuccessMsg('Login Security updated successfully!');
      setSuccess(true);
      setLoginData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccess(false), 3000);
    }, 1000);
  };

  // Order Tracking states
  const mockOrders = [
    {
      id: 'GZMB-9403',
      product: 'Premium Leather Cricket Balls (Pack of 6)',
      date: 'June 08, 2026',
      total: 2499,
      status: 'Shipped',
      progress: 75,
      eta: 'Tomorrow, by 6:00 PM',
      carrier: 'Delhivery Express'
    },
    {
      id: 'GZMB-8109',
      product: 'KYNTRIVO Performance Bat Grip Tape (White)',
      date: 'May 28, 2026',
      total: 450,
      status: 'Delivered',
      progress: 100,
      eta: 'Delivered on June 02, 2026',
      carrier: 'Blue Dart'
    }
  ];

  // Gear interest list
  const trackedGear = [
    { name: 'Savage Edition Grade 1 English Willow Bat', price: 18499, inStock: true, discount: '5% Off Price Drop' },
    { name: 'KYNTRIVO Ultra-Light Protective Leg Guards', price: 3200, inStock: true },
    { name: 'AeroMax Elite Edition Helmets (Navy)', price: 4100, inStock: false }
  ];

  // Chats states
  const [chats, setChats] = useState([
    { sender: 'Coach Rahul', text: 'Squad, morning practice starts at 6:30 AM sharp tomorrow at State Stadium Net 3!', time: '10:15 AM' },
    { sender: 'Rohit S.', text: 'Noted coach, I am bringing the new match ball with me.', time: '10:22 AM' },
    { sender: 'Arjun K.', text: 'Will the spikes bowling spikes be required or flat soles?', time: '10:45 AM' },
    { sender: 'Coach Rahul', text: 'Spikes are highly recommended for turf wickets.', time: '10:50 AM' }
  ]);
  const [newChatMsg, setNewChatMsg] = useState('');

  const sendTeamChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatMsg.trim()) return;
    setChats(prev => [
      ...prev,
      {
        sender: profileData.name || 'You',
        text: newChatMsg,
        time: 'Just Now'
      }
    ]);
    setNewChatMsg('');
  };

  // Support State
  const [supportForm, setSupportForm] = useState({ category: 'Match score correction', details: '' });
  const [supportSubmitting, setSupportSubmitting] = useState(false);
  const [supportSuccess, setSupportSuccess] = useState(false);

  const submitSupport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportForm.details.trim()) {
      alert("Please enter support details.");
      return;
    }
    setSupportSubmitting(true);
    setTimeout(() => {
      setSupportSubmitting(false);
      setSupportSuccess(true);
      setSupportForm({ category: 'Match score correction', details: '' });
      setTimeout(() => setSupportSuccess(false), 5000);
    }, 1200);
  };

  // Notification Preferences
  const [notifs, setNotifs] = useState({
    matchReminder: true,
    liveScores: true,
    announcements: true,
    practiceUpdates: false
  });

  // AI Analytics State
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);

  const triggerAIAnalysis = () => {
    setAiAnalyzing(true);
    setTimeout(() => {
      setAiAnalyzing(false);
      setAiGenerated(true);
    }, 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem('user_data');
    setSuccessMsg('Logout Successful! Navigating home...');
    setSuccess(true);
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  };

  interface Tab {
    id: string;
    label: string;
    icon: any;
    link?: string;
  }

  const masterAdminTabs: Tab[] = [
    { id: 'profile', label: 'Admin Profile', icon: User },
    { id: 'logins', label: 'Admin Logins & Security', icon: Lock },
    { id: 'create_tournament', label: 'Create Tournament', icon: Trophy, link: '/admin/create' },
    { id: 'dashboard', label: 'Organizer Dashboard', icon: Activity, link: '/admin' },
    { id: 'bookings', label: 'Manage Ground Bookings', icon: Calendar, link: '/admin/grounds' },
    { id: 'shop', label: 'Manage Shop', icon: ShoppingBag, link: '/admin/shop' },
    { id: 'payment', label: 'Payment Settings', icon: CreditCard, link: '/admin/payment-settings' },
    { id: 'other', label: 'Other Settings', icon: SettingsIcon },
    { id: 'logout_action', label: 'Logout', icon: LogOut }
  ];

  const sellerAndGroundOwnerTabs: Tab[] = [
    { id: 'profile', label: 'Merchant Profile', icon: User },
    { id: 'logins', label: 'Login Security', icon: Lock },
    { id: 'bookings', label: 'Manage Ground Bookings', icon: Calendar, link: '/admin/grounds' },
    { id: 'shop', label: 'Manage Shop & Products', icon: ShoppingBag, link: '/admin/shop' },
    { id: 'payment', label: 'Payment Settings', icon: CreditCard, link: '/admin/payment-settings' },
    { id: 'order_tracking', label: 'Order Tracking', icon: Clock },
    { id: 'email_support', label: 'Merchant Support', icon: Mail },
    { id: 'logout_action', label: 'Logout', icon: LogOut }
  ];

  const organizerTabs: Tab[] = [
    { id: 'profile', label: 'Organizer Profile', icon: User },
    { id: 'logins', label: 'Login Security', icon: Lock },
    { id: 'create_tournament', label: 'Create Tournament', icon: Trophy, link: '/admin/create' },
    { id: 'dashboard', label: 'Organizer Dashboard', icon: Activity, link: '/admin' },
    { id: 'payment', label: 'Payment Settings', icon: CreditCard, link: '/admin/payment-settings' },
    { id: 'notifications', label: 'Match Schedule Notifications', icon: Bell },
    { id: 'email_support', label: 'Basic Email Support', icon: Mail },
    { id: 'logout_action', label: 'Logout', icon: LogOut }
  ];

  const freePlayerTabs: Tab[] = [
    { id: 'profile', label: 'Player Profile Creation', icon: User },
    { id: 'logins', label: 'Login Security', icon: Lock },
    { id: 'order_tracking', label: 'Order Tracking', icon: Clock },
    { id: 'match_history', label: 'Match History & Statistics', icon: Trophy },
    { id: 'products_tracking', label: 'Buy Sports Gear & Products Tracking', icon: ShoppingBag },
    { id: 'team_chats', label: 'Team Chats & Social Feed', icon: MessageSquare },
    { id: 'notifications', label: 'Match Schedule Notifications', icon: Bell },
    { id: 'email_support', label: 'Basic Email Support', icon: Mail },
    { id: 'ai_analytics', label: 'AI Performance Analytics', icon: Sparkles },
    { id: 'logout_action', label: 'Logout', icon: LogOut },
  ];

  let tabs = freePlayerTabs;
  if (isAdmin) {
    tabs = masterAdminTabs;
  } else if (userPlan === 'pro') {
    tabs = sellerAndGroundOwnerTabs;
  } else if (userPlan === 'organizer') {
    tabs = organizerTabs;
  }

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Back Button */}
        <div className="mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white text-xs font-bold uppercase tracking-wider transition-all duration-200 group bg-zinc-900/40 border border-white/5 hover:border-white/10 px-4 py-2.5 rounded-xl cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-12">
          {/* Sidebar */}
          <div className="w-full md:w-80 space-y-2">
            <div className="mb-6 p-6 rounded-2xl bg-zinc-900/40 border border-white/5">
              <h1 className="text-2xl font-black tracking-tighter uppercase">
                {isAdmin ? 'Master Admin' : userPlan === 'pro' ? 'Seller & Ground' : userPlan === 'organizer' ? 'Organizer' : 'Player'} <span className="text-emerald-500">Settings</span>
              </h1>
              <p className="text-zinc-500 text-[10px] mt-1 lg:mt-2 uppercase tracking-widest font-black">
                Personalized Workspace Panel
              </p>
              <div className="mt-4 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-wider inline-block">
                Plan: {isAdmin ? 'Master Administrator' : userPlan === 'pro' ? 'Seller & Ground Owner' : userPlan === 'organizer' ? 'Tournament Organizer' : 'Free Player'}
              </div>
            </div>

            <div className="space-y-1">
              {tabs.map((tab) => (
                tab.link ? (
                  <Link 
                    key={tab.id}
                    to={tab.link}
                    className="flex items-center justify-between w-full px-4 py-3.5 rounded-2xl bg-zinc-900/20 border border-white/5 text-zinc-400 hover:text-white hover:border-emerald-500/30 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <tab.icon className="h-4 w-4 shrink-0 text-zinc-500 group-hover:text-emerald-500 transition-colors" />
                      <span className="text-xs font-bold">{tab.label}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all text-emerald-500" />
                  </Link>
                ) : (
                  <button
                    key={tab.id}
                    onClick={() => {
                      if (tab.id === 'logout_action') {
                        handleLogout();
                      } else {
                        setActiveTab(tab.id);
                      }
                    }}
                    className={cn(
                      "flex items-center justify-between w-full px-4 py-3.5 rounded-2xl border transition-all text-left cursor-pointer group",
                      activeTab === tab.id 
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" 
                        : "bg-zinc-900/10 border-white/5 text-zinc-400 hover:text-white hover:border-emerald-500/20"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <tab.icon className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        activeTab === tab.id ? "text-emerald-500" : "text-zinc-500 group-hover:text-emerald-500"
                      )} />
                      <span className="text-xs font-bold">{tab.label}</span>
                    </div>
                    <ChevronRight className={cn(
                      "h-4 w-4 transition-all text-emerald-500",
                      activeTab === tab.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    )} />
                  </button>
                )
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 bg-zinc-950/20 rounded-3xl border border-white/5 p-4 sm:p-8">
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="p-2 sm:p-6 rounded-3xl bg-zinc-900/30 border border-white/5">
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                      <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                          <User className="h-5 w-5 text-emerald-500" />
                          {isAdmin ? 'Admin Profile' : userPlan === 'pro' ? 'Merchant Profile' : userPlan === 'organizer' ? 'Organizer Profile' : 'Player Profile Creation'}
                        </h2>
                        <p className="text-xs text-zinc-500 mt-1">Manage profile details and account contact information</p>
                      </div>
                      <Trophy className="h-8 w-8 text-emerald-500/20" />
                    </div>

                    <form onSubmit={handleSaveProfile} className="space-y-8">
                      {(isAdmin || userPlan === 'pro' || userPlan === 'organizer') ? (
                        /* Simplified Profile Form for Admin, Merchant & Organizer */
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Profile Name</label>
                              <input 
                                type="text"
                                required
                                value={profileData.name}
                                onChange={e => setProfileData({...profileData, name: e.target.value})}
                                placeholder="Enter full profile name"
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-white"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Mobile Number</label>
                              <input 
                                type="tel"
                                required
                                value={profileData.phone}
                                onChange={e => setProfileData({...profileData, phone: e.target.value})}
                                placeholder="e.g. +91 9876543210"
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-white"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Age</label>
                              <input 
                                type="number"
                                required
                                value={profileData.age}
                                onChange={e => setProfileData({...profileData, age: e.target.value})}
                                placeholder="Enter age"
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-white"
                              />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Address</label>
                              <textarea 
                                rows={3}
                                required
                                value={profileData.location}
                                onChange={e => setProfileData({...profileData, location: e.target.value})}
                                placeholder="Enter full address details"
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-white resize-none"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Player Full Profile Form */
                        <>
                          <div className="space-y-3 pb-6 border-b border-white/5">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">
                              Choose Active Sport Profile
                            </label>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                              {[
                                { id: 'cricket', name: 'Cricket', icon: '🏏', desc: 'Batsman, bowler, spin, fast statistics & styles' },
                                { id: 'soccer', name: 'Soccer / Football', icon: '⚽', desc: 'Playing positions, preferred foot & playstyles' },
                                { id: 'basketball', name: 'Basketball', icon: '🏀', desc: 'PG/SG/Center court layout & dominant hand' },
                                { id: 'tennis', name: 'Tennis & Rackets', icon: '🎾', desc: 'Format, serve playstyles & string tension' },
                              ].map((sportItem) => {
                                const isSelected = profileData.sport === sportItem.id;
                                return (
                                  <button
                                    key={sportItem.id}
                                    type="button"
                                    onClick={() => setProfileData(prev => ({ ...prev, sport: sportItem.id }))}
                                    className={cn(
                                      "p-4 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden group cursor-pointer",
                                      isSelected 
                                        ? "bg-emerald-500/10 border-emerald-500 text-white shadow-lg shadow-emerald-500/5 animate-pulse-subtle" 
                                        : "bg-black/50 border-white/5 text-zinc-400 hover:text-white hover:border-emerald-500/20"
                                    )}
                                  >
                                    {isSelected && (
                                      <div className="absolute top-0 right-0 w-3 h-3 bg-emerald-500 rounded-bl-md" />
                                    )}
                                    <div className="text-2xl mb-2">{sportItem.icon}</div>
                                    <p className="text-xs font-black uppercase tracking-tight">{sportItem.name}</p>
                                    <p className="text-[9px] text-zinc-500 mt-1 leading-snug">{sportItem.desc}</p>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h3 className="text-xs font-black text-emerald-500 uppercase tracking-widest">A. Core Athlete Biography</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Full Athlete Name</label>
                                <input 
                                  type="text"
                                  required
                                  value={profileData.name}
                                  onChange={e => setProfileData({...profileData, name: e.target.value})}
                                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-white"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Registered Email</label>
                                <input 
                                  type="email"
                                  required
                                  value={profileData.email}
                                  onChange={e => setProfileData({...profileData, email: e.target.value})}
                                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-white"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Athlete Contact Mobile</label>
                                <input 
                                  type="tel"
                                  value={profileData.phone}
                                  onChange={e => setProfileData({...profileData, phone: e.target.value})}
                                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-white"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Age (Years)</label>
                                <input 
                                  type="number"
                                  value={profileData.age}
                                  onChange={e => setProfileData({...profileData, age: e.target.value})}
                                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-white"
                                />
                              </div>
                              <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Play Location City</label>
                                <input 
                                  type="text"
                                  value={profileData.location}
                                  onChange={e => setProfileData({...profileData, location: e.target.value})}
                                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-white"
                                  placeholder="e.g. Mumbai, India"
                                />
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Sport-Specific Selection Attributes */}
                      {(!isAdmin && userPlan !== 'pro' && userPlan !== 'organizer') && (
                        <div className="pt-6 border-t border-white/5 space-y-4">
                          <h3 className="text-xs font-black text-emerald-500 uppercase tracking-widest">
                            B. {profileData.sport ? profileData.sport.toUpperCase() : 'SPORT'} Specialized Attributes
                          </h3>

                          <AnimatePresence mode="wait">
                            {profileData.sport === 'cricket' && (
                            <motion.div
                              key="cricket-fields"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="grid grid-cols-1 md:grid-cols-2 gap-6"
                            >
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Player Specialization</label>
                                <select 
                                  value={profileData.specialization}
                                  onChange={e => setProfileData({...profileData, specialization: e.target.value})}
                                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-zinc-300"
                                >
                                  <option value="Batsman">Batsman</option>
                                  <option value="Bowler">Bowler</option>
                                  <option value="All-Rounder">All-Rounder</option>
                                  <option value="Wicketkeeper">Wicketkeeper-Batsman</option>
                                </select>
                              </div>

                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Batting Style</label>
                                <select 
                                  value={profileData.battingStyle}
                                  onChange={e => setProfileData({...profileData, battingStyle: e.target.value})}
                                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-zinc-300"
                                >
                                  <option value="Right-hand Bat">Right-hand bat</option>
                                  <option value="Left-hand Bat">Left-hand bat</option>
                                </select>
                              </div>

                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Bowling Style</label>
                                <select 
                                  value={profileData.bowlingStyle}
                                  onChange={e => setProfileData({...profileData, bowlingStyle: e.target.value})}
                                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-zinc-300"
                                >
                                  <option value="Right-arm Spin">Right-arm spin</option>
                                  <option value="Right-arm Fast">Right-arm fast</option>
                                  <option value="Left-arm Spin">Left-arm spin</option>
                                  <option value="Left-arm Fast">Left-arm fast</option>
                                  <option value="None">None (Pure Batsman)</option>
                                </select>
                              </div>

                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Favorite Jersey Number</label>
                                <input 
                                  type="text"
                                  placeholder="e.g. 18"
                                  value={profileData.jerseyNumber}
                                  onChange={e => setProfileData({...profileData, jerseyNumber: e.target.value})}
                                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-white"
                                />
                              </div>
                            </motion.div>
                          )}

                          {profileData.sport === 'soccer' && (
                            <motion.div
                              key="soccer-fields"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="grid grid-cols-1 md:grid-cols-2 gap-6"
                            >
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Soccer Position</label>
                                <select 
                                  value={profileData.soccerPosition}
                                  onChange={e => setProfileData({...profileData, soccerPosition: e.target.value})}
                                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-zinc-300"
                                >
                                  <option value="Goalkeeper">Goalkeeper</option>
                                  <option value="Defender">Defender (CB/RB/LB)</option>
                                  <option value="Midfielder">Midfielder (CM/CDM/CAM)</option>
                                  <option value="Forward">Forward / Out-and-out Striker</option>
                                </select>
                              </div>

                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Preferred Foot</label>
                                <select 
                                  value={profileData.soccerFoot}
                                  onChange={e => setProfileData({...profileData, soccerFoot: e.target.value})}
                                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-zinc-300"
                                >
                                  <option value="Right-footed">Right-footed only</option>
                                  <option value="Left-footed">Left-footed only</option>
                                  <option value="Both">Ambidextrous (Equally skilled both feet)</option>
                                </select>
                              </div>

                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Tactical Playstyle</label>
                                <select 
                                  value={profileData.soccerStyle}
                                  onChange={e => setProfileData({...profileData, soccerStyle: e.target.value})}
                                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-zinc-300"
                                >
                                  <option value="Playmaker">Playmaker (Tempo controller)</option>
                                  <option value="Target Man">Target Man / Hold-up striker</option>
                                  <option value="Box-to-Box">Box-to-Box engine</option>
                                  <option value="Winger">Winger / Direct dribbler</option>
                                  <option value="Defensive Anchor">Defensive Anchor</option>
                                </select>
                              </div>

                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Soccer Squad Jersey Number</label>
                                <input 
                                  type="text"
                                  placeholder="e.g. 10"
                                  value={profileData.soccerJerseyNumber}
                                  onChange={e => setProfileData({...profileData, soccerJerseyNumber: e.target.value})}
                                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-white"
                                />
                              </div>
                            </motion.div>
                          )}

                          {profileData.sport === 'basketball' && (
                            <motion.div
                              key="basketball-fields"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="grid grid-cols-1 md:grid-cols-2 gap-6"
                            >
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Court Position</label>
                                <select 
                                  value={profileData.basketballPosition}
                                  onChange={e => setProfileData({...profileData, basketballPosition: e.target.value})}
                                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-zinc-300"
                                >
                                  <option value="Point Guard">Point Guard (PG)</option>
                                  <option value="Shooting Guard">Shooting Guard (SG)</option>
                                  <option value="Small Forward">Small Forward (SF)</option>
                                  <option value="Power Forward">Power Forward (PF)</option>
                                  <option value="Center">Center (C)</option>
                                </select>
                              </div>

                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Dominant Shooting Hand</label>
                                <select 
                                  value={profileData.basketballHand}
                                  onChange={e => setProfileData({...profileData, basketballHand: e.target.value})}
                                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-zinc-300"
                                >
                                  <option value="Right-hand">Right-handed shooter</option>
                                  <option value="Left-hand">Left-handed shooter</option>
                                  <option value="Ambidextrous">Ambidextrous / Dual threat</option>
                                </select>
                              </div>

                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Dominant Playstyle</label>
                                <select 
                                  value={profileData.basketballPlaystyle}
                                  onChange={e => setProfileData({...profileData, basketballPlaystyle: e.target.value})}
                                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-zinc-300"
                                >
                                  <option value="Playmaking">Playmaker & Dribbler</option>
                                  <option value="Three-Point Specialist">Three-Point Sniper</option>
                                  <option value="Inside Scorer">Inside Force / Dunker</option>
                                  <option value="Lockdown Defender">On-ball Perimeter Defender</option>
                                  <option value="Rebounder">Glass Cleaner / Rebound Specialist</option>
                                </select>
                              </div>

                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Favorite Basketball Jersey</label>
                                <input 
                                  type="text"
                                  placeholder="e.g. 23"
                                  value={profileData.basketballJerseyNumber}
                                  onChange={e => setProfileData({...profileData, basketballJerseyNumber: e.target.value})}
                                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-white"
                                />
                              </div>
                            </motion.div>
                          )}

                          {profileData.sport === 'tennis' && (
                            <motion.div
                              key="tennis-fields"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="grid grid-cols-1 md:grid-cols-2 gap-6"
                            >
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Preferred Match Format</label>
                                <select 
                                  value={profileData.tennisPlayType}
                                  onChange={e => setProfileData({...profileData, tennisPlayType: e.target.value})}
                                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-zinc-300"
                                >
                                  <option value="Singles">Singles</option>
                                  <option value="Doubles">Doubles</option>
                                  <option value="Mixed Doubles">Mixed Doubles</option>
                                </select>
                              </div>

                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Racket Handling Grip</label>
                                <select 
                                  value={profileData.tennisHand}
                                  onChange={e => setProfileData({...profileData, tennisHand: e.target.value})}
                                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-zinc-300"
                                >
                                  <option value="Right-hand">Right-handed, Single Backhand</option>
                                  <option value="Right-hand Double">Right-handed, Double Backhand</option>
                                  <option value="Left-hand">Left-handed, Single Backhand</option>
                                  <option value="Left-hand Double">Left-handed, Double Backhand</option>
                                </select>
                              </div>

                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Court Archetype</label>
                                <select 
                                  value={profileData.tennisStyle}
                                  onChange={e => setProfileData({...profileData, tennisStyle: e.target.value})}
                                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-zinc-300"
                                >
                                  <option value="All-Court Player">All-Court Player (Federer style)</option>
                                  <option value="Aggressive Baseliner">Aggressive Baseliner (Nadal/Djokovic style)</option>
                                  <option value="Serve and Volley">Serve and Volley (Sampras style)</option>
                                  <option value="Counter Puncher">Counter Puncher</option>
                                </select>
                              </div>

                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">String Tension Preference</label>
                                <input 
                                  type="text"
                                  placeholder="e.g. 52-56 lbs (high control)"
                                  value={profileData.tennisRacketTension}
                                  onChange={e => setProfileData({...profileData, tennisRacketTension: e.target.value})}
                                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-white"
                                />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      )}

                      <div className="pt-6 border-t border-white/5 flex justify-end">
                        <button 
                          type="submit"
                          disabled={saving}
                          className="flex items-center gap-2 bg-emerald-500 text-black font-black uppercase text-xs tracking-widest px-8 py-3.5 rounded-xl hover:bg-emerald-400 transition-all disabled:opacity-50 cursor-pointer"
                        >
                          <Save className="h-4 w-4" />
                          {saving ? 'Creating Profile...' : 'Create & Save Profile'}
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}

              {activeTab === 'logins' && (
                <motion.div
                  key="logins"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="p-2 sm:p-6 rounded-3xl bg-zinc-900/30 border border-white/5">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <Lock className="h-5 w-5 text-emerald-500" />
                      Login Security Settings
                    </h2>
                    <form onSubmit={handleUpdateLogin} className="space-y-6">
                      <div className="space-y-4 max-w-md">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Current Password</label>
                          <div className="relative">
                            <input 
                              type={showPassword ? "text" : "password"}
                              value={loginData.currentPassword}
                              onChange={e => setLoginData({...loginData, currentPassword: e.target.value})}
                              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                            />
                            <button 
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">New Password</label>
                          <input 
                            type="password"
                            value={loginData.newPassword}
                            onChange={e => setLoginData({...loginData, newPassword: e.target.value})}
                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Confirm New Password</label>
                          <input 
                            type="password"
                            value={loginData.confirmPassword}
                            onChange={e => setLoginData({...loginData, confirmPassword: e.target.value})}
                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                          />
                        </div>
                      </div>
                      <button 
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 bg-emerald-500 text-black font-extrabold px-8 py-3.5 rounded-xl hover:bg-emerald-400 text-xs uppercase tracking-widest transition-all disabled:opacity-50 cursor-pointer"
                      >
                        <Shield className="h-4 w-4" />
                        {saving ? 'Updating...' : 'Update Password'}
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}

              {activeTab === 'order_tracking' && (
                <motion.div
                  key="order_tracking"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="p-2 sm:p-6 rounded-3xl bg-zinc-900/30 border border-white/5">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                          <Clock className="h-5 w-5 text-emerald-500" />
                          Order Tracking
                        </h2>
                        <p className="text-xs text-zinc-500 mt-1">Track the status of your sports equipment purchased via KYNTRIVO store</p>
                      </div>
                      <ShoppingBag className="h-8 w-8 text-emerald-500/20" />
                    </div>

                    <div className="space-y-6">
                      {mockOrders.map(order => (
                        <div key={order.id} className="p-6 rounded-2xl bg-black border border-white/5 space-y-4">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                            <div>
                              <p className="text-xs font-black text-zinc-500 uppercase">Order ID</p>
                              <p className="font-mono text-sm text-emerald-500 font-bold">#{order.id}</p>
                            </div>
                            <div>
                              <p className="text-xs font-black text-zinc-500 uppercase sm:text-right">Product Item</p>
                              <p className="text-sm font-bold text-white">{order.product}</p>
                            </div>
                            <div>
                              <p className="text-xs font-black text-zinc-500 uppercase sm:text-right">Total Amount</p>
                              <p className="text-sm font-black text-emerald-400 text-right">₹{order.total}</p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-zinc-400">
                              <span className="inline-flex items-center gap-1.5 font-bold">
                                Status: <span className={cn(
                                  "px-2 py-0.5 rounded-full text-[10px] uppercase font-black tracking-widest",
                                  order.status === 'Shipped' ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                )}>{order.status}</span>
                              </span>
                              <span className="font-medium text-zinc-500">ETA: {order.eta}</span>
                            </div>

                            {/* Tracking progress line */}
                            <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden relative">
                              <div 
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" 
                                style={{ width: `${order.progress}%` }}
                              />
                            </div>

                            <div className="flex justify-between items-center text-[9px] text-zinc-600 font-bold uppercase tracking-wider">
                              <span>Placed</span>
                              <span>Processed</span>
                              <span>In Transit</span>
                              <span>Delivered</span>
                            </div>
                          </div>

                          <div className="bg-zinc-950 p-3 rounded-xl border border-white/5 text-xs text-zinc-400 flex items-center justify-between">
                            <span>Shipment Carrier: <strong className="text-zinc-200">{order.carrier}</strong></span>
                            <button 
                              onClick={() => setSelectedTrackingOrderId(order.id)}
                              type="button"
                              className="text-[10px] text-emerald-500 font-extrabold hover:underline uppercase tracking-wider cursor-pointer flex items-center gap-1 bg-transparent border-0"
                            >
                              <MapPin className="h-3 w-3" /> Live Tracking Map →
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'match_history' && (
                <motion.div
                  key="match_history"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="p-2 sm:p-6 rounded-3xl bg-zinc-900/30 border border-white/5 text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                      <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                          <Trophy className="h-5 w-5 text-emerald-500" />
                          Match History & Statistics
                        </h2>
                        <p className="text-xs text-zinc-500 mt-1">Review your personal career benchmarks and historical scores compiled on KYNTRIVO</p>
                      </div>
                      <Activity className="h-8 w-8 text-emerald-500/20" />
                    </div>

                    {/* Active Sport History Selection Tabs */}
                    <div className="flex border-b border-white/5 mb-8 gap-4 overflow-x-auto pb-2">
                      {[
                        { id: 'cricket', label: 'Cricket 🏏' },
                        { id: 'soccer', label: 'Soccer ⚽' },
                        { id: 'basketball', label: 'Basketball 🏀' },
                        { id: 'tennis', label: 'Tennis 🎾' }
                      ].map(sportTab => (
                        <button
                          key={sportTab.id}
                          type="button"
                          onClick={() => setHistorySportTab(sportTab.id)}
                          className={cn(
                            "px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border transition-all cursor-pointer whitespace-nowrap",
                            historySportTab === sportTab.id 
                              ? "bg-emerald-500 text-black border-emerald-500 font-extrabold shadow-lg shadow-emerald-500/10" 
                              : "bg-black/50 text-zinc-400 border-white/5 hover:text-white hover:border-white/10"
                          )}
                        >
                          {sportTab.label}
                        </button>
                      ))}
                    </div>

                    {/* Dynamic Stats Metrics display */}
                    {(() => {
                      const statsData: Record<string, { metrics: Array<{ label: string, value: string, color: string }>, matches: Array<{ opp: string, score: string, role: string, result: string, date: string }> }> = {
                        cricket: {
                          metrics: [
                            { label: 'Career Matches', value: '24', color: 'text-white' },
                            { label: 'Total Runs', value: '742', color: 'text-emerald-500' },
                            { label: 'Strike Rate', value: '138.40', color: 'text-amber-500' },
                            { label: 'Wickets Taken', value: '18', color: 'text-teal-400' }
                          ],
                          matches: [
                            { opp: 'Warriors XI', score: '54 (32 balls)', role: 'Batting at #3', result: 'Won by 4 wickets', date: 'June 04, 2026' },
                            { opp: 'Supernovas CC', score: '31 (18 balls) & 2/15', role: 'All-Rounder', result: 'Lost by 12 runs', date: 'May 30, 2026' },
                            { opp: 'Titans Club', score: '89* (48 balls)', role: 'Batting at #3', result: 'Won by 6 wickets (MVP)', date: 'May 25, 2026' },
                            { opp: 'Royal Strikers', score: '12 (10 balls) & 1/24', role: 'All-Rounder', result: 'Won by 42 runs', date: 'May 18, 2026' },
                            { opp: 'Mavericks United', score: '45 (30 balls) & 3/10', role: 'All-Rounder', result: 'Won by 8 runs (MVP)', date: 'May 10, 2026' }
                          ]
                        },
                        soccer: {
                          metrics: [
                            { label: 'Matches Played', value: '18', color: 'text-white' },
                            { label: 'Goals Scored', value: '12', color: 'text-emerald-500' },
                            { label: 'Total Assists', value: '9', color: 'text-amber-500' },
                            { label: 'Pass Accuracy', value: '88.5%', color: 'text-teal-400' }
                          ],
                          matches: [
                            { opp: 'FC Strikers', score: '2 Goals, 1 Assist', role: 'Midfielder (CAM)', result: 'Won 4-2 (MVP)', date: 'June 02, 2026' },
                            { opp: 'Rovers FC', score: '1 Assist, 4 Key Passes', role: 'Playmaker', result: 'Drew 1-1', date: 'May 28, 2026' },
                            { opp: 'United FC', score: '1 Goal, 2 Interceptions', role: 'Box-to-Box Midfielder', result: 'Won 2-0', date: 'May 22, 2026' },
                            { opp: 'Dynamo Club', score: '0 Goals, 0 Assists', role: 'Midfielder', result: 'Won 1-0', date: 'May 15, 2026' },
                            { opp: 'Real Challengers', score: '1 Goal (Penalty)', role: 'CAM', result: 'Lost 2-3', date: 'May 08, 2026' }
                          ]
                        },
                        basketball: {
                          metrics: [
                            { label: 'Matches Played', value: '32', color: 'text-white' },
                            { label: 'Points Per Game', value: '21.4', color: 'text-emerald-500' },
                            { label: 'Assists Per Game', value: '6.8', color: 'text-amber-500' },
                            { label: 'Rebounds Avg', value: '4.2', color: 'text-teal-400' }
                          ],
                          matches: [
                            { opp: 'Mavericks Hoop', score: '28 PTS, 8 AST, 3 STL', role: 'Point Guard', result: 'Won by 8 pts (MVP)', date: 'June 05, 2026' },
                            { opp: 'Lakers Club', score: '18 PTS, 10 AST, 5 REB', role: 'Double-Double PG', result: 'Won by 14 pts', date: 'May 29, 2026' },
                            { opp: 'Celtics Elite', score: '22 PTS, 5 AST', role: 'Point Guard', result: 'Lost by 2 pts', date: 'May 23, 2026' },
                            { opp: 'Chicago Bulls Academy', score: '15 PTS, 12 AST', role: 'Point Guard', result: 'Won by 11 pts', date: 'May 16, 2026' },
                            { opp: 'Golden Hawks', score: '32 PTS, 7 AST (Season High)', role: 'PG (Hot streak)', result: 'Won by 15 pts (MVP)', date: 'May 09, 2026' }
                          ]
                        },
                        tennis: {
                          metrics: [
                            { label: 'Matches Played', value: '15', color: 'text-white' },
                            { label: 'Match Record', value: '11-4', color: 'text-emerald-500' },
                            { label: 'Total Aces', value: '58', color: 'text-amber-500' },
                            { label: '1st Serve Win %', value: '74.5%', color: 'text-teal-400' }
                          ],
                          matches: [
                            { opp: 'Rohan Mehta', score: '6-4, 3-6, 10-8', role: 'Singles format', result: 'Won (MVP)', date: 'June 01, 2026' },
                            { opp: 'David Kim', score: '6-2, 6-3', role: 'Singles format', result: 'Won (Straight sets)', date: 'May 27, 2026' },
                            { opp: 'Alex Mercer', score: '4-6, 5-7', role: 'Singles format', result: 'Lost (Tight Sets)', date: 'May 20, 2026' },
                            { opp: 'Samir Patil', score: '6-1, 6-4', role: 'Singles match', result: 'Won', date: 'May 14, 2026' },
                            { opp: 'Gaurav Sen', score: '6-3, 3-6, 6-2', role: 'Singles match', result: 'Won', date: 'May 07, 2026' }
                          ]
                        }
                      };

                      const currentSportStats = statsData[historySportTab] || statsData.cricket;

                      return (
                        <div className="space-y-8 animate-fade-in">
                          {/* Metrics grids */}
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {currentSportStats.metrics.map((m, idx) => (
                              <div key={idx} className="p-4 rounded-2xl bg-black border border-white/5 text-center">
                                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">{m.label}</p>
                                <p className={cn("text-2xl font-black", m.color)}>{m.value}</p>
                              </div>
                            ))}
                          </div>

                          {/* Timelines */}
                          <div className="space-y-4">
                            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                              <span>Recent {historySportTab.toUpperCase()} Performance Timeline</span>
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            </h3>
                            <div className="space-y-3">
                              {currentSportStats.matches.map((m, idx) => (
                                <div key={idx} className="p-4 rounded-xl bg-zinc-900/35 border border-white/5 flex items-center justify-between text-xs hover:border-emerald-500/20 transition-all">
                                  <div>
                                    <p className="font-bold text-white">vs. {m.opp}</p>
                                    <p className="text-[10px] text-zinc-500 mt-1">{m.date} | {m.role}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-black text-emerald-400">{m.score}</p>
                                    <p className="text-[10px] text-zinc-500 mt-1 leading-none">{m.result}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </motion.div>
              )}

              {activeTab === 'products_tracking' && (
                <motion.div
                  key="products_tracking"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="p-2 sm:p-6 rounded-3xl bg-zinc-900/30 border border-white/5">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                          <ShoppingBag className="h-5 w-5 text-emerald-500" />
                          Buy Sports Gear & Products Tracking
                        </h2>
                        <p className="text-xs text-zinc-500 mt-1">Browse, buy or track recent trending gear tagged from KYNTRIVO Sports Merchandise Shop</p>
                      </div>
                      <Link to="/shop" className="px-4 py-2 bg-emerald-500 text-black text-xs font-black uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition-all">
                        Go to Shop
                      </Link>
                    </div>

                    <div className="mb-6 bg-zinc-950 p-6 rounded-2xl border border-white/5 text-center space-y-4">
                      <h3 className="text-sm font-bold text-white">Looking for custom kit or bat modifications?</h3>
                      <p className="text-xs text-zinc-400 max-w-xl mx-auto leading-relaxed">Our unified merchant platform connects you with top-grade English Willow, professional gloves, protective gears and customized team kits with customized jersey prints.</p>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Tracked & Pinned Gear</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {trackedGear.map((gear, id) => (
                          <div key={id} className="p-4 rounded-xl bg-black border border-white/5 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start mb-2">
                                <span className={cn(
                                  "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                                  gear.inStock ? "bg-emerald-500/15 text-emerald-500" : "bg-red-500/15 text-red-500"
                                )}>{gear.inStock ? 'In Stock' : 'Out of Stock'}</span>
                                {gear.discount && <span className="text-[8px] font-black text-amber-500 uppercase">{gear.discount}</span>}
                              </div>
                              <p className="text-xs font-bold text-zinc-300 md:line-clamp-2 h-8 mt-1">{gear.name}</p>
                            </div>
                            <div className="pt-4 mt-2 border-t border-white/5 flex justify-between items-center">
                              <span className="text-emerald-400 font-bold text-sm">₹{gear.price.toLocaleString()}</span>
                              <Link to="/shop" className="text-[10px] text-zinc-500 hover:text-white uppercase font-black hover:underline cursor-pointer">Quick Buy →</Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'team_chats' && (
                <motion.div
                  key="team_chats"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="p-2 sm:p-6 rounded-3xl bg-zinc-900/30 border border-white/5">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                      <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                          <MessageSquare className="h-5 w-5 text-emerald-500" />
                          Team Chats & Social Feed
                        </h2>
                        <p className="text-xs text-zinc-500 mt-1 font-medium">Coordinate, chat, and keep up with peer teammate rosters on KYNTRIVO</p>
                      </div>
                      <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>

                    <div className="space-y-4">
                      {/* Chat screen box */}
                      <div className="bg-black/40 border border-white/5 rounded-2xl p-4 h-[280px] overflow-y-auto space-y-4 flex flex-col justify-end">
                        <div className="space-y-3">
                          {chats.map((chat, idx) => (
                            <div key={idx} className={cn(
                              "flex flex-col gap-1 p-3 rounded-xl max-w-[80%] text-xs",
                              chat.sender === profileData.name ? "bg-emerald-500/10 text-emerald-300 ml-auto border border-emerald-500/10" : "bg-zinc-900 text-zinc-300"
                            )}>
                              <div className="flex items-center gap-2 font-black text-[10px] text-zinc-500">
                                <span>{chat.sender}</span>
                                <span>•</span>
                                <span>{chat.time}</span>
                              </div>
                              <p className="leading-relaxed font-medium">{chat.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Reply Form */}
                      <form onSubmit={sendTeamChat} className="flex gap-2">
                        <input 
                          type="text"
                          placeholder="Type team update..."
                          value={newChatMsg}
                          onChange={e => setNewChatMsg(e.target.value)}
                          className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                        />
                        <button 
                          type="submit"
                          className="px-6 rounded-xl bg-emerald-500 text-black font-black hover:bg-emerald-400 transition-all flex items-center justify-center cursor-pointer"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </form>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="p-2 sm:p-6 rounded-3xl bg-zinc-900/30 border border-white/5">
                    <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                      <Bell className="h-5 w-5 text-emerald-500" />
                      Match Schedule Notifications
                    </h2>
                    <p className="text-xs text-zinc-500 mb-6">Maintain seamless updates so you never miss a toss, booking or roster change</p>

                    {/* Athlete registration mobile number indicator */}
                    <div className="mb-6 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left">
                      <div className="flex gap-3">
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 h-9 w-9 flex items-center justify-center font-bold shrink-0">
                          📱
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">SMS Notification Target Contact</p>
                          <p className="font-mono text-sm text-emerald-400 font-extrabold mt-0.5">
                            {profileData.phone ? profileData.phone : 'Not provided yet (Update in profile)'}
                          </p>
                          <p className="text-[10px] text-zinc-500 mt-1">SMS toss indicators, game reminders, and product tracking links will be instantly routed to this athlete contact.</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('profile')}
                        className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-[10px] font-black uppercase tracking-widest text-emerald-500 rounded-lg shrink-0 transition-all border border-emerald-500/15 cursor-pointer"
                      >
                        Edit Contact
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-black border border-white/5">
                        <div>
                          <p className="text-xs font-bold text-white">Next Match Reminders (2 hours beforehand)</p>
                          <p className="text-[10px] text-zinc-500 mt-1">Get local alerts right before the game for prompt arrivals</p>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setNotifs({...notifs, matchReminder: !notifs.matchReminder})}
                          className={cn(
                            "w-10 h-5.5 rounded-full relative transition-colors duration-300 cursor-pointer",
                            notifs.matchReminder ? "bg-emerald-500" : "bg-zinc-800"
                          )}
                        >
                          <div className={cn(
                            "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300",
                            notifs.matchReminder ? "right-0.5" : "left-0.5"
                          )} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-xl bg-black border border-white/5">
                        <div>
                          <p className="text-xs font-bold text-white">Live Matches Push Summary Scores</p>
                          <p className="text-[10px] text-zinc-500 mt-1">Keep track of key wickets, runs and goals in your favorite leagues</p>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setNotifs({...notifs, liveScores: !notifs.liveScores})}
                          className={cn(
                            "w-10 h-5.5 rounded-full relative transition-colors duration-300 cursor-pointer",
                            notifs.liveScores ? "bg-emerald-500" : "bg-zinc-800"
                          )}
                        >
                          <div className={cn(
                            "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300",
                            notifs.liveScores ? "right-0.5" : "left-0.5"
                          )} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-xl bg-black border border-white/5">
                        <div>
                          <p className="text-xs font-bold text-white">Team Selection & Auction Alerts</p>
                          <p className="text-[10px] text-zinc-500 mt-1">Get notifications if selected inside auction pools</p>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setNotifs({...notifs, announcements: !notifs.announcements})}
                          className={cn(
                            "w-10 h-5.5 rounded-full relative transition-colors duration-300 cursor-pointer",
                            notifs.announcements ? "bg-emerald-500" : "bg-zinc-800"
                          )}
                        >
                          <div className={cn(
                            "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300",
                            notifs.announcements ? "right-0.5" : "left-0.5"
                          )} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-xl bg-black border border-white/5">
                        <div>
                          <p className="text-xs font-bold text-white">Net Practice & Training Schedule Updates</p>
                          <p className="text-[10px] text-zinc-500 mt-1">Sync calendar for weekly training programs</p>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setNotifs({...notifs, practiceUpdates: !notifs.practiceUpdates})}
                          className={cn(
                            "w-10 h-5.5 rounded-full relative transition-colors duration-300 cursor-pointer",
                            notifs.practiceUpdates ? "bg-emerald-500" : "bg-zinc-800"
                          )}
                        >
                          <div className={cn(
                            "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300",
                            notifs.practiceUpdates ? "right-0.5" : "left-0.5"
                          )} />
                        </button>
                      </div>

                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'email_support' && (
                <motion.div
                  key="email_support"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="p-2 sm:p-6 rounded-3xl bg-zinc-900/30 border border-white/5 text-left">
                    <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                      <Mail className="h-5 w-5 text-emerald-500" />
                      Basic Email Support
                    </h2>
                    <p className="text-xs text-zinc-500 mb-8">Reach out to KYNTRIVO support squad directly. Normal response time is 2-4 hours.</p>

                    <AnimatePresence mode="wait">
                      {supportSuccess ? (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-4"
                        >
                          <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto text-emerald-500">
                            <CheckCircle2 className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="font-extrabold text-white text-base">Support Match-Query Sent!</p>
                            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">We have dispatched your ticket details successfully. KYNTRIVO Support will reach you directly at: <strong className="text-zinc-200">{profileData.email}</strong>.</p>
                          </div>
                        </motion.div>
                      ) : (
                        <form onSubmit={submitSupport} className="space-y-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Query Issue Category</label>
                            <select 
                              value={supportForm.category}
                              onChange={e => setSupportForm({...supportForm, category: e.target.value})}
                              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-zinc-300"
                            >
                              <option value="Match score correction">Match score correction</option>
                              <option value="Team roster registration issue">Team roster registration issue</option>
                              <option value="Shop order delivery status query">Shop order delivery status query</option>
                              <option value="Venue ground booking modification">Venue ground booking modification</option>
                              <option value="General technical help">General technical help</option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Brief Query Explanation</label>
                            <textarea 
                              rows={5}
                              required
                              placeholder="Please explain in 1-2 sentences how our support coaches can assist you today..."
                              value={supportForm.details}
                              onChange={e => setSupportForm({...supportForm, details: e.target.value})}
                              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-zinc-300"
                            />
                          </div>

                          <button 
                            type="submit"
                            disabled={supportSubmitting}
                            className="bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs tracking-widest py-3.5 px-8 rounded-xl flex items-center gap-2 transition-all cursor-pointer"
                          >
                            <Send className="h-4 w-4" />
                            {supportSubmitting ? 'Sending Ticket...' : 'Dispatch Ticket'}
                          </button>
                        </form>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}

              {activeTab === 'ai_analytics' && (
                <motion.div
                  key="ai_analytics"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="p-2 sm:p-6 rounded-3xl bg-zinc-900/30 border border-white/5 text-left">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-emerald-500 animate-spin" style={{ animationDuration: '6s' }} />
                          AI Performance Analytics
                        </h2>
                        <p className="text-xs text-zinc-500 mt-1">Get smart tactical evaluation and training patterns tailored by Gemini AI</p>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] uppercase font-black tracking-widest">
                        Powered by Google Gemini
                      </div>
                    </div>

                    <AnimatePresence mode="wait">
                      {!aiGenerated ? (
                        <div className="p-8 rounded-2xl bg-black border border-white/5 text-center space-y-6">
                          <p className="text-xs text-zinc-400 leading-relaxed max-w-md mx-auto">Click analyze to let Gemini compile your career runs, wickets, strike rate, and style configurations to build private coaches feedback.</p>
                          <button 
                            type="button"
                            onClick={triggerAIAnalysis}
                            disabled={aiAnalyzing}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-black uppercase text-xs tracking-widest px-8 py-3.5 rounded-xl hover:opacity-95 shadow-lg shadow-emerald-500/10 cursor-pointer"
                          >
                            <Sparkles className="h-4 w-4" />
                            {aiAnalyzing ? 'Evaluating stats...' : 'Analyze My Performance'}
                          </button>
                        </div>
                      ) : (
                        <motion.div 
                          initial={{ opacity: 0, y: 15 }} 
                          animate={{ opacity: 1, y: 0 }} 
                          className="space-y-6"
                        >
                          <div className="p-6 rounded-2xl bg-zinc-950 border border-white/10 space-y-4">
                            <div className="flex items-center gap-3">
                              <Sparkles className="h-5 w-5 text-emerald-400" />
                              <h3 className="text-sm font-black text-white uppercase tracking-widest">Gemini Tactical Coach Insights</h3>
                            </div>
                            <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                              "Based on your profile as a <strong className="text-emerald-400 font-bold">{profileData.battingStyle} {profileData.specialization}</strong>, you show high-impact efficiency during middle-overs acceleration. Your strike rate of <strong className="text-emerald-400 font-bold">138.40</strong> places you in the top 12% of division athletes on KYNTRIVO. 
                              For your <strong className="text-emerald-400 font-bold">{profileData.bowlingStyle}</strong>, try using variations in pace and release angles against aggressive left-handed batsmen."
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-5 rounded-xl bg-black border border-white/5 space-y-3">
                              <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Key Performance Strengths</h4>
                              <ul className="space-y-1 text-xs text-zinc-400">
                                <li>• High powerplay runs conversion</li>
                                <li>• Excellent flight and spin rotation</li>
                                <li>• Strong conversion coefficient (37.10 avg)</li>
                              </ul>
                            </div>
                            <div className="p-5 rounded-xl bg-black border border-white/5 space-y-3">
                              <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest">AI Focus Growth Zones</h4>
                              <ul className="space-y-1 text-xs text-zinc-400">
                                <li>• Ground fielding reaction under deep pressure</li>
                                <li>• Variation of Yorker delivery under death overs</li>
                                <li>• Speed and strike selection against off-spinners</li>
                              </ul>
                            </div>
                          </div>

                          <div className="flex justify-center">
                            <button 
                              type="button"
                              onClick={() => setAiGenerated(false)}
                              className="text-[10px] text-zinc-500 hover:text-white uppercase font-black tracking-widest border border-white/5 hover:border-white/10 px-4 py-2.5 rounded-lg"
                            >
                              Reset Analysis
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      <AnimatePresence>
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] bg-emerald-500 text-black px-8 py-4 rounded-2xl font-bold shadow-2xl flex items-center gap-3"
          >
            <CheckCircle2 className="h-6 w-6 shrink-0" />
            {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live tracking map modal overlay */}
      <AnimatePresence>
        {selectedTrackingOrderId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl rounded-3xl bg-zinc-950 border border-white/10 overflow-hidden shadow-2xl p-6 text-left"
            >
              {/* Close button icon */}
              <button
                type="button"
                onClick={() => setSelectedTrackingOrderId(null)}
                className="absolute top-4 right-4 rounded-full p-2 bg-zinc-900 border border-white/5 hover:border-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer border-0"
              >
                ✕
              </button>

              <div className="flex items-center gap-3 mb-6 animate-fade-in">
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Live Shipment Dispatch Vector</h3>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Order ID: <span className="text-emerald-400 font-black">#{selectedTrackingOrderId}</span></p>
                </div>
              </div>

              {/* Real-time courier status card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-900/40 border border-white/5 p-4 rounded-2xl mb-6">
                <div>
                  <p className="text-[9px] text-zinc-500 uppercase font-black tracking-wider">Assigned Delivery Rider</p>
                  <p className="text-sm font-bold text-white mt-1">Rajiv Verma 🌟 4.9</p>
                  <p className="text-[10px] text-zinc-400 mt-1">Delhivery Express Priority Cargo</p>
                </div>
                <div className="md:text-right">
                  <p className="text-[9px] text-zinc-500 uppercase font-black tracking-wider">Delivery Passcode (OTP)</p>
                  <p className="text-base font-mono text-emerald-400 font-extrabold tracking-widest mt-1">5839</p>
                  <p className="text-[10px] text-zinc-500 mt-1 font-medium">Share only upon secure verification</p>
                </div>
              </div>

              {/* Interactive simulated Vector Route Map */}
              <div className="relative h-64 w-full rounded-2xl border border-white/10 bg-zinc-900/50 overflow-hidden flex flex-col justify-between p-4 mb-6">
                {/* SVG Route lines with dash animations */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                  {/* Grid Lines mockup */}
                  <pattern id="grid_dots" width="24" height="24" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.08)" />
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#grid_dots)" />

                  {/* Route path */}
                  <path 
                    d="M 50,180 C 150,220 200,60 320,130 S 420,80 480,90" 
                    fill="none" 
                    stroke="rgba(255,255,255,0.08)" 
                    strokeWidth="3" 
                    strokeLinecap="round"
                  />
                  {/* Active delivery path */}
                  <path 
                    d="M 50,180 C 150,220 200,60 320,130" 
                    fill="none" 
                    stroke="#10b981" 
                    strokeWidth="3.5" 
                    strokeLinecap="round"
                    strokeDasharray="6,4"
                  />
                </svg>

                {/* Animated pulsing courier vehicle node */}
                <motion.div 
                  animate={{
                    x: [230, 245, 260, 280, 298],
                    y: [120, 118, 115, 110, 108]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 5,
                    ease: "easeInOut"
                  }}
                  className="absolute left-6 top-4 z-10"
                >
                  <div className="relative">
                    <span className="absolute -inset-2.5 bg-emerald-500/30 rounded-full animate-ping" />
                    <div className="p-1.5 rounded-full bg-emerald-500 text-black shadow-lg">
                      <Navigation className="h-3.5 w-3.5 fill-black rotate-[28deg]" />
                    </div>
                  </div>
                </motion.div>

                {/* Map Labels/Pins */}
                <div className="absolute left-[30px] top-[140px] text-center">
                  <div className="p-1 rounded bg-zinc-950 border border-white/5 text-[9px] text-zinc-500 font-bold uppercase">Mumbai Central Sorting Hub</div>
                  <div className="h-1.5 w-1.5 rounded-full bg-zinc-650 mx-auto mt-1" />
                </div>

                <div className="absolute left-[240px] top-[40px] text-center">
                  <div className="p-1 rounded bg-zinc-950 border border-emerald-500/20 text-[9px] text-emerald-400 font-extrabold uppercase animate-pulse">Rider current spot</div>
                </div>

                <div className="absolute right-[20px] top-[40px] text-center">
                  <div className="p-1 rounded bg-emerald-500 text-black text-[9px] font-extrabold uppercase shadow-lg select-none">Athlete Arena</div>
                  <div className="h-2 w-2 rounded-full bg-emerald-400 mx-auto mt-1 animate-ping" />
                </div>

                {/* Satellite navigation banner */}
                <div className="z-10 w-full mt-auto bg-black/90 border border-white/5 p-2.5 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <span className="text-zinc-300">Courier Transit: passing <strong className="text-white font-bold">Western Express Highway</strong></span>
                  </div>
                  <span className="text-emerald-400 font-extrabold font-mono text-[10px] uppercase">ETA: 18 mins</span>
                </div>
              </div>

              {/* Transit Timeline logs */}
              <div className="space-y-3">
                <h4 className="text-[10px] text-zinc-500 uppercase font-black tracking-widest text-left">Delhivery Express Dispatch Log</h4>
                <div className="space-y-2 border-l border-white/5 pl-4 ml-2">
                  <div className="relative text-xs">
                    <span className="absolute -left-[21px] top-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-md shadow-emerald-500" />
                    <p className="font-bold text-white">08:15 AM — Out for delivery</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5 leading-none">Rider took custody with secure locker key confirmation.</p>
                  </div>
                  <div className="relative text-xs">
                    <span className="absolute -left-[21px] top-1.5 h-1.5 w-1.5 rounded-full bg-neutral-600" />
                    <p className="font-bold text-zinc-400">03:40 AM — Shipment processed at Mumbai main terminal</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5 leading-none">Received with prime sorting code validation.</p>
                  </div>
                </div>
              </div>

              {/* Bottom return button */}
              <button
                type="button"
                onClick={() => setSelectedTrackingOrderId(null)}
                className="w-full mt-6 bg-white hover:bg-zinc-100 text-black font-black uppercase text-xs tracking-widest py-3 rounded-xl transition-all cursor-pointer border-0"
              >
                Close Tracking Dashboard
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
