import { useEffect, useRef, useState } from 'react';
import { Routes, Route, NavLink, Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  Trophy,
  Calendar,
  Users,
  ShieldCheck,
  Settings,
  Menu,
  X,
  Maximize2,
  Minimize2,
  LogOut,
  ChevronDown,
  BarChart2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import TournamentSetup from './TournamentSetup';
import TeamManagement from './TeamManagement';
import ScheduleGenerator from './ScheduleGenerator';
import ControlRoomPage from './ControlRoomPage';
import TeamDetailPage from './TeamDetailPage';
import LeagueStandingsPage from './LeagueStandingsPage';
import IntramuralsOverview from './IntramuralsOverview';
import IntramuralsSection from './IntramuralsSection';
import LandingPage from './LandingPage';
import PlayerStatsPage from './PlayerStatsPage';
import TeamCompetitionPage from './TeamCompetitionPage';
import AdminLoginPage from './AdminLoginPage';
import MatchResultEntry from './MatchResultEntry';
import LiveTickerBanner from './LiveTickerBanner';
import DepartmentLeaderboard from './DepartmentLeaderboard';
import { useTournament } from '../context/TournamentContext';
import { useFirebaseAuth } from '../context/FirebaseAuthContext';
import {
  attachGlobalSoundFx,
  isSfxEnabled,
  onSfxChange,
  setSfxEnabled,
} from '../modules/soundFx';

export default function EsportsLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { tournament } = useTournament();
  const {
    user: adminUser,
    loading: authLoading,
    isFirebaseConfigured,
    signIn,
    signOut,
  } = useFirebaseAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const adminMenuRef = useRef(null);
  const [intramuralsMenuOpen, setIntramuralsMenuOpen] = useState(false);
  const intramuralsMenuRef = useRef(null);
  const isAdmin = Boolean(adminUser);
  const [sfxOn, setSfxOn] = useState(isSfxEnabled);

  useEffect(() => attachGlobalSoundFx(), []);
  useEffect(() => onSfxChange(setSfxOn), []);

  // Close dropdowns on outside click / Escape / route change
  useEffect(() => {
    if (!adminMenuOpen && !intramuralsMenuOpen) return undefined;
    const onPointerDown = (e) => {
      if (adminMenuRef.current && !adminMenuRef.current.contains(e.target)) setAdminMenuOpen(false);
      if (intramuralsMenuRef.current && !intramuralsMenuRef.current.contains(e.target)) setIntramuralsMenuOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setAdminMenuOpen(false);
        setIntramuralsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [adminMenuOpen, intramuralsMenuOpen]);

  useEffect(() => {
    setAdminMenuOpen(false);
    setIntramuralsMenuOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [mobileMenuOpen]);

  const tournamentYear = tournament?.date?.slice(0, 4);

  // Public read-only nav — no /register
  const publicNavItems = [
    { to: '/', label: 'HOME', icon: Trophy },
    { to: '/standings', label: 'MATCHES', icon: Calendar },
    { to: '/teams', label: 'TEAMS', icon: Users },
    { to: '/players', label: 'PLAYERS', icon: BarChart2 },
    { to: '/leaderboard', label: 'LEADERBOARD', icon: Trophy },
  ];

  // Admin-only panel items (scoring + management)
  const adminNavItems = [
    { to: '/admin/results', label: 'Score Entry', icon: ShieldCheck },
    { to: '/schedule', label: 'Schedule', icon: Calendar },
    { to: '/manage-teams', label: 'Teams', icon: Users },
    { to: '/admin', label: 'Control Room', icon: ShieldCheck },
    { to: '/setup', label: 'Setup', icon: Settings },
  ];

  const intramuralsNavItems = [
    { to: '/intramurals', label: 'Overview' },
    { to: '/intramurals/schedule', label: 'Schedule' },
    { to: '/intramurals/standings', label: 'Standings' },
    { to: '/intramurals/bracket', label: 'Bracket' },
    { to: '/intramurals/results', label: 'Results' },
  ];

  const isIntramuralsActive = location.pathname.startsWith('/intramurals');
  const isAdminRouteActive = ['/admin', '/schedule', '/manage-teams', '/setup'].some((p) =>
    location.pathname.startsWith(p)
  );

  const navigateToLandingSection = (sectionId) => {
    navigate('/', { state: { scrollToSection: sectionId } });
  };

  const handleAdminLogin = async (email, password) => {
    try {
      await signIn(email.trim(), password);
      setLoginError('');
      navigate(location.state?.from || '/admin', { replace: true });
    } catch (error) {
      const messages = {
        'auth/invalid-credential': 'That email or password did not match. Try again.',
        'auth/invalid-email': 'Enter a valid email address.',
        'auth/too-many-requests': 'Too many sign-in attempts. Try again later.',
        'auth/network-request-failed': 'Could not reach Firebase. Check your connection.',
      };
      setLoginError(messages[error.code] || error.message || 'Sign-in failed.');
    }
  };

  const handleAdminLogout = async () => {
    try {
      await signOut();
      setMobileMenuOpen(false);
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Could not sign out of Firebase', error);
    }
  };

  const requireAdmin = (element) =>
    authLoading ? (
      <div role="status" className="grid min-h-[50vh] place-items-center text-sm text-slate-400">
        Checking session…
      </div>
    ) : isAdmin ? element : (
      <Navigate to="/admin" replace state={{ from: location.pathname }} />
    );

  return (
    <div className="app-shell min-h-screen bg-[#090a0c] text-slate-100 flex flex-col font-sans selection:bg-sky-700/40 selection:text-white">

      {/* Focus Mode restore pill */}
      {focusMode && (
        <button
          type="button"
          onClick={() => setFocusMode(false)}
          className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-semibold text-slate-300 shadow-2xl backdrop-blur-md hover:bg-slate-800 hover:text-white transition-all group"
        >
          <Minimize2 className="w-3.5 h-3.5 text-sky-300 group-hover:scale-110 transition-transform" />
          <span>Exit Stage Mode</span>
        </button>
      )}

      {/* Live Ticker Banner — shown globally above nav when matches are live */}
      {!focusMode && <LiveTickerBanner />}

      {/* Main Header Navigation */}
      {!focusMode && (
        <header className="fixed inset-x-0 top-0 z-40 w-full border-b border-[rgba(77,205,255,0.22)] bg-[rgba(5,8,20,0.9)] shadow-lg shadow-black/20 backdrop-blur-[18px]" style={{ top: 'var(--ticker-height, 0px)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
            <div className="grid h-16 md:h-20 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">

              {/* Brand */}
              <div className="flex min-w-0 items-center gap-3.5">
                <NavLink
                  to="/"
                  className="flex min-w-0 items-center gap-2 sm:gap-3 shrink-0 group transition-transform active:scale-[0.98]"
                >
                  <div className="grid h-9 w-9 sm:h-10 sm:w-10 shrink-0 place-items-center">
                    <img src="/images/logo/logo-optimized.png" alt="Webmasters Esports crest" className="h-9 w-9 sm:h-10 sm:w-10 bg-transparent object-contain wm-crest-glow" />
                  </div>
                  <div className="leading-tight hidden sm:block min-w-0">
                    <p className="font-display text-sm tracking-wide text-white whitespace-nowrap">WEBMASTERS</p>
                    <p className="font-body-wm text-[11px] tracking-[0.25em] text-[color:var(--wm-cyan)] whitespace-nowrap">ESPORTS BANILAD</p>
                  </div>
                </NavLink>
              </div>

              {/* Center Nav (Desktop) */}
              <nav className="hidden items-center justify-self-center gap-6 font-body-wm text-sm lg:flex xl:gap-8" aria-label="Main navigation">
                {publicNavItems.map((item) => {
                  const isActive =
                    item.to === '/'
                      ? location.pathname === '/'
                      : item.to === '/standings'
                        ? ['/standings', '/public'].includes(location.pathname)
                        : location.pathname.startsWith(item.to);
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/'}
                      className={`wm-nav-link font-body-wm text-sm font-semibold uppercase transition-colors hover:text-white ${isActive ? 'active' : ''}`}
                    >
                      {item.label}
                    </NavLink>
                  );
                })}

                {/* INTRAMURALS dropdown */}
                <div ref={intramuralsMenuRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setIntramuralsMenuOpen((v) => !v)}
                    aria-expanded={intramuralsMenuOpen}
                    aria-haspopup="menu"
                    className={`wm-nav-link flex items-center gap-1 font-body-wm text-sm font-semibold uppercase transition-colors hover:text-white ${isIntramuralsActive ? 'active' : ''}`}
                  >
                    INTRAMURALS
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${intramuralsMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {intramuralsMenuOpen && (
                    <div
                      role="menu"
                      aria-label="Intramurals section"
                      className="animate-pop-in wm-dropdown-center absolute left-1/2 top-[calc(100%+14px)] z-50 w-56 -translate-x-1/2 overflow-hidden rounded-md border border-[rgba(30,99,255,0.35)] bg-[#060b18] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.8)]"
                    >
                      <p className="border-b border-white/[0.07] px-4 py-2.5 font-display text-[10px] font-bold tracking-[0.22em] text-[#7fb3ff]">
                        INTRAMURALS 2026
                      </p>
                      <div className="p-1.5">
                        {intramuralsNavItems.map((sub) => {
                          const active = sub.to === '/intramurals' ? location.pathname === '/intramurals' : location.pathname === sub.to;
                          return (
                            <NavLink
                              key={sub.to}
                              to={sub.to}
                              role="menuitem"
                              onClick={() => setIntramuralsMenuOpen(false)}
                              className={`block rounded px-3 py-2 text-[13px] font-semibold transition-colors ${active ? 'bg-[rgba(30,99,255,0.16)] text-white' : 'text-slate-300 hover:bg-[rgba(30,99,255,0.12)] hover:text-white'}`}
                            >
                              {sub.label}
                            </NavLink>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </nav>

              {/* Right Controls */}
              <div className="hidden items-center justify-self-end gap-2 lg:flex xl:gap-3">
                {isAdmin && (
                  <div ref={adminMenuRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setAdminMenuOpen((v) => !v)}
                      aria-expanded={adminMenuOpen}
                      aria-haspopup="menu"
                      className={`flex items-center gap-1.5 rounded-md border px-3 py-2 font-display text-[11px] font-bold tracking-[0.12em] uppercase transition-colors ${isAdminRouteActive || adminMenuOpen ? 'border-[rgba(30,99,255,0.6)] bg-[rgba(30,99,255,0.14)] text-white' : 'border-slate-700 bg-slate-900/80 text-slate-300 hover:border-slate-500 hover:text-white'}`}
                    >
                      <ShieldCheck className="h-3.5 w-3.5 text-[#7fb3ff]" />
                      <span>Admin</span>
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${adminMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {adminMenuOpen && (
                      <div
                        role="menu"
                        aria-label="Admin panel"
                        className="animate-pop-in absolute right-0 top-[calc(100%+10px)] z-50 w-60 overflow-hidden rounded-md border border-[rgba(30,99,255,0.35)] bg-[#060b18] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.8)]"
                      >
                        <p className="flex items-center gap-2 border-b border-white/[0.07] px-4 py-2.5 font-display text-[10px] font-bold tracking-[0.22em] text-[#7fb3ff]">
                          <ShieldCheck className="h-3.5 w-3.5" /> COORDINATOR PANEL
                        </p>
                        <div className="p-1.5">
                          {adminNavItems.map((item) => {
                            const Icon = item.icon;
                            const active = location.pathname.startsWith(item.to);
                            return (
                              <NavLink
                                key={item.to}
                                to={item.to}
                                role="menuitem"
                                onClick={() => setAdminMenuOpen(false)}
                                className={`flex items-center gap-2.5 rounded px-3 py-2 text-[13px] font-semibold transition-colors ${active ? 'bg-[rgba(30,99,255,0.16)] text-white' : 'text-slate-300 hover:bg-[rgba(30,99,255,0.12)] hover:text-white'}`}
                              >
                                <Icon className="h-4 w-4 text-[#7fb3ff]" />
                                <span>{item.label}</span>
                              </NavLink>
                            );
                          })}
                        </div>
                        <div className="border-t border-white/[0.07] p-1.5">
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => { setAdminMenuOpen(false); handleAdminLogout(); }}
                            className="flex w-full items-center gap-2.5 rounded px-3 py-2 text-[13px] font-semibold text-slate-300 transition-colors hover:bg-rose-500/10 hover:text-white"
                          >
                            <LogOut className="h-4 w-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {!isAdmin && (
                  <NavLink
                    to="/admin"
                    className="flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-900/80 px-3 py-2 font-display text-[11px] font-bold tracking-[0.12em] uppercase text-slate-400 transition-colors hover:border-slate-500 hover:text-white"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Coordinator
                  </NavLink>
                )}

                <a
                  href="https://discord.gg/kJvXfFTs8s"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="wm-btn-primary wm-clip font-display text-xs tracking-wide px-4 py-2.5 xl:px-5 hover:opacity-95 transition whitespace-nowrap"
                >
                  JOIN DISCORD
                </a>

                <button
                  type="button"
                  onClick={() => setSfxEnabled(!sfxOn)}
                  aria-pressed={sfxOn}
                  className={`p-2 rounded-xl border transition-all active:scale-90 ${sfxOn ? 'bg-[#17212b] border-[#385a77] text-sky-300' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white hover:border-slate-700'}`}
                  title={sfxOn ? 'Mute interface sounds' : 'Enable interface sounds'}
                >
                  {sfxOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => setFocusMode(true)}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all active:scale-90"
                  title="Stage Broadcast Mode"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile Hamburger */}
              <div className="flex items-center justify-self-end gap-2 lg:hidden">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="rounded-xl border border-slate-700/80 bg-slate-900/70 p-2 text-slate-300 backdrop-blur-md transition-colors hover:border-slate-500 hover:text-white"
                  aria-label="Toggle Navigation Menu"
                  aria-expanded={mobileMenuOpen}
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Drawer */}
          {mobileMenuOpen && (
            <div className="lg:hidden max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-2xl px-4 py-4 space-y-3 animate-fadeIn">
              <div className="grid grid-cols-2 gap-2 pt-1">
                {publicNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to);
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${isActive ? 'bg-[#24384a] text-white' : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800'}`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-2">
                <p className="px-2 py-1.5 font-display text-[10px] font-bold tracking-[0.22em] text-[#7fb3ff]">INTRAMURALS 2026</p>
                {intramuralsNavItems.map((sub) => {
                  const active = sub.to === '/intramurals' ? location.pathname === '/intramurals' : location.pathname === sub.to;
                  return (
                    <NavLink
                      key={sub.to}
                      to={sub.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block rounded-lg px-3 py-2.5 text-xs font-bold transition-all ${active ? 'bg-[rgba(30,99,255,0.18)] text-white' : 'text-slate-300 hover:bg-slate-800'}`}
                    >
                      {sub.label}
                    </NavLink>
                  );
                })}
              </div>

              {isAdmin && (
                <div className="rounded-xl border border-[rgba(30,99,255,0.3)] bg-[rgba(30,99,255,0.06)] p-2">
                  <p className="flex items-center gap-2 px-2 py-1.5 font-display text-[10px] font-bold tracking-[0.22em] text-[#7fb3ff]">
                    <ShieldCheck className="h-3.5 w-3.5" /> COORDINATOR
                  </p>
                  {adminNavItems.map((item) => {
                    const Icon = item.icon;
                    const active = location.pathname.startsWith(item.to);
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${active ? 'bg-[rgba(30,99,255,0.18)] text-white' : 'text-slate-300 hover:bg-slate-800'}`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              )}

              <div className="flex gap-2">
                <a
                  href="https://discord.gg/kJvXfFTs8s"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1e63ff] text-white text-xs font-bold"
                >
                  JOIN DISCORD
                </a>
                <button
                  type="button"
                  onClick={() => setSfxEnabled(!sfxOn)}
                  aria-pressed={sfxOn}
                  className={`grid w-11 place-items-center rounded-xl border transition-all active:scale-90 ${sfxOn ? 'border-[#385a77] bg-[#17212b] text-sky-300' : 'border-slate-700 bg-slate-900 text-slate-400'}`}
                >
                  {sfxOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </button>
              </div>

              {isAdmin && (
                <button
                  type="button"
                  onClick={handleAdminLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 text-xs font-bold"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          )}
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1 relative z-10 w-full pt-16 md:pt-20">
        <div key={location.pathname} className="animate-fadeIn">
          <Routes>
            {/* ── Public read-only routes ── */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/standings" element={<LeagueStandingsPage />} />
            <Route path="/teams" element={<TeamCompetitionPage />} />
            <Route path="/team/:teamId" element={<TeamDetailPage />} />
            <Route path="/players" element={<PlayerStatsPage />} />
            <Route path="/players/:playerId" element={<PlayerStatsPage />} />
            <Route path="/stats" element={<PlayerStatsPage />} />
            <Route path="/stats/:playerId" element={<PlayerStatsPage />} />
            <Route path="/leaderboard" element={<DepartmentLeaderboard />} />
            <Route path="/public" element={<LeagueStandingsPage />} />

            {/* ── Intramurals section ── */}
            <Route path="/intramurals" element={<IntramuralsOverview />} />
            <Route
              path="/intramurals/schedule"
              element={<IntramuralsSection title={<>INTRAMURALS <span className="wm-hero-title">SCHEDULE</span></>} eyebrow="Intramurals 2026 · Fixtures" initialView="MATCHES" />}
            />
            <Route
              path="/intramurals/standings"
              element={<IntramuralsSection title={<>INTRAMURALS <span className="wm-hero-title">STANDINGS</span></>} eyebrow="Intramurals 2026 · Tables" initialView="STANDINGS" />}
            />
            <Route
              path="/intramurals/bracket"
              element={<IntramuralsSection title={<>INTRAMURALS <span className="wm-hero-title">BRACKET</span></>} eyebrow="Intramurals 2026 · Playoffs" initialView="BRACKET" initialPhase="Playoffs" />}
            />
            <Route
              path="/intramurals/results"
              element={<IntramuralsSection title={<>INTRAMURALS <span className="wm-hero-title">RESULTS</span></>} eyebrow="Intramurals 2026 · Verified scores" initialView="MATCHES" resultsOnly />}
            />

            {/* ── Coordinator-protected routes ── */}
            <Route path="/admin/results" element={requireAdmin(<MatchResultEntry />)} />
            <Route path="/manage-teams" element={requireAdmin(<TeamManagement />)} />
            <Route path="/schedule" element={requireAdmin(<ScheduleGenerator />)} />
            <Route path="/setup" element={requireAdmin(<TournamentSetup />)} />
            <Route
              path="/admin"
              element={
                authLoading ? (
                  <div role="status" className="grid min-h-[50vh] place-items-center text-sm text-slate-400">
                    Checking session…
                  </div>
                ) : isAdmin ? (
                  <ControlRoomPage />
                ) : (
                  <AdminLoginPage
                    onLogin={handleAdminLogin}
                    error={loginError}
                    isConfigured={isFirebaseConfigured}
                    loading={authLoading}
                  />
                )
              }
            />

            {/* ── Catch-all redirects ── */}
            <Route path="/register" element={<Navigate to="/" replace />} />
            <Route path="/registrations" element={<Navigate to="/admin" replace />} />
            <Route path="/access" element={<Navigate to="/admin" replace />} />
          </Routes>
        </div>
      </main>

      {/* Footer */}
      {!focusMode && location.pathname !== '/' && (
        <footer className="relative z-10 mt-auto border-t border-[rgba(148,163,184,0.16)] bg-[#02040d]/90 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid gap-8 md:grid-cols-[1.2fr_1fr]">
              <div>
                <p className="font-display text-sm font-black tracking-[0.18em] text-white">WEBMASTERS</p>
                <p className="font-display text-[11px] font-bold tracking-[0.3em] text-[#7fb3ff]">ESPORTS BANILAD</p>
                <p className="mt-3 font-display text-[10px] tracking-[0.24em] text-slate-400">COMPETE. CONQUER. REPRESENT.</p>
                <p className="mt-3 text-xs text-slate-500">University of Cebu – Banilad</p>
                <p className="mt-1 text-[11px] text-slate-600">© 2026 WEBMASTERS ESPORTS BANILAD</p>
              </div>
              <nav className="flex flex-wrap items-start gap-x-5 gap-y-2 text-xs font-semibold text-slate-400" aria-label="Footer navigation">
                <NavLink to="/" className="hover:text-white transition-colors">HOME</NavLink>
                <NavLink to="/standings" className="hover:text-white transition-colors">MATCHES</NavLink>
                <NavLink to="/teams" className="hover:text-white transition-colors">TEAMS</NavLink>
                <NavLink to="/players" className="hover:text-white transition-colors">PLAYERS</NavLink>
                <NavLink to="/leaderboard" className="hover:text-white transition-colors">LEADERBOARD</NavLink>
                <NavLink to="/intramurals" className="hover:text-white transition-colors">INTRAMURALS</NavLink>
                <button type="button" onClick={() => navigateToLandingSection('faq')} className="hover:text-white transition-colors">FAQ</button>
                <button type="button" onClick={() => navigateToLandingSection('contact')} className="hover:text-white transition-colors">CONTACT</button>
                {tournamentYear && <span className="text-slate-600">Season {tournamentYear}</span>}
              </nav>
            </div>
            {isAdmin && (
              <div className="mt-6 flex flex-wrap gap-4 border-t border-white/5 pt-4 text-[11px] text-slate-500">
                <span className="rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-bold text-amber-300">COORDINATOR</span>
                <NavLink to="/setup" className="hover:text-blue-400 transition-colors">Settings</NavLink>
                <NavLink to="/admin" className="hover:text-blue-400 transition-colors">Control Room</NavLink>
                <NavLink to="/admin/results" className="hover:text-blue-400 transition-colors">Score Entry</NavLink>
              </div>
            )}
          </div>
        </footer>
      )}
    </div>
  );
}