import React, { useState, useRef } from 'react';
import {
  Copy,
  Check,
  Download,
  WrapText,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileCode2,
  Sparkles,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { ValidationIssue } from '../types';

interface CodeConsoleProps {
  id: string;
  title: string;
  subtitle: string;
  code: string;
  onChangeCode?: (val: string) => void;
  readOnly?: boolean;
  confidence?: number;
  validationIssues?: ValidationIssue[];
  language?: string;
  isAiGenerated?: boolean;
  modelName?: string;
  onExport?: () => void;
}

export const CodeConsole: React.FC<CodeConsoleProps> = ({
  id,
  title,
  subtitle,
  code,
  onChangeCode,
  readOnly = false,
  confidence,
  validationIssues = [],
  language = 'Lua',
  isAiGenerated = false,
  modelName,
  onExport
}) => {
  const [copied, setCopied] = useState(false);
  const [wordWrap, setWordWrap] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const lines = code ? code.split('\n') : [''];
  const lineCount = lines.length;

  const handleCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownload = () => {
    if (onExport) {
      onExport();
      return;
    }
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase()}_source.${language.toLowerCase() === 'luau' ? 'luau' : 'lua'}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const errorIssues = validationIssues.filter(i => i.type === 'error');
  const warnIssues = validationIssues.filter(i => i.type === 'warning');

  return (
    <div
      id={`console-${id}`}
      className={`flex flex-col bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-lg transition-all ${
        isExpanded ? 'fixed inset-3 z-50 bg-neutral-900' : 'h-[480px] sm:h-[540px]'
      }`}
    >
      {/* Console Header */}
      <div className="bg-neutral-950 px-3.5 py-2.5 border-b border-neutral-800 flex items-center justify-between gap-2 select-none">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="flex items-center space-x-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
          </div>

          <div className="flex items-center space-x-2 truncate">
            <h2 className="text-xs sm:text-sm font-semibold text-neutral-100 tracking-wide font-mono flex items-center space-x-1">
              {isAiGenerated && <Sparkles className="w-3.5 h-3.5 text-emerald-400 mr-1" />}
              <span>{title}</span>
            </h2>
            <span className="text-[11px] text-neutral-500 hidden sm:inline">
              — {subtitle}
            </span>
          </div>
        </div>

        {/* Console Badges & Actions */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {modelName && (
            <div
              className="hidden md:flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-mono bg-neutral-850 text-neutral-300 border border-neutral-750"
              title={`Engine: ${modelName}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="truncate max-w-[130px]">{modelName}</span>
            </div>
          )}

          {confidence !== undefined && (
            <div
              className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium flex items-center space-x-1 border ${
                confidence >= 80
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : confidence >= 60
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-red-500/10 text-red-400 border-red-500/30'
              }`}
              title="Estimated deobfuscation semantic confidence"
            >
              <span>Confidence:</span>
              <span className="font-bold">{confidence}%</span>
            </div>
          )}

          {/* Validation badge */}
          {validationIssues.length > 0 ? (
            <div
              className="px-2 py-0.5 rounded text-[11px] font-mono flex items-center space-x-1 bg-amber-500/10 text-amber-400 border border-amber-500/30"
              title={validationIssues.map(i => i.message).join('\n')}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>{errorIssues.length > 0 ? 'Syntax Error' : 'Warnings'}</span>
            </div>
          ) : code ? (
            <div className="hidden sm:flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3" />
              <span>Valid Syntax</span>
            </div>
          ) : null}

          {/* Wrap text toggle */}
          <button
            onClick={() => setWordWrap(!wordWrap)}
            className={`p-1.5 rounded-md text-xs transition cursor-pointer ${
              wordWrap
                ? 'bg-neutral-800 text-emerald-400 border border-neutral-700'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
            }`}
            title="Toggle Word Wrap"
          >
            <WrapText className="w-3.5 h-3.5" />
          </button>

          {/* Search Toggle */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`p-1.5 rounded-md text-xs transition cursor-pointer ${
              showSearch
                ? 'bg-neutral-800 text-emerald-400 border border-neutral-700'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
            }`}
            title="Search in code"
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            disabled={!code}
            className="p-1.5 rounded-md text-xs text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition disabled:opacity-40 cursor-pointer"
            title="Copy Code"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={!code}
            className="p-1.5 rounded-md text-xs text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition disabled:opacity-40 cursor-pointer"
            title="Download Source File"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Maximize / Minimize toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-md text-xs text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition cursor-pointer"
            title={isExpanded ? 'Minimize Console' : 'Maximize Console'}
          >
            {isExpanded ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Optional Search Bar */}
      {showSearch && (
        <div className="bg-neutral-950/90 px-3 py-1.5 border-b border-neutral-800 flex items-center space-x-2">
          <Search className="w-3.5 h-3.5 text-neutral-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search code tokens or identifiers..."
            className="w-full bg-transparent text-xs text-neutral-200 placeholder-neutral-500 outline-none font-mono"
          />
          {searchTerm && (
            <span className="text-[11px] font-mono text-neutral-400">
              {
                (code.match(new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')) || [])
                  .length
              }{' '}
              matches
            </span>
          )}
        </div>
      )}

      {/* Editor & Line Numbers Area */}
      <div className="relative flex-1 flex overflow-hidden font-mono text-xs sm:text-[13px] leading-relaxed">
        {/* Line Numbers Gutter */}
        <div className="w-10 sm:w-12 bg-neutral-950/60 select-none text-neutral-600 text-right pr-2 py-3 border-r border-neutral-800/80 overflow-hidden shrink-0 font-mono text-xs">
          {Array.from({ length: Math.max(lineCount, 1) }, (_, i) => (
            <div key={i} className="h-5 leading-5 text-neutral-600">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Text Area */}
        <div className="relative flex-1 h-full overflow-auto bg-neutral-900/50">
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => onChangeCode?.(e.target.value)}
            readOnly={readOnly}
            placeholder={
              readOnly
                ? 'Awaiting analysis or deobfuscation output...'
                : 'Paste Lua/Luau script here, or load a raw URL / sample above...'
            }
            spellCheck={false}
            className={`w-full h-full p-3 bg-transparent text-neutral-200 placeholder-neutral-600 outline-none resize-none font-mono leading-5 ${
              wordWrap ? 'whitespace-pre-wrap' : 'whitespace-pre'
            }`}
          />
        </div>
      </div>

      {/* Console Footer Stats */}
      <div className="bg-neutral-950 px-3 py-1.5 border-t border-neutral-800 text-[11px] font-mono text-neutral-500 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span>
            {lineCount} {lineCount === 1 ? 'line' : 'lines'}
          </span>
          <span>{code.length} chars</span>
        </div>
        <div className="flex items-center space-x-2">
          <span>Format: {language}</span>
          {readOnly && (
            <span className="text-emerald-500 font-medium">Read-only Output</span>
          )}
        </div>
      </div>
    </div>
  );
};
