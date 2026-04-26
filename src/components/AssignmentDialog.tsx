import React, { useState, useEffect } from 'react';
import { Assignment, Member, Project } from '../types';
import { formatNumber, cn } from '../lib/utils';
import { X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AssignmentDialogProps {
  member: Member;
  project: Project;
  remainingCapacity: number;
  onConfirm: (manDays: number) => void;
  onCancel: () => void;
}

export function AssignmentDialog({ member, project, remainingCapacity, onConfirm, onCancel }: AssignmentDialogProps) {
  const [val, setVal] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [showErrorPopup, setShowErrorPopup] = useState(false);

  const manDays = parseFloat(val);
  const isExceeding = !isNaN(manDays) && manDays > remainingCapacity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNaN(manDays) || manDays <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    if (manDays > remainingCapacity) {
      setShowErrorPopup(true);
      return;
    }
    onConfirm(manDays);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white border-4 border-slate-900 rounded-3xl shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] w-full max-w-md overflow-hidden relative"
      >
        <div className="bg-slate-50 p-6 border-b-4 border-slate-900 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Assign Member</h3>
            <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest mt-0.5">Allocation Engine v1.0</p>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-slate-200 rounded-xl border-2 border-transparent hover:border-slate-900 transition-all text-slate-400 hover:text-slate-900 shadow-none hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(37,99,235,0.2)]">
              <span className="text-[10px] uppercase font-black text-blue-600 block mb-2 tracking-widest">Target Member</span>
              <span className="text-sm font-black text-slate-900 block truncate">{member.name}</span>
              <span className="text-[10px] text-slate-400 block mt-1 font-mono font-bold tracking-tighter">LIMIT: {formatNumber(remainingCapacity)}d</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]">
              <span className="text-[10px] uppercase font-black text-slate-400 block mb-2 tracking-widest">Project Unit</span>
              <span className="text-sm font-black text-slate-900 block truncate">{project.name}</span>
              <span className="text-[10px] text-slate-400 block mt-1 font-mono font-bold tracking-tighter">REQ: {formatNumber(project.effort)}d</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-900 uppercase tracking-widest mb-3">Allocation (Man-Days)</label>
            <div className="relative">
              <input
                autoFocus
                type="number"
                step="0.01"
                value={val}
                onChange={(e) => {
                  setVal(e.target.value);
                  setError(null);
                }}
                className={cn(
                  "w-full text-3xl font-mono p-6 pr-16 border-4 border-slate-900 rounded-2xl focus:bg-slate-50 focus:outline-none transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] outline-none",
                  isExceeding && "border-red-500 text-red-600"
                )}
                placeholder="0.00"
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 font-mono text-sm uppercase font-black">DAYS</span>
            </div>
            {isExceeding && (
              <p className="mt-3 text-[10px] text-red-600 font-black uppercase tracking-widest flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Exceeding capacity by {formatNumber(manDays - remainingCapacity)}d
              </p>
            )}
            {error && !isExceeding && (
              <p className="mt-3 text-[10px] text-red-600 font-black uppercase tracking-widest flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {error}
              </p>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-4 font-black uppercase tracking-widest text-xs text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all"
            >
              Abort
            </button>
            <button
              type="submit"
              className={cn(
                "flex-1 py-4 font-black uppercase tracking-widest text-xs rounded-2xl border-2 border-slate-900 transition-all",
                isExceeding 
                  ? "bg-slate-200 text-slate-400 border-slate-300 shadow-none opacity-80 cursor-pointer" 
                  : "bg-blue-600 text-white shadow-[0px_4px_0px_0px_rgba(30,58,138,1)] hover:-translate-y-0.5 hover:shadow-[0px_6px_0px_0px_rgba(30,58,138,1)] active:translate-y-0 active:shadow-none"
              )}
            >
              Confirm Units
            </button>
          </div>
        </form>

        {/* Error Popup Overlay */}
        <AnimatePresence>
          {showErrorPopup && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[110] bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center"
            >
              <motion.div
                initial={{ scale: 0.9, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                className="p-8 bg-white border-4 border-slate-900 rounded-3xl shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]"
              >
                <div className="w-16 h-16 bg-red-100 border-4 border-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-2">Exceed Capacity</h4>
                <p className="text-sm font-medium text-slate-500 mb-8 max-w-[240px]">
                  Inputted man-days exceed the remaining capacity of this team member.
                </p>
                <button
                  onClick={() => setShowErrorPopup(false)}
                  className="w-full py-4 bg-slate-900 text-white font-black uppercase tracking-widest text-sm rounded-2xl border-2 border-slate-900 shadow-[0px_4px_0px_0px_rgba(15,23,42,0.3)] hover:-translate-y-0.5 transition-all"
                >
                  Dismiss
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
