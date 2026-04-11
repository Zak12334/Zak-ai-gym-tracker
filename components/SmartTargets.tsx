
import React, { useState } from 'react';
import { SmartTarget } from '../utils';

interface SmartTargetsProps {
  target: SmartTarget;
  exerciseName: string;
}

export const SmartTargets: React.FC<SmartTargetsProps> = ({ target, exerciseName }) => {
  const [expanded, setExpanded] = useState(false);

  const getTrendIcon = () => {
    switch (target.trend) {
      case 'progressing': return { icon: '↑', color: 'text-green-500', label: 'Progressing' };
      case 'maintaining': return { icon: '→', color: 'text-yellow-500', label: 'Maintaining' };
      case 'regressing': return { icon: '↓', color: 'text-red-500', label: 'Regressing' };
      default: return { icon: '•', color: 'text-slate-500', label: 'No trend yet' };
    }
  };

  const trend = getTrendIcon();

  // Collapsed view - minimal info
  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full mb-3 bg-slate-900/50 rounded-xl p-3 border border-white/5 flex items-center justify-between active:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-blue-600/20 flex items-center justify-center">
            <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Smart Target</span>
        </div>
        <div className="flex items-center gap-2">
          {target.hasData && (
            <span className={`text-sm font-black ${trend.color}`}>{trend.icon}</span>
          )}
          {target.weightIncreasePhase && (
            <span className="text-[8px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">New Weight</span>
          )}
          {target.plateauDetected && !target.weightIncreasePhase && (
            <span className="text-[8px] font-black uppercase tracking-wider bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full">Plateau</span>
          )}
          {target.missedLastWeek && (
            <span className="text-[8px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-500 px-2 py-0.5 rounded-full">Missed</span>
          )}
          <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
    );
  }

  // Expanded view - full details
  return (
    <div className="mb-3 bg-slate-900/50 rounded-xl border border-white/5 overflow-hidden">
      <button
        onClick={() => setExpanded(false)}
        className="w-full p-3 flex items-center justify-between active:bg-slate-800/50 transition-colors border-b border-white/5"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-blue-600/20 flex items-center justify-center">
            <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Smart Target</span>
        </div>
        <svg className="w-4 h-4 text-slate-600 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div className="p-3 space-y-3">
        {/* Main suggestion message */}
        <p className="text-sm text-white font-medium">{target.message}</p>

        {/* Stats row */}
        {target.hasData && target.lastSession && (
          <div className="flex items-center gap-4 flex-wrap">
            {/* Trend indicator */}
            <div className="flex items-center gap-1">
              <span className={`text-lg font-black ${trend.color}`}>{trend.icon}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{trend.label}</span>
            </div>

            {/* Last session */}
            {target.daysSinceLastSession !== null && target.daysSinceLastSession > 0 && (
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                Last: {target.daysSinceLastSession}d ago
              </div>
            )}

            {/* Badges */}
            {target.weightIncreasePhase && (
              <span className="text-[8px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                Building at New Weight
              </span>
            )}
            {target.plateauDetected && !target.weightIncreasePhase && (
              <span className="text-[8px] font-black uppercase tracking-wider bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded-full">
                Plateau Detected
              </span>
            )}
            {target.missedLastWeek && (
              <span className="text-[8px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-500 px-2 py-1 rounded-full">
                Missed Last Week
              </span>
            )}
          </div>
        )}

        {/* Target display */}
        {target.targetWeight && target.targetReps && (
          <div className="bg-white/5 rounded-lg p-3 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Target Today</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-blue-400">{target.targetWeight}kg</span>
              <span className="text-slate-600">×</span>
              <span className="text-lg font-black text-white">{target.targetReps}</span>
              <span className="text-[10px] font-bold uppercase text-slate-600">reps</span>
            </div>
          </div>
        )}

        {/* Rep-building progress bar (shown when building at new weight) */}
        {target.weightIncreasePhase && target.lastSession && target.repGoal && (
          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Rep Progress at {target.lastSession.bestSet.weight}kg</span>
              <span className="text-xs font-bold text-blue-400">{target.lastSession.bestSet.reps}/{target.repGoal}</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-600 to-blue-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (target.lastSession.bestSet.reps / target.repGoal) * 100)}%` }}
              />
            </div>
            <p className="text-[9px] text-slate-600 mt-1.5">
              {target.repGoal - target.lastSession.bestSet.reps > 0
                ? `${target.repGoal - target.lastSession.bestSet.reps} more reps until next weight increase`
                : 'Ready for next weight increase!'
              }
            </p>
          </div>
        )}

        {/* Confidence indicator */}
        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-700 text-right">
          {target.confidence}
        </p>
      </div>
    </div>
  );
};
