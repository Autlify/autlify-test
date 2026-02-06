// src/features/desktop/taskbar.tsx
'use client'

import { useDesktop } from './context'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export function Taskbar() {
  const { windows, activeWindowId, focusWindow, restoreWindow } = useDesktop()

  return (
    <div className="absolute bottom-0 left-0 right-0 h-12 border-t bg-card/95 backdrop-blur-sm">
      <div className="flex h-full items-center gap-1 px-2">
        {windows.map((w) => (
          <Button
            key={w.id}
            variant={activeWindowId === w.id ? 'secondary' : 'ghost'}
            size="sm"
            className={cn(
              'h-9 min-w-[120px] max-w-[200px] justify-start truncate',
              w.state === 'minimized' && 'opacity-60'
            )}
            onClick={() => {
              if (w.state === 'minimized') {
                restoreWindow(w.id)
              } else {
                focusWindow(w.id)
              }
            }}
          >
            <span className="truncate">{w.title}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}