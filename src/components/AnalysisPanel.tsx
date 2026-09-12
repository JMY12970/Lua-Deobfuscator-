import React, { useState } from 'react';
import {
  Activity,
  Code,
  FileText,
  Calculator,
  Tag,
  Boxes,
  GitFork,
  Gamepad2,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { StaticAnalysisResult, SecurityWarning } from '../types';

interface AnalysisPanelProps {
  staticData: StaticAnalysisResult | null;
  explanation?: string;
  confidence?: number;
  indicators?: string[];
  securityWarnings?: SecurityWarning[];
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  staticData,
  explanation,
  confidence,
  indicators = [],
  securityWarnings = []
}) => {
  const [activeStage, setActiveStage] = useState<
    'summary' | 'lexical' | 'strings' | 'constants' | 'identifiers' | 'functions' | 'controlFlow' | 'roblox' | 'security'
  >('summary');

  if (!staticData) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 text-center text-neutral-500 font-mono text-xs">
        Run [ ANALYZE ] or [ DEOBFUSCATE ] to inspect the multi-stage pipeline breakdown.
      </div>
    );
  }

  const warnings = securityWarnings.length > 0 ? securityWarnings : staticData.securityWarnings;

  return (
    <div id="pipeline-analysis-panel" className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-lg">
      {/* Stages Tabs Navigation (Horizontally scrollable for mobile) */}
      <div className="bg-neutral-950 px-2 py-2 border-b border-neutral-800 flex items-center space-x-1 overflow-x-auto scrollbar-none text-xs font-mono">
        <button
          onClick={() => setActiveStage('summary')}
          className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 shrink-0 transition cursor-pointer ${
            activeStage === 'summary'
              ? 'bg-neutral-800 text-emerald-400 font-semibold shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Summary</span>
        </button>

        <button
          onClick={() => setActiveStage('strings')}
          className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 shrink-0 transition cursor-pointer ${
            activeStage === 'strings'
              ? 'bg-neutral-800 text-emerald-400 font-semibold shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Stage 2: Strings ({staticData.decodedStrings.length})</span>
        </button>

        <button
          onClick={() => setActiveStage('identifiers')}
          className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 shrink-0 transition cursor-pointer ${
            activeStage === 'identifiers'
              ? 'bg-neutral-800 text-emerald-400 font-semibold shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Stage 4: Variables ({staticData.inferredIdentifiers.length})</span>
        </button>

        <button
          onClick={() => setActiveStage('functions')}
          className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 shrink-0 transition cursor-pointer ${
            activeStage === 'functions'
              ? 'bg-neutral-800 text-emerald-400 font-semibold shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Boxes className="w-3.5 h-3.5" />
          <span>Stage 5: Functions ({staticData.functions.length})</span>
        </button>

        <button
          onClick={() => setActiveStage('constants')}
          className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 shrink-0 transition cursor-pointer ${
            activeStage === 'constants'
              ? 'bg-neutral-800 text-emerald-400 font-semibold shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Stage 3: Constants ({staticData.constantFoldings.length})</span>
        </button>

        <button
          onClick={() => setActiveStage('controlFlow')}
          className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 shrink-0 transition cursor-pointer ${
            activeStage === 'controlFlow'
              ? 'bg-neutral-800 text-emerald-400 font-semibold shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <GitFork className="w-3.5 h-3.5" />
          <span>Stage 6: Control Flow</span>
        </button>

        <button
          onClick={() => setActiveStage('roblox')}
          className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 shrink-0 transition cursor-pointer ${
            activeStage === 'roblox'
              ? 'bg-neutral-800 text-emerald-400 font-semibold shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Gamepad2 className="w-3.5 h-3.5" />
          <span>Stage 7: Roblox/Luau</span>
        </button>

        <button
          onClick={() => setActiveStage('security')}
          className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 shrink-0 transition cursor-pointer ${
            activeStage === 'security'
              ? 'bg-neutral-800 text-amber-400 font-semibold shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>Security ({warnings.length})</span>
        </button>

        <button
          onClick={() => setActiveStage('lexical')}
          className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 shrink-0 transition cursor-pointer ${
            activeStage === 'lexical'
              ? 'bg-neutral-800 text-emerald-400 font-semibold shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span>Stage 1: Tokens</span>
        </button>
      </div>

      {/* Stage Body */}
      <div className="p-4 sm:p-5 max-h-[380px] overflow-y-auto font-mono text-xs text-neutral-200 leading-relaxed">
        {/* SUMMARY TAB */}
        {activeStage === 'summary' && (
          <div className="space-y-4 font-sans">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-neutral-950/70 border border-neutral-800 rounded-lg p-3">
                <span className="text-neutral-500 text-xs font-mono">LANGUAGE</span>
                <p className="text-lg font-bold text-neutral-100 mt-1">{staticData.language}</p>
              </div>
              <div className="bg-neutral-950/70 border border-neutral-800 rounded-lg p-3">
                <span className="text-neutral-500 text-xs font-mono">TOTAL LINES</span>
                <p className="text-lg font-bold text-neutral-100 mt-1">{staticData.lineCount}</p>
              </div>
              <div className="bg-neutral-950/70 border border-neutral-800 rounded-lg p-3">
                <span className="text-neutral-500 text-xs font-mono">FUNCTIONS</span>
                <p className="text-lg font-bold text-neutral-100 mt-1">{staticData.functions.length}</p>
              </div>
              <div className="bg-neutral-950/70 border border-neutral-800 rounded-lg p-3">
                <span className="text-neutral-500 text-xs font-mono">CONFIDENCE</span>
                <p className="text-lg font-bold text-emerald-400 mt-1">
                  {confidence || staticData.overallConfidence}%
                </p>
              </div>
            </div>

            {/* Obfuscation Indicators */}
            <div className="bg-neutral-950/70 border border-neutral-800 rounded-lg p-3 space-y-2">
              <h4 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider font-mono">
                Detected Obfuscation Indicators
              </h4>
              <div className="flex flex-wrap gap-2 pt-1">
                {(indicators.length > 0 ? indicators : staticData.obfuscationIndicators.filter(i => i.detected).map(i => i.name)).map(
                  (ind, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded bg-neutral-800 border border-neutral-700 text-xs text-neutral-200 font-mono flex items-center space-x-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{ind}</span>
                    </span>
                  )
                )}
              </div>
            </div>

            {/* AI Explanation if available */}
            {explanation && (
              <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-lg p-4 space-y-2">
                <div className="flex items-center space-x-1.5 text-emerald-400 text-xs font-semibold uppercase tracking-wider font-mono">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Semantic Explanation</span>
                </div>
                <p className="text-xs text-neutral-200 leading-relaxed font-sans whitespace-pre-wrap">
                  {explanation}
                </p>
              </div>
            )}
          </div>
        )}

        {/* STAGE 2: STRINGS */}
        {activeStage === 'strings' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-neutral-100">
                Stage 2 — String Analysis &amp; Deterministic Decoding
              </h4>
              <span className="text-neutral-500">{staticData.decodedStrings.length} decoded entries</span>
            </div>

            {staticData.decodedStrings.length === 0 ? (
              <p className="text-neutral-500 py-3">No encoded or escaped strings detected in source.</p>
            ) : (
              <div className="space-y-2">
                {staticData.decodedStrings.map((s, idx) => (
                  <div
                    key={idx}
                    className="bg-neutral-950/80 border border-neutral-800 rounded-lg p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-[10px] text-neutral-400 uppercase">
                        {s.type.replace('_', ' ')}
                      </span>
                      <code className="text-red-300 text-xs truncate max-w-xs">{s.original}</code>
                    </div>
                    <div className="flex items-center space-x-2 text-emerald-400 font-semibold truncate">
                      <ChevronRight className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                      <code className="bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20 truncate">
                        {s.decoded}
                      </code>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STAGE 4: IDENTIFIERS */}
        {activeStage === 'identifiers' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-neutral-100">
                Stage 4 — Identifier Analysis &amp; Semantic Usage Inference
              </h4>
              <span className="text-neutral-500">{staticData.inferredIdentifiers.length} inferred names</span>
            </div>

            {staticData.inferredIdentifiers.length === 0 ? (
              <p className="text-neutral-500 py-3">No obfuscated identifiers detected for semantic renaming.</p>
            ) : (
              <div className="space-y-2">
                {staticData.inferredIdentifiers.map((id, idx) => (
                  <div
                    key={idx}
                    className="bg-neutral-950/80 border border-neutral-800 rounded-lg p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <code className="text-amber-300 font-bold">{id.original}</code>
                        <ChevronRight className="w-3 h-3 text-neutral-600" />
                        <code className="text-emerald-400 font-bold bg-emerald-950/30 px-1.5 py-0.5 rounded">
                          {id.inferred}
                        </code>
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-1">{id.reason}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-neutral-500 text-[11px]">
                        {id.occurrences}x usage
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                        {id.confidence}% conf
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STAGE 5: FUNCTIONS */}
        {activeStage === 'functions' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-neutral-100">
                Stage 5 — Function Analysis &amp; Purpose Estimation
              </h4>
              <span className="text-neutral-500">{staticData.functions.length} functions detected</span>
            </div>

            {staticData.functions.length === 0 ? (
              <p className="text-neutral-500 py-3">No top-level function declarations identified.</p>
            ) : (
              <div className="space-y-3">
                {staticData.functions.map((fn, idx) => (
                  <div key={idx} className="bg-neutral-950/80 border border-neutral-800 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] uppercase font-bold">
                          {fn.id}
                        </span>
                        <code className="text-neutral-200 font-bold text-xs">{fn.name}</code>
                        <span className="text-neutral-500 text-[11px]">
                          (Lines {fn.lineStart}–{fn.lineEnd})
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                        {fn.confidence}% conf
                      </span>
                    </div>

                    <p className="text-xs text-neutral-300 font-sans italic">
                      &ldquo;{fn.purpose}&rdquo;
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                      <div>
                        <span className="text-neutral-500">Inputs:</span>{' '}
                        <span className="text-neutral-300">{fn.inputs.join(', ') || 'none'}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500">Outputs:</span>{' '}
                        <span className="text-neutral-300">{fn.outputs.join(', ') || 'implicit'}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500">Services:</span>{' '}
                        <span className="text-neutral-300">{fn.usedServices.join(', ') || 'none'}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500">Side Effects:</span>{' '}
                        <span className="text-neutral-300">{fn.sideEffects.join(', ') || 'none'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STAGE 3: CONSTANTS */}
        {activeStage === 'constants' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-neutral-100">
                Stage 3 — Constant Analysis &amp; Arithmetic Folding
              </h4>
              <span className="text-neutral-500">{staticData.constantFoldings.length} simplifications</span>
            </div>

            {staticData.constantFoldings.length === 0 ? (
              <p className="text-neutral-500 py-3">No constant arithmetic or hex expressions found to fold.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {staticData.constantFoldings.map((c, idx) => (
                  <div
                    key={idx}
                    className="bg-neutral-950/80 border border-neutral-800 rounded-lg p-2.5 flex items-center justify-between text-xs"
                  >
                    <code className="text-purple-300">{c.original}</code>
                    <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
                      <ChevronRight className="w-3 h-3 text-neutral-600" />
                      <code>{c.simplified}</code>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STAGE 6: CONTROL FLOW */}
        {activeStage === 'controlFlow' && (
          <div className="space-y-3">
            <h4 className="font-semibold text-neutral-100">
              Stage 6 — Control Flow Analysis &amp; Dispatch Loops
            </h4>
            {staticData.controlFlowPatterns.length === 0 ? (
              <p className="text-neutral-500 py-3">Standard control flow with no flattening detected.</p>
            ) : (
              <div className="space-y-2">
                {staticData.controlFlowPatterns.map((p, idx) => (
                  <div
                    key={idx}
                    className={`border rounded-lg p-3 space-y-1 ${
                      p.severity === 'high'
                        ? 'bg-red-500/10 border-red-500/30 text-red-200'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs uppercase">{p.type.replace(/_/g, ' ')}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-mono uppercase bg-neutral-800 text-neutral-400">
                        {p.severity} severity
                      </span>
                    </div>
                    <p className="text-xs font-sans">{p.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STAGE 7: ROBLOX / LUAU */}
        {activeStage === 'roblox' && (
          <div className="space-y-3">
            <h4 className="font-semibold text-neutral-100">
              Stage 7 — Roblox Engine &amp; Luau API Detection
            </h4>
            {staticData.robloxApis.length === 0 ? (
              <p className="text-neutral-500 py-3">No standard Roblox Engine services or remotes referenced.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {staticData.robloxApis.map((api, idx) => (
                  <div key={idx} className="bg-neutral-950/80 border border-neutral-800 rounded-lg p-2.5">
                    <div className="flex items-center space-x-2">
                      <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] uppercase font-bold">
                        {api.category}
                      </span>
                      <span className="font-bold text-neutral-200 text-xs">{api.name}</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-1 font-sans">{api.detectedUsage}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECURITY TAB */}
        {activeStage === 'security' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-amber-400 flex items-center space-x-1.5">
                <ShieldAlert className="w-4 h-4" />
                <span>Security Static Inspection Warnings</span>
              </h4>
              <span className="text-neutral-500">{warnings.length} flags</span>
            </div>

            {warnings.length === 0 ? (
              <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-lg p-3 text-emerald-400 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>No high-risk security patterns (e.g. loadstring, discord webhooks) detected.</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                {warnings.map((w, idx) => (
                  <div
                    key={idx}
                    className={`border rounded-lg p-3 space-y-1 ${
                      w.severity === 'critical'
                        ? 'bg-red-500/10 border-red-500/30'
                        : 'bg-amber-500/10 border-amber-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle
                          className={`w-3.5 h-3.5 ${
                            w.severity === 'critical' ? 'text-red-400' : 'text-amber-400'
                          }`}
                        />
                        <span className="font-bold text-xs text-neutral-100">{w.title}</span>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase font-bold ${
                          w.severity === 'critical'
                            ? 'bg-red-500/20 text-red-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {w.severity}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300 font-sans">{w.description}</p>
                    {w.sample && (
                      <code className="block bg-neutral-950/80 p-1.5 rounded text-[11px] text-red-300 mt-1 truncate">
                        {w.sample}
                      </code>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STAGE 1: LEXICAL */}
        {activeStage === 'lexical' && (
          <div className="space-y-3">
            <h4 className="font-semibold text-neutral-100">
              Stage 1 — Lexical Analysis &amp; Token Breakdown
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-neutral-950 p-2.5 rounded border border-neutral-800">
                <span className="text-neutral-500 text-[11px]">Total Tokens:</span>
                <p className="text-base font-bold text-neutral-200">{staticData.tokenCount}</p>
              </div>
              <div className="bg-neutral-950 p-2.5 rounded border border-neutral-800">
                <span className="text-neutral-500 text-[11px]">Identifiers:</span>
                <p className="text-base font-bold text-neutral-200">
                  {staticData.tokens.filter(t => t.type === 'identifier').length}
                </p>
              </div>
              <div className="bg-neutral-950 p-2.5 rounded border border-neutral-800">
                <span className="text-neutral-500 text-[11px]">Keywords:</span>
                <p className="text-base font-bold text-neutral-200">
                  {staticData.tokens.filter(t => t.type === 'keyword').length}
                </p>
              </div>
              <div className="bg-neutral-950 p-2.5 rounded border border-neutral-800">
                <span className="text-neutral-500 text-[11px]">Strings &amp; Numbers:</span>
                <p className="text-base font-bold text-neutral-200">
                  {staticData.tokens.filter(t => t.type === 'string' || t.type === 'number').length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
