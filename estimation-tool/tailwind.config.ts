import type { Config } from 'tailwindcss'
import forms from '@tailwindcss/forms'

// ─────────────────────────────────────────────────────────────────────────────
// COLOR SYSTEM RULE: Use ONLY the tokens defined below in all components.
// Do NOT use raw Tailwind slate-*, orange-*, or zinc-* utilities — those are
// reserved for the dark sidebar shell (Sidebar.tsx) which intentionally sits
// outside the Material Design 3 surface system.
// ─────────────────────────────────────────────────────────────────────────────

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      // ── Material Design 3 color tokens ──────────────────────────────────
      colors: {
        // Primary (brand orange)
        primary:                  '#a04100',
        'on-primary':             '#ffffff',
        'primary-container':      '#ff6b00',
        'on-primary-container':   '#572000',
        'primary-fixed':          '#ffdbcc',
        'primary-fixed-dim':      '#ffb693',
        'on-primary-fixed':       '#351000',
        'on-primary-fixed-variant': '#7a3000',
        'inverse-primary':        '#ffb693',

        // Secondary (steel blue)
        secondary:                '#476083',
        'on-secondary':           '#ffffff',
        'secondary-container':    '#bdd6ff',
        'on-secondary-container': '#445d80',
        'secondary-fixed':        '#d4e3ff',
        'secondary-fixed-dim':    '#afc8f0',
        'on-secondary-fixed':     '#001c3a',
        'on-secondary-fixed-variant': '#2f486a',

        // Tertiary (blue)
        tertiary:                 '#005db6',
        'on-tertiary':            '#ffffff',
        'tertiary-container':     '#5b99f7',
        'on-tertiary-container':  '#003064',
        'tertiary-fixed':         '#d6e3ff',
        'tertiary-fixed-dim':     '#a9c7ff',
        'on-tertiary-fixed':      '#001b3d',
        'on-tertiary-fixed-variant': '#00468c',

        // Error
        error:                    '#ba1a1a',
        'on-error':               '#ffffff',
        'error-container':        '#ffdad6',
        'on-error-container':     '#93000a',

        // Surfaces
        surface:                  '#f8f9fa',
        'on-surface':             '#191c1d',
        'surface-variant':        '#e1e3e4',
        'on-surface-variant':     '#5a4136',
        'surface-tint':           '#a04100',
        'surface-dim':            '#d9dadb',
        'surface-bright':         '#f8f9fa',
        'surface-container-lowest':  '#ffffff',
        'surface-container-low':     '#f3f4f5',
        'surface-container':         '#edeeef',
        'surface-container-high':    '#e7e8e9',
        'surface-container-highest': '#e1e3e4',
        'inverse-surface':        '#2e3132',
        'inverse-on-surface':     '#f0f1f2',

        // Background
        background:               '#f8f9fa',
        'on-background':          '#191c1d',

        // Outline
        outline:                  '#8e7164',
        'outline-variant':        '#e2bfb0',
      },

      // ── Border radius ────────────────────────────────────────────────────
      borderRadius: {
        DEFAULT: '0.25rem',   // 4px  — tighter than Tailwind default
        md:      '0.375rem',  // 6px
        lg:      '0.5rem',    // 8px
        xl:      '0.75rem',   // 12px
        full:    '9999px',
      },

      // ── Typography ───────────────────────────────────────────────────────
      fontFamily: {
        // Use font-sans everywhere; font-manrope is an alias for components
        // that explicitly reference it (matches the Stitch class name).
        sans:    ['var(--font-manrope)', 'system-ui', 'sans-serif'],
        manrope: ['var(--font-manrope)', 'system-ui', 'sans-serif'],
        headline: ['var(--font-manrope)', 'system-ui', 'sans-serif'],
        body:    ['var(--font-manrope)', 'system-ui', 'sans-serif'],
        label:   ['var(--font-manrope)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [forms],
}

export default config
