import { useEffect, useMemo, useRef } from 'react';
import { CalendarDays, ChevronDown, ChevronRight, ClipboardList, Crown, Flag, Gamepad2, Medal, Swords, Trophy, Users } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTournament } from '../context/TournamentContext';
import { gameShort } from '../modules/games';
import { getNextUpcomingMatch } from '../modules/tournamentStatus';
import Countdown from './ui/Countdown';
import SocialLinks from './ui/SocialLinks';

const FAQ_ITEMS = [
  {
    question: 'Who can play in Intramurals?',
    answer: 'Bonafide University of Cebu – Banilad students. Rosters are locked per team by tournament marshals.',
  },
  {
    question: 'What titles and format?',
    answer: 'Mobile Legends: Bang Bang (5v5) and Valorant (tactical 5v5). Group stage to playoffs, tracked in Match Center.',
  },
  {
    question: 'Where are fixtures and results?',
    answer: 'Open Match Center for schedule, standings and bracket. Results are verified before publishing.',
  },
  {
    question: 'How do I contact organizers?',
    answer: 'Through the official Facebook and Discord links below. For disputes, bring your match ID to the Control Room.',
  },
];

const ROAD = [
  { n: '01', title: 'GROUP STAGE', desc: 'Departments battle within groups to seed the playoffs.' },
  { n: '02', title: 'PLAYOFFS', desc: 'Top squads advance to elimination rounds.' },
  { n: '03', title: 'GRAND FINALS', desc: 'The last two teams meet on the main stage.' },
  { n: '04', title: 'CHAMPION', desc: 'One team lifts the intramurals crown per title.' },
];

const PILLARS = [
  { title: 'COMPETE', desc: 'Competitive gaming and organized tournaments.', icon: Swords },
  { title: 'CONNECT', desc: 'Bringing students and teams together.', icon: Users },
  { title: 'REPRESENT', desc: 'Representing University of Cebu – Banilad.', icon: Flag },
];

function scrollToSection(sectionId) {
  document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function formatMatchDate(d) {
  if (!d) return null;
  try {
    const date = new Date(d);
    return {
      day: date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }).toUpperCase(),
      time: date.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' }).toUpperCase(),
    };
  } catch {
    return null;
  }
}

