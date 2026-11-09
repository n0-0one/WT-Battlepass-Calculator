import type {
  ActionPlan,
  FeasibilityStatus,
  LoginTierInfo,
  PointsBreakdown,
  SeasonData,
  UserProgressState,
} from '../types/battlepass';

export const POINTS_PER_LEVEL = 10;
export const IMPROVED_PASS_BONUS_POINTS = 150; // 15 Levels
export const STANDARD_PASS_GE_COST = 2000;
export const IMPROVED_PASS_GE_COST = 2500;
export const IMPROVED_PASS_UPGRADE_GE_COST = 500; // 2500 - 2000
export const SPECIAL_TASK_WB_COST = 30;
export const SPECIAL_TASK_POINTS = 5;
export const EASY_TASK_POINTS = 2;
export const MEDIUM_TASK_POINTS = 3;
export const CHALLENGE_POINTS = 30;
export const MASTER_CHALLENGE_BONUS_POINTS = 45;
export const TOTAL_CHALLENGES_COUNT = 14;
export const GE_PURCHASE_UNLOCK_DAY = 28;

/**
 * Login tiers specification:
 * Tier 1: Logins 1 - 21  -> 1 PP/day (21 days = 21 PP)
 * Tier 2: Logins 22 - 42 -> 2 PP/day (21 days = 42 PP)
 * Tier 3: Logins 43 - 63 -> 3 PP/day (21 days = 63 PP)
 * Tier 4: Logins 64 - 77 -> 4 PP/day (14 days = 56 PP)
 * Tier 5: Logins 78 - 91+ -> 5 PP/day (14 days = 70 PP in a 91-day season)
 */
export const LOGIN_TIERS: LoginTierInfo[] = [
  { tier: 1, minDay: 1, maxDay: 21, pointsPerDay: 1, daysInTier: 21, maxPointsInTier: 21 },
  { tier: 2, minDay: 22, maxDay: 42, pointsPerDay: 2, daysInTier: 21, maxPointsInTier: 42 },
  { tier: 3, minDay: 43, maxDay: 63, pointsPerDay: 3, daysInTier: 21, maxPointsInTier: 63 },
  { tier: 4, minDay: 64, maxDay: 77, pointsPerDay: 4, daysInTier: 14, maxPointsInTier: 56 },
  { tier: 5, minDay: 78, maxDay: 91, pointsPerDay: 5, daysInTier: 14, maxPointsInTier: 70 },
];

/**
 * Returns the Progress Points (PP) awarded for a specific 1-based login day index.
 * Note: Missing a calendar day does NOT reset this tier count; it only forfeits a potential login.
 */
export function getLoginPointsForDay(dayIndex: number): number {
  if (dayIndex <= 0) return 0;
  if (dayIndex <= 21) return 1;
  if (dayIndex <= 42) return 2;
  if (dayIndex <= 63) return 3;
  if (dayIndex <= 77) return 4;
  return 5; // 78 and beyond
}

/**
 * Returns the login tier info (tier 1..5) for a given 1-based login day index.
 */
export function getLoginTierInfoForDay(dayIndex: number): LoginTierInfo {
  if (dayIndex <= 21) return LOGIN_TIERS[0];
  if (dayIndex <= 42) return LOGIN_TIERS[1];
  if (dayIndex <= 63) return LOGIN_TIERS[2];
  if (dayIndex <= 77) return LOGIN_TIERS[3];
  return LOGIN_TIERS[4];
}

/**
 * Calculates the exact cumulative login points awarded across `additionalLogins`
 * starting after `startLoginCount` logins.
 */
export function calculateLoginPoints(startLoginCount: number, additionalLogins: number): number {
  if (additionalLogins <= 0) return 0;
  let totalPoints = 0;
  const start = Math.max(0, Math.floor(startLoginCount));
  const count = Math.max(0, Math.floor(additionalLogins));

  for (let i = 1; i <= count; i++) {
    const day = start + i;
    totalPoints += getLoginPointsForDay(day);
  }

  return totalPoints;
}

/**
 * Calculates the Golden Eagles (GE) cost to purchase a specific number of Battle Pass levels.
 */
export function calculateGECost(levelsToBuy: number, alreadyPurchasedLevels: number = 0): number {
  if (levelsToBuy <= 0) return 0;

  const start = Math.max(0, Math.floor(alreadyPurchasedLevels));
  const count = Math.max(0, Math.floor(levelsToBuy));
  let totalGE = 0;

  for (let i = 1; i <= count; i++) {
    const purchaseIndex = start + i;
    if (purchaseIndex <= 15) {
      totalGE += 75;
    } else if (purchaseIndex <= 25) {
      totalGE += 125;
    } else if (purchaseIndex <= 35) {
      totalGE += 175;
    } else {
      totalGE += 250;
    }
  }

  return totalGE;
}

/**
 * Helper to compute the total points from challenges.
 */
