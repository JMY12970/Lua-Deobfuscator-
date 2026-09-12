import React, { useState } from 'react';
import {
  Columns2,
  Eye,
  EyeOff,
  X,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react';
import { StaticAnalysisResult } from '../types';

interface ComparisonViewProps {
  originalCode: string;
  reconstructedCode: string;
  staticAnalysis?: StaticAnalysisResult;
  onClose: () => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  originalCode,
  reconstructedCode,
  staticAnalysis,
  onClose
}) => {
  const [showChanges, setShowChanges] = useState(true);
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedReconstructed, setCopiedReconstructed] = useState(false);

  const origLines = originalCode.split('\n');
  const reconLines = reconstructedCode.split('\n');
  const maxLines = Math.max(origLines.length, reconLines.length);

  const handleCopyOriginal = async () => {
    await navigator.clipboard.writeText(originalCode);
    setCopiedOriginal(true);
    setTimeout(() => setCopiedOriginal(false), 2000);
  };

  const handleCopyReconstructed = async () => {
    await navigator.clipboard.writeText(reconstructedCode);
    setCopiedReconstructed(true);
    setTimeout(() => setCopiedReconstructed(false), 2000);
  };

  // Helper to check if line is modified
  const isLineChanged = (idx: number): boolean => {
    if (!showChanges) return false;
    const l1 = origLines[idx] || '';
    const l2 = reconLines[idx] || '';
    return l1.trim() !== l2.trim();
  };

  return (
    <div
      id="comparison-view-modal"
      className="fixed inset-2 sm:inset-4 z-40 bg-neutral-900/98 backdrop-blur-md border border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-neutral-100"
    >
      {/* Modal Header */}
      <div className="bg-neutral-950 px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Columns2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-wide flex items-center space-x-2">
              <span>Side-by-Side Comparison</span>
              <span className="text-xs font-mono font-normal text-neutral-400">
                (Original vs Reconstructed)
              </span>
            </h3>
            <p className="text-[11px] text-neutral-400">
              Review transformations: decoded strings, renamed variables, and simplified control-flow
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* [Show changes] / [Hide changes] Toggle */}
          <button
            id="btn-toggle-changes"
            onClick={() => setShowChanges(!showChanges)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center space-x-1.5 transition active:scale-95 cursor-pointer ${
              showChanges
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-neutral-800 border-neutral-700 text-neutral-400'
            }`}
          >
            {showChanges ? (
              <>
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                <span>Show changes</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>Hide changes</span>
              </>
            )}
          </button>

          <button
            id="btn-close-comparison"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-300 transition cursor-pointer"
            title="Close Comparison View"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Changes Summary Legend */}
      {showChanges && staticAnalysis && (
        <div className="bg-neutral-950/60 px-4 py-2 border-b border-neutral-850 flex flex-wrap items-center gap-3 text-xs font-mono text-neutral-400">
          <span className="text-neutral-500 font-sans font-medium text-[11px]">HIGHLIGHTS:</span>
          <span className="flex items-center space-x-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{staticAnalysis.decodedStrings.length} Decoded Strings</span>
          </span>
          <span className="flex items-center space-x-1 text-blue-400">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>{staticAnalysis.inferredIdentifiers.length} Renamed Identifiers</span>
          </span>
          <span className="flex items-center space-x-1 text-purple-400">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span>{staticAnalysis.constantFoldings.length} Simplified Expressions</span>
          </span>
          <span className="flex items-center space-x-1 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>{staticAnalysis.functions.length} Analyzed Functions</span>
          </span>
        </div>
      )}

      {/* Comparison Body: Two-Column Diff */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-neutral-800 overflow-hidden font-mono text-xs">
        {/* Left Column: ORIGINAL */}
        <div className="flex flex-col h-full overflow-hidden bg-neutral-950/30">
          <div className="bg-neutral-950 px-3 py-2 border-b border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
            <span className="font-semibold text-neutral-300">ORIGINAL SOURCE</span>
            <button
              onClick={handleCopyOriginal}
              className="flex items-center space-x-1 text-[11px] text-neutral-400 hover:text-neutral-200"
            >
              {copiedOriginal ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
              <span>Copy</span>
            </button>
          </div>

          <div className="flex-1 overflow-auto p-2">
            {origLines.map((line, idx) => {
              const changed = isLineChanged(idx);
              return (
                <div
                  key={idx}
                  className={`flex items-start py-0.5 px-1 rounded transition-colors ${
                    changed ? 'bg-red-500/10 text-red-200' : 'text-neutral-300'
                  }`}
                >
                  <span className="w-8 shrink-0 text-right pr-2 text-neutral-600 select-none text-[11px]">
                    {idx + 1}
                  </span>
                  <span className="whitespace-pre flex-1">{line || ' '}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: RECONSTRUCTED */}
        <div className="flex flex-col h-full overflow-hidden bg-neutral-950/30">
          <div className="bg-neutral-950 px-3 py-2 border-b border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
            <span className="font-semibold text-emerald-400 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>RECONSTRUCTED SOURCE</span>
            </span>
            <button
              onClick={handleCopyReconstructed}
              className="flex items-center space-x-1 text-[11px] text-neutral-400 hover:text-neutral-200"
            >
              {copiedReconstructed ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
              <span>Copy</span>
            </button>
          </div>

          <div className="flex-1 overflow-auto p-2">
            {reconLines.map((line, idx) => {
              const changed = isLineChanged(idx);
              return (
                <div
                  key={idx}
                  className={`flex items-start py-0.5 px-1 rounded transition-colors ${
                    changed ? 'bg-emerald-500/15 text-emerald-100 font-medium' : 'text-neutral-300'
                  }`}
                >
                  <span className="w-8 shrink-0 text-right pr-2 text-neutral-600 select-none text-[11px]">
                    {idx + 1}
                  </span>
                  <span className="whitespace-pre flex-1">{line || ' '}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
