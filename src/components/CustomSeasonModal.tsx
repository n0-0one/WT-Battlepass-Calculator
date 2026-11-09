import React, { useState } from 'react';
import { Check, Sparkles, X } from 'lucide-react';
import type { SeasonData } from '../types/battlepass';
import { SEASON_25_CHALLENGES, SEASON_25_MILESTONES } from '../data/seasons';

interface CustomSeasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCustomSeason: (season: SeasonData) => void;
}

export const CustomSeasonModal: React.FC<CustomSeasonModalProps> = ({
  isOpen,
  onClose,
  onSaveCustomSeason,
}) => {
  const [name, setName] = useState('Future Custom Season');
  const [theme, setTheme] = useState('Modern Armored Warfare');
  const [number, setNumber] = useState(26);
  const [durationDays, setDurationDays] = useState(91);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().slice(0, 10) + 'T12:00:00Z'
  );

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const start = new Date(startDate).getTime();
    const end = new Date(start + durationDays * 24 * 60 * 60 * 1000).toISOString();

    const customSeason: SeasonData = {
      id: `custom_${Date.now()}`,
      number: number || 26,
      name: name || 'Custom Season',
      theme: theme || 'Custom War Thunder Theme',
      startDate: new Date(startDate).toISOString(),
      endDate: end,
      totalDays: durationDays,
      challenges: SEASON_25_CHALLENGES.map((c) => ({
        ...c,
        unlockDate: new Date(startDate).toISOString(),
        endDate: end,
      })),
      milestones: SEASON_25_MILESTONES,
      isCustom: true,
    };

    onSaveCustomSeason(customSeason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-wt-card border border-wt-border rounded-xl max-w-md w-full p-6 shadow-tactical relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded bg-amber-500/10 text-wt-gold border border-wt-gold/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Create Custom Battle Pass Season</h3>
            <p className="text-xs text-slate-400">Configure parameters for future or custom seasons</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase font-mono mb-1">
              Season Number &amp; Name
            </label>
            <div className="grid grid-cols-4 gap-2">
              <input
                type="number"
                min="1"
                max="99"
                value={number}
                onChange={(e) => setNumber(parseInt(e.target.value) || 26)}
                className="col-span-1 bg-wt-surface border border-wt-border focus:border-wt-gold rounded px-3 py-1.5 text-xs text-white font-mono"
                placeholder="No."
              />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3 bg-wt-surface border border-wt-border focus:border-wt-gold rounded px-3 py-1.5 text-xs text-white"
                placeholder="Season Title (e.g. Iron Vengeance)"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase font-mono mb-1">
              Season Theme Description
            </label>
            <input
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full bg-wt-surface border border-wt-border focus:border-wt-gold rounded px-3 py-1.5 text-xs text-white"
              placeholder="e.g. Soviet Naval & Aviation Special"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase font-mono mb-1">
                Start Date (UTC)
              </label>
              <input
                type="datetime-local"
                value={startDate.slice(0, 16)}
                onChange={(e) => setStartDate(e.target.value + ':00Z')}
                className="w-full bg-wt-surface border border-wt-border focus:border-wt-gold rounded px-2.5 py-1.5 text-xs text-white font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase font-mono mb-1">
                Season Duration (Days)
              </label>
              <input
                type="number"
                min="14"
                max="180"
                value={durationDays}
                onChange={(e) => setDurationDays(parseInt(e.target.value) || 91)}
                className="w-full bg-wt-surface border border-wt-border focus:border-wt-gold rounded px-3 py-1.5 text-xs text-white font-mono"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-wt-border flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded bg-wt-surface hover:bg-slate-700 text-xs font-medium text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-glow-gold flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save &amp; Activate Custom Season</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
