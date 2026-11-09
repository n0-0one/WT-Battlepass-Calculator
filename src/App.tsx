import { useEffect, useMemo, useState } from 'react';
import {
  ExternalLink,
  LogIn,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Swords,
  Target,
  Trophy,
} from 'lucide-react';
import { StatCard } from './components/StatCard';
import { GardnemProgressCard } from './components/GardnemProgressCard';
import { ChallengesTab } from './components/ChallengesTab';
import { RoadmapTab } from './components/RoadmapTab';
import { CustomSeasonModal } from './components/CustomSeasonModal';
import { BackupModal } from './components/BackupModal';
import { SEASONS_LIST } from './data/seasons';
import type { SeasonData, UserProgressState } from './types/battlepass';
import {
  calculateChallengePoints,
  calculateLoginPoints,
  calculateRoadToMilestonePlan,
  calculateSeasonTelemetry,
  LOGIN_TIERS,
  POINTS_PER_LEVEL,
} from './utils/bpMath';
import {
  clearSavedState,
  DEFAULT_USER_STATE,
  loadSavedState,
  saveState,
} from './utils/storage';
import { formatNumber } from './utils/formatters';

export function App() {
  const [state, setState] = useState<UserProgressState>(() => loadSavedState());
  const [customSeasons, setCustomSeasons] = useState<SeasonData[]>([]);
  const [activeTab, setActiveTab] = useState<'planner' | 'challenges' | 'roadmap' | 'logins'>('planner');
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // End date override state (matching gardnem6 feature)
  const [endDateOverride, setEndDateOverride] = useState<string>('');

  // Persist state to localStorage
  useEffect(() => {
    saveState(state);
  }, [state]);

  const allSeasons = useMemo(() => {
    return [...SEASONS_LIST, ...customSeasons];
  }, [customSeasons]);

  const activeSeason = useMemo(() => {
    const s = allSeasons.find((item) => item.id === state.seasonId) || SEASONS_LIST[0];
    if (endDateOverride) {
      return {
        ...s,
        endDate: `${endDateOverride}T12:00:00Z`,
      };
    }
    return s;
  }, [allSeasons, state.seasonId, endDateOverride]);

  // Telemetry
  const telemetry = useMemo(() => {
    return calculateSeasonTelemetry(activeSeason.startDate, activeSeason.endDate);
  }, [activeSeason.startDate, activeSeason.endDate]);

  const updateState = (patch: Partial<UserProgressState>) => {
    setState((prev) => ({
      ...prev,
      ...patch,
    }));
  };

  // Calculations strictly in the gardnem6 mathematical structure:
  const currentTotalPoints = state.currentLevel * POINTS_PER_LEVEL + state.pointsInCurrentLevel;
  const currentLoginPoints = calculateLoginPoints(0, state.loginsSoFar);
  const currentChallengePoints = calculateChallengePoints(state.completedChallengeIds.length).total;
  
  // Levels from Daily and Special tasks so far = Total points minus logins minus challenges
  const currentTaskPoints = Math.max(0, currentTotalPoints - currentLoginPoints - currentChallengePoints);
  const levelsFromTasksSoFar = (currentTaskPoints / 10).toFixed(1);
  const levelsFromLoginsSoFar = (currentLoginPoints / 10).toFixed(1);
  const levelsFromChallengesSoFar = (currentChallengePoints / 10).toFixed(1);

  // Remaining days
  const q = telemetry.remainingDays;

  // Remaining login points starting from logins so far
  const remainingLoginPoints = calculateLoginPoints(state.loginsSoFar, q);
  const totalLoginsPossiblePoints = calculateLoginPoints(0, activeSeason.totalDays);

  // Improved pass bonus
  const improvedPassBonus =
    state.passType === 'improved' && !state.improvedPassBonusApplied ? 150 : 0;

  // Projections:
  // 1. With Only Logins
  const possibleLevelOnlyLogins = (
    (currentTotalPoints + remainingLoginPoints + improvedPassBonus) /
    10
  ).toFixed(1);

  // 2. With Logins and Easy Tasks (2 PP per day)
  const possibleLevelEasyTasks = (
    (currentTotalPoints + remainingLoginPoints + q * 2 + improvedPassBonus) /
    10
  ).toFixed(1);

  // 3. With Logins, Easy Tasks, and Medium Tasks (5 PP per day)
  const possibleLevelBothTasks = (
    (currentTotalPoints + remainingLoginPoints + q * 5 + improvedPassBonus) /
    10
  ).toFixed(1);

  // Reverse Action Plan for targets
  const targetLevel = state.selectedTargetLevel || 150;
  const actionPlan = useMemo(() => {
    return calculateRoadToMilestonePlan(state, activeSeason);
  }, [state, activeSeason]);

  // Target questions logic (like Gardnem6's Level 75 question)
  const getMilestoneFeasibilityText = (milestoneLvl: number) => {
    const bothTasksLevel = parseFloat(possibleLevelBothTasks);
    if (bothTasksLevel >= milestoneLvl) {
      return { text: 'Yes', color: 'text-bs-success' };
    }
    const needed = (milestoneLvl - bothTasksLevel).toFixed(1);
    return { text: `${needed} Levels Needed`, color: 'text-bs-warning' };
  };

  const lvl51Feasibility = getMilestoneFeasibilityText(51);
  const lvl75Feasibility = getMilestoneFeasibilityText(75);
  const lvl125Feasibility = getMilestoneFeasibilityText(125);
  const lvl150Feasibility = getMilestoneFeasibilityText(150);

  // Switch Season
  const handleSelectSeason = (seasonId: string) => {
    const selected = allSeasons.find((s) => s.id === seasonId) || SEASONS_LIST[0];
    const rem = calculateSeasonTelemetry(selected.startDate, selected.endDate).remainingDays;
    setEndDateOverride('');
    updateState({
      seasonId,
      expectedRemainingLogins: rem,
      plannedEasyTasks: rem,
      plannedMediumTasks: rem,
      completedChallengeIds: selected.id === 's25' ? [1, 2] : [],
    });
  };

  const handleToggleChallenge = (challengeId: number) => {
    const exists = state.completedChallengeIds.includes(challengeId);
    const updated = exists
      ? state.completedChallengeIds.filter((id) => id !== challengeId)
      : [...state.completedChallengeIds, challengeId];
    updateState({ completedChallengeIds: updated });
  };

  const handleCheckAllActive = () => {
    const now = new Date().getTime();
    const activeIds = activeSeason.challenges
      .filter((c) => {
        const unlock = new Date(c.unlockDate).getTime();
        const end = new Date(c.endDate).getTime();
        return now >= unlock && now <= end;
      })
      .map((c) => c.id);

    const merged = Array.from(new Set([...state.completedChallengeIds, ...activeIds]));
    updateState({ completedChallengeIds: merged });
  };

  const handleClearAllChallenges = () => {
    updateState({ completedChallengeIds: [] });
  };

  const handleResetState = () => {
    clearSavedState();
    setEndDateOverride('');
    setState(DEFAULT_USER_STATE);
  };

  const formatDateDisplay = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="bg-dark-bg text-dark-text min-h-screen w-full">
      {/* Centered Main Container matching gardnem6 / bootstrap py-4 */}
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        {/* Title & Introduction Header */}
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-dark-light">
              WT Battlepass Calculator
            </h1>

            {/* Quick Season Select Pill */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-dark-muted font-medium">Season:</span>
              <select
                value={state.seasonId}
                onChange={(e) => {
                  if (e.target.value === 'custom_modal') {
                    setIsCustomModalOpen(true);
                  } else {
                    handleSelectSeason(e.target.value);
                  }
                }}
                className="bs-input py-1 px-2.5 text-xs text-dark-light cursor-pointer font-medium"
              >
                {allSeasons.map((s) => (
                  <option key={s.id} value={s.id} className="bg-dark-card text-dark-light">
                    Season {s.number}: "{s.name}" {s.id === 's25' ? '(Current)' : ''}
                  </option>
                ))}
                <option value="custom_modal" className="bg-dark-card text-bs-warning font-semibold">
                  + Custom Season...
                </option>
              </select>
            </div>
          </div>

          <p className="text-dark-text text-sm sm:text-base mb-2">
            For Battlepass {activeSeason.number},{' '}
            <strong className="text-dark-light">"{activeSeason.name}"</strong> ending{' '}
            <strong className="text-dark-light">{formatDateDisplay(activeSeason.endDate)}</strong>.
          </p>

          <p className="text-dark-muted text-xs sm:text-sm mb-4">
            The numbers you need to enter in the "Battlepass Progress" card should be visible in-game on the Battlepass progress screen. If you have any feature suggestions, or you find a bug, I encourage you to open an issue on{' '}
            <a
              href="https://github.com/n0-0one/WT-Battlepass-Calculator/issues"
              target="_blank"
              rel="noreferrer"
              className="text-bs-info hover:underline inline-flex items-center gap-0.5"
            >
              GitHub <ExternalLink className="w-3 h-3" />
            </a>
            . I'll do my best to take care of issues.
          </p>

          {/* End Date Override Row (Matching gardnem6 exactly) */}
          <div className="flex flex-wrap items-end gap-3 mb-2">
            <div>
              <label className="block text-xs text-dark-light mb-1 font-medium">
                End date override
              </label>
              <input
                type="date"
                value={endDateOverride || activeSeason.endDate.slice(0, 10)}
                onChange={(e) => setEndDateOverride(e.target.value)}
                className="bs-input py-1 px-2.5 text-xs font-mono"
              />
            </div>
            {endDateOverride && (
              <button
                type="button"
                onClick={() => setEndDateOverride('')}
                className="bs-btn-outline-info text-xs py-1 px-3"
              >
                Reset Date
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsBackupModalOpen(true)}
              className="bs-btn-outline-secondary text-xs py-1 px-3 ml-auto flex items-center gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Data Sync / Backup</span>
            </button>
          </div>
          <p className="text-dark-muted text-xs mb-4">
            If the tool is out of date, you can put the new end date here.
          </p>
        </div>

        <hr className="border-dark-border mb-6" />

        {/* SECTION 1: Top Row (Days Remaining + In-Game Progress Card) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
          {/* Card: Battlepass Days Remaining */}
          <div className="md:col-span-4">
            <StatCard
              title="Battlepass Days Remaining"
              value={q}
              valueSize="xl"
              valueColor={q <= 14 ? 'text-bs-warning' : 'text-dark-light'}
              subtitle={`Ends ${formatDateDisplay(activeSeason.endDate)}`}
            />
          </div>

          {/* Card: Battlepass Progress (Inputs) */}
          <div className="md:col-span-8">
            <GardnemProgressCard
              state={state}
              onChange={updateState}
              seasonTotalDays={activeSeason.totalDays}
              onOpenChallenges={() => setActiveTab('challenges')}
            />
          </div>
        </div>

        {/* SECTION 2: Calculated Breakdown Row (3 Cards matching gardnem6) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard
            title="Levels From Logins"
            value={levelsFromLoginsSoFar}
            subtitle={`${currentLoginPoints} PP earned from ${state.loginsSoFar} logins`}
            valueColor="text-bs-info"
          />

          <StatCard
            title="Levels From Challenges"
            value={levelsFromChallengesSoFar}
            subtitle={`${currentChallengePoints} PP from ${state.completedChallengeIds.length} completed`}
            valueColor="text-bs-info"
          />

          <StatCard
            title="Levels From Daily and Special Tasks"
            value={levelsFromTasksSoFar}
            subtitle={`${currentTaskPoints} PP from dailies & special tasks so far`}
            valueColor="text-bs-info"
          />
        </div>

        <hr className="border-dark-border mb-6" />

        {/* SECTION 3: Sources of BP Levels (Reference Cards from gardnem6) */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-dark-light">Sources of BP Levels</h2>
            <button
              type="button"
              onClick={() => setActiveTab('logins')}
              className="text-xs text-bs-info hover:underline"
            >
              View 5 Login Tiers &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <StatCard
              title={`Total Possible Levels from ${activeSeason.totalDays} Logins`}
              value={(totalLoginsPossiblePoints / 10).toFixed(1)}
              subtitle="252 PP across all 91 cumulative days"
            />

            <StatCard
              title={`Total Possible Levels from ${activeSeason.totalDays} Easy Tasks`}
              value={((activeSeason.totalDays * 2) / 10).toFixed(1)}
              subtitle="2 PP per daily easy task (182 PP max)"
            />

            <StatCard
              title={`Total Possible Levels from ${activeSeason.totalDays} Medium Tasks`}
              value={((activeSeason.totalDays * 3) / 10).toFixed(1)}
              subtitle="3 PP per daily medium task (273 PP max)"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard
              title="Levels from 14 Challenges"
              value="42.0"
              subtitle="30 PP per standard challenge (420 PP total)"
            />

            <StatCard
              title="Levels from Completing All Challenges"
              value="4.5"
              subtitle="Master Challenge bonus (+45 PP for 14/14)"
            />

            <StatCard
              title="Levels Available When Buying Battlepass"
              value="15.0"
              subtitle="Improved Battle Pass (+150 PP / 2,500 GE)"
            />
          </div>
        </div>

        <hr className="border-dark-border mb-6" />

        {/* SECTION 4: Your BP Progress (Projection Cards from gardnem6) */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-dark-light mb-4">Your BP Progress</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <StatCard
              title="Your Possible Level With Only Logins"
              value={possibleLevelOnlyLogins}
              subtitle={`Current progress + remaining ${q} logins`}
              valueColor="text-dark-light"
            />

            <StatCard
              title="Your Possible Level With Logins and Easy Tasks"
              value={possibleLevelEasyTasks}
              subtitle={`Logins + ${q} remaining Easy Tasks (2 PP/day)`}
              valueColor="text-dark-light"
            />

            <StatCard
              title="Your Possible Level With Logins, Easy Tasks, and Medium Tasks"
              value={possibleLevelBothTasks}
              subtitle={`Logins + both daily tasks (5 PP/day)`}
              valueColor="text-bs-info"
            />
          </div>

          {/* Milestone Target Questions (Expanding gardnem6's Lvl 75 question) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Lvl 51 */}
            <StatCard
              title="Is It Possible To Get Level 51 (Free S-706)?"
              value={lvl51Feasibility.text}
              valueColor={lvl51Feasibility.color}
              valueSize="md"
              subtitle="Without challenges & special tasks"
            />

            {/* Lvl 75 */}
            <StatCard
              title="Is It Possible To Get the Level 75 Reward (Jagdpanther G2)?"
              value={lvl75Feasibility.text}
              valueColor={lvl75Feasibility.color}
              valueSize="md"
              subtitle="Without challenges & special tasks"
            />

            {/* Lvl 125 */}
            <StatCard
              title="Is It Possible To Get Level 125 (Coupon Upgrades)?"
              value={lvl125Feasibility.text}
              valueColor={lvl125Feasibility.color}
              valueSize="md"
              subtitle="Without challenges & special tasks"
            />

            {/* Lvl 150 */}
            <StatCard
              title="Is It Possible To Get Level 150 (Title: Steel Fury)?"
              value={lvl150Feasibility.text}
              valueColor={lvl150Feasibility.color}
              valueSize="md"
              subtitle="Without challenges & special tasks"
            />
          </div>
        </div>

        <hr className="border-dark-border mb-6" />

        {/* SECTION 5: Interactive Modules & Planning Tabs (Matching Gardnem6 dark card style) */}
        <div className="bs-card mb-8">
          <div className="bs-card-header flex flex-wrap items-center justify-between gap-2 p-0">
            <div className="flex flex-wrap">
              <button
                type="button"
                onClick={() => setActiveTab('planner')}
                className={`py-2.5 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === 'planner'
                    ? 'border-bs-info text-bs-info bg-dark-bg/40'
                    : 'border-transparent text-dark-muted hover:text-dark-light'
                }`}
              >
                <Target className="w-4 h-4" />
                <span>Road to Level 150 &amp; Milestone Solver</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('challenges')}
                className={`py-2.5 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === 'challenges'
                    ? 'border-bs-info text-bs-info bg-dark-bg/40'
                    : 'border-transparent text-dark-muted hover:text-dark-light'
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span>Season XXV Challenges ({state.completedChallengeIds.length}/14)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('roadmap')}
                className={`py-2.5 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === 'roadmap'
                    ? 'border-bs-info text-bs-info bg-dark-bg/40'
                    : 'border-transparent text-dark-muted hover:text-dark-light'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Rewards Roadmap (Lvl 1 - 150)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('logins')}
                className={`py-2.5 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === 'logins'
                    ? 'border-bs-info text-bs-info bg-dark-bg/40'
                    : 'border-transparent text-dark-muted hover:text-dark-light'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>5 Login Tiers Reference</span>
              </button>
            </div>

            <div className="px-3 py-1.5 text-xs text-dark-muted font-mono hidden sm:block">
              Target: Lvl {targetLevel} ({targetLevel * 10} PP)
            </div>
          </div>

          <div className="bs-card-body p-4 sm:p-6">
            {/* TAB 1: REVERSE MILESTONE & LEVEL 150 SOLVER */}
            {activeTab === 'planner' && (
              <div className="space-y-6">
                {/* Milestone Selector Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-dark-border">
                  <div>
                    <h3 className="text-base font-bold text-dark-light flex items-center gap-2">
                      <span>Select Target Milestone to Plan:</span>
                    </h3>
                    <p className="text-xs text-dark-muted">
                      Calculates the exact daily tasks, special tasks, or Golden Eagles needed
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {[
                      { lvl: 51, label: 'Lvl 51 (Free Vehicle)' },
                      { lvl: 75, label: 'Lvl 75 (Main Vehicle)' },
                      { lvl: 105, label: 'Lvl 105 (Upgrade)' },
                      { lvl: 125, label: 'Lvl 125 (Next BP)' },
                      { lvl: 150, label: 'Lvl 150 (Title)' },
                    ].map((m) => (
                      <button
                        key={m.lvl}
                        type="button"
                        onClick={() => updateState({ selectedTargetLevel: m.lvl })}
                        className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
                          targetLevel === m.lvl
                            ? 'bg-bs-info text-black font-bold'
                            : 'bg-dark-bg text-dark-text hover:bg-dark-border'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target Status Banner */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bs-card p-3.5 bg-dark-bg/50">
                    <span className="text-xs text-dark-muted block mb-1">Target Requirement</span>
                    <div className="text-2xl font-bold font-mono text-dark-light">
                      Level {actionPlan.targetLevel}
                    </div>
                    <span className="text-xs text-dark-muted">{actionPlan.targetPoints} Progress Points</span>
                  </div>

                  <div className="bs-card p-3.5 bg-dark-bg/50">
                    <span className="text-xs text-dark-muted block mb-1">Projected Outcome (With Logins &amp; Dailies)</span>
                    <div className="text-2xl font-bold font-mono text-bs-info">
                      Level {actionPlan.projectedLevel}
                    </div>
                    <span className="text-xs text-dark-muted">{actionPlan.projectedPoints} Projected Points</span>
                  </div>

                  <div className="bs-card p-3.5 bg-dark-bg/50">
                    <span className="text-xs text-dark-muted block mb-1">Status &amp; Deficit</span>
                    <div
                      className={`text-2xl font-bold font-mono ${
                        actionPlan.deficitPoints === 0 ? 'text-bs-success' : 'text-bs-warning'
                      }`}
                    >
                      {actionPlan.deficitPoints === 0
                        ? 'On Track (+ ' + actionPlan.surplusLevels + ' Lvl)'
                        : actionPlan.deficitLevels + ' Levels Short'}
                    </div>
                    <span className="text-xs text-dark-muted">
                      {actionPlan.deficitPoints === 0
                        ? `${actionPlan.surplusPoints} PP Surplus`
                        : `${actionPlan.deficitPoints} PP Gap`}
                    </span>
                  </div>
                </div>

                {/* Reverse Action Plan: Special Tasks & Warbonds */}
                {actionPlan.deficitPoints > 0 ? (
                  <div className="bs-card p-4 bg-dark-bg/30">
                    <h4 className="text-sm font-bold text-dark-light mb-2 flex items-center gap-2">
                      <Swords className="w-4 h-4 text-bs-warning" />
                      <span>How to bridge the {actionPlan.deficitPoints} PP ({actionPlan.deficitLevels} Levels) gap:</span>
                    </h4>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center my-3">
                      <div className="p-3 rounded bg-dark-card border border-dark-border">
                        <div className="text-xs text-dark-muted">Special Tasks Needed</div>
                        <div className="text-xl font-bold font-mono text-bs-warning mt-1">
                          {actionPlan.specialTasksNeeded}
                        </div>
                        <div className="text-[11px] text-dark-muted">@ 5 PP each</div>
                      </div>

                      <div className="p-3 rounded bg-dark-card border border-dark-border">
                        <div className="text-xs text-dark-muted">Pace Per Week</div>
                        <div className="text-xl font-bold font-mono text-dark-light mt-1">
                          ~{actionPlan.specialTasksPerWeek} / wk
                        </div>
                        <div className="text-[11px] text-dark-muted">({actionPlan.specialTasksPerDay} / day)</div>
                      </div>

                      <div className="p-3 rounded bg-dark-card border border-dark-border">
                        <div className="text-xs text-dark-muted">Warbonds Needed</div>
                        <div className="text-xl font-bold font-mono text-bs-info mt-1">
                          {formatNumber(actionPlan.warbondsNeeded)} WB
                        </div>
                        <div className="text-[11px] text-dark-muted">@ 30 WB per permit</div>
                      </div>

                      <div className="p-3 rounded bg-dark-card border border-dark-border">
                        <div className="text-xs text-dark-muted">GE Buyout Option</div>
                        <div className="text-xl font-bold font-mono text-amber-400 mt-1">
                          {formatNumber(actionPlan.geCostToReachTarget)} GE
                        </div>
                        <div className="text-[11px] text-dark-muted">
                          {actionPlan.isDay28UnlockPassed ? 'Available now' : `Unlocks in ${actionPlan.daysUntilDay28}d`}
                        </div>
                      </div>
                    </div>

                    {actionPlan.recommendedGEStrategy && (
                      <div className="p-3 rounded bg-dark-card border border-bs-success/50 text-xs text-dark-light flex items-center gap-2 mt-3">
                        <Sparkles className="w-4 h-4 text-bs-success shrink-0" />
                        <span>{actionPlan.recommendedGEStrategy}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded bg-dark-bg/50 border border-bs-success/40 text-xs text-bs-success">
                    🎉 Your current pace reaches Level {targetLevel}! You do not need additional Special Tasks or GE.
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: INTERACTIVE CHALLENGES */}
            {activeTab === 'challenges' && (
              <ChallengesTab
                season={activeSeason}
                state={state}
                onToggleChallenge={handleToggleChallenge}
                onCheckAllActive={handleCheckAllActive}
                onClearAll={handleClearAllChallenges}
              />
            )}

            {/* TAB 3: REWARDS ROADMAP */}
            {activeTab === 'roadmap' && (
              <RoadmapTab
                season={activeSeason}
                state={state}
                projectedLevel={parseFloat(possibleLevelBothTasks)}
              />
            )}

            {/* TAB 4: LOGIN TIERS TABLE */}
            {activeTab === 'logins' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-dark-light">
                    Official War Thunder Daily Login Tiers
                  </h3>
                  <span className="text-xs text-dark-muted font-mono">
                    Max: 252 PP (25.2 Levels across 91 days)
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-dark-border text-dark-muted">
                        <th className="py-2 px-3">Tier</th>
                        <th className="py-2 px-3">Logins Range</th>
                        <th className="py-2 px-3">Duration</th>
                        <th className="py-2 px-3">Points Per Day</th>
                        <th className="py-2 px-3">Max Points in Tier</th>
                        <th className="py-2 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-border text-dark-text">
                      {LOGIN_TIERS.map((tier) => {
                        const isCurrent =
                          state.loginsSoFar >= tier.minDay && state.loginsSoFar <= tier.maxDay;
                        const isCompleted = state.loginsSoFar > tier.maxDay;

                        return (
                          <tr
                            key={tier.tier}
                            className={
                              isCurrent
                                ? 'bg-bs-info/10 font-bold text-white'
                                : isCompleted
                                ? 'text-dark-muted'
                                : ''
                            }
                          >
                            <td className="py-2 px-3 font-bold text-bs-info">Tier {tier.tier}</td>
                            <td className="py-2 px-3">Day {tier.minDay} – {tier.maxDay}</td>
                            <td className="py-2 px-3">{tier.daysInTier} Days</td>
                            <td className="py-2 px-3 text-bs-warning">+{tier.pointsPerDay} PP / day</td>
                            <td className="py-2 px-3">{tier.maxPointsInTier} PP ({(tier.maxPointsInTier / 10).toFixed(1)} Lvl)</td>
                            <td className="py-2 px-3">
                              {isCurrent ? (
                                <span className="px-2 py-0.5 rounded bg-bs-info text-black font-bold text-[10px]">
                                  Active Tier Now
                                </span>
                              ) : isCompleted ? (
                                <span className="text-bs-success text-[10px]">Completed</span>
                              ) : (
                                <span className="text-dark-muted text-[10px]">Future</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer matching gardnem6: "Version 2.5.0 | Inspired by Gardnem6/wt-passhelper" */}
        <hr className="border-dark-border mb-4" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-dark-muted pb-8">
          <div className="flex items-center gap-2">
            <span>Version 2.5.0</span>
            <span>|</span>
            <span>Inspired by Gardnem6/wt-passhelper</span>
            <span>|</span>
            <a
              href="https://github.com/n0-0one/WT-Battlepass-Calculator"
              target="_blank"
              rel="noreferrer"
              className="text-bs-info hover:underline"
            >
              GitHub Repository
            </a>
          </div>

          <div>
            War Thunder Battle Pass Calculator &amp; Level 150 Grind Planner (Late 2026 Edition)
          </div>
        </div>
      </div>

      {/* Modals */}
      <CustomSeasonModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onSaveCustomSeason={(newSeason) => {
          setCustomSeasons((prev) => [newSeason, ...prev]);
          updateState({ seasonId: newSeason.id });
        }}
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
