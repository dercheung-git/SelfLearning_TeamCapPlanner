import React from 'react';
import { RefreshCw, LayoutGrid } from 'lucide-react';
import { Member, Project, Assignment } from '../types';
import { formatNumber, cn } from '../lib/utils';
import { motion } from 'motion/react';

interface AssignmentMatrixProps {
  members: Member[];
  projects: Project[];
  assignments: Assignment[];
}

export function AssignmentMatrix({ members, projects, assignments }: AssignmentMatrixProps) {
  // Matrix data calculation
  const getManDays = (memberId: string, projectId: string) => {
    return assignments
      .filter((a) => a.memberId === memberId && a.projectId === projectId)
      .reduce((sum, a) => sum + a.manDays, 0);
  };

  if (members.length === 0 || projects.length === 0) {
    return (
      <div className="p-12 text-center border-2 border-dashed border-zinc-200 rounded-2xl bg-white/50">
        <LayoutGrid className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
        <h3 className="text-zinc-500 font-medium italic">Upload data to view assignment matrix</h3>
      </div>
    );
  }

  return (
    <div className="bento-card overflow-hidden">
      <div className="p-6 border-b-2 border-slate-900 bg-slate-50 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Allocation Matrix</h2>
          <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest mt-1 italic">Cross-Reference Data Grid</p>
        </div>
        <button 
          onClick={() => {}} 
          className="p-3 bg-white hover:bg-slate-50 border-2 border-slate-900 rounded-xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:shadow-none active:translate-y-1 transition-all group"
        >
          <RefreshCw className="w-5 h-5 text-slate-900 group-hover:rotate-180 transition-transform duration-500" />
        </button>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-6 text-left border-b-2 border-r-2 border-slate-200 bg-slate-50/50 sticky left-0 z-10 w-[220px]">
                <div className="flex flex-col items-start gap-1">
                  <span className="text-[10px] text-slate-900 uppercase font-black tracking-widest">Project \ Member</span>
                </div>
              </th>
              {members.map((member) => (
                <th key={member.id} className="p-4 text-center border-b-2 border-r-2 border-slate-200 min-w-[130px]">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-tight whitespace-nowrap">{member.name}</span>
                    <span className="text-[10px] text-blue-600 font-mono font-bold italic">{formatNumber(member.capacity)}d</span>
                  </div>
                </th>
              ))}
              <th className="p-4 text-center border-b-2 border-slate-200 bg-slate-50/50 min-w-[100px]">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {projects.map((project, idx) => {
              const projectTotal = assignments
                .filter(a => a.projectId === project.id)
                .reduce((sum, a) => sum + a.manDays, 0);
              const isFullyAllocated = projectTotal >= project.effort;

              return (
                <tr key={project.id} className={cn(
                  "hover:bg-slate-100 transition-colors group",
                  idx % 2 === 1 ? "bg-slate-50/50" : "bg-white"
                )}>
                  <td className="p-6 border-b-2 border-r-2 border-slate-100 sticky left-0 z-10 bg-inherit group-hover:bg-inherit transition-colors">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{project.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono font-bold italic">REQ: {formatNumber(project.effort)}d</span>
                    </div>
                  </td>
                  {members.map((member) => {
                    const days = getManDays(member.id, project.id);
                    return (
                      <td key={member.id} className="p-4 border-b-2 border-r-2 border-slate-100 text-center">
                        {days > 0 ? (
                          <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="inline-block px-5 py-2.5 bg-slate-900 text-white rounded-xl font-mono text-xs font-black border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(37,99,235,0.7)]"
                          >
                            {formatNumber(days)}
                          </motion.div>
                        ) : (
                          <span className="text-slate-200 font-mono text-[12px] opacity-20">0</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="p-4 border-b-2 border-slate-100 text-center bg-slate-50/30 group-hover:bg-inherit transition-colors">
                    <div className="flex flex-col items-center">
                      <span className={cn(
                        "font-mono font-black text-sm",
                        isFullyAllocated ? "text-green-600" : "text-slate-900"
                      )}>
                        {formatNumber(projectTotal)}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-slate-900 text-white">
            <tr className="font-bold">
              <td className="p-6 border-r-2 border-slate-700 sticky left-0 z-10 bg-slate-900">
                <span className="text-[10px] text-slate-400 uppercase tracking-tighter font-black">Capacity Utilized</span>
              </td>
              {members.map((member) => {
                const memberTotal = assignments
                  .filter(a => a.memberId === member.id)
                  .reduce((sum, a) => sum + a.manDays, 0);
                const utilization = (memberTotal / member.capacity) * 100;
                return (
                  <td key={member.id} className="p-4 text-center border-r-2 border-slate-700">
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-mono font-black">{formatNumber(memberTotal)}</span>
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest",
                        utilization > 100 ? "text-red-400" : "text-blue-400"
                      )}>{utilization.toFixed(0)}%</span>
                    </div>
                  </td>
                );
              })}
              <td className="p-4 border-slate-700" />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
