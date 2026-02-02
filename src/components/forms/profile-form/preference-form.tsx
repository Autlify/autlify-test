import { useState } from 'react'
import { FaBell, FaMoon, FaSun, FaGlobe, FaPalette } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

interface PreferencesFormProps {
    onClose: () => void
}

export function PreferencesForm({ onClose }: PreferencesFormProps) {
    const { theme, setTheme } = useTheme()
    const [language, setLanguage] = useState<string>('en')
    const [timezone, setTimezone] = useState<string>('Asia/Kuala_Lumpur GMT+8')
    const [emailNotifications, setEmailNotifications] = useState<boolean>(true)
    const [pushNotifications, setPushNotifications] = useState<boolean>(true)
    const [marketingEmails, setMarketingEmails] = useState<boolean>(false)
    const handleSave = () => {
        toast.success('Preferences saved successfully')
        onClose()
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-1">Appearance</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Customize how the application looks and feels
                </p>

                <RadioGroup value={theme} onValueChange={(value: 'light' | 'dark') => setTheme(value)}>
                    <div className="space-y-3">
                        <div
                            className={cn(
                                'flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-all',
                                theme === 'light' && 'border-primary bg-primary/5',
                                theme !== 'light' && 'bg-background/50'
                            )}
                            onClick={() => setTheme('light')}
                        >
                            <RadioGroupItem value="light" id="light" />
                            <Label htmlFor="light" className="flex-1 cursor-pointer flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-muted">
                                    <FaSun className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Light Mode</p>
                                    <p className="text-xs text-muted-foreground">Soft neumorphic design with subtle shadows</p>
                                </div>
                            </Label>
                        </div>

                        <div
                            className={cn(
                                'flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-all',
                                theme === 'dark' && 'border-primary bg-primary/5',
                                theme === 'light' && 'bg-card'
                            )}
                            onClick={() => setTheme('dark')}
                        >
                            <RadioGroupItem value="dark" id="dark" />
                            <Label htmlFor="dark" className="flex-1 cursor-pointer flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-muted">
                                    <FaMoon className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Dark Mode</p>
                                    <p className="text-xs text-muted-foreground">Elegant glassmorphic design with transparency</p>
                                </div>
                            </Label>
                        </div>
                    </div>
                </RadioGroup>
            </div>

            <Separator />

            <div>
                <h3 className="text-lg font-semibold mb-1">Localization</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Set your language and timezone preferences
                </p>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="language" className="flex items-center gap-2">
                            <FaGlobe className="h-4 w-4" />
                            Language
                        </Label>
                        <Select value={language} onValueChange={(val) => setLanguage(val)}>
                            <SelectTrigger id="language" className={cn(
                                theme === 'light' && 'focus:shadow-md',
                                theme === 'dark' && 'bg-background/50'
                            )}>
                                <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="es">Español</SelectItem>
                                <SelectItem value="fr">Français</SelectItem>
                                <SelectItem value="de">Deutsch</SelectItem>
                                <SelectItem value="ja">日本語</SelectItem>
                                <SelectItem value="zh">中文</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="timezone" className="flex items-center gap-2">
                            <FaPalette className="h-4 w-4" />
                            Timezone
                        </Label>
                        <Select value={timezone} onValueChange={(val) => setTimezone(val)}>
                            <SelectTrigger id="timezone" className={cn(
                                theme === 'light' && 'focus:shadow-md',
                                theme === 'dark' && 'bg-background/50'
                            )}>
                                <SelectValue placeholder="Select timezone" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                                <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                                <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                                <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                                <SelectItem value="Europe/London">London (GMT)</SelectItem>
                                <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                                <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                                <SelectItem value="Australia/Sydney">Sydney (AEST)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <Separator />

            <div>
                <h3 className="text-lg font-semibold mb-1">Notifications</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Manage how you receive updates and alerts
                </p>

                <div className="space-y-4">
                    <div
                        className={cn(
                            'flex items-center justify-between p-4 rounded-lg border',
                            theme === 'light' && 'bg-card',
                            theme === 'dark' && 'bg-background/50'
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                'p-2 rounded-lg',
                                emailNotifications ? 'bg-primary/10' : 'bg-muted'
                            )}>
                                <FaBell className={cn(
                                    'h-5 w-5',
                                    emailNotifications ? 'text-primary' : 'text-muted-foreground'
                                )} />
                            </div>
                            <div>
                                <p className="text-sm font-medium">Email Notifications</p>
                                <p className="text-xs text-muted-foreground">
                                    Receive updates about your account via email
                                </p>
                            </div>
                        </div>
                        <Switch
                            checked={emailNotifications}
                            onCheckedChange={(checked) => setEmailNotifications(checked)}
                        />
                    </div>

                    <div
                        className={cn(
                            'flex items-center justify-between p-4 rounded-lg border',
                            theme === 'light' && 'bg-card',
                            theme === 'dark' && 'bg-background/50'
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                'p-2 rounded-lg',
                                pushNotifications ? 'bg-primary/10' : 'bg-muted'
                            )}>
                                <FaBell className={cn(
                                    'h-5 w-5',
                                    pushNotifications ? 'text-primary' : 'text-muted-foreground'
                                )} />
                            </div>
                            <div>
                                <p className="text-sm font-medium">Push Notifications</p>
                                <p className="text-xs text-muted-foreground">
                                    Get real-time alerts in your browser
                                </p>
                            </div>
                        </div>
                        <Switch
                            checked={pushNotifications}
                            onCheckedChange={(checked) => setPushNotifications(checked)}
                        />
                    </div>

                    <div
                        className={cn(
                            'flex items-center justify-between p-4 rounded-lg border',
                            theme === 'light' && 'bg-card',
                            theme === 'dark' && 'bg-background/50'
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                'p-2 rounded-lg',
                                marketingEmails ? 'bg-primary/10' : 'bg-muted'
                            )}>
                                <FaBell className={cn(
                                    'h-5 w-5',
                                    marketingEmails ? 'text-primary' : 'text-muted-foreground'
                                )} />
                            </div>
                            <div>
                                <p className="text-sm font-medium">Marketing Emails</p>
                                <p className="text-xs text-muted-foreground">
                                    Receive news about features and updates
                                </p>
                            </div>
                        </div>
                        <Switch
                            checked={marketingEmails}
                            onCheckedChange={(checked) => setMarketingEmails(checked)}
                        />
                    </div>
                </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                >
                    Cancel
                </Button>
                <Button
                    type="button"
                    onClick={handleSave}
                    className="flex-1"
                >
                    Save Preferences
                </Button>
            </div>
        </div>
    )
}