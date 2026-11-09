import type { UserProgressState } from '../types/battlepass';

const STORAGE_KEY = 'wt_bp_calc_state_v1';

export const DEFAULT_USER_STATE: UserProgressState = {
  seasonId: 's25',
  mode: 'current',
  passType: 'standard',
  improvedPassBonusApplied: true,
  currentLevel: 25,
  pointsInCurrentLevel: 4,
  loginsSoFar: 20,
  expectedRemainingLogins: 71,
  plannedEasyTasks: 71,
  plannedMediumTasks: 71,
  plannedSpecialTasks: 10,
  completedChallengeIds: [1, 2],
  selectedTargetLevel: 150,
};

export function loadSavedState(): UserProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_USER_STATE;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_USER_STATE,
      ...parsed,
    };
  } catch (err) {
    console.error('Failed to load saved state from localStorage:', err);
    return DEFAULT_USER_STATE;
  }
}

export function saveState(state: UserProgressState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to persist state to localStorage:', err);
  }
}

export function clearSavedState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear state:', err);
  }
}

export function exportStateToJson(state: UserProgressState): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute(
    'download',
    `wt-bp-planner-backup-${state.seasonId}-${new Date().toISOString().slice(0, 10)}.json`
  );
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function parseImportedJson(jsonText: string): UserProgressState {
  const data = JSON.parse(jsonText);
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid JSON structure');
  }

  return {
    ...DEFAULT_USER_STATE,
    ...data,
  };
}
