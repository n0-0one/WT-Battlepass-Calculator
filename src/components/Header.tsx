import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Clock,
  Flame,
  Shield,
  SlidersHorizontal,
} from 'lucide-react';
import type { CalculationMode, SeasonData, UserProgressState } from '../types/battlepass';
import { calculateSeasonTelemetry } from '../utils/bpMath';
import { formatCountdown, formatUTCDateTime } from '../utils/formatters';

interface HeaderProps {
  season: SeasonData;
  seasons: SeasonData[];
  onSelectSeason: (seasonId: string) => void;
  onOpenCustomSeasonModal: () => void;
  state: UserProgressState;
  onChangeMode: (mode: CalculationMode) => void;
  onOpenBackupModal: () => void;
  projectedLevel: number;
}

export const Header: React.FC<HeaderProps> = ({
  season,
  seasons,
  onSelectSeason,
  onOpenCustomSeasonModal,
  state,
  onChangeMode,
  onOpenBackupModal,
  projectedLevel,
}) => {
  const [telemetry, setTelemetry] = useState(() =>
    calculateSeasonTelemetry(season.startDate, season.endDate)
  );

  useEffect(() => {
    const update = () => {
      setTelemetry(calculateSeasonTelemetry(season.startDate, season.endDate));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [season.startDate, season.endDate]);

  const levelProgressPercent = Math.min(100, Math.max(0, (projectedLevel / 150) * 100));

  return (
    <header className="border-b border-wt-border bg-wt-card/95 backdrop-blur sticky top-0 z-40 shadow-tactical">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Logo & Season Title */}
          <div className="flex items-center gap-3.5">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-lg bg-wt-surface border border-wt-gold/40 shadow-glow-gold">
              <Shield className="w-7 h-7 text-wt-gold animate-pulse" />
              <span className="absolute -bottom-1 -right-1 px-1 text-[10px] font-mono font-bold bg-amber-500 text-black rounded">
                2026
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest font-mono text-wt-gold font-semibold flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  War Thunder Battle Pass Planner
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-wt-surface border border-wt-border text-slate-400 font-mono">
                  v2.5 Modernized
                </span>
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  <span>Season {season.number}:</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">
                    "{season.name}"
                  </span>
                </h1>
                {season.isCustom && (
                  <span className="text-xs px-2 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-700 font-mono">
                    Custom Mode
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-medium">{season.theme}</p>
            </div>
          </div>

          {/* Action Tools & Season Selector */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Season Selector Dropdown */}
            <div className="flex items-center gap-1.5 bg-wt-surface border border-wt-border rounded-lg px-2.5 py-1.5 text-sm">
              <Calendar className="w-4 h-4 text-wt-gold shrink-0" />
              <select
                value={season.id}
                onChange={(e) => {
                  if (e.target.value === 'custom_modal') {
                    onOpenCustomSeasonModal();
                  } else {
                    onSelectSeason(e.target.value);
                  }
                }}
                className="bg-transparent text-slate-200 text-xs sm:text-sm font-medium focus:outline-none cursor-pointer"
              >
                <optgroup label="2026 Seasons">
                  {seasons.map((s) => (
                    <option key={s.id} value={s.id} className="bg-wt-card text-slate-200">
                      Season {s.number}: {s.name} {s.id === 's25' ? '(Active Default)' : ''}
                    </option>
                  ))}
                </optgroup>
                <option value="custom_modal" className="bg-wt-card text-amber-400 font-semibold">
                  + Custom / Future Season...
                </option>
              </select>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center bg-wt-surface border border-wt-border rounded-lg p-0.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => onChangeMode('current')}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                  state.mode === 'current'
                    ? 'bg-amber-500 text-black font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Calculate future gain starting from your exact in-game Battle Pass level"
              >
                <span>From Current Level</span>
              </button>
              <button
                type="button"
                onClick={() => onChangeMode('full')}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                  state.mode === 'full'
                    ? 'bg-amber-500 text-black font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Full season planner starting from Day 1"
              >
                <span>Full Season Sim</span>
              </button>
            </div>

            {/* Backup / Reset Button */}
            <button
              type="button"
              onClick={onOpenBackupModal}
              className="flex items-center gap-1.5 bg-wt-surface hover:bg-wt-border text-slate-300 hover:text-white border border-wt-border px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              title="Export, Import, or Reset season planner data"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-wt-gold" />
              <span>Data Sync</span>
            </button>
          </div>
        </div>

        {/* Telemetry Bar */}
        <div className="mt-3.5 pt-3 border-t border-wt-border/70 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {/* Calendar Progress */}
          <div className="bg-wt-surface/80 rounded-md p-2 border border-wt-border/50">
            <div className="text-slate-400 flex items-center justify-between">
              <span>Season Timeline</span>
              <span className="font-mono text-wt-gold font-bold">
                Day {telemetry.currentDay} / {telemetry.totalDays}
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1.5 overflow-hidden">
              <div
                className="bg-amber-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, telemetry.percentTimeElapsed)}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 mt-1 truncate">
              {formatUTCDateTime(season.startDate)} → {formatUTCDateTime(season.endDate)}
            </div>
          </div>

          {/* Time Remaining Countdown */}
          <div className="bg-wt-surface/80 rounded-md p-2 border border-wt-border/50">
            <div className="text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Remaining Time
              </span>
              <span className="font-mono text-emerald-400 font-bold">
                {telemetry.remainingDays} Days Left
              </span>
            </div>
            <div className="text-sm font-mono font-bold text-white mt-1">
              {formatCountdown(telemetry.remainingHours, telemetry.remainingMins, telemetry.remainingSecs)}
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              Rollover daily at 12:00:00 UTC
            </div>
          </div>

          {/* Projected Level Telemetry */}
          <div className="bg-wt-surface/80 rounded-md p-2 border border-wt-border/50">
            <div className="text-slate-400 flex items-center justify-between">
              <span>Projected Final Level</span>
              <span className="font-mono font-bold text-amber-400">
                Lvl {projectedLevel} / 150
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1.5 overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  projectedLevel >= 150 ? 'bg-emerald-400' : projectedLevel >= 75 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${levelProgressPercent}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
              <span>Pace: {projectedLevel >= 150 ? 'Title Secured 🏆' : `${150 - projectedLevel} lvls to Title`}</span>
              <span className="font-mono">{levelProgressPercent.toFixed(0)}%</span>
            </div>
          </div>

          {/* GE Buyout Status */}
          <div className="bg-wt-surface/80 rounded-md p-2 border border-wt-border/50">
            <div className="text-slate-400 flex items-center justify-between">
              <span>GE Level Buyout</span>
              <span
                className={`font-mono text-[11px] font-bold px-1.5 py-0.2 rounded ${
                  telemetry.isDay28Passed
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}
              >
                {telemetry.isDay28Passed ? 'Unlocked' : `Locks for ${telemetry.daysUntilDay28}d`}
              </span>
            </div>
            <div className="text-[11px] text-slate-300 mt-1 font-medium">
              {telemetry.isDay28Passed
                ? 'Levels can now be purchased with Golden Eagles'
                : `War Thunder rules allow GE buyouts after Day 28`}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
