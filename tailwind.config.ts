import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4f46e5',
        'primary-hover': '#4338ca',
        secondary: '#10b981',
        'secondary-hover': '#059669',
        accent: '#8b5cf6',
        'accent-hover': '#7c3aed',
        danger: '#ef4444',
        warning: '#f59e0b',
        success: '#10b981',
        info: '#3b82f6',
        background: '#0f172a',
        foreground: '#f8fafc',
        card: '#1e293b',
        'card-hover': '#334155',
        border: '#334155',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};

export default config;