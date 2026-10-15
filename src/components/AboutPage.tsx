import React from 'react';
import { motion } from 'motion/react';
import { Navbar } from '../App';
import { Footer } from './Footer';
import { 
  Trophy, 
  Target, 
  Users, 
  ShieldCheck, 
  Rocket, 
  Zap,
  ChevronRight
} from 'lucide-react';

export const AboutPage = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full" />
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <p className="text-emerald-500 text-xs font-black uppercase tracking-[0.4em] mb-6">Our Mission</p>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
              Revolutionizing the <span className="text-zinc-800">Spirit</span> of Cricket.
            </h1>
            <p className="text-zinc-400 text-xl leading-relaxed">
              We started with a simple belief: every match, from local leagues to professional stadiums, deserves world-class digital technology. KYNTRIVO is built by athletes, for sports organizers and players.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="py-24 border-y border-white/5 bg-zinc-900/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="p-8 rounded-3xl bg-black border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Target className="h-24 w-24" />
              </div>
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-8">
                <Target className="h-6 w-6 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter">Precision</h3>
              <p className="text-zinc-500 leading-relaxed text-sm">
                Our real-time scoring engine ensures every ball, ogni run, and every wicket is recorded with absolute accuracy. Technology that keeps up with the pace of the game.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-black border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Users className="h-24 w-24" />
              </div>
              <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-8">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter">Community</h3>
              <p className="text-zinc-500 leading-relaxed text-sm">
                Cricket is more than just a sport; it's a culture. We provide tools that bring players, organizers, and fans closer together in one unified ecosystem.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-black border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <ShieldCheck className="h-24 w-24" />
              </div>
              <div className="h-12 w-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-8">
                <ShieldCheck className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter">Integrity</h3>
              <p className="text-zinc-500 leading-relaxed text-sm">
                Fair play is at our core. From transparent auction systems to verified player stats, we build trust into every interaction on our platform.
              </p>
            </div>
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="p-16 rounded-[48px] bg-[#353A96] border border-[#F3F298]/30 relative overflow-hidden text-white text-center shadow-2xl shadow-[#353A96]/30">
            <div className="absolute top-0 right-0 -mr-24 -mt-24 w-[400px] h-[400px] bg-[#F3F298]/15 blur-[80px] rounded-full" />
            <div className="relative z-10 max-w-2xl mx-auto">
              <Zap className="h-12 w-12 mx-auto mb-8 text-[#F3F298] animate-bounce" />
              <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-8 leading-none uppercase">Ready to host your next tournament?</h2>
              <p className="text-zinc-200 text-lg font-bold mb-8">
                Join thousands of organizers already using KYNTRIVO to elevate their league experience.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button className="px-12 py-5 rounded-2xl bg-[#F3F298] text-[#181a4b] font-black text-sm uppercase tracking-widest hover:scale-105 transition-transform shadow-xl shadow-[#F3F298]/20">
                   Get Started Now
                </button>
                <button className="px-12 py-5 rounded-2xl bg-white/10 text-white font-black text-sm uppercase tracking-widest hover:bg-white/20 border border-white/10 transition-all flex items-center gap-2">
                   Contact Sales <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
