import { Link } from 'react-router-dom';
import { ArrowRight, Medal, Swords, Trophy } from 'lucide-react';

function SeededTeam({ team, seed }) {
  const isReady = Boolean(team?.teamId);

  return (
    <div
      className={`flex min-w-0 items-center gap-2.5 px-3 py-2.5 ${
        team?.placeholder || !isReady ? 'text-slate-500' : 'text-white'
      }`}
    >
      <span className="grid h-6 min-w-8 place-items-center rounded border border-[#343943] bg-[#171b22] px-1 text-[9px] font-bold text-slate-400">
        {seed}
      </span>
      {team?.teamLogo ? (
        <img
          src={team.teamLogo}
          alt=""
          className="h-7 w-7 shrink-0 rounded-md border border-[#333943] bg-[#11151b] object-cover"
        />
      ) : (
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-[#333943] bg-[#171b22] text-[9px] font-bold text-[#8eb9dc]">
          {team?.teamTag?.slice(0, 2) || 'TBD'}
        </span>
      )}
      {isReady ? (
        <Link
          to={`/team/${team.teamId}`}
          className="min-w-0 flex-1 truncate text-xs font-bold text-white hover:text-[#8eb9dc]"
        >
          {team.teamName}
        </Link>
      ) : (
        <span className="min-w-0 flex-1 truncate text-xs font-semibold">
          {team?.teamName || 'TBD'}
        </span>
      )}
      {team?.points != null && (
        <span className="shrink-0 text-[10px] font-semibold text-slate-500">
          {team.points} pts
        </span>
      )}
    </div>
  );
}

function PlaceholderTeam({ label }) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5 text-slate-400">
      <span className="grid h-6 min-w-8 place-items-center rounded border border-[#343943] bg-[#171b22] px-1 text-[9px] font-bold text-slate-500">
        —
      </span>
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-dashed border-[#343943] bg-[#11151b] text-[9px] font-bold text-slate-600">
        ?
      </span>
      <span className="min-w-0 flex-1 truncate text-xs font-medium">{label}</span>
    </div>
  );
}

function MatchupCard({ title, detail, children, featured = false }) {
  return (
    <article
      className={`w-full overflow-hidden rounded-xl border bg-[#111317] shadow-lg ${
        featured
          ? 'border-amber-400/40 shadow-amber-950/20'
          : 'border-[#2a2d33] hover:border-[#45627b]'
      } transition-colors`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-[#25282e] px-3.5 py-3">
        <h4 className={`truncate text-[10px] font-extrabold uppercase tracking-[0.13em] ${featured ? 'text-amber-300' : 'text-slate-300'}`}>
          {title}
        </h4>
        <span className="shrink-0 text-[9px] font-semibold uppercase tracking-wide text-slate-600">
          {detail}
        </span>
      </div>
      <div className="divide-y divide-[#25282e]">{children}</div>
    </article>
  );
}

function BracketRound({ title, children, className = '' }) {
  return (
    <section aria-label={title} className={`flex w-64 shrink-0 flex-col ${className}`}>
      <h4 className="mb-3 px-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#8eb9dc]">
        {title}
      </h4>
      <div className="flex flex-1 flex-col justify-around gap-4">{children}</div>
    </section>
  );
}

function RoundConnector() {
  return (
    <div aria-hidden="true" className="flex w-9 shrink-0 items-center justify-center pt-7 text-[#527493]">
      <ArrowRight className="h-4 w-4" />
    </div>
  );
}

function BracketMatch({ title, detail, first, second, featured = false }) {
  return (
    <MatchupCard title={title} detail={detail} featured={featured}>
      <PlaceholderTeam label={first} />
      <PlaceholderTeam label={second} />
    </MatchupCard>
  );
}

function BracketLane({ title, description, children }) {
  return (
    <section className="overflow-hidden rounded-xl border border-[#252a31] bg-[#0d1014]">
      <div className="border-b border-[#252a31] px-4 py-3">
        <h3 className="text-xs font-extrabold uppercase tracking-[0.15em] text-white">{title}</h3>
        <p className="mt-1 text-[10px] text-slate-500">{description}</p>
      </div>
      <div className="overflow-x-auto p-4">
        <div className="flex min-w-max items-stretch">{children}</div>
      </div>
    </section>
  );
}

function standingOrPlaceholder(standings, index, group) {
  return standings[index] || {
    teamName: `Group ${group} ${index + 1}${['st', 'nd', 'rd'][index] || 'th'} Place`,
    teamTag: `${group}${index + 1}`,
  };
}

// Play-in series length per rulebook (Valorant = BO1, MLBB = BO3).
const PLAY_IN_FORMAT = { valorant: 'BO1', mlbb: 'BO3' };

export default function PlayoffBracket({ phase, game = 'mlbb', standingsA = [], standingsB = [] }) {
  const playInFormat = PLAY_IN_FORMAT[game] || 'BO3';
  const a1 = standingOrPlaceholder(standingsA, 0, 'A');
  const a2 = standingOrPlaceholder(standingsA, 1, 'A');
  const a3 = standingOrPlaceholder(standingsA, 2, 'A');
  const a4 = standingOrPlaceholder(standingsA, 3, 'A');
  const a5 = standingOrPlaceholder(standingsA, 4, 'A');
  const b1 = standingOrPlaceholder(standingsB, 0, 'B');
  const b2 = standingOrPlaceholder(standingsB, 1, 'B');
  const b3 = standingOrPlaceholder(standingsB, 2, 'B');
  const b4 = standingOrPlaceholder(standingsB, 3, 'B');
  const b5 = standingOrPlaceholder(standingsB, 4, 'B');

  if (phase === 'Play-ins') {
    return (
      <div className="space-y-6 animate-fadeIn">
        <header className="rounded-xl border border-[#2a2d33] bg-gradient-to-r from-[#171b21] to-[#101114] p-5 sm:p-6">
          <div className="flex items-center gap-2.5">
            <Swords className="h-5 w-5 text-amber-300" />
            <h3 className="text-lg font-black tracking-tight text-white">Play-ins · Last Chance Qualifier</h3>
          </div>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-slate-400">
            Group A 4th faces Group B 5th, and Group B 4th faces Group A 5th. Each winner claims one of the final two spots in the Lower Bracket.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
            <MatchupCard title="Play-in 1" detail={`${playInFormat} · A4 VS B5`}>
            <SeededTeam team={a4} seed="A4" />
            <SeededTeam team={b5} seed="B5" />
          </MatchupCard>
          <MatchupCard title="Play-in 2" detail={`${playInFormat} · B4 VS A5`}>
            <SeededTeam team={b4} seed="B4" />
            <SeededTeam team={a5} seed="A5" />
          </MatchupCard>
        </div>

        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#45627b] bg-[#111821] px-5 py-5 text-center sm:flex-row sm:gap-3">
          <Trophy className="h-5 w-5 text-[#8eb9dc]" />
          <p className="text-xs font-bold text-white">Both Play-in winners advance to the Playoffs Lower Bracket</p>
        </div>
      </div>
    );
  }

  const playInA = { teamName: 'Group A Play-in Winner', teamTag: 'A-W', placeholder: true };
  const playInB = { teamName: 'Group B Play-in Winner', teamTag: 'B-W', placeholder: true };

  return (
    <div className="space-y-6 animate-fadeIn">
      <header className="flex flex-col gap-4 rounded-xl border border-[#2a2d33] bg-gradient-to-r from-[#171b21] to-[#101114] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <div className="flex items-center gap-2.5">
            <Trophy className="h-5 w-5 text-amber-300" />
            <h3 className="text-lg font-black tracking-tight text-white">8-Team Double-Elimination Playoffs</h3>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            The top 3 teams from each group qualify directly; both Play-in winners complete the bracket.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-1.5 rounded-md border border-amber-400/20 bg-amber-400/5 px-3 py-2 text-[9px] font-bold uppercase tracking-wide text-amber-200">
          <Medal className="h-3.5 w-3.5" /> Double Elimination
        </span>
      </header>

      <BracketLane
        title="Upper Bracket"
        description="Winners stay in the upper bracket; match losers drop to the lower bracket."
      >
        <BracketRound title="Quarterfinals">
          <MatchupCard title="Match 01" detail="SEED 1 VS 8">
            <SeededTeam team={a1} seed="A1" />
            <SeededTeam team={playInB} seed="B-W" />
          </MatchupCard>
          <MatchupCard title="Match 02" detail="SEED 4 VS 5">
            <SeededTeam team={b2} seed="B2" />
            <SeededTeam team={a3} seed="A3" />
          </MatchupCard>
          <MatchupCard title="Match 03" detail="SEED 2 VS 7">
            <SeededTeam team={b1} seed="B1" />
            <SeededTeam team={playInA} seed="A-W" />
          </MatchupCard>
          <MatchupCard title="Match 04" detail="SEED 3 VS 6">
            <SeededTeam team={a2} seed="A2" />
            <SeededTeam team={b3} seed="B3" />
          </MatchupCard>
        </BracketRound>
        <RoundConnector />
        <BracketRound title="Upper Semifinals">
          <BracketMatch title="Match 05" detail="BO3" first="Winner Match 01" second="Winner Match 02" />
          <BracketMatch title="Match 06" detail="BO3" first="Winner Match 03" second="Winner Match 04" />
        </BracketRound>
        <RoundConnector />
        <BracketRound title="Upper Final">
          <BracketMatch title="Match 07" detail="BO5" first="Winner Match 05" second="Winner Match 06" featured />
        </BracketRound>
      </BracketLane>

      <BracketLane
        title="Lower Bracket"
        description="A second loss eliminates a team. Lower-bracket winners advance to the lower final."
      >
        <BracketRound title="Lower Round 1">
          <BracketMatch title="Match 08" detail="BO3" first="Loser Match 01" second="Loser Match 02" />
          <BracketMatch title="Match 09" detail="BO3" first="Loser Match 03" second="Loser Match 04" />
        </BracketRound>
        <RoundConnector />
        <BracketRound title="Lower Round 2">
          <BracketMatch title="Match 10" detail="BO3" first="Winner Match 08" second="Loser Match 05" />
          <BracketMatch title="Match 11" detail="BO3" first="Winner Match 09" second="Loser Match 06" />
        </BracketRound>
        <RoundConnector />
        <BracketRound title="Lower Semifinal">
          <BracketMatch title="Match 12" detail="BO3" first="Winner Match 10" second="Winner Match 11" />
        </BracketRound>
        <RoundConnector />
        <BracketRound title="Lower Final">
          <BracketMatch title="Match 13" detail="BO5" first="Winner Match 12" second="Loser Match 07" featured />
        </BracketRound>
      </BracketLane>

      <BracketLane
        title="Grand Finals"
        description="The upper-bracket champion faces the lower-bracket champion; the lower-bracket team must win twice to take the title."
      >
        <BracketRound title="Championship">
          <MatchupCard title="Grand Final" detail="BO5" featured>
            <PlaceholderTeam label="Winner Match 07 · Upper-bracket champion" />
            <PlaceholderTeam label="Winner Match 13 · Lower-bracket champion" />
          </MatchupCard>
          <MatchupCard title="Grand Final Reset" detail="IF NECESSARY · BO5">
            <PlaceholderTeam label="Same finalists · only if lower-bracket champion wins" />
            <PlaceholderTeam label="Championship decider" />
          </MatchupCard>
        </BracketRound>
      </BracketLane>
    </div>
  );
}
