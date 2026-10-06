import { useEffect, useState } from 'react';
import {
  Settings,
  Calendar,
  Clock,
  Trophy,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Layers,
  Save,
} from 'lucide-react';
import { useTournament } from '../context/TournamentContext';
import { secondsToTime, timeToSeconds } from '../modules/scoringEngine';
import {
  parseLocalDateTime,
  formatLocalDateInput,
  formatLocalTimeInput,
} from '../modules/teamHelpers';
import { useToast } from './ui/Toast';

const SCORING_PRESETS = [
  {
    name: 'MLBB Intramurals (Time-based Bonus)',
    rules: [
      { minSeconds: 0, maxSeconds: 600, points: 5 },    // Under 10m: 5 pts
      { minSeconds: 601, maxSeconds: 900, points: 4 },  // 10-15m: 4 pts
      { minSeconds: 901, maxSeconds: 3600, points: 3 }, // 15m+: 3 pts
    ],
    lossPoints: 0,
  },
  {
    name: 'Standard Win/Loss (3 Pts / 0 Pts)',
    rules: [{ minSeconds: 0, maxSeconds: 7200, points: 3 }],
    lossPoints: 0,
  },
  {
    name: 'Competitive (Win 3 Pts / Participation 1 Pt)',
    rules: [{ minSeconds: 0, maxSeconds: 7200, points: 3 }],
    lossPoints: 1,
  },
];

export default function TournamentSetup() {
  const {
    tournament,
    scoringConfig,
    lossPoints,
    roundDurationMinutes,
    breakDurationMinutes,
    numberOfLobbies,
    tournamentStartTime,
    teams,
    updateTournament,
    setScoringConfig,
    setLossPoints,
    setRoundDuration,
    setBreakDuration,
    setNumberOfLobbiesFunc,
    setTournamentStartTimeFunc,
  } = useTournament();

  const toast = useToast();

  const [formData, setFormData] = useState(() => ({
    tournamentName: tournament?.name || 'UCB Intramurals 2026 Esports Championship',
    organizerName: tournament?.organizer || 'UCB Supreme Student Council & Webmasters Esports',
    tournamentDate: tournament?.date || formatLocalDateInput(tournamentStartTime) || '2026-10-15',
    startTime: formatLocalTimeInput(tournamentStartTime) || '09:00',
    numTeams: Math.max(2, teams.length || tournament?.expectedTeams || 12),
    format: tournament?.format || 'single-round-robin',
    lobbies: numberOfLobbies || 2,
    matchDuration: roundDurationMinutes || 25,
    breakDuration: breakDurationMinutes || 10,
    scoringRules:
      scoringConfig?.length > 0
        ? scoringConfig
        : [
            { minSeconds: 0, maxSeconds: 600, points: 5 },
            { minSeconds: 601, maxSeconds: 900, points: 4 },
            { minSeconds: 901, maxSeconds: 3600, points: 3 },
          ],
    lossPoints: lossPoints || 0,
  }));

  // Sync if external tournament loaded
  useEffect(() => {
    if (!tournament) return;
    setFormData((prev) => ({
      ...prev,
      tournamentName: tournament.name || prev.tournamentName,
      organizerName: tournament.organizer || prev.organizerName,
      tournamentDate: tournament.date || formatLocalDateInput(tournamentStartTime) || prev.tournamentDate,
      startTime: formatLocalTimeInput(tournamentStartTime) || prev.startTime,
      format: tournament.format || prev.format,
      lobbies: numberOfLobbies || prev.lobbies,
      matchDuration: roundDurationMinutes || prev.matchDuration,
      breakDuration: breakDurationMinutes || prev.breakDuration,
      scoringRules: scoringConfig?.length > 0 ? scoringConfig : prev.scoringRules,
      lossPoints: lossPoints != null ? lossPoints : prev.lossPoints,
    }));
  }, [
    tournament,
    numberOfLobbies,
    roundDurationMinutes,
    breakDurationMinutes,
    tournamentStartTime,
    scoringConfig,
    lossPoints,
  ]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const newValue = type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleApplyPreset = (preset) => {
    setFormData((prev) => ({
      ...prev,
      scoringRules: preset.rules,
      lossPoints: preset.lossPoints,
    }));
    toast.info(`Applied ${preset.name} scoring template`);
  };

  const handleAddScoringRule = () => {
    setFormData((prev) => ({
      ...prev,
      scoringRules: [...prev.scoringRules, { minSeconds: 0, maxSeconds: 1200, points: 3 }],
    }));
  };

  const handleRemoveScoringRule = (index) => {
    setFormData((prev) => {
      const newRules = [...prev.scoringRules];
      newRules.splice(index, 1);
      return { ...prev, scoringRules: newRules };
    });
  };

  const updateRuleTime = (index, field, timeStr) => {
    const seconds = timeToSeconds(timeStr);
    setFormData((prev) => {
      const newRules = [...prev.scoringRules];
      newRules[index] = {
        ...newRules[index],
        [field]: Number.isFinite(seconds) ? seconds : 0,
      };
      return { ...prev, scoringRules: newRules };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.tournamentName.trim() || !formData.organizerName.trim() || !formData.tournamentDate) {
      toast.error('Please complete tournament name, organizer, and date.');
      return;
    }
    if (formData.numTeams < 2) {
      toast.error('Expected number of teams must be at least 2.');
      return;
    }

    const start = parseLocalDateTime(formData.tournamentDate, formData.startTime);
    if (!start) {
      toast.error('Invalid date or start time.');
      return;
    }

    updateTournament({
      name: formData.tournamentName.trim(),
      organizer: formData.organizerName.trim(),
      date: formData.tournamentDate,
      format: formData.format,
      expectedTeams: formData.numTeams,
    });

    setScoringConfig(
      formData.scoringRules.map((rule) => ({
        minSeconds: Number(rule.minSeconds) || 0,
        maxSeconds: Number(rule.maxSeconds) || 0,
        points: Number(rule.points) || 0,
      }))
    );

    setLossPoints(Number(formData.lossPoints) || 0);
    setRoundDuration(Number(formData.matchDuration) || 20);
    setBreakDuration(Number(formData.breakDuration) || 0);
    setNumberOfLobbiesFunc(Math.max(1, Number(formData.lobbies) || 1));
    setTournamentStartTimeFunc(start);

    toast.success('Tournament configuration saved successfully!');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-950 shadow-2xl backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Settings className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Tournament Configuration
            </h1>
          </div>
          <p className="text-sm text-slate-300">
            Define tournament identity, automated match schedule waves, and points scoring rules.
          </p>
        </div>

      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Tournament Identity */}
        <div className="p-6 rounded-3xl border border-slate-800/90 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950 shadow-xl backdrop-blur-md space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Trophy className="w-4 h-4 text-blue-400" />
            <h2 className="text-base font-black text-white">Event Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5" htmlFor="tournamentName">
                Tournament Name
              </label>
              <input
                id="tournamentName"
                type="text"
                name="tournamentName"
                value={formData.tournamentName}
                onChange={handleChange}
                placeholder="e.g. UCB Intramurals 2026 Esports Championship"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 shadow-inner"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5" htmlFor="organizerName">
                Host / Organizer
              </label>
              <input
                id="organizerName"
                type="text"
                name="organizerName"
                value={formData.organizerName}
                onChange={handleChange}
                placeholder="e.g. UCB Supreme Student Council"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 shadow-inner"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5" htmlFor="tournamentDate">
                Scheduled Date
              </label>
              <input
                id="tournamentDate"
                type="date"
                name="tournamentDate"
                value={formData.tournamentDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 shadow-inner"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5" htmlFor="numTeams">
                Expected Department Teams
              </label>
              <input
                id="numTeams"
                type="number"
                min="2"
                name="numTeams"
                value={formData.numTeams}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 shadow-inner"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 2: Time Scheduling & Lobbies */}
        <div className="p-6 rounded-3xl border border-slate-800/90 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950 shadow-xl backdrop-blur-md space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Clock className="w-4 h-4 text-blue-400" />
            <h2 className="text-base font-black text-white">Wave Scheduling & Match Slots</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5" htmlFor="startTime">
                First Match Start Time
              </label>
              <input
                id="startTime"
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5" htmlFor="lobbies">
                Concurrent Lobbies
              </label>
              <input
                id="lobbies"
                type="number"
                min="1"
                name="lobbies"
                value={formData.lobbies}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 shadow-inner"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Number of simultaneous matches
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5" htmlFor="matchDuration">
                Match Duration (min)
              </label>
              <input
                id="matchDuration"
                type="number"
                min="1"
                name="matchDuration"
                value={formData.matchDuration}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5" htmlFor="breakDuration">
                Break Duration (min)
              </label>
              <input
                id="breakDuration"
                type="number"
                min="0"
                name="breakDuration"
                value={formData.breakDuration}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Scoring Engine Rules */}
        <div className="p-6 rounded-3xl border border-slate-800/90 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950 shadow-xl backdrop-blur-md space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              <div>
                <h2 className="text-base font-black text-white">MLBB Scoring Configuration</h2>
                <p className="text-xs text-slate-400">
                  MLBB uses duration-based points; Valorant awards 3 points per win and uses round differential as a tiebreaker.
                </p>
              </div>
            </div>

            {/* Presets Bar */}
            <div className="flex flex-wrap gap-1.5">
              {SCORING_PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-[11px] font-bold text-slate-300 hover:text-white border border-slate-700 transition-colors"
                >
                  {p.name.split(' ')[0]} Preset
                </button>
              ))}
            </div>
          </div>

          {/* Rules List */}
          <div className="space-y-3">
            {formData.scoringRules.map((rule, index) => (
              <div
                key={index}
                className="p-4 rounded-2xl border border-slate-800 bg-slate-950/60 grid grid-cols-1 sm:grid-cols-[1fr_1fr_120px_auto] items-center gap-4"
              >
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Min Duration (MM:SS)
                  </label>
                  <input
                    type="text"
                    value={secondsToTime(rule.minSeconds ?? 0)}
                    onChange={(e) => updateRuleTime(index, 'minSeconds', e.target.value)}
                    placeholder="00:00"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Max Duration (MM:SS)
                  </label>
                  <input
                    type="text"
                    value={
                      Number.isFinite(rule.maxSeconds) ? secondsToTime(rule.maxSeconds) : ''
                    }
                    onChange={(e) => updateRuleTime(index, 'maxSeconds', e.target.value)}
                    placeholder="10:00"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Points Awarded
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={rule.points}
                    onChange={(e) => {
                      const points = parseInt(e.target.value, 10) || 0;
                      setFormData((prev) => {
                        const newRules = [...prev.scoringRules];
                        newRules[index] = { ...newRules[index], points };
                        return { ...prev, scoringRules: newRules };
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end sm:pt-4">
                  {formData.scoringRules.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => handleRemoveScoringRule(index)}
                      className="p-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                      title="Remove Rule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="w-8" />
                  )}
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleAddScoringRule}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Time Bracket</span>
              </button>

              <div className="flex items-center gap-3">
                <label className="text-xs text-slate-300 font-semibold flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.lossPoints > 0}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        lossPoints: e.target.checked ? 1 : 0,
                      }))
                    }
                    className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700"
                  />
                  <span>Award points on loss:</span>
                </label>
                {formData.lossPoints > 0 && (
                  <input
                    type="number"
                    min="0"
                    name="lossPoints"
                    value={formData.lossPoints}
                    onChange={handleChange}
                    className="w-16 px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs text-center font-bold"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="submit"
            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-blue-600/30 active:scale-95 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Tournament Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}