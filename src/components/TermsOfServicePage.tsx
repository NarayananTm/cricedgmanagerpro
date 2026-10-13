import React from 'react';
import { Navbar } from '../App';
import { Footer } from './Footer';
import { Scale, FileSpreadsheet, ShieldAlert, AlertTriangle, HelpCircle } from 'lucide-react';

export const TermsOfServicePage = () => {
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
          <p className="text-emerald-500 text-xs font-black uppercase tracking-[0.4em]">User Agreement</p>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.9]">
            Terms of <span className="text-zinc-800">Service</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Last Updated: May 26, 2026. These terms govern your active use of GameZM's software, tournament tools, and booking features.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-24 max-w-4xl mx-auto px-6">
        <div className="space-y-12 leading-relaxed text-zinc-300">
          
          <div className="p-8 rounded-3xl bg-zinc-950 border border-white/[0.04] flex gap-6 items-start">
            <Scale className="h-8 w-8 text-emerald-500 shrink-0 mt-1" />
            <div className="space-y-2">
              <h3 className="text-lg font-black uppercase text-white">Agreement Terms</h3>
              <p className="text-xs text-zinc-500">
                By registering an account, creating matches, booking grounds, participating in auctions, or scoring on GameZM, you acknowledge you have read, grasped, and consent to stand governed by these active platform bylaws.
              </p>
            </div>
          </div>

          {/* Section 1 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black px-2.5 py-1 rounded bg-zinc-900 border border-white/5 text-emerald-500 font-mono">01</span>
              <h2 className="text-lg font-black text-white uppercase">Acceptable Platform Conduct</h2>
            </div>
            <p className="text-sm text-zinc-400">
              GameZM strives to support high-integrity sportsmanship. As an account-holding user, scorer, or tournament administrator, you agree:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs md:text-sm text-zinc-500">
              <li>You will not insert false, fraudulent, or artificial statistics to manipulate player rankings or ratings records.</li>
              <li>You will not interfere with active live feeds, or trigger malicious requests to skew real-time WebSockets feeds.</li>
              <li>You will respect local ground bylaws, officiating rulesheets, and match coordinators at all physical tournament settings.</li>
              <li>You will keep all security authentication keys and password credentials confidential.</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black px-2.5 py-1 rounded bg-zinc-900 border border-white/5 text-emerald-500 font-mono">02</span>
              <h2 className="text-lg font-black text-white uppercase">Ground Bookings & Fee Liabilities</h2>
            </div>
            <p className="text-sm text-zinc-400">
              When booking cricket grounds through our Ground Booking Interface:
            </p>
            <p className="text-xs md:text-sm text-zinc-500">
              All slots are assigned dynamically on a live reservation grid. Unpaid bookings may be automatically discarded if they violate local stadium window deadlines. GameZM is not liable for match delays triggerable by weather interruptions, synthetic mat failures, or light towers. Cancellations and refunds must follow individual stadium facility policies.
            </p>
          </div>

          {/* Section 3 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black px-2.5 py-1 rounded bg-zinc-900 border border-white/5 text-emerald-500 font-mono">03</span>
              <h2 className="text-lg font-black text-white uppercase">Player Auctions & Financial Integrity</h2>
            </div>
            <p className="text-sm text-zinc-400">
              The GameZM Auction Interface provides a programmatic ledger to facilitate budget-drafting points:
            </p>
            <p className="text-xs md:text-sm text-zinc-500">
              Auction points represent fictional drafting currency designed solely to maintain league fair-play limits. Bidding and points allocations do not represent raw legal tender unless expressly structured as official registration entry pools managed independently of this platform by local board members.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black px-2.5 py-1 rounded bg-zinc-900 border border-white/5 text-emerald-500 font-mono">04</span>
              <h2 className="text-lg font-black text-white uppercase">Disclaimers & Limits of Liability</h2>
            </div>
            <p className="text-sm text-zinc-400">
              GameZM's services are rendered on an "as-is" and "as-available" basis, without additional warranties of any kind:
            </p>
            <div className="p-6 rounded-2xl bg-zinc-900 border border-white/5 flex gap-4">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-1" />
              <div className="text-xs space-y-1">
                <p className="font-extrabold text-white">Physical Injury & Liability Disclaimer</p>
                <p className="text-zinc-400 leading-relaxed">
                  GameZM is purely a software coordinator utility. We carry zero liability for injuries, physical game mishaps, player disputes, scheduling conflicts, weather damages, or financial loss that occur inside physical stadiums, cricket nets, or partner turf matches.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
};
