import React from 'react';
import {
  Award,
  LogIn,
  Medal,
  Sparkles,
  Swords,
  Trophy,
} from 'lucide-react';
import type { PointsBreakdown, UserProgressState } from '../types/battlepass';
import { LOGIN_TIERS } from '../utils/bpMath';
import { formatNumber } from '../utils/formatters';

interface BreakdownTabProps {
  breakdown: PointsBreakdown;
  state: UserProgressState;
}

export const BreakdownTab: React.FC<BreakdownTabProps> = ({
  breakdown,
  state,
}) => {
  const {
    startingPoints,
    improvedPassBonusPoints,
    loginPoints,
    easyTaskPoints,
    mediumTaskPoints,
    dailyTasksTotalPoints,
    specialTaskPoints,
    challengePoints,
    masterBonusPoints,
    challengesTotalPoints,
    totalPoints,
    finalLevel,
    leftoverPoints,
  } = breakdown;

  const total = Math.max(1, totalPoints);

  const categories = [
    {
      name: state.mode === 'current' ? 'Current Baseline Level' : 'Starting Baseline',
      points: startingPoints,
      color: 'bg-slate-400',
      icon: <Award className="w-4 h-4 text-slate-300" />,
      sub: `${(startingPoints / 10).toFixed(1)} Levels`,
    },
    {
      name: 'Improved Pass Bonus (+15 Lvl)',
      points: improvedPassBonusPoints,
      color: 'bg-amber-400',
      icon: <Sparkles className="w-4 h-4 text-amber-400" />,
      sub: `${(improvedPassBonusPoints / 10).toFixed(1)} Levels`,
    },
    {
      name: 'Daily Logins',
      points: loginPoints,
      color: 'bg-emerald-400',
      icon: <LogIn className="w-4 h-4 text-emerald-400" />,
      sub: `${(loginPoints / 10).toFixed(1)} Levels`,
    },
    {
      name: 'Daily Tasks (Easy + Medium)',
      points: dailyTasksTotalPoints,
      color: 'bg-sky-400',
      icon: <Swords className="w-4 h-4 text-sky-400" />,
      sub: `Easy: ${easyTaskPoints} PP · Medium: ${mediumTaskPoints} PP`,
    },
    {
      name: 'Special Tasks (Warbonds)',
      points: specialTaskPoints,
      color: 'bg-purple-400',
      icon: <Medal className="w-4 h-4 text-purple-400" />,
      sub: `${state.plannedSpecialTasks} tasks @ 5 PP each`,
    },
    {
      name: 'Season Challenges (+ Master)',
      points: challengesTotalPoints,
      color: 'bg-amber-500',
      icon: <Trophy className="w-4 h-4 text-amber-400" />,
      sub: `Base: ${challengePoints} PP · Master Bonus: ${masterBonusPoints} PP`,
    },
  ].filter((c) => c.points > 0);

  const totalLoginsReached =
    state.mode === 'current'
      ? state.loginsSoFar + state.expectedRemainingLogins
      : state.expectedRemainingLogins;

  return (
    <div className="space-y-5">
      {/* Visual Points Composition Bar */}
      <div className="p-4 rounded-xl bg-wt-card border border-wt-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Points Contribution &amp; Yield Composition</span>
            </h3>
            <p className="text-xs text-slate-400">
              Total yield: <strong className="text-amber-400 font-mono">{formatNumber(totalPoints)} Progress Points</strong> ({finalLevel} Levels + {leftoverPoints} PP)
            </p>
          </div>
        </div>

        {/* Stacked Progress Bar */}
        <div className="w-full h-4 bg-slate-900 rounded-full flex overflow-hidden border border-wt-border">
          {categories.map((cat, i) => {
            const pct = (cat.points / total) * 100;
            return (
              <div
                key={i}
                className={`${cat.color} h-full transition-all duration-300 relative group`}
                style={{ width: `${pct}%` }}
                title={`${cat.name}: ${cat.points} PP (${pct.toFixed(1)}%)`}
              />
            );
          })}
        </div>

        {/* Legend Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-4">
          {categories.map((cat, i) => {
            const pct = ((cat.points / total) * 100).toFixed(1);
            return (
              <div
                key={i}
                className="p-3 rounded-lg bg-wt-surface/70 border border-wt-border flex items-start gap-2.5"
              >
                <div className="mt-0.5">{cat.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-xs mb-0.5">
                    <span className="font-semibold text-slate-200 truncate">{cat.name}</span>
                    <span className="font-mono font-bold text-amber-400 shrink-0 ml-1">
                      {cat.points} PP
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="truncate">{cat.sub}</span>
                    <span className="font-mono text-slate-500">{pct}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Login Tiers Reference Table */}
      <div className="p-4 rounded-xl bg-wt-card border border-wt-border">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-wt-border/70">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <LogIn className="w-5 h-5 text-wt-gold" />
              <span>Official War Thunder Daily Login Tiers</span>
            </h3>
            <p className="text-xs text-slate-400">
              Cumulative season logins (missing days does not reset tier, but forfeits potential days). Max possible: 252 PP (25.2 Levels).
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 font-mono">Your Projected Logins:</span>
            <div className="text-sm font-mono font-bold text-amber-400">
              {totalLoginsReached} Days Logged In
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-wt-surface text-slate-400 border-b border-wt-border">
                <th className="py-2.5 px-3 uppercase">Tier</th>
                <th className="py-2.5 px-3 uppercase">Login Range</th>
                <th className="py-2.5 px-3 uppercase">Duration</th>
                <th className="py-2.5 px-3 uppercase">Points / Day</th>
                <th className="py-2.5 px-3 uppercase">Max Tier PP</th>
                <th className="py-2.5 px-3 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wt-border/50 text-slate-300">
              {LOGIN_TIERS.map((tier) => {
                const isCurrent =
                  totalLoginsReached >= tier.minDay && totalLoginsReached <= tier.maxDay;
                const isCompleted = totalLoginsReached > tier.maxDay;

                return (
                  <tr
                    key={tier.tier}
                    className={`transition-colors ${
                      isCurrent
                        ? 'bg-amber-500/10 font-bold text-white'
                        : isCompleted
                        ? 'bg-emerald-950/10 text-slate-300'
                        : 'hover:bg-wt-surface/50 text-slate-400'
                    }`}
                  >
                    <td className="py-2.5 px-3 flex items-center gap-1.5 font-bold">
                      <span className="text-wt-gold">Tier {tier.tier}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      Day {tier.minDay} – {tier.maxDay}
                    </td>
                    <td className="py-2.5 px-3">{tier.daysInTier} Days</td>
                    <td className="py-2.5 px-3 font-bold text-amber-400">
                      +{tier.pointsPerDay} PP / day
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-white">
                      {tier.maxPointsInTier} PP ({(tier.maxPointsInTier / 10).toFixed(1)} Lvl)
                    </td>
                    <td className="py-2.5 px-3">
                      {isCurrent ? (
                        <span className="px-2 py-0.5 rounded bg-amber-500 text-black font-extrabold text-[10px]">
                          Active Tier Now
                        </span>
                      ) : isCompleted ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px]">
                          Completed
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[10px]">Future</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-wt-surface/80 font-bold text-white border-t border-wt-border">
                <td className="py-2.5 px-3" colSpan={4}>
                  Cumulative Total Across Full 91-Day Season
                </td>
                <td className="py-2.5 px-3 text-amber-400" colSpan={2}>
                  252 PP (25.2 Battle Pass Levels)
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
