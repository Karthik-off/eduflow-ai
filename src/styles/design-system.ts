import { cn } from "@/lib/utils"

// Modern color palette inspired by Apple/Google Material
export const colors = {
  // Primary colors - Modern blue gradient
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
  // Secondary colors - Modern gray
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },
  // Accent colors - Modern purple/cyan
  accent: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#22d3ee',
    600: '#06b6d4',
    700: '#0891b2',
    800: '#0e7490',
    900: '#155e75',
    950: '#164e63',
  },
  // Success colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },
  // Warning colors
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },
  // Error colors
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },
}

// Modern gradients
export const gradients = {
  primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  secondary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  accent: 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)',
  success: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
  warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  glass: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
  card: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.95) 100%)',
}

// Modern shadows
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  glow: '0 0 20px rgba(59, 130, 246, 0.15)',
  card: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
}

// Modern animations
export const animations = {
  // Smooth transitions
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  transitionFast: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
  transitionSlow: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  
  // Hover effects
  hover: {
    scale: 'scale(1.02)',
    translateY: 'translateY(-2px)',
    shadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
  },
  
  // Loading animations
  spin: 'spin 1s linear infinite',
  pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  bounce: 'bounce 1s infinite',
  
  // Page transitions
  slideUp: 'translateY(20px)',
  slideDown: 'translateY(-20px)',
  fadeIn: 'opacity(0)',
  fadeOut: 'opacity(1)',
}

// Modern spacing scale (8px base unit)
export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
  32: '128px',
  40: '160px',
  48: '192px',
  56: '224px',
  64: '256px',
}

// Modern border radius
export const borderRadius = {
  none: '0px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '20px',
  '3xl': '24px',
  full: '9999px',
}

// Typography scale
export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
  },
  fontSize: {
    xs: ['12px', { lineHeight: '16px' }],
    sm: ['14px', { lineHeight: '20px' }],
    base: ['16px', { lineHeight: '24px' }],
    lg: ['18px', { lineHeight: '28px' }],
    xl: ['20px', { lineHeight: '28px' }],
    '2xl': ['24px', { lineHeight: '32px' }],
    '3xl': ['30px', { lineHeight: '36px' }],
    '4xl': ['36px', { lineHeight: '40px' }],
    '5xl': ['48px', { lineHeight: '1' }],
    '6xl': ['60px', { lineHeight: '1' }],
  },
  fontWeight: {
    thin: '100',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
}

// Utility classes for modern UI
export const utils = {
  // Glass morphism effect
  glass: 'bg-white/80 backdrop-blur-xl border border-white/20',
  glassDark: 'bg-black/80 backdrop-blur-xl border border-white/10',
  
  // Modern card styles
  card: 'bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-xl',
  cardHover: 'bg-white/95 backdrop-blur-sm border border-gray-200/70 rounded-2xl shadow-2xl transform transition-all duration-300 hover:scale-105',
  
  // Button styles
  button: 'px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 active:scale-95',
  buttonPrimary: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95',
  buttonSecondary: 'bg-gray-100 text-gray-900 px-6 py-3 rounded-xl font-medium border border-gray-200 transition-all duration-300 hover:bg-gray-200 hover:shadow-md transform hover:scale-105 active:scale-95',
  
  // Input styles
  input: 'w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/90 backdrop-blur-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300',
  
  // Modern container styles
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  section: 'py-12 lg:py-16',
}

// CSS custom properties for modern effects
export const cssVars = {
  '--primary': colors.primary[500],
  '--primary-dark': colors.primary[700],
  '--secondary': colors.secondary[500],
  '--accent': colors.accent[500],
  '--success': colors.success[500],
  '--warning': colors.warning[500],
  '--error': colors.error[500],
  '--gradient-primary': gradients.primary,
  '--gradient-accent': gradients.accent,
  '--shadow-glow': shadows.glow,
  '--radius': borderRadius.xl,
}
