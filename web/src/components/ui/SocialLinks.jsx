const SOCIAL_LINKS = [
  { name: 'Facebook', href: 'https://facebook.com/webmastersesports', icon: 'facebook' },
  { name: 'Discord', href: 'https://discord.gg/kJvXfFTs8s', icon: 'discord' },
];

export default function SocialLinks({ className = '' }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {SOCIAL_LINKS.map((social) => (
        <a
          key={social.name}
          href={social.href}
          target="_blank"
          rel="noreferrer"
          aria-label={social.name}
          title={social.name}
          className="inline-flex items-center gap-2 rounded-md border border-slate-700 bg-[#101317]/75 px-3 py-2 text-[10px] font-bold text-slate-300 backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:border-[#5d9bd0] hover:bg-[#172431]/80 hover:text-white"
        >
          <i className={`bi bi-${social.icon} text-sm`} aria-hidden="true" />
          <span>{social.name}</span>
        </a>
      ))}
    </div>
  );
}
