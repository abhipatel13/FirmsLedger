import tailwindcssAnimate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx,js,jsx}", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
        body:    ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
        mono:    ['var(--font-plex-mono)', '"Courier New"', 'monospace'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        // Brand tokens
        brand: {
          navy:        '#1A2E4A',
          'navy-dark': '#131F30',
          'navy-mid':  '#243B58',
          gold:        '#F5A623',
          'gold-light':'#FDCE6E',
          'gold-dark': '#D48E1A',
        },

        // Remap Tailwind `orange-*` to the logo's gold palette
        orange: {
          50:  '#FFF8EC',
          100: '#FDECC8',
          200: '#FBD993',
          300: '#F9C55F',
          400: '#F7B640',
          500: '#F5A623',
          600: '#D48E1A',
          700: '#A46D14',
          800: '#7A5210',
          900: '#523607',
        },

        // shadcn/ui semantic tokens (CSS-var driven)
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT:    'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input:  'hsl(var(--input))',
        ring:   'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT:              'hsl(var(--sidebar-background))',
          foreground:           'hsl(var(--sidebar-foreground))',
          primary:              'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent:               'hsl(var(--sidebar-accent))',
          'accent-foreground':  'hsl(var(--sidebar-accent-foreground))',
          border:               'hsl(var(--sidebar-border))',
          ring:                 'hsl(var(--sidebar-ring))',
        },
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
