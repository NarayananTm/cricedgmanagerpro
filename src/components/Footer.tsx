import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Trophy, 
  Mail, 
  MapPin, 
  Phone, 
  Twitter, 
  Instagram, 
  Facebook, 
  ChevronRight 
} from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-black border-t border-white/5 pt-24 pb-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-24">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-8 group">
              <div className="h-10 w-10 rounded-xl bg-[#353A96] border border-[#F3F298]/30 flex items-center justify-center text-[#F3F298] group-hover:rotate-12 transition-transform duration-500 shadow-md shadow-[#353A96]/40">
                <Trophy className="h-5 w-5" />
              </div>
              <span className="text-2xl font-black tracking-wider uppercase text-white">KYNT<span className="text-[#F3F298]">RIVO</span></span>
            </Link>
            <p className="text-zinc-500 text-sm leading-relaxed mb-8 max-w-xs">
              The ultimate platform for sports tournament management, live scoring, and ground bookings. Elevating the game for enthusiasts and professionals alike.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="h-10 w-10 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center hover:bg-emerald-500 hover:text-black transition-all">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center hover:bg-emerald-500 hover:text-black transition-all">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center hover:bg-emerald-500 hover:text-black transition-all">
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-black text-emerald-500 uppercase tracking-[0.2em] mb-8">Navigation</h4>
            <ul className="space-y-4">
              {[
                { name: 'Home', path: '/' },
                { name: 'Tournaments', path: '/tournaments' },
                { name: 'E-Learning Academy', path: '/elearning' },
                { name: 'Grounds', path: '/grounds' },
                { name: 'Shop', path: '/shop' },
                { name: 'About', path: '/about' },
              ].map((item) => (
                <li key={item.name}>
                  <Link 
                    to={item.path} 
                    className="text-zinc-500 hover:text-white transition-colors text-sm flex items-center gap-2 group"
                  >
                    <ChevronRight className="h-3 w-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-emerald-500" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs font-black text-emerald-500 uppercase tracking-[0.2em] mb-8">Support</h4>
            <ul className="space-y-4">
              {[
                { name: 'FAQ', path: '/faq' },
                { name: 'Contact Us', path: '/contact' },
                { name: 'Privacy Policy', path: '/privacy' },
                { name: 'Terms of Service', path: '/terms' },
              ].map((item) => (
                <li key={item.name}>
                  <Link 
                    to={item.path} 
                    className="text-zinc-500 hover:text-white transition-colors text-sm flex items-center gap-2 group"
                  >
                    <ChevronRight className="h-3 w-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-emerald-500" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-black text-emerald-500 uppercase tracking-[0.2em] mb-8">Contact Info</h4>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="h-10 w-10 rounded-xl bg-zinc-900 flex-shrink-0 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Our Location</p>
                  <p className="text-sm text-zinc-300">123 Cricket Stadium Road, Sports City, IN 560002</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="h-10 w-10 rounded-xl bg-zinc-900 flex-shrink-0 flex items-center justify-center">
                  <Mail className="h-4 w-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Email Us</p>
                  <p className="text-sm text-zinc-300">support@kyntrivo.com</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="h-10 w-10 rounded-xl bg-zinc-900 flex-shrink-0 flex items-center justify-center">
                  <Phone className="h-4 w-4 text-[#F3F298]" />
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Call Us</p>
                  <p className="text-sm text-zinc-300">+91 (800) KYN-TRIVO</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-zinc-600 text-[10px] uppercase font-bold tracking-[0.2em]">
            © {new Date().getFullYear()} KYNTRIVO. All rights reserved.
          </p>
          <div className="flex items-center gap-8 text-zinc-600 text-[10px] uppercase font-bold tracking-[0.2em]">
            <Link to="#" className="hover:text-emerald-500 transition-colors">Cookies</Link>
            <Link to="#" className="hover:text-emerald-500 transition-colors">Accessibility</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
