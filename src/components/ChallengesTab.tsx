import React from 'react';
import {
  Calendar,
  CheckCircle2,
  Trophy,
} from 'lucide-react';
import type { SeasonChallenge, SeasonData, UserProgressState } from '../types/battlepass';
import { TOTAL_CHALLENGES_COUNT } from '../utils/bpMath';
import { formatDateRange } from '../utils/formatters';

interface ChallengesTabProps {
  season: SeasonData;
  state: UserProgressState;
  onToggleChallenge: (challengeId: number) => void;
  onCheckAllActive: () => void;
  onClearAll: () => void;
}

export const ChallengesTab: React.FC<ChallengesTabProps> = ({
  season,
  state,
  onToggleChallenge,
  onCheckAllActive,
  onClearAll,
}) => {
  const now = new Date();
  const completedCount = state.completedChallengeIds.length;
  const isMasterBonusActive = completedCount === TOTAL_CHALLENGES_COUNT;

  const getChallengeStatus = (c: SeasonChallenge) => {
    const unlockTime = new Date(c.unlockDate).getTime();
    const endTime = new Date(c.endDate).getTime();
    const currentTime = now.getTime();

    // Check level gate if applicable
    if (c.type === 'level' && c.levelRequirement) {
      if (state.currentLevel < c.levelRequirement) {
        return {
          status: 'level_locked',
          label: `Level Locked (Req. Lvl ${c.levelRequirement})`,
          badgeClass: 'bg-rose-950/70 text-rose-300 border-rose-800',
        };
      }
    }

    if (currentTime < unlockTime) {
      const daysUntil = Math.ceil((unlockTime - currentTime) / (1000 * 60 * 60 * 24));
      return {
        status: 'upcoming',
        label: `Upcoming (In ${daysUntil}d)`,
        badgeClass: 'bg-slate-800 text-slate-300 border-slate-700',
      };
    }

    if (currentTime > endTime) {
      return {
        status: 'expired',
        label: 'Expired',
        badgeClass: 'bg-slate-900 text-slate-500 border-slate-800',
      };
    }

    const daysLeft = Math.ceil((endTime - currentTime) / (1000 * 60 * 60 * 24));
    return {
      status: 'active',
      label: `Active Now (${daysLeft}d left)`,
      badgeClass: 'bg-emerald-950/70 text-emerald-300 border-emerald-700 shadow-glow-emerald',
    };
  };

  return (
    <div className="space-y-4">
      {/* Tracker Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl bg-wt-card border border-wt-border">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white">Season XXV Challenges Interactive Tracker</h3>
            <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-semibold">
              30 PP Each
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            11 Weekly Challenges + 3 Level-Gated Challenges. Complete all 14 for an automatic +45 PP bonus (46.5 Levels total).
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCheckAllActive}
            className="px-3 py-1.5 rounded-lg bg-wt-surface hover:bg-slate-700 border border-wt-border text-xs font-medium text-slate-200 transition-colors"
          >
            Check All Currently Active
          </button>
          <button
            type="button"
            onClick={onClearAll}
            className="px-3 py-1.5 rounded-lg bg-wt-surface hover:bg-rose-950/40 border border-wt-border hover:border-rose-800 text-xs font-medium text-slate-400 hover:text-rose-300 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Master 15th Challenge Banner */}
      <div
        className={`p-4 rounded-xl border transition-all ${
          isMasterBonusActive
            ? 'bg-gradient-to-r from-amber-500/20 via-wt-surface to-amber-700/20 border-wt-gold shadow-glow-gold'
            : 'bg-wt-surface/60 border-wt-border'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-lg ${
                isMasterBonusActive
                  ? 'bg-amber-500 text-black shadow-glow-gold'
                  : 'bg-wt-card text-slate-500 border border-wt-border'
              }`}
            >
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                  Master Challenge #15
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500 text-black font-extrabold font-mono">
                  +45 PP Bonus
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mt-0.5">"A well-earned trophy"</h4>
              <p className="text-xs text-slate-400">
                Automatically awarded when all 14 standard Season Challenges are completed ({completedCount}/14 completed).
              </p>
            </div>
          </div>

          <div className="text-right">
            <span
              className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${
                isMasterBonusActive
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-700'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {isMasterBonusActive ? 'Unlocked (+45 PP)' : `${14 - completedCount} Left`}
            </span>
          </div>
        </div>
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {season.challenges.map((c) => {
          const isChecked = state.completedChallengeIds.includes(c.id);
          const meta = getChallengeStatus(c);

          return (
            <div
              key={c.id}
              onClick={() => onToggleChallenge(c.id)}
              className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                isChecked
                  ? 'bg-amber-500/10 border-wt-gold/60 shadow-glow-gold'
                  : 'bg-wt-card border-wt-border hover:border-slate-500'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                      isChecked
                        ? 'bg-amber-500 border-amber-400 text-black'
                        : 'bg-wt-surface border-wt-border text-transparent'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    #{c.id.toString().padStart(2, '0')}
                  </span>
                  <h4 className={`text-sm font-bold ${isChecked ? 'text-amber-300' : 'text-white'}`}>
                    {c.name}
                  </h4>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border ${meta.badgeClass}`}
                  >
                    {meta.label}
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-400 bg-wt-surface px-1.5 py-0.5 rounded border border-wt-border">
                    +30 PP
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 pl-7">{c.description}</p>

              <div className="mt-2.5 pl-7 flex items-center justify-between text-[11px] text-slate-400 border-t border-wt-border/50 pt-2">
                <span className="flex items-center gap-1 font-mono">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {formatDateRange(c.unlockDate, c.endDate)}
                </span>
                <span className="capitalize text-[10px] text-slate-400">
                  {c.type === 'level' ? `Level Gate (Lvl ${c.levelRequirement})` : 'Weekly Task'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
