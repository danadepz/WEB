import { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Edit3,
  Gamepad2,
  Flame,
  Trash2,
} from 'lucide-react';
import { useTournament } from '../context/TournamentContext';
import { DEFAULT_GAME, gameLabel, gameShort } from '../modules/games';
import ConfirmModal from './ui/ConfirmModal';
import { useToast } from './ui/Toast';
import TeamRosterManager from './TeamRosterManager';
import { optimizeImageFile } from '../modules/imageUtils';
import { UC_DEPARTMENTS } from '../modules/departments';

const UCB_DEPARTMENT_PRESETS = UC_DEPARTMENTS;

const emptyForm = {
  editingTeamId: null,
  name: '',
  tag: '',
  logo: null,
  existingLogo: null,
  seed: 0,
  group: 'A',
  game: DEFAULT_GAME,
};

function TeamAdminCard({ team, selected, onSelect, onEdit, onRoster, onDelete }) {
  const playerCount = (team.players || []).filter((player) => player.active !== false).length;
  return (
      <article className="rounded-lg border border-[#252a31] bg-[#101317] p-2">
      <div className="flex min-w-0 items-center gap-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={(event) => onSelect(team.id, event.target.checked)}
          aria-label={`Select ${team.name}`}
          className="h-4 w-4 shrink-0 accent-sky-500"
        />
        {team.logo ? (
          <img src={team.logo} alt="" className="h-12 w-12 shrink-0 rounded-lg border border-[#343a43] object-cover" />
        ) : (
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-[#343a43] bg-[#181d23] text-xs font-bold text-slate-300">
            {team.tag?.slice(0, 2) || 'TM'}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-xs font-bold text-slate-100">{team.name}</h3>
          <p className="mt-1 truncate text-[10px] text-slate-500">#{team.tag} · Group {team.group || 'A'} · {gameShort(team.game)}</p>
          <p className="mt-1 text-[10px] text-sky-300">{playerCount} active players</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 border-t border-[#252a31] pt-2">
        <button type="button" onClick={() => onEdit(team)} className="inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-2 text-[10px] font-semibold text-slate-500 hover:bg-[#1b2027] hover:text-white">
          <Edit3 className="h-3 w-3" /> Edit team
        </button>
        <button type="button" onClick={() => onRoster(team)} className="inline-flex items-center justify-center gap-1.5 rounded-md bg-[#172431] px-2 py-2 text-[10px] font-semibold text-sky-200 hover:bg-[#213448]">
          <Users className="h-3 w-3" /> Players
        </button>
        <button type="button" onClick={() => onDelete(team)} className="inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-2 text-[10px] font-semibold text-rose-300 hover:bg-rose-500/10">
          <Trash2 className="h-3 w-3" /> Remove
        </button>
      </div>
    </article>
  );
}

export default function TeamManagement() {
  const {
    teams,
    allTeams,
    activeGame,
    setActiveGame,
    addTeam,
    updateTeam,
    deleteTeams,
  } = useTournament();

  const toast = useToast();
  const [formState, setFormState] = useState({ ...emptyForm, game: activeGame });
  const [logoPreview, setLogoPreview] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteTargetTeams, setDeleteTargetTeams] = useState([]);
  const [selectedTeamIds, setSelectedTeamIds] = useState([]);
  const [rosterTeam, setRosterTeam] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormState((prev) => ({ ...prev, logo: file }));
      optimizeImageFile(file, 400, { square: true })
        .then(setLogoPreview)
        .catch((error) => toast.error(error.message || 'Could not load that team image.'));
    } else {
      setFormState((prev) => ({ ...prev, logo: null }));
      setLogoPreview(formState.existingLogo);
    }
  };

  const applyPreset = (preset) => {
    setFormState((prev) => ({
      ...prev,
      name: preset.name,
      tag: preset.tag,
    }));
  };

  const resetForm = () => {
    setFormState({ ...emptyForm, game: activeGame });
    setLogoPreview(null);
    setIsFormOpen(false);
    const input = document.getElementById('logo-input');
    if (input) input.value = '';
  };

  const persistTeam = (teamData) => {
    if (formState.editingTeamId) {
      updateTeam(teamData);
      toast.success(`Updated ${teamData.name} (${teamData.tag})`);
    } else {
      addTeam(teamData);
      toast.success(`Registered ${teamData.name} to Group ${teamData.group}`);
    }
    const nextGame = teamData.game || activeGame;
    if (nextGame !== activeGame) {
      setActiveGame(nextGame);
    }
    resetForm();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, tag, logo, existingLogo, seed, group, game, editingTeamId } = formState;
    if (!name.trim() || !tag.trim()) {
      toast.error('Please enter department name and tag.');
      return;
    }

    const teamData = {
      id:
        editingTeamId ||
        `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 9)}`,
      name: name.trim(),
      tag: tag.trim().toUpperCase(),
      seed: parseInt(seed, 10) || 0,
      group,
      game: game || activeGame,
    };

    if (logo) {
      optimizeImageFile(logo, 400, { square: true })
        .then((logoData) => persistTeam({ ...teamData, logo: logoData }))
        .catch((error) => toast.error(error.message || 'Could not save that team image.'));
      return;
    }

    persistTeam({
      ...teamData,
      logo: editingTeamId ? existingLogo || null : null,
    });
  };

  const handleEditTeam = (team) => {
    setFormState({
      editingTeamId: team.id,
      name: team.name,
      tag: team.tag,
      logo: null,
      existingLogo: team.logo || null,
      seed: team.seed ?? 0,
      group: team.group || 'A',
      game: team.game || activeGame,
    });
    setLogoPreview(team.logo || null);
    setIsFormOpen(true);
    window.scrollTo({ top: 150, behavior: 'smooth' });
  };

  const handleDeleteConfirm = () => {
    if (deleteTargetTeams.length) {
      deleteTeams(deleteTargetTeams.map((team) => team.id));
      toast.success(
        deleteTargetTeams.length === 1
          ? `Removed ${deleteTargetTeams[0].name}`
          : `Removed ${deleteTargetTeams.length} teams`
      );
      setSelectedTeamIds((selected) =>
        selected.filter((id) => !deleteTargetTeams.some((team) => team.id === id))
      );
      setDeleteTargetTeams([]);
    }
  };

  const mlbbCount = allTeams.filter((t) => (t.game || DEFAULT_GAME) === 'mlbb').length;
  const valorantCount = allTeams.filter((t) => t.game === 'valorant').length;

  const countA = teams.filter((t) => (t.group || 'A') === 'A').length;
  const countB = teams.filter((t) => t.group === 'B').length;

  // Filtered teams list
  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      if (groupFilter !== 'all' && (team.group || 'A') !== groupFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = team.name.toLowerCase().includes(q);
        const matchesTag = team.tag?.toLowerCase().includes(q);
        if (!matchesName && !matchesTag) return false;
      }
      return true;
    });
  }, [teams, groupFilter, searchQuery]);
  const selectedVisibleTeams = filteredTeams.filter((team) => selectedTeamIds.includes(team.id));
  const allVisibleSelected = filteredTeams.length > 0
    && filteredTeams.every((team) => selectedTeamIds.includes(team.id));

  const toggleSelectVisibleTeams = () => {
    setSelectedTeamIds((current) => {
      const visibleIds = new Set(filteredTeams.map((team) => team.id));
      return allVisibleSelected
        ? current.filter((id) => !visibleIds.has(id))
        : [...new Set([...current, ...visibleIds])];
    });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-4 px-4 py-5 sm:px-6 sm:py-7 animate-fadeIn">
      {/* Delete Confirmation Modal */}
      {rosterTeam && (
        <TeamRosterManager
          key={rosterTeam.id}
          team={allTeams.find((team) => team.id === rosterTeam.id) || rosterTeam}
          onClose={() => setRosterTeam(null)}
        />
      )}

      <ConfirmModal
        isOpen={deleteTargetTeams.length > 0}
        title={deleteTargetTeams.length > 1 ? `Remove ${deleteTargetTeams.length} teams?` : 'Remove team?'}
        message={`This permanently removes ${deleteTargetTeams.length > 1 ? `these ${deleteTargetTeams.length} teams` : `${deleteTargetTeams[0]?.name} (${deleteTargetTeams[0]?.tag})`}. Affected schedules will be regenerated and their match results cleared.`}
        confirmText={deleteTargetTeams.length > 1 ? 'Remove teams' : 'Remove team'}
        isDestructive={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTargetTeams([])}
      />

      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-3 rounded-lg border border-[#252a31] bg-[#101317] p-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
              <span className="rounded-md border border-[#35495d] bg-[#172431] p-2 text-sky-300">
              <Users className="w-5 h-5" />
            </span>
            <h1 className="text-lg font-extrabold text-slate-100 sm:text-xl">
              Department Rosters
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            {gameLabel(activeGame)} · {teams.length} teams · {countA} / {countB} groups
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              resetForm();
              setIsFormOpen(!isFormOpen);
            }}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-lg transition-all flex items-center gap-2 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{isFormOpen ? 'Close Registration Form' : 'Register New Department'}</span>
          </button>
        </div>
      </div>

      {/* Category Switcher & Group Balance Bar */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {/* Game Switcher Tabs */}
        <div className="flex items-center gap-2 rounded-lg border border-[#252a31] bg-[#101317] p-2">
          <button
            type="button"
            onClick={() => setActiveGame('mlbb')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
              activeGame === 'mlbb'
                ? 'bg-[#1a2732] text-sky-200 border border-[#36506a]'
                : 'text-slate-500 hover:text-white bg-[#090b0e]'
            }`}
          >
            <Gamepad2 className="w-4 h-4 text-slate-400" />
            <span>MLBB ({mlbbCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveGame('valorant')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
              activeGame === 'valorant'
                ? 'bg-[#1a2732] text-sky-200 border border-[#36506a]'
                : 'text-slate-500 hover:text-white bg-[#090b0e]'
            }`}
          >
            <Flame className="w-4 h-4 text-slate-400" />
            <span>VALORANT ({valorantCount})</span>
          </button>
        </div>

        {/* Group Distribution Balance Indicator */}
        <div className="flex items-center justify-between rounded-lg border border-[#252a31] bg-[#101317] px-3 py-2">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Group Balance ({gameShort(activeGame)})
            </span>
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="text-sky-300">Group A: {countA}</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-300">Group B: {countB}</span>
            </div>
          </div>

          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
              countA === countB && countA > 0
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
            }`}
          >
            {countA === countB && countA > 0
              ? 'Balanced Pools'
              : countA === 0 && countB === 0
              ? 'Empty'
              : 'Uneven Pools'}
          </span>
        </div>
      </div>

      {/* Registration / Edit Form (Collapsible / Modal) */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
            className="space-y-4 rounded-lg border border-[#252a31] bg-[#101317] p-4 animate-fadeIn"
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-black text-white">
                {formState.editingTeamId ? 'Edit Department Information' : 'Department Registration'}
              </h2>
              <p className="text-xs text-slate-400">
                Register departments under {gameLabel(formState.game)}.
              </p>
            </div>
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          {/* Quick Preset Buttons */}
          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Quick-Fill UCB College Presets
            </span>
            <div className="flex flex-wrap gap-2">
              {UCB_DEPARTMENT_PRESETS.map((p) => (
                <button
                  key={p.tag}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 transition-colors"
                >
                  +{p.tag}
                </button>
              ))}
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5" htmlFor="team-name">
                Department Name
              </label>
              <input
                id="team-name"
                type="text"
                name="name"
                value={formState.name}
                onChange={handleInputChange}
                placeholder="e.g. College of Computer Studies"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 shadow-inner"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5" htmlFor="team-tag">
                Acronym / Tag
              </label>
              <input
                id="team-tag"
                type="text"
                name="tag"
                value={formState.tag}
                onChange={handleInputChange}
                placeholder="e.g. CCS"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-sm uppercase font-mono focus:outline-none focus:border-blue-500 shadow-inner"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5" htmlFor="team-group">
                Tournament Group
              </label>
              <select
                id="team-group"
                name="group"
                value={formState.group}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 shadow-inner"
              >
                <option value="A">Group A</option>
                <option value="B">Group B</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5" htmlFor="team-game">
                Game Category
              </label>
              <select
                id="team-game"
                name="game"
                value={formState.game}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 shadow-inner"
              >
                <option value="mlbb">Mobile Legends: Bang Bang</option>
                <option value="valorant">Valorant</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5" htmlFor="team-seed">
                Official Seed (Optional)
              </label>
              <input
                id="team-seed"
                type="number"
                min="0"
                name="seed"
                value={formState.seed}
                onChange={handleInputChange}
                placeholder="1"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 shadow-inner"
              />
            </div>

            {/* Logo Upload */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5" htmlFor="logo-input">
                Department Crest / Logo
              </label>
              <input
                type="file"
                name="logo"
                accept="image/*"
                id="logo-input"
                onChange={handleLogoChange}
                className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700"
              />
              {logoPreview && (
                <div className="mt-2 flex items-center gap-3">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-10 h-10 rounded-xl object-cover border border-slate-700 shadow"
                  />
                  <span className="text-xs text-slate-400">Logo preview ready</span>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-black text-white bg-sky-800 hover:bg-sky-700 rounded-md shadow-lg active:scale-95 transition-all"
            >
              {formState.editingTeamId
                ? 'Save Changes'
                : `Register for ${gameShort(formState.game)}`}
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar for Teams */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-slate-800 bg-slate-950/70 shadow-lg">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or tag..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#252a31] bg-[#101317] px-3 py-2">
          <label className="inline-flex cursor-pointer items-center gap-2 text-[10px] font-semibold text-slate-300">
            <input
              type="checkbox"
              checked={allVisibleSelected}
              onChange={toggleSelectVisibleTeams}
              aria-label="Select all visible teams"
              className="h-4 w-4 accent-sky-500"
            />
            Select all {filteredTeams.length ? `(${filteredTeams.length})` : ''}
          </label>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-500">{selectedVisibleTeams.length} selected</span>
            <button
              type="button"
              disabled={!selectedVisibleTeams.length}
              onClick={() => setDeleteTargetTeams(selectedVisibleTeams)}
              className="inline-flex items-center gap-1.5 rounded-md border border-rose-500/20 px-3 py-2 text-[10px] font-bold text-rose-300 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Trash2 className="h-3 w-3" /> Remove selected
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 w-full sm:w-auto">
          {['all', 'A', 'B'].map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGroupFilter(g)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                groupFilter === g
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
              }`}
            >
              {g === 'all' ? 'All Pools' : `Group ${g}`}
            </button>
          ))}
        </div>
      </div>

      {/* Departments Grid */}
      {filteredTeams.length === 0 ? (
        <div className="py-16 text-center rounded-3xl border border-slate-800 bg-slate-900/40 backdrop-blur-md space-y-4">
          <Users className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Departments Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? 'No registered departments match your search query.'
              : `No departments have been added for ${gameLabel(activeGame)} yet.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTeams.map((team) => (
              <TeamAdminCard
                key={team.id}
                team={team}
                selected={selectedTeamIds.includes(team.id)}
                onSelect={(teamId, isSelected) => setSelectedTeamIds((current) =>
                  isSelected ? [...new Set([...current, teamId])] : current.filter((id) => id !== teamId)
                )}
                onEdit={handleEditTeam}
                onRoster={setRosterTeam}
                onDelete={(targetTeam) => setDeleteTargetTeams([targetTeam])}
              />
          ))}
        </div>
      )}
    </div>
  );
}