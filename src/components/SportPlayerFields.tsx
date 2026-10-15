import React from 'react';
import { getSportConfig, parseSportDetails } from '../lib/sportConfigs';

interface SportPlayerFieldsProps {
  sport: string;
  role: string;
  onRoleChange: (newRole: string) => void;
  sportDetails: Record<string, any> | string | undefined;
  onDetailsChange: (newDetails: Record<string, any>) => void;
  compact?: boolean;
}

export const SportPlayerFields: React.FC<SportPlayerFieldsProps> = ({
  sport,
  role,
  onRoleChange,
  sportDetails,
  onDetailsChange,
  compact = false,
}) => {
  const sportConfig = getSportConfig(sport);
  const details = parseSportDetails(sportDetails);

  const handleFieldChange = (key: string, value: any) => {
    onDetailsChange({
      ...details,
      [key]: value,
    });
  };

  return (
    <div className="space-y-4 pt-1">
      {/* Sport Role Selection */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
          <span>{sportConfig.icon}</span>
          <span>{sportConfig.name} Role / Discipline</span>
        </label>
        <select
          value={role}
          onChange={(e) => onRoleChange(e.target.value)}
          className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium"
        >
          {sportConfig.roles.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      {/* Dynamic Sport Attributes Grid */}
      <div className="rounded-2xl bg-zinc-950/60 border border-white/5 p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-base">{sportConfig.icon}</span>
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-widest">
              {sportConfig.name} Profile Details
            </span>
          </div>
          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${sportConfig.badgeClass}`}>
            Live Auction Specs
          </span>
        </div>

        <div className={`grid ${compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'} gap-3`}>
          {sportConfig.attributes.map((attr) => {
            const currentValue = details[attr.key] !== undefined ? details[attr.key] : attr.defaultValue;

            if (attr.type === 'select') {
              return (
                <div key={attr.key} className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    {attr.label}
                  </label>
                  <select
                    value={currentValue || ''}
                    onChange={(e) => handleFieldChange(attr.key, e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                  >
                    {attr.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              );
            }

            return (
              <div key={attr.key} className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    {attr.label}
                  </label>
                  {attr.unit && (
                    <span className="text-[9px] text-zinc-500 font-mono font-bold">
                      {attr.unit}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={attr.type}
                    placeholder={attr.placeholder || ''}
                    value={currentValue !== undefined ? currentValue : ''}
                    onChange={(e) =>
                      handleFieldChange(
                        attr.key,
                        attr.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value
                      )
                    }
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                  />
                  {attr.unit && (
                    <span className="absolute right-3 top-2 text-[10px] text-zinc-500 pointer-events-none">
                      {attr.unit}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
