import { NavLink } from 'react-router-dom';

// The single intramurals sub-navigation — one row, one set of labels,
// used by every page in the category so the section always feels the same.
const ITEMS = [
  { to: '/intramurals', label: 'Overview', end: true },
  { to: '/intramurals/schedule', label: 'Schedule' },
  { to: '/intramurals/standings', label: 'Standings' },
  { to: '/intramurals/bracket', label: 'Bracket' },
  { to: '/intramurals/results', label: 'Results' },
];

export default function IntramuralsNav({ centered = false }) {
  return (
    <nav
      className={`mt-6 flex flex-wrap gap-1 overflow-x-auto border-b border-white/10 pb-px ${
        centered ? 'justify-center' : ''
      }`}
      aria-label="Intramurals section"
    >
      {ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `group relative whitespace-nowrap px-4 py-2.5 font-display text-[11px] font-bold uppercase tracking-[0.18em] transition-all duration-200 hover:-translate-y-px active:translate-y-0 ${
              isActive ? 'text-white' : 'text-slate-500 hover:text-slate-200'
            }`
          }
        >
          {({ isActive }) => (
            <>
              {item.label}
              <span
                aria-hidden="true"
                className={`absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-[#1e63ff] shadow-[0_0_10px_rgba(30,99,255,0.7)] transition-all duration-300 ${
                  isActive ? 'scale-x-100 opacity-100' : 'scale-x-50 opacity-0 group-hover:scale-x-75 group-hover:opacity-40'
                }`}
              />
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
