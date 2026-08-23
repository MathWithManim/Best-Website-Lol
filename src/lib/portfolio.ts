// ── PORTFOLIO CONTENT ────────────────────────────────────────────────
// Every personal fact on the home page lives here. Swap these values and
// the whole page updates — no component edits needed. Lines marked with
// SWAP: are invented placeholders.

export const TAGLINE = 'Full-stack developer. I ship small things and keep them shipped.'; // SWAP:
export const INTRO =
  'I build web apps end to end: React on the front, Convex on the back, Cloudflare in between.'; // SWAP:

export const ABOUT_PARAGRAPHS: string[] = [
  // SWAP: both paragraphs are placeholder copy.
  'I write TypeScript all day, mostly by choice. I care about the boring parts done right: types that hold up, backends that survive concurrency, deploys nobody has to babysit.',
  'This page is my public workbench. Projects land here once they stop embarrassing me.',
];

export const FACTS: Array<{ label: string; value: string }> = [
  { label: 'Role', value: 'Full-stack developer' }, // SWAP:
  { label: 'Focus', value: 'Web apps · realtime UIs' }, // SWAP:
  { label: 'Currently', value: 'Open to interesting work' }, // SWAP:
];

export interface Project {
  title: string;
  description: string;
  bullets?: string[];
  stack: string[];
  href?: string;
  hrefLabel?: string;
}

export const PROJECTS: Project[] = [
  {
    title: 'Project One', // SWAP:
    description: 'Swap this card in src/lib/portfolio.ts — title, description, stack chips and link.', // SWAP:
    stack: ['Your', 'Stack', 'Here'],
  },
  {
    title: 'Project Two', // SWAP:
    description: 'Same deal — a real project goes here.', // SWAP:
    stack: ['Swap', 'Me'],
  },
  {
    title: 'Project Three', // SWAP:
    description: 'Third slot, same drill.', // SWAP:
    stack: ['TBD'],
  },
];

export const SKILL_GROUPS: Array<{ group: string; items: string[] }> = [
  { group: 'Frontend', items: ['React 19', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Vite'] },
  { group: 'Backend', items: ['Convex functions & components', 'Better Auth', 'Cron jobs', 'Rate limiting'] },
  { group: 'Tooling', items: ['Git & GitHub Actions', 'Cloudflare Pages', 'Vitest', 'Sentry'] },
]; // SWAP: trim or extend to your real stack

export const CONTACT_BLURB = 'Got a project or a weird idea? Links below.'; // SWAP:
export const SOCIALS: Array<{ label: string; href: string }> = [
  { label: 'GitHub', href: '#' }, // SWAP: real URLs
  { label: 'X / Twitter', href: '#' }, // SWAP:
  { label: 'Email', href: '#' }, // SWAP: mailto:you@example.com
];
