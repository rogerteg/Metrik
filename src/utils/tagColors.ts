export interface TagTheme {
  name: string;
  color: string;
  bg: string;
  border: string;
}

const FALLBACK_THEME: TagTheme = {
  name: 'slate',
  color: '#94a3b8',
  bg: 'rgba(148, 163, 184, 0.15)',
  border: 'rgba(148, 163, 184, 0.3)',
};

export const TAG_THEMES: TagTheme[] = [
  {
    name: 'blue',
    color: '#38bdf8',
    bg: 'rgba(56, 189, 248, 0.15)',
    border: 'rgba(56, 189, 248, 0.35)',
  },
  {
    name: 'emerald',
    color: '#34d399',
    bg: 'rgba(52, 211, 153, 0.15)',
    border: 'rgba(52, 211, 153, 0.35)',
  },
  {
    name: 'amber',
    color: '#fbbf24',
    bg: 'rgba(251, 191, 36, 0.15)',
    border: 'rgba(251, 191, 36, 0.35)',
  },
  {
    name: 'purple',
    color: '#c084fc',
    bg: 'rgba(192, 132, 252, 0.15)',
    border: 'rgba(192, 132, 252, 0.35)',
  },
  {
    name: 'rose',
    color: '#fb7185',
    bg: 'rgba(251, 113, 133, 0.15)',
    border: 'rgba(251, 113, 133, 0.35)',
  },
  {
    name: 'cyan',
    color: '#22d3ee',
    bg: 'rgba(34, 211, 238, 0.15)',
    border: 'rgba(34, 211, 238, 0.35)',
  },
];

/**
 * Deterministic color picker for tags using string hashing.
 * Always produces the same color theme for identical tag names, case-insensitive.
 */
export function getTagTheme(tag: string | undefined | null): TagTheme {
  if (!tag) return FALLBACK_THEME;
  const cleanTag = tag.trim().toLowerCase();
  if (!cleanTag) return FALLBACK_THEME;

  let hash = 0;
  for (let i = 0; i < cleanTag.length; i++) {
    hash = (hash << 5) - hash + cleanTag.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  const index = Math.abs(hash) % TAG_THEMES.length;
  return TAG_THEMES[index];
}
