'use client'

import React, { useEffect, useState } from 'react'
import { Copy, CheckCircle2 } from 'lucide-react'

type TokenValue = {
  raw: string
  computed: string
  type: 'color' | 'gradient' | 'mask'
}

// Helper to detect current theme from DOM
function getCurrentTheme(): string {
  if (typeof document === 'undefined') return 'unknown'

  const html = document.documentElement
  if (html.classList.contains('premium')) return 'premium'
  if (html.classList.contains('light')) return 'light'
  if (html.classList.contains('dark')) return 'dark'

  return 'default'
}

// Helper to get CSS variable value and convert to HEX
function getCSSVariableValue(varName: string): TokenValue {
  if (typeof window === 'undefined') {
    return { raw: '', computed: '', type: 'color' }
  }

  const root = document.documentElement
  const style = getComputedStyle(root)

  // Get raw HSL value (e.g., "210 11% 4%")
  const rawValue = style.getPropertyValue(varName).trim()

  // Map to computed color variables for actual RGB values
  // e.g., --bg-primary -> --color-bg-primary
  let computedVarName = varName
  if (varName.startsWith('--bg-')) {
    computedVarName = varName.replace('--bg-', '--color-bg-')
  } else if (varName.startsWith('--fg-')) {
    computedVarName = varName.replace('--fg-', '--color-text-')
  } else if (varName.startsWith('--line-')) {
    computedVarName = varName.replace('--line-', '--color-line-')
  } else if (varName.startsWith('--border-')) {
    computedVarName = varName.replace('--border-', '--color-border-')
  } else if (varName.startsWith('--brand-gradient') || varName.startsWith('--background-gradient') || varName.startsWith('--button-')) {
    // These are already computed gradients
    computedVarName = varName
  } else if (varName.startsWith('--mask-gradient')) {
    computedVarName = varName
  }

  // Get the computed RGB/gradient value
  const computedRGB = style.getPropertyValue(computedVarName).trim() || rawValue

  // Check if it's a gradient
  if (computedRGB.includes('linear-gradient') || computedRGB.includes('radial-gradient')) {
    return { raw: rawValue, computed: computedRGB, type: 'gradient' }
  }

  // Check if it's a mask
  if (varName.includes('mask')) {
    return { raw: rawValue, computed: computedRGB, type: 'mask' }
  }

  // Convert RGB to HEX
  let hexValue = rgbToHex(computedRGB)

  // Handle HSL with alpha: "210 11% 4% / 0.5" or "0 0% 100% / .05"
  if (!hexValue && rawValue.includes('/')) {
    const [hslPart, alphaPart] = rawValue.split('/')
    const alphaStr = alphaPart.trim()
    let alpha = 1
    
    // Parse alpha value - could be .05, 0.05, 5%, etc.
    if (alphaStr.endsWith('%')) {
      alpha = parseFloat(alphaStr.replace('%', '')) / 100
    } else if (alphaStr.startsWith('.')) {
      alpha = parseFloat('0' + alphaStr)
    } else {
      alpha = parseFloat(alphaStr)
    }

    if (hslPart && /^[\d.]+\s+[\d.]+%\s+[\d.]+%/.test(hslPart.trim())) {
      const parts = hslPart.trim().split(/\s+/)
      const h = parseFloat(parts[0] || '0')
      const s = parseFloat(parts[1]?.replace('%', '') || '0') / 100
      const l = parseFloat(parts[2]?.replace('%', '') || '0') / 100
      hexValue = hslToHex(h, s, l, alpha)
    }
  }
  // If no RGB value, try converting from raw HSL without alpha
  else if (!hexValue && /^[\d.]+\s+[\d.]+%\s+[\d.]+%/.test(rawValue)) {
    const parts = rawValue.split(/\s+/)
    const h = parseFloat(parts[0] || '0')
    const s = parseFloat(parts[1]?.replace('%', '') || '0') / 100
    const l = parseFloat(parts[2]?.replace('%', '') || '0') / 100
    hexValue = hslToHex(h, s, l, undefined)
  }

  return { raw: rawValue, computed: hexValue || computedRGB || rawValue, type: 'color' }
}

