import IntramuralsNav from './IntramuralsNav';
import LeagueStandingsPage from './LeagueStandingsPage';

// Thin section wrapper: same navbar/footer/design, tournament-area identity strip,
// the shared intramurals sub-nav, then the existing Match Center logic
// (its internal view tabs are hidden — the sub-nav owns section switching).
export default function IntramuralsSection({ title, eyebrow, initialView, initialPhase, resultsOnly }) {
  return (
    <div className="bg-[#02040d]">
      {/* Section identity — same brand, tournament emphasis */}
      <div className="relative overflow-hidden border-b border-[rgba(148,163,184,0.14)] bg-[#040918]">
        <div className="wm-grid-overlay absolute inset-0 opacity-10" aria-hidden="true" />
        <div className="absolute -right-16 top-0 h-full w-64 -skew-x-12 bg-[rgba(30,99,255,0.07)]" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1440px] px-4 pt-8 sm:px-6 lg:px-8">
          <p className="font-display text-[10px] font-bold tracking-[0.34em] text-[#7fb3ff]">
            WEBMASTERS ESPORTS BANILAD
          </p>
          <h1 className="mt-2 font-display text-2xl font-black tracking-tight text-white sm:text-3xl">
            INTRAMURALS <span className="wm-hero-title">2026</span>
          </h1>
          <p className="mt-1 font-display text-[10px] tracking-[0.3em] text-slate-400">MLBB | VALORANT</p>
          <IntramuralsNav />
        </div>
      </div>
      <LeagueStandingsPage
        initialView={initialView}
        initialPhase={initialPhase}
        resultsOnly={resultsOnly}
        eyebrow={eyebrow}
        heading={title}
        hideViewTabs
      />
    </div>
  );
}
