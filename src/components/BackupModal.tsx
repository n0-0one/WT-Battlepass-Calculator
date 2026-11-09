import React, { useState } from 'react';
import {
  AlertTriangle,
  Check,
  Download,
  RotateCcw,
  SlidersHorizontal,
  Upload,
  X,
} from 'lucide-react';
import type { UserProgressState } from '../types/battlepass';
import { exportStateToJson, parseImportedJson } from '../utils/storage';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: UserProgressState;
  onImportState: (newState: UserProgressState) => void;
  onResetState: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  state,
  onImportState,
  onResetState,
}) => {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    exportStateToJson(state);
    setSuccess('Backup JSON downloaded successfully!');
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const imported = parseImportedJson(text);
        onImportState(imported);
        setSuccess('Settings & progress successfully restored from file!');
        setTimeout(() => {
          setSuccess(null);
          onClose();
        }, 1200);
      } catch (err: any) {
        setError(err.message || 'Failed to parse JSON file');
      }
    };
    reader.readAsText(file);
  };

  const handleTextImport = () => {
    try {
      if (!jsonText.trim()) {
        setError('Please paste JSON text before importing.');
        return;
      }
      const imported = parseImportedJson(jsonText);
      onImportState(imported);
      setSuccess('Settings restored from pasted JSON!');
      setTimeout(() => {
        setSuccess(null);
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Invalid JSON format');
    }
  };

  const handleConfirmReset = () => {
    if (window.confirm('Are you sure you want to reset all Battle Pass inputs and progress to default settings?')) {
      onResetState();
      setSuccess('State reset to default!');
      setTimeout(() => {
        setSuccess(null);
        onClose();
      }, 800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-wt-card border border-wt-border rounded-xl max-w-lg w-full p-6 shadow-tactical relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded bg-amber-500/10 text-wt-gold border border-wt-gold/30">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Data Management &amp; Session Sync</h3>
            <p className="text-xs text-slate-400">
              Save your progress to a file, restore on another device, or reset
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded bg-rose-950/60 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <div className="space-y-4">
          {/* Section 1: Export JSON */}
          <div className="p-3.5 rounded-lg bg-wt-surface/80 border border-wt-border flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white font-mono uppercase">
                Export Progress to JSON
              </div>
              <p className="text-[11px] text-slate-400">
                Download a clean JSON snapshot of all your settings, checked challenges, and levels.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExport}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 shadow-glow-gold shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
          </div>

          {/* Section 2: Import from File */}
          <div className="p-3.5 rounded-lg bg-wt-surface/80 border border-wt-border">
            <div className="text-xs font-bold text-white font-mono uppercase mb-1">
              Import from JSON File
            </div>
            <p className="text-[11px] text-slate-400 mb-2.5">
              Select a previously exported `.json` backup file.
            </p>
            <label className="flex items-center justify-center gap-2 p-2.5 rounded border border-dashed border-wt-border hover:border-wt-gold bg-wt-card cursor-pointer transition-colors text-xs text-slate-300">
              <Upload className="w-4 h-4 text-wt-gold" />
              <span>Choose Backup File...</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Section 3: Paste JSON text */}
          <div className="p-3.5 rounded-lg bg-wt-surface/80 border border-wt-border">
            <div className="text-xs font-bold text-white font-mono uppercase mb-1">
              Paste JSON Data Manually
            </div>
            <textarea
              rows={3}
              value={jsonText}
              onChange={(e) => {
                setJsonText(e.target.value);
                setError(null);
              }}
              placeholder='Paste exported JSON here...'
              className="w-full bg-wt-card border border-wt-border rounded p-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-wt-gold"
            />
            {jsonText.trim() && (
              <button
                type="button"
                onClick={handleTextImport}
                className="mt-2 w-full py-1.5 rounded bg-wt-card hover:bg-slate-700 border border-wt-border text-xs text-slate-200 font-medium"
              >
                Apply Pasted Data
              </button>
            )}
          </div>

          {/* Section 4: Reset Season Data */}
          <div className="p-3.5 rounded-lg bg-rose-950/20 border border-rose-900/40 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-rose-300 font-mono uppercase">
                Reset Season Data
              </div>
              <p className="text-[11px] text-slate-400">
                Wipe all cached progress in localStorage and restore default Season XXV baseline.
              </p>
            </div>
            <button
              type="button"
              onClick={handleConfirmReset}
              className="px-3 py-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-rose-200 font-semibold text-xs flex items-center gap-1.5 border border-rose-700 shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