// Mock Data for Testing hslToHex function
const mockHSLData = [
  { hsl: `hsl(180 11% 97.1%)` },
  { h: 0, s: 100, l: 50 },    // Pure red
  { h: 120, s: 100, l: 50 },  // Pure green
  { h: 240, s: 100, l: 50 },  // Pure blue
  { h: 60, s: 100, l: 50 },   // Pure yellow
  { h: 300, s: 100, l: 50 },  // Pure magenta
  { h: 180, s: 100, l: 50 },  // Pure cyan
  { h: 0, s: 0, l: 0 },       // Black
  { h: 0, s: 0, l: 100 },     // White
  { h: 0, s: 0, l: 50 },      // Gray
  { h: 200, s: 50, l: 50 }    // Muted blue
];



// ===== End of Test Cases =====





// RGB/RGBA to HEX converter (8-digit format with alpha)
function rgbToHex(rgb: string): string | null {
  // Match rgb(r, g, b) or rgba(r, g, b, a)
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
  if (!match) return null

  const r = parseInt(match[1] || '0')
  const g = parseInt(match[2] || '0')
  const b = parseInt(match[3] || '0')
  const a = match[4] ? parseFloat(match[4]) : 1

  const hexR = r.toString(16).padStart(2, '0')
  const hexG = g.toString(16).padStart(2, '0')
  const hexB = b.toString(16).padStart(2, '0')
  
  // Convert alpha to 2-digit hex (0-255)
  if (a < 1) {
    const hexA = Math.round(a * 255).toString(16).padStart(2, '0')
    return `#${hexR}${hexG}${hexB}${hexA}`.toUpperCase()
  }
  
  return `#${hexR}${hexG}${hexB}`.toUpperCase()
}

// HSL to HEX converter
function hslToHex(h: number, s: number, l: number, a: number | undefined): string {
  // Normalize alpha value
  let aValue = 1
  if (typeof a === 'number') {
    aValue = a
  }
  
  // Format alpha for readability
  let alphaDisplay = ''
  if (aValue < 1) {
    const asPercent = aValue * 100
    // If it's less than 1%, show as decimal (e.g., 0.05)
    // Otherwise show as percentage (e.g., 50%)
    if (asPercent < 1) {
      alphaDisplay = ` / ${aValue.toFixed(2)}`
    } else {
      alphaDisplay = ` / ${asPercent.toFixed(0)}%`
    }
  }

  // Convert HSL to RGB
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  
  let r = 0, g = 0, b = 0
  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c
  } else if (h >= 300 && h < 360) {
    r = c; g = 0; b = x
  }
  
  const rHex = Math.round((r + m) * 255).toString(16).padStart(2, '0')
  const gHex = Math.round((g + m) * 255).toString(16).padStart(2, '0')
  const bHex = Math.round((b + m) * 255).toString(16).padStart(2, '0')
  
  return `#${rHex}${gHex}${bHex}`.toUpperCase() + alphaDisplay
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="p-1 rounded hover:bg-surface-tertiary transition-colors"
      title="Copy value"
    >
      {copied ? (
        <CheckCircle2 className="w-3 h-3 text-success" />
      ) : (
        <Copy className="w-3 h-3 text-content-tertiary" />
      )}
    </button>
  )
}

