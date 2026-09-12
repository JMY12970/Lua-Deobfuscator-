import React from 'react';
import {
  X,
  Settings as SettingsIcon,
  CheckCircle2,
  Sliders,
  Cpu,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="settings-modal"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 text-neutral-100"
    >
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-neutral-950 px-4 py-3.5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-300">
              <SettingsIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Deobfuscator Settings</h3>
              <p className="text-[11px] text-neutral-400">
                Pipeline execution, AI models &amp; URL preferences
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

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* AI Model Info */}
          <div className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold font-mono text-xs">
              <Cpu className="w-4 h-4" />
              <span>AI Provider &amp; Model</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-neutral-300 font-mono text-[11px]">
              <div>
                <span className="text-neutral-500">Provider:</span> Google AI (GenAI SDK)
              </div>
              <div>
                <span className="text-neutral-500">Model:</span> gemini-3.8-flash
              </div>
              <div>
                <span className="text-neutral-500">Server Side:</span> Yes (Zero Client Exposure)
              </div>
              <div>
                <span className="text-neutral-500">Execution:</span> Static Only (No runtime)
              </div>
            </div>
          </div>

          {/* Feature Toggles */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-neutral-400 font-mono uppercase tracking-wider">
              Analysis &amp; Display Preferences
            </h4>

            <label className="flex items-center justify-between p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 cursor-pointer">
              <div>
                <span className="font-semibold text-neutral-200">Show Confidence Score</span>
                <p className="text-[11px] text-neutral-400">
                  Display semantic reverse-engineering confidence badge
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.showConfidence}
                onChange={(e) => onUpdateSettings({ showConfidence: e.target.checked })}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 cursor-pointer">
              <div>
                <span className="font-semibold text-neutral-200">Show Security Flags</span>
                <p className="text-[11px] text-neutral-400">
                  Highlight webhooks, external network requests, and dynamic execution
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.showSecurityWarnings}
                onChange={(e) => onUpdateSettings({ showSecurityWarnings: e.target.checked })}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 cursor-pointer">
              <div>
                <span className="font-semibold text-neutral-200">Automatic GitHub URL Conversion</span>
                <p className="text-[11px] text-neutral-400">
                  Convert github.com/.../blob/... URLs into raw.githubusercontent.com
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoConvertGithubUrl}
                onChange={(e) => onUpdateSettings({ autoConvertGithubUrl: e.target.checked })}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 cursor-pointer">
              <div>
                <span className="font-semibold text-neutral-200">Auto Rscripts Raw Detection</span>
                <p className="text-[11px] text-neutral-400">
                  Explicitly format and validate rscripts.net/raw/... endpoints
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoRscriptsUrlDetect}
                onChange={(e) => onUpdateSettings({ autoRscriptsUrlDetect: e.target.checked })}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-neutral-950 px-4 py-3 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium text-xs transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
