import React, { useState, useEffect, useTransition } from 'react';
import { Header } from './components/Header';
import { SourceLoader } from './components/SourceLoader';
import { CodeConsole } from './components/CodeConsole';
import { AnalysisPanel } from './components/AnalysisPanel';
import { Toolbar } from './components/Toolbar';
import { ComparisonView } from './components/ComparisonView';
import { AIChatDrawer } from './components/AIChatDrawer';
import { HistoryModal } from './components/HistoryModal';
import { SettingsModal } from './components/SettingsModal';
import { ExportModal } from './components/ExportModal';
import { SamplesModal } from './components/SamplesModal';
import {
  AnalysisMode,
  AppSettings,
  DetectedLanguage,
  HistoryItem,
  StaticAnalysisResult
} from './types';
import { detectLanguage, runStaticPipeline } from './utils/luaParser';
import { SAMPLE_SCRIPTS, SampleScript } from './utils/sampleScripts';

const DEFAULT_SETTINGS: AppSettings = {
  autoFormat: true,
  showConfidence: true,
  showSecurityWarnings: true,
  autoConvertGithubUrl: true,
  autoRscriptsUrlDetect: true,
  maxAnalysisChars: 32000,
  defaultMode: 'AUTO'
};

const STORAGE_KEY_HISTORY = 'ai_lua_deobfuscator_history_v1';
const STORAGE_KEY_SETTINGS = 'ai_lua_deobfuscator_settings_v1';

export default function App() {
  // Primary States
  const [inputCode, setInputCode] = useState<string>('');
  const [outputCode, setOutputCode] = useState<string>('');
  const [detectedLanguage, setDetectedLanguage] = useState<DetectedLanguage>('Luau');
  const [currentMode, setCurrentMode] = useState<AnalysisMode>('AUTO');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingLabel, setLoadingLabel] = useState<string>('');
  const [explanation, setExplanation] = useState<string>('');
  const [confidence, setConfidence] = useState<number>(85);
  const [indicators, setIndicators] = useState<string[]>([]);
  const [staticAnalysis, setStaticAnalysis] = useState<StaticAnalysisResult | null>(null);
  const [activeModelUsed, setActiveModelUsed] = useState<string>('gemini-2.5-flash');

  // Source Meta
  const [sourceMeta, setSourceMeta] = useState<{
    sourceType: 'paste' | 'file' | 'url';
    fileName?: string;
    url?: string;
    targetUrl?: string;
    size: number;
    lines: number;
    language: DetectedLanguage;
  } | null>(null);

  // Modals & Panels
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showSamples, setShowSamples] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [showChat, setShowChat] = useState(false);

  // Mobile View Tab: 'split' | 'input' | 'output' | 'analysis'
  const [mobileView, setMobileView] = useState<'both' | 'input' | 'output' | 'analysis'>('both');

  // History & Settings
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Save history on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
    } catch (e) {
      console.warn('Failed to persist history:', e);
    }
  }, [history]);

  // Save settings on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to persist settings:', e);
    }
  }, [settings]);

  // Load default initial sample script on first mount for instant interactivity
  useEffect(() => {
    const initialSample = SAMPLE_SCRIPTS[0];
    handleLoadCode(initialSample.code, {
      sourceType: 'paste',
      size: initialSample.code.length,
      lines: initialSample.code.split('\n').length,
      language: initialSample.language
    });
  }, []);

  // Update input code and rerun static analysis
  const handleLoadCode = (code: string, meta?: any) => {
    setInputCode(code);
    setOutputCode('');
    setExplanation('');

    const lang = detectLanguage(code);
    setDetectedLanguage(lang);

    const staticRes = runStaticPipeline(code);
    setStaticAnalysis(staticRes);
    setConfidence(staticRes.overallConfidence);
    setIndicators(staticRes.obfuscationIndicators.filter(i => i.detected).map(i => i.name));

    if (meta) {
      setSourceMeta(meta);
    } else {
      setSourceMeta({
        sourceType: 'paste',
        size: code.length,
        lines: code.split('\n').length,
        language: lang
      });
    }
  };

  const handleClearAll = () => {
    setInputCode('');
    setOutputCode('');
    setExplanation('');
    setSourceMeta(null);
    setStaticAnalysis(null);
    setIndicators([]);
    setConfidence(85);
  };

  // Action 1: [ ANALYZE ]
  const handleAnalyze = () => {
    if (!inputCode) return;
    setIsLoading(true);
    setLoadingLabel('ANALYZING...');

    setTimeout(() => {
      const staticRes = runStaticPipeline(inputCode);
      setStaticAnalysis(staticRes);
      setDetectedLanguage(staticRes.language);
      setConfidence(staticRes.overallConfidence);
      setIndicators(staticRes.obfuscationIndicators.filter(i => i.detected).map(i => i.name));

      // In pure analysis mode, provide statically simplified preview
      setOutputCode(staticRes.staticallySimplifiedCode);
      setExplanation(
        `Static Inspection Complete (${staticRes.language}): Found ${staticRes.decodedStrings.length} encoded strings, folded ${staticRes.constantFoldings.length} constant expressions, and inferred ${staticRes.inferredIdentifiers.length} variable names.`
      );

      setIsLoading(false);
      setLoadingLabel('');
    }, 250);
  };

  // Action 2: [ DEOBFUSCATE ] / [ EXPLAIN ] / [ TRANSLATE ]
  const executePipeline = async (targetMode: AnalysisMode) => {
    if (!inputCode.trim()) return;

    setIsLoading(true);
    setCurrentMode(targetMode);
    setLoadingLabel(
      targetMode === 'EXPLAIN'
        ? 'EXPLAINING...'
        : targetMode === 'TRANSLATE'
        ? 'TRANSLATING...'
        : targetMode === 'SECURITY'
        ? 'AUDITING...'
        : 'RECONSTRUCTING...'
    );

    try {
      // Execute local static pipeline first
      const staticRes = runStaticPipeline(inputCode);
      setStaticAnalysis(staticRes);

      const res = await fetch('/api/deobfuscate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: inputCode,
          mode: targetMode,
          staticAnalysis: staticRes
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Server returned error');
      }

      setOutputCode(data.cleanCode || staticRes.staticallySimplifiedCode);
      setExplanation(data.explanation || '');
      setConfidence(data.summary?.overallConfidence || staticRes.overallConfidence);
      if (data.modelUsed) {
        setActiveModelUsed(data.modelUsed);
      }
      if (data.summary?.indicators) {
        setIndicators(data.summary.indicators);
      }

      // Add to local history
      const historyItem: HistoryItem = {
        id: `hist_${Date.now()}`,
        name: sourceMeta?.fileName || (sourceMeta?.url ? sourceMeta.url.split('/').pop() : `Script #${history.length + 1}`) || `Analysis #${history.length + 1}`,
        timestamp: Date.now(),
        sourceUrl: sourceMeta?.url,
        language: data.summary?.language || staticRes.language,
        lineCount: (data.cleanCode || inputCode).split('\n').length,
        analysisScore: data.summary?.overallConfidence || staticRes.overallConfidence,
        inputCode,
        outputCode: data.cleanCode || staticRes.staticallySimplifiedCode,
        explanation: data.explanation
      };

      setHistory(prev => [historyItem, ...prev.slice(0, 49)]);
    } catch (err: any) {
      console.error('Pipeline error:', err);
      // Fallback gracefully to offline static deobfuscation
      const fallback = runStaticPipeline(inputCode);
      setOutputCode(fallback.staticallySimplifiedCode);
      setExplanation(
        `AI Semantic pass unavailable (${err.message}). Defaulting to deterministic static deobfuscation rules.`
      );
      setConfidence(fallback.overallConfidence);
    } finally {
      setIsLoading(false);
      setLoadingLabel('');
    }
  };

  const handleDeobfuscate = () => executePipeline(currentMode);
  const handleExplain = () => executePipeline('EXPLAIN');
  const handleTranslate = () => executePipeline('TRANSLATE');

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Header */}
      <Header
        detectedLanguage={detectedLanguage}
        securityCount={staticAnalysis?.securityWarnings?.length || 0}
        onOpenHistory={() => setShowHistory(true)}
        onOpenSettings={() => setShowSettings(true)}
        onOpenChat={() => setShowChat(true)}
        onOpenSamples={() => setShowSamples(true)}
        chatOpen={showChat}
      />

      {/* Raw URL / File / Paste Loader Bar */}
      <SourceLoader
        onLoadCode={(code, meta) => handleLoadCode(code, meta)}
        onClear={handleClearAll}
        currentMeta={sourceMeta}
        autoConvertGithubUrl={settings.autoConvertGithubUrl}
      />

      {/* Mobile View Selector Bar (visible on small screens) */}
      <div className="md:hidden px-3 py-2 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between text-xs font-mono">
        <span className="text-neutral-500">VIEW:</span>
        <div className="flex items-center space-x-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
          <button
            onClick={() => setMobileView('both')}
            className={`px-2 py-1 rounded ${
              mobileView === 'both' ? 'bg-neutral-800 text-emerald-400 font-semibold' : 'text-neutral-400'
            }`}
          >
            Split
          </button>
          <button
            onClick={() => setMobileView('input')}
            className={`px-2 py-1 rounded ${
              mobileView === 'input' ? 'bg-neutral-800 text-emerald-400 font-semibold' : 'text-neutral-400'
            }`}
          >
            Input
          </button>
          <button
            onClick={() => setMobileView('output')}
            className={`px-2 py-1 rounded ${
              mobileView === 'output' ? 'bg-neutral-800 text-emerald-400 font-semibold' : 'text-neutral-400'
            }`}
          >
            Output
          </button>
          <button
            onClick={() => setMobileView('analysis')}
            className={`px-2 py-1 rounded ${
              mobileView === 'analysis' ? 'bg-neutral-800 text-emerald-400 font-semibold' : 'text-neutral-400'
            }`}
          >
            Pipeline
          </button>
        </div>
      </div>

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 space-y-4">
        {/* Dual Consoles Grid: INPUT | OUTPUT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* INPUT CONSOLE */}
          {(mobileView === 'both' || mobileView === 'input') && (
            <div className="flex flex-col">
              <CodeConsole
                id="input"
                title="INPUT"
                subtitle="Original Lua/Luau source"
                code={inputCode}
                onChangeCode={(val) => {
                  setInputCode(val);
                  const lang = detectLanguage(val);
                  setDetectedLanguage(lang);
                  setSourceMeta(prev =>
                    prev
                      ? { ...prev, size: val.length, lines: val.split('\n').length, language: lang }
                      : { sourceType: 'paste', size: val.length, lines: val.split('\n').length, language: lang }
                  );
                }}
                language={detectedLanguage}
                validationIssues={staticAnalysis?.validation?.issues || []}
              />
            </div>
          )}

          {/* OUTPUT CONSOLE */}
          {(mobileView === 'both' || mobileView === 'output') && (
            <div className="flex flex-col">
              <CodeConsole
                id="output"
                title="OUTPUT"
                subtitle="AI-analyzed / reconstructed source"
                code={outputCode}
                readOnly={true}
                confidence={outputCode ? confidence : undefined}
                language={detectedLanguage}
                isAiGenerated={true}
                modelName={outputCode ? activeModelUsed : undefined}
                onExport={() => setShowExport(true)}
              />
            </div>
          )}
        </div>

        {/* 7-Stage Static Pipeline Inspector */}
        {(mobileView === 'both' || mobileView === 'analysis') && (
          <AnalysisPanel
            staticData={staticAnalysis}
            explanation={explanation}
            confidence={confidence}
            indicators={indicators}
          />
        )}
      </main>

      {/* Bottom Sticky Toolbar */}
      <Toolbar
        onAnalyze={handleAnalyze}
        onDeobfuscate={handleDeobfuscate}
        onExplain={handleExplain}
        onTranslate={handleTranslate}
        onCompare={() => setShowComparison(true)}
        onExport={() => setShowExport(true)}
        mode={currentMode}
        onChangeMode={(m) => setCurrentMode(m)}
        isLoading={isLoading}
        loadingLabel={loadingLabel}
        hasInput={inputCode.trim().length > 0}
        hasOutput={outputCode.trim().length > 0}
      />

      {/* Modals & Drawers */}
      {showComparison && (
        <ComparisonView
          originalCode={inputCode}
          reconstructedCode={outputCode}
          staticAnalysis={staticAnalysis || undefined}
          onClose={() => setShowComparison(false)}
        />
      )}

      <AIChatDrawer
        isOpen={showChat}
        onClose={() => setShowChat(false)}
        code={inputCode}
        staticAnalysis={staticAnalysis}
      />

      <HistoryModal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        items={history}
        onLoadItem={(item) => {
          setInputCode(item.inputCode);
          setOutputCode(item.outputCode);
          setExplanation(item.explanation || '');
          setConfidence(item.analysisScore);
          setDetectedLanguage(item.language);
          const staticRes = runStaticPipeline(item.inputCode);
          setStaticAnalysis(staticRes);
        }}
        onDeleteItem={(id) => setHistory(prev => prev.filter(item => item.id !== id))}
        onRenameItem={(id, newName) =>
          setHistory(prev =>
            prev.map(item => (item.id === id ? { ...item, name: newName } : item))
          )
        }
        onClearAll={() => setHistory([])}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onUpdateSettings={(newVals) => setSettings(prev => ({ ...prev, ...newVals }))}
      />

      <ExportModal
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        outputCode={outputCode || inputCode}
        confidence={confidence}
        explanation={explanation}
        staticAnalysis={staticAnalysis}
      />

      <SamplesModal
        isOpen={showSamples}
        onClose={() => setShowSamples(false)}
        onSelectSample={(sample) => {
          handleLoadCode(sample.code, {
            sourceType: 'paste',
            fileName: `${sample.name}.${sample.language.toLowerCase()}`,
            size: sample.code.length,
            lines: sample.code.split('\n').length,
            language: sample.language
          });
        }}
      />
    </div>
  );
}
