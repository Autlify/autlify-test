import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FaEye, FaKeyboard, FaTextWidth, FaAlignRight, FaSpeakerDeck, FaCrosshairs, FaCheckCircle, FaBolt } from 'react-icons/fa'
import { toast } from 'sonner'

interface AccessibilityFormProps {
  preferences: AccessibilityPreferences
  onChange: (preferences: AccessibilityPreferences) => void
}

export interface AccessibilityPreferences {
  reduceMotion: boolean
  highContrast: boolean
  largeText: boolean
  keyboardNavigation: boolean
  screenReaderOptimized: boolean
  focusIndicators: boolean
}

const defaultPreferences: AccessibilityPreferences = {
  reduceMotion: false,
  highContrast: false,
  largeText: false,
  keyboardNavigation: true,
  screenReaderOptimized: false,
  focusIndicators: true,
}

const preferenceLabels: Record<keyof AccessibilityPreferences, string> = {
  reduceMotion: 'Reduce Motion',
  highContrast: 'High Contrast Mode',
  largeText: 'Large Text',
  keyboardNavigation: 'Enhanced Keyboard Navigation',
  screenReaderOptimized: 'Screen Reader Optimization',
  focusIndicators: 'Enhanced Focus Indicators',
}

export function AccessibilityForm({ preferences, onChange }: AccessibilityFormProps) {
  const currentPreferences = { ...defaultPreferences, ...preferences }

  const handleToggle = (key: keyof AccessibilityPreferences) => {
    const newValue = !currentPreferences[key]
    const newPreferences = {
      ...currentPreferences,
      [key]: newValue,
    }
    onChange(newPreferences)
    
    toast.success(
      `${preferenceLabels[key]} ${newValue ? 'enabled' : 'disabled'}`,
      {
        description: 'Your accessibility preference has been updated and applied.',
      }
    )
  }

  return (
    <div className="space-y-6" role="region" aria-label="Accessibility settings">
      <div>
        <h3 className="text-sm font-medium mb-1">Accessibility Options</h3>
        <p className="text-sm text-muted-foreground">
          Customize your experience for better accessibility
        </p>
      </div>

      <Alert className="border-primary/20 bg-primary/5">
        <FaCheckCircle className="h-4 w-4 text-primary" />
        <AlertDescription className="text-sm">
          Changes are applied immediately and saved to your profile.
        </AlertDescription>
      </Alert>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <FaBolt className="w-5 h-5 text-muted-foreground mt-0.5" aria-hidden="true" />
            <div className="flex-1">
              <Label htmlFor="reduce-motion" className="text-sm font-medium cursor-pointer">
                Reduce Motion
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Minimize animations and transitions throughout the app
              </p>
            </div>
          </div>
          <Switch
            id="reduce-motion"
            checked={currentPreferences.reduceMotion}
            onCheckedChange={() => handleToggle('reduceMotion')}
            aria-label="Toggle reduce motion"
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <FaEye className="w-5 h-5 text-muted-foreground mt-0.5" aria-hidden="true" />
            <div className="flex-1">
              <Label htmlFor="high-contrast" className="text-sm font-medium cursor-pointer">
                High Contrast Mode
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Increase contrast between text and background for better visibility
              </p>
            </div>
          </div>
          <Switch
            id="high-contrast"
            checked={currentPreferences.highContrast}
            onCheckedChange={() => handleToggle('highContrast')}
            aria-label="Toggle high contrast mode"
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <FaTextWidth className="w-5 h-5 text-muted-foreground mt-0.5" aria-hidden="true" />
            <div className="flex-1">
              <Label htmlFor="large-text" className="text-sm font-medium cursor-pointer">
                Large Text
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Increase base font size across the entire application
              </p>
            </div>
          </div>
          <Switch
            id="large-text"
            checked={currentPreferences.largeText}
            onCheckedChange={() => handleToggle('largeText')}
            aria-label="Toggle large text"
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <FaKeyboard className="w-5 h-5 text-muted-foreground mt-0.5" aria-hidden="true" />
            <div className="flex-1">
              <Label htmlFor="keyboard-nav" className="text-sm font-medium cursor-pointer">
                Enhanced Keyboard Navigation
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Optimize interface for keyboard-only navigation with enhanced focus
              </p>
            </div>
          </div>
          <Switch
            id="keyboard-nav"
            checked={currentPreferences.keyboardNavigation}
            onCheckedChange={() => handleToggle('keyboardNavigation')}
            aria-label="Toggle enhanced keyboard navigation"
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <FaSpeakerDeck className="w-5 h-5 text-muted-foreground mt-0.5" aria-hidden="true" />
            <div className="flex-1">
              <Label htmlFor="screen-reader" className="text-sm font-medium cursor-pointer">
                Screen Reader Optimization
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Enhanced ARIA labels and descriptions for screen readers
              </p>
            </div>
          </div>
          <Switch
            id="screen-reader"
            checked={currentPreferences.screenReaderOptimized}
            onCheckedChange={() => handleToggle('screenReaderOptimized')}
            aria-label="Toggle screen reader optimization"
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <FaCrosshairs className="w-5 h-5 text-muted-foreground mt-0.5" aria-hidden="true" />
            <div className="flex-1">
              <Label htmlFor="focus-indicators" className="text-sm font-medium cursor-pointer">
                Enhanced Focus Indicators
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Stronger visual focus indicators for better keyboard navigation
              </p>
            </div>
          </div>
          <Switch
            id="focus-indicators"
            checked={currentPreferences.focusIndicators}
            onCheckedChange={() => handleToggle('focusIndicators')}
            aria-label="Toggle enhanced focus indicators"
          />
        </div>
      </div>
    </div>
  )
}