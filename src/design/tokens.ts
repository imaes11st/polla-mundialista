// Design Tokens for Polla Mundialista

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
  },
  // Dark theme
  dark: {
    bg: '#001b4d',
    surface: '#00112f',
    border: 'rgba(255, 255, 255, 0.1)',
  },
  // Semantic
  status: {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
  },
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
  },
  weights: {
    light: 300,
    normal: 400,
    semibold: 600,
    bold: 700,
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
  full: '9999px',
}

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
  sports: '0 10px 25px rgba(0, 0, 0, 0.12)',
  glow: `0 0 20px rgba(252, 209, 22, 0.3)`,
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
}
