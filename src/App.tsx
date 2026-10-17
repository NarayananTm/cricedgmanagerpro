import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { 
  Trophy, 
  Users, 
  Calendar, 
  LayoutDashboard, 
  PlayCircle, 
  Settings, 
  Plus,
  ChevronRight,
  TrendingUp,
  Award,
  Clock,
  MapPin,
  LogOut,
  LogIn,
  Trash2,
  Power,
  PowerOff,
  History,
  ShoppingCart,
  Package,
  Edit2,
  Smartphone,
  CreditCard,
  ShoppingBag,
  Video,
  MessageSquare,
  Target,
  User,
  Sparkles,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  IndianRupee,
  Activity,
  DollarSign,
  Download,
  Sun,
  Moon,
  Share2,
  Clipboard,
  Check,
  Camera,
  BookOpen,
  GraduationCap,
  Copy,
  Crown,
  Lock,
  Bell,
  Mail,
  Shield,
  X,
  ChevronDown,
  Menu,
  QrCode as QrCodeIcon
} from 'lucide-react';
import QRCode from 'qrcode';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { Tournament, Match, Team, Sponsor } from './types';

import { ScoringInterface } from './components/ScoringInterface';
import { ShopInterface } from './components/ShopInterface';
import { AdminShopInterface } from './components/AdminShopInterface';
import { TournamentDetails } from './components/TournamentDetails';
import { AuctionInterface } from './components/AuctionInterface';
import { AuctionJoinPage } from './components/AuctionJoinPage';
import { PlayerProfileModal } from './components/PlayerProfileModal';
import { getSportConfig } from './lib/sportConfigs';
import { GroundBookingInterface } from './components/GroundBookingInterface';
import { AdminGroundBookingInterface } from './components/AdminGroundBookingInterface';
import { AdminPaymentSettings } from './components/AdminPaymentSettings';
import { SettingsPage } from './components/SettingsPage';
import { QuickActionsMenu } from './components/QuickActionsMenu';
import { geminiService } from './services/gemini';

import { Footer } from './components/Footer';
import { AboutPage } from './components/AboutPage';
import { FAQPage } from './components/FAQPage';
import { ContactPage } from './components/ContactPage';
import { PrivacyPolicyPage } from './components/PrivacyPolicyPage';
import { TermsOfServicePage } from './components/TermsOfServicePage';
import { ELearningPage } from './components/ELearningPage';
import { jsPDF } from 'jspdf';

// --- Auth Hook/State ---
const useAuth = () => {
  const [user, setUser] = useState<any>(() => {
    const saved = localStorage.getItem('user_data');
    return saved ? JSON.parse(saved) : null;
  });

  const isAdmin = user?.is_admin === 1;
  const isUser = !!user;
  const plan = user?.plan || 'starter';
  
  const login = async (email: string, pass: string) => {
    // Check for Admin login: User Name - GmaneZM, Password - GameZm2026
    const cleanEmail = email.trim().toLowerCase();
    if ((cleanEmail === 'gmanezm' || cleanEmail === 'gmanezm@gamezm.com' || cleanEmail === 'gmanezm@gmail.com') && pass === 'GameZm2026') {
      const adminUser = { id: 88, name: 'GmaneZM', email: 'gmanezm@gamezm.com', plan: 'pro', is_admin: 1 };
      localStorage.setItem('user_data', JSON.stringify(adminUser));
      setUser(adminUser);
      return true;
    }

    // Check for hardcoded legacy admin (for easy transition)
    if (email === 'Cricedgpro@2026' && pass === 'Cricedgpro@2026') {
      const adminUser = { id: 0, name: 'Main Admin', email: 'admin@cricedgpro.com', plan: 'pro', is_admin: 1 };
      localStorage.setItem('user_data', JSON.stringify(adminUser));
      setUser(adminUser);
      return true;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('user_data', JSON.stringify(data));
        setUser(data);
        return true;
      }
    } catch (e) {
      console.error('Login error:', e);
    }
    return false;
  };

  const signup = async (name: string, email: string, pass: string, plan: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password: pass, plan })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('user_data', JSON.stringify(data));
        setUser(data);
        return true;
      }
    } catch (e) {
      console.error('Signup error:', e);
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('user_data');
    setUser(null);
  };

  return { user, isAdmin, isUser, plan, login, signup, logout };
};

// --- Components ---

export const Navbar = () => {
  const { isAdmin, isUser, plan, logout } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme-preference') || 'dark';
    }
    return 'dark';
  });
  const [isTournamentsOpen, setIsTournamentsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileTournamentsOpen, setIsMobileTournamentsOpen] = useState(true);

  useEffect(() => {
    const isLight = theme === 'light';
    document.documentElement.classList.toggle('light-theme-active', isLight);
    document.body.classList.toggle('light-theme-active', isLight);
    localStorage.setItem('theme-preference', theme);
  }, [theme]);

  useEffect(() => {
    const handleThemeChange = () => {
      if (typeof window !== 'undefined') {
        setTheme(localStorage.getItem('theme-preference') || 'dark');
      }
    };
    window.addEventListener('theme-changed', handleThemeChange);
    return () => {
      window.removeEventListener('theme-changed', handleThemeChange);
    };
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2.5 font-black text-xl tracking-tight">
          <div className="h-8 w-8 rounded-xl bg-[#353A96] border border-[#F3F298]/30 flex items-center justify-center shadow-md shadow-[#353A96]/40">
            <Trophy className="h-4.5 w-4.5 text-[#F3F298]" />
          </div>
          <span className="tracking-wider text-white">KYNT<span className="text-[#F3F298]">RIVO</span></span>
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
          <Link to="/live" className="hover:text-white transition-colors">Live Scores</Link>
          <Link to="/shop" className="hover:text-white transition-colors">Shop</Link>
          <Link to="/grounds" className="hover:text-white transition-colors">Ground Booking</Link>
          
          {/* Tournaments Dropdown containing Tournaments, Teams & Player Pool */}
          <div 
            className="relative py-4"
            onMouseEnter={() => setIsTournamentsOpen(true)}
            onMouseLeave={() => setIsTournamentsOpen(false)}
          >
            <button 
              onClick={() => setIsTournamentsOpen(!isTournamentsOpen)}
              className="flex items-center gap-1.5 hover:text-white transition-colors text-sm font-medium cursor-pointer focus:outline-none"
            >
              <span>Tournaments</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isTournamentsOpen ? 'rotate-180 text-emerald-400' : 'text-zinc-500'}`} />
            </button>

            <AnimatePresence>
              {isTournamentsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full pt-1 w-72 z-50"
                >
                  <div className="p-2 rounded-2xl bg-zinc-950/95 border border-white/10 shadow-2xl backdrop-blur-xl">
                    <div className="px-3 py-1.5 border-b border-white/5 mb-1 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Tournament Hub</span>
                    </div>

                    <Link 
                      to="/tournaments"
                      onClick={() => setIsTournamentsOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all text-left group/item"
                    >
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover/item:bg-emerald-500 group-hover/item:text-black transition-colors shrink-0 mt-0.5">
                        <Trophy className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover/item:text-emerald-400 transition-colors">Tournaments</div>
                        <div className="text-[10px] text-zinc-400">Active leagues, fixtures & brackets</div>
                      </div>
                    </Link>

                    <Link 
                      to="/teams"
                      onClick={() => setIsTournamentsOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all text-left group/item"
                    >
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover/item:bg-emerald-500 group-hover/item:text-black transition-colors shrink-0 mt-0.5">
                        <Shield className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover/item:text-emerald-400 transition-colors">Teams</div>
                        <div className="text-[10px] text-zinc-400">Registered squad rosters & details</div>
                      </div>
                    </Link>

                    <Link 
                      to="/players"
                      onClick={() => setIsTournamentsOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all text-left group/item"
                    >
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover/item:bg-emerald-500 group-hover/item:text-black transition-colors shrink-0 mt-0.5">
                        <Users className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover/item:text-emerald-400 transition-colors">Player Pool</div>
                        <div className="text-[10px] text-zinc-400">Free agent player profiles & drafts</div>
                      </div>
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link to="/elearning" className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors flex items-center gap-1">
            <GraduationCap className="h-4 w-4" /> E-Learning
          </Link>
          <Link to="/about" className="hover:text-white transition-colors">About</Link>
          
          {plan !== 'pro' && (
            <Link to="/pricing" className="text-emerald-500 font-bold hover:text-emerald-400 transition-colors flex items-center gap-1">
              {plan === 'organizer' ? 'Upgrade to Pro' : 'Upgrade Plan'} <TrendingUp className="h-3 w-3" />
            </Link>
          )}

          {isAdmin && (
            <Link to="/admin" className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full border border-emerald-500/20 hover:bg-emerald-500/20 transition-all">
              Admin Portal
            </Link>
          )}

          {isUser && !isAdmin && plan === 'organizer' && (
            <Link to="/admin" className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full border border-amber-500/20 hover:bg-amber-500/20 transition-all">
              Organizer Hub
            </Link>
          )}

          {isUser && !isAdmin && plan === 'pro' && (
            <Link to="/admin" className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full border border-emerald-500/20 hover:bg-emerald-500/20 transition-all">
              Seller & Ground Hub
            </Link>
          )}

          {isUser && plan === 'starter' && (
            <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border border-white/5">
              Free Player
            </span>
          )}
          
          {isUser && plan === 'organizer' && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-widest border border-amber-500/20">
              Organizer
            </span>
          )}

          {isUser && plan === 'pro' && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">
              Seller & Grounds Owner
            </span>
          )}
          
          {(isAdmin || isUser) ? (
            <div className="flex items-center gap-4">
              <Link to="/settings" className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors">
                <Settings className="h-4 w-4 text-emerald-500" /> Settings
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                <LogIn className="h-4 w-4" /> Login
              </Link>
              <Link to="/pricing" className="bg-emerald-500 text-black px-4 py-1.5 rounded-xl font-bold hover:bg-emerald-400 transition-all">
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex items-center md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/10 bg-black/95 px-4 py-6 space-y-4 text-sm font-medium text-zinc-400"
          >
            <Link to="/live" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 hover:text-white">Live Scores</Link>
            <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 hover:text-white">Shop</Link>
            <Link to="/grounds" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 hover:text-white">Ground Booking</Link>

            {/* Mobile Tournaments Group */}
            <div className="py-2 border-y border-white/5">
              <button 
                onClick={() => setIsMobileTournamentsOpen(!isMobileTournamentsOpen)}
                className="w-full flex items-center justify-between text-white font-bold text-left py-1"
              >
                <span className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-emerald-500" /> Tournaments & Teams
                </span>
                <ChevronDown className={`h-4 w-4 text-zinc-500 transition-transform ${isMobileTournamentsOpen ? 'rotate-180' : ''}`} />
              </button>

              {isMobileTournamentsOpen && (
                <div className="pl-4 mt-2 space-y-2 border-l border-emerald-500/30 ml-2">
                  <Link 
                    to="/tournaments" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 py-1.5 text-zinc-300 hover:text-emerald-400"
                  >
                    <Trophy className="h-3.5 w-3.5 text-emerald-500" /> Tournaments
                  </Link>
                  <Link 
                    to="/teams" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 py-1.5 text-zinc-300 hover:text-emerald-400"
                  >
                    <Shield className="h-3.5 w-3.5 text-emerald-500" /> Teams
                  </Link>
                  <Link 
                    to="/players" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 py-1.5 text-zinc-300 hover:text-emerald-400"
                  >
                    <Users className="h-3.5 w-3.5 text-emerald-500" /> Player Pool
                  </Link>
                </div>
              )}
            </div>

            <Link to="/elearning" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 py-2 text-emerald-400 font-semibold">
              <GraduationCap className="h-4 w-4" /> E-Learning
            </Link>
            <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 hover:text-white">About</Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const PricingPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-emerald-500 font-bold uppercase tracking-widest text-sm mb-4">Pricing Plans</h2>
          <h1 className="text-5xl font-black tracking-tight mb-6">Choose Your <span className="text-emerald-500">Subscription</span></h1>
          <p className="text-zinc-500 max-w-2xl mx-auto text-lg">Scalable plans for every level of sports management. Select the role that fits your goals.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Player Plan */}
          <motion.div 
            whileHover={{ y: -8 }}
            className="p-8 rounded-3xl bg-zinc-900 border border-white/5 flex flex-col h-full relative"
          >
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-2">Free Player</h3>
              <p className="text-zinc-500 text-sm">For Casual Players & Spectators</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-black">₹0</span>
                <span className="text-zinc-500">/ Month</span>
              </div>
            </div>

            <div className="space-y-4 mb-8 flex-1">
              {[
                'Player Profile Creation',
                'Join Teams & Tournaments',
                'Ground Booking Access',
                'AI Performance Analytics',
                'Match History & Statistics',
                'Buy Sports Gear & Products',
                'Team Chats & Social Feed',
                'Match Schedule Notifications',
                'Basic Email Support'
              ].map(feature => (
                <div key={feature} className="flex items-center gap-3 text-sm text-zinc-300">
                  <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <Plus className="h-3 w-3 text-emerald-500" />
                  </div>
                  {feature}
                </div>
              ))}
            </div>

            <button 
              onClick={() => navigate('/signup?plan=starter')}
              className="w-full py-4 rounded-2xl bg-zinc-800 border border-white/5 font-bold hover:bg-zinc-700 transition-all"
            >
              Get Started for Free
            </button>
            <p className="mt-4 text-[10px] text-zinc-600 text-center uppercase font-bold tracking-widest">Best for casual players</p>
          </motion.div>

          {/* Tournament Organizer Plan */}
          <motion.div 
            whileHover={{ y: -8 }}
            className="p-8 rounded-3xl bg-zinc-900 border border-amber-500/30 relative flex flex-col h-full overflow-hidden"
          >
            <div className="absolute top-0 right-0 bg-amber-500 text-black text-[9px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest">
              League Specialist
            </div>
            
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-2">Tournament Organizer</h3>
              <p className="text-zinc-500 text-sm">For Organizers & League Directors</p>
              <div className="mt-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black">₹299</span>
                  <span className="text-zinc-500">/ Month</span>
                </div>
                <div className="text-[11px] text-amber-500 font-bold mt-1">₹2,999 / Year (Save ~16%)</div>
              </div>
            </div>

            <div className="space-y-4 mb-8 flex-1">
              {[
                'Everything in Free Player',
                'Create Unlimited Tournaments',
                'Automated Match Fixtures Generator',
                'Comprehensive Live Match Scoreboards',
                'Budget & Expense Tracker',
                'Sponsors & Banner Ad Campaign Management',
                'Premium Auction Rooms & Bidding Pools',
                'Live Match Commentary & Event Logs',
                'Detailed Tournament Analytics Dashboard',
                'Organizer Admin Dashboard Access'
              ].map(feature => (
                <div key={feature} className="flex items-center gap-3 text-sm text-zinc-200">
                  <div className="h-5 w-5 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                    <Plus className="h-3 w-3 text-amber-500" />
                  </div>
                  {feature}
                </div>
              ))}
            </div>

            <button 
              onClick={() => navigate('/signup?plan=organizer')}
              className="w-full py-4 rounded-2xl bg-amber-500 text-black font-black hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/10"
            >
              Get Organizer
            </button>
            <p className="mt-4 text-[10px] text-zinc-400 text-center uppercase font-bold tracking-widest">Best for tournament coordinators</p>
          </motion.div>

          {/* Business Pro Plan */}
          <motion.div 
            whileHover={{ y: -8 }}
            className="p-8 rounded-3xl bg-zinc-900 border-2 border-emerald-500/50 relative overflow-hidden flex flex-col h-full"
          >
            <div className="absolute top-0 right-0 bg-emerald-500 text-black text-[9px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest">
              Most Popular
            </div>
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-2">Seller & Grounds Owner</h3>
              <p className="text-zinc-500 text-sm">For Shop Sellers, Merchants & Venue Owners</p>
              <div className="mt-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black">₹599</span>
                  <span className="text-zinc-500">/ Month</span>
                </div>
                <div className="text-[11px] text-emerald-500 font-bold mt-1">₹5,999 / Year (Save ~16%)</div>
              </div>
            </div>

            <div className="space-y-4 mb-8 flex-1">
              {[
                'Sell Brand New Sports Products Online',
                'Add, Edit & Delete Custom Shop Products',
                'Shop Inventory & Real Orders Tracking',
                'Manage Shop Orders & Customer Deliveries',
                'List Grounds Venue & Slot Durations',
                'Approve or Decline Pending Bookings',
                'Manage Ground Slot Bookings & Venues',
                'Track Store & Venue Revenue Analytics',
                'Setup Customized UPI & Card Gateways',
                'Merchant & Ground Owner Dashboard Access',
                '24/7 Dedicated Merchant Support'
              ].map(feature => (
                <div key={feature} className="flex items-center gap-3 text-sm text-white">
                  <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                    <Plus className="h-3 w-3 text-black" />
                  </div>
                  {feature}
                </div>
              ))}
            </div>

            <button 
              onClick={() => navigate('/signup?plan=pro')}
              className="w-full py-4 rounded-2xl bg-emerald-500 text-black font-black hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
            >
              Get Business Pro
            </button>
            <p className="mt-4 text-[10px] text-zinc-400 text-center uppercase font-bold tracking-widest">Best for premium venues & shops</p>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

const SignupPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', plan: 'starter' });
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const plan = searchParams.get('plan');
    if (plan === 'pro') setFormData(prev => ({ ...prev, plan: 'pro' }));
    else if (plan === 'organizer') setFormData(prev => ({ ...prev, plan: 'organizer' }));
    else if (plan === 'starter') setFormData(prev => ({ ...prev, plan: 'starter' }));
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await signup(formData.name, formData.email, formData.password, formData.plan);
    if (success) navigate('/');
    else setError('Signup failed. Email might already be taken.');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-md p-8 rounded-3xl bg-zinc-900 border border-white/10 shadow-2xl">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-bold text-2xl tracking-tighter mb-4">
            <Trophy className="h-8 w-8 text-emerald-500" />
            <span>Cricedgmanager<span className="text-emerald-500">pro</span></span>
          </Link>
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-zinc-500 mt-2">Start managing your sports journey today.</p>
        </div>
        
        {error && <div className="p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-2">Full Name</label>
            <input 
              required
              type="text" 
              className="w-full rounded-xl bg-black border border-white/10 px-4 py-3 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-2">Email Address</label>
            <input 
              required
              type="email" 
              className="w-full rounded-xl bg-black border border-white/10 px-4 py-3 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-2">Password</label>
            <input 
              required
              type="password" 
              className="w-full rounded-xl bg-black border border-white/10 px-4 py-3 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-2">Select Plan</label>
            <div className="grid grid-cols-1 gap-2">
              <button 
                type="button"
                onClick={() => setFormData({...formData, plan: 'starter'})}
                className={cn(
                  "p-3.5 rounded-xl border text-xs font-bold transition-all text-left flex justify-between items-center",
                  formData.plan === 'starter' ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" : "bg-black border-white/10 text-zinc-500 bg-zinc-950/20 hover:bg-zinc-900"
                )}
              >
                <div className="flex flex-col">
                  <span>Free Player</span>
                  <span className="text-[10px] text-zinc-500 font-normal">Join tournaments and buy sports gear</span>
                </div>
                <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-400 font-mono">₹0</span>
              </button>
              
              <button 
                type="button"
                onClick={() => setFormData({...formData, plan: 'organizer'})}
                className={cn(
                  "p-3.5 rounded-xl border text-xs font-bold transition-all text-left flex justify-between items-center",
                  formData.plan === 'organizer' ? "bg-amber-500/10 border-amber-500 text-amber-500" : "bg-black border-white/10 text-zinc-500 bg-zinc-950/20 hover:bg-zinc-900"
                )}
              >
                <div className="flex flex-col">
                  <span>Tournament Organizer</span>
                  <span className="text-[10px] text-zinc-500 font-normal">Create leagues, generate fixtures & scorekeepers</span>
                </div>
                <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-400 font-mono">₹299/mo</span>
              </button>
              
              <button 
                type="button"
                onClick={() => setFormData({...formData, plan: 'pro'})}
                className={cn(
                  "p-3.5 rounded-xl border text-xs font-bold transition-all text-left flex justify-between items-center",
                  formData.plan === 'pro' ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" : "bg-black border-white/10 text-zinc-500 bg-zinc-950/20 hover:bg-zinc-900"
                )}
              >
                <div className="flex flex-col">
                  <span>Seller & Grounds Owner</span>
                  <span className="text-[10px] text-zinc-500 font-normal">Become a seller, manage shop items & approve ground slots</span>
                </div>
                <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-400 font-mono">₹599/mo</span>
              </button>
            </div>
          </div>
          <button type="submit" className="w-full py-4 rounded-xl bg-emerald-500 text-black font-black uppercase tracking-widest hover:bg-emerald-400 transition-all mt-6 shadow-lg shadow-emerald-500/20">
            Sign Up Now
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-zinc-500">
          Already have an account? <Link to="/login" className="text-emerald-500 font-bold">Login</Link>
        </p>
      </div>
    </div>
  );
};
const Hero = () => {
  const { plan } = useAuth();
  return (
  <div className="relative overflow-hidden py-24 sm:py-32">
    <div className="absolute inset-0 -z-10">
      <div className="absolute inset-0 bg-gradient-to-b from-[#353A96]/20 via-[#353A96]/5 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[#353A96]/25 blur-[130px] rounded-full" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[450px] h-[300px] bg-[#F3F298]/10 blur-[100px] rounded-full" />
    </div>
    <div className="mx-auto max-w-7xl px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        {/* KYNTRIVO Brand Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#353A96]/50 border border-[#F3F298]/30 mb-8 backdrop-blur-md shadow-lg shadow-[#353A96]/30">
          <span className="h-2 w-2 rounded-full bg-[#F3F298] animate-pulse" />
          <span className="text-[11px] font-black tracking-widest uppercase text-[#F3F298]">KYNTRIVO SPORTS SUITE</span>
        </div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-black tracking-tight text-white sm:text-6xl"
        >
          Manage Your Sports Tournaments <span className="text-[#F3F298]">Digitally</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6 text-lg leading-8 text-zinc-300"
        >
          The premier platform for multi-sport tournaments. Live scoring, automated fixtures, real-time analytics, and live player auctions.
        </motion.p>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-10 flex items-center justify-center gap-x-5"
        >
          {(plan === 'organizer' || plan === 'pro') ? (
            <Link to="/admin" className="rounded-xl bg-[#F3F298] hover:bg-[#e4e389] px-7 py-3.5 text-sm font-extrabold text-[#181a4b] shadow-xl shadow-[#F3F298]/20 transition-all">
              Start Tournament
            </Link>
          ) : (
            <Link to="/pricing" className="rounded-xl bg-[#F3F298] hover:bg-[#e4e389] px-7 py-3.5 text-sm font-extrabold text-[#181a4b] shadow-xl shadow-[#F3F298]/20 transition-all flex items-center gap-2">
              Organize Tournaments <ChevronRight className="h-4 w-4 text-[#181a4b]" />
            </Link>
          )}
          <Link to="/live" className="rounded-xl bg-[#353A96]/80 hover:bg-[#353A96] border border-[#F3F298]/20 px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all flex items-center gap-2 group">
            Watch Live <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform text-[#F3F298]" />
          </Link>
        </motion.div>
      </div>
    </div>
  </div>
  );
};

const LiveMatchCard = ({ match, ...props }: { match: any, [key: string]: any }) => {
  const isCricket = !match.sport || match.sport === 'cricket';
  const innings1 = match.innings?.[0];
  const innings2 = match.innings?.[1];
  
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="relative overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/50 p-6 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-red-500/10 px-2.5 py-0.5 text-[10px] font-bold text-red-500 animate-pulse uppercase tracking-wider">
            ● LIVE {match.sport && ` - ${match.sport.toUpperCase()}`}
          </span>
        </div>
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{match.venue}</span>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold text-xs border border-emerald-500/10">
              {match.team1_name?.[0]}
            </div>
            <span className="font-semibold text-zinc-200">{match.team1_name}</span>
          </div>
          <span className="text-xl font-black">
            {isCricket ? (
              <>
                {innings1?.runs || 0}/{innings1?.wickets || 0} 
                <span className="text-[10px] text-zinc-500 font-normal ml-2 tracking-tighter">({innings1?.overs_bowled || 0})</span>
              </>
            ) : (
              <span>
                {match.team1_score || 0} <span className="text-xs text-zinc-500 font-medium">{match.sport === 'soccer' ? 'Goals' : 'Pts'}</span>
              </span>
            )}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 font-bold text-xs border border-blue-500/10">
              {match.team2_name?.[0]}
            </div>
            <span className="font-semibold text-zinc-200">{match.team2_name}</span>
          </div>
          <span className="text-xl font-black">
            {isCricket ? (
              innings2 ? (
                <>
                  {innings2.runs}/{innings2.wickets}
                  <span className="text-[10px] text-zinc-500 font-normal ml-2 tracking-tighter">({innings2.overs_bowled})</span>
                </>
              ) : (
                <span className="text-xs text-zinc-600 font-normal italic">Yet to bat</span>
              )
            ) : (
              <span>
                {match.team2_score || 0} <span className="text-xs text-zinc-500 font-medium">{match.sport === 'soccer' ? 'Goals' : 'Pts'}</span>
              </span>
            )}
          </span>
        </div>
      </div>
      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs tracking-tight">
        <span className="text-emerald-500 font-bold uppercase tracking-wider">In progress</span>
        <Link to={`/match/${match.id}`} className="text-zinc-500 hover:text-white transition-colors font-bold flex items-center gap-1 group">
          View Scorecard <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
};

const LiveScoresPage = () => {
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);

  useEffect(() => {
    fetch('/api/matches/live')
      .then(res => res.json())
      .then(data => setLiveMatches(data));
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-3xl font-bold mb-8">Live Scores</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {liveMatches.length > 0 ? (
            liveMatches.map(match => <LiveMatchCard key={match.id} match={match} />)
          ) : (
            <div className="col-span-full py-24 text-center border border-dashed border-white/10 rounded-3xl text-zinc-500">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No matches live right now.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

const TournamentsPage = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [sportFilter, setSportFilter] = useState('all');

  useEffect(() => {
    fetch('/api/tournaments')
      .then(res => res.json())
      .then(data => setTournaments(Array.isArray(data) ? data : []));
  }, []);

  const filteredTournaments = tournaments.filter(t => {
    if (sportFilter === 'all') return true;
    return (t.sport || 'cricket').toLowerCase() === sportFilter.toLowerCase();
  });

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold">All Tournaments</h1>
            <p className="text-zinc-500 text-sm mt-1">Explore live leagues, cups, and auction championships</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={sportFilter}
              onChange={e => setSportFilter(e.target.value)}
              className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">All Sports</option>
              <option value="cricket">Cricket 🏏</option>
              <option value="badminton">Badminton 🏸</option>
              <option value="tennis">Tennis 🎾</option>
              <option value="soccer">Football ⚽</option>
              <option value="basketball">Basketball 🏀</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.map(t => {
            const sportCfg = getSportConfig(t.sport || 'cricket');
            return (
              <Link key={t.id} to={`/tournament/${t.id}`} className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-emerald-500/50 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-widest">
                      {t.status}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${sportCfg.badgeClass}`}>
                      {sportCfg.icon} {t.sport || 'cricket'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{t.name}</h3>
                  <p className="text-xs text-zinc-500 capitalize mb-4 font-mono">{t.format.replace(/_/g, ' ')}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs text-zinc-500">
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {t.teams_count} Teams</span>
                  <span className="flex items-center gap-1 font-mono">
                    {t.sport === 'badminton' || t.sport === 'tennis' 
                      ? `${t.overs || 3} Sets Max` 
                      : `${t.overs} Overs / Periods`}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {filteredTournaments.length === 0 && (
          <div className="py-20 text-center border border-dashed border-white/10 rounded-3xl text-zinc-500">
            No tournaments found for {sportFilter === 'all' ? 'any sport' : sportFilter}.
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

const TeamsPage = () => {
  const [teams, setTeams] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/teams')
      .then(res => res.json())
      .then(data => setTeams(data));
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-3xl font-bold mb-8">Participating Teams</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {teams.map(team => (
            <div key={team.id} className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5">
              <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xl mb-4">
                {team.name[0]}
              </div>
              <h3 className="font-bold text-lg">{team.name}</h3>
              <p className="text-xs text-zinc-500 mb-4">{team.manager_name}</p>
              <div className="pt-4 border-t border-white/5">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Tournament</p>
                <p className="text-sm font-medium text-emerald-500">{team.tournament_name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const PlayerCard = ({ player, onDelete, onOpenProfile, isAdmin }: { player: any, onDelete: (id: number) => Promise<void> | void, onOpenProfile?: (player: any) => void, isAdmin: boolean, key?: any }) => {
  const [report, setReport] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const sportCfg = getSportConfig(player.sport);

  const generateReport = async () => {
    setIsGenerating(true);
    // Mocking some historical stats for the AI to analyze
    const stats = {
      matches: Math.floor(Math.random() * 50) + 10,
      totalRuns: player.role === 'bowler' ? Math.floor(Math.random() * 200) : Math.floor(Math.random() * 1500),
      totalWickets: player.role === 'batsman' ? Math.floor(Math.random() * 5) : Math.floor(Math.random() * 80),
      avgEconomy: (Math.random() * 3 + 6).toFixed(2)
    };
    const result = await geminiService.getPlayerScoutReport(player, stats);
    setReport(result || '');
    setIsGenerating(false);
  };

  return (
    <div className="p-6 rounded-2xl bg-zinc-900/30 border border-white/5 hover:border-emerald-500/20 transition-all group overflow-hidden flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-4 mb-4">
          <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border border-white/10 shrink-0">
            {player.image_url ? (
              <img src={player.image_url} alt={player.name} className="h-full w-full object-cover" />
            ) : (
              <Users className="h-6 w-6 text-zinc-600" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-[10px] font-bold uppercase tracking-widest text-zinc-300">
                {player.role.replace(/_/g, ' ')}
              </span>
              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${sportCfg.badgeClass}`}>
                {sportCfg.icon} {player.sport || 'cricket'}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              {player.is_sold ? (
                <span className="text-[10px] font-bold text-emerald-500">SOLD</span>
              ) : (
                <span className="text-[10px] font-bold text-zinc-500">AVAILABLE</span>
              )}
            </div>
          </div>
        </div>
        <h3 className="font-bold text-lg group-hover:text-emerald-500 transition-colors truncate">{player.name}</h3>
        <p className="text-xs text-zinc-500 mb-4 font-medium uppercase tracking-widest">Age: {player.age}</p>
        
        <div className="pt-3 border-t border-white/5 flex items-center justify-between mb-4">
          <div>
            <p className="text-[8px] text-zinc-500 uppercase">Team</p>
            <p className="text-xs font-medium truncate max-w-[80px]">{player.team_name || 'Unassigned'}</p>
          </div>
          <div className="text-right">
            <p className="text-[8px] text-zinc-500 uppercase">Price</p>
            <p className="text-xs font-bold text-emerald-500">₹{(player.sold_price || player.base_price || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2 pt-2">
        {onOpenProfile && (
          <button
            onClick={() => onOpenProfile(player)}
            className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
          >
            <span>View Sport Specs & Gear</span>
          </button>
        )}

        {report && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-[11px] text-zinc-300 italic mb-3 leading-relaxed"
          >
            <div className="flex items-center gap-1 text-emerald-500 mb-1 font-bold uppercase tracking-tighter text-[9px]">
              <Sparkles className="h-3 w-3" /> AI Scout Report
            </div>
            "{report}"
          </motion.div>
        )}

        <button 
          onClick={generateReport}
          disabled={isGenerating}
          className="w-full py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>Analyzing...</>
          ) : (
            <>
              <Sparkles className="h-3 w-3" /> {report ? 'Retrain Analysis' : 'Get AI Scout Analysis'}
            </>
          )}
        </button>

        {isAdmin && (
          <button 
            onClick={() => onDelete(player.id)}
            className="w-full py-2 rounded-xl bg-red-500/5 border border-transparent text-red-500/30 text-[10px] font-bold uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 transition-all flex items-center justify-center gap-2"
          >
            <Trash2 className="h-3 w-3" /> Delete
          </button>
        )}
      </div>
    </div>
  );
};

const PlayersPage = () => {
  const [players, setPlayers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [sportFilter, setSportFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetch('/api/players')
      .then(res => res.json())
      .then(data => setPlayers(data));
  }, []);

  const filteredPlayers = players.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || p.role === roleFilter;
    const matchesSport = sportFilter === 'all' || (p.sport || 'cricket').toLowerCase() === sportFilter.toLowerCase();
    return matchesSearch && matchesRole && matchesSport;
  });

  const deletePlayer = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this player?')) return;
    try {
      const res = await fetch(`/api/players/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPlayers(players.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error('Error deleting player:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-black tracking-tighter">Player Pool</h1>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
              AI Powered Analysis Enabled
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search players..."
                className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 pl-10 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-56 text-sm"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <Users className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            </div>

            <select 
              className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm text-zinc-300"
              value={sportFilter}
              onChange={e => setSportFilter(e.target.value)}
            >
              <option value="all">All Sports</option>
              <option value="cricket">Cricket 🏏</option>
              <option value="badminton">Badminton 🏸</option>
              <option value="tennis">Tennis 🎾</option>
              <option value="soccer">Football ⚽</option>
              <option value="basketball">Basketball 🏀</option>
            </select>

            <select 
              className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm text-zinc-300"
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="batsman">Batsman</option>
              <option value="bowler">Bowler</option>
              <option value="all_rounder">All-rounder</option>
              <option value="wk">Wicket-keeper</option>
              <option value="singles_specialist">Singles Specialist</option>
              <option value="doubles_specialist">Doubles Specialist</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredPlayers.map(player => (
            <PlayerCard 
              key={player.id} 
              player={player} 
              onDelete={deletePlayer} 
              onOpenProfile={(p) => setSelectedPlayer(p)}
              isAdmin={isAdmin} 
            />
          ))}
        </div>
      </div>

      {/* Athlete Profile Modal */}
      <PlayerProfileModal
        player={selectedPlayer}
        tournamentName={selectedPlayer?.tournament_name}
        onClose={() => setSelectedPlayer(null)}
      />

      <Footer />
    </div>
  );
};

const PublicTournamentDetails = () => {
  const { id } = useParams();
  const [tournament, setTournament] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/tournaments/${id}`)
      .then(res => res.json())
      .then(data => setTournament(data));
  }, [id]);

  if (!tournament) return <div className="p-8 text-center text-zinc-500">Loading...</div>;
  if (tournament.error) return <div className="p-8 text-center text-red-500">Error: {tournament.error}</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold uppercase tracking-widest">
              {tournament.status}
            </span>
            <span className="text-zinc-500 text-sm">• {tournament.format}</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">{tournament.name}</h1>
          <div className="flex flex-wrap gap-6 text-sm text-zinc-400">
            <span className="flex items-center gap-2"><Users className="h-4 w-4" /> {tournament.teams?.length} Teams</span>
            <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {tournament.overs} Overs</span>
            <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Main Stadium</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5 text-emerald-500" /> Recent Matches
              </h2>
              <div className="space-y-4">
                {tournament.matches?.map((match: any) => (
                  <div key={match.id} className="p-6 rounded-2xl bg-zinc-900/30 border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <span className="text-xs font-bold text-zinc-600">#{match.id}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-bold">{match.team1_name}</span>
                        <span className="text-[10px] text-zinc-700 font-black">VS</span>
                        <span className="font-bold">{match.team2_name}</span>
                      </div>
                    </div>
                    <span className="text-xs text-zinc-500 uppercase tracking-widest">{match.status}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-12">
            <section>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Award className="h-5 w-5 text-emerald-500" /> Participating Teams
              </h2>
              <div className="space-y-3">
                {tournament.teams?.map((team: any) => (
                  <div key={team.id} className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-zinc-800 flex items-center justify-center text-sm font-bold border border-white/10 overflow-hidden">
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
                    
                    <div className="pt-4 border-t border-white/5">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Squad</p>
                      <div className="grid grid-cols-2 gap-2">
                        {team.players?.map((player: any) => (
                          <div key={player.id} className="flex items-center gap-2 p-2 rounded-lg bg-black/20 border border-white/5">
                            <div className="h-6 w-6 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border border-white/10">
                              {player.image_url ? (
                                <img src={player.image_url} alt={player.name} className="h-full w-full object-cover" />
                              ) : (
                                <span className="text-[8px]">{player.name[0]}</span>
                              )}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-[10px] font-medium truncate">{player.name}</span>
                              <span className="text-[8px] text-zinc-500 uppercase truncate">{player.role.replace('_', ' ')}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

const PublicMatchDetails = () => {
  const { matchId } = useParams();
  const { isAdmin } = useAuth();
  const [match, setMatch] = useState<any>(null);
  const [innings, setInnings] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [aiInsight, setAiInsight] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [matchQrCode, setMatchQrCode] = useState<string>('');
  const [posterSaved, setPosterSaved] = useState(false);

  useEffect(() => {
    if (matchId) {
      const shareUrl = `${window.location.origin}/match/${matchId}`;
      QRCode.toDataURL(shareUrl, {
        width: 256,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })
        .then(url => setMatchQrCode(url))
        .catch(err => console.error('Failed to generate match QR code:', err));
    }
  }, [matchId]);

  const generateAiInsight = async () => {
    setIsGeneratingAi(true);
    const insight = await geminiService.getMatchInsight(match, innings, events);
    setAiInsight(insight || '');
    setIsGeneratingAi(false);
  };

  const fetchPlayers = async () => {
    try {
      const res = await fetch('/api/players');
      if (res.ok) {
        const data = await res.json();
        setPlayers(data);
      }
    } catch (e) {
      console.error('Error loading players roster:', e);
    }
  };

  const calculateMVPList = () => {
    if (!players || players.length === 0 || !events || events.length === 0) return [];
    
    // Map of ID to MVP records
    const mvpMap: { [id: number]: { player: any; points: number; runs: number; wickets: number; fours: number; sixes: number } } = {};
    
    players.forEach(p => {
      mvpMap[p.id] = { player: p, points: 0, runs: 0, wickets: 0, fours: 0, sixes: 0 };
    });

    events.forEach(event => {
      const desc = event.description || '';
      
      // Explicit tagging
      if (event.player_id && mvpMap[event.player_id]) {
        const item = mvpMap[event.player_id];
        if (desc.includes('6 runs') || desc.includes('SIX') || desc.includes('six')) {
          item.runs += 6;
          item.sixes += 1;
          item.points += 10;
        } else if (desc.includes('4 runs') || desc.includes('FOUR') || desc.includes('four')) {
          item.runs += 4;
          item.fours += 1;
          item.points += 6;
        } else if (desc.includes('1 run') || desc.includes('1 runs')) {
          item.runs += 1;
          item.points += 1;
        } else if (desc.includes('2 runs')) {
          item.runs += 2;
          item.points += 2;
        } else if (desc.includes('3 runs')) {
          item.runs += 3;
          item.points += 3;
        } else if (desc.includes('wicket') || desc.includes('out') || desc.includes('bowled') || desc.includes('caught')) {
          item.wickets += 1;
          item.points += 20;
        }
      }

      // String mention scan as broad fallback
      players.forEach(p => {
        if (desc.includes(p.name) && p.id !== event.player_id) {
          const item = mvpMap[p.id];
          if (desc.includes('wicket') || desc.includes('out') || desc.includes('bowled') || desc.includes('caught')) {
            item.wickets += 1;
            item.points += 20;
          } else if (desc.includes('6 runs') || desc.includes('SIX')) {
            item.runs += 6;
            item.sixes += 1;
            item.points += 10;
          } else if (desc.includes('4 runs') || desc.includes('FOUR')) {
            item.runs += 4;
            item.fours += 1;
            item.points += 6;
          }
        }
      });
    });

    const activeList = Object.values(mvpMap).filter(item => item.points > 0);
    activeList.sort((a, b) => b.points - a.points);
    return activeList;
  };

  const downloadScorecardPdf = () => {
    if (!match || !innings) return;
    try {
      const doc = new jsPDF();
      
      // Font branding
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(16, 185, 129); // #10b981 (emerald-500)
      doc.text("GAMEZM MATCH SCORECARD", 14, 25);
      
      // Horizontal Line
      doc.setDrawColor(228, 228, 231);
      doc.setLineWidth(0.5);
      doc.line(14, 30, 196, 30);
      
      // Match Header details
      doc.setFontSize(14);
      doc.setTextColor(24, 24, 27); // zinc-900
      doc.text(`${match.team1_name} vs ${match.team2_name}`, 14, 40);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(113, 113, 122); // zinc-500
      doc.text(`Venue: ${match.venue || 'N/A'}`, 14, 46);
      doc.text(`Date: ${new Date(match.match_date).toLocaleDateString()}`, 14, 52);
      doc.text(`Match Status: ${match.status ? match.status.toUpperCase() : 'N/A'}`, 14, 58);
      
      // Scorecard Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(24, 24, 27);
      doc.text("CURRENT INNINGS SUMMARY", 14, 72);
      
      // Box design for current score
      doc.setFillColor(244, 244, 245); // zinc-100
      doc.rect(14, 76, 182, 28, "F");
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(39, 39, 42); // zinc-800
      doc.text(`${innings.batting_team_name || 'Batting Team'} Innings`, 20, 85);
      
      doc.setFontSize(18);
      doc.setTextColor(16, 185, 129);
      doc.text(`${innings.runs || 0} / ${innings.wickets || 0}`, 20, 96);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(113, 113, 122);
      doc.text(`(${innings.overs_bowled || 0} Overs)`, 60, 96);
      
      // Toss Info if any
      if (match.toss_winner_id) {
        const tossWinner = match.toss_winner_id === match.team1_id ? match.team1_name : match.team2_name;
        doc.setFontSize(10);
        doc.setTextColor(113, 113, 122);
        doc.text(`Toss: ${tossWinner} won and chose to ${match.toss_decision}`, 14, 115);
      }
      
      // Event timeline
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(24, 24, 27);
      doc.text("MATCH TIMELINE & RECENT EVENTS", 14, 128);
      
      // Draw events table header
      let y = 138;
      doc.setFillColor(39, 39, 42); // zinc-800
      doc.rect(14, y - 5, 182, 8, "F");
      
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text("Time", 18, y);
      doc.text("Event Type", 45, y);
      doc.text("Description", 80, y);
      
      doc.setFont("helvetica", "normal");
      doc.setTextColor(63, 63, 70); // zinc-700
      
      events.slice(0, 15).forEach((event) => {
        y += 10;
        // page break precaution
        if (y > 275) {
          doc.addPage();
          y = 25;
        }
        
        const eventTime = new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        doc.text(eventTime, 18, y);
        doc.text(event.event_type ? event.event_type.toUpperCase() : 'COMMENTARY', 45, y);
        
        // Wrap description text to avoid overflow
        const splitDesc = doc.splitTextToSize(event.description || '', 105);
        doc.text(splitDesc, 80, y);
        // increase y if lines wrapped
        if (splitDesc.length > 1) {
          y += (splitDesc.length - 1) * 4;
        }
        
        // boundary line between rows
        doc.setDrawColor(244, 244, 245);
        doc.line(14, y + 3, 196, y + 3);
      });
      
      // Footer
      doc.setFontSize(8);
      doc.setTextColor(161, 161, 170); // zinc-400
      doc.text(`Scorecard generated automatically on ${new Date().toLocaleString()} by KYNTRIVO.`, 14, 285);
      
      doc.save(`scorecard_${match.team1_name}_vs_${match.team2_name}.pdf`);
    } catch (error) {
      console.error("PDF Generation error:", error);
      alert("Failed to generate PDF. Please try again.");
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

  const fetchData = async () => {
    const res = await fetch(`/api/matches/live`);
    const liveMatches = await res.json();
    const currentMatch = liveMatches.find((m: any) => m.id === parseInt(matchId!));
    if (currentMatch) {
      setMatch(currentMatch);
      if (currentMatch.sport === 'soccer' || currentMatch.sport === 'basketball') {
        setInnings(null);
      } else {
        setInnings(currentMatch.innings?.[0] || null);
      }
    }

    const eventsRes = await fetch(`/api/matches/${matchId}/events`);
    const eventsData = await eventsRes.json();
    setEvents(eventsData);
  };

  useEffect(() => {
    fetchData();
    fetchPlayers();

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
          } else if (data.type === 'SCORE_UPDATE_GENERIC' && data.match_id === matchId) {
            setMatch((prev: any) => prev ? { ...prev, team1_score: data.team1_score, team2_score: data.team2_score } : null);
            if (data.event) {
              setEvents(prev => [data.event, ...prev]);
            }
          } else if (data.type === 'MATCH_SETTINGS_UPDATE' && data.match_id === matchId) {
            fetchData(); // Refresh match details
          } else if (data.type === 'MATCH_EVENT' && data.match_id === matchId) {
            setEvents(prev => [data.event, ...prev]);
          }
        } catch (e) {
          console.error('Error parsing live match event:', e);
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
  }, [matchId]);

  if (!match) return <div className="p-8 text-center text-zinc-500">Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <p className="text-xs font-bold text-red-500 uppercase tracking-widest">Live Match</p>
          </div>
          <h1 className="text-4xl font-black tracking-tight">{match.team1_name} vs {match.team2_name}</h1>
          <p className="text-zinc-500 text-sm mt-3">{match.venue} • {new Date(match.match_date).toLocaleDateString()}</p>
        </div>

        {/* AI Insight Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/20 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Sparkles className="h-24 w-24 text-emerald-500" />
          </div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/10">
                <Sparkles className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <h3 className="font-bold text-emerald-500">AI Match Insight</h3>
                <p className="text-[10px] text-emerald-500/50 uppercase font-black tracking-widest leading-none">Powered by Gemini AI</p>
              </div>
            </div>
            <button 
              onClick={generateAiInsight}
              disabled={isGeneratingAi}
              className="px-4 py-2 rounded-xl bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400 disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/20"
            >
              {isGeneratingAi ? 'Analyzing...' : aiInsight ? 'Refresh Insight' : 'Get Insight'}
            </button>
          </div>
          {aiInsight ? (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-zinc-300 italic text-sm leading-relaxed relative z-10"
            >
              "{aiInsight}"
            </motion.p>
          ) : (
            <p className="text-zinc-500 text-sm italic relative z-10">Click the button to get real-time AI commentary and match analytics.</p>
          )}
        </motion.div>

        <div className="p-12 rounded-3xl bg-zinc-900 border border-white/5 text-center mb-8 relative overflow-hidden">
          {(!match.sport || match.sport === 'cricket') ? (
            <>
              <h2 className="text-xl font-bold text-zinc-400 mb-4">{innings?.batting_team_name}</h2>
              <div className="flex items-baseline justify-center gap-4">
                <h1 className="text-8xl font-black tracking-tighter">
                  {innings?.runs || 0}/{innings?.wickets || 0}
                </h1>
                <span className="text-3xl text-zinc-500 font-medium">({innings?.overs_bowled || 0})</span>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-3 items-center text-center max-w-xl mx-auto gap-4">
              <div className="flex flex-col items-center">
                <div className="h-16 w-16 mb-2 rounded-2xl bg-zinc-800 flex items-center justify-center font-black border border-white/5 text-xl">
                  {match.team1_name?.[0]}
                </div>
                <h2 className="text-lg font-bold text-zinc-300">{match.team1_name}</h2>
                <span className="text-[10px] font-bold text-zinc-500 mt-1 uppercase">HOME</span>
              </div>
              
              <div>
                <div className="text-7xl font-black tracking-wider text-white">
                  {match.team1_score || 0} : {match.team2_score || 0}
                </div>
                <div className="text-xs text-emerald-400 bg-emerald-500/10 rounded-full px-3 py-1 font-bold inline-block mt-3 capitalize">
                  {match.sport} Match
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="h-16 w-16 mb-2 rounded-2xl bg-zinc-800 flex items-center justify-center font-black border border-white/5 text-xl">
                  {match.team2_name?.[0]}
                </div>
                <h2 className="text-lg font-bold text-zinc-300">{match.team2_name}</h2>
                <span className="text-[10px] font-bold text-zinc-500 mt-1 uppercase">AWAY</span>
              </div>
            </div>
          )}
          
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {match.live_stream_url && (
              <a 
                href={match.live_stream_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm font-bold text-red-500 hover:bg-red-500/20 transition-all"
              >
                <Video className="h-5 w-5" /> Watch Live Stream
              </a>
            )}
            <button 
              onClick={downloadScorecardPdf}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-black text-sm font-bold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/15"
            >
              <Download className="h-5 w-5" /> Download PDF Scorecard
            </button>
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-800 border border-white/10 text-sm font-bold hover:bg-zinc-700 hover:text-white transition-all text-zinc-300"
            >
              <Share2 className="h-5 w-5 text-emerald-500" /> Share on Socials
            </button>
          </div>

          {/* Player of the Match MVP Badge */}
          {(() => {
            const mvpList = calculateMVPList();
            const playerOfTheMatch = mvpList[0];
            if (!playerOfTheMatch) return null;
            return (
              <div className="mt-10 pt-8 border-t border-white/5 flex flex-col items-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-wider mb-4 animate-pulse">
                  <Crown className="h-3 w-3 text-amber-500" /> Player of the Match MVP
                </div>
                
                <div className="flex items-center gap-4 bg-black/40 border border-white/[0.04] p-4 pr-6 rounded-2xl max-w-md w-full hover:border-amber-500/20 transition-all duration-300">
                  <div className="relative">
                    <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-amber-500/40 bg-zinc-800">
                      <img 
                        src={playerOfTheMatch.player.image_url || `https://picsum.photos/seed/${encodeURIComponent(playerOfTheMatch.player.name)}/120/120`} 
                        alt={playerOfTheMatch.player.name}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-amber-500 text-black rounded-full flex items-center justify-center font-black text-xs leading-none">
                      ★
                    </div>
                  </div>
                  <div className="text-left">
                    <h4 className="text-base font-black text-white">{playerOfTheMatch.player.name}</h4>
                    <p className="text-xs text-zinc-400">{playerOfTheMatch.player.role} • {playerOfTheMatch.player.specialization}</p>
                    <p className="text-[10px] text-zinc-500 font-mono mt-1">
                      MVP Score: <span className="font-extrabold text-amber-400">{playerOfTheMatch.points} Points</span> ({playerOfTheMatch.runs} runs, {playerOfTheMatch.wickets} wickets)
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}

          {isAdmin && (
            <div className="mt-8 flex justify-center">
              <button 
                onClick={undoLastBall}
                className="flex items-center gap-2 px-6 py-2 rounded-xl bg-zinc-800 border border-white/10 text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all"
              >
                <History className="h-4 w-4" /> Undo Last Ball (Admin Only)
              </button>
            </div>
          )}

          <div className="mt-8 flex justify-center gap-12">
            <div className="text-center">
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">CRR</p>
              <p className="text-xl font-bold">
                {innings?.overs_bowled > 0 ? (innings.runs / (Math.floor(innings.overs_bowled) + (Math.round((innings.overs_bowled % 1) * 10) / 6))).toFixed(2) : '0.00'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2 px-2 mb-4">
              <MessageSquare className="h-4 w-4 text-emerald-500" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Live Timeline</h3>
            </div>
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {events.map((event) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 500,
                      damping: 35,
                      mass: 1,
                      opacity: { duration: 0.25 }
                    }}
                    key={event.id} 
                    className="p-5 rounded-2xl bg-zinc-900 border border-white/5 flex items-start gap-4 hover:border-white/10 transition-colors"
                  >
                    <div className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center shrink-0 border",
                      event.event_type === 'goal' || event.event_type === 'point' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
                      event.event_type === 'wicket' || event.event_type === 'out' ? "bg-red-500/10 border-red-500/20 text-red-500" :
                      "bg-zinc-800 border-white/5 text-zinc-500"
                    )}>
                      {event.event_type === 'commentary' ? <MessageSquare className="h-4 w-4" /> : <Target className="h-5 w-5" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-zinc-200">{event.description}</p>
                        <span className="text-[10px] text-zinc-600 font-bold">
                          {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {event.player_id && (
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                          <User className="h-3 w-3" /> Player Event
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {events.length === 0 && (
                <div className="text-center py-12 rounded-3xl bg-zinc-900/50 border border-dashed border-white/10">
                  <p className="text-zinc-600 text-sm italic">Live timeline will appear here as the match progresses.</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-zinc-900 border border-white/5">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6">Scorecard Info</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500">Venue</span>
                  <span className="font-medium text-emerald-500">{match.venue}</span>
                </div>
                {match.toss_winner_id && (
                  <div className="pt-4 border-t border-white/5">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-2">Toss Details</p>
                    <p className="text-xs text-zinc-300">
                      {match.toss_winner_id === match.team1_id ? match.team1_name : match.team2_name} won and chose to {match.toss_decision}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-zinc-900 border border-white/5">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Live Help</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Stay tuned for live updates, goals, and big moments. Scores are refreshed in real-time.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stylized Social Media Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-xl bg-zinc-950 border border-white/10 rounded-3xl overflow-hidden p-6 shadow-2xl shadow-emerald-500/5 space-y-6"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-2">
                  <Share2 className="text-emerald-500 h-5 w-5" />
                  <h3 className="text-lg font-black text-white">Share Match Scorecard</h3>
                </div>
                <button 
                  onClick={() => setShowShareModal(false)}
                  className="p-1 rounded-lg bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white transition-all hover:bg-zinc-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Poster Preview Section */}
              <div className="space-y-2">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-black block">Stylized Match Poster Preview</span>
                
                {/* Simulated high-contrast Instagram / Twitter card poster */}
                <div className="p-8 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-emerald-950/20 border border-emerald-500/20 text-center relative overflow-hidden flex flex-col justify-between h-72">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500" />
                  
                  <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest text-emerald-500/75 px-1">
                    <span>KYNTRIVO CHAMPIONSHIPS</span>
                    <span>LIVE RECORD</span>
                  </div>

                  <div className="space-y-2 my-auto">
                    <h2 className="text-2xl font-black text-white leading-none tracking-tight">
                      {match.team1_name} vs {match.team2_name}
                    </h2>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-5xl font-black text-emerald-400">
                        {innings?.runs || 0}/{innings?.wickets || 0}
                      </span>
                      <span className="text-sm text-zinc-500">({innings?.overs_bowled} Overs)</span>
                    </div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-zinc-800/80 text-[10px] text-zinc-400 font-bold border border-white/5">
                      Venue: {match.venue || 'Match Arena'}
                    </span>
                  </div>

                  {(() => {
                    const mvpItems = calculateMVPList();
                    const pom = mvpItems[0];
                    if (!pom) return null;
                    return (
                      <div className="bg-black/60 backdrop-blur-sm rounded-xl p-3 border border-amber-500/20 max-w-sm mx-auto w-full flex items-center gap-3">
                        <div className="relative h-8 w-8 rounded-full overflow-hidden border border-amber-500 shrink-0">
                          <img 
                            src={pom.player.image_url || `https://picsum.photos/seed/${encodeURIComponent(pom.player.name)}/120/120`} 
                            alt={pom.player.name}
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="text-left leading-none">
                          <span className="text-[8px] font-black tracking-widest text-amber-400 uppercase block mb-0.5">PLAYER OF THE MATCH MVP</span>
                          <span className="text-xs font-bold text-white block">{pom.player.name}</span>
                        </div>
                        <div className="ml-auto text-right shrink-0">
                          <span className="text-xs font-black text-amber-400">{pom.points} pts</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Sharing interactions */}
              <div className="space-y-4 pt-1">
                {/* QR Code Section for Instant Mobile Scan */}
                <div className="p-4 rounded-2xl bg-zinc-950/70 border border-white/5 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                  <div className="bg-white p-2.5 rounded-xl shrink-0 shadow-md">
                    {matchQrCode ? (
                      <img src={matchQrCode} alt="Match QR Code" className="w-24 h-24 block rounded" />
                    ) : (
                      <div className="w-24 h-24 flex items-center justify-center text-zinc-400">
                        <QrCodeIcon className="h-8 w-8 animate-pulse text-zinc-600" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest flex items-center justify-center sm:justify-start gap-1">
                      <QrCodeIcon className="h-3.5 w-3.5" /> Scan Match Scorecard
                    </span>
                    <h4 className="text-sm font-bold text-white">Scan QR to Open Scorecard</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Spectators and team fans can scan this QR code directly with any phone camera to view live overs, ball commentary, and player MVP stats.
                    </p>
                  </div>
                </div>

                {/* Copyable Public URL input row */}
                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-black block">Public Match URL</label>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      readOnly
                      value={window.location.origin + "/match/" + matchId}
                      className="flex-1 text-xs px-4 py-3 rounded-xl bg-black border border-white/10 text-zinc-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.origin + "/match/" + matchId);
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 2000);
                      }}
                      className="px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 hover:bg-zinc-800 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="h-4 w-4 text-emerald-500" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 text-zinc-400" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Social Share action links */}
                <div className="flex gap-3">
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('What an incredible sports clash! ' + (match.team1_name || 'Team 1') + ' vs ' + (match.team2_name || 'Team 2') + ' live on KYNTRIVO. Scan QR or check active scorecard!')}&url=${encodeURIComponent(window.location.origin + '/match/' + matchId)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-black text-xs font-black text-center transition-all cursor-pointer"
                  >
                    Share on Twitter / X
                  </a>
                  <button
                    onClick={() => {
                      if (matchQrCode) {
                        const link = document.createElement('a');
                        link.href = matchQrCode;
                        link.download = `match-${matchId}-scorecard-qr.png`;
                        link.click();
                      }
                      setPosterSaved(true);
                      setTimeout(() => setPosterSaved(false), 3000);
                    }}
                    className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black text-center transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>{posterSaved ? 'QR Code Saved!' : 'Save Match QR'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ProductDetailsPage = () => {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500">Loading product details...</div>;
  if (!product) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500">Product not found</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
          >
            <ChevronRight className="h-4 w-4 rotate-180" /> Back to Shop
          </button>
          {isAdmin && (
            <Link 
              to="/admin/shop" 
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
            >
              <Edit2 className="h-4 w-4" /> Edit Product
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="rounded-3xl bg-zinc-900 overflow-hidden border border-white/5 aspect-square">
            {product.image_url ? (
              <img 
                src={product.image_url} 
                alt={product.name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-700">
                <Package className="h-24 w-24" />
              </div>
            )}
          </div>

          <div className="space-y-8">
            <div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold uppercase tracking-widest border border-emerald-500/20">
                {product.category}
              </span>
              <h1 className="text-4xl font-bold mt-4">{product.name}</h1>
              <p className="text-3xl font-black text-emerald-500 mt-4">₹{product.price}</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Description</h3>
              <p className="text-zinc-400 leading-relaxed">{product.description}</p>
            </div>

            {product.selling_options && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Available Options</h3>
                <div className="flex flex-wrap gap-2">
                  {product.selling_options.split(',').map((opt: string) => (
                    <span key={opt} className="px-4 py-2 rounded-xl bg-zinc-900 border border-white/10 text-sm">
                      {opt.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-8 border-t border-white/5">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-xs text-zinc-500 mb-1">In Stock</p>
                  <p className="font-bold">{product.stock} units available</p>
                </div>
                <Link 
                  to="/shop" 
                  className="bg-emerald-500 text-black font-bold px-8 py-4 rounded-2xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
                >
                  Buy Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const OrderDetailsPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then(res => res.json())
      .then(data => {
        setOrder(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const updateStatus = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setOrder({ ...order, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500">Loading order details...</div>;
  if (!order) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500">Order not found</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="mx-auto max-w-5xl px-6 py-12">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors"
        >
          <ChevronRight className="h-4 w-4 rotate-180" /> Back to Orders
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tighter">Order <span className="text-emerald-500">#{order.id.toString().padStart(5, '0')}</span></h1>
            <p className="text-zinc-500 mt-2">Placed on {new Date(order.created_at).toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-4">
            <select 
              value={order.status}
              onChange={(e) => updateStatus(e.target.value)}
              className={cn(
                "px-6 py-3 rounded-2xl font-bold uppercase tracking-widest bg-zinc-900 border border-white/10 focus:ring-2 focus:ring-emerald-500/50 cursor-pointer transition-all",
                order.status === 'pending' ? "text-yellow-500" :
                order.status === 'shipped' ? "text-blue-500" :
                "text-emerald-500"
              )}
            >
              <option value="pending">Pending</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Product Info */}
            <div className="p-8 rounded-3xl bg-zinc-900 border border-white/5">
              <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6">Order Items</h3>
              <div className="flex gap-6">
                <div className="h-24 w-24 rounded-2xl bg-black overflow-hidden border border-white/10 flex-shrink-0">
                  {order.product_image ? (
                    <img src={order.product_image} alt={order.product_name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-zinc-800">
                      <Package className="h-10 w-10" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold">{order.product_name}</h4>
                  <p className="text-zinc-500 mt-1">Quantity: {order.quantity}</p>
                  <p className="text-emerald-500 font-black text-lg mt-2">₹{order.total_price}</p>
                </div>
              </div>
            </div>

            {/* Customer & Shipping */}
            <div className="p-8 rounded-3xl bg-zinc-900 border border-white/5">
              <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6">Shipping Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Customer Name</p>
                    <p className="font-bold">{order.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Email Address</p>
                    <p className="font-bold">{order.customer_email}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Phone Number</p>
                    <p className="font-bold">{order.customer_mobile}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Delivery Address</p>
                  <p className="font-bold leading-relaxed">{order.customer_address}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Payment Info */}
            <div className="p-8 rounded-3xl bg-zinc-900 border border-white/5">
              <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6">Payment Details</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Method</span>
                  <div className="flex items-center gap-2 font-bold uppercase text-xs">
                    {order.payment_method === 'upi' ? <Smartphone className="h-4 w-4 text-emerald-500" /> : <CreditCard className="h-4 w-4 text-emerald-500" />}
                    {order.payment_method || 'UPI'}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Status</span>
                  <span className="text-emerald-500 font-bold uppercase text-xs">Paid</span>
                </div>
                {order.payment_details && (
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">{order.payment_method === 'upi' ? 'UPI ID' : 'Card Details'}</span>
                    <span className="font-mono text-[10px] text-zinc-400">{order.payment_details}</span>
                  </div>
                )}
                <div className="pt-6 border-t border-white/5 flex items-center justify-between text-xl font-black">
                  <span>Total</span>
                  <span className="text-emerald-500">₹{order.total_price}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-8 rounded-3xl bg-zinc-900 border border-white/5">
              <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full py-3 rounded-xl bg-zinc-800 border border-white/5 text-xs font-bold hover:bg-zinc-700 transition-all">Print Invoice</button>
                <button className="w-full py-3 rounded-xl bg-zinc-800 border border-white/5 text-xs font-bold hover:bg-zinc-700 transition-all">Contact Customer</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Pages ---

const HomePage = () => {
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [activeSponsors, setActiveSponsors] = useState<Sponsor[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [featuredGrounds, setFeaturedGrounds] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/matches/live')
      .then(res => res.json())
      .then(data => setLiveMatches(data));

    fetch('/api/sponsors/active')
      .then(res => res.json())
      .then(data => setActiveSponsors(data));

    fetch('/api/featured/products')
      .then(res => res.json())
      .then(data => setFeaturedProducts(data));

    fetch('/api/featured/grounds')
      .then(res => res.json())
      .then(data => setFeaturedGrounds(data));
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <Hero />

      {activeSponsors.length > 0 && (
        <div className="bg-zinc-900/30 border-y border-white/5 py-24 overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <p className="text-center text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-16">Official Tournament Partners</p>
            <div className="flex flex-wrap items-center justify-center gap-12 md:gap-24">
              {activeSponsors.map(sponsor => (
                <a 
                  key={sponsor.id}
                  href={sponsor.website_url || '#'}
                  target={sponsor.website_url ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  className="block transform scale-125 md:scale-150"
                >
                  {sponsor.banner_url ? (
                    <img 
                      src={sponsor.banner_url} 
                      alt={sponsor.name} 
                      className="h-16 md:h-24 w-auto object-contain"
                    />
                  ) : (
                    <span className="text-3xl font-black text-zinc-700 uppercase tracking-tighter">
                      {sponsor.name}
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <section className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
        {/* Live Matches Section */}
        <div className="mb-24">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-black tracking-tighter">Live Matches</h2>
            <Link to="/live" className="flex items-center gap-1 text-sm text-emerald-500 font-bold hover:text-emerald-400">
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveMatches.length > 0 ? (
              liveMatches.map(match => <LiveMatchCard key={match.id} match={match} />)
            ) : (
              <div className="col-span-full py-12 text-center border border-dashed border-white/10 rounded-3xl text-zinc-500">
                No matches live right now.
              </div>
            )}
          </div>
        </div>

        {/* Featured Products Section */}
        {featuredProducts.length > 0 && (
          <div className="mb-24">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black tracking-tighter">Official Merchandise</h2>
              <Link to="/shop" className="flex items-center gap-1 text-sm text-emerald-500 font-bold hover:text-emerald-400">
                Visit Shop <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {featuredProducts.map(product => (
                <div key={product.id} className="group cursor-pointer">
                  <div className="aspect-square bg-zinc-900 rounded-3xl border border-white/5 overflow-hidden mb-4 relative">
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute bottom-4 right-4 h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center text-black shadow-lg">
                      <ShoppingBag className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="font-bold text-sm mb-1 group-hover:text-emerald-500 transition-colors">{product.name}</h3>
                  <p className="text-emerald-500 font-black text-xs">₹{product.price}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Featured Grounds Section */}
        {featuredGrounds.length > 0 && (
          <div className="mb-24">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black tracking-tighter">Available Grounds</h2>
              <button onClick={() => navigate('/admin/grounds')} className="flex items-center gap-1 text-sm text-emerald-500 font-bold hover:text-emerald-400">
                Book a Ground <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredGrounds.map(ground => (
                <div key={ground.id} className="p-6 rounded-3xl bg-zinc-900/30 border border-white/5 hover:border-emerald-500/20 transition-all group">
                  <div className="aspect-[16/9] rounded-2xl bg-black mb-6 overflow-hidden">
                    {ground.image_url ? (
                      <img src={ground.image_url} alt={ground.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-800">
                        <MapPin className="h-12 w-12" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-3 w-3 text-emerald-500" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{ground.location}</span>
                  </div>
                  <h3 className="text-xl font-black mb-2">{ground.name}</h3>
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <p className="text-emerald-500 font-black">₹{ground.price_per_hour}/hr</p>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest">Available</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-10 rounded-3xl bg-zinc-900/30 border border-white/5 pb-10">
            <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-8">
              <LayoutDashboard className="h-7 w-7 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-black mb-4">Admin Suite</h3>
            <p className="text-zinc-400 leading-relaxed">
              Complete control over your tournament. Manage teams, schedules, and approvals from one place.
            </p>
          </div>
          <div className="p-10 rounded-3xl bg-zinc-900/30 border border-white/5">
            <div className="h-14 w-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-8">
              <PlayCircle className="h-7 w-7 text-blue-500" />
            </div>
            <h3 className="text-2xl font-black mb-4">Live Scoring</h3>
            <p className="text-zinc-400 leading-relaxed">
              Professional ball-by-ball scoring interface. Update scores in real-time for your audience.
            </p>
          </div>
          <Link to="/players" className="p-10 rounded-3xl bg-zinc-900/30 border border-white/5 hover:bg-zinc-900/50 transition-all group">
            <div className="h-14 w-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
              <Users className="h-7 w-7 text-purple-500" />
            </div>
            <h3 className="text-2xl font-black mb-4">Player Pool</h3>
            <p className="text-zinc-400 leading-relaxed">
              Explore the complete database of players. View stats, roles, and auction history across all tournaments.
            </p>
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  );
};

const TournamentAnalytics = () => {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/analytics/${id}`)
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="p-12 text-center text-zinc-500">Loading comprehensive analytics...</div>;
  if (!data) return <div className="p-12 text-center text-zinc-500">No analytics data available for this tournament.</div>;

  const financialData = [
    { name: 'Auction Revenue', value: data.financials.auctionRevenue, color: '#10b981' },
    { name: 'Total Expenses', value: data.financials.totalExpenses, color: '#ef4444' },
  ];

  const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b'];

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <Link to="/admin" className="text-emerald-500 text-sm hover:underline mb-2 inline-block">← Back to Dashboard</Link>
            <h1 className="text-3xl font-black tracking-tight">Tournament Analytics</h1>
            <p className="text-zinc-500">Detailed insights and performance tracking</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-zinc-900 border border-white/10 font-bold hover:bg-zinc-800 transition-all">
            <Package className="h-4 w-4" /> Export Report
          </button>
        </div>

        {/* Global Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-3xl bg-zinc-900 border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Net Balance</p>
              <div className={`p-2 rounded-xl ${data.financials.netBalance >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                <IndianRupee className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-black">₹{data.financials.netBalance.toLocaleString()}</p>
            <p className="text-[10px] text-zinc-500 mt-2 flex items-center gap-1">
              {data.financials.netBalance >= 0 ? <TrendingUp className="h-3 w-3 text-emerald-500" /> : <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />}
              vs previous week
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 rounded-3xl bg-zinc-900 border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Total Matches</p>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                <Activity className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-black">{data.summary.totalMatches}</p>
            <p className="text-[10px] text-zinc-500 mt-2">{data.summary.completedMatches} Completed</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-6 rounded-3xl bg-zinc-900 border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Avg. Match Score</p>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                <Target className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-black">164.2</p>
            <p className="text-[10px] text-zinc-500 mt-2">Per Innings</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="p-6 rounded-3xl bg-zinc-900 border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Active Teams</p>
              <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-500">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-black">{data.summary.activeTeams}</p>
            <p className="text-[10px] text-zinc-500 mt-2">Fully Registered</p>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Financial Breakdown */}
          <div className="p-8 rounded-3xl bg-zinc-900 border border-white/5 h-[400px]">
            <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-500" /> Financial Health
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={financialData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {financialData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-8 mt-4">
              {financialData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-zinc-400">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Standings Bar Chart */}
          <div className="p-8 rounded-3xl bg-zinc-900 border border-white/5 h-[400px]">
            <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" /> Team Points
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.standings}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: '#ffffff05' }}
                    contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="points" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Player Stats Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Top Batsmen */}
          <div className="rounded-3xl bg-zinc-900 border border-white/5 overflow-hidden">
            <div className="p-6 border-b border-white/5 bg-zinc-900/50">
              <h3 className="font-bold flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-500" /> Orange Cap Leaders
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-zinc-800/30 text-zinc-500 uppercase text-[10px] tracking-widest font-black">
                    <th className="px-6 py-4">Player</th>
                    <th className="px-6 py-4">Team</th>
                    <th className="px-6 py-4">Runs</th>
                    <th className="px-6 py-4">SR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.topScorers.map((p: any) => (
                    <tr key={p.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-bold">{p.name}</td>
                      <td className="px-6 py-4 text-zinc-400">{p.team_name}</td>
                      <td className="px-6 py-4 font-black text-blue-400">{p.total_runs}</td>
                      <td className="px-6 py-4 text-zinc-500">{((p.total_runs / p.balls_faced) * 100 || 0).toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Bowlers */}
          <div className="rounded-3xl bg-zinc-900 border border-white/5 overflow-hidden">
            <div className="p-6 border-b border-white/5 bg-zinc-900/50">
              <h3 className="font-bold flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-500" /> Purple Cap Leaders
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-zinc-800/30 text-zinc-500 uppercase text-[10px] tracking-widest font-black">
                    <th className="px-6 py-4">Player</th>
                    <th className="px-6 py-4">Team</th>
                    <th className="px-6 py-4">Wickets</th>
                    <th className="px-6 py-4">Econ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.topBowlers.map((p: any) => (
                    <tr key={p.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-bold">{p.name}</td>
                      <td className="px-6 py-4 text-zinc-400">{p.team_name}</td>
                      <td className="px-6 py-4 font-black text-purple-400">{p.wickets}</td>
                      <td className="px-6 py-4 text-zinc-500">{(p.runs_conceded / (p.balls_bowled / 6) || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Team Performance Table */}
        <div className="rounded-3xl bg-zinc-900 border border-white/5 overflow-hidden">
          <div className="p-6 border-b border-white/5 bg-zinc-900/50">
            <h3 className="font-bold flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5 text-emerald-500" /> Tournament Standings
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-zinc-800/30 text-zinc-500 uppercase text-[10px] tracking-widest font-black">
                  <th className="px-6 py-4">Position</th>
                  <th className="px-6 py-4">Team Name</th>
                  <th className="px-6 py-4">Played</th>
                  <th className="px-6 py-4">Won</th>
                  <th className="px-6 py-4">Lost</th>
                  <th className="px-6 py-4">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.standings.map((t: any, idx: number) => (
                  <motion.tr 
                    key={t.id} 
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: "spring", stiffness: 100, damping: 15, delay: idx * 0.05 }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black ${idx === 0 ? 'bg-yellow-500 text-black' : 'bg-zinc-800 text-zinc-500'}`}>
                        {idx + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold">{t.name}</td>
                    <td className="px-6 py-4">{t.played}</td>
                    <td className="px-6 py-4 text-emerald-500 font-bold">{t.wins}</td>
                    <td className="px-6 py-4 text-red-500 font-bold">{t.losses}</td>
                    <td className="px-6 py-4 font-black">{t.points}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { logout, isAdmin, plan } = useAuth();
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [playersCount, setPlayersCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [bookingsCount, setBookingsCount] = useState(0);
  const [liveMatches, setLiveMatches] = useState<any[]>([]);

  const fetchData = () => {
    fetch('/api/tournaments')
      .then(res => res.json())
      .then(data => setTournaments(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
    
    fetch('/api/players')
      .then(res => res.json())
      .then(data => setPlayersCount(Array.isArray(data) ? data.length : 0))
      .catch(err => console.error(err));

    fetch('/api/orders')
      .then(res => res.json())
      .then(data => setOrdersCount(Array.isArray(data) ? data.length : 0))
      .catch(err => console.error(err));

    fetch('/api/bookings')
      .then(res => res.json())
      .then(data => setBookingsCount(Array.isArray(data) ? data.length : 0))
      .catch(err => console.error(err));

    fetch('/api/matches/live')
      .then(res => res.json())
      .then(data => setLiveMatches(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const deleteTournament = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this tournament?')) return;
    try {
      const res = await fetch(`/api/tournaments/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting tournament:', error);
    }
  };

  const toggleTournamentStatus = async (tournament: Tournament) => {
    const newStatus = tournament.status === 'active' ? 'deactivated' : 'active';
    try {
      const res = await fetch(`/api/tournaments/${tournament.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...tournament, status: newStatus })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error toggling tournament status:', error);
    }
  };

  // Role flags
  const isSellerAndGroundOwner = plan === 'pro' && !isAdmin;
  const isOrganizer = (plan === 'organizer' || isAdmin) && !isSellerAndGroundOwner;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isAdmin ? 'Master Admin Dashboard' : isSellerAndGroundOwner ? 'Seller & Ground Owner Hub' : 'Tournament Organizer Dashboard'}
            </h1>
            <p className="text-zinc-400 mt-1">
              {isAdmin 
                ? 'Manage all tournaments, shop operations, ground bookings, and system settings' 
                : isSellerAndGroundOwner 
                ? 'Manage your shop merchandise, inventory, orders, and ground venue bookings' 
                : 'Manage your sports leagues, generate fixtures, update live scores, and view analytics'}
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/admin/payment-settings" className="flex items-center gap-2 rounded-xl bg-zinc-900 border border-white/10 px-4 py-2 text-sm font-semibold hover:text-white transition-all">
              <CreditCard className="h-4 w-4" /> Payment Settings
            </Link>
            <Link to="/settings" className="flex items-center gap-2 rounded-xl bg-zinc-900 border border-white/10 px-4 py-2 text-sm font-semibold hover:text-white transition-all">
              <Settings className="h-4 w-4" /> General Settings
            </Link>
            <button 
              onClick={() => { logout(); navigate('/'); }}
              className="flex items-center gap-2 rounded-xl bg-zinc-900 border border-white/10 px-4 py-2 text-sm font-semibold hover:text-white transition-all text-red-400"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
            {(isAdmin || isOrganizer) && (
              <Link to="/admin/create" className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold hover:bg-emerald-400 text-black transition-all">
                <Plus className="h-4 w-4" /> Create Tournament
              </Link>
            )}
          </div>
        </div>

        {/* Stats Cards based on Role */}
        {isSellerAndGroundOwner ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5">
              <p className="text-sm text-zinc-500 mb-1">Shop Orders</p>
              <p className="text-2xl font-bold">{ordersCount}</p>
              <Link to="/admin/shop" className="text-xs text-emerald-500 hover:underline mt-2 inline-block">Manage Shop & Orders →</Link>
            </div>
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5">
              <p className="text-sm text-zinc-500 mb-1">Ground Bookings</p>
              <p className="text-2xl font-bold">{bookingsCount}</p>
              <Link to="/admin/grounds" className="text-xs text-emerald-500 hover:underline mt-2 inline-block">Manage Ground Venues →</Link>
            </div>
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5">
              <p className="text-sm text-zinc-500 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold">₹0</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5">
              <p className="text-sm text-zinc-500 mb-1">Total Tournaments</p>
              <p className="text-2xl font-bold">{tournaments.length}</p>
            </div>
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5">
              <p className="text-sm text-zinc-500 mb-1">Active Matches</p>
              <p className="text-2xl font-bold">{liveMatches.length}</p>
            </div>
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5">
              <p className="text-sm text-zinc-500 mb-1">Total Players</p>
              <p className="text-2xl font-bold">{playersCount}</p>
              <Link to="/players" className="text-xs text-emerald-500 hover:underline mt-2 inline-block">Manage Pool →</Link>
            </div>
            {isAdmin && (
              <>
                <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5">
                  <p className="text-sm text-zinc-500 mb-1">Shop Orders</p>
                  <p className="text-2xl font-bold">{ordersCount}</p>
                  <Link to="/admin/shop" className="text-xs text-emerald-500 hover:underline mt-2 inline-block">Manage Shop →</Link>
                </div>
                <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5">
                  <p className="text-sm text-zinc-500 mb-1">Ground Bookings</p>
                  <p className="text-2xl font-bold">{bookingsCount}</p>
                  <Link to="/admin/grounds" className="text-xs text-emerald-500 hover:underline mt-2 inline-block">Manage Bookings →</Link>
                </div>
              </>
            )}
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5">
              <p className="text-sm text-zinc-500 mb-1">Revenue</p>
              <p className="text-2xl font-bold">₹0</p>
            </div>
          </div>
        )}

        {/* Lower Main Content based on Role */}
        {isSellerAndGroundOwner ? (
          <div className="space-y-8">
            <h2 className="text-xl font-bold">Management Portals</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-zinc-900/40 border border-white/10 hover:border-emerald-500/30 transition-all flex flex-col justify-between">
                <div>
                  <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit mb-4">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Manage Shop Products & Merchandise</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                    Add new products, configure pricing, upload high-res images, update inventory stock, and track customer shop orders.
                  </p>
                </div>
                <Link to="/admin/shop" className="w-full py-3 rounded-xl bg-emerald-500 text-black text-xs font-bold uppercase tracking-wider text-center block hover:bg-emerald-400 transition-all">
                  Open Shop Portal →
                </Link>
              </div>

              <div className="p-6 rounded-2xl bg-zinc-900/40 border border-white/10 hover:border-emerald-500/30 transition-all flex flex-col justify-between">
                <div>
                  <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit mb-4">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Manage Ground Venues & Slot Bookings</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                    List new sports grounds, configure slot timing, set hourly rates, and review or approve customer booking requests.
                  </p>
                </div>
                <Link to="/admin/grounds" className="w-full py-3 rounded-xl bg-emerald-500 text-black text-xs font-bold uppercase tracking-wider text-center block hover:bg-emerald-400 transition-all">
                  Open Ground Booking Portal →
                </Link>
              </div>

              <div className="p-6 rounded-2xl bg-zinc-900/40 border border-white/10 hover:border-emerald-500/30 transition-all flex flex-col justify-between">
                <div>
                  <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit mb-4">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Merchant Payment Gateways</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                    Configure custom UPI VPA addresses, merchant QR code scanning, and card payment settings for store sales and ground rentals.
                  </p>
                </div>
                <Link to="/admin/payment-settings" className="w-full py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs font-bold uppercase tracking-wider text-center block hover:bg-zinc-800 transition-all">
                  Payment Settings →
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-emerald-500" /> Live Scoreboard
              </h2>
              <div className="space-y-4">
                {liveMatches.length > 0 ? (
                  liveMatches.map(match => (
                    <Link 
                      key={match.id} 
                      to={`/admin/score/${match.id}`}
                      className="block p-6 rounded-2xl bg-zinc-900/30 border border-white/5 hover:bg-zinc-900/50 transition-all"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-widest animate-pulse">Live</span>
                        </div>
                        <span className="text-xs text-zinc-500">{match.venue}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold">{match.team1_name}</span>
                            <span className="font-mono text-lg font-black">
                              {match.innings?.[0]?.runs || 0}/{match.innings?.[0]?.wickets || 0}
                              <span className="text-xs text-zinc-500 ml-2">({match.innings?.[0]?.overs_bowled || 0})</span>
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-bold">{match.team2_name}</span>
                            <span className="font-mono text-lg font-black">
                              {match.innings?.[1]?.runs || 0}/{match.innings?.[1]?.wickets || 0}
                              <span className="text-xs text-zinc-500 ml-2">({match.innings?.[1]?.overs_bowled || 0})</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="py-12 text-center border border-dashed border-white/10 rounded-2xl text-zinc-500">
                    No matches are currently live.
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3 mb-8">
                <Link to="/players" className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5 hover:bg-zinc-900 transition-all text-center">
                  <Users className="h-5 w-5 mx-auto mb-2 text-blue-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Players</span>
                </Link>
                <Link to="/admin/analytics/all" className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5 hover:bg-zinc-900 transition-all text-center">
                  <BarChart3 className="h-5 w-5 mx-auto mb-2 text-emerald-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Stats</span>
                </Link>
              </div>

              <h2 className="text-xl font-bold mb-6">Recent Tournaments</h2>
              <div className="space-y-4">
                {tournaments.slice(0, 5).map(t => (
                  <div 
                    key={t.id} 
                    className="group block p-4 rounded-2xl bg-zinc-900/30 border border-white/5 hover:bg-zinc-900/50 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <Link to={`/admin/tournament/${t.id}`} className="hover:underline">
                        <h3 className="font-bold text-sm">{t.name}</h3>
                      </Link>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{t.format}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => toggleTournamentStatus(t)}
                          className={`text-xs px-2 py-1 rounded-lg ${t.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-400'}`}
                        >
                          {t.status === 'active' ? 'Active' : 'Inactive'}
                        </button>
                        <button 
                          onClick={() => deleteTournament(t.id)}
                          className="text-xs text-red-400 hover:text-red-300 p-1"
                          title="Delete Tournament"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Quick Actions Menu */}
      <QuickActionsMenu onRefresh={fetchData} tournaments={tournaments} />
    </div>
  );
};

const CreateTournament = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    sport: 'soccer', // Default to soccer as requested
    format: 'league',
    teams_count: 8,
    is_auction_enabled: false,
    base_budget: 10000000,
    startDate: '',
    endDate: '',
  });

  const [modules, setModules] = useState({
    teams: true,
    matches: true,
    players: true,
    stats: true,
    expenses: true,
    sponsors: true,
    chat: true,
    rules: true,
    gallery: true,
    live_score_settings: true,
  });

  // State for sport rules
  const [soccerRules, setSoccerRules] = useState({
    half_duration: 45,
    extra_time: false,
    max_subs: 5,
    offside_active: true,
  });

  const [cricketRules, setCricketRules] = useState({
    overs: 20,
    balls_per_over: 6,
    powerplay_overs: 6,
  });

  const [basketballRules, setBasketballRules] = useState({
    quarter_duration: 12,
    shot_clock: 24,
    foul_out_limit: 5,
  });

  const [badmintonRules, setBadmintonRules] = useState({
    match_format: 'best_of_3',
    points_per_set: 21,
    deuce_cap: 30,
    shuttle_type: 'feather',
    interval_rule: true,
  });

  const [tennisRules, setTennisRules] = useState({
    match_format: 'best_of_3',
    games_per_set: 6,
    deuce_scoring: 'advantage',
    final_tiebreak: 'super_tiebreak_10',
    court_surface: 'hard',
  });

  const toggleModule = (modKey: keyof typeof modules) => {
    setModules(prev => ({
      ...prev,
      [modKey]: !prev[modKey]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Choose selected sport configurations
    const currentSportRules = 
      formData.sport === 'soccer' ? soccerRules :
      formData.sport === 'basketball' ? basketballRules :
      formData.sport === 'badminton' ? badmintonRules :
      formData.sport === 'tennis' ? tennisRules :
      cricketRules;

    const sport_options = {
      modules,
      rules: currentSportRules,
    };

    let calculatedOvers = cricketRules.overs;
    if (formData.sport === 'soccer') {
      calculatedOvers = soccerRules.half_duration * 2;
    } else if (formData.sport === 'basketball') {
      calculatedOvers = basketballRules.quarter_duration * 4;
    } else if (formData.sport === 'badminton') {
      calculatedOvers = badmintonRules.match_format === 'best_of_5' ? 5 : (badmintonRules.match_format === 'single_set' ? 1 : 3);
    } else if (formData.sport === 'tennis') {
      calculatedOvers = tennisRules.match_format === 'best_of_5' ? 5 : (tennisRules.match_format === 'pro_set' ? 8 : 3);
    }

    const payload = {
      name: formData.name,
      sport: formData.sport,
      format: formData.format,
      overs: calculatedOvers,
      teams_count: formData.teams_count,
      is_auction_enabled: formData.is_auction_enabled,
      base_budget: formData.base_budget,
      start_date: formData.startDate || null,
      end_date: formData.endDate || null,
      sport_options
    };

    const res = await fetch('/api/tournaments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    navigate(`/admin/tournament/${data.id}`);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="mx-auto max-w-2xl px-6 py-12">
        <Link to="/admin" className="text-sm text-zinc-500 hover:text-white mb-8 inline-block">← Back to Dashboard</Link>
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight">Create Tournament</h1>
          <p className="text-sm text-zinc-400 mt-1">Configure sections, duration schedule, team modules, and customized match scoring limits</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Base Tournament Metadata */}
          <div className="p-6 rounded-2xl bg-zinc-900/30 border border-white/5 space-y-6">
            <h2 className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Base Information</h2>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Tournament Name</label>
              <input 
                required
                type="text" 
                placeholder="e.g. Summer Premier League 2026"
                className="w-full rounded-xl bg-zinc-900 border border-white/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-sm text-white"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Sport</label>
                <select 
                  className="w-full rounded-xl bg-zinc-900 border border-white/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-sm text-zinc-300"
                  value={formData.sport}
                  onChange={e => setFormData({...formData, sport: e.target.value})}
                >
                  <option value="soccer">⚽ Football (Soccer)</option>
                  <option value="cricket">🏏 Cricket</option>
                  <option value="badminton">🏸 Badminton</option>
                  <option value="tennis">🎾 Tennis</option>
                  <option value="basketball">🏀 Basketball</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Format</label>
                <select 
                  className="w-full rounded-xl bg-zinc-900 border border-white/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-sm text-zinc-300"
                  value={formData.format}
                  onChange={e => setFormData({...formData, format: e.target.value})}
                >
                  <option value="league">League Table</option>
                  <option value="knockout">Pure Knockout</option>
                  <option value="group_knockout">Groups + playoffs</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Target Team Count</label>
              <input 
                type="number" 
                min={2}
                max={64}
                className="w-full rounded-xl bg-zinc-900 border border-white/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-sm text-white"
                value={formData.teams_count || ''}
                onChange={e => setFormData({...formData, teams_count: parseInt(e.target.value) || 0})}
              />
            </div>

            {/* Tournament Duration (Date Picker) */}
            <div className="space-y-3 pt-3 border-t border-white/5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Tournament Duration</span>
                </label>
                {formData.startDate && formData.endDate && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {(() => {
                      const d1 = new Date(formData.startDate);
                      const d2 = new Date(formData.endDate);
                      const diffDays = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                      return diffDays > 0 ? `${diffDays} Day${diffDays > 1 ? 's' : ''} Event` : 'Dates Selected';
                    })()}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <span className="text-[11px] text-zinc-400 font-medium">Start Date</span>
                  <input
                    type="date"
                    className="w-full rounded-xl bg-zinc-900 border border-white/10 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-sm text-white"
                    value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <span className="text-[11px] text-zinc-400 font-medium">End Date</span>
                  <input
                    type="date"
                    min={formData.startDate || undefined}
                    className="w-full rounded-xl bg-zinc-900 border border-white/10 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-sm text-white"
                    value={formData.endDate}
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Module Selector Section */}
          <div className="p-6 rounded-2xl bg-zinc-900/30 border border-white/5 space-y-6">
            <div>
              <h2 className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Enable Feature Modules</h2>
              <p className="text-[10px] text-zinc-500 mt-1 font-medium">Select which dashboard tabs and features apply to this tournament</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'teams', label: 'Teams Management', desc: 'Roster approval & logs' },
                { key: 'matches', label: 'Matches & Fixtures', desc: 'Schedules & scoresheet' },
                { key: 'players', label: 'Players Database', desc: 'Individual cards' },
                { key: 'stats', label: 'Leaderboard & MVP', desc: 'Individual metrics' },
                { key: 'expenses', label: 'Expense Ledgers', desc: 'Accounting logs' },
                { key: 'sponsors', label: 'Sponsors & Banners', desc: 'Corporate display' },
                { key: 'chat', label: 'Team Chatrooms', desc: 'Encrypted group talk' },
                { key: 'rules', label: 'Rules & Bylaws', desc: 'Ground bylaws' },
                { key: 'gallery', label: 'Venue & Gallery', desc: 'Image captures' },
                { key: 'live_score_settings', label: 'Live Score Controls', desc: 'Scorers assignment' },
              ].map(item => {
                const isChecked = modules[item.key as keyof typeof modules];
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => toggleModule(item.key as keyof typeof modules)}
                    className={cn(
                      "p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between h-20 relative overflow-hidden group/mod",
                      isChecked 
                        ? "bg-emerald-500/10 border-emerald-500 text-white" 
                        : "bg-zinc-950/40 border-white/5 text-zinc-400 hover:bg-zinc-900 hover:border-white/10"
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-bold">{item.label}</span>
                      <div className={cn(
                        "h-3.5 w-3.5 rounded-full border flex items-center justify-center transition-all",
                        isChecked ? "border-emerald-500 bg-emerald-500" : "border-zinc-700 bg-transparent"
                      )}>
                        {isChecked && <Check className="h-2 w-2 text-black stroke-[4]" />}
                      </div>
                    </div>
                    <span className="text-[9px] text-zinc-500 leading-tight font-normal">{item.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sport Specific Configuration Card */}
          <div className="p-6 rounded-2xl bg-zinc-900/30 border border-white/5 space-y-6">
            <div>
              <h2 className="text-xs font-bold text-emerald-500 uppercase tracking-widest">
                {formData.sport === 'soccer' && "Soccer Specific Live Settings ⚽"}
                {formData.sport === 'cricket' && "Cricket Specific Live Settings 🏏"}
                {formData.sport === 'badminton' && "Badminton Specific Live Settings 🏸"}
                {formData.sport === 'tennis' && "Tennis Specific Live Settings 🎾"}
                {formData.sport === 'basketball' && "Basketball Specific Live Settings 🏀"}
              </h2>
              <p className="text-[10px] text-zinc-500 mt-1 font-medium">Fine-tune period clocks, penalty settings, and match metrics limits on the live scorer dashboard</p>
            </div>

            {/* Soccer Settings */}
            {formData.sport === 'soccer' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Half Duration (minutes)</label>
                    <span className="text-xs text-emerald-500 font-mono font-bold">{soccerRules.half_duration} mins</span>
                  </div>
                  <input 
                    type="range" 
                    min={5} 
                    max={60} 
                    step={1}
                    className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
                    value={soccerRules.half_duration}
                    onChange={e => setSoccerRules({...soccerRules, half_duration: parseInt(e.target.value)})}
                  />
                  <p className="text-[10px] text-zinc-500">Standard match will run for {soccerRules.half_duration * 2} minutes total plus allowance</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Max Roster Substitutions</label>
                    <span className="text-xs text-emerald-500 font-mono font-bold">{soccerRules.max_subs} per match</span>
                  </div>
                  <input 
                    type="range" 
                    min={0} 
                    max={11} 
                    step={1}
                    className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
                    value={soccerRules.max_subs}
                    onChange={e => setSoccerRules({...soccerRules, max_subs: parseInt(e.target.value)})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-black border border-white/5">
                    <div>
                      <h4 className="text-xs font-bold">Extra Time Play</h4>
                      <p className="text-[9px] text-zinc-500">Enable 2x15m extra periods if drawn</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setSoccerRules({...soccerRules, extra_time: !soccerRules.extra_time})}
                      className={cn(
                        "h-5 w-10 rounded-full transition-colors relative",
                        soccerRules.extra_time ? "bg-emerald-500" : "bg-zinc-700"
                      )}
                    >
                      <div className={cn(
                        "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform",
                        soccerRules.extra_time ? "translate-x-5" : "translate-x-0"
                      )} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-black border border-white/5">
                    <div>
                      <h4 className="text-xs font-bold">Monitor Offsides</h4>
                      <p className="text-[9px] text-zinc-500">Referees track and penalize offside positions</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setSoccerRules({...soccerRules, offside_active: !soccerRules.offside_active})}
                      className={cn(
                        "h-5 w-10 rounded-full transition-colors relative",
                        soccerRules.offside_active ? "bg-emerald-500" : "bg-zinc-700"
                      )}
                    >
                      <div className={cn(
                        "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform",
                        soccerRules.offside_active ? "translate-x-5" : "translate-x-0"
                      )} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Cricket Settings */}
            {formData.sport === 'cricket' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Overs per Inning</label>
                    <span className="text-xs text-emerald-500 font-mono font-bold">{cricketRules.overs} Overs</span>
                  </div>
                  <input 
                    type="range" 
                    min={1} 
                    max={50} 
                    step={1}
                    className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
                    value={cricketRules.overs}
                    onChange={e => setCricketRules({...cricketRules, overs: parseInt(e.target.value)})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Balls per Over</label>
                    <select 
                      className="w-full rounded-xl bg-black border border-white/10 px-3 py-2 text-xs text-zinc-300"
                      value={cricketRules.balls_per_over}
                      onChange={e => setCricketRules({...cricketRules, balls_per_over: parseInt(e.target.value)})}
                    >
                      <option value={6}>6 Balls (Standard)</option>
                      <option value={8}>8 Balls (Super Overs format)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Powerplay Overs</label>
                    <input 
                      type="number" 
                      min={0}
                      max={15}
                      className="w-full rounded-xl bg-black border border-white/10 px-3 py-2 text-xs text-white"
                      value={cricketRules.powerplay_overs}
                      onChange={e => setCricketRules({...cricketRules, powerplay_overs: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Badminton Settings */}
            {formData.sport === 'badminton' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Match Format</label>
                    <select 
                      className="w-full rounded-xl bg-black border border-white/10 px-3 py-2 text-xs text-zinc-300"
                      value={badmintonRules.match_format}
                      onChange={e => setBadmintonRules({...badmintonRules, match_format: e.target.value})}
                    >
                      <option value="best_of_3">Best of 3 Sets (Standard BWF)</option>
                      <option value="best_of_5">Best of 5 Sets (Finals/Pro)</option>
                      <option value="single_set">Single Set (Express Knockout)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Points per Set</label>
                    <select 
                      className="w-full rounded-xl bg-black border border-white/10 px-3 py-2 text-xs text-zinc-300"
                      value={badmintonRules.points_per_set}
                      onChange={e => setBadmintonRules({...badmintonRules, points_per_set: parseInt(e.target.value) || 21})}
                    >
                      <option value={21}>21 Points (Standard BWF)</option>
                      <option value={15}>15 Points (Fast-Paced)</option>
                      <option value={11}>11 Points (Sprint)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Deuce Golden Point Cap</label>
                    <select 
                      className="w-full rounded-xl bg-black border border-white/10 px-3 py-2 text-xs text-zinc-300"
                      value={badmintonRules.deuce_cap}
                      onChange={e => setBadmintonRules({...badmintonRules, deuce_cap: parseInt(e.target.value) || 30})}
                    >
                      <option value={30}>Max 30 Points (Standard BWF)</option>
                      <option value={25}>Max 25 Points</option>
                      <option value={0}>No Cap (Win by 2)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Shuttlecock Type</label>
                    <select 
                      className="w-full rounded-xl bg-black border border-white/10 px-3 py-2 text-xs text-zinc-300"
                      value={badmintonRules.shuttle_type}
                      onChange={e => setBadmintonRules({...badmintonRules, shuttle_type: e.target.value})}
                    >
                      <option value="feather">Feather Goose / Duck (Tournament grade)</option>
                      <option value="nylon_slow">Nylon / Plastic (Slow speed - Green)</option>
                      <option value="nylon_medium">Nylon / Plastic (Medium speed - Blue)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-black border border-white/5">
                  <div>
                    <h4 className="text-xs font-bold">60s Interval at 11 Points</h4>
                    <p className="text-[9px] text-zinc-500">Allows players coach consult and hydration break during sets</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setBadmintonRules({...badmintonRules, interval_rule: !badmintonRules.interval_rule})}
                    className={cn(
                      "h-5 w-10 rounded-full transition-colors relative",
                      badmintonRules.interval_rule ? "bg-emerald-500" : "bg-zinc-700"
                    )}
                  >
                    <div className={cn(
                      "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform",
                      badmintonRules.interval_rule ? "translate-x-5" : "translate-x-0"
                    )} />
                  </button>
                </div>
              </div>
            )}

            {/* Tennis Settings */}
            {formData.sport === 'tennis' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Match Format</label>
                    <select 
                      className="w-full rounded-xl bg-black border border-white/10 px-3 py-2 text-xs text-zinc-300"
                      value={tennisRules.match_format}
                      onChange={e => setTennisRules({...tennisRules, match_format: e.target.value})}
                    >
                      <option value="best_of_3">Best of 3 Sets (Standard ATP/WTA)</option>
                      <option value="best_of_5">Best of 5 Sets (Grand Slam format)</option>
                      <option value="pro_set">8-Game Pro Set</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Games per Set</label>
                    <select 
                      className="w-full rounded-xl bg-black border border-white/10 px-3 py-2 text-xs text-zinc-300"
                      value={tennisRules.games_per_set}
                      onChange={e => setTennisRules({...tennisRules, games_per_set: parseInt(e.target.value) || 6})}
                    >
                      <option value={6}>6 Games (Standard, tiebreak at 6-6)</option>
                      <option value={4}>4 Games (Fast4 Short Set)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Deuce Scoring Method</label>
                    <select 
                      className="w-full rounded-xl bg-black border border-white/10 px-3 py-2 text-xs text-zinc-300"
                      value={tennisRules.deuce_scoring}
                      onChange={e => setTennisRules({...tennisRules, deuce_scoring: e.target.value})}
                    >
                      <option value="advantage">Advantage Play (Traditional Ad/Deuce)</option>
                      <option value="no_ad">No-Ad Sudden Death (Receiver's Choice)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Court Surface</label>
                    <select 
                      className="w-full rounded-xl bg-black border border-white/10 px-3 py-2 text-xs text-zinc-300"
                      value={tennisRules.court_surface}
                      onChange={e => setTennisRules({...tennisRules, court_surface: e.target.value})}
                    >
                      <option value="hard">Hard Court (Acrylic)</option>
                      <option value="clay">Clay Court (Red Clay)</option>
                      <option value="grass">Lawn Grass Court</option>
                      <option value="synthetic">Synthetic / Carpet Turf</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Deciding Set Tie-Break</label>
                  <select 
                    className="w-full rounded-xl bg-black border border-white/10 px-3 py-2 text-xs text-zinc-300"
                    value={tennisRules.final_tiebreak}
                    onChange={e => setTennisRules({...tennisRules, final_tiebreak: e.target.value})}
                  >
                    <option value="super_tiebreak_10">10-Point Super Tiebreak (First to 10 by 2)</option>
                    <option value="standard_tiebreak_7">7-Point Standard Tiebreak (First to 7 by 2)</option>
                    <option value="advantage_set">Full Advantage Set (Win by 2 games)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Basketball Settings */}
            {formData.sport === 'basketball' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Quarter Duration (minutes)</label>
                    <span className="text-xs text-emerald-500 font-mono font-bold">{basketballRules.quarter_duration} mins</span>
                  </div>
                  <input 
                    type="range" 
                    min={2} 
                    max={20} 
                    step={1}
                    className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
                    value={basketballRules.quarter_duration}
                    onChange={e => setBasketballRules({...basketballRules, quarter_duration: parseInt(e.target.value)})}
                  />
                  <p className="text-[10px] text-zinc-500">Total game will scale to {basketballRules.quarter_duration * 4} minutes play-time</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Shot Clock Limit (seconds)</label>
                    <input 
                      type="number" 
                      min={10} 
                      max={45} 
                      className="w-full rounded-xl bg-black border border-white/10 px-3 py-2 text-xs text-white"
                      value={basketballRules.shot_clock}
                      onChange={e => setBasketballRules({...basketballRules, shot_clock: parseInt(e.target.value) || 24})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Personal Foul Out Limit</label>
                    <input 
                      type="number" 
                      min={3} 
                      max={8} 
                      className="w-full rounded-xl bg-black border border-white/10 px-3 py-2 text-xs text-white"
                      value={basketballRules.foul_out_limit}
                      onChange={e => setBasketballRules({...basketballRules, foul_out_limit: parseInt(e.target.value) || 5})}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Auction settings block */}
          <div className="p-6 rounded-2xl bg-zinc-900/30 border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Enable Player Auction</h3>
                <p className="text-[10px] text-zinc-500">Teams will bid for players using a virtual draft budget</p>
              </div>
              <button 
                type="button"
                onClick={() => setFormData({...formData, is_auction_enabled: !formData.is_auction_enabled})}
                className={cn(
                  "h-6 w-11 rounded-full transition-colors relative",
                  formData.is_auction_enabled ? "bg-emerald-500" : "bg-zinc-700"
                )}
              >
                <div className={cn(
                  "absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform",
                  formData.is_auction_enabled ? "translate-x-5" : "translate-x-0"
                )} />
              </button>
            </div>
            
            {formData.is_auction_enabled && (
              <div className="space-y-2 pt-2 border-t border-white/5">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Base Budget per Team</label>
                <input 
                  type="number" 
                  className="w-full rounded-xl bg-black border border-white/10 px-4 py-3 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm text-white"
                  value={formData.base_budget}
                  onChange={e => setFormData({...formData, base_budget: parseInt(e.target.value) || 0})}
                />
              </div>
            )}
          </div>

          <button type="submit" className="w-full rounded-xl bg-emerald-500 py-4 font-extrabold text-black uppercase tracking-wider hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 text-sm">
            Launch New Tournament
          </button>
        </form>
      </div>
    </div>
  );
};

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate('/admin');
    } else {
      setError('Invalid email or password');
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSuccess(true);
    setTimeout(() => {
      setShowForgotPassword(false);
      setForgotSuccess(false);
      setForgotEmail('');
    }, 3000);
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="w-full max-w-md p-8 rounded-3xl bg-zinc-900 border border-white/5 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">Reset Password</h1>
            <p className="text-zinc-500 text-sm mt-1">Enter your email to receive a reset link</p>
          </div>

          {forgotSuccess ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-emerald-500 text-sm text-center">
              Reset link sent! Please check your email.
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Email Address</label>
                <input 
                  required
                  type="email" 
                  placeholder="name@example.com"
                  className="w-full rounded-xl bg-black border border-white/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                />
              </div>
              <button type="submit" className="w-full rounded-xl bg-emerald-500 py-4 font-bold hover:bg-emerald-400 transition-all">
                Send Reset Link
              </button>
              <button 
                type="button" 
                onClick={() => setShowForgotPassword(false)}
                className="w-full text-sm text-zinc-500 hover:text-white transition-colors"
              >
                Back to Login
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md p-8 rounded-3xl bg-zinc-900 border border-white/5 shadow-2xl">
        <div className="text-center mb-8">
          <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
            <Trophy className="h-8 w-8 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold">Portal Login</h1>
          <p className="text-zinc-500 text-sm mt-1">Sign in to access your dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Email Address</label>
            <input 
              required
              type="email" 
              placeholder="name@example.com"
              className="w-full rounded-xl bg-black border border-white/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-zinc-400">Password</label>
              <button 
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors"
              >
                Forgot Password?
              </button>
            </div>
            <input 
              required
              type="password" 
              className="w-full rounded-xl bg-black border border-white/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button type="submit" className="w-full rounded-xl bg-emerald-500 py-4 font-bold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children, requirePro = false, requirePlan }: { children: React.ReactNode, requirePro?: boolean, requirePlan?: 'organizer' | 'pro' | 'any_admin' }) => {
  const { isUser, isAdmin, plan } = useAuth();
  if (!isUser) {
    return <LoginPage />;
  }

  if (isAdmin) {
    return <>{children}</>;
  }

  if (requirePlan) {
    if (requirePlan === 'pro' && plan !== 'pro') {
      return <PricingPage />;
    }
    if (requirePlan === 'organizer' && plan !== 'organizer') {
      return <PricingPage />;
    }
    if (requirePlan === 'any_admin' && plan !== 'organizer' && plan !== 'pro') {
      return <PricingPage />;
    }
  } else if (requirePro && plan !== 'pro') {
    return <PricingPage />;
  }
  return <>{children}</>;
};

const BookingDetailsPage = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  useEffect(() => {
    fetch(`/api/bookings/${id}`)
      .then(res => res.json())
      .then(data => {
        setBooking(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const updateStatus = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setBooking({ ...booking, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500">Loading booking details...</div>;
  if (!booking) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500">Booking not found</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="mx-auto max-w-5xl px-6 py-12">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors"
        >
          <ChevronRight className="h-4 w-4 rotate-180" /> Back to Bookings
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tighter">Booking <span className="text-emerald-500">#{booking.id.toString().padStart(5, '0')}</span></h1>
            <p className="text-zinc-500 mt-2">Requested on {new Date(booking.created_at).toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-4">
            <select 
              value={booking.status}
              onChange={(e) => updateStatus(e.target.value)}
              className={cn(
                "px-6 py-3 rounded-2xl font-bold uppercase tracking-widest bg-zinc-900 border border-white/10 focus:ring-2 focus:ring-emerald-500/50 cursor-pointer transition-all",
                booking.status === 'pending' ? "text-yellow-500" :
                booking.status === 'confirmed' ? "text-emerald-500" :
                "text-red-500"
              )}
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Ground Info */}
            <div className="p-8 rounded-3xl bg-zinc-900 border border-white/5">
              <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6">Venue Details</h3>
              <div className="flex gap-6">
                <div className="h-24 w-24 rounded-2xl bg-black overflow-hidden border border-white/10 flex-shrink-0">
                  {booking.ground_image ? (
                    <img src={booking.ground_image} alt={booking.ground_name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-zinc-800">
                      <MapPin className="h-10 w-10" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold">{booking.ground_name}</h4>
                  <p className="text-zinc-500 mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" /> {booking.ground_location}</p>
                  <div className="mt-4 flex items-center gap-6">
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Date</p>
                      <p className="font-bold">{booking.booking_date}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Time Slot</p>
                      <p className="font-bold">{formatTime(booking.start_time)} - {formatTime(booking.end_time)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="p-8 rounded-3xl bg-zinc-900 border border-white/5">
              <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6">Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Customer Name</p>
                    <p className="font-bold">{booking.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Email Address</p>
                    <p className="font-bold">{booking.customer_email}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Phone Number</p>
                  <p className="font-bold">{booking.customer_mobile}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Payment Info */}
            <div className="p-8 rounded-3xl bg-zinc-900 border border-white/5">
              <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6">Payment Details</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Method</span>
                  <div className="flex items-center gap-2 font-bold uppercase text-xs">
                    {booking.payment_method === 'upi' ? <Smartphone className="h-4 w-4 text-emerald-500" /> : <CreditCard className="h-4 w-4 text-emerald-500" />}
                    {booking.payment_method || 'UPI'}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Status</span>
                  <span className="text-emerald-500 font-bold uppercase text-xs">Paid</span>
                </div>
                {booking.payment_details && (
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">{booking.payment_method === 'upi' ? 'UPI ID' : 'Card Details'}</span>
                    <span className="font-mono text-[10px] text-zinc-400">{booking.payment_details}</span>
                  </div>
                )}
                <div className="pt-6 border-t border-white/5 flex items-center justify-between text-xl font-black">
                  <span>Total</span>
                  <span className="text-emerald-500">₹{booking.total_price}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const { isAdmin } = useAuth();
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsOfServicePage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/live" element={<LiveScoresPage />} />
        <Route path="/elearning" element={<ELearningPage />} />
        <Route path="/academy" element={<ELearningPage />} />
        <Route path="/shop" element={<ShopInterface />} />
        <Route path="/shop/product/:id" element={<ProductDetailsPage />} />
        <Route path="/grounds" element={<GroundBookingInterface />} />
        <Route path="/tournaments" element={<TournamentsPage />} />
        <Route path="/teams" element={<TeamsPage />} />
        <Route path="/players" element={<PlayersPage />} />
        <Route path="/tournament/:id" element={<PublicTournamentDetails />} />
        <Route path="/match/:matchId" element={<PublicMatchDetails />} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin" element={<ProtectedRoute requirePlan="any_admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/shop" element={<ProtectedRoute requirePlan="pro"><AdminShopInterface /></ProtectedRoute>} />
        <Route path="/admin/order/:id" element={<ProtectedRoute requirePlan="pro"><OrderDetailsPage /></ProtectedRoute>} />
        <Route path="/admin/grounds" element={<ProtectedRoute requirePlan="pro"><AdminGroundBookingInterface /></ProtectedRoute>} />
        <Route path="/admin/booking/:id" element={<ProtectedRoute requirePlan="pro"><BookingDetailsPage /></ProtectedRoute>} />
        <Route path="/admin/payment-settings" element={<ProtectedRoute requirePlan="any_admin"><AdminPaymentSettings /></ProtectedRoute>} />
        <Route path="/admin/analytics/:id" element={<ProtectedRoute requirePlan="organizer"><TournamentAnalytics /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute requirePro={false}><SettingsPage isAdmin={isAdmin} /></ProtectedRoute>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/create" element={<ProtectedRoute requirePlan="organizer"><CreateTournament /></ProtectedRoute>} />
        <Route path="/admin/tournament/:id" element={<ProtectedRoute requirePlan="organizer"><TournamentDetails /></ProtectedRoute>} />
        <Route path="/admin/score/:matchId" element={<ProtectedRoute requirePlan="organizer"><ScoringInterface /></ProtectedRoute>} />
        <Route path="/auction/join" element={<AuctionJoinPage />} />
        <Route path="/auction/invite/:code" element={<AuctionJoinPage />} />
        <Route path="/admin/auction/:id" element={<ProtectedRoute requirePlan="organizer"><AuctionInterface /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}