export function calculateChallengePoints(completedCount: number): { basePoints: number; bonusPoints: number; total: number } {
  const count = Math.min(TOTAL_CHALLENGES_COUNT, Math.max(0, Math.floor(completedCount)));
  const basePoints = count * CHALLENGE_POINTS;
  const bonusPoints = count === TOTAL_CHALLENGES_COUNT ? MASTER_CHALLENGE_BONUS_POINTS : 0;
  return {
    basePoints,
    bonusPoints,
    total: basePoints + bonusPoints,
  };
}

/**
 * Calculates current season telemetry (day index, days remaining, seconds remaining)
 * with daily rollover at 12:00:00 UTC.
 */
export function calculateSeasonTelemetry(startDateStr: string, endDateStr: string, now: Date = new Date()) {
  const start = new Date(startDateStr).getTime();
  const end = new Date(endDateStr).getTime();
  const current = now.getTime();

  const totalDurationMs = end - start;
  const elapsedMs = Math.max(0, Math.min(totalDurationMs, current - start));
  const remainingMs = Math.max(0, end - current);

  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const totalDays = Math.ceil(totalDurationMs / MS_PER_DAY);
  const currentDay = Math.min(totalDays, Math.floor(elapsedMs / MS_PER_DAY) + 1);
  const remainingDays = Math.max(0, Math.ceil(remainingMs / MS_PER_DAY));

  const remainingSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  const remainingHours = Math.floor(remainingSeconds / 3600);
  const remainingMins = Math.floor((remainingSeconds % 3600) / 60);
  const remainingSecs = remainingSeconds % 60;

  const percentTimeElapsed = totalDurationMs > 0 ? (elapsedMs / totalDurationMs) * 100 : 0;
  const isExpired = current >= end;
  const isStarted = current >= start;

  // Day 28 GE unlock check
  const day28Ms = start + 28 * MS_PER_DAY;
  const isDay28Passed = current >= day28Ms;
  const daysUntilDay28 = Math.max(0, Math.ceil((day28Ms - current) / MS_PER_DAY));

  return {
    totalDays,
    currentDay,
    remainingDays,
    remainingHours,
    remainingMins,
    remainingSecs,
    percentTimeElapsed,
    isExpired,
    isStarted,
    isDay28Passed,
    daysUntilDay28,
  };
}

/**
 * Forward Projection Engine
 */
export function calculateProjection(state: UserProgressState): PointsBreakdown {
  const {
    mode,
    passType,
    improvedPassBonusApplied,
    currentLevel,
    pointsInCurrentLevel,
    loginsSoFar,
    expectedRemainingLogins,
    plannedEasyTasks,
    plannedMediumTasks,
    plannedSpecialTasks,
    completedChallengeIds,
  } = state;

  let startingPoints = 0;
  let improvedPassBonusPoints = 0;
  let loginPoints = 0;

  if (mode === 'current') {
    startingPoints = Math.max(0, currentLevel * POINTS_PER_LEVEL + pointsInCurrentLevel);

    if (passType === 'improved' && !improvedPassBonusApplied) {
      improvedPassBonusPoints = IMPROVED_PASS_BONUS_POINTS;
    }

    loginPoints = calculateLoginPoints(loginsSoFar, expectedRemainingLogins);
  } else {
    if (passType === 'improved') {
      improvedPassBonusPoints = IMPROVED_PASS_BONUS_POINTS;
    }
    loginPoints = calculateLoginPoints(0, expectedRemainingLogins);
  }

  const validEasyTasks = Math.max(0, plannedEasyTasks);
  const validMediumTasks = Math.min(validEasyTasks, Math.max(0, plannedMediumTasks));
  const easyTaskPoints = validEasyTasks * EASY_TASK_POINTS;
  const mediumTaskPoints = validMediumTasks * MEDIUM_TASK_POINTS;
  const dailyTasksTotalPoints = easyTaskPoints + mediumTaskPoints;

  const specialTaskPoints = Math.max(0, plannedSpecialTasks) * SPECIAL_TASK_POINTS;

  const completedCount = completedChallengeIds.length;
  const { basePoints: challengePoints, bonusPoints: masterBonusPoints, total: challengesTotalPoints } =
    calculateChallengePoints(completedCount);

  const totalPoints =
    startingPoints +
    improvedPassBonusPoints +
    loginPoints +
    dailyTasksTotalPoints +
    specialTaskPoints +
    challengesTotalPoints;

  const finalLevel = Math.floor(totalPoints / POINTS_PER_LEVEL);
  const leftoverPoints = totalPoints % POINTS_PER_LEVEL;

  return {
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
  };
}

/**
 * Reverse Road to Level 150 Action Planner
 */
