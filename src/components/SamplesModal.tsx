import React from 'react';
import {
  X,
  FolderCode,
  ArrowRight,
  Code2,
  Sparkles
} from 'lucide-react';
import { SAMPLE_SCRIPTS, SampleScript } from '../utils/sampleScripts';

interface SamplesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSample: (sample: SampleScript) => void;
}

export const SamplesModal: React.FC<SamplesModalProps> = ({
  isOpen,
  onClose,
  onSelectSample
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="samples-modal"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 text-neutral-100"
    >
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-neutral-950 px-4 py-3.5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FolderCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Load Sample Lua/Luau Scripts</h3>
              <p className="text-[11px] text-neutral-400">
                Explore real-world obfuscation patterns and Roblox APIs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-400 hover:text-neutral-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="p-4 space-y-2.5 max-h-[70vh] overflow-y-auto">
          {SAMPLE_SCRIPTS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => {
                onSelectSample(sample);
                onClose();
              }}
              className="w-full p-3.5 rounded-xl bg-neutral-950/80 hover:bg-neutral-800/80 border border-neutral-800 hover:border-neutral-700 flex items-center justify-between text-left transition group cursor-pointer"
            >
              <div className="space-y-1 min-w-0 pr-3">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-xs text-neutral-200 group-hover:text-emerald-400 transition">
                    {sample.name}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                      sample.language === 'Luau'
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    {sample.language}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  {sample.description}
                </p>
              </div>

              <div className="w-8 h-8 rounded-lg bg-neutral-800 group-hover:bg-emerald-600 flex items-center justify-center text-neutral-400 group-hover:text-white transition shrink-0">
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
