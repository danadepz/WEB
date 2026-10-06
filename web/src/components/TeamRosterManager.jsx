import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Archive, Camera, CheckSquare, Pencil, RotateCcw, Trash2, UserPlus, X } from 'lucide-react';
import { useTournament } from '../context/TournamentContext';
import { optimizeImageFile } from '../modules/imageUtils';
import { PLAYER_ROLES } from '../modules/playerRoles';
import ConfirmModal from './ui/ConfirmModal';

const createPlayerId = () =>
  globalThis.crypto?.randomUUID?.() || `player-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export default function TeamRosterManager({ team, onClose }) {
  const { updateTeam } = useTournament();
  const [players, setPlayers] = useState(() => (Array.isArray(team.players) ? team.players : []));
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [photo, setPhoto] = useState(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [error, setError] = useState('');
  const [selectedPlayerIds, setSelectedPlayerIds] = useState([]);
  const [playersToRemove, setPlayersToRemove] = useState([]);
  const activePlayers = players.filter((player) => player.active !== false);
  const archivedPlayers = players.filter((player) => player.active === false);
  const teamGame = team.game === 'valorant' ? 'valorant' : 'mlbb';
  const availableRoles = PLAYER_ROLES[teamGame];

  const saveRoster = (nextPlayers) => {
    setPlayers(nextPlayers);
    updateTeam({ ...team, players: nextPlayers });
  };

  const resetDraft = () => {
    setEditingId(null);
    setName('');
    setRole('');
    setCustomRole('');
    setPhoto(null);
    setRemovePhoto(false);
    setError('');
  };

  const handlePhoto = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setPhoto(await optimizeImageFile(file, 400, { square: true }));
      setRemovePhoto(false);
      setError('');
    } catch (uploadError) {
      setError(uploadError.message || 'Could not use that photo.');
    }
  };

  const savePlayer = (event) => {
    event.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError('Enter a player name.');
      return;
    }
    if (!role) {
      setError('Choose a player role.');
      return;
    }
    const cleanCustomRole = customRole.trim();
    if (role === 'Sub' && !cleanCustomRole) {
      setError('Enter the substitute player role.');
      return;
    }

    const nextPlayers = editingId
      ? players.map((player) => player.id === editingId
        ? {
          ...player,
          name: cleanName,
          role,
          customRole: role === 'Sub' ? cleanCustomRole : '',
          photo: photo || (removePhoto ? null : player.photo || null),
        }
        : player)
      : [...players, {
        id: createPlayerId(),
        name: cleanName,
        role,
        customRole: role === 'Sub' ? cleanCustomRole : '',
        photo,
        active: true,
      }];
    saveRoster(nextPlayers);
    resetDraft();
  };

  const editPlayer = (player) => {
    setEditingId(player.id);
    setName(player.name);
    setRole(availableRoles.includes(player.role) ? player.role : '');
    setCustomRole(player.customRole || '');
    setPhoto(player.photo || null);
    setRemovePhoto(false);
    setError('');
  };

  const setPlayerActive = (player, active) => {
    saveRoster(players.map((item) => item.id === player.id ? { ...item, active } : item));
    setSelectedPlayerIds((selected) => selected.filter((id) => id !== player.id));
  };
  const allActiveSelected = activePlayers.length > 0
    && activePlayers.every((player) => selectedPlayerIds.includes(player.id));
  const selectedActivePlayers = activePlayers.filter((player) => selectedPlayerIds.includes(player.id));
  const toggleSelectAllPlayers = () => {
    setSelectedPlayerIds((current) => allActiveSelected
      ? current.filter((id) => !activePlayers.some((player) => player.id === id))
      : [...new Set([...current, ...activePlayers.map((player) => player.id)])]);
  };
  const removeSelectedPlayers = () => {
    if (!playersToRemove.length) return;
    const ids = new Set(playersToRemove.map((player) => player.id));
    saveRoster(players.filter((player) => !ids.has(player.id)));
    setSelectedPlayerIds((selected) => selected.filter((id) => !ids.has(id)));
    setPlayersToRemove([]);
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/75 p-3 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="roster-manager-title"
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <ConfirmModal
        isOpen={playersToRemove.length > 0}
        title={playersToRemove.length > 1 ? `Remove ${playersToRemove.length} players?` : 'Remove player?'}
        message={`This permanently removes ${playersToRemove.length > 1 ? 'these players' : playersToRemove[0]?.name} from the roster. Their linked player profile and displayed match stats will no longer be available.`}
        confirmText={playersToRemove.length > 1 ? 'Remove players' : 'Remove player'}
        isDestructive
        onConfirm={removeSelectedPlayers}
        onCancel={() => setPlayersToRemove([])}
      />
      <section className="my-auto max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-[#2b3037] bg-[#0b0d10] shadow-2xl">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[#252a31] bg-[#0b0d10]/95 px-4 py-3 backdrop-blur sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            {team.logo ? (
              <img src={team.logo} alt="" className="h-10 w-10 rounded-lg border border-[#343a43] object-cover" />
            ) : (
              <span className="grid h-10 w-10 place-items-center rounded-lg border border-[#343a43] bg-[#171b21] text-xs font-bold text-slate-300">{team.tag}</span>
            )}
            <div className="min-w-0">
              <h2 id="roster-manager-title" className="truncate text-sm font-bold text-slate-100">{team.name}</h2>
              <p className="text-[10px] text-slate-500">#{team.tag} · {activePlayers.length} active players</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close roster" className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-slate-400 hover:bg-[#20242a] hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="grid gap-5 p-4 sm:grid-cols-[minmax(0,1fr)_240px] sm:p-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-[10px] font-bold uppercase text-slate-500">Roster</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleSelectAllPlayers}
                  disabled={!activePlayers.length}
                  className="inline-flex items-center gap-1 rounded-md border border-[#303640] px-2 py-1.5 text-[9px] font-semibold text-slate-300 hover:bg-white/[0.05] disabled:opacity-40"
                >
                  <CheckSquare className="h-3 w-3" /> {allActiveSelected ? 'Deselect all' : 'Select all'}
                </button>
                <button
                  type="button"
                  onClick={() => setPlayersToRemove(selectedActivePlayers)}
                  disabled={!selectedActivePlayers.length}
                  className="inline-flex items-center gap-1 rounded-md border border-rose-500/20 px-2 py-1.5 text-[9px] font-bold text-rose-300 hover:bg-rose-500/10 disabled:opacity-40"
                >
                  <Trash2 className="h-3 w-3" /> Remove ({selectedActivePlayers.length})
                </button>
              </div>
            </div>
            {activePlayers.length ? activePlayers.map((player) => (
              <article key={player.id} className="flex items-center gap-3 rounded-lg border border-[#252a31] bg-[#101317] p-2.5">
                <input
                  type="checkbox"
                  checked={selectedPlayerIds.includes(player.id)}
                  onChange={(event) => setSelectedPlayerIds((current) =>
                    event.target.checked ? [...new Set([...current, player.id])] : current.filter((id) => id !== player.id)
                  )}
                  aria-label={`Select ${player.name}`}
                  className="h-4 w-4 shrink-0 accent-sky-500"
                />
                {player.photo ? (
                  <img src={player.photo} alt="" className="h-10 w-10 rounded-full border border-[#39414c] object-cover" />
                ) : (
                  <span className="grid h-10 w-10 place-items-center rounded-full border border-[#39414c] bg-[#1b2027] text-xs font-bold text-slate-300">{player.name.slice(0, 2).toUpperCase()}</span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-slate-100">{player.name}</p>
                  <p className="text-[9px] text-slate-500">{player.role === 'Sub' ? player.customRole || 'Sub' : player.role || 'Role not set'}</p>
                  <Link to={`/players/${player.id}`} onClick={onClose} className="text-[10px] text-sky-300 hover:text-sky-200">Player profile</Link>
                </div>
                <button type="button" onClick={() => editPlayer(player)} title={`Edit ${player.name}`} className="grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-[#20242a] hover:text-slate-100">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => setPlayerActive(player, false)} title={`Archive ${player.name}`} className="grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-[#20242a] hover:text-slate-100">
                  <Archive className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => setPlayersToRemove([player])} title={`Remove ${player.name}`} className="grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-rose-500/10 hover:text-rose-300">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </article>
            )) : (
              <p className="rounded-lg border border-dashed border-[#30353d] px-3 py-6 text-center text-xs text-slate-500">No players on this roster yet.</p>
            )}

            {!!archivedPlayers.length && (
              <details className="pt-2">
                <summary className="cursor-pointer text-[10px] font-semibold text-slate-500">Archived players ({archivedPlayers.length})</summary>
                <div className="mt-2 space-y-2">
                  {archivedPlayers.map((player) => (
                    <div key={player.id} className="flex items-center gap-2 rounded-md border border-[#242830] px-2.5 py-2 opacity-75">
                      <span className="min-w-0 flex-1 truncate text-xs text-slate-400">{player.name}</span>
                      <Link to={`/players/${player.id}`} onClick={onClose} className="text-[10px] text-sky-300">Players</Link>
                      <button type="button" onClick={() => setPlayerActive(player, true)} title={`Restore ${player.name}`} className="grid h-7 w-7 place-items-center rounded text-slate-500 hover:bg-[#20242a] hover:text-white">
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>

          <form onSubmit={savePlayer} className="h-fit space-y-3 rounded-lg border border-[#252a31] bg-[#101317] p-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              {editingId ? <Pencil className="h-3.5 w-3.5 text-sky-300" /> : <UserPlus className="h-3.5 w-3.5 text-sky-300" />}
              {editingId ? 'Edit player' : 'Add player'}
            </div>
            <label className="block text-[10px] font-semibold text-slate-400" htmlFor="roster-player-name">Name</label>
            <input
              id="roster-player-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Player name"
              className="w-full rounded-md border border-[#303640] bg-[#090b0e] px-3 py-2 text-xs text-white outline-none focus:border-sky-500"
            />
            <label className="block text-[10px] font-semibold text-slate-400" htmlFor="roster-player-role">Role</label>
            <select
              id="roster-player-role"
              value={role}
              onChange={(event) => {
                setRole(event.target.value);
                if (event.target.value !== 'Sub') setCustomRole('');
              }}
              className="w-full rounded-md border border-[#303640] bg-[#090b0e] px-3 py-2 text-xs text-white outline-none focus:border-sky-500"
            >
              <option value="">Choose a role</option>
              {availableRoles.map((playerRole) => (
                <option key={playerRole} value={playerRole}>{playerRole}</option>
              ))}
            </select>
            {role === 'Sub' && (
              <>
                <label className="block text-[10px] font-semibold text-slate-400" htmlFor="roster-player-custom-role">Substitute role</label>
                <input
                  id="roster-player-custom-role"
                  value={customRole}
                  onChange={(event) => setCustomRole(event.target.value)}
                  placeholder={teamGame === 'valorant' ? 'e.g. Duelist' : 'e.g. Roam'}
                  className="w-full rounded-md border border-[#303640] bg-[#090b0e] px-3 py-2 text-xs text-white outline-none focus:border-sky-500"
                />
              </>
            )}
            <div className="flex items-center gap-3 rounded-lg border border-[#303640] bg-[#090b0e] p-2">
              {photo ? (
                <img src={photo} alt="Player portrait preview" className="h-12 w-12 shrink-0 rounded-lg border border-[#39414c] object-cover" />
              ) : (
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-dashed border-[#39414c] bg-[#11151a] text-slate-600">
                  <Camera className="h-4 w-4" />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[10px] font-semibold text-slate-300">{photo ? 'Portrait ready' : 'Add a portrait'}</p>
                <p className="mt-0.5 text-[9px] text-slate-600">Saved as a centered 400 × 400 square</p>
                <label className="mt-1 inline-flex cursor-pointer items-center gap-1 text-[10px] font-bold text-sky-300 hover:text-sky-200">
                  <Camera className="h-3 w-3" />
                  {photo ? 'Change photo' : 'Choose photo'}
                  <input type="file" accept="image/*" onChange={handlePhoto} className="sr-only" />
                </label>
              </div>
              {photo && (
                <button
                  type="button"
                  onClick={() => { setPhoto(null); setRemovePhoto(true); }}
                  aria-label="Remove player photo"
                  title="Remove photo"
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-300"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            {error && <p role="alert" className="text-[10px] text-rose-300">{error}</p>}
            <div className="flex gap-2 pt-1">
              <button type="submit" className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-sky-700 px-3 py-2 text-[10px] font-bold text-white hover:bg-sky-600">
                {editingId ? 'Save player' : 'Add player'}
              </button>
              {editingId && <button type="button" onClick={resetDraft} className="rounded-md border border-[#343a43] px-3 text-[10px] text-slate-400 hover:text-white">Cancel</button>}
            </div>
            <p className="text-[9px] leading-relaxed text-slate-600">Archived players stay in historical stats.</p>
          </form>
        </div>
      </section>
    </div>
  );
}
