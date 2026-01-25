// import type { Config } from 'tailwindcss'

// const config: Config = {
//   darkMode: 'class',
//   content: [
//     './pages/**/*.{ts,tsx}',
//     './components/**/*.{ts,tsx}',
//     './app/**/*.{ts,tsx}',
//     './src/**/*.{ts,tsx}',
//     './node_modules/@tremor/**/*.{js,ts,jsx,tsx}',
//   ],
// }

// export default config

import { type Config } from 'tailwindcss'
import { withUt } from 'uploadthing/tw'
import colors from 'tailwindcss/colors'

const config: Config = withUt({
  darkMode: 'class',
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './node_modules/@tremor/**/*.{js,ts,jsx,tsx}', // Tremor module
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        tremor: {
          brand: {
            faint: colors.blue[50],
            muted: colors.blue[200],
            subtle: colors.blue[400],
            DEFAULT: colors.blue[500],
            emphasis: colors.blue[700],
            inverted: colors.white,
          },
          header: {
            DEFAULT: colors.neutral[900],
            gradient: 'linear-gradient(90deg, var(--blue-900), var(--blue-500))',
          },
          background: {
            muted: colors.gray[50],
            subtle: colors.gray[100],
            DEFAULT: colors.white,
            emphasis: colors.gray[700],
          },
          border: {
            DEFAULT: colors.gray[200],
          },
          ring: {
            DEFAULT: colors.gray[200],
          },
          content: {
            subtle: colors.gray[400],
            DEFAULT: colors.gray[500],
            emphasis: colors.gray[700],
            strong: colors.gray[900],
            inverted: colors.white,
          },
        },
        'dark-tremor': {
          brand: {
            faint: '#0B1229',
            muted: colors.blue[950],
            subtle: colors.blue[800],
            DEFAULT: colors.blue[500],
            emphasis: colors.blue[400],
            inverted: colors.blue[950],
          },
          header: {
            DEFAULT: colors.neutral[200],
            gradient: 'linear-gradient(90deg, var(--blue-200), var(--blue-600))',
          },
          background: {
            muted: '#131A2B',
            subtle: colors.gray[800],
            DEFAULT: colors.gray[900],
            emphasis: colors.gray[300],
          },
          border: {
            DEFAULT: colors.gray[700],
          },
          ring: {
            DEFAULT: colors.gray[800],
          },
          content: {
            subtle: colors.gray[600],
            DEFAULT: colors.gray[500],
            emphasis: colors.gray[200],
            strong: colors.gray[50],
            inverted: colors.gray[950],
          },
      },
      boxShadow: {
        // Tremor shadows
        'tremor-input': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'tremor-card':
          '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'tremor-dropdown':
          '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'dark-tremor-input': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'dark-tremor-card':
          '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'dark-tremor-dropdown':
          '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          
        // Linear Design System shadows
        'linear-tiny': 'var(--shadow-tiny)',
        'linear-sm': 'var(--shadow-sm)',
        'linear-md': 'var(--shadow-md)',
        'linear-lg': 'var(--shadow-lg)',
        'linear-xl': 'var(--shadow-xl)',
      },
        borderRadius: {
          'tremor-small': '0.375rem',
          'tremor-default': '0.5rem',
          'tremor-full': '9999px',
        },
        /* Shadcn/UI tokens - maintain compatibility */
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        header: {
          DEFAULT: 'hsl(var(--header))',
          gradient: 'hsl(var(--header-gradient))',
        },
        subheader: {
          DEFAULT: 'hsl(var(--subheader))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        
        /* Linear Design System - Clean semantic tokens */
        // These map to Linear's internal token structure but expose clean utilities
        // Usage: bg-surface-primary, text-content-primary, border-line-primary
        
        // Surface/Background colors (use with bg-, not standalone)
        surface: {
          header: {
            DEFAULT: 'hsl(var(--color-header))',
            gradient: 'hsl(var(--color-header-gradient))',
          },
          primary: 'var(--color-bg-primary)',
          secondary: 'var(--color-bg-secondary)',
          tertiary: 'var(--color-bg-tertiary)',
          quaternary: 'var(--color-bg-quaternary)',
          quinary: 'var(--color-bg-quinary)',
          translucent: 'var(--color-bg-translucent)',
          tint: 'var(--color-bg-tint)',
          0: 'var(--color-bg-level-0)',
          1: 'var(--color-bg-level-1)',
          2: 'var(--color-bg-level-2)',
          3: 'var(--color-bg-level-3)',
        },
        
        // Text/Content colors (use with text-, not standalone)
        content: {
          header: 'var(--color-text-header)',
          subheader: 'var(--color-text-subheader)',
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          tertiary: 'var(--color-text-tertiary)',
          quaternary: 'var(--color-text-quaternary)',
        },
        
        // Line/Border colors (use with border-, not standalone)  
        line: {
          primary: 'var(--color-line-primary)',
          secondary: 'var(--color-line-secondary)',
          tertiary: 'var(--color-line-tertiary)',
          quaternary: 'var(--color-line-quaternary)',
          tint: 'var(--color-line-tint)',
        },
        
        // Border colors (explicit border tokens)
        'border-primary': 'var(--color-border-primary)',
        'border-secondary': 'var(--color-border-secondary)',
        'border-tertiary': 'var(--color-border-tertiary)',
        'border-translucent': 'var(--color-border-translucent)',
        
        // Brand/Accent colors
        brand: {
          DEFAULT: 'var(--color-accent)',
          hover: 'var(--color-accent-hover)',
          tint: 'var(--color-accent-tint)',
          bg: 'var(--color-brand-bg)',
          'bg-hover': 'var(--color-brand-bg-hover)',
          'bg-active': 'var(--color-brand-bg-active)',
          text: 'var(--color-brand-text)',
          border: 'var(--color-brand-border)',
          'border-hover': 'var(--color-brand-border-hover)',
        },
        
        // Link colors
        link: {
          DEFAULT: 'var(--color-link-primary)',
          hover: 'var(--color-link-hover)',
        },
        
        // Status colors (using Shadcn naming)
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning-text))',
          foreground: 'hsl(var(--warning-text))',
          background: 'hsl(var(--warning-bg))',
          'background-hover': 'hsl(var(--warning-bg-hover))',
          border: 'hsl(var(--warning-border))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'automation-zoom-in': {
          '0%': { transform: 'translateY(-30px) scale(0.2)' },
          '100%': { transform: 'transform: translateY(0px) scale(1)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'automation-zoom-in': 'automation-zoom-in 0.5s',
      },
      backgroundImage: {
        // Header gradients
        'header-gradient': 'var(--gradient-header)',
        
        // Brand gradients
        'brand-gradient': 'var(--brand-gradient)',
        'brand-gradient-hover': 'var(--brand-gradient-hover)',
        'brand-gradient-active': 'var(--brand-gradient-active)',
        'brand-gradient-border': 'var(--brand-gradient-border)',
        
        // Background gradients
        'primary-gradient': 'var(--bg-primary-gradient)',
        'secondary-gradient': 'var(--bg-secondary-gradient)',
        'tertiary-gradient': 'var(--bg-tertiary-gradient)',
        
        // Button gradients
        'button-primary-gradient': 'var(--button-primary-bg-gradient)',
        'button-primary-gradient-hover': 'var(--button-primary-bg-gradient-hover)',
        'button-secondary-gradient': 'var(--button-secondary-bg-gradient)',
        'button-secondary-gradient-hover': 'var(--button-secondary-bg-gradient-hover)',
        
        // Mask gradients for fade effects
        'mask-bottom': 'var(--mask-bottom)',
        'mask-top': 'var(--mask-top)',
        'mask-left': 'var(--mask-left)',
        'mask-right': 'var(--mask-right)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
})

export default config