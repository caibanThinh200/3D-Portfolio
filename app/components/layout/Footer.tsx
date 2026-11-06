import clsx from "clsx";
import type { ReactNode } from "react";

const iconProps = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const GithubIcon = () => (
  <svg {...iconProps}>
    <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
  </svg>
);
const LinkedinIcon = () => (
  <svg {...iconProps}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" />
  </svg>
);
const TwitterIcon = () => (
  <svg {...iconProps}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);
const PhoneIcon = () => (
  <svg {...iconProps}>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
  </svg>
);
const MailIcon = () => (
  <svg {...iconProps}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-10 6L2 7" />
  </svg>
);

const SOCIALS: { label: string; href: string; icon: ReactNode }[] = [
  { label: "GitHub", href: "https://github.com/example", icon: <GithubIcon /> },
  { label: "LinkedIn", href: "https://linkedin.com/in/example", icon: <LinkedinIcon /> },
  { label: "Twitter", href: "https://twitter.com/example", icon: <TwitterIcon /> },
];

const linkClass = "inline-flex items-center gap-2.5 transition-colors hover:text-cyan-400";

export default function Footer() {
  return (
    <footer className={clsx('relative', 'z-10', 'border-t', 'border-white/5', 'bg-[#050510]', 'px-6', 'py-10', 'text-base', 'text-white/60', 'sm:px-12', 'lg:px-16', 'xl:px-24')}>
      <div className={clsx('flex', 'flex-col', 'gap-6', 'sm:flex-row', 'sm:items-center', 'sm:justify-between')}>
        <nav aria-label="Social links" className={clsx('flex', 'gap-6')}>
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              title={s.label}
              className={linkClass}
            >
              {s.icon}
            </a>
          ))}
        </nav>
        <div className={clsx('flex', 'flex-col', 'gap-3', 'sm:flex-row', 'sm:gap-8')}>
          <a href="tel:+84900000000" className={linkClass}>
            <PhoneIcon />
            +84 900 000 000
          </a>
          <a href="mailto:hello@example.com" className={linkClass}>
            <MailIcon />
            hello@example.com
          </a>
        </div>
        <p className="text-sm">&copy; 2026 Your Name. All rights reserved.</p>
      </div>
    </footer>
  );
}
