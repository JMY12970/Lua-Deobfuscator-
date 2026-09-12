import React, { useState } from 'react';
import {
  X,
  History,
  Trash2,
  FolderOpen,
  Edit2,
  Check,
  Calendar,
  Code2
} from 'lucide-react';
import { HistoryItem } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: HistoryItem[];
  onLoadItem: (item: HistoryItem) => void;
  onDeleteItem: (id: string) => void;
  onRenameItem: (id: string, newName: string) => void;
  onClearAll: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  items,
  onLoadItem,
  onDeleteItem,
  onRenameItem,
  onClearAll
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  if (!isOpen) return null;

  const startRename = (item: HistoryItem) => {
    setEditingId(item.id);
    setEditingName(item.name);
  };

  const saveRename = (id: string) => {
    if (editingName.trim()) {
      onRenameItem(id, editingName.trim());
    }
    setEditingId(null);
  };

  return (
    <div
      id="history-modal"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 text-neutral-100"
    >
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-neutral-950 px-4 py-3.5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-300">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Local Analysis History</h3>
              <p className="text-[11px] text-neutral-400">
                Stored strictly in your local browser storage
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
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {items.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 font-mono text-xs">
              <Code2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>No recent analyses stored yet.</p>
              <p className="text-[11px] mt-1 text-neutral-600">
                Scripts you analyze will appear here automatically.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="bg-neutral-950/80 border border-neutral-800 hover:border-neutral-700 rounded-xl p-3 flex items-center justify-between gap-3 transition"
              >
                <div className="min-w-0 flex-1">
                  {editingId === item.id ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="bg-neutral-900 border border-emerald-500 text-xs px-2 py-1 rounded outline-none font-medium w-full text-neutral-100"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveRename(item.id);
                        }}
                      />
                      <button
                        onClick={() => saveRename(item.id)}
                        className="p-1 text-emerald-400 hover:text-emerald-300"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 truncate">
                      <span className="font-semibold text-xs text-neutral-200 truncate">
                        {item.name}
                      </span>
                      <button
                        onClick={() => startRename(item)}
                        className="text-neutral-500 hover:text-neutral-300 p-0.5"
                        title="Rename"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-neutral-400 font-mono mt-1">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-neutral-500" />
                      <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                    </span>
                    <span>{item.language}</span>
                    <span>{item.lineCount} lines</span>
                    <span className="text-emerald-400 font-semibold">
                      {item.analysisScore}% score
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-1.5 shrink-0">
                  <button
                    onClick={() => {
                      onLoadItem(item);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>Open</span>
                  </button>
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="p-1.5 rounded-lg bg-neutral-800 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition cursor-pointer"
                    title="Delete Entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="bg-neutral-950 px-4 py-2.5 border-t border-neutral-800 flex items-center justify-between">
            <span className="text-xs text-neutral-500 font-mono">
              {items.length} {items.length === 1 ? 'record' : 'records'}
            </span>
            <button
              onClick={onClearAll}
              className="text-xs text-red-400 hover:text-red-300 font-medium transition cursor-pointer"
            >
              Clear All History
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
