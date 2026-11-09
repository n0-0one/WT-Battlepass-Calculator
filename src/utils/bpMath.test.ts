import { describe, it, expect } from 'vitest';
import {
  calculateLoginPoints,
  getLoginPointsForDay,
  calculateGECost,
  calculateChallengePoints,
  calculateProjection,
  calculateRoadToMilestonePlan,
} from './bpMath';
import type { SeasonData, UserProgressState } from '../types/battlepass';

describe('War Thunder Battle Pass Mathematical Engine', () => {
  describe('Daily Login Points Calculation', () => {
    it('returns exact points for day milestones', () => {
      expect(getLoginPointsForDay(1)).toBe(1);
      expect(getLoginPointsForDay(21)).toBe(1);
      expect(getLoginPointsForDay(22)).toBe(2);
      expect(getLoginPointsForDay(42)).toBe(2);
      expect(getLoginPointsForDay(43)).toBe(3);
      expect(getLoginPointsForDay(63)).toBe(3);
      expect(getLoginPointsForDay(64)).toBe(4);
      expect(getLoginPointsForDay(77)).toBe(4);
      expect(getLoginPointsForDay(78)).toBe(5);
      expect(getLoginPointsForDay(91)).toBe(5);
      expect(getLoginPointsForDay(100)).toBe(5);
    });

    it('calculates exact 252 PP for 91 total logins', () => {
      const total = calculateLoginPoints(0, 91);
      expect(total).toBe(252); // Exactly 25.2 Battle Pass Levels
    });

    it('calculates exact points per bracket', () => {
      expect(calculateLoginPoints(0, 21)).toBe(21); // 21 * 1
      expect(calculateLoginPoints(21, 21)).toBe(42); // 21 * 2
      expect(calculateLoginPoints(42, 21)).toBe(63); // 21 * 3
      expect(calculateLoginPoints(63, 14)).toBe(56); // 14 * 4
      expect(calculateLoginPoints(77, 14)).toBe(70); // 14 * 5
    });

    it('correctly handles boundary transition across day 21/22', () => {
      expect(calculateLoginPoints(20, 3)).toBe(1 + 2 + 2);
    });

    it('returns 0 points for 0 additional logins', () => {
      expect(calculateLoginPoints(50, 0)).toBe(0);
      expect(calculateLoginPoints(0, 0)).toBe(0);
    });
  });

  describe('Golden Eagles (GE) Level Buyout Formula', () => {
    it('calculates 75 GE per level for first 15 levels', () => {
      expect(calculateGECost(1)).toBe(75);
      expect(calculateGECost(10)).toBe(750);
      expect(calculateGECost(15)).toBe(1125);
    });

    it('calculates 125 GE per level for levels 16 to 25', () => {
      expect(calculateGECost(16)).toBe(1125 + 125);
      expect(calculateGECost(25)).toBe(1125 + 10 * 125); // 2375
    });

    it('calculates 175 GE per level for levels 26 to 35', () => {
      expect(calculateGECost(26)).toBe(2375 + 175);
      expect(calculateGECost(35)).toBe(2375 + 10 * 175); // 4125
    });

    it('calculates 250 GE per level for levels 36+', () => {
      expect(calculateGECost(36)).toBe(4125 + 250); // 4375
      expect(calculateGECost(40)).toBe(4125 + 5 * 250); // 5375
    });

    it('supports offset if levels were already purchased', () => {
      expect(calculateGECost(1, 15)).toBe(125);
    });
  });

  describe('Season Challenges Calculation', () => {
    it('awards 30 PP per challenge without bonus when < 14', () => {
      const res13 = calculateChallengePoints(13);
      expect(res13.basePoints).toBe(390);
      expect(res13.bonusPoints).toBe(0);
      expect(res13.total).toBe(390);
    });

    it('awards +45 PP Master Challenge bonus when exactly 14 completed', () => {
      const res14 = calculateChallengePoints(14);
      expect(res14.basePoints).toBe(420);
      expect(res14.bonusPoints).toBe(45);
      expect(res14.total).toBe(465); // 46.5 Levels
    });
  });

  describe('Forward Projection Engine', () => {
    it('accurately projects in Mode A (from current in-game level)', () => {
      const state: UserProgressState = {
        seasonId: 's25',
        mode: 'current',
        passType: 'standard',
        improvedPassBonusApplied: true,
        currentLevel: 45,
        pointsInCurrentLevel: 3,
        loginsSoFar: 20,
        expectedRemainingLogins: 10,
        plannedEasyTasks: 10,
        plannedMediumTasks: 10,
        plannedSpecialTasks: 4,
        completedChallengeIds: [1, 2, 3],
        selectedTargetLevel: 150,
      };

      const result = calculateProjection(state);

      expect(result.startingPoints).toBe(453);
      expect(result.loginPoints).toBe(19);
      expect(result.dailyTasksTotalPoints).toBe(50);
      expect(result.specialTaskPoints).toBe(20);
      expect(result.challengesTotalPoints).toBe(90);

      expect(result.totalPoints).toBe(632);
      expect(result.finalLevel).toBe(63);
      expect(result.leftoverPoints).toBe(2);
    });

    it('enforces Medium Tasks <= Easy Tasks', () => {
      const state: UserProgressState = {
        seasonId: 's25',
        mode: 'full',
        passType: 'free',
        improvedPassBonusApplied: false,
        currentLevel: 0,
        pointsInCurrentLevel: 0,
        loginsSoFar: 0,
        expectedRemainingLogins: 10,
        plannedEasyTasks: 5,
        plannedMediumTasks: 10,
        plannedSpecialTasks: 0,
        completedChallengeIds: [],
        selectedTargetLevel: 51,
      };

      const result = calculateProjection(state);
      expect(result.mediumTaskPoints).toBe(15);
      expect(result.dailyTasksTotalPoints).toBe(25);
    });

    it('adds +150 PP for Improved Battle Pass when not yet applied in Mode A', () => {
      const state: UserProgressState = {
        seasonId: 's25',
        mode: 'current',
        passType: 'improved',
        improvedPassBonusApplied: false,
        currentLevel: 10,
        pointsInCurrentLevel: 0,
        loginsSoFar: 10,
        expectedRemainingLogins: 0,
        plannedEasyTasks: 0,
        plannedMediumTasks: 0,
        plannedSpecialTasks: 0,
        completedChallengeIds: [],
        selectedTargetLevel: 75,
      };

      const result = calculateProjection(state);
      expect(result.startingPoints).toBe(100);
      expect(result.improvedPassBonusPoints).toBe(150);
      expect(result.totalPoints).toBe(250);
      expect(result.finalLevel).toBe(25);
    });
  });

  describe('Reverse Road to Level 150 Action Planner', () => {
    const mockSeason: SeasonData = {
      id: 's25',
      number: 25,
      name: 'Steel Fury',
      theme: 'German Ground & Coastal Forces',
      startDate: '2026-10-21T12:00:00Z',
      endDate: '2027-01-20T12:00:00Z',
      totalDays: 91,
      challenges: [],
      milestones: [],
    };

    it('marks as on_track when projected level meets or exceeds target', () => {
      const state: UserProgressState = {
        seasonId: 's25',
        mode: 'current',
        passType: 'improved',
        improvedPassBonusApplied: true,
        currentLevel: 140,
        pointsInCurrentLevel: 5,
        loginsSoFar: 50,
        expectedRemainingLogins: 20,
        plannedEasyTasks: 20,
        plannedMediumTasks: 20,
        plannedSpecialTasks: 5,
        completedChallengeIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
        selectedTargetLevel: 150,
      };

      const plan = calculateRoadToMilestonePlan(state, mockSeason, new Date('2026-11-09T12:00:00Z'));
      expect(plan.status).toBe('on_track');
      expect(plan.deficitPoints).toBe(0);
      expect(plan.surplusPoints).toBeGreaterThan(0);
      expect(plan.specialTasksNeeded).toBe(0);
    });

    it('calculates exact Special Tasks and Warbonds required to bridge deficit', () => {
      const state: UserProgressState = {
        seasonId: 's25',
        mode: 'current',
        passType: 'standard',
        improvedPassBonusApplied: true,
        currentLevel: 140,
        pointsInCurrentLevel: 0,
        loginsSoFar: 70,
        expectedRemainingLogins: 0,
        plannedEasyTasks: 0,
        plannedMediumTasks: 0,
        plannedSpecialTasks: 0,
        completedChallengeIds: [],
        selectedTargetLevel: 150,
      };

      const plan = calculateRoadToMilestonePlan(state, mockSeason, new Date('2026-11-09T12:00:00Z'));
      expect(plan.deficitPoints).toBe(100);
      expect(plan.specialTasksNeeded).toBe(20);
      expect(plan.warbondsNeeded).toBe(20 * 30);
    });
  });
});
