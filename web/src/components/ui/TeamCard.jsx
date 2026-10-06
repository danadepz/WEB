import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTournament } from '../../context/TournamentContext';
import { secondsToTime } from '../../modules/scoringEngine';
import { TrendingUp, Trophy, Clock, Shield, Flame, Gamepad2 } from 'lucide-react';

export default function TeamCard({
  team,
  standingsData = null,
  showActions = false,
  compact = false,
  onActionClick
}) {
  const { activeGame } = useTournament();
  const [isHovered, setIsHovered] = useState(false);

  // Determine if team has logo
  const hasLogo = team.logo && team.logo.trim() !== '';

  // Get standings data if not provided
  const standings = standingsData || {
    played: 0,
    wins: 0,
    losses: 0,
    points: 0,
    scoreDifferential: 0,
    roundsFor: 0,
    roundsAgainst: 0,
    roundDifferential: 0,
    winRate: 0,
    averageWinTime: 0
  };

  // Determine team colors based on game — WEBMASTERS esports palette
  const getTeamColors = (game) => {
    if (game === 'mlbb') {
      return {
        bg: '',
        border: 'border-[rgba(0,229,255,0.28)]',
        hoverBorder: 'hover:border-[rgba(0,229,255,0.55)]',
        accent: 'text-[#00e5ff]',
        accentBg: 'bg-[rgba(0,229,255,0.12)]',
        icon: Gamepad2
      };
    } else if (game === 'valorant') {
      return {
        bg: '',
        border: 'border-[rgba(255,70,85,0.32)]',
        hoverBorder: 'hover:border-[rgba(255,70,85,0.6)]',
        accent: 'text-[#ff4655]',
        accentBg: 'bg-[rgba(255,70,85,0.12)]',
        icon: Flame
      };
    }
    return {
      bg: '',
      border: 'border-[rgba(77,205,255,0.25)]',
      hoverBorder: 'hover:border-[rgba(77,205,255,0.5)]',
      accent: 'text-[#4dcdff]',
      accentBg: 'bg-[rgba(77,205,255,0.12)]',
      icon: Gamepad2
    };
  };

  const teamColors = getTeamColors(team.game || activeGame);

  const handleActionClick = () => {
    if (onActionClick) {
      onActionClick(team);
    }
  };

  return (
    <div
      className={`wm-panel wm-clip relative flex flex-col h-full ${teamColors.border} ${teamColors.hoverBorder}
      hover:-translate-y-1 hover:shadow-[0_12px_40px_-8px_rgba(0,163,255,0.35)]
      transition-all duration-200 ${isHovered ? 'shadow-xl' : 'shadow-lg'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Team Header */}
      <div className="flex flex-col items-center text-center p-4 space-y-3">
        {/* Logo/Crest */}
        <div className="relative w-16 h-16 mb-2">
          {hasLogo ? (
            <img
              src={team.logo}
              alt={`${team.name} crest`}
              className="w-full h-full rounded-xl bg-transparent object-contain
              hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full rounded-xl flex items-center justify-center
            font-bold text-xl
            bg-gradient-to-br from-slate-800 to-slate-950
            border border-slate-700/50">
              {team.tag?.slice(0, 3) || '??'}
            </div>
          )}
          {/* Team Rank Badge (if showing standings) */}
          {standingsData && standings.rank <= 3 && (
            <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center">
              <div className={`flex h-3 w-3 rounded-full
                ${standings.rank === 1 ? 'bg-amber-500' :
                  standings.rank === 2 ? 'bg-slate-700' :
                  standings.rank === 3 ? 'bg-amber-900' : 'bg-slate-600'}`}>
                <span className="text-xs text-slate-950 font-bold">{standings.rank}</span>
              </div>
            </div>
          )}
        </div>

        {/* Team Info */}
        <div className="text-center">
          <h3 className={`font-display font-bold text-white text-lg
            mb-1 truncate max-w-xs tracking-wide`}>
            {team.name}
          </h3>
          <span className={`font-display text-[10px] font-bold tracking-[0.2em]
            ${teamColors.accentBg} ${teamColors.accent}
            px-2 py-0.5`}>
            #{team.tag}
          </span>
        </div>
      </div>

      {/* Stats Section (if showing standings data) */}
      {standingsData && (
        <div className="flex-1 flex flex-col p-4 space-y-2">
          {/* Record */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Record</span>
            <span className="font-mono">
              {standings.wins}W - {standings.losses}L
            </span>
          </div>

          {/* Points */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Points</span>
            <span className={`font-mono
              ${standings.points > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
              {standings.points} pts
            </span>
          </div>

          {/* Win Rate */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Win Rate</span>
            <span className="font-mono text-slate-400">
              {standings.winRate.toFixed(1)}%
            </span>
          </div>

          {/* Game-specific stat */}
          {activeGame === 'mlbb' && standings.averageWinTime > 0 && (
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Avg Win Time</span>
              <span className="font-mono text-slate-400">
                {secondsToTime(standings.averageWinTime)}
              </span>
            </div>
          )}

          {activeGame === 'valorant' && (
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Round Diff</span>
              <span className="flex items-center gap-2 font-mono">
                <span className={standings.roundDifferential > 0 ? 'text-emerald-400' : standings.roundDifferential < 0 ? 'text-rose-400' : 'text-slate-400'}>
                  {standings.roundDifferential > 0
                    ? `+${standings.roundDifferential}`
                    : standings.roundDifferential}
                </span>
                <span className="text-[10px] text-slate-500">
                  {standings.roundsFor}-{standings.roundsAgainst}
                </span>
              </span>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {showActions && (
        <div className="mt-4 pt-4 border-t border-slate-800/20">
          <button
            onClick={handleActionClick}
            className={`w-full flex items-center justify-center px-3 py-2
            text-xs font-semibold rounded-xl
            bg-slate-800/50 hover:bg-slate-700/50
            text-slate-300 hover:text-white
            transition-all duration-200
            border border-slate-700/30`}>
            {teamColors.icon && <teamColors.icon className="w-4 h-4 mr-2" />}
            View Details
          </button>
        </div>
      )}
    </div>
  );
}