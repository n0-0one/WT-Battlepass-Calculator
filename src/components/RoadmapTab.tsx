import React, { useState } from 'react';
import {
  Check,
  Lock,
  Sparkles,
} from 'lucide-react';
import type { SeasonData, UserProgressState } from '../types/battlepass';

interface RoadmapTabProps {
  season: SeasonData;
  state: UserProgressState;
  projectedLevel: number;
}

export const RoadmapTab: React.FC<RoadmapTabProps> = ({
  season,
  state,
  projectedLevel,
}) => {
  const [filter, setFilter] = useState<'all' | 'free' | 'vehicles' | 'upgrades'>('all');

  const currentLevel = state.mode === 'current' ? state.currentLevel : 0;

  const filteredMilestones = season.milestones.filter((m) => {
    if (filter === 'free') return m.isFree;
    if (filter === 'vehicles') return m.type === 'vehicle' || m.type === 'trophy';
    if (filter === 'upgrades') return m.type === 'upgrade';
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filters & Summary Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl bg-wt-card border border-wt-border">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Battle Pass Milestone &amp; Reward Roadmap</span>
            <span className="text-xs px-2 py-0.5 rounded bg-wt-surface border border-wt-border font-mono text-slate-300">
              Levels 1 - 150+
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Track unlocked rewards (Current Lvl {currentLevel}) vs your projected rewards (Projected Lvl {projectedLevel}).
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              filter === 'all'
                ? 'bg-amber-500 text-black font-bold shadow-sm'
                : 'bg-wt-surface text-slate-400 hover:text-white border border-wt-border'
            }`}
          >
            All Rewards
          </button>
          <button
            type="button"
            onClick={() => setFilter('free')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              filter === 'free'
                ? 'bg-amber-500 text-black font-bold shadow-sm'
                : 'bg-wt-surface text-slate-400 hover:text-white border border-wt-border'
            }`}
          >
            Free Only
          </button>
          <button
            type="button"
            onClick={() => setFilter('vehicles')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              filter === 'vehicles'
                ? 'bg-amber-500 text-black font-bold shadow-sm'
                : 'bg-wt-surface text-slate-400 hover:text-white border border-wt-border'
            }`}
          >
            Vehicles
          </button>
          <button
            type="button"
            onClick={() => setFilter('upgrades')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              filter === 'upgrades'
                ? 'bg-amber-500 text-black font-bold shadow-sm'
                : 'bg-wt-surface text-slate-400 hover:text-white border border-wt-border'
            }`}
          >
            Market Upgrades
          </button>
        </div>
      </div>

      {/* Milestones List */}
      <div className="space-y-2.5">
        {filteredMilestones.map((m) => {
          const isUnlocked = currentLevel >= m.level;
          const isProjected = !isUnlocked && projectedLevel >= m.level;

          // Paid pass lock check
          const isPaidLockedForUser = !m.isFree && state.passType === 'free';

          return (
            <div
              key={m.level}
              className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                isUnlocked
                  ? 'bg-emerald-950/20 border-emerald-800/60'
                  : isProjected
                  ? 'bg-amber-500/10 border-wt-gold/50 shadow-glow-gold'
                  : 'bg-wt-card border-wt-border opacity-70'
              }`}
            >
              {/* Left Details */}
              <div className="flex items-center gap-3.5">
                {/* Level Badge */}
                <div
                  className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center font-mono shrink-0 border ${
                    m.highlight
                      ? 'bg-amber-500/20 border-wt-gold text-amber-300 shadow-glow-gold'
                      : 'bg-wt-surface border-wt-border text-slate-300'
                  }`}
                >
                  <span className="text-[10px] text-slate-400 font-sans uppercase">Level</span>
                  <span className="text-sm font-extrabold">{m.level}</span>
                </div>

                {/* Reward info */}
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white text-sm">{m.name}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded uppercase font-semibold ${
                        m.isFree
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {m.isFree ? 'Free' : 'Paid Pass'}
                    </span>
                    {m.highlight && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500 text-black font-extrabold uppercase">
                        Major Milestone
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5 font-medium">{m.vehicleOrReward}</p>
                  {m.description && (
                    <p className="text-[11px] text-slate-400 mt-0.5">{m.description}</p>
                  )}
                </div>
              </div>

              {/* Status Badge */}
              <div className="text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                {isUnlocked ? (
                  <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-700">
                    <Check className="w-3.5 h-3.5" /> Already Unlocked
                  </span>
                ) : isProjected ? (
                  <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-amber-300 bg-amber-950/80 px-2.5 py-1 rounded border border-amber-700 shadow-glow-gold">
                    <Sparkles className="w-3.5 h-3.5" /> Projected to Unlock
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-mono text-slate-500 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                    <Lock className="w-3.5 h-3.5" /> Locked ({m.level - projectedLevel} lvls away)
                  </span>
                )}

                {isPaidLockedForUser && (
                  <span className="text-[10px] text-amber-400 font-medium mt-1">
                    Requires Standard/Improved Pass
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