export default function LandingPage() {
  const { activeGame, allTeams, getScheduleForGame, getMatchResultsForGame, scheduledTimeSlots, tournamentStartTime } =
    useTournament();
  const location = useLocation();
  const navigate = useNavigate();
  const pageRef = useRef(null);

  useEffect(() => {
    const page = pageRef.current;
    if (!page) return undefined;
    const targets = [...page.querySelectorAll('[data-scroll-reveal]')];
    if (!('IntersectionObserver' in window)) {
      targets.forEach((t) => t.classList.add('is-visible'));
    } else {
      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            e.target.classList.add('is-visible');
            obs.unobserve(e.target);
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -48px 0px' }
      );
      targets.forEach((t) => observer.observe(t));
      page.classList.add('has-scroll-reveal');
      return () => {
        observer.disconnect();
        page.classList.remove('has-scroll-reveal');
      };
    }
    return undefined;
  }, []);

  useEffect(() => {
    const sectionId = location.state?.scrollToSection;
    if (!sectionId) return undefined;
    const frame = window.requestAnimationFrame(() => {
      scrollToSection(sectionId);
      navigate('/', { replace: true, state: null });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [location.state, navigate]);

  const featured = useMemo(() => {
    const mlbbSchedule = getScheduleForGame('mlbb') || [];
    const valSchedule = getScheduleForGame('valorant') || [];
    const mlbbResults = getMatchResultsForGame('mlbb') || {};
    const valResults = getMatchResultsForGame('valorant') || {};
    const next = getNextUpcomingMatch({
      scheduleByGame: { mlbb: mlbbSchedule, valorant: valSchedule },
      resultsByGame: { mlbb: mlbbResults, valorant: valResults },
      timeSlotsByGame: { [activeGame]: scheduledTimeSlots || [] },
    });
    if (!next) return null;
    const tidA = next.match.teamAId ?? next.match.teamA?.id;
    const tidB = next.match.teamBId ?? next.match.teamB?.id;
    return {
      ...next,
      teamA: allTeams.find((t) => t.id === tidA) || next.match.teamA || null,
      teamB: allTeams.find((t) => t.id === tidB) || next.match.teamB || null,
    };
  }, [allTeams, getScheduleForGame, getMatchResultsForGame, scheduledTimeSlots, activeGame]);

  const showCountdown = Boolean(featured?.startTime && new Date(featured.startTime).getTime() > Date.now());
  const dateParts = formatMatchDate(featured?.startTime || tournamentStartTime);

  return (
    <div ref={pageRef} className="landing-page bg-[#02040d] text-slate-100">
      {/* 1. HERO — layered championship composition */}
      <section className="hero-full relative flex min-h-[96vh] scroll-mt-24 items-center justify-center overflow-hidden border-b border-[rgba(148,163,184,0.14)]">
        <div className="hero-photo absolute inset-0" aria-hidden="true" />
        <div className="hero-atmosphere absolute inset-0" aria-hidden="true" />
        <div className="hero-diagonals absolute inset-0" aria-hidden="true" />
        <div className="hero-grid-drift wm-grid-overlay absolute inset-0 opacity-[0.16]" aria-hidden="true" />
        <div className="hero-beam left-[12%] hidden sm:block" aria-hidden="true" />
        <div className="hero-beam right-[14%] hidden sm:block" style={{ animationDelay: '-6s' }} aria-hidden="true" />
        <div className="hero-orb left-[8%] top-[18%] h-64 w-64 bg-[rgba(30,99,255,0.16)]" aria-hidden="true" />
        <div className="hero-orb bottom-[10%] right-[6%] h-72 w-72 bg-[rgba(77,163,255,0.1)]" style={{ animationDelay: '-7s' }} aria-hidden="true" />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 90% 60% at 50% 110%, rgba(0,0,0,0.7), transparent 60%)' }} aria-hidden="true" />
        {/* HUD corners */}
        <span className="hud-corner left-4 top-24 border-l border-t md:left-8" aria-hidden="true" />
        <span className="hud-corner right-4 top-24 border-r border-t md:right-8" aria-hidden="true" />
        <span className="hud-corner bottom-8 left-4 border-b border-l md:left-8" aria-hidden="true" />
        <span className="hud-corner bottom-8 right-4 border-b border-r md:right-8" aria-hidden="true" />
        <span className="absolute left-1/2 top-24 hidden -translate-x-1/2 items-center gap-3 font-display text-[9px] tracking-[0.4em] text-slate-500 md:flex" aria-hidden="true">
          <span className="h-px w-10 bg-[rgba(30,99,255,0.5)]" /> UC-BANILAD · SEASON 2026 <span className="h-px w-10 bg-[rgba(30,99,255,0.5)]" />
        </span>

        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-28 pt-20 text-center sm:px-6 sm:py-20">
          <p data-scroll-reveal className="esports-eyebrow mb-5">
            University of Cebu – Banilad
          </p>
          <div data-scroll-reveal className="mb-7 flex justify-center">
            <span className="relative inline-block">
              <img
                src="/images/logo/logo-optimized.png"
                alt="Webmasters Esports Banilad crest"
                className="block h-28 w-auto object-contain md:h-36 wm-crest-glow"
              />
              <span className="absolute -inset-4 -z-10 rounded-full bg-[rgba(30,99,255,0.14)] blur-3xl" aria-hidden="true" />
            </span>
          </div>
          <h1 data-scroll-reveal className="mx-auto w-full max-w-full whitespace-nowrap text-center font-display text-[clamp(1.75rem,10.5vw,4rem)] font-black leading-[0.88] tracking-tight sm:whitespace-nowrap sm:text-7xl md:text-8xl lg:text-[7.5rem]">
            <span className="wm-hero-title">WEBMASTERS</span>
          </h1>
          <p data-scroll-reveal className="hero-sub mt-3 font-display text-base font-extrabold tracking-[0.32em] text-[#e0e6ed] sm:text-2xl md:text-3xl">
            ESPORTS BANILAD
          </p>
          <p data-scroll-reveal className="mt-5 font-display text-[11px] tracking-[0.42em] text-[#9ec1ff] sm:text-xs">
            COMPETE. CONQUER. REPRESENT.
          </p>
          <p data-scroll-reveal className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-slate-400">
            Official esports organization of
            <span className="block text-slate-300">the University of Cebu – Banilad.</span>
          </p>
          <div data-scroll-reveal className="cta-stack mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/register"
              className="esports-btn inline-flex items-center gap-2 bg-[#1e63ff] px-7 py-3.5 text-white shadow-[0_10px_36px_-10px_rgba(30,99,255,0.7)] hover:bg-[#1d4ed8]"
            >
              <ClipboardList className="h-4 w-4" /> REGISTER TEAM
            </Link>
            <Link
              to="/teams"
              className="esports-btn inline-flex items-center gap-2 border border-white/20 bg-white/[0.04] px-7 py-3.5 text-white backdrop-blur hover:border-[#1e63ff]"
            >
              EXPLORE TEAMS <ChevronRight className="h-4 w-4" />
            </Link>
            <Link
              to="/standings"
              className="esports-btn inline-flex items-center gap-2 border border-white/20 bg-white/[0.04] px-7 py-3.5 text-white backdrop-blur hover:border-[#1e63ff]"
            >
              <Gamepad2 className="h-4 w-4 text-[#7fb3ff]" /> MATCH CENTER
            </Link>
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2" aria-hidden="true">
          <span className="font-display text-[9px] tracking-[0.36em] text-slate-500">SCROLL</span>
          <span className="scroll-cue-line" />
        </div>
      </section>

      {/* 3. TOURNAMENT 2026 feature strip */}
      <section className="relative overflow-hidden border-b border-[rgba(148,163,184,0.14)] bg-[#040918]">
        <div className="wm-grid-overlay absolute inset-0 opacity-10" aria-hidden="true" />
        <div className="absolute -left-10 top-0 h-full w-40 -skew-x-12 bg-[rgba(30,99,255,0.1)]" aria-hidden="true" />
        <div className="absolute -right-16 top-0 h-full w-64 -skew-x-12 bg-[rgba(30,99,255,0.06)]" aria-hidden="true" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div data-scroll-reveal>
            <p className="font-display text-[10px] font-bold tracking-[0.34em] text-[#7fb3ff]">FEATURED EVENT</p>
            <h2 className="mt-2 font-display text-2xl font-black tracking-wide text-white sm:text-3xl md:text-4xl">
              WEBMASTERS <span className="text-[#1e63ff]">INTRAMURALS</span> 2026
            </h2>
            <p className="mt-2 font-body-wm text-sm tracking-[0.14em] text-slate-400">COMPETITIVE ESPORTS · UNIVERSITY OF CEBU – BANILAD</p>
          </div>
          <div data-scroll-reveal className="flex items-center gap-3">
            <span className="strip-diagonals bg-[rgba(0,229,255,0.1)] px-5 py-3 font-display text-sm font-black tracking-[0.2em] text-[#00e5ff]">
              MLBB
            </span>
            <span className="font-display text-xs text-slate-600">×</span>
            <span className="strip-diagonals bg-[rgba(255,70,85,0.1)] px-5 py-3 font-display text-sm font-black tracking-[0.2em] text-[#ff7080]">
              VALORANT
            </span>
          </div>
        </div>
      </section>

      {/* 4. FEATURED FIXTURE */}
      <section id="featured-match" className="relative scroll-mt-24 overflow-hidden border-b border-[rgba(148,163,184,0.14)]">
        <span className="giant-word absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[22vw] md:text-[11rem]" aria-hidden="true">
          COMPETE.
        </span>
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <p data-scroll-reveal className="esports-eyebrow">Spotlight</p>
          <h2 data-scroll-reveal className="esports-h2 mt-2 text-2xl sm:text-3xl">
            FEATURED FIXTURE
          </h2>
          <div data-scroll-reveal className="mt-8">
            {featured && featured.teamA && featured.teamB ? (
              <div className="esports-card relative overflow-hidden">
                <div className="absolute inset-y-0 left-0 w-1 bg-[#1e63ff]" aria-hidden="true" />
                <div className="wm-grid-overlay absolute inset-0 opacity-[0.07]" aria-hidden="true" />
                <div className="relative grid items-center gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto_1fr_auto]">
                  <div className="flex items-center gap-4">
                    {featured.teamA.logo ? (
                      <img src={featured.teamA.logo} alt="" className="h-14 w-14 shrink-0 rounded-md border border-white/10 object-cover" />
                    ) : (
                      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-md border border-white/10 bg-white/[0.04] font-display text-sm font-black text-white">
                        {(featured.teamA.tag || 'A').slice(0, 3)}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="font-display text-[9px] tracking-[0.28em] text-[#7fb3ff]">{gameShort(featured.game)} · {featured.match.group ? `GROUP ${featured.match.group}` : `ROUND ${featured.roundNumber}`}</p>
                      <p className="mt-1 truncate font-display text-lg font-black text-white">{featured.teamA.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-4 lg:flex-col lg:gap-2">
                    <div className="text-center">
                      <p className="font-display text-3xl font-black tracking-[0.12em] text-white">VS</p>
                      {(dateParts || featured.roundNumber) && (
                        <p className="mt-1 whitespace-nowrap text-[11px] font-bold tracking-[0.18em] text-slate-400">
                          {dateParts ? `${dateParts.day} · ${dateParts.time}` : `ROUND ${featured.roundNumber}`}
                        </p>
                      )}
                    </div>
                    {showCountdown && (
                      <div className="hidden lg:block">
                        <Countdown target={featured.startTime} />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 lg:flex-row-reverse lg:text-right">
                    {featured.teamB.logo ? (
                      <img src={featured.teamB.logo} alt="" className="h-14 w-14 shrink-0 rounded-md border border-white/10 object-cover" />
                    ) : (
                      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-md border border-white/10 bg-white/[0.04] font-display text-sm font-black text-white">
                        {(featured.teamB.tag || 'B').slice(0, 3)}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-[9px] tracking-[0.28em] text-slate-500 lg:text-right">AWAY</p>
                      <p className="mt-1 truncate font-display text-lg font-black text-white">{featured.teamB.name}</p>
                    </div>
                  </div>
                  <Link
                    to="/standings"
                    className="esports-btn inline-flex items-center justify-center gap-2 bg-[#1e63ff] px-5 py-3 text-white hover:bg-[#1d4ed8] lg:w-auto"
                  >
                    MATCH DETAILS <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
                {showCountdown && (
                  <div className="relative border-t border-white/5 px-6 py-4 lg:hidden">
                    <Countdown target={featured.startTime} />
                  </div>
                )}
              </div>
            ) : (
              <div className="esports-card relative overflow-hidden">
                <div className="absolute inset-y-0 left-0 w-1 bg-[#1e63ff]" aria-hidden="true" />
                <div className="relative flex flex-col items-center gap-3 px-6 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
                  <div>
                    <p className="esports-eyebrow">Match Center</p>
                    <h3 className="esports-h2 mt-2 text-base tracking-[0.12em]">NO FIXTURES PUBLISHED YET</h3>
                    <p className="mt-1 max-w-md text-sm text-slate-400">Official match schedules will appear here once available.</p>
                  </div>
                  <Link
                    to="/standings"
                    className="esports-btn inline-flex shrink-0 items-center gap-2 border border-[rgba(30,99,255,0.5)] bg-[rgba(30,99,255,0.1)] px-5 py-2.5 text-white hover:bg-[rgba(30,99,255,0.2)]"
                  >
                    VIEW MATCH CENTER <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. OUR GAMES — large feature tiles */}
      <section id="games" className="relative scroll-mt-24 overflow-hidden border-b border-[rgba(148,163,184,0.14)] bg-[#040918]">
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <p data-scroll-reveal className="esports-eyebrow">Titles</p>
          <h2 data-scroll-reveal className="esports-h2 mt-2 text-2xl sm:text-4xl">
            OUR GAMES
          </h2>
          <p data-scroll-reveal className="mt-2 max-w-lg text-sm text-slate-400">
            Two disciplines. One stage. Every match feeds the same Match Center.
          </p>
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <article data-scroll-reveal className="game-panel game-panel-mlbb group border border-[rgba(0,229,255,0.18)]">
              <div className="game-texture" aria-hidden="true" />
              <span className="game-giant" aria-hidden="true">ML</span>
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-[#00e5ff] to-transparent opacity-70" aria-hidden="true" />
              <div className="relative p-7 sm:p-9">
                <p className="font-display text-[10px] font-bold tracking-[0.34em] text-[#00e5ff]">FEATURED TITLE · 5V5</p>
                <h3 className="mt-3 font-display text-4xl font-black leading-none text-white sm:text-5xl">MLBB</h3>
                <p className="mt-2 font-display text-xs tracking-[0.3em] text-slate-300">MOBILE LEGENDS: BANG BANG</p>
                <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">Fast rotations, objective control and explosive teamfights on the campus stage.</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <Link to="/standings" className="esports-btn inline-flex items-center gap-2 bg-[#1e63ff] px-5 py-2.5 text-white hover:bg-[#1d4ed8]">
                    VIEW MATCHES <ChevronRight className="h-4 w-4" />
                  </Link>
                  <Link to="/teams" className="esports-btn inline-flex items-center gap-2 border border-white/15 px-5 py-2.5 text-slate-200 hover:border-[#00e5ff] hover:text-white">
                    TEAMS
                  </Link>
                </div>
              </div>
            </article>
            <article data-scroll-reveal className="game-panel game-panel-valorant group border border-[rgba(255,70,85,0.2)]">
              <div className="game-texture" aria-hidden="true" />
              <span className="game-giant" aria-hidden="true">VAL</span>
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-[#ff4655] to-transparent opacity-70" aria-hidden="true" />
              <div className="relative p-7 sm:p-9">
                <p className="font-display text-[10px] font-bold tracking-[0.34em] text-[#ff7080]">FEATURED TITLE · TACTICAL 5V5</p>
                <h3 className="mt-3 font-display text-4xl font-black leading-none text-white sm:text-5xl">VALORANT</h3>
                <p className="mt-2 font-display text-xs tracking-[0.3em] text-slate-300">PRECISION · UTILITY · CLUTCH</p>
                <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">Disciplined executes, sharp utility usage and ice-cold retakes.</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <Link to="/standings" className="esports-btn inline-flex items-center gap-2 bg-[#1e63ff] px-5 py-2.5 text-white hover:bg-[#1d4ed8]">
                    VIEW MATCHES <ChevronRight className="h-4 w-4" />
                  </Link>
                  <Link to="/teams" className="esports-btn inline-flex items-center gap-2 border border-white/15 px-5 py-2.5 text-slate-200 hover:border-[#ff4655] hover:text-white">
                    TEAMS
                  </Link>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* 6. TOURNAMENT CENTER — compact */}
      <section id="hub" className="relative scroll-mt-24 overflow-hidden border-b border-[rgba(148,163,184,0.14)]">
        <span className="giant-word absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[20vw] md:text-[10rem]" aria-hidden="true">
          ARENA
        </span>
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <p data-scroll-reveal className="esports-eyebrow text-center">Navigation</p>
          <h2 data-scroll-reveal className="esports-h2 mt-2 text-center text-2xl sm:text-3xl">
            TOURNAMENT CENTER
          </h2>
          <p data-scroll-reveal className="mt-2 text-center font-display text-[10px] tracking-[0.34em] text-slate-500">
            FOLLOW THE COMPETITION
          </p>
          <div className="mt-8 grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {[
              { to: '/intramurals/schedule', label: 'MATCHES', desc: 'Upcoming and completed games.', icon: Swords },
              { to: '/intramurals/standings', label: 'STANDINGS', desc: 'Track team rankings.', icon: Trophy },
              { to: '/intramurals/bracket', label: 'BRACKET', desc: 'Follow the playoff journey.', icon: Gamepad2 },
              { to: '/teams', label: 'TEAMS', desc: 'Explore competing squads.', icon: Users },
              { to: '/players', label: 'PLAYERS', desc: 'Meet the competitors.', icon: Medal },
            ].map((item) => (
              <Link key={item.label} to={item.to} data-scroll-reveal className="esports-card group p-4">
                <item.icon className="h-5 w-5 text-[#7fb3ff] transition group-hover:scale-110" />
                <p className="mt-3 font-display text-xs font-black tracking-[0.16em] text-white">{item.label}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 7. ROAD TO CHAMPIONSHIP */}
      <section className="relative overflow-hidden border-b border-[rgba(148,163,184,0.14)] bg-[#040918]">
        <div className="wm-grid-overlay absolute inset-0 opacity-[0.07]" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <p data-scroll-reveal className="esports-eyebrow">Format</p>
          <h2 data-scroll-reveal className="esports-h2 mt-2 text-2xl sm:text-3xl">
            THE ROAD TO CHAMPIONSHIP
          </h2>
          <div data-scroll-reveal className="road-line relative mt-10 grid gap-8 md:grid-cols-4 md:gap-6">
            {ROAD.map((s) => (
              <div key={s.n} className="relative pl-12 md:pl-0 md:pt-12">
                <span className="absolute left-0 top-0 grid h-11 w-11 place-items-center rounded-md border border-[rgba(30,99,255,0.4)] bg-[rgba(30,99,255,0.08)] font-display text-xs font-black text-white md:left-0 md:top-0">
                  {s.n}
                </span>
                <p className="font-display text-sm font-black tracking-[0.14em] text-white">{s.title}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8+9. CONQUER break + WHY WEBMASTERS */}
      <section id="about" className="relative scroll-mt-24 overflow-hidden border-b border-[rgba(148,163,184,0.14)]">
        <span className="giant-word absolute -bottom-6 left-0 whitespace-nowrap text-[24vw] md:text-[12rem]" aria-hidden="true">
          CONQUER.
        </span>
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <p data-scroll-reveal className="esports-eyebrow">Organization</p>
          <h2 data-scroll-reveal className="esports-h2 mt-2 max-w-xl text-2xl sm:text-3xl">
            BUILT FOR CAMPUS COMPETITION
          </h2>
          <p data-scroll-reveal className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">
            WEBMASTERS Esports Banilad brings students together through competitive gaming, teamwork, school spirit, and esports.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {PILLARS.map((p) => (
              <article key={p.title} data-scroll-reveal className="esports-card relative overflow-hidden p-6">
                <div className="absolute inset-x-0 top-0 h-0.5 bg-[#1e63ff]" aria-hidden="true" />
                <p.icon className="h-6 w-6 text-[#7fb3ff]" />
                <h3 className="mt-4 font-display text-base font-black tracking-[0.16em] text-white">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{p.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 10. HALL OF CHAMPIONS placeholder banner */}
      <section className="relative overflow-hidden border-b border-[rgba(148,163,184,0.14)] bg-[#040918]">
        <div className="hero-atmosphere absolute inset-0" aria-hidden="true" />
        <span className="giant-word absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[18vw] md:text-[10rem]" aria-hidden="true">
          REPRESENT.
        </span>
        <div className="relative mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <Crown data-scroll-reveal className="mx-auto h-8 w-8 text-[#7fb3ff]" />
          <p data-scroll-reveal className="esports-eyebrow mt-4">Legacy</p>
          <h2 data-scroll-reveal className="esports-h2 mt-2 text-2xl sm:text-4xl">
            HALL OF CHAMPIONS
          </h2>
          <p data-scroll-reveal className="mt-3 font-display text-xs tracking-[0.3em] text-slate-300">
            LEGENDS WILL BE MADE HERE.
          </p>
          <p data-scroll-reveal className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Championship history will appear here.
          </p>
        </div>
      </section>

      <section id="faq" className="scroll-mt-24 border-b border-[rgba(148,163,184,0.14)]">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 md:grid-cols-[0.7fr_1.3fr] lg:px-8">
          <div data-scroll-reveal>
            <p className="esports-eyebrow">Need to know</p>
            <h2 className="esports-h2 mt-2 text-xl sm:text-2xl">FAQ</h2>
          </div>
          <div data-scroll-reveal className="esports-card divide-y divide-white/5 px-5">
            {FAQ_ITEMS.map((item) => (
              <details key={item.question} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-slate-200 marker:hidden">
                  {item.question}
                  <ChevronDown className="h-4 w-4 shrink-0 text-[#7fb3ff] transition group-open:rotate-180" />
                </summary>
                <p className="max-w-2xl pt-3 text-xs leading-relaxed text-slate-400">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="scroll-mt-24">
        <div data-scroll-reveal className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <p className="esports-eyebrow">Contact</p>
            <h2 className="esports-h2 mt-2 text-xl sm:text-2xl">ENTER THE ARENA</h2>
            <p className="mt-2 flex items-center gap-2 text-xs text-slate-400">
              <CalendarDays className="h-3.5 w-3.5" /> Follow official channels for fixtures and results.
            </p>
          </div>
          <SocialLinks className="flex-wrap" />
        </div>
      </section>

      {/* 11. FOOTER */}
      <footer className="relative overflow-hidden border-t border-[rgba(148,163,184,0.14)] bg-[#02040d]">
        <span className="giant-word absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[26vw] md:text-[13rem]" aria-hidden="true">
          WEBMASTERS
        </span>
        <div className="relative mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.2fr_1fr] lg:px-8">
          <div>
            <p className="font-display text-base font-black tracking-[0.18em] text-white">WEBMASTERS</p>
            <p className="font-display text-[11px] font-bold tracking-[0.3em] text-[#7fb3ff]">ESPORTS BANILAD</p>
            <p className="mt-3 font-display text-[10px] tracking-[0.24em] text-slate-400">COMPETE. CONQUER. REPRESENT.</p>
            <p className="mt-3 text-xs text-slate-500">University of Cebu – Banilad</p>
            <p className="mt-1 text-[11px] text-slate-600">© 2026 WEBMASTERS ESPORTS BANILAD</p>
          </div>
          <nav className="flex flex-wrap items-start gap-x-5 gap-y-2 text-xs font-semibold text-slate-400" aria-label="Footer navigation">
            <Link to="/" className="hover:text-white">HOME</Link>
            <Link to="/standings" className="hover:text-white">MATCHES</Link>
            <Link to="/teams" className="hover:text-white">TEAMS</Link>
            <Link to="/players" className="hover:text-white">PLAYERS</Link>
            <Link to="/intramurals" className="hover:text-white">INTRAMURALS</Link>
            <button type="button" onClick={() => scrollToSection('faq')} className="hover:text-white">FAQ</button>
            <button type="button" onClick={() => scrollToSection('contact')} className="hover:text-white">CONTACT</button>
          </nav>
        </div>
      </footer>
    </div>
  );
}
