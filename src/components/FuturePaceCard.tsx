import React from 'react';
import {
  CalendarDays,
  Gauge,
  Medal,
  Sparkles,
  Swords,
  Trophy,
} from 'lucide-react';
import type { UserProgressState } from '../types/battlepass';
import {
  calculateLoginPoints,
  getLoginTierInfoForDay,
  MASTER_CHALLENGE_BONUS_POINTS,
  SPECIAL_TASK_WB_COST,
  TOTAL_CHALLENGES_COUNT,
} from '../utils/bpMath';

interface FuturePaceCardProps {
  state: UserProgressState;
  onChange: (patch: Partial<UserProgressState>) => void;
  remainingDays: number;
  seasonTotalDays: number;
}

export const FuturePaceCard: React.FC<FuturePaceCardProps> = ({
  state,
  onChange,
  remainingDays,
  seasonTotalDays,
}) => {
  const maxAvailableLogins = state.mode === 'current' ? remainingDays : seasonTotalDays;
  const startLogins = state.mode === 'current' ? state.loginsSoFar : 0;

  const projectedLoginPoints = calculateLoginPoints(
    startLogins,
    state.expectedRemainingLogins
  );

  const finalLoginDayReached = startLogins + state.expectedRemainingLogins;
  const finalTier = getLoginTierInfoForDay(Math.max(1, finalLoginDayReached));

  const applyPreset = (daysPerWeek: number) => {
    const days = state.mode === 'current' ? remainingDays : seasonTotalDays;
    const count = Math.min(days, Math.round((days / 7) * daysPerWeek));
    onChange({
      plannedEasyTasks: count,
      plannedMediumTasks: count,
    });
  };

  const completedChallengesCount = state.completedChallengeIds.length;
  const isMasterBonusActive = completedChallengesCount === TOTAL_CHALLENGES_COUNT;

  return (
    <div className="bg-wt-card border border-wt-border rounded-xl p-5 shadow-tactical">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-wt-border/70">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-500/10 text-wt-gold rounded-lg border border-wt-gold/20">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Future Pace &amp; Grind Planner</span>
            </h2>
            <p className="text-xs text-slate-400">
              {state.mode === 'current'
                ? `Plan your habits for the remaining ${remainingDays} days of Season XXV`
                : `Plan your overall habits across all ${seasonTotalDays} days`}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Expected Remaining Logins */}
        <div className="bg-wt-surface/70 border border-wt-border rounded-lg p-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-wt-gold" />
                <span>
                  {state.mode === 'current' ? 'Expected Remaining Logins' : 'Total Planned Season Logins'}
                </span>
              </label>
              <div className="text-[11px] text-slate-400">
                Yields:{' '}
                <strong className="text-amber-400 font-mono">
                  +{projectedLoginPoints} PP ({(projectedLoginPoints / 10).toFixed(1)} Levels)
                </strong>{' '}
                · Reaches Tier {finalTier.tier} ({finalTier.pointsPerDay} PP/day)
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onChange({ expectedRemainingLogins: maxAvailableLogins })}
                className="px-2 py-1 rounded bg-wt-card border border-wt-border hover:border-wt-gold text-[11px] font-medium text-slate-300 hover:text-white transition-colors"
              >
                Max ({maxAvailableLogins}d)
              </button>
              <input
                type="number"
                min="0"
                max={maxAvailableLogins}
                value={state.expectedRemainingLogins}
                onChange={(e) =>
                  onChange({
                    expectedRemainingLogins: Math.max(
                      0,
                      Math.min(maxAvailableLogins, parseInt(e.target.value) || 0)
                    ),
                  })
                }
                className="w-16 bg-wt-card border border-wt-border focus:border-wt-gold text-right font-mono font-bold text-amber-400 px-2 py-1 rounded text-sm focus:outline-none"
              />
            </div>
          </div>

          <input
            type="range"
            min="0"
            max={maxAvailableLogins}
            value={state.expectedRemainingLogins}
            onChange={(e) =>
              onChange({ expectedRemainingLogins: parseInt(e.target.value) || 0 })
            }
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
            <span>0 logins</span>
            <span>{Math.round(maxAvailableLogins / 2)} logins</span>
            <span>All {maxAvailableLogins} logins</span>
          </div>
        </div>

        {/* Daily Tasks Pace */}
        <div className="bg-wt-surface/70 border border-wt-border rounded-lg p-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Swords className="w-4 h-4 text-wt-gold" />
                <span>Daily Tasks Commitment</span>
              </label>
              <p className="text-[11px] text-slate-400">
                Easy Task: 2 PP · Medium Task: 3 PP (Requires Easy first) · Combined: 5 PP/day
              </p>
            </div>

            {/* Presets */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400 font-mono uppercase">Presets:</span>
              <button
                type="button"
                onClick={() => applyPreset(2)}
                className="px-2 py-0.5 rounded bg-wt-card hover:bg-slate-700 border border-wt-border text-[10px] font-medium text-slate-300"
                title="2 days per week"
              >
                Casual (2d/wk)
              </button>
              <button
                type="button"
                onClick={() => applyPreset(5)}
                className="px-2 py-0.5 rounded bg-wt-card hover:bg-slate-700 border border-wt-border text-[10px] font-medium text-slate-300"
                title="5 days per week"
              >
                Regular (5d/wk)
              </button>
              <button
                type="button"
                onClick={() => applyPreset(7)}
                className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-[10px] font-medium text-amber-300"
                title="Every remaining day"
              >
                Hardcore (7d/wk)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            {/* Easy Tasks Slider */}
            <div className="p-2.5 rounded bg-wt-card/60 border border-wt-border/70">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-200">
                  Easy Tasks <span className="text-amber-400 font-mono">(2 PP)</span>
                </span>
                <span className="font-mono font-bold text-amber-400">
                  {state.plannedEasyTasks} tasks (+{state.plannedEasyTasks * 2} PP)
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={maxAvailableLogins}
                value={state.plannedEasyTasks}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  onChange({
                    plannedEasyTasks: val,
                    plannedMediumTasks: Math.min(state.plannedMediumTasks, val),
                  });
                }}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Medium Tasks Slider */}
            <div className="p-2.5 rounded bg-wt-card/60 border border-wt-border/70">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-200">
                  Medium Tasks <span className="text-amber-400 font-mono">(3 PP)</span>
                </span>
                <span className="font-mono font-bold text-amber-400">
                  {state.plannedMediumTasks} tasks (+{state.plannedMediumTasks * 3} PP)
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={state.plannedEasyTasks}
                value={state.plannedMediumTasks}
                onChange={(e) =>
                  onChange({
                    plannedMediumTasks: Math.min(
                      state.plannedEasyTasks,
                      parseInt(e.target.value) || 0
                    ),
                  })
                }
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="text-[10px] text-slate-400 text-right mt-0.5">
                Capped by Easy Tasks ({state.plannedEasyTasks} max)
              </div>
            </div>
          </div>
        </div>

        {/* Planned Special Tasks */}
        <div className="bg-wt-surface/70 border border-wt-border rounded-lg p-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Medal className="w-4 h-4 text-wt-gold" />
                <span>Planned Special Tasks (5 PP each)</span>
              </label>
              <div className="text-[11px] text-slate-400">
                Grants: <strong className="text-amber-400 font-mono">+{state.plannedSpecialTasks * 5} PP ({(state.plannedSpecialTasks * 0.5).toFixed(1)} Levels)</strong> · Requires:{' '}
                <span className="text-sky-300 font-mono font-medium">
                  {state.plannedSpecialTasks * SPECIAL_TASK_WB_COST} Warbonds
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">Tasks:</span>
              <input
                type="number"
                min="0"
                max="100"
                value={state.plannedSpecialTasks}
                onChange={(e) =>
                  onChange({
                    plannedSpecialTasks: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)),
                  })
                }
                className="w-16 bg-wt-card border border-wt-border focus:border-wt-gold text-right font-mono font-bold text-amber-400 px-2 py-1 rounded text-sm focus:outline-none"
              />
            </div>
          </div>

          <input
            type="range"
            min="0"
            max="60"
            value={state.plannedSpecialTasks}
            onChange={(e) =>
              onChange({ plannedSpecialTasks: parseInt(e.target.value) || 0 })
            }
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mt-1">
            <span>0 tasks (0 WB)</span>
            <span>20 tasks (600 WB)</span>
            <span>40 tasks (1,200 WB)</span>
            <span>60 tasks (1,800 WB)</span>
          </div>
        </div>

        {/* Challenges Progress Mini-Card */}
        <div className="bg-wt-surface/70 border border-wt-border rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <span>Season Challenges Completed</span>
                <span className="text-amber-400 font-mono font-bold">
                  ({completedChallengesCount} / {TOTAL_CHALLENGES_COUNT})
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {isMasterBonusActive ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> All 14 completed! +45 PP Master Bonus Unlocked!
                  </span>
                ) : (
                  <span>
                    Check individual challenges in the <strong>Season Challenges Tab</strong> below.
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-sm font-mono font-bold text-amber-400">
              +{completedChallengesCount * 30 + (isMasterBonusActive ? MASTER_CHALLENGE_BONUS_POINTS : 0)} PP
            </div>
            <div className="text-[10px] text-slate-400">
              {((completedChallengesCount * 30 + (isMasterBonusActive ? 45 : 0)) / 10).toFixed(1)} Levels
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
