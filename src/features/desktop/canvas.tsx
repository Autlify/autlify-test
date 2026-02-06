// src/features/desktop/canvas.tsx

import { useDesktop } from './context'
import { AppWindow } from './window'
import { Taskbar } from './taskbar'
import { FloatingDock } from './floating-dock'
import { AppResolver } from '../apps/resolver'
import { IconBrandGithub, IconBrandX, IconExchange, IconHome, IconNewSection, IconTerminal2 } from '@tabler/icons-react'

export function DesktopCanvas() {
    const { windows, scope } = useDesktop()

    const visibleWindows = windows.filter(w => w.state !== 'minimized')

    return (
        <div className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-background to-muted">
            {/* App Windows */}
            {visibleWindows.map((window) => (
                <AppWindow key={window.id} window={window}>
                    <AppResolver
                        scope={scope}
                        appKey={window.appKey}
                        path={window.path}
                        windowId={window.id}
                    />
                </AppWindow>
            ))}

            {/* FloatingDock (left side or bottom) */}
            <FloatingDock items={[
                {
                    title: "Home",
                    icon: (
                        <IconHome className="h-full w-full text-neutral-500 dark:text-neutral-300" />
                    ),
                    href: "#",
                },

                {
                    title: "Products",
                    icon: (
                        <IconTerminal2 className="h-full w-full text-neutral-500 dark:text-neutral-300" />
                    ),
                    href: "#",
                },
                {
                    title: "Components",
                    icon: (
                        <IconNewSection className="h-full w-full text-neutral-500 dark:text-neutral-300" />
                    ),
                    href: "#",
                },
                {
                    title: "Aceternity UI",
                    icon: (
                        <img
                            src="https://assets.aceternity.com/logo-dark.png"
                            width={20}
                            height={20}
                            alt="Aceternity Logo"
                        />
                    ),
                    href: "#",
                },
                {
                    title: "Changelog",
                    icon: (
                        <IconExchange className="h-full w-full text-neutral-500 dark:text-neutral-300" />
                    ),
                    href: "#",
                },

                {
                    title: "Twitter",
                    icon: (
                        <IconBrandX className="h-full w-full text-neutral-500 dark:text-neutral-300" />
                    ),
                    href: "#",
                },
                {
                    title: "GitHub",
                    icon: (
                        <IconBrandGithub className="h-full w-full text-neutral-500 dark:text-neutral-300" />
                    ),
                    href: "#",
                },
            ]} />

            {/* Taskbar (bottom) */}
            <Taskbar />
        </div>
    )
}