import React from 'react';
import { Navbar } from '../App';
import { Footer } from './Footer';
import { FileText, Shield, Eye, Lock, Globe, Mail } from 'lucide-react';

export const PrivacyPolicyPage = () => {
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
          <p className="text-emerald-500 text-xs font-black uppercase tracking-[0.4em]">Official Statutes</p>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.9]">
            Privacy <span className="text-zinc-800">Policy</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Last Updated: May 26, 2026. Please read this statement carefully to understand our secure data practices.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-24 max-w-4xl mx-auto px-6">
        <div className="space-y-12 leading-relaxed text-zinc-300">
          
          <div className="p-8 rounded-3xl bg-zinc-950 border border-white/[0.04] flex gap-6 items-start">
            <Shield className="h-8 w-8 text-emerald-500 shrink-0 mt-1" />
            <div className="space-y-2">
              <h3 className="text-lg font-black uppercase text-white">Our Privacy Guarantee</h3>
              <p className="text-xs text-zinc-500">
                At KYNTRIVO, we respect your privacy on and off the field. We do not sell player details or transaction ledger entries to data brokers or third party advertisers. All records are guarded strictly for tournament configuration and local gameplay optimization.
              </p>
            </div>
          </div>

          {/* Section 1 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black px-2.5 py-1 rounded bg-zinc-900 border border-white/5 text-emerald-500 font-mono">01</span>
              <h2 className="text-lg font-black text-white uppercase">Information We Collect</h2>
            </div>
            <p className="text-sm text-zinc-400">
              When configuring standard tournament registries, the KYNTRIVO web framework gathers active entries supplied during accounts setup, team enrollments, score sheet officiating, or shop interface bookings:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs md:text-sm text-zinc-500">
              <li><strong>Roster Information:</strong> Player names, profile snapshots, specializations (e.g. bowler, batsman), and statistics history.</li>
              <li><strong>Transaction Records:</strong> Shop merchandise orders, premium Pro subscriptions, and ground bookings.</li>
              <li><strong>Scoring Session History:</strong> Complete ball-by-ball actions, run entries, extras, wickets, and live-match audio descriptors.</li>
              <li><strong>Technical Metadata:</strong> IP addresses, browser profiles, local storage caches, and connection states.</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black px-2.5 py-1 rounded bg-zinc-900 border border-white/5 text-emerald-500 font-mono">02</span>
              <h2 className="text-lg font-black text-white uppercase">How We Use Information</h2>
            </div>
            <p className="text-sm text-zinc-400">
              Data collected by KYNTRIVO is processed exclusively to deliver high-quality, precise interactive sports services:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs md:text-sm text-zinc-500">
              <li>To broadcast live match scoresheets and MVP metrics to users on active shared dashboards.</li>
              <li>To verify ground bookings, coordinate venue availability schedules, and validate security reservations.</li>
              <li>To compile historical tournament standings, compute player auction values, and perform sports insights generation.</li>
              <li>To safeguard against fraudulent tournament scoring attempts, unsanctified bookings, or rogue administrative access.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black px-2.5 py-1 rounded bg-zinc-900 border border-white/5 text-emerald-500 font-mono">03</span>
              <h2 className="text-lg font-black text-white uppercase">Data Safety & Storage</h2>
            </div>
            <p className="text-sm text-zinc-400">
              KYNTRIVO leverages high-grade security tools and multi-tier databases to safeguard platform secrets:
            </p>
            <p className="text-sm text-zinc-500">
              All credentials are encrypted end-to-end at rest. We never store credit card or payment PINs directly on KYNTRIVO databases. Session cookies and local storage tokens are stored with high security to prevent session hijacking.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black px-2.5 py-1 rounded bg-zinc-900 border border-white/5 text-emerald-500 font-mono">04</span>
              <h2 className="text-lg font-black text-white uppercase">Your Rights & Control</h2>
            </div>
            <p className="text-sm text-zinc-400">
              You maintain full authority over your registered platform data. You may modify account details or opt to permanently dismantle player profiles by writing directly to our compliance desk:
            </p>
            <div className="p-6 rounded-2xl bg-zinc-900 border border-white/5 flex gap-4 max-w-md">
              <Mail className="h-5 w-5 text-emerald-500 shrink-0 mt-1" />
              <div className="text-xs space-y-1">
                <p className="font-extrabold text-white">Compliance Request Office</p>
                <p className="text-zinc-400">privacy@gamezm.com</p>
                <p className="text-zinc-600">Please supply verified registration email credentials with any content tear down requests.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
};
