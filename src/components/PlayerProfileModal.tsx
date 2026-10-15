import React from 'react';
import { X, User, Phone, Trophy, DollarSign, Award } from 'lucide-react';
import { Player } from '../types';
import { getSportConfig, parseSportDetails } from '../lib/sportConfigs';

interface PlayerProfileModalProps {
  player: Player | null;
  onClose: () => void;
  tournamentName?: string;
}

export const PlayerProfileModal: React.FC<PlayerProfileModalProps> = ({
  player,
  onClose,
  tournamentName,
}) => {
  if (!player) return null;

  const sportConfig = getSportConfig(player.sport);
  const details = parseSportDetails(player.sport_details);
  const roleConfig = sportConfig.roles.find(
    (r) => r.value.toLowerCase() === (player.role || '').toLowerCase()
  );
  const roleLabel = roleConfig ? roleConfig.label : (player.role || '').replace(/_/g, ' ');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg rounded-3xl bg-zinc-900 border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className={`p-6 pb-4 bg-gradient-to-r ${sportConfig.bgGradient} border-b border-white/5 relative`}>
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-black/40 hover:bg-black/60 text-zinc-400 hover:text-white transition-all"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">{sportConfig.icon}</span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${sportConfig.badgeClass}`}>
              {sportConfig.name} Athlete Profile
            </span>
            {tournamentName && (
              <span className="text-xs text-zinc-400 font-medium truncate max-w-[180px]">
                • {tournamentName}
              </span>
            )}
          </div>

          <div className="flex items-start gap-4">
            <div className="h-20 w-20 rounded-2xl bg-zinc-800 border-2 border-white/10 overflow-hidden shrink-0 flex items-center justify-center shadow-lg">
              {player.image_url ? (
                <img
                  src={player.image_url}
                  alt={player.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-10 w-10 text-zinc-600" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-black tracking-tight text-white truncate">
                {player.name}
              </h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="px-2 py-0.5 rounded-lg bg-zinc-800/80 text-xs font-bold text-zinc-200 uppercase tracking-wider">
                  {roleLabel}
                </span>
                <span className="text-xs text-zinc-400">Age: {player.age || 'N/A'}</span>
              </div>
              {player.phone && (
                <div className="flex items-center gap-1.5 mt-2 text-xs text-zinc-400 font-mono">
                  <Phone className="h-3 w-3 text-emerald-400" />
                  <span>{player.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Auction & Team Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">
                Draft / Auction Status
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    player.is_sold ? 'bg-emerald-500' : 'bg-amber-400'
                  }`}
                />
                <span className="text-sm font-bold text-white">
                  {player.is_sold ? 'Sold in Auction' : 'Available in Pool'}
                </span>
              </div>
              {player.team_name && (
                <p className="text-xs text-zinc-400 mt-1">Squad: {player.team_name}</p>
              )}
            </div>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">
                Valuation / Price
              </span>
              <p className="text-lg font-black text-emerald-400">
                ₹{((player.sold_price || player.base_price) || 0).toLocaleString()}
              </p>
              <p className="text-[10px] text-zinc-500">
                {player.sold_price ? 'Final Sold Price' : 'Reserve Base Price'}
              </p>
            </div>
          </div>

          {/* Sport-Specific Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-white/5">
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5 text-emerald-400" />
                <span>{sportConfig.name} Performance & Gear Specs</span>
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {sportConfig.attributes.map((attr) => {
                const val = details[attr.key] !== undefined ? details[attr.key] : attr.defaultValue;
                if (val === undefined || val === '') return null;

                return (
                  <div
                    key={attr.key}
                    className="p-3 rounded-xl bg-zinc-950/60 border border-white/5 flex flex-col justify-between"
                  >
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                      {attr.label}
                    </span>
                    <span className="text-xs font-bold text-white mt-1 break-words">
                      {val} {attr.unit ? <span className="text-zinc-400 font-normal">{attr.unit}</span> : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-950 border-t border-white/5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white transition-all"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
