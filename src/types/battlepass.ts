export type PassType = 'free' | 'standard' | 'improved';

export type CalculationMode = 'current' | 'full'; // 'current' = Mode A (from in-game level), 'full' = Mode B (full season from day 1)

export interface SeasonChallenge {
  id: number;
  name: string;
  description: string;
  points: number; // 30 PP
  unlockDate: string; // ISO date string
  endDate: string; // ISO date string
  type: 'weekly' | 'level';
  levelRequirement?: number; // e.g. 21, 40, 60
}

export interface SeasonMilestone {
  level: number;
  points: number; // level * 10
  name: string;
  vehicleOrReward: string;
  isFree: boolean;
  type: 'vehicle' | 'upgrade' | 'title' | 'trophy' | 'premium' | 'warbonds' | 'cosmetic' | 'challenge_unlock';
  description?: string;
  highlight?: boolean; // prominent milestone like 51, 75, 105, 125, 150
}

export interface SeasonData {
  id: string; // e.g. 's25'
  number: number;
  name: string; // "Steel Fury"
  theme: string;
  startDate: string; // '2026-10-21T12:00:00Z'
  endDate: string; // '2027-01-20T12:00:00Z'
  totalDays: number; // 91
  challenges: SeasonChallenge[];
  milestones: SeasonMilestone[];
  isCustom?: boolean;
}

export interface UserProgressState {
  seasonId: string;
  mode: CalculationMode;
  passType: PassType;
  improvedPassBonusApplied: boolean; // In Mode A: whether +15 levels (150 PP) are already included in current in-game level

  // Mode A Inputs
  currentLevel: number;
  pointsInCurrentLevel: number; // 0-9
  loginsSoFar: number; // Total cumulative daily logins up to today

  // Future Pace Inputs (Remaining period)
  expectedRemainingLogins: number;
  plannedEasyTasks: number; // Easy daily tasks (2 PP each)
  plannedMediumTasks: number; // Medium daily tasks (3 PP each, <= easy tasks)
  plannedSpecialTasks: number; // Special tasks (5 PP each, 30 WB each)

  // Challenges
  completedChallengeIds: number[]; // Array of IDs 1-14 checked off

  // Target
  selectedTargetLevel: number; // 51, 75, 105, 125, 150 or custom

  // Custom Season Config (if mode is custom)
  customSeason?: SeasonData;
}

export interface LoginTierInfo {
  tier: number;
  minDay: number;
  maxDay: number;
  pointsPerDay: number;
  daysInTier: number;
  maxPointsInTier: number;
}

export interface PointsBreakdown {
  startingPoints: number;
  improvedPassBonusPoints: number;
  loginPoints: number;
  easyTaskPoints: number;
  mediumTaskPoints: number;
  dailyTasksTotalPoints: number;
  specialTaskPoints: number;
  challengePoints: number;
  masterBonusPoints: number;
  challengesTotalPoints: number;
  totalPoints: number;
  finalLevel: number;
  leftoverPoints: number;
}

export type FeasibilityStatus = 'on_track' | 'achievable_grind' | 'impossible_without_ge';

export interface MilestoneRoadmapItem extends SeasonMilestone {
  isUnlocked: boolean;
  isProjected: boolean;
  isMissed: boolean;
}

export interface ActionPlan {
  targetLevel: number;
  targetPoints: number;
  currentPoints: number;
  projectedPoints: number;
  projectedLevel: number;
  deficitPoints: number; // max(0, target - projected)
  surplusPoints: number; // max(0, projected - target)
  deficitLevels: number;
  surplusLevels: number;
  status: FeasibilityStatus;

  // Analysis
  maxPossibleFreePointsRemaining: number;
  maxPossibleFinalPoints: number;
  maxPossibleFinalLevel: number;

  // Grind Requirements (to reach target without GE)
  specialTasksNeeded: number;
  specialTasksPerDay: number;
  specialTasksPerWeek: number;
  warbondsNeeded: number;
  mediumTasksNeededForUnlocks: number;

  // GE Buyout Option
  geCostToReachTarget: number;
  levelsToBuyWithGE: number;
  isDay28UnlockPassed: boolean;
  daysUntilDay28: number;
  improvedPassUpgradeSavingsGE: number; // If applicable
  recommendedGEStrategy?: string;
}
