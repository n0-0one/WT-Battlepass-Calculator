import React from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Coins,
  Crown,
  Sparkles,
  Swords,
  Target,
} from 'lucide-react';
import type { ActionPlan, SeasonData, UserProgressState } from '../types/battlepass';
import { formatNumber } from '../utils/formatters';

interface RoadTo150CardProps {
  actionPlan: ActionPlan;
  season: SeasonData;
  state: UserProgressState;
  onChangeTargetLevel: (level: number) => void;
  onOpenChallengesTab: () => void;
}

const MILESTONES = [
  { level: 51, label: 'Lvl 51', name: 'Free Vehicle', vehicle: 'S-706', isFree: true },
  { level: 75, label: 'Lvl 75', name: 'Main Vehicle', vehicle: 'Jagdpanther G2', isFree: false },
  { level: 105, label: 'Lvl 105', name: 'Market Upgrade', vehicle: 'S-706 Tradable', isFree: false },
  { level: 125, label: 'Lvl 125', name: 'Free Next BP', vehicle: 'Jagdpanther G2 Tradable', isFree: false },
  { level: 150, label: 'Lvl 150', name: 'Prestige Title', vehicle: '"Steel Fury"', isFree: true },
];

export const RoadTo150Card: React.FC<RoadTo150CardProps> = ({
  actionPlan,
  state,
  onChangeTargetLevel,
  onOpenChallengesTab,
}) => {
  const {
    targetLevel,
    targetPoints,
    projectedPoints,
    projectedLevel,
    deficitPoints,
    surplusPoints,
    deficitLevels,
    surplusLevels,
    status,
    maxPossibleFinalPoints,
    maxPossibleFinalLevel,
    specialTasksNeeded,
    specialTasksPerDay,
    specialTasksPerWeek,
    warbondsNeeded,
    mediumTasksNeededForUnlocks,
    geCostToReachTarget,
    isDay28UnlockPassed,
    daysUntilDay28,
    recommendedGEStrategy,
  } = actionPlan;

  const currentMilestone =
    MILESTONES.find((m) => m.level === targetLevel) || {
      level: targetLevel,
      label: `Lvl ${targetLevel}`,
      name: 'Custom Target',
      vehicle: `${targetLevel * 10} PP`,
      isFree: true,
    };

  const progressToTargetPercent = Math.min(
    100,
    Math.max(0, (projectedPoints / targetPoints) * 100)
  );

  return (
    <div className="bg-wt-card border border-wt-border rounded-xl p-5 shadow-tactical relative overflow-hidden">
      {/* Decorative military watermarked emblem */}
      <div className="absolute -top-12 -right-12 opacity-5 pointer-events-none">
        <Crown className="w-64 h-64 text-wt-gold" />
      </div>

      {/* Card Header & Milestone Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 mb-4 border-b border-wt-border/70">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-br from-amber-500/20 to-amber-700/20 text-wt-gold rounded-lg border border-wt-gold/30 shadow-glow-gold">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Road to Level {targetLevel}: Strategic Action Planner</span>
            </h2>
            <p className="text-xs text-slate-400">
              Mathematical reverse planner &amp; requirement solver
            </p>
          </div>
        </div>

        {/* Milestone Preset Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {MILESTONES.map((m) => (
            <button
              key={m.level}
              type="button"
              onClick={() => onChangeTargetLevel(m.level)}
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all ${
                targetLevel === m.level
                  ? 'bg-amber-500 text-black shadow-glow-gold'
                  : 'bg-wt-surface border border-wt-border hover:border-slate-500 text-slate-300'
              }`}
              title={`${m.name}: ${m.vehicle}`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* High-Visibility Projected Final Level Gauge */}
      <div className="mb-5 p-4 rounded-xl bg-gradient-to-br from-wt-surface/90 to-wt-card border border-wt-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              Target Milestone:
            </span>
            <div className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-amber-400">Level {targetLevel}</span>
              <span className="text-xs font-normal text-slate-300 bg-wt-surface px-2 py-0.5 rounded border border-wt-border">
                {currentMilestone.name} ({currentMilestone.vehicle})
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400">Projected Final Outcome</span>
            <div className="text-2xl font-black font-mono text-white flex items-baseline justify-end gap-1.5">
              <span className="text-amber-400">Lvl {projectedLevel}</span>
              <span className="text-xs text-slate-400 font-normal">
                ({formatNumber(projectedPoints)} / {formatNumber(targetPoints)} PP)
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-900 rounded-full h-3 p-0.5 border border-wt-border overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              status === 'on_track'
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-glow-emerald'
                : status === 'achievable_grind'
                ? 'bg-gradient-to-r from-amber-500 to-amber-300 shadow-glow-gold'
                : 'bg-gradient-to-r from-rose-600 to-rose-400 shadow-glow-rose'
            }`}
            style={{ width: `${progressToTargetPercent}%` }}
          />
        </div>

        {/* Status Callout Badge & Subtext */}
        <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          {status === 'on_track' && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-semibold text-xs shadow-glow-emerald">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>ON TRACK: Target Secured! (+{surplusLevels} Levels / +{surplusPoints} PP Surplus)</span>
            </div>
          )}
          {status === 'achievable_grind' && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-950/80 border border-amber-500/50 text-amber-300 font-semibold text-xs shadow-glow-gold">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>
                ACHIEVABLE VIA GRIND: {deficitLevels} Levels Short ({deficitPoints} PP Gap)
              </span>
            </div>
          )}
          {status === 'impossible_without_ge' && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-rose-950/80 border border-rose-500/50 text-rose-300 font-semibold text-xs shadow-glow-rose">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>MATHEMATICALLY IMPOSSIBLE WITHOUT GE BUYOUT</span>
            </div>
          )}

          <div className="text-xs text-slate-400 font-mono">
            {progressToTargetPercent.toFixed(1)}% of Target Achieved
          </div>
        </div>
      </div>

      {/* Strategic Requirement Solutions */}
      <div className="space-y-4">
        {/* Solution 1: Pure Gameplay Action Plan (Zero GE) */}
        <div className="p-4 rounded-lg bg-wt-surface/80 border border-wt-border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Swords className="w-4 h-4 text-wt-gold" />
              <span>Free-to-Play Action Plan (No GE Spent)</span>
            </h3>
            <span className="text-xs font-mono text-emerald-400 font-semibold">
              Max Theoretical Ceiling: Lvl {maxPossibleFinalLevel} ({maxPossibleFinalPoints} PP)
            </span>
          </div>

          {deficitPoints === 0 ? (
            <div className="text-xs text-slate-300 py-1">
              🎉 Your current planned pace successfully reaches Level {targetLevel}! You do not need any additional Special Tasks or GE. Maintain your daily tasks and complete your scheduled logins.
            </div>
          ) : (
            <div>
              <p className="text-xs text-slate-300 mb-3">
                To bridge the <strong className="text-amber-400">{deficitPoints} PP ({deficitLevels} Levels)</strong> gap strictly through gameplay without spending Golden Eagles:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                <div className="p-2.5 rounded bg-wt-card border border-wt-border">
                  <div className="text-[10px] text-slate-400 font-mono uppercase">Special Tasks</div>
                  <div className="text-base font-extrabold text-amber-400 font-mono mt-0.5">
                    {specialTasksNeeded}
                  </div>
                  <div className="text-[10px] text-slate-400">@ 5 PP each</div>
                </div>

                <div className="p-2.5 rounded bg-wt-card border border-wt-border">
                  <div className="text-[10px] text-slate-400 font-mono uppercase">Weekly Pace</div>
                  <div className="text-base font-extrabold text-white font-mono mt-0.5">
                    ~{specialTasksPerWeek} / wk
                  </div>
                  <div className="text-[10px] text-slate-400">({specialTasksPerDay} / day)</div>
                </div>

                <div className="p-2.5 rounded bg-wt-card border border-wt-border">
                  <div className="text-[10px] text-slate-400 font-mono uppercase">Warbonds Needed</div>
                  <div className="text-base font-extrabold text-sky-400 font-mono mt-0.5">
                    {formatNumber(warbondsNeeded)} WB
                  </div>
                  <div className="text-[10px] text-slate-400">@ 30 WB per task</div>
                </div>

                <div className="p-2.5 rounded bg-wt-card border border-wt-border">
                  <div className="text-[10px] text-slate-400 font-mono uppercase">Medium Tasks</div>
                  <div className="text-base font-extrabold text-emerald-400 font-mono mt-0.5">
                    {mediumTasksNeededForUnlocks}
                  </div>
                  <div className="text-[10px] text-slate-400">to unlock permits</div>
                </div>
              </div>

              {state.completedChallengeIds.length < 14 && (
                <div className="mt-3 p-2.5 rounded bg-amber-950/20 border border-amber-800/40 text-xs text-amber-200 flex items-center justify-between">
                  <span>
                    💡 Completing all remaining Season Challenges earns +30 PP each plus the <strong>+45 PP Master Challenge bonus</strong>!
                  </span>
                  <button
                    type="button"
                    onClick={onOpenChallengesTab}
                    className="ml-2 text-xs text-amber-400 underline font-semibold hover:text-amber-300 shrink-0"
                  >
                    View Challenges &rarr;
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Solution 2: Golden Eagles (GE) Buyout Option */}
        <div className="p-4 rounded-lg bg-wt-surface/80 border border-wt-border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-wt-gold" />
              <span>Golden Eagles (GE) Buyout Calculation</span>
            </h3>

            <span
              className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                isDay28UnlockPassed
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}
            >
              {isDay28UnlockPassed ? 'Buyout Available In-Game' : `Unlocks in ${daysUntilDay28} Days`}
            </span>
          </div>

          {deficitLevels === 0 ? (
            <div className="text-xs text-slate-400">
              No levels need to be purchased with GE. You are fully on track!
            </div>
          ) : (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded bg-wt-card border border-wt-border mb-3">
                <div>
                  <div className="text-xs text-slate-300 font-semibold">
                    Cost to buyout remaining {deficitLevels} Levels ({deficitPoints} PP):
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Calculated using official Gaijin tiered pricing (75 / 125 / 175 / 250 GE brackets)
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xl font-black font-mono text-amber-400">
                    {formatNumber(geCostToReachTarget)} GE
                  </div>
                  <div className="text-[10px] text-slate-400">
                    ~{(geCostToReachTarget / deficitLevels).toFixed(0)} GE / level average
                  </div>
                </div>
              </div>

              {recommendedGEStrategy && (
                <div className="p-3 rounded bg-emerald-950/30 border border-emerald-700/50 text-xs text-emerald-200 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold text-emerald-300">Cost-Saving Optimization Tip:</span>
                    <p className="mt-0.5 text-emerald-200/90">{recommendedGEStrategy}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
