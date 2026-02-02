'use client'

import React, { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Palette,
  Sun,
  Moon,
  Monitor,
  Paintbrush,
  Sparkles,
  Download,
  Upload,
  Copy,
  Check,
  RotateCcw,
  Lock,
  Eye,
  EyeOff,
  Pipette,
  Layers,
  Type,
  Square,
  Circle,
  Hexagon,
  Save,
  Trash2,
} from 'lucide-react'

// ============================================================================
// Types
// ============================================================================

interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  background: string
  foreground: string
  muted: string
  border: string
  card: string
  destructive: string
  success: string
  warning: string
}

interface ThemeFont {
  family: string
  scale: number
  weight: 'normal' | 'medium' | 'semibold'
}

interface ThemeRadius {
  base: number
  variant: 'none' | 'sm' | 'md' | 'lg' | 'full'
}

interface ThemeShadow {
  enabled: boolean
  intensity: 'none' | 'subtle' | 'medium' | 'strong'
}

interface CustomTheme {
  id: string
  name: string
  description?: string
  mode: 'light' | 'dark' | 'system'
  colors: {
    light: ThemeColors
    dark: ThemeColors
  }
  font: ThemeFont
  radius: ThemeRadius
  shadow: ThemeShadow
  createdAt: string
  updatedAt: string
}

// ============================================================================
// Default Theme
// ============================================================================

const DEFAULT_LIGHT_COLORS: ThemeColors = {
  primary: '#3b82f6',
  secondary: '#6366f1',
  accent: '#8b5cf6',
  background: '#ffffff',
  foreground: '#0f172a',
  muted: '#f1f5f9',
  border: '#e2e8f0',
  card: '#ffffff',
  destructive: '#ef4444',
  success: '#22c55e',
  warning: '#f59e0b',
}

const DEFAULT_DARK_COLORS: ThemeColors = {
  primary: '#3b82f6',
  secondary: '#6366f1',
  accent: '#8b5cf6',
  background: '#0f172a',
  foreground: '#f8fafc',
  muted: '#1e293b',
  border: '#334155',
  card: '#1e293b',
  destructive: '#ef4444',
  success: '#22c55e',
  warning: '#f59e0b',
}

const DEFAULT_THEME: CustomTheme = {
  id: 'default',
  name: 'Default',
  mode: 'system',
  colors: {
    light: DEFAULT_LIGHT_COLORS,
    dark: DEFAULT_DARK_COLORS,
  },
  font: {
    family: 'Inter',
    scale: 1,
    weight: 'normal',
  },
  radius: {
    base: 8,
    variant: 'md',
  },
  shadow: {
    enabled: true,
    intensity: 'medium',
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

// ============================================================================
// Preset Themes
// ============================================================================

const PRESET_THEMES: Omit<CustomTheme, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Ocean Blue',
    description: 'Deep blue tones inspired by the ocean',
    mode: 'system',
    colors: {
      light: { ...DEFAULT_LIGHT_COLORS, primary: '#0ea5e9', accent: '#06b6d4' },
      dark: { ...DEFAULT_DARK_COLORS, primary: '#0ea5e9', accent: '#06b6d4' },
    },
    font: DEFAULT_THEME.font,
    radius: DEFAULT_THEME.radius,
    shadow: DEFAULT_THEME.shadow,
  },
  {
    name: 'Forest Green',
    description: 'Natural green palette',
    mode: 'system',
    colors: {
      light: { ...DEFAULT_LIGHT_COLORS, primary: '#22c55e', accent: '#10b981' },
      dark: { ...DEFAULT_DARK_COLORS, primary: '#22c55e', accent: '#10b981' },
    },
    font: DEFAULT_THEME.font,
    radius: DEFAULT_THEME.radius,
    shadow: DEFAULT_THEME.shadow,
  },
  {
    name: 'Sunset Orange',
    description: 'Warm orange and amber tones',
    mode: 'system',
    colors: {
      light: { ...DEFAULT_LIGHT_COLORS, primary: '#f97316', accent: '#f59e0b' },
      dark: { ...DEFAULT_DARK_COLORS, primary: '#f97316', accent: '#f59e0b' },
    },
    font: DEFAULT_THEME.font,
    radius: DEFAULT_THEME.radius,
    shadow: DEFAULT_THEME.shadow,
  },
  {
    name: 'Rose Pink',
    description: 'Soft pink and rose colors',
    mode: 'system',
    colors: {
      light: { ...DEFAULT_LIGHT_COLORS, primary: '#ec4899', accent: '#f43f5e' },
      dark: { ...DEFAULT_DARK_COLORS, primary: '#ec4899', accent: '#f43f5e' },
    },
    font: DEFAULT_THEME.font,
    radius: DEFAULT_THEME.radius,
    shadow: DEFAULT_THEME.shadow,
  },
  {
    name: 'Minimal Mono',
    description: 'Clean monochromatic design',
    mode: 'system',
    colors: {
      light: { ...DEFAULT_LIGHT_COLORS, primary: '#18181b', accent: '#3f3f46' },
      dark: { ...DEFAULT_DARK_COLORS, primary: '#fafafa', accent: '#a1a1aa' },
    },
    font: DEFAULT_THEME.font,
    radius: { base: 4, variant: 'sm' },
    shadow: { enabled: false, intensity: 'none' },
  },
]

// ============================================================================
// Color Picker
// ============================================================================

interface ColorPickerProps {
  label: string
  value: string
  onChange: (value: string) => void
  presets?: string[]
}

function ColorPicker({ label, value, onChange, presets }: ColorPickerProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <Label className="text-sm">{label}</Label>
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="flex h-8 w-8 items-center justify-center rounded-md border shadow-sm"
              style={{ backgroundColor: value }}
              aria-label={`Pick ${label} color`}
            >
              <span className="sr-only">Pick color</span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="end">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  className="h-8 w-8 cursor-pointer rounded border"
                />
                <Input
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  className="h-8 flex-1 text-xs font-mono"
                  placeholder="#000000"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleCopy}
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
              {presets && presets.length > 0 && (
                <div className="grid grid-cols-8 gap-1">
                  {presets.map((color) => (
                    <button
                      key={color}
                      className={cn(
                        'h-5 w-5 rounded-sm border shadow-sm transition-transform hover:scale-110',
                        value === color && 'ring-2 ring-primary ring-offset-2',
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => onChange(color)}
                      aria-label={`Select ${color}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
        <span className="font-mono text-xs text-muted-foreground w-16">{value}</span>
      </div>
    </div>
  )
}

// ============================================================================
// Theme Preview
// ============================================================================

interface ThemePreviewProps {
  theme: CustomTheme
  mode: 'light' | 'dark'
  className?: string
}

function ThemePreview({ theme, mode, className }: ThemePreviewProps) {
  const colors = mode === 'dark' ? theme.colors.dark : theme.colors.light

  return (
    <div
      className={cn('rounded-lg border p-3 text-xs', className)}
      style={{
        backgroundColor: colors.background,
        borderColor: colors.border,
        color: colors.foreground,
      }}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-medium">Preview</span>
          <Badge style={{ backgroundColor: colors.primary, color: '#fff' }}>
            Badge
          </Badge>
        </div>
        <div
          className="rounded p-2"
          style={{ backgroundColor: colors.muted }}
        >
          <p className="text-[10px]" style={{ color: colors.foreground }}>
            Card content preview
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="rounded px-2 py-1 text-[10px] font-medium"
            style={{ backgroundColor: colors.primary, color: '#fff' }}
          >
            Primary
          </button>
          <button
            className="rounded px-2 py-1 text-[10px] font-medium"
            style={{ backgroundColor: colors.secondary, color: '#fff' }}
          >
            Secondary
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Custom Theme Panel Component
// ============================================================================

interface CustomThemePanelProps {
  className?: string
  /** Is premium user */
  isPremium?: boolean
  /** Current theme */
  theme?: CustomTheme
  /** Callback when theme changes */
  onChange?: (theme: CustomTheme) => void
  /** Callback when theme is saved */
  onSave?: (theme: CustomTheme) => void
  /** Callback when theme is deleted */
  onDelete?: (themeId: string) => void
}

export function CustomThemePanel({
  className,
  isPremium = false,
  theme: initialTheme,
  onChange,
  onSave,
  onDelete,
}: CustomThemePanelProps) {
  const [theme, setTheme] = useState<CustomTheme>(initialTheme || DEFAULT_THEME)
  const [previewMode, setPreviewMode] = useState<'light' | 'dark'>('dark')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Color presets
  const colorPresets = [
    '#ef4444', '#f97316', '#f59e0b', '#84cc16',
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4',
    '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6',
    '#a855f7', '#d946ef', '#ec4899', '#f43f5e',
  ]

  // Update theme and notify
  const updateTheme = useCallback((updates: Partial<CustomTheme>) => {
    const newTheme = {
      ...theme,
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    setTheme(newTheme)
    onChange?.(newTheme)
  }, [theme, onChange])

  // Update colors for current mode
  const updateColors = useCallback((mode: 'light' | 'dark', updates: Partial<ThemeColors>) => {
    updateTheme({
      colors: {
        ...theme.colors,
        [mode]: { ...theme.colors[mode], ...updates },
      },
    })
  }, [theme.colors, updateTheme])

  // Export theme as JSON
  const exportTheme = () => {
    const blob = new Blob([JSON.stringify(theme, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${theme.name.toLowerCase().replace(/\s+/g, '-')}-theme.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Import theme from JSON
  const importTheme = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string) as CustomTheme
        setTheme({
          ...imported,
          id: `imported-${Date.now()}`,
          updatedAt: new Date().toISOString(),
        })
      } catch {
        alert('Invalid theme file')
      }
    }
    reader.readAsText(file)
  }

  // Apply preset theme
  const applyPreset = (preset: typeof PRESET_THEMES[0]) => {
    updateTheme({
      ...preset,
      id: theme.id,
      createdAt: theme.createdAt,
    })
  }

  // Premium gate
  if (!isPremium) {
    return (
      <Card className={cn('w-full max-w-2xl', className)}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
              <Palette className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                Custom Theme
                <Badge variant="secondary">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              </CardTitle>
              <CardDescription>
                Create your own custom color schemes and styles
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Lock className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">Upgrade to Premium</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
              Custom themes are available on Premium and Enterprise plans. 
              Create unlimited themes with full color customization.
            </p>
            <Button>
              <Sparkles className="h-4 w-4 mr-2" />
              Upgrade Now
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('w-full max-w-2xl', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
              <Palette className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Custom Theme</CardTitle>
              <CardDescription>
                Design your perfect color scheme
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportTheme}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <label>
              <Button variant="outline" size="sm" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </span>
              </Button>
              <input
                type="file"
                accept=".json"
                className="sr-only"
                onChange={(e) => e.target.files?.[0] && importTheme(e.target.files[0])}
              />
            </label>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="colors" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="presets">Presets</TabsTrigger>
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="typography">Typography</TabsTrigger>
            <TabsTrigger value="effects">Effects</TabsTrigger>
          </TabsList>

          {/* Presets Tab */}
          <TabsContent value="presets" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-3">
              {PRESET_THEMES.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => applyPreset(preset)}
                  className={cn(
                    'flex flex-col items-start rounded-lg border p-3 text-left transition-all hover:bg-accent',
                    theme.name === preset.name && 'border-primary bg-primary/5',
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: preset.colors.light.primary }}
                    />
                    <span className="font-medium text-sm">{preset.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{preset.description}</p>
                </button>
              ))}
            </div>
          </TabsContent>

          {/* Colors Tab */}
          <TabsContent value="colors" className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant={previewMode === 'light' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setPreviewMode('light')}
                >
                  <Sun className="h-4 w-4 mr-2" />
                  Light
                </Button>
                <Button
                  variant={previewMode === 'dark' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setPreviewMode('dark')}
                >
                  <Moon className="h-4 w-4 mr-2" />
                  Dark
                </Button>
              </div>
              <ThemePreview theme={theme} mode={previewMode} className="w-48" />
            </div>

            <Separator />

            <div className="space-y-1">
              <h4 className="text-sm font-medium">Brand Colors</h4>
            </div>

            <ColorPicker
              label="Primary"
              value={theme.colors[previewMode].primary}
              onChange={(v) => updateColors(previewMode, { primary: v })}
              presets={colorPresets}
            />
            <ColorPicker
              label="Secondary"
              value={theme.colors[previewMode].secondary}
              onChange={(v) => updateColors(previewMode, { secondary: v })}
              presets={colorPresets}
            />
            <ColorPicker
              label="Accent"
              value={theme.colors[previewMode].accent}
              onChange={(v) => updateColors(previewMode, { accent: v })}
              presets={colorPresets}
            />

            <Separator />

            <div className="space-y-1">
              <h4 className="text-sm font-medium">Background & Surface</h4>
            </div>

            <ColorPicker
              label="Background"
              value={theme.colors[previewMode].background}
              onChange={(v) => updateColors(previewMode, { background: v })}
            />
            <ColorPicker
              label="Foreground"
              value={theme.colors[previewMode].foreground}
              onChange={(v) => updateColors(previewMode, { foreground: v })}
            />
            <ColorPicker
              label="Muted"
              value={theme.colors[previewMode].muted}
              onChange={(v) => updateColors(previewMode, { muted: v })}
            />
            <ColorPicker
              label="Border"
              value={theme.colors[previewMode].border}
              onChange={(v) => updateColors(previewMode, { border: v })}
            />

            <Separator />

            <div className="space-y-1">
              <h4 className="text-sm font-medium">Status Colors</h4>
            </div>

            <ColorPicker
              label="Destructive"
              value={theme.colors[previewMode].destructive}
              onChange={(v) => updateColors(previewMode, { destructive: v })}
            />
            <ColorPicker
              label="Success"
              value={theme.colors[previewMode].success}
              onChange={(v) => updateColors(previewMode, { success: v })}
            />
            <ColorPicker
              label="Warning"
              value={theme.colors[previewMode].warning}
              onChange={(v) => updateColors(previewMode, { warning: v })}
            />
          </TabsContent>

          {/* Typography Tab */}
          <TabsContent value="typography" className="space-y-4 pt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Font Family</Label>
                <Select
                  value={theme.font.family}
                  onValueChange={(v) => updateTheme({ font: { ...theme.font, family: v } })}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter">Inter</SelectItem>
                    <SelectItem value="Roboto">Roboto</SelectItem>
                    <SelectItem value="Open Sans">Open Sans</SelectItem>
                    <SelectItem value="Lato">Lato</SelectItem>
                    <SelectItem value="Poppins">Poppins</SelectItem>
                    <SelectItem value="system-ui">System UI</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Font Scale</Label>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(theme.font.scale * 100)}%
                  </span>
                </div>
                <Slider
                  value={[theme.font.scale]}
                  min={0.8}
                  max={1.2}
                  step={0.05}
                  onValueChange={([v]) => updateTheme({ font: { ...theme.font, scale: v } })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Font Weight</Label>
                <Select
                  value={theme.font.weight}
                  onValueChange={(v) => updateTheme({ font: { ...theme.font, weight: v as ThemeFont['weight'] } })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="semibold">Semibold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          {/* Effects Tab */}
          <TabsContent value="effects" className="space-y-4 pt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Border Radius</Label>
                  <p className="text-xs text-muted-foreground">Corner roundness</p>
                </div>
                <Select
                  value={theme.radius.variant}
                  onValueChange={(v) => updateTheme({ radius: { ...theme.radius, variant: v as ThemeRadius['variant'] } })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <div className="flex items-center gap-2">
                        <Square className="h-3 w-3" />
                        None
                      </div>
                    </SelectItem>
                    <SelectItem value="sm">
                      <div className="flex items-center gap-2">
                        <Square className="h-3 w-3 rounded-sm" />
                        Small
                      </div>
                    </SelectItem>
                    <SelectItem value="md">
                      <div className="flex items-center gap-2">
                        <Square className="h-3 w-3 rounded" />
                        Medium
                      </div>
                    </SelectItem>
                    <SelectItem value="lg">
                      <div className="flex items-center gap-2">
                        <Square className="h-3 w-3 rounded-lg" />
                        Large
                      </div>
                    </SelectItem>
                    <SelectItem value="full">
                      <div className="flex items-center gap-2">
                        <Circle className="h-3 w-3" />
                        Full
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Shadows</Label>
                  <p className="text-xs text-muted-foreground">Enable drop shadows</p>
                </div>
                <Switch
                  checked={theme.shadow.enabled}
                  onCheckedChange={(enabled) => updateTheme({ shadow: { ...theme.shadow, enabled } })}
                />
              </div>

              {theme.shadow.enabled && (
                <div className="flex items-center justify-between">
                  <Label>Shadow Intensity</Label>
                  <Select
                    value={theme.shadow.intensity}
                    onValueChange={(v) => updateTheme({ shadow: { ...theme.shadow, intensity: v as ThemeShadow['intensity'] } })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="subtle">Subtle</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="strong">Strong</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setTheme(DEFAULT_THEME)}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          {theme.id !== 'default' && (
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Theme</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete "{theme.name}"? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      onDelete?.(theme.id)
                      setShowDeleteDialog(false)
                    }}
                  >
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
        <Button onClick={() => onSave?.(theme)}>
          <Save className="h-4 w-4 mr-2" />
          Save Theme
        </Button>
      </CardFooter>
    </Card>
  )
}

export default CustomThemePanel
