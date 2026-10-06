import { Link } from 'react-router-dom';

export default function EmptyState({ icon: Icon, heading, description, actionTo, actionLabel }) {
  return (
    <div className="esports-empty fade-in-section mx-auto flex max-w-xl flex-col items-center px-6 py-10 text-center">
      {Icon && (
        <span className="grid h-11 w-11 place-items-center rounded-md border border-[rgba(30,99,255,0.35)] bg-[rgba(30,99,255,0.08)] text-[#7fb3ff]">
          <Icon className="h-5 w-5" />
        </span>
      )}
      <h3 className="esports-h2 mt-4 text-sm tracking-[0.14em]">{heading}</h3>
      {description && (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-400">{description}</p>
      )}
      {actionTo && actionLabel && (
        <Link
          to={actionTo}
          className="esports-btn mt-5 inline-flex items-center gap-2 border border-[rgba(30,99,255,0.45)] bg-[rgba(30,99,255,0.1)] px-4 py-2 text-white hover:bg-[rgba(30,99,255,0.2)]"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
