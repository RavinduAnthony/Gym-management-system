// src/theme/theme.ts
// ACTIVE THEME: "Premium Gym Dark" — Deep Navy, Energy Red, and Secondary Blue
// A centralized, production-grade design system for a high-end SaaS feel.

export const theme = {
  colors: {
    // ── Primary Brand (Main Action Color) ──
    primary:        '#FF3B30',    // Energy Red — Buttons, highlights, critical actions
    primaryLight:   '#FF3B301A', // 10% accent
    primaryDark:    '#D73229',   // Hover states
    primaryGlow:    'rgba(255, 59, 48, 0.4)',

    // ── Secondary Brand (Analytics & Secondary Actions) ──
    secondary:      '#2F80ED',    // Analytics Blue — Charts, links
    secondaryLight: '#2F80ED1A',
    secondaryDark:  '#2467BE',

    // ── Base Backgrounds (Deep Navy SaaS Aesthetic) ──
    background:     '#0B0F1A',   // Primary Background — Deep Navy Black
    surface:        '#151C2E',   // Surface (Cards/Panels) — Navy Blue-Gray
    surfaceAlt:     '#1C253B',   // Elevated Surface — Inputs, metric boxes
    surfaceHover:   '#222B3D',   // Interactive hover / List highlights

    // ── Borders ──
    border:         '#222B3D',   // Subtle Navy Border
    borderStrong:   '#2D3954',   // Emphasized separator

    // ── Text (Optimized for Dark Mode) ──
    textPrimary:    '#FFFFFF',   // Pure White — Headings
    textSecondary:  '#A1A1AA',   // Muted Silver — Descriptions
    textTertiary:   '#6B7280',   // Gray — Placeholders / Disabled
    textInverse:    '#0B0F1A',   // Inverted Navy Black
    textOnAccent:   '#FFFFFF',   // Text on primary buttons

    // ── Semantic ──
    success:        '#22C55E',
    warning:        '#F59E0B',
    danger:         '#EF4444',
    info:           '#2F80ED',
  },

  fonts: {
    display: "'Poppins', 'Inter', sans-serif",
    body:    "'Inter', sans-serif",
    mono:    "'JetBrains Mono', monospace",
  },

  radius: {
    sm:   '6px',
    md:   '12px',
    lg:   '16px',
    xl:   '24px',
    pill: '999px',
  },

  shadows: {
    card:  '0 10px 30px -10px rgba(0,0,0,0.5)',
    glow:  '0 0 20px rgba(255, 59, 48, 0.3)',
  }
};

export default theme;