export function ColorTokens() {
  const [theme, setTheme] = useState<string>('unknown')
  const [tokenValues, setTokenValues] = useState<Map<string, TokenValue>>(new Map())

  // Define token groups based on actual globals.css structure
  const colorGroups = [
    {
      name: 'Background Colors',
      tokens: [
        { var: '--bg-primary', desc: 'Main background' },
        { var: '--bg-secondary', desc: 'Secondary background (elevated)' },
        { var: '--bg-tertiary', desc: 'Tertiary background (more elevated)' },
        { var: '--bg-quaternary', desc: 'Quaternary background (highest)' },
        { var: '--bg-quinary', desc: 'Accent background' },
        { var: '--bg-translucent', desc: 'Translucent overlay' },
      ],
    },
    {
      name: 'Foreground Colors',
      tokens: [
        { var: '--fg-primary', desc: 'Primary text' },
        { var: '--fg-secondary', desc: 'Secondary text' },
        { var: '--fg-tertiary', desc: 'Tertiary text' },
        { var: '--fg-quaternary', desc: 'Disabled/placeholder text' },
      ],
    },
    {
      name: 'Brand Colors',
      tokens: [
        { var: '--brand-bg', desc: 'Brand base' },
        { var: '--brand-bg-hover', desc: 'Brand hover' },
        { var: '--brand-bg-active', desc: 'Brand active' },
        { var: '--brand-border', desc: 'Brand border' },
        { var: '--brand-text', desc: 'Brand text' },
      ],
    },
    {
      name: 'Border & Lines',
      tokens: [
        { var: '--line-primary', desc: 'Default border' },
        { var: '--line-secondary', desc: 'Subtle border' },
        { var: '--line-tertiary', desc: 'Very subtle border' },
        { var: '--border-primary', desc: 'Primary border' },
        { var: '--border-secondary', desc: 'Secondary border' },
        { var: '--border-tertiary', desc: 'Emphasized border' },
      ],
    },
    {
      name: 'Semantic Colors',
      tokens: [
        { var: '--destructive', desc: 'Danger/Error' },
        { var: '--warning-text', desc: 'Warning' },
        { var: '--warning-bg', desc: 'Warning background' },
        { var: '--link-primary', desc: 'Link color' },
        { var: '--link-hover', desc: 'Link hover' },
      ],
    },
  ]

  const gradients = [
    {
      name: 'Background Gradients',
      items: [
        { var: '--bg-primary-gradient', desc: 'Primary background gradient' },
        { var: '--bg-secondary-gradient', desc: 'Secondary background gradient' },
        { var: '--bg-tertiary-gradient', desc: 'Tertiary background gradient' },
      ],
    },
    {
      name: 'Button Gradients',
      items: [
        { var: '--button-primary-bg-gradient', desc: 'Primary button gradient' },
        { var: '--button-primary-bg-gradient-hover', desc: 'Primary button hover' },
        { var: '--button-secondary-bg-gradient', desc: 'Secondary button gradient' },
      ],
    },
    {
      name: 'Brand Gradients',
      items: [
        { var: '--brand-gradient', desc: 'Brand gradient' },
        { var: '--brand-gradient-hover', desc: 'Brand gradient hover' },
        { var: '--brand-gradient-border', desc: 'Brand gradient border' },
      ],
    },
  ]

  const masks = [
    {
      name: 'Mask Gradients',
      items: [
        { var: '--mask-bottom', desc: 'Bottom fade mask' },
        { var: '--mask-top', desc: 'Top fade mask' },
        { var: '--mask-left', desc: 'Left fade mask' },
        { var: '--mask-right', desc: 'Right fade mask' },
      ],
    },
  ]

  // Update theme and token values on mount and when theme changes
  useEffect(() => {
    const updateValues = () => {
      setTheme(getCurrentTheme())

      // Collect all token variable names
      const allVars = [
        ...colorGroups.flatMap(g => g.tokens.map(t => t.var)),
        ...gradients.flatMap(g => g.items.map(i => i.var)),
        ...masks.flatMap(g => g.items.map(i => i.var)),
      ]

      const values = new Map<string, TokenValue>()
      allVars.forEach(varName => {
        values.set(varName, getCSSVariableValue(varName))
      })

      setTokenValues(values)
    }

    updateValues()

    // Watch for theme changes
    const observer = new MutationObserver(updateValues)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => observer.disconnect()
  }, [])

  return (
    <section className="space-y-12 relative">
      {/* Sticky Theme Banner */}
      <div className="sticky top-16 pb-4 z-50 -mx-4 px-4 py-3 bg-surface-primary/95 backdrop-blur-lg border-b border-line-primary shadow-linear-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${theme === 'premium' ? 'bg-brand animate-pulse' :
                theme === 'light' ? 'bg-warning-text' :
                  'bg-content-tertiary'
                }`} />
              <span className="text-sm font-mono text-content-primary">
                Current Theme:
              </span>
            </div>
            <code className="px-3 py-1 bg-surface-secondary border border-line-secondary rounded-md text-sm font-semibold text-content-primary">
              .{theme}
            </code>
          </div>
          <p className="text-xs text-content-tertiary hidden sm:block">
            Values update dynamically when theme changes
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-content-primary">Color Tokens</h2>
        <p className="text-content-secondary">
          Semantic color tokens that adapt to light/premium mode automatically.
        </p>
        <p className="text-xs text-content-tertiary mt-2">
          All values are computed in real-time from CSS variables. Premium mode uses Linear-inspired dark styling.
        </p>
      </div>

      {/* Color Swatches with Dynamic Values */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {colorGroups.map((group) => (
          <div key={group.name} className="space-y-3">
            <h3 className="text-sm font-semibold text-content-primary uppercase tracking-wide">
              {group.name}
            </h3>
            <div className="space-y-2">
              {group.tokens.map((token) => {
                const value = tokenValues.get(token.var)
                const bgStyle = value?.raw.includes('/')
                  ? { backgroundColor: `hsl(${value.raw})` }
                  : { backgroundColor: value?.computed || `var(${token.var})` }

                return (
                  <div
                    key={token.var}
                    className="flex items-center gap-3 p-3 rounded-lg border border-line-primary bg-surface-secondary hover:bg-surface-tertiary transition-colors group"
                  >
                    <div
                      className="w-12 h-12 rounded border border-line-secondary shrink-0"
                      style={bgStyle}
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-1">
                        <code className="text-xs font-mono text-content-primary block truncate">
                          {token.var}
                        </code>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <CopyButton text={value?.computed || token.var} />
                        </div>
                      </div>
                      <span className="text-xs text-content-tertiary block">{token.desc}</span>
                      {value?.computed && (
                        <code className="text-[10px] font-mono text-brand block truncate">
                          {value.computed}
                        </code>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Gradients Section */}
      <div className="space-y-6 pt-8 border-t border-line-primary">
        <div>
          <h2 className="text-2xl font-bold text-content-primary mb-2">Gradient Tokens</h2>
          <p className="text-content-secondary text-sm">
            CSS custom property gradients for consistent visual effects. Values shown are the actual computed gradients.
          </p>
        </div>

        {gradients.map((group) => (
          <div key={group.name} className="space-y-3">
            <h3 className="text-sm font-semibold text-content-secondary uppercase tracking-wide">
              {group.name}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.items.map((item) => {
                const value = tokenValues.get(item.var)

                return (
                  <div
                    key={item.var}
                    className="border border-line-primary rounded-lg overflow-hidden bg-surface-secondary hover:shadow-linear-md transition-shadow group"
                  >
                    <div
                      className="h-24"
                      style={{ background: value?.computed || `var(${item.var})` }}
                    />
                    <div className="p-3 space-y-1">
                      <div className="flex items-center gap-1">
                        <code className="text-xs font-mono text-content-primary block truncate">
                          {item.var}
                        </code>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
                          <CopyButton text={value?.computed || item.var} />
                        </div>
                      </div>
                      <p className="text-xs text-content-tertiary">{item.desc}</p>
                      {value?.computed && (
                        <code className="text-[9px] font-mono text-brand block break-all mt-2 p-2 bg-surface-tertiary rounded border border-line-secondary max-h-20 overflow-y-auto">
                          {value.computed}
                        </code>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Masks Section */}
      <div className="space-y-6 pt-8 border-t border-line-primary">
        <div>
          <h2 className="text-2xl font-bold text-content-primary mb-2">Mask Tokens</h2>
          <p className="text-content-secondary text-sm">
            CSS mask-image gradients for fade effects and visual transitions.
          </p>
        </div>

        {masks.map((group) => (
          <div key={group.name} className="space-y-3">
            <h3 className="text-sm font-semibold text-content-secondary uppercase tracking-wide">
              {group.name}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {group.items.map((item) => {
                const value = tokenValues.get(item.var)

                return (
                  <div
                    key={item.var}
                    className="border border-line-primary rounded-lg overflow-hidden bg-surface-secondary group"
                  >
                    <div className="relative h-32 bg-brand-gradient">
                      <div
                        className="absolute inset-0 bg-content-primary"
                        style={{
                          maskImage: value?.computed || `var(${item.var})`,
                          WebkitMaskImage: value?.computed || `var(${item.var})`
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-medium text-white px-3 py-1.5 bg-black/20 rounded-full backdrop-blur-sm border border-white/20">
                          Mask Applied
                        </span>
                      </div>
                    </div>
                    <div className="p-3 space-y-1">
                      <div className="flex items-center gap-1">
                        <code className="text-xs font-mono text-content-primary block truncate">
                          {item.var}
                        </code>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
                          <CopyButton text={value?.computed || item.var} />
                        </div>
                      </div>
                      <p className="text-xs text-content-tertiary">{item.desc}</p>
                      {value?.computed && (
                        <code className="text-[9px] font-mono text-brand block break-all mt-2 p-2 bg-surface-tertiary rounded border border-line-secondary max-h-16 overflow-y-auto">
                          {value.computed}
                        </code>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
