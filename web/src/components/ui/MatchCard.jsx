import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTournament } from '../../context/TournamentContext';
import { Gamepad2, Flame, Trophy, CheckCircle2, AlertTriangle, Clock, TrendingUp } from 'lucide-react';

export default function MatchCard({
  match,
  teamA,
  teamB,
  result,
  showResult = true,
  compact = false,
  onDetailsClick
}) {
  const { activeGame } = useTournament();
  const [isHovered, setIsHovered] = useState(false);

  // Determine if match has result
  const hasResult = result && Object.keys(result).length > 0;

  // Get team colors based on game — WEBMASTERS esports palette
  const getTeamColors = (game) => {
    if (game === 'mlbb') {
      return {
        primary: 'text-[#00e5ff]',
        bg: '',
        border: 'border-[rgba(0,229,255,0.28)]',
        icon: Gamepad2
      };
    } else if (game === 'valorant') {
      return {
        primary: 'text-[#ff4655]',
        bg: '',
        border: 'border-[rgba(255,70,85,0.32)]',
        icon: Flame
      };
    }
    return {
      primary: 'text-[#4dcdff]',
      bg: '',
      border: 'border-[rgba(77,205,255,0.25)]',
      icon: Gamepad2
    };
  };

  const teamAColors = getTeamColors(teamA?.game || activeGame);
  const teamBColors = getTeamColors(teamB?.game || activeGame);

  // Determine winner team
  const winnerTeamId = result?.winnerTeamId;
  const isTeamAWinner = winnerTeamId === teamA?.id;
  const isTeamBWinner = winnerTeamId === teamB?.id;

  const handleDetailsClick = () => {
    if (onDetailsClick) {
      onDetailsClick(match);
    }
  };

  return (
    <div
      className={`wm-panel wm-clip relative flex flex-col h-full ${teamAColors.border}
      hover:-translate-y-1 hover:shadow-[0_12px_40px_-8px_rgba(0,163,255,0.35)]
      transition-all duration-200 ${isHovered ? 'shadow-xl' : 'shadow-lg'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Match Header */}
      <div className="flex flex-col items-center text-center p-4 space-y-3">
        {/* Match Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-center space-x-3">
            {/* Team A */}
            <div className="flex-1 flex flex-col items-center">
              {teamA?.logo ? (
                <img
                  src={teamA.logo}
                  alt={`${teamA.name} logo`}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-700/50"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl flex items-center justify-center
                font-bold text-xs
                bg-gradient-to-br from-slate-800 to-slate-950
                border border-slate-700/50">
                  {teamA?.tag?.slice(0, 2) || '??'}
                </div>
              )}
              <span className="mt-1 text-xs font-medium truncate max-w-xs">
                {teamA?.name}
              </span>
            </div>

            {/* VS */}
            <div className="flex flex-col items-center px-2">
              <span className="font-display text-sm font-black tracking-[0.2em] text-white wm-num-glow">VS</span>
              {hasResult && (
                <div className="mt-1 flex items-center space-x-1 text-sm">
                  {isTeamAWinner && <Trophy className="w-4 h-4 text-amber-400" />}
                  {isTeamBWinner && <Trophy className="w-4 h-4 text-rose-400" />}
                </div>
              )}
            </div>

            {/* Team B */}
            <div className="flex-1 flex flex-col items-center">
              {teamB?.logo ? (
                <img
                  src={teamB.logo}
                  alt={`${teamB.name} logo`}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-700/50"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl flex items-center justify-center
                font-bold text-xs
                bg-gradient-to-br from-slate-800 to-slate-950
                border border-slate-700/50">
                  {teamB?.tag?.slice(0, 2) || '??'}
                </div>
              )}
              <span className="mt-1 text-xs font-medium truncate max-w-xs">
                {teamB?.name}
              </span>
            </div>
          </div>

          {/* Match Metadata */}
          <div className="flex items-center justify-between w-full px-4 space-x-3 text-xs text-slate-400">
            <span>
              <Clock className="w-4 h-4 mr-1" />
              {match.round !== undefined ? `Round ${match.round + 1}` : 'TBD'}
            </span>
            <span>
              {match.group && (
                <span className="px-2 py-0.5 rounded text-xs font-medium
                bg-slate-800/20">
                  Group {match.group}
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Result Section */}
      {showResult && hasResult && (
        <div className="flex-1 flex flex-col p-4 space-y-3 border-t border-slate-800/20">
          {/* Game-specific result details */}
          {activeGame === 'mlbb' && (
            <>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Duration</span>
                <span className="font-mono">
                  {result.durationSeconds ? `${Math.floor(result.durationSeconds / 60)}:${result.durationSeconds % 60
                    .toString()
                    .padStart(2, '0')}` : '0:00'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Kills</span>
                <span className="font-mono space-x-2">
                  {result.killsA ?? 0} - {result.killsB ?? 0}
                  {result.killsA > result.killsB && (
                    <span className="text-xs text-emerald-400">▲</span>
                  )}
                  {result.killsB > result.killsA && (
                    <span className="text-xs text-rose-400">▼</span>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Objectives</span>
                <span className="font-mono space-x-2">
                  {result.objectivesA ?? 0} - {result.objectivesB ?? 0}
                  {result.objectivesA > result.objectivesB && (
                    <span className="text-xs text-emerald-400">▲</span>
                  )}
                  {result.objectivesB > result.objectivesA && (
                    <span className="text-xs text-rose-400">▼</span>
                  )}
                </span>
              </div>
            </>
          )}

          {activeGame === 'valorant' && (
            <>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Rounds</span>
                <span className="font-mono space-x-2">
                  {result.roundsA ?? 0} - {result.roundsB ?? 0}
                  {result.roundsA > result.roundsB && (
                    <span className="text-xs text-emerald-400">▲</span>
                  )}
                  {result.roundsB > result.roundsA && (
                    <span className="text-xs text-rose-400">▼</span>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Kills</span>
                <span className="font-mono space-x-2">
                  {result.killsA ?? 0} - {result.killsB ?? 0}
                  {result.killsA > result.killsB && (
                    <span className="text-xs text-emerald-400">▲</span>
                  )}
                  {result.killsB > result.killsA && (
                    <span className="text-xs text-rose-400">▼</span>
                  )}
                </span>
              </div>
            </>
          )}

          {/* Points */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Points</span>
            <span className="font-mono space-x-2">
              {(result.pointsA ?? 0)} - {(result.pointsB ?? 0)}
              {result.pointsA > result.pointsB && (
                <span className="text-xs text-emerald-400">▲</span>
              )}
              {result.pointsB > result.pointsA && (
                <span className="text-xs text-rose-400">▼</span>
              )}
            </span>
          </div>

          {/* Match Status Indicator */}
          <div className="mt-2 flex items-center justify-center px-3 py-1 rounded-xl
            text-xs font-medium
            {!result.winnerTeamId ? 'bg-slate-800/20 text-slate-400' :
              isTeamAWinner ? 'bg-amber-500/20 text-amber-400' :
              isTeamBWinner ? 'bg-rose-500/20 text-rose-400' :
              'bg-slate-800/20 text-slate-400'}">
            {!result.winnerTeamId ? 'Pending' :
              isTeamAWinner ? `${teamA?.name} Wins` :
              isTeamBWinner ? `${teamB?.name} Wins` :
              'Completed'}
          </div>
        </div>
      )}

      {/* Action Button */}
      {!compact && (
        <div className="mt-4 pt-4 border-t border-slate-800/20">
          <button
            onClick={handleDetailsClick}
            className={`w-full flex items-center justify-center px-3 py-2
            text-xs font-semibold rounded-xl
            bg-slate-800/50 hover:bg-slate-700/50
            text-slate-300 hover:text-white
            transition-all duration-200
            border border-slate-700/30`}>
            <TrendingUp className="w-4 h-4 mr-2" />
            View Details
          </button>
        </div>
      )}
    </div>
  );
}