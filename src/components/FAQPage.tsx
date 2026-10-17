import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from '../App';
import { Footer } from './Footer';
import { 
  Trophy, 
  HelpCircle, 
  Plus, 
  Minus, 
  ArrowRight, 
  Search,
  CheckCircle,
  Clock,
  PlayCircle,
  CreditCard,
  Users
} from 'lucide-react';

const faqs = [
  {
    category: "General",
    icon: Trophy,
    items: [
      {
        question: "What is KYNTRIVO?",
        answer: "KYNTRIVO is an all-in-one sport technology suite engineered for sports organizers, team managers, ground owners, and fans. We provide direct live scoring sheets, auto-compiled stats pipelines, automated player auctions, custom ground booking matrices, and secure tournament finances in a single digital workspace."
      },
      {
        question: "Is there an offline backup mode for live scoring?",
        answer: "Yes. KYNTRIVO's live scoring score sheets automatically save state to local browser client memory. If cellular or venue Wi-Fi connectivity drops during match oversight, your active scorer actions will run offline and sync immediately back to the live public server the moment server networks restore."
      }
    ]
  },
  {
    category: "Tournaments & Auctions",
    icon: Users,
    items: [
      {
        question: "How do player auctions work on KYNTRIVO?",
        answer: "Our built-in Auction Interface supports both real-time live bidding and silent nomination pools. Tournaments can initialize customized bidding points budgets, upload registered player catalogs with specific custom base prices, and watch virtual bidders assign teams dynamically. Successful auction entries instantly move players onto respective team rosters."
      },
      {
        question: "Can we apply custom match rules and ground bylaws?",
        answer: "Yes, tournament details features a dedicated Rules tab where administrators can save customized local ground bylaws (e.g., dead ball mats, free hit line creases, player substitute rules) which display instantly to fans, captains, and scorers."
      }
    ]
  },
  {
    category: "Subscriptions & Billings",
    icon: CreditCard,
    items: [
      {
        question: "What are the limitations of the Starter plan?",
        answer: "The Starter plan is ideal for individual league setups, allowing up to 1 active tournament, basic paper scoresheet exports, and standard statistics. Upgrading to Business Pro enables unlimited simultaneous leagues, real-time WebSockets synchronization, our automated player auction systems, ground booking portals, and PDF scoresheet compilation."
      },
      {
        question: "Are payment integrations secure?",
        answer: "Absolutely. All user transaction processing, registrations, and payment requests operate through verified server-side proxies linked with industry-standard payment processors. We never store raw credit card numbers or banking secrets."
      }
    ]
  }
];

export const FAQPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggleAccordion = (catIndex: number, itemIndex: number) => {
    const key = `${catIndex}-${itemIndex}`;
    setOpenIndex(openIndex === key ? null : key);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      {/* Hero Header */}
      <section className="relative pt-32 pb-20 overflow-hidden border-b border-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
          <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-emerald-500/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-10 left-1/4 w-[400px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full" />
        </div>

        <div className="mx-auto max-w-4xl px-6 text-center relative z-10 space-y-6">
          <p className="text-emerald-500 text-xs font-black uppercase tracking-[0.4em]">Help & Knowledge</p>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.9]">
            Frequently Asked <span className="text-zinc-800">Questions</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Everything you need to know about live scoring, match officiating, automated auctions, and team management setup on KYNTRIVO.
          </p>

          <div className="max-w-md mx-auto pt-4 relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-zinc-500" />
            </div>
            <input 
              type="text"
              placeholder="Search help topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/50 border border-white/5 focus:border-emerald-500/50 text-xs px-11 py-3.5 rounded-2xl text-white outline-none transition-all placeholder:text-zinc-600 font-medium"
            />
          </div>
        </div>
      </section>

      {/* FAQ Accordions */}
      <section className="py-24 max-w-4xl mx-auto px-6 space-y-16">
        {faqs.map((cat, catIdx) => {
          // Filter items based on searchQuery
          const filteredItems = cat.items.filter(item => 
            item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
            item.answer.toLowerCase().includes(searchQuery.toLowerCase())
          );

          if (filteredItems.length === 0) return null;

          const CatIcon = cat.icon;

          return (
            <div key={cat.category} className="space-y-6">
              <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                <div className="p-2 rounded-xl bg-zinc-900 text-emerald-500">
                  <CatIcon className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400">{cat.category}</h2>
              </div>

              <div className="space-y-3">
                {filteredItems.map((item, itemIdx) => {
                  const itemKey = `${catIdx}-${itemIdx}`;
                  const isOpen = openIndex === itemKey;

                  return (
                    <div 
                      key={itemKey} 
                      className={`rounded-2xl transition-all duration-300 border ${
                        isOpen 
                          ? 'bg-zinc-900 border-white/10 shadow-lg shadow-emerald-500/[0.02]' 
                          : 'bg-zinc-950/40 border-white/[0.03] hover:border-white/5'
                      }`}
                    >
                      <button
                        onClick={() => toggleAccordion(catIdx, itemIdx)}
                        className="w-full text-left p-6 flex justify-between items-center gap-4 cursor-pointer"
                      >
                        <span className="font-extrabold text-sm md:text-base text-zinc-100 hover:text-white transition-colors">
                          {item.question}
                        </span>
                        <div className={`p-1.5 rounded-lg border transition-all ${
                          isOpen ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-black border-white/5 text-zinc-500'
                        }`}>
                          {isOpen ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                        </div>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-6 pt-1 text-xs md:text-sm text-zinc-400 leading-relaxed border-t border-white/[0.04]">
                              {item.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      {/* Dynamic help request banner */}
      <section className="pb-32 px-6">
        <div className="max-w-4xl mx-auto p-12 rounded-[32px] bg-zinc-900 border border-white/5 text-center space-y-6 relative overflow-hidden">
          <div className="absolute -right-24 -bottom-24 w-60 h-60 bg-emerald-500/10 blur-3xl rounded-full" />
          <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight">Still have queries or custom rule requests?</h3>
          <p className="text-xs md:text-sm text-zinc-400 max-w-lg mx-auto">
            Our sporting support squads are standing by around the clock. Connect directly via our secure support portal for speed resolutions.
          </p>
          <div className="pt-2">
            <a 
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-black text-xs font-black uppercase tracking-widest hover:bg-emerald-400 transition-all cursor-pointer"
            >
              Get in touch <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
