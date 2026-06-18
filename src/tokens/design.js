// Global design tokens — single source of truth for all design values.
// Import these wherever you need raw values outside of Tailwind classes
// (e.g. Recharts theme props, inline styles, canvas drawing).

export const colors = {
  // Surfaces
  surface: {
    page:     '#0F1B2D',
    card:     '#16243B',
    elevated: '#1E2D44',
  },
  sidebar:    '#0A1628',

  // Accents
  accent: {
    teal: '#0891B2',
    cyan: '#06B6D4',
  },

  // Risk
  risk: {
    low:    '#0D9488',
    medium: '#D97706',
    high:   '#DC2626',
  },

  // Text
  text: {
    primary:   '#F1F5F9',
    secondary: '#94A3B8',
    muted:     '#64748B',
  },

  // Borders / separators
  border: {
    default: '#1E2D44',
    subtle:  '#334155',
  },
}

export const typography = {
  fontFamily: {
    sans: "'Inter', ui-sans-serif, system-ui, sans-serif",
    mono: "'JetBrains Mono', ui-monospace, monospace",
  },
  fontSize: {
    '2xs': '0.625rem',
    xs:    '0.75rem',
    sm:    '0.875rem',
    base:  '1rem',
    lg:    '1.125rem',
    xl:    '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  fontWeight: {
    light:    300,
    normal:   400,
    medium:   500,
    semibold: 600,
    bold:     700,
  },
}

export const spacing = {
  sidebar: {
    width:     '56px',
    iconSize:  '20px',
  },
  header: {
    height: '56px',
  },
}

export const shadows = {
  card:     '0 1px 3px 0 rgba(0,0,0,0.4), 0 1px 2px -1px rgba(0,0,0,0.4)',
  elevated: '0 4px 12px 0 rgba(0,0,0,0.5)',
  glow: {
    teal: '0 0 16px rgba(8,145,178,0.35)',
    cyan: '0 0 16px rgba(6,182,212,0.35)',
  },
}

export const borderRadius = {
  sm:   '4px',
  md:   '8px',
  lg:   '12px',
  xl:   '16px',
  full: '9999px',
}

// Recharts-ready chart theme
export const chartTheme = {
  background:    colors.surface.card,
  gridColor:     colors.border.default,
  axisColor:     colors.text.muted,
  tooltipBg:     colors.surface.elevated,
  tooltipBorder: colors.border.subtle,
  series: [
    colors.accent.cyan,
    colors.accent.teal,
    colors.risk.low,
    colors.risk.medium,
    colors.risk.high,
    '#818CF8',
    '#F472B6',
  ],
}