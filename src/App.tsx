import { useEffect, useMemo, useState } from 'react';
import {
  PieChart,
  Shield,
  Trophy,
} from 'lucide-react';
import { Header } from './components/Header';
import { CurrentStatusCard } from './components/CurrentStatusCard';
import { FuturePaceCard } from './components/FuturePaceCard';
import { RoadTo150Card } from './components/RoadTo150Card';
import { ChallengesTab } from './components/ChallengesTab';
import { RoadmapTab } from './components/RoadmapTab';
import { BreakdownTab } from './components/BreakdownTab';
import { CustomSeasonModal } from './components/CustomSeasonModal';
import { BackupModal } from './components/BackupModal';
import { SEASONS_LIST } from './data/seasons';
import type {
  CalculationMode,
  SeasonData,
  UserProgressState,
} from './types/battlepass';
import {
  calculateProjection,
  calculateRoadToMilestonePlan,
  calculateSeasonTelemetry,
} from './utils/bpMath';
import {
  clearSavedState,
  DEFAULT_USER_STATE,
  loadSavedState,
  saveState,
} from './utils/storage';

export function App() {
  const [state, setState] = useState<UserProgressState>(() => loadSavedState());
  const [activeTab, setActiveTab] = useState<'challenges' | 'roadmap' | 'breakdown'>('challenges');
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [customSeasons, setCustomSeasons] = useState<SeasonData[]>([]);

  // Persist state to localStorage on any state change
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Combined seasons list (built-in + any custom season created)
  const allSeasons = useMemo(() => {
    return [...SEASONS_LIST, ...customSeasons];
  }, [customSeasons]);

  // Active season lookup
  const activeSeason = useMemo(() => {
    return allSeasons.find((s) => s.id === state.seasonId) || SEASONS_LIST[0];
  }, [allSeasons, state.seasonId]);

  // Telemetry
  const telemetry = useMemo(() => {
    return calculateSeasonTelemetry(activeSeason.startDate, activeSeason.endDate);
  }, [activeSeason.startDate, activeSeason.endDate]);

  // Point projection calculation
  const projection = useMemo(() => {
    return calculateProjection(state);
  }, [state]);

  // Road to milestone reverse action plan
  const actionPlan = useMemo(() => {
    return calculateRoadToMilestonePlan(state, activeSeason);
  }, [state, activeSeason]);

  // State update helper
  const updateState = (patch: Partial<UserProgressState>) => {
    setState((prev) => ({
      ...prev,
      ...patch,
    }));
  };

  // Switch season
  const handleSelectSeason = (seasonId: string) => {
    const selected = allSeasons.find((s) => s.id === seasonId) || SEASONS_LIST[0];
    const remainingDays = calculateSeasonTelemetry(selected.startDate, selected.endDate).remainingDays;

    updateState({
      seasonId,
      expectedRemainingLogins: remainingDays,
      plannedEasyTasks: remainingDays,
      plannedMediumTasks: remainingDays,
      completedChallengeIds: selected.id === 's25' ? [1, 2] : [],
    });
  };

  // Toggle challenge checkbox
  const handleToggleChallenge = (challengeId: number) => {
    const exists = state.completedChallengeIds.includes(challengeId);
    const updated = exists
      ? state.completedChallengeIds.filter((id) => id !== challengeId)
      : [...state.completedChallengeIds, challengeId];
    updateState({ completedChallengeIds: updated });
  };

  // Check all active challenges
  const handleCheckAllActive = () => {
    const now = new Date().getTime();
    const activeIds = activeSeason.challenges
      .filter((c) => {
        const unlock = new Date(c.unlockDate).getTime();
        const end = new Date(c.endDate).getTime();
        return now >= unlock && now <= end;
      })
      .map((c) => c.id);

    // Merge without duplicates
    const merged = Array.from(new Set([...state.completedChallengeIds, ...activeIds]));
    updateState({ completedChallengeIds: merged });
  };

  // Clear all checked challenges
  const handleClearAllChallenges = () => {
    updateState({ completedChallengeIds: [] });
  };

  // Add custom season
  const handleSaveCustomSeason = (newSeason: SeasonData) => {
    setCustomSeasons((prev) => [newSeason, ...prev]);
    updateState({
      seasonId: newSeason.id,
      expectedRemainingLogins: newSeason.totalDays,
      plannedEasyTasks: newSeason.totalDays,
      plannedMediumTasks: newSeason.totalDays,
      completedChallengeIds: [],
    });
  };

  // Reset state
  const handleResetState = () => {
    clearSavedState();
    setState(DEFAULT_USER_STATE);
  };

  return (
    <div className="min-h-screen bg-wt-dark text-slate-100 flex flex-col">
      {/* Top Header & Telemetry */}
      <Header
        season={activeSeason}
        seasons={allSeasons}
        onSelectSeason={handleSelectSeason}
        onOpenCustomSeasonModal={() => setIsCustomModalOpen(true)}
        state={state}
        onChangeMode={(mode: CalculationMode) => updateState({ mode })}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        projectedLevel={projection.finalLevel}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Dual-Column Interactive Control & Road to 150 Centerpiece */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Input Controls & Future Pace (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <CurrentStatusCard
              state={state}
              onChange={updateState}
              seasonTotalDays={activeSeason.totalDays}
            />

            <FuturePaceCard
              state={state}
              onChange={updateState}
              remainingDays={telemetry.remainingDays}
              seasonTotalDays={activeSeason.totalDays}
            />
          </div>

          {/* Right Column: Road to Level 150 Sticky Centerpiece (5 cols) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
            <RoadTo150Card
              actionPlan={actionPlan}
              season={activeSeason}
              state={state}
              onChangeTargetLevel={(level) => updateState({ selectedTargetLevel: level })}
              onOpenChallengesTab={() => setActiveTab('challenges')}
            />
          </div>
        </div>

        {/* Tabbed Interactive Section (Bottom Area) */}
        <div className="pt-2">
          {/* Tab Navigation */}
          <div className="flex border-b border-wt-border space-x-1 sm:space-x-2">
            <button
              type="button"
              onClick={() => setActiveTab('challenges')}
              className={`py-3 px-3.5 sm:px-5 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${
                activeTab === 'challenges'
                  ? 'border-amber-500 text-amber-400 bg-wt-card/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Season XXV Challenges</span>
              <span className="font-mono text-xs px-1.5 py-0.2 rounded bg-wt-surface border border-wt-border">
                {state.completedChallengeIds.length}/14
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('roadmap')}
              className={`py-3 px-3.5 sm:px-5 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${
                activeTab === 'roadmap'
                  ? 'border-amber-500 text-amber-400 bg-wt-card/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Milestone &amp; Reward Roadmap</span>
              <span className="font-mono text-xs px-1.5 py-0.2 rounded bg-wt-surface border border-wt-border">
                Lvl 1 - 150
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('breakdown')}
              className={`py-3 px-3.5 sm:px-5 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${
                activeTab === 'breakdown'
                  ? 'border-amber-500 text-amber-400 bg-wt-card/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <PieChart className="w-4 h-4" />
              <span>Point Breakdown &amp; Login Tiers</span>
            </button>
          </div>

          {/* Active Tab Content */}
          <div className="pt-4">
            {activeTab === 'challenges' && (
              <ChallengesTab
                season={activeSeason}
                state={state}
                onToggleChallenge={handleToggleChallenge}
                onCheckAllActive={handleCheckAllActive}
                onClearAll={handleClearAllChallenges}
              />
            )}

            {activeTab === 'roadmap' && (
              <RoadmapTab
                season={activeSeason}
                state={state}
                projectedLevel={projection.finalLevel}
              />
            )}

            {activeTab === 'breakdown' && (
              <BreakdownTab breakdown={projection} state={state} />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-wt-border bg-wt-card/90 mt-12 py-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-300">
            <Shield className="w-4 h-4 text-wt-gold" />
            <span className="font-bold text-white">War Thunder Battle Pass Calculator</span>
            <span className="text-slate-500">·</span>
            <span>Season XXV: "Steel Fury" (Late 2026 Edition)</span>
          </div>

          <div className="text-center md:text-right text-[11px] text-slate-500">
            <span>
              War Thunder is a registered trademark of Gaijin Entertainment. This calculator is a non-commercial, open-source tactical planner.
            </span>
            <div className="mt-1 text-slate-400">
              Auto-deployed to GitHub Pages · Clean standalone client-side calculation engine
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <CustomSeasonModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onSaveCustomSeason={handleSaveCustomSeason}
      />

      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        state={state}
        onImportState={(newState) => setState(newState)}
        onResetState={handleResetState}
      />
    </div>
  );
}

export default App;
