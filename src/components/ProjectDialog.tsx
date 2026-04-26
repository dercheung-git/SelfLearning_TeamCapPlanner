import React, { useState } from 'react';
import { X, AlertTriangle, Briefcase } from 'lucide-react';
import { motion } from 'motion/react';

interface ProjectDialogProps {
  onConfirm: (name: string, effort: number) => void;
  onCancel: () => void;
}

export function ProjectDialog({ onConfirm, onCancel }: ProjectDialogProps) {
  const [name, setName] = useState('');
  const [effort, setEffort] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    const effortFloat = parseFloat(effort);
    if (isNaN(effortFloat) || effortFloat <= 0) {
      setError("Effort must be greater than 0");
      return;
    }
    onConfirm(name.trim(), effortFloat);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white border-4 border-slate-900 rounded-3xl shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] w-full max-w-sm overflow-hidden"
      >
        <div className="bg-slate-50 p-6 border-b-4 border-slate-900 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg border-2 border-slate-900">
               <Briefcase className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">New Project</h3>
              <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest mt-0.5">Planning Module</p>
            </div>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-slate-200 rounded-xl transition-all text-slate-400 hover:text-slate-900">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Project Name</label>
              <input
                autoFocus
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
                className="w-full text-sm font-bold p-4 border-4 border-slate-900 rounded-2xl focus:bg-slate-50 focus:outline-none transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]"
                placeholder="e.g. Apollo Mission"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Required Effort (Days)</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={effort}
                  onChange={(e) => {
                    setEffort(e.target.value);
                    setError(null);
                  }}
                  className="w-full text-3xl font-mono p-5 pr-16 border-4 border-slate-900 rounded-2xl focus:bg-slate-50 focus:outline-none transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]"
                  placeholder="30.0"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 font-mono text-sm uppercase font-black">DAYS</span>
              </div>
            </div>
          </div>

          {error && (
            <p className="text-[10px] text-red-600 font-black uppercase tracking-widest flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {error}
            </p>
          )}

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-4 font-black uppercase tracking-widest text-xs text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-4 bg-slate-900 text-white font-black uppercase tracking-widest text-xs rounded-2xl border-2 border-slate-900 shadow-[0px_4px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-0.5 hover:shadow-[0px_6px_0px_0px_rgba(15,23,42,1)] active:translate-y-0 active:shadow-none transition-all"
            >
              Add Project
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