export function calculateRoadToMilestonePlan(
  state: UserProgressState,
  season: SeasonData,
  now: Date = new Date()
): ActionPlan {
  const telemetry = calculateSeasonTelemetry(season.startDate, season.endDate, now);
  const projection = calculateProjection(state);

  const targetLevel = state.selectedTargetLevel || 150;
  const targetPoints = targetLevel * POINTS_PER_LEVEL;
  const currentPoints =
    state.mode === 'current'
      ? state.currentLevel * POINTS_PER_LEVEL + state.pointsInCurrentLevel
      : 0;

  const projectedPoints = projection.totalPoints;
  const projectedLevel = projection.finalLevel;

  const deficitPoints = Math.max(0, targetPoints - projectedPoints);
  const surplusPoints = Math.max(0, projectedPoints - targetPoints);
  const deficitLevels = Math.ceil(deficitPoints / POINTS_PER_LEVEL);
  const surplusLevels = Math.floor(surplusPoints / POINTS_PER_LEVEL);

  const remainingDays = telemetry.remainingDays;

  const maxRemainingLogins = state.mode === 'current'
    ? calculateLoginPoints(state.loginsSoFar, remainingDays)
    : calculateLoginPoints(0, season.totalDays);

  const maxRemainingDailyTaskPoints = (state.mode === 'current' ? remainingDays : season.totalDays) * (EASY_TASK_POINTS + MEDIUM_TASK_POINTS);

  const uncompletedCount = TOTAL_CHALLENGES_COUNT - state.completedChallengeIds.length;
  const remainingChallengePoints =
    uncompletedCount > 0
      ? uncompletedCount * CHALLENGE_POINTS + MASTER_CHALLENGE_BONUS_POINTS
      : 0;

  const unappliedImprovedBonus =
    state.passType === 'improved' && (!state.improvedPassBonusApplied || state.mode === 'full')
      ? IMPROVED_PASS_BONUS_POINTS
      : 0;

  const maxPossibleFreePointsRemaining =
    maxRemainingLogins +
    maxRemainingDailyTaskPoints +
    remainingChallengePoints +
    unappliedImprovedBonus;

  const maxPossibleFinalPoints = currentPoints + maxPossibleFreePointsRemaining;
  const maxPossibleFinalLevel = Math.floor(maxPossibleFinalPoints / POINTS_PER_LEVEL);

  let status: FeasibilityStatus = 'on_track';

  if (projectedPoints >= targetPoints) {
    status = 'on_track';
  } else if (maxPossibleFinalPoints >= targetPoints) {
    status = 'achievable_grind';
  } else {
    if (remainingDays <= 0 || maxPossibleFinalPoints + remainingDays * SPECIAL_TASK_POINTS * 3 < targetPoints) {
      status = 'impossible_without_ge';
    } else {
      status = 'achievable_grind';
    }
  }

  const pointsShortOfTarget = Math.max(0, targetPoints - projectedPoints);
  const specialTasksNeeded = Math.ceil(pointsShortOfTarget / SPECIAL_TASK_POINTS);

  const safeDays = Math.max(1, remainingDays);
  const specialTasksPerDay = Number((specialTasksNeeded / safeDays).toFixed(2));
  const specialTasksPerWeek = Number(((specialTasksNeeded / safeDays) * 7).toFixed(1));
  const warbondsNeeded = specialTasksNeeded * SPECIAL_TASK_WB_COST;
  const mediumTasksNeededForUnlocks = specialTasksNeeded;

  const levelsToBuyWithGE = deficitLevels;
  const geCostToReachTarget = calculateGECost(levelsToBuyWithGE);

  let improvedPassUpgradeSavingsGE = 0;
  let recommendedGEStrategy: string | undefined;

  if (state.passType === 'standard') {
    if (levelsToBuyWithGE >= 15) {
      improvedPassUpgradeSavingsGE = 625;
      recommendedGEStrategy = `Upgrade to Improved Battle Pass (+15 levels for 500 GE) instead of buying levels directly, saving 625 Golden Eagles!`;
    } else if (levelsToBuyWithGE >= 7) {
      improvedPassUpgradeSavingsGE = calculateGECost(levelsToBuyWithGE) - IMPROVED_PASS_UPGRADE_GE_COST;
      recommendedGEStrategy = `Upgrading to Improved Battle Pass costs 500 GE and gives 15 levels—cheaper than buying ${levelsToBuyWithGE} levels directly!`;
    }
  } else if (state.passType === 'free') {
    if (levelsToBuyWithGE >= 7) {
      recommendedGEStrategy = `When purchasing the Battle Pass, choose the Improved Battle Pass (2,500 GE) to gain +15 levels for only 500 GE extra (33.3 GE/level)!`;
    }
  }

  return {
    targetLevel,
    targetPoints,
    currentPoints,
    projectedPoints,
    projectedLevel,
    deficitPoints,
    surplusPoints,
    deficitLevels,
    surplusLevels,
    status,
    maxPossibleFreePointsRemaining,
    maxPossibleFinalPoints,
    maxPossibleFinalLevel,
    specialTasksNeeded,
    specialTasksPerDay,
    specialTasksPerWeek,
    warbondsNeeded,
    mediumTasksNeededForUnlocks,
    geCostToReachTarget,
    levelsToBuyWithGE,
    isDay28UnlockPassed: telemetry.isDay28Passed,
    daysUntilDay28: telemetry.daysUntilDay28,
    improvedPassUpgradeSavingsGE,
    recommendedGEStrategy,
  };
}
