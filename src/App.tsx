/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  DndContext, 
  DragEndEvent, 
  DragOverlay, 
  useSensor, 
  useSensors, 
  PointerSensor,
  DragStartEvent,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import { 
  Users, 
  Briefcase, 
  Grid3X3, 
  Plus, 
  LayoutDashboard,
  Layers,
  ArrowRight,
  Info,
  RotateCcw,
  Trash2
} from 'lucide-react';
import { Member, Project, Assignment } from './types';
import { generateId, cn } from './lib/utils';
import { CSVUploader } from './components/CSVUploader';
import { DraggableMember } from './components/MemberPool';
import { ProjectCard } from './components/ProjectCard';
import { AssignmentDialog } from './components/AssignmentDialog';
import { MemberDialog } from './components/MemberDialog';
import { ProjectDialog } from './components/ProjectDialog';
import { AssignmentMatrix } from './components/AssignmentMatrix';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [members, setMembers] = useState<Member[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  
  const [activeId, setActiveId] = useState<string | null>(null);
  const [assignmentPending, setAssignmentPending] = useState<{ member: Member; project: Project } | null>(null);
  const [view, setView] = useState<'board' | 'matrix'>('board');
  const [showMemberDialog, setShowMemberDialog] = useState(false);
  const [showProjectDialog, setShowProjectDialog] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const remainingCapacities = useMemo(() => {
    const caps: Record<string, number> = {};
    members.forEach(m => {
      const allocated = assignments
        .filter(a => a.memberId === m.id)
        .reduce((sum, a) => sum + a.manDays, 0);
      caps[m.id] = m.capacity - allocated;
    });
    return caps;
  }, [members, assignments]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    
    if (over && over.id.toString().startsWith('project-')) {
      const projectId = over.id.toString().replace('project-', '');
      const memberId = active.id.toString().replace('member-', '');
      
      const project = projects.find(p => p.id === projectId);
      const member = members.find(m => m.id === memberId);
      
      if (project && member) {
        if (remainingCapacities[member.id] <= 0) {
          alert(`Team member ${member.name} has no remaining capacity.`);
          return;
        }
        setAssignmentPending({ member, project });
      }
    }
  };

  const confirmAssignment = (manDays: number) => {
    if (!assignmentPending) return;
    
    const newAssignment: Assignment = {
      id: generateId(),
      memberId: assignmentPending.member.id,
      projectId: assignmentPending.project.id,
      manDays,
    };
    
    setAssignments(prev => [...prev, newAssignment]);
    setAssignmentPending(null);
  };

  const removeAssignment = (id: string) => {
    setAssignments(prev => prev.filter(a => a.id !== id));
  };

  const addManualMember = () => {
    setShowMemberDialog(true);
  };

  const confirmAddMember = (name: string, capacity: number) => {
    setMembers(prev => [...prev, { id: generateId(), name, capacity }]);
    setShowMemberDialog(false);
  };

  const addManualProject = () => {
    setShowProjectDialog(true);
  };

  const confirmAddProject = (name: string, effort: number) => {
    setProjects(prev => [...prev, { id: generateId(), name, effort }]);
    setShowProjectDialog(false);
  };
  
  const removeMember = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
    setAssignments(prev => prev.filter(a => a.memberId !== id));
  };
  
  const removeProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    setAssignments(prev => prev.filter(a => a.projectId !== id));
  };

  const resetAssignments = () => {
    setAssignments([]);
  };

  const deleteAllProjects = () => {
    setProjects([]);
    setAssignments([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b-4 border-slate-900 px-8 py-6 flex items-center justify-between sticky top-0 z-50 shadow-[0px_4px_0px_0px_rgba(15,23,42,1)]">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-900 border-2 border-slate-900 rounded-2xl text-white shadow-[3px_3px_0px_0px_rgba(37,99,235,1)]">
            <LayoutDashboard className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-zinc-900 uppercase tracking-tight leading-none">TeamCap</h1>
            <p className="text-[10px] text-zinc-400 uppercase font-black tracking-[0.2em] mt-1 italic">Man-Day Allocation Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
          <button 
            onClick={() => setView('board')}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              view === 'board' ? "bg-slate-900 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]" : "text-slate-400 hover:text-slate-900"
            )}
          >
            <Layers className="w-4 h-4" /> Board
          </button>
          <button 
            onClick={() => setView('matrix')}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              view === 'matrix' ? "bg-slate-900 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]" : "text-slate-400 hover:text-slate-900"
            )}
          >
            <Grid3X3 className="w-4 h-4" /> Matrix
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex gap-8 mr-4">
             <div className="text-center">
              <p className="text-[10px] uppercase font-black text-slate-400 tracking-tighter">Capacity</p>
              <p className="text-xl font-black text-blue-600 font-mono tracking-tighter">{members.reduce((s, m) => s + m.capacity, 0).toFixed(0)}d</p>
            </div>
            <div className="text-center border-l-2 border-slate-100 pl-8">
              <p className="text-[10px] uppercase font-black text-slate-400 tracking-tighter">Required</p>
              <p className="text-xl font-black text-amber-600 font-mono tracking-tighter">{projects.reduce((s, p) => s + p.effort, 0).toFixed(0)}d</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-10">
        <DndContext 
          sensors={sensors} 
          onDragStart={handleDragStart} 
          onDragEnd={handleDragEnd}
        >
          {view === 'board' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Left Column: Input & Team Pool */}
              <div className="lg:col-span-3 space-y-10">
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">01 // Data Import</h2>
                  </div>
                  <CSVUploader 
                    onMembersImport={(m) => setMembers(prev => [...prev, ...m])}
                    onProjectsImport={(p) => setProjects(prev => [...prev, ...p])}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex flex-col gap-1">
                      <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">02 // Team Roster</h2>
                      {members.length > 0 && (
                        <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest italic">
                          {members.length} Members | {members.reduce((s, m) => s+m.capacity, 0).toFixed(0)}d Total
                        </p>
                      )}
                    </div>
                    <button 
                      onClick={addManualMember}
                      className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-slate-900 rounded-xl shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] transition-all active:translate-y-0 active:shadow-none"
                      title="Add Member Manually"
                    >
                      <Plus className="w-3.5 h-3.5 text-slate-900" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Member</span>
                    </button>
                  </div>
                  <div className="flex flex-col gap-4 max-h-[50vh] overflow-y-auto pr-3 custom-scrollbar">
                    {members.length === 0 ? (
                      <div className="bento-card bg-slate-50 border-dashed p-10 text-center flex flex-col items-center opacity-50 shadow-none">
                        <Users className="w-10 h-10 text-slate-300 mb-3" />
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-tight">Awaiting team data...</p>
                      </div>
                    ) : (
                      members.map((member) => (
                        <DraggableMember 
                          key={member.id} 
                          member={member} 
                          remainingCapacity={remainingCapacities[member.id]}
                          onRemove={removeMember}
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Projects Board */}
              <div className="lg:col-span-9 space-y-6">
                <div className="flex items-center justify-between pb-6 border-b-2 border-slate-200">
                  <div className="flex items-center gap-3">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 underline decoration-blue-500 decoration-4 underline-offset-8">03 // Live Canvas</h2>
                    {projects.length > 0 && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-amber-100 border-2 border-amber-500 text-amber-700 rounded-full text-[9px] font-black uppercase tracking-widest">
                        <ArrowRight className="w-3 h-3" /> Drag members over projects
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {projects.length > 0 && (
                      <>
                        <button 
                          onClick={deleteAllProjects}
                          className="flex items-center justify-center gap-2 px-4 py-2 hover:bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                          title="Delete all projects"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete All
                        </button>
                        <button 
                          onClick={resetAssignments}
                          className="flex items-center justify-center gap-2 px-4 py-2 hover:bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                          title="Clear all assignments"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Reset
                        </button>
                        <button 
                          onClick={addManualProject}
                          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 text-white border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(37,99,235,1)] rounded-xl text-xs font-black uppercase tracking-widest hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_rgba(37,99,235,1)] transition-all active:translate-y-0 active:shadow-none"
                        >
                          <Plus className="w-4 h-4" /> Add Project
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {projects.length === 0 ? (
                    <div className="col-span-full py-32 bento-card bg-slate-50 border-dashed shadow-none flex flex-col items-center justify-center gap-6">
                      <div className="p-6 bg-white border-2 border-slate-900 rounded-3xl shadow-bento">
                        <Briefcase className="w-16 h-16 text-slate-200" />
                      </div>
                      <div className="text-center">
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Empty Workspace</h3>
                        <p className="text-slate-400 text-sm font-mono mt-1 px-4 max-w-sm">Initialization required. Please upload your project manifests or add entries manually.</p>
                      </div>
                      <button 
                        onClick={addManualProject}
                        className="bento-button mt-4"
                      >
                        <Plus className="w-4 h-4 mr-2" /> Add Project
                      </button>
                    </div>
                  ) : (
                    projects.map((project) => (
                      <ProjectCard 
                        key={project.id} 
                        project={project}
                        assignments={assignments}
                        members={members}
                        onRemoveAssignment={removeAssignment}
                        onRemoveProject={removeProject}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <AssignmentMatrix 
                members={members}
                projects={projects}
                assignments={assignments}
              />
            </div>
          )}

          {/* Drag Overlay */}
          <DragOverlay>
            {activeId && activeId.startsWith('member-') ? (
              <div className="p-4 bg-white border-4 border-slate-900 rounded-2xl shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] scale-110 pointer-events-none rotate-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 border-2 border-slate-900 rounded-xl">
                    <Users className="w-5 h-5 text-slate-900" />
                  </div>
                  <span className="font-black text-sm uppercase tracking-widest text-slate-900">
                    {members.find(m => `member-${m.id}` === activeId)?.name}
                  </span>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>

      {/* Assignment Modal */}
      <AnimatePresence>
        {assignmentPending && (
          <AssignmentDialog 
            member={assignmentPending.member}
            project={assignmentPending.project}
            remainingCapacity={remainingCapacities[assignmentPending.member.id]}
            onConfirm={confirmAssignment}
            onCancel={() => setAssignmentPending(null)}
          />
        )}
        {showMemberDialog && (
          <MemberDialog 
            onConfirm={confirmAddMember}
            onCancel={() => setShowMemberDialog(false)}
          />
        )}
        {showProjectDialog && (
          <ProjectDialog 
            onConfirm={confirmAddProject}
            onCancel={() => setShowProjectDialog(false)}
          />
        )}
      </AnimatePresence>

      <footer className="bg-slate-900 text-white border-t-4 border-slate-900 p-8 shadow-[0px_-4px_0px_0px_rgba(15,23,42,1)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">
              System Architecture // Team Capacity Node
            </p>
            <p className="text-[9px] text-slate-600 font-mono">
              &copy; 2026 TC-ENGINE REL 1.0.42 // AIS-PROD-RUNTIME
            </p>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="flex flex-col items-end gap-1">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">Total Capacity Utilization</span>
              <div className="flex items-center gap-3">
                <div className="w-32 bg-slate-800 border border-slate-700 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-500 h-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                    style={{ 
                      width: `${Math.min((assignments.reduce((s, a) => s + a.manDays, 0) / (members.reduce((s, m) => s + m.capacity, 0) || 1)) * 100, 100)}%` 
                    }}
                  />
                </div>
                <span className="text-xl font-black font-mono text-blue-400 italic">
                  {((assignments.reduce((s, a) => s + a.manDays, 0) / (members.reduce((s, m) => s + m.capacity, 0) || 1)) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="w-px h-12 bg-slate-800" />
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(59,130,246,0.8)]" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-slate-500">Live Status</span>
                <span className="text-xs font-black uppercase tracking-widest text-slate-100">Operational</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
