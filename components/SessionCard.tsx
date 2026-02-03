
import React from 'react';
import { WorkoutSession } from '../types';
import { calculateSessionVolume, formatDuration } from '../utils';

interface SessionCardProps {
  session: WorkoutSession;
  onDelete?: () => void;
}

export const SessionCard: React.FC<SessionCardProps> = ({ session, onDelete }) => {
  const volume = calculateSessionVolume(session);
  const date = new Date(session.date).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="bg-slate-900/30 rounded-2xl p-4 mb-3 border border-white/5 flex justify-between items-center group relative overflow-hidden backdrop-blur-sm">
      <div className="flex-1">
        <h3 className="font-bold text-white text-lg tracking-tight uppercase italic">{session.type}</h3>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{date} • {formatDuration(session.duration || 0)}</p>
      </div>
      <div className="text-right flex items-center gap-4">
        <div>
          <p className="text-sm font-black text-blue-500">{volume.toLocaleString()} kg</p>
          <p className="text-[8px] uppercase tracking-widest text-slate-700 font-black">Vol</p>
        </div>
        {onDelete && (
          <button 
            onClick={(e) => {
                e.stopPropagation();
                onDelete();
            }}
            className="p-3 bg-red-950/20 text-red-900 rounded-xl active:bg-red-900 active:text-white transition-all border border-red-950/30"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
