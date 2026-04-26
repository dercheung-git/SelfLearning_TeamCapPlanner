import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Briefcase, CheckCircle2, UserPlus, X, Trash2 } from 'lucide-react';
import { Project, Assignment, Member } from '../types';
import { cn, formatNumber } from '../lib/utils';

interface ProjectCardProps {
  project: Project;
  assignments: Assignment[];
  members: Member[];
  onRemoveAssignment: (assignmentId: string) => void;
  onRemoveProject: (projectId: string) => void;
  key?: string | number;
}

export function ProjectCard({ project, assignments, members, onRemoveAssignment, onRemoveProject }: ProjectCardProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `project-${project.id}`,
    data: { project },
  });

  const projectAssignments = assignments.filter((a) => a.projectId === project.id);
  const totalAllocated = projectAssignments.reduce((sum, a) => sum + a.manDays, 0);
  const isFullyCovered = totalAllocated >= project.effort;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "p-6 border-2 transition-all duration-500 rounded-2xl flex flex-col h-full relative",
        isFullyCovered 
          ? "bg-green-50 border-green-500 shadow-bento" 
          : "bg-white border-slate-900 shadow-bento",
        isOver && "bg-slate-50 scale-[1.02]"
      )}
    >
      {isFullyCovered && (
        <div className="absolute -top-3 -right-3 p-1.5 bg-green-500 text-white rounded-full border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] z-10">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      )}

      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-3 rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]",
            isFullyCovered ? "bg-green-200 text-green-700" : "bg-slate-100 text-slate-900"
          )}>
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 uppercase tracking-tight text-lg leading-none mb-1">{project.name}</h3>
            <span className="text-[10px] font-black font-mono text-slate-400 uppercase tracking-widest">
              REQUIRED: {formatNumber(project.effort)}d
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 mb-6">
        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
          <span className="text-slate-400">Total Allocation</span>
          <span className={cn("font-mono px-2 py-0.5 rounded border border-slate-200", isFullyCovered ? "text-green-600 bg-white" : "text-slate-700 bg-slate-50")}>
            {formatNumber(totalAllocated)} / {formatNumber(project.effort)}d
          </span>
        </div>
        <div className="w-full bg-slate-100 border-2 border-slate-900 rounded-full h-3 overflow-hidden shadow-inner">
          <div 
            className={cn(
              "h-full transition-all duration-1000",
              isFullyCovered ? "bg-green-500" : "bg-blue-500"
            )}
            style={{ width: `${Math.min((totalAllocated / project.effort) * 100, 100)}%` }}
          />
        </div>

        <div className="pt-4 space-y-2">
          {projectAssignments.length === 0 ? (
            <div className="py-6 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-2">
              <UserPlus className="w-6 h-6 opacity-30" />
              <p className="text-[10px] uppercase font-black tracking-widest opacity-40">Drop member here</p>
            </div>
          ) : (
            projectAssignments.map((a) => {
              const member = members.find((m) => m.id === a.memberId);
              return (
                <div key={a.id} className="flex items-center justify-between p-3 bg-white border-2 border-slate-200 rounded-xl group hover:border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)] hover:shadow-bento transition-all cursor-default">
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase tracking-tight text-slate-900">{member?.name || 'Unknown'}</span>
                    <span className="text-[10px] font-mono font-bold text-blue-600">{formatNumber(a.manDays)}d</span>
                  </div>
                  <button 
                    onClick={() => onRemoveAssignment(a.id)}
                    className="p-1.5 text-slate-300 hover:text-white hover:bg-red-500 rounded-lg border border-transparent hover:border-red-600 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-auto pt-4 border-t-2 border-slate-100 flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-widest font-black text-slate-400">Remaining</span>
          <span className={cn(
            "font-mono font-bold text-xs",
            isFullyCovered ? "text-green-600" : "text-amber-600"
          )}>
            {formatNumber(Math.max(0, project.effort - totalAllocated))}d
          </span>
        </div>
        <button
          onClick={() => onRemoveProject(project.id)}
          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
          title="Remove Project"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
