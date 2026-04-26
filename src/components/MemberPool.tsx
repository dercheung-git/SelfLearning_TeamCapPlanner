import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { User, Info, Trash2 } from 'lucide-react';
import { Member } from '../types';
import { cn, formatNumber } from '../lib/utils';

interface DraggableMemberProps {
  member: Member;
  remainingCapacity: number;
  onRemove: (id: string) => void;
  key?: string | number;
}

export function DraggableMember({ member, remainingCapacity, onRemove }: DraggableMemberProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `member-${member.id}`,
    data: { member },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "p-4 bg-white border-2 border-slate-900 rounded-xl shadow-bento hover:shadow-bento-hover hover:-translate-y-0.5 transition-all cursor-grab active:cursor-grabbing group",
        isDragging && "opacity-50 scale-95 shadow-none relative z-50",
        remainingCapacity <= 0 && "opacity-50 grayscale"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-slate-100 border border-slate-200 rounded-lg">
            <User className="w-4 h-4 text-slate-900" />
          </div>
          <span className="font-black text-xs uppercase tracking-tight text-slate-900">{member.name}</span>
        </div>
        <div className={cn(
          "text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] uppercase tracking-widest",
          remainingCapacity > 0 ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"
        )}>
          {remainingCapacity > 0 ? "Avail" : "Full"}
        </div>
      </div>
      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase mb-2">
        <span>Capacity</span>
        <span className="font-mono text-blue-600">{formatNumber(member.capacity)}d</span>
      </div>
      <div className="w-full bg-slate-100 border border-slate-200 rounded-full h-2 overflow-hidden shadow-inner">
        <div 
          className="bg-blue-500 h-full transition-all duration-500"
          style={{ width: `${(remainingCapacity / member.capacity) * 100}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between items-center">
        <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">
          REMAINING: {formatNumber(remainingCapacity)}d
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(member.id);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
          title="Remove Member"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
