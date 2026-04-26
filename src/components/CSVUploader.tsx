import React, { useMemo, useRef } from 'react';
import { parse } from 'papaparse';
import { Upload, FileText } from 'lucide-react';
import { Member, Project } from '../types';
import { generateId } from '../lib/utils';

interface CSVUploaderProps {
  onMembersImport: (members: Member[]) => void;
  onProjectsImport: (projects: Project[]) => void;
}

export function CSVUploader({ onMembersImport, onProjectsImport }: CSVUploaderProps) {
  const memberInputRef = useRef<HTMLInputElement>(null);
  const projectInputRef = useRef<HTMLInputElement>(null);

  const handleMemberFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as any[];
        const members: Member[] = data.map((row) => ({
          id: generateId(),
          name: row['Team Member'] || row['member'] || row['name'] || Object.values(row)[0],
          capacity: parseFloat(row['Capacity'] || row['capacity'] || Object.values(row)[1]) || 0,
        })).filter(m => m.name && m.capacity > 0);
        onMembersImport(members);
      },
    });
  };

  const handleProjectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as any[];
        const projects: Project[] = data.map((row) => ({
          id: generateId(),
          name: row['Project Name'] || row['project'] || row['name'] || Object.values(row)[0],
          effort: parseFloat(row['Required Effort'] || row['effort'] || Object.values(row)[1]) || 0,
        })).filter(p => p.name && p.effort > 0);
        onProjectsImport(projects);
      },
    });
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="bento-card p-4 hover:bg-slate-50">
        <label className="cursor-pointer flex items-center gap-4">
          <div className="p-3 bg-slate-100 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
            <Upload className="w-5 h-5 text-slate-900" />
          </div>
          <div>
            <p className="font-black text-xs uppercase tracking-tight text-slate-900">Import Team Members</p>
            <p className="text-[10px] text-slate-500 font-mono font-bold">File: AI_ProjectTeamMembers.csv</p>
            <p className="text-[9px] text-slate-400 font-mono italic mt-0.5">Columns: "Team Member", "Capacity"</p>
          </div>
          <input
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleMemberFile}
            ref={memberInputRef}
          />
        </label>
      </div>

      <div className="bento-card p-4 hover:bg-slate-50">
        <label className="cursor-pointer flex items-center gap-4">
          <div className="p-3 bg-slate-100 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
            <FileText className="w-5 h-5 text-slate-900" />
          </div>
          <div>
            <p className="font-black text-xs uppercase tracking-tight text-slate-900">Import Project List</p>
            <p className="text-[10px] text-slate-500 font-mono font-bold">File: AI_ProjectList.csv</p>
            <p className="text-[9px] text-slate-400 font-mono italic mt-0.5">Columns: "Project Name", "Required Effort"</p>
          </div>
          <input
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleProjectFile}
            ref={projectInputRef}
          />
        </label>
      </div>
    </div>
  );
}
