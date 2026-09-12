import React from 'react';
import {
  Sparkles,
  Activity,
  FileSearch,
  Languages,
  Columns2,
  Download,
  Loader2,
  ChevronDown
} from 'lucide-react';
import { AnalysisMode } from '../types';

interface ToolbarProps {
  onAnalyze: () => void;
  onDeobfuscate: () => void;
  onExplain: () => void;
  onTranslate: () => void;
  onCompare: () => void;
  onExport: () => void;
  mode: AnalysisMode;
  onChangeMode: (mode: AnalysisMode) => void;
  isLoading: boolean;
  loadingLabel: string;
  hasOutput: boolean;
  hasInput: boolean;
}

const MODES: { id: AnalysisMode; label: string; desc: string }[] = [
  { id: 'AUTO', label: 'AUTO', desc: 'Auto-select appropriate analysis techniques' },
  { id: 'DEEP', label: 'DEEP', desc: 'Use all available static-analysis passes' },
  { id: 'RECONSTRUCTION', label: 'AI RECONSTRUCT', desc: 'Readable equivalent Lua/Luau' },
  { id: 'EXPLAIN', label: 'EXPLAIN', desc: 'Explain script without rewriting' },
  { id: 'TRANSLATE', label: 'TRANSLATE', desc: 'Convert into clean typed Luau' },
  { id: 'SECURITY', label: 'SECURITY', desc: 'Identify suspicious/unusual constructs' }
];

export const Toolbar: React.FC<ToolbarProps> = ({
  onAnalyze,
  onDeobfuscate,
  onExplain,
  onTranslate,
  onCompare,
  onExport,
  mode,
  onChangeMode,
  isLoading,
  loadingLabel,
  hasOutput,
  hasInput
}) => {
  return (
    <div
      id="bottom-toolbar"
      className="bg-neutral-900 border-t border-neutral-800 p-2.5 sm:p-3 sticky bottom-0 z-30 shadow-2xl backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
        {/* Left: Mode Selection */}
        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto scrollbar-none pb-1 sm:pb-0">
          <span className="text-[11px] font-mono text-neutral-500 uppercase shrink-0">
            MODE:
          </span>
          <div className="flex items-center space-x-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800 shrink-0">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => onChangeMode(m.id)}
                disabled={isLoading}
                className={`px-2.5 py-1 text-xs font-mono rounded-md transition cursor-pointer disabled:opacity-50 ${
                  mode === m.id
                    ? 'bg-neutral-800 text-emerald-400 font-semibold shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
                title={m.desc}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Primary Action Buttons */}
        <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 w-full sm:w-auto justify-end">
          {/* [ ANALYZE ] */}
          <button
            id="btn-analyze"
            onClick={onAnalyze}
            disabled={isLoading || !hasInput}
            className="flex-1 sm:flex-none px-3 sm:px-3.5 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-750 active:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-semibold font-mono flex items-center justify-center space-x-1.5 transition active:scale-95 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            title="Execute 7-stage static analysis pipeline"
          >
            <Activity className="w-3.5 h-3.5 text-blue-400" />
            <span>ANALYZE</span>
          </button>

          {/* [ DEOBFUSCATE ] */}
          <button
            id="btn-deobfuscate"
            onClick={onDeobfuscate}
            disabled={isLoading || !hasInput}
            className="flex-1 sm:flex-none px-4 sm:px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-semibold font-mono flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-950 transition active:scale-95 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            title="Execute AI Semantic Reconstruction and Deobfuscation"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{loadingLabel || 'PROCESSING...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                <span>DEOBFUSCATE</span>
              </>
            )}
          </button>

          {/* [ EXPLAIN ] */}
          <button
            id="btn-explain"
            onClick={onExplain}
            disabled={isLoading || !hasInput}
            className="flex-1 sm:flex-none px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-300 border border-neutral-700 text-xs font-medium font-mono flex items-center justify-center space-x-1.5 transition active:scale-95 disabled:opacity-40 cursor-pointer"
            title="Explain script without substantially rewriting"
          >
            <FileSearch className="w-3.5 h-3.5 text-purple-400" />
            <span>EXPLAIN</span>
          </button>

          {/* [ TRANSLATE ] */}
          <button
            id="btn-translate"
            onClick={onTranslate}
            disabled={isLoading || !hasInput}
            className="flex-1 sm:flex-none px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-300 border border-neutral-700 text-xs font-medium font-mono flex items-center justify-center space-x-1.5 transition active:scale-95 disabled:opacity-40 cursor-pointer"
            title="Convert complicated source into cleaner typed Luau"
          >
            <Languages className="w-3.5 h-3.5 text-cyan-400" />
            <span>TRANSLATE</span>
          </button>

          {/* [ COMPARE ] */}
          <button
            id="btn-compare"
            onClick={onCompare}
            disabled={!hasOutput}
            className="flex-1 sm:flex-none px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-300 border border-neutral-700 text-xs font-medium font-mono flex items-center justify-center space-x-1.5 transition active:scale-95 disabled:opacity-40 cursor-pointer"
            title="Side-by-side diff comparison"
          >
            <Columns2 className="w-3.5 h-3.5 text-amber-400" />
            <span>COMPARE</span>
          </button>

          {/* [ EXPORT ] */}
          <button
            id="btn-export"
            onClick={onExport}
            disabled={!hasOutput}
            className="flex-1 sm:flex-none px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-300 border border-neutral-700 text-xs font-medium font-mono flex items-center justify-center space-x-1.5 transition active:scale-95 disabled:opacity-40 cursor-pointer"
            title="Export Lua, Luau, TXT or Markdown Report"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>EXPORT</span>
          </button>
        </div>
      </div>
    </div>
  );
};
