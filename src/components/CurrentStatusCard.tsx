import React from 'react';
import { CheckCircle2, LogIn, Sparkles, UserCheck } from 'lucide-react';
import type { UserProgressState } from '../types/battlepass';
import { getLoginPointsForDay, getLoginTierInfoForDay } from '../utils/bpMath';

interface CurrentStatusCardProps {
  state: UserProgressState;
  onChange: (patch: Partial<UserProgressState>) => void;
  seasonTotalDays: number;
}

export const CurrentStatusCard: React.FC<CurrentStatusCardProps> = ({
  state,
  onChange,
  seasonTotalDays,
}) => {
  const currentLoginTier = getLoginTierInfoForDay(state.loginsSoFar || 1);
  const nextLoginPP = getLoginPointsForDay((state.loginsSoFar || 0) + 1);

  return (
    <div className="bg-wt-card border border-wt-border rounded-xl p-5 shadow-tactical">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-wt-border/70">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-500/10 text-wt-gold rounded-lg border border-wt-gold/20">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Current Status &amp; In-Game Baseline</span>
            </h2>
            <p className="text-xs text-slate-400">
              {state.mode === 'current'
                ? 'Your active War Thunder Battle Pass progress as of today'
                : 'Full Season baseline configuration starting from Day 1'}
            </p>
          </div>
        </div>
      </div>

      {/* Battle Pass Tier Selection */}
      <div className="mb-5">
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono">
          Battle Pass Ownership
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Free Pass */}
          <button
            type="button"
            onClick={() => onChange({ passType: 'free' })}
            className={`p-3 rounded-lg border text-left transition-all relative ${
              state.passType === 'free'
                ? 'bg-amber-500/10 border-wt-gold text-white shadow-glow-gold'
                : 'bg-wt-surface/60 border-wt-border hover:border-slate-500 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-sm">Free Pass</span>
              <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">0 GE</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Access to free vehicle (Lvl 51), warbonds, title. Paid vehicle (Lvl 75) locked.
            </p>
            {state.passType === 'free' && (
              <CheckCircle2 className="w-4 h-4 text-wt-gold absolute top-2 right-2" />
            )}
          </button>

          {/* Standard Pass */}
          <button
            type="button"
            onClick={() => onChange({ passType: 'standard' })}
            className={`p-3 rounded-lg border text-left transition-all relative ${
              state.passType === 'standard'
                ? 'bg-amber-500/10 border-wt-gold text-white shadow-glow-gold'
                : 'bg-wt-surface/60 border-wt-border hover:border-slate-500 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-sm">Standard Pass</span>
              <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                2,000 GE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Unlocks all paid milestones, main vehicle (Lvl 75), and market coupon upgrades.
            </p>
            {state.passType === 'standard' && (
              <CheckCircle2 className="w-4 h-4 text-wt-gold absolute top-2 right-2" />
            )}
          </button>

          {/* Improved Pass */}
          <button
            type="button"
            onClick={() => onChange({ passType: 'improved' })}
            className={`p-3 rounded-lg border text-left transition-all relative ${
              state.passType === 'improved'
                ? 'bg-amber-500/10 border-wt-gold text-white shadow-glow-gold ring-1 ring-amber-400'
                : 'bg-wt-surface/60 border-wt-border hover:border-slate-500 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-sm flex items-center gap-1 text-amber-300">
                <Sparkles className="w-3.5 h-3.5" /> Improved Pass
              </span>
              <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-amber-500 text-black font-bold">
                2,500 GE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Includes full pass access + immediate <strong className="text-amber-300">+15 Levels (+150 PP)</strong> head-start!
            </p>
            {state.passType === 'improved' && (
              <CheckCircle2 className="w-4 h-4 text-wt-gold absolute top-2 right-2" />
            )}
          </button>
        </div>

        {/* Improved Pass Bonus toggle for Mode A */}
        {state.mode === 'current' && state.passType === 'improved' && (
          <div className="mt-2.5 p-3 rounded-lg bg-amber-950/30 border border-amber-800/60 flex items-start gap-2.5">
            <input
              type="checkbox"
              id="improvedPassApplied"
              checked={state.improvedPassBonusApplied}
              onChange={(e) => onChange({ improvedPassBonusApplied: e.target.checked })}
              className="mt-0.5 h-4 w-4 rounded border-slate-700 text-amber-500 focus:ring-amber-500 cursor-pointer"
            />
            <label htmlFor="improvedPassApplied" className="text-xs text-slate-200 cursor-pointer">
              <span className="font-bold text-amber-300">
                The +15 levels (+150 PP) from Improved Pass are ALREADY counted in my current level.
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Check this if your in-game screen already shows the 15-level boost. Leave unchecked if you plan to buy the Improved Pass later.
              </p>
            </label>
          </div>
        )}
      </div>

      {/* Mode A: In-Game Level Inputs */}
      {state.mode === 'current' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Current BP Level Slider & Input */}
          <div className="bg-wt-surface/70 border border-wt-border rounded-lg p-3.5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                Current BP Level
              </label>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400">Lvl</span>
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={state.currentLevel}
                  onChange={(e) =>
                    onChange({
                      currentLevel: Math.max(0, Math.min(200, parseInt(e.target.value) || 0)),
                    })
                  }
                  className="w-16 bg-wt-card border border-wt-border focus:border-wt-gold text-right font-mono font-bold text-amber-400 px-2 py-1 rounded text-sm focus:outline-none"
                />
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="150"
              value={state.currentLevel}
              onChange={(e) => onChange({ currentLevel: parseInt(e.target.value) || 0 })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>Lvl 0</span>
              <span>Lvl 51 (Free)</span>
              <span>Lvl 75 (Main)</span>
              <span>Lvl 150 (Title)</span>
            </div>
          </div>

          {/* Leftover Points in Current Level (0 to 9 PP) */}
          <div className="bg-wt-surface/70 border border-wt-border rounded-lg p-3.5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1">
                <span>Points in Current Level</span>
                <span className="text-[10px] text-slate-400 font-normal lowercase">(0 - 9 PP)</span>
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="9"
                  value={state.pointsInCurrentLevel}
                  onChange={(e) =>
                    onChange({
                      pointsInCurrentLevel: Math.max(0, Math.min(9, parseInt(e.target.value) || 0)),
                    })
                  }
                  className="w-14 bg-wt-card border border-wt-border focus:border-wt-gold text-right font-mono font-bold text-amber-400 px-2 py-1 rounded text-sm focus:outline-none"
                />
                <span className="text-xs text-slate-400 font-mono">/ 10 PP</span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="9"
              value={state.pointsInCurrentLevel}
              onChange={(e) => onChange({ pointsInCurrentLevel: parseInt(e.target.value) || 0 })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="text-[10px] text-slate-400 mt-1">
              Total baseline progress:{' '}
              <span className="font-mono text-white font-semibold">
                {state.currentLevel * 10 + state.pointsInCurrentLevel} Progress Points
              </span>
            </div>
          </div>

          {/* Cumulative Logins So Far */}
          <div className="md:col-span-2 bg-wt-surface/70 border border-wt-border rounded-lg p-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <LogIn className="w-3.5 h-3.5 text-wt-gold" />
                  <span>Logins Completed So Far (Season Total)</span>
                </label>
                <p className="text-[11px] text-slate-400">
                  Missing a day does not reset your streak; points continue scaling progressively up to Tier 5.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-wt-card border border-wt-border text-wt-gold">
                  Day {state.loginsSoFar}: {nextLoginPP} PP/next login
                </span>
                <input
                  type="number"
                  min="0"
                  max={seasonTotalDays}
                  value={state.loginsSoFar}
                  onChange={(e) =>
                    onChange({
                      loginsSoFar: Math.max(0, Math.min(seasonTotalDays, parseInt(e.target.value) || 0)),
                    })
                  }
                  className="w-16 bg-wt-card border border-wt-border focus:border-wt-gold text-right font-mono font-bold text-amber-400 px-2 py-1 rounded text-sm focus:outline-none"
                />
              </div>
            </div>
            <input
              type="range"
              min="0"
              max={seasonTotalDays}
              value={state.loginsSoFar}
              onChange={(e) => onChange({ loginsSoFar: parseInt(e.target.value) || 0 })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mt-1">
              <span>Day 0</span>
              <span className="text-amber-400 font-semibold">
                Active: Tier {currentLoginTier.tier} ({currentLoginTier.pointsPerDay} PP/day, Days {currentLoginTier.minDay}-{currentLoginTier.maxDay})
              </span>
              <span>Day {seasonTotalDays} (Max 5 PP/day)</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-lg bg-wt-surface border border-wt-border text-xs text-slate-300">
          <p className="font-semibold text-amber-400 mb-1">
            Mode B: Full Season Simulator (From Day 1) Active
          </p>
          <p className="text-slate-400">
            You are simulating the entire 91-day Battle Pass from scratch. Adjust your planned daily logins, task consistency, challenges, and special tasks in the Planner below to calculate your full-season yield.
          </p>
        </div>
      )}
    </div>
  );
};
