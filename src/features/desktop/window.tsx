// src/features/desktop/window.tsx

import { useRef, useState, useCallback, useEffect } from 'react'
import { useDesktop } from './context'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Minus, Square, X, Maximize2 } from 'lucide-react'
import React from 'react'

type AppWindowData = {
    id: string
    appKey: string
    path: string[]
    title: string
    state: 'normal' | 'minimized' | 'maximized'
    position: { x: number; y: number }
    size: { width: number; height: number }
    zIndex: number
}

export function AppWindow({
    window,
    children
}: {
    window: AppWindowData
    children: React.ReactNode
}) {
    const {
        activeWindowId,
        focusWindow,
        closeWindow,
        minimizeWindow,
        maximizeWindow,
        restoreWindow,
        moveWindow,
        resizeWindow,
    } = useDesktop()

    const windowRef = useRef<HTMLDivElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [isResizing, setIsResizing] = useState(false)
    const dragOffset = useRef({ x: 0, y: 0 })

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (window.state === 'maximized') return
        setIsDragging(true)
        dragOffset.current = {
            x: e.clientX - window.position.x,
            y: e.clientY - window.position.y,
        }
        focusWindow(window.id)
    }, [window.state, window.position, window.id, focusWindow])

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isDragging) {
            moveWindow(window.id, {
                x: e.clientX - dragOffset.current.x,
                y: e.clientY - dragOffset.current.y,
            })
        }
    }, [isDragging, window.id, moveWindow])

    const handleMouseMoveResize = useCallback((e: MouseEvent) => {
        if (isResizing) {
            const newWidth = e.clientX - window.position.x
            const newHeight = e.clientY - window.position.y
            resizeWindow(window.id, {
                width: Math.max(newWidth, 200), // Minimum width
                height: Math.max(newHeight, 100), // Minimum height
            })
        }
    }, [isResizing, window.position, window.id, resizeWindow])

    const handleMouseDownResize = useCallback((e: React.MouseEvent) => {
        if (window.state === 'maximized') return
        setIsResizing(true)
        focusWindow(window.id)
    }, [window.state, window.id, focusWindow])


    const handleMouseUp = useCallback(() => {
        setIsDragging(false)
        setIsResizing(false)
    }, [])


    // Attach global listeners when dragging
    React.useEffect(() => {
        if (isDragging || isResizing) {
            document.addEventListener('mousemove', isDragging ? handleMouseMove : handleMouseMoveResize)
            document.addEventListener('mouseup', handleMouseUp)
            return () => {
                document.removeEventListener('mousemove', isDragging ? handleMouseMove : handleMouseMoveResize)
                document.removeEventListener('mouseup', handleMouseUp)
            }
        }
    }, [isDragging, isResizing, handleMouseMove, handleMouseMoveResize, handleMouseUp, handleMouseDownResize])


    // Determine if this window is the active/focused window
    const isActive = activeWindowId === window.id

    // Don't render if minimized
    if (window.state === 'minimized') return null




    // Compute styles based on window state
    const style = window.state === 'maximized'
        ? { top: 0, left: 0, width: '100%', height: 'calc(100% - 48px)', zIndex: window.zIndex }
        : {
            top: window.position.y,
            left: window.position.x,
            width: window.size.width,
            height: window.size.height,
            zIndex: window.zIndex,
        }

    return (
        <div
            ref={windowRef}
            className={cn(
                'absolute flex flex-col rounded-lg border bg-card shadow-2xl',
                isActive ? 'ring-2 ring-primary' : 'ring-1 ring-border',
                isDragging && 'cursor-grabbing'
            )}
            style={style}
            onClick={() => focusWindow(window.id)}
        >
            {/* Title Bar */}
            <div
                className={cn(
                    'flex h-10 items-center justify-between gap-2 rounded-t-lg border-b px-3',
                    isActive ? 'bg-muted' : 'bg-muted/50'
                )}
                onMouseDown={handleMouseDown}
            >
                <div className="flex items-center gap-2 truncate">
                    <span className="text-sm font-medium truncate">{window.title}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => { e.stopPropagation(); minimizeWindow(window.id) }}
                    >
                        <Minus className="h-3 w-3" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                            e.stopPropagation()
                            window.state === 'maximized' ? restoreWindow(window.id) : maximizeWindow(window.id)
                        }}
                    >
                        {window.state === 'maximized' ? <Square className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={(e) => { e.stopPropagation(); closeWindow(window.id) }}
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
                {children}
            </div>

            {/* Resize handle */}
            {window.state !== 'maximized' && (
                <div
                    className="absolute bottom-0 right-0 h-4 w-4 cursor-se-resize"
                    onMouseDown={(e) => {
                        e.stopPropagation()
                        setIsResizing(true)
                        focusWindow(window.id)
                    }}
                />
            )}
        </div>
    )
}