import React from 'react';
import type { UserProgressState } from '../types/battlepass';

interface GardnemProgressCardProps {
  state: UserProgressState;
  onChange: (patch: Partial<UserProgressState>) => void;
  seasonTotalDays: number;
  onOpenChallenges: () => void;
}

export const GardnemProgressCard: React.FC<GardnemProgressCardProps> = ({
  state,
  onChange,
  seasonTotalDays,
  onOpenChallenges,
}) => {
  return (
    <div className="bs-card">
      <div className="bs-card-header flex items-center justify-between">
        <span>Battlepass Progress</span>
        <span className="text-xs text-dark-muted font-normal">
          In-game values
        </span>
      </div>
      <div className="bs-card-body">
        {/* Form Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Current Battlepass Level */}
          <div>
            <label className="block text-xs text-dark-light mb-1.5 font-medium">
              Current Battlepass Level
            </label>
            <input
              type="number"
              min="0"
              max="200"
              value={state.currentLevel}
              onChange={(e) =>
                onChange({
                  currentLevel: Math.max(0, parseInt(e.target.value) || 0),
                })
              }
              className="bs-input w-full font-mono text-center font-bold"
            />
          </div>

          {/* Points Towards Next Level */}
          <div>
            <label className="block text-xs text-dark-light mb-1.5 font-medium">
              Points Towards Next Level (0-9)
            </label>
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
              className="bs-input w-full font-mono text-center font-bold"
            />
          </div>

          {/* This Season's Logins */}
          <div>
            <label className="block text-xs text-dark-light mb-1.5 font-medium">
              This Season's Logins
            </label>
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
              className="bs-input w-full font-mono text-center font-bold"
            />
          </div>

          {/* Challenge Progress */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-dark-light font-medium">
                Challenge Progress (0-14)
              </label>
              <button
                type="button"
                onClick={onOpenChallenges}
                className="text-[11px] text-bs-info hover:underline"
              >
                checklist &rarr;
              </button>
            </div>
            <input
              type="number"
              min="0"
              max="14"
              value={state.completedChallengeIds.length}
              onChange={(e) => {
                const count = Math.max(0, Math.min(14, parseInt(e.target.value) || 0));
                const newIds = Array.from({ length: count }, (_, i) => i + 1);
                onChange({ completedChallengeIds: newIds });
              }}
              className="bs-input w-full font-mono text-center font-bold"
            />
          </div>
        </div>

        {/* Pass Ownership Row */}
        <div className="mt-3.5 pt-3 border-t border-dark-border flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-dark-muted font-medium">Pass Type:</span>
            <div className="inline-flex rounded-md border border-dark-border overflow-hidden">
              <button
                type="button"
                onClick={() => onChange({ passType: 'free' })}
                className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                  state.passType === 'free'
                    ? 'bg-bs-info text-black font-bold'
                    : 'bg-dark-bg text-dark-text hover:bg-dark-card'
                }`}
              >
                Free Pass
              </button>
              <button
                type="button"
                onClick={() => onChange({ passType: 'standard' })}
                className={`px-2.5 py-1 text-xs font-medium border-l border-dark-border transition-colors ${
                  state.passType === 'standard'
                    ? 'bg-bs-warning text-black font-bold'
                    : 'bg-dark-bg text-dark-text hover:bg-dark-card'
                }`}
              >
                Standard Pass (2,000 GE)
              </button>
              <button
                type="button"
                onClick={() => onChange({ passType: 'improved' })}
                className={`px-2.5 py-1 text-xs font-medium border-l border-dark-border transition-colors ${
                  state.passType === 'improved'
                    ? 'bg-amber-400 text-black font-extrabold'
                    : 'bg-dark-bg text-dark-text hover:bg-dark-card'
                }`}
              >
                Improved Pass (+15 Lvl)
              </button>
            </div>
          </div>

          {state.passType === 'improved' && (
            <label className="flex items-center gap-1.5 text-xs text-dark-light cursor-pointer">
              <input
                type="checkbox"
                checked={state.improvedPassBonusApplied}
                onChange={(e) => onChange({ improvedPassBonusApplied: e.target.checked })}
                className="rounded accent-amber-400"
              />
              <span>+15 levels already applied in Current Level</span>
            </label>
          )}
        </div>
      </div>
    </div>
  );
};
