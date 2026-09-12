import React, { useState, useRef } from 'react';
import {
  Clipboard,
  Upload,
  Link,
  Loader2,
  X,
  FileCode,
  CheckCircle2,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { DetectedLanguage } from '../types';
import { normalizeRawUrl } from '../utils/urlHelper';
import { detectLanguage } from '../utils/luaParser';

interface SourceMeta {
  sourceType: 'paste' | 'file' | 'url';
  fileName?: string;
  url?: string;
  targetUrl?: string;
  size: number;
  lines: number;
  language: DetectedLanguage;
}

interface SourceLoaderProps {
  onLoadCode: (code: string, meta: SourceMeta) => void;
  onClear: () => void;
  currentMeta: SourceMeta | null;
  autoConvertGithubUrl: boolean;
}

export const SourceLoader: React.FC<SourceLoaderProps> = ({
  onLoadCode,
  onClear,
  currentMeta,
  autoConvertGithubUrl
}) => {
  const [activeTab, setActiveTab] = useState<'paste' | 'file' | 'url'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [convertedInfo, setConvertedInfo] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle URL change with auto-detection/conversion preview
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUrlInput(val);
    setErrorMessage(null);

    if (autoConvertGithubUrl && val.includes('github.com') && val.includes('/blob/')) {
      const normalized = normalizeRawUrl(val);
      if (normalized.wasConverted) {
        setConvertedInfo(`Will auto-convert to: ${normalized.normalizedUrl}`);
      } else {
        setConvertedInfo(null);
      }
    } else {
      setConvertedInfo(null);
    }
  };

  // Fetch Raw URL via backend proxy (never executes code)
  const handleFetchUrl = async () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setErrorMessage('Please enter a valid raw script URL.');
      return;
    }

    setIsLoadingUrl(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/fetch-raw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Server responded with status ${res.status}`);
      }

      const lines = (data.code || '').split('\n').length;
      const detectedLang = data.detectedLanguage || detectLanguage(data.code);

      onLoadCode(data.code, {
        sourceType: 'url',
        url: data.originalUrl,
        targetUrl: data.targetUrl,
        size: data.size || data.code.length,
        lines,
        language: detectedLang
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to load the source. Please verify the URL.');
    } finally {
      setIsLoadingUrl(false);
    }
  };

  // Handle Clipboard Paste
  const handlePasteClipboard = async () => {
    setErrorMessage(null);
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim().length > 0) {
          const lines = text.split('\n').length;
          const detected = detectLanguage(text);
          onLoadCode(text, {
            sourceType: 'paste',
            size: text.length,
            lines,
            language: detected
          });
          return;
        }
      }
      setErrorMessage('Clipboard is empty. You can paste directly into the INPUT console.');
    } catch (err) {
      setErrorMessage('Clipboard access denied by browser. You can paste directly into the INPUT console.');
    }
  };

  // Process Local File (.lua, .luau, .txt)
  const processFile = (file: File) => {
    setErrorMessage(null);
    const validExts = ['.lua', '.luau', '.txt'];
    const fileName = file.name.toLowerCase();
    const hasValidExt = validExts.some(ext => fileName.endsWith(ext));

    if (!hasValidExt) {
      setErrorMessage(`Unsupported file format. Please upload .lua, .luau, or .txt files.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (typeof text === 'string') {
        const lines = text.split('\n').length;
        const detected = detectLanguage(text);
        onLoadCode(text, {
          sourceType: 'file',
          fileName: file.name,
          size: file.size,
          lines,
          language: detected
        });
      }
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read local file.');
    };
    reader.readAsText(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // reset input so same file can be reloaded if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div id="source-loader-container" className="bg-neutral-900/90 border-b border-neutral-800 p-3 sm:p-4 space-y-3">
      {/* Selector Tabs: [ Paste ] [ File ] [ Raw URL ] */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-1 sm:space-x-2 bg-neutral-950/80 p-1 rounded-lg border border-neutral-800">
          <button
            id="btn-tab-paste"
            onClick={() => {
              setActiveTab('paste');
              handlePasteClipboard();
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center space-x-1.5 transition cursor-pointer ${
              activeTab === 'paste'
                ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Clipboard className="w-3.5 h-3.5 text-emerald-400" />
            <span>Paste</span>
          </button>

          <button
            id="btn-tab-file"
            onClick={() => {
              setActiveTab('file');
              fileInputRef.current?.click();
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center space-x-1.5 transition cursor-pointer ${
              activeTab === 'file'
                ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-blue-400" />
            <span>File (.lua, .luau)</span>
          </button>

          <button
            id="btn-tab-url"
            onClick={() => setActiveTab('url')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center space-x-1.5 transition cursor-pointer ${
              activeTab === 'url'
                ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Link className="w-3.5 h-3.5 text-purple-400" />
            <span>Raw URL</span>
          </button>
        </div>

        {/* Quick Clear Button */}
        <button
          id="btn-clear-all"
          onClick={onClear}
          className="px-3 py-1.5 text-xs font-medium rounded-md bg-neutral-800/80 hover:bg-neutral-750 text-neutral-300 hover:text-neutral-100 border border-neutral-700 flex items-center space-x-1.5 transition active:scale-95 cursor-pointer"
        >
          <X className="w-3.5 h-3.5 text-neutral-400" />
          <span>Clear</span>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".lua,.luau,.txt"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* URL Input Form */}
      {activeTab === 'url' && (
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                id="input-raw-url"
                type="url"
                value={urlInput}
                onChange={handleUrlChange}
                placeholder="https://raw.githubusercontent.com/... or https://rscripts.net/raw/..."
                className="w-full bg-neutral-950 border border-neutral-750 focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/40 text-neutral-100 placeholder-neutral-500 text-xs sm:text-sm rounded-lg px-3 py-2 font-mono outline-none transition"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleFetchUrl();
                }}
              />
              {urlInput && (
                <button
                  onClick={() => {
                    setUrlInput('');
                    setConvertedInfo(null);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                id="btn-load-url"
                onClick={handleFetchUrl}
                disabled={isLoadingUrl || !urlInput.trim()}
                className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white text-xs sm:text-sm font-medium rounded-lg flex items-center justify-center space-x-1.5 shadow-sm transition active:scale-95 cursor-pointer disabled:cursor-not-allowed"
              >
                {isLoadingUrl ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>FETCHING TEXT...</span>
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4" />
                    <span>LOAD</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {convertedInfo && (
            <p className="text-[11px] text-blue-400/90 font-mono flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>{convertedInfo}</span>
            </p>
          )}

          {/* Preset quick links */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-neutral-400">
            <span className="text-neutral-500">Supports:</span>
            <span className="bg-neutral-800/80 px-2 py-0.5 rounded text-neutral-300 font-mono">rscripts.net/raw/...</span>
            <span className="bg-neutral-800/80 px-2 py-0.5 rounded text-neutral-300 font-mono">raw.githubusercontent.com/...</span>
            <span className="bg-neutral-800/80 px-2 py-0.5 rounded text-neutral-300 font-mono">github.com/.../blob/...</span>
          </div>
        </div>
      )}

      {/* File Drop Area */}
      {activeTab === 'file' && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center cursor-pointer transition ${
            isDragOver
              ? 'border-emerald-500 bg-emerald-500/10'
              : 'border-neutral-750 hover:border-neutral-600 bg-neutral-950/40'
          }`}
        >
          <FileCode className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
          <p className="text-xs sm:text-sm text-neutral-200 font-medium">
            Click to upload or drag &amp; drop your script
          </p>
          <p className="text-[11px] text-neutral-500 mt-1 font-mono">
            Supported extensions: .lua, .luau, .txt (treated strictly as plain text)
          </p>
        </div>
      )}

      {/* Error Display */}
      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2.5 flex items-start space-x-2 text-xs text-red-300">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Loader Warning: </span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Status Bar: SOURCE | URL/FILE | SIZE | LINES | DETECTED LANGUAGE */}
      {currentMeta && (
        <div
          id="source-meta-bar"
          className="bg-neutral-950/80 border border-neutral-800 rounded-lg px-3 py-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-neutral-300"
        >
          <div className="flex items-center space-x-1.5">
            <span className="text-neutral-500">SOURCE:</span>
            <span className="text-emerald-400 uppercase font-semibold">
              {currentMeta.sourceType}
            </span>
          </div>

          {(currentMeta.fileName || currentMeta.url) && (
            <div className="flex items-center space-x-1.5 truncate max-w-[280px] sm:max-w-md">
              <span className="text-neutral-500">
                {currentMeta.fileName ? 'FILE:' : 'URL:'}
              </span>
              <span className="text-neutral-200 truncate" title={currentMeta.fileName || currentMeta.url}>
                {currentMeta.fileName || currentMeta.url}
              </span>
            </div>
          )}

          <div className="flex items-center space-x-1.5">
            <span className="text-neutral-500">SIZE:</span>
            <span className="text-neutral-200">
              {(currentMeta.size / 1024).toFixed(1)} KB ({currentMeta.size} B)
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-neutral-500">LINES:</span>
            <span className="text-neutral-200">{currentMeta.lines}</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-neutral-500">DETECTED:</span>
            <span
              className={`font-semibold ${
                currentMeta.language === 'Luau'
                  ? 'text-blue-400'
                  : currentMeta.language === 'Lua'
                  ? 'text-emerald-400'
                  : 'text-neutral-400'
              }`}
            >
              {currentMeta.language}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
