// Design Tokens for Polla Mundialista — World Cup 2026 Premium

export const colors = {
  // Primary Colombia
  primary: {
    yellow: '#FCD116',
    blue: '#003893',
    red: '#CE1126',
  },
  // Secondary
  secondary: {
    darkBlue: '#0A1A44',
    white: '#FFFFFF',
    lightGray: '#F5F7FA',
    gold: '#F6D365',
  },
  // Dark theme
  dark: {
    bg: '#001b4d',
    surface: '#00112f',
    border: 'rgba(255, 255, 255, 0.1)',
    surfaceGlass: 'rgba(15, 23, 42, 0.55)',
  },
  // Glassmorphism
  glass: {
    bg: 'rgba(15, 23, 42, 0.55)',
    bgHover: 'rgba(15, 23, 42, 0.65)',
    border: 'rgba(255, 255, 255, 0.1)',
    borderHover: 'rgba(252, 209, 22, 0.25)',
    highlight: 'rgba(255, 255, 255, 0.06)',
    blur: '16px',
    blurLg: '24px',
  },
  // Semantic
  status: {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
  },
}

export const gradients = {
  surface: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(0, 27, 77, 0.6) 100%)',
  accent: 'linear-gradient(135deg, #FCD116 0%, #F6D365 50%, #FCD116 100%)',
  accentWarm: 'linear-gradient(135deg, #FCD116 0%, #FFC940 100%)',
  hero: 'radial-gradient(ellipse at top, rgba(252, 209, 22, 0.12) 0%, transparent 50%)',
  tricolor: 'linear-gradient(90deg, #FCD116, #003893, #CE1126)',
  tricolorSoft: 'linear-gradient(90deg, rgba(252,209,22,0.3), rgba(0,56,147,0.3), rgba(206,17,38,0.3))',
  gold: 'linear-gradient(135deg, #FCD116 0%, #FFD700 50%, #F6D365 100%)',
  silver: 'linear-gradient(135deg, #C0C0C0 0%, #E8E8E8 50%, #D4D4D4 100%)',
  bronze: 'linear-gradient(135deg, #CD7F32 0%, #DDA15E 50%, #CD7F32 100%)',
}

export const typography = {
  sizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
  },
  weights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
}

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
}

export const radius = {
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '2.5rem',
  full: '9999px',
}

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
  sports: '0 10px 25px rgba(0, 0, 0, 0.12)',
  glow: `0 0 20px rgba(252, 209, 22, 0.3)`,
  glowSm: `0 0 12px rgba(252, 209, 22, 0.2)`,
  glowLg: `0 0 40px rgba(252, 209, 22, 0.35), 0 0 80px rgba(252, 209, 22, 0.1)`,
  glass: '0 8px 32px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
  glassLg: '0 16px 48px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
}

export const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
}

export const transitions = {
  fast: '150ms ease-in-out',
  base: '250ms ease-in-out',
  slow: '350ms ease-in-out',
  spring: { type: 'spring', stiffness: 300, damping: 25 },
  springSmooth: { type: 'spring', stiffness: 200, damping: 30 },
  springBouncy: { type: 'spring', stiffness: 400, damping: 20 },
}
