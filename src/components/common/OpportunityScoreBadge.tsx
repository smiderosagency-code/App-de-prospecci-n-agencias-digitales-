import React, { useState } from 'react';
import { ScoreBreakdown } from '../../types';
import { Info } from 'lucide-react';

interface Props {
  score: number;
  breakdown?: ScoreBreakdown;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const OpportunityScoreBadge: React.FC<Props> = ({
  score,
  breakdown,
  size = 'md',
  showLabel = false,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  let levelText = 'Baja';

  if (score >= 70) {
    colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-300';
    levelText = 'Alta';
  } else if (score >= 45) {
    colorClasses = 'bg-amber-50 text-amber-800 border-amber-300';
    levelText = 'Media';
  }

  const sizeClasses =
    size === 'sm'
      ? 'text-xs px-2 py-0.5'
      : size === 'lg'
      ? 'text-base px-3 py-1.5'
      : 'text-sm px-2.5 py-1';

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setShowTooltip(!showTooltip);
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`inline-flex items-center gap-1.5 font-medium rounded border tabular-nums transition-colors ${colorClasses} ${sizeClasses}`}
        title="Ver desglose de la puntuación"
      >
        <span className="font-semibold">{score}</span>
        <span className="text-[11px] opacity-75">/100</span>
        {showLabel && <span className="text-[11px] font-normal uppercase tracking-wide">· {levelText}</span>}
        <Info className="w-3 h-3 opacity-60 ml-0.5" />
      </button>

      {showTooltip && breakdown && (
        <div
          role="tooltip"
          className="absolute z-50 left-0 bottom-full mb-2 w-72 p-3 bg-slate-900 text-slate-100 text-xs rounded-lg shadow-xl border border-slate-800 animate-in fade-in"
        >
          <div className="font-semibold text-slate-200 pb-1.5 mb-2 border-b border-slate-800 flex justify-between items-center">
            <span>Desglose de Oportunidad</span>
            <span className="font-mono text-emerald-400 font-bold">{score} pts</span>
          </div>
          <div className="space-y-1.5 text-slate-300">
            <div className="flex justify-between">
              <span>Sin web / solo redes:</span>
              <span className="font-mono text-slate-100 font-medium">+{breakdown.noWebsiteBonus} pts</span>
            </div>
            <div className="flex justify-between">
              <span>Sin botón WhatsApp:</span>
              <span className="font-mono text-slate-100 font-medium">+{breakdown.lacksWhatsAppBonus} pts</span>
            </div>
            <div className="flex justify-between">
              <span>Sin sistema de citas:</span>
              <span className="font-mono text-slate-100 font-medium">+{breakdown.lacksBookingBonus} pts</span>
            </div>
            <div className="flex justify-between">
              <span>Rendimiento / Copyright:</span>
              <span className="font-mono text-slate-100 font-medium">+{breakdown.lowSpeedBonus} pts</span>
            </div>
            <div className="flex justify-between">
              <span>Actividad y clientela:</span>
              <span className="font-mono text-slate-100 font-medium">+{breakdown.highActivityBonus} pts</span>
            </div>
          </div>
          <p className="mt-2 text-[10px] text-slate-400 border-t border-slate-800 pt-1.5">
            Una puntuación más alta indica mayor urgencia y solvencia para contratar servicios digitales.
          </p>
        </div>
      )}
    </div>
  );
};
