import React from 'react';
import {
  Code2,
  Sparkles,
  History,
  Settings,
  MessageSquare,
  ShieldAlert,
  FolderCode
} from 'lucide-react';
import { DetectedLanguage } from '../types';

interface HeaderProps {
  detectedLanguage: DetectedLanguage;
  securityCount: number;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  onOpenChat: () => void;
  onOpenSamples: () => void;
  chatOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  detectedLanguage,
  securityCount,
  onOpenHistory,
  onOpenSettings,
  onOpenChat,
  onOpenSamples,
  chatOpen
}) => {
  return (
    <header
      id="app-header"
      className="bg-neutral-900 border-b border-neutral-800 text-neutral-100 px-3 sm:px-5 py-2.5 flex items-center justify-between sticky top-0 z-30 shadow-md select-none"
    >
      {/* Brand */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <Code2 className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-semibold text-sm sm:text-base tracking-tight text-neutral-100 flex items-center">
              AI Lua/Luau Deobfuscator
            </h1>
            <span
              className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border ${
                detectedLanguage === 'Luau'
                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                  : detectedLanguage === 'Lua'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-neutral-800 text-neutral-400 border-neutral-700'
              }`}
            >
              {detectedLanguage}
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 hidden sm:block">
            Static Inspection &amp; Safe AI Semantic Reconstruction
          </p>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center space-x-1.5 sm:space-x-2">
        <button
          id="btn-sample-scripts"
          onClick={onOpenSamples}
          className="h-9 px-2.5 sm:px-3 text-xs font-medium rounded-md bg-neutral-800/80 hover:bg-neutral-750 text-neutral-200 border border-neutral-700 flex items-center space-x-1.5 transition active:scale-95 cursor-pointer"
          title="Load Sample Scripts"
        >
          <FolderCode className="w-3.5 h-3.5 text-neutral-400" />
          <span className="hidden md:inline">Samples</span>
        </button>

        {securityCount > 0 && (
          <div
            id="badge-security-alert"
            className="flex items-center space-x-1 px-2.5 py-1 text-xs rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono"
            title={`${securityCount} potential security flags detected in static analysis`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{securityCount}</span>
          </div>
        )}

        <button
          id="btn-open-chat"
          onClick={onOpenChat}
          className={`h-9 px-2.5 sm:px-3 text-xs font-medium rounded-md border flex items-center space-x-1.5 transition active:scale-95 cursor-pointer ${
            chatOpen
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : 'bg-neutral-800/80 hover:bg-neutral-750 text-neutral-200 border-neutral-700'
          }`}
          title="Open AI Assistant Chat"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">AI Assistant</span>
        </button>

        <button
          id="btn-open-history"
          onClick={onOpenHistory}
          className="w-9 h-9 flex items-center justify-center text-xs rounded-md bg-neutral-800/80 hover:bg-neutral-750 text-neutral-300 border border-neutral-700 transition active:scale-95 cursor-pointer"
          title="Saved History"
        >
          <History className="w-4 h-4" />
        </button>

        <button
          id="btn-open-settings"
          onClick={onOpenSettings}
          className="w-9 h-9 flex items-center justify-center text-xs rounded-md bg-neutral-800/80 hover:bg-neutral-750 text-neutral-300 border border-neutral-700 transition active:scale-95 cursor-pointer"
          title="App Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
