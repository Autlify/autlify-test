'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, useMotionValue, useTransform, PanInfo } from 'motion/react'
import { cn } from '@/lib/utils'
import LiquidGlass from '@/components/ui/liquid-glass'

export interface SegmentedTab {
    id: string
    label: string
    icon?: React.ReactNode
}

export interface SegmentedTabsProps {
    tabs: SegmentedTab[]
    defaultTab?: string
    value?: string
    onValueChange?: (tabId: string) => void
    className?: string
    size?: 'default' | 'sm' | 'lg'
    // Liquid glass props
    displacementScale?: number
    blurAmount?: number
    saturation?: number
    aberrationIntensity?: number
    elasticity?: number
    overLight?: boolean
    mode?: 'standard' | 'polar' | 'prominent' | 'shader'
}






export const SegmentedTabs = React.forwardRef<HTMLDivElement, SegmentedTabsProps>(
    (
        {
            tabs,
            defaultTab,
            value: controlledValue,
            onValueChange,
            className,
            size = 'default',
            // Liquid glass defaults
            displacementScale = 140,
            blurAmount = 0.5,
            saturation = 140,
            aberrationIntensity = 2,
            elasticity = 0.3,
            overLight = false,
            mode = 'prominent',
        },
        ref
    ) => {
        const [internalValue, setInternalValue] = useState(defaultTab || tabs[0]?.id)
        const activeTab = controlledValue ?? internalValue
        const [isDragging, setIsDragging] = useState(false)
        const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map())
        const containerRef = useRef<HTMLDivElement | null>(null)
        const trackRef = useRef<HTMLDivElement | null>(null)

        // Motion values for liquid glass position
        const glassX = useMotionValue(0)
        const [glassWidth, setGlassWidth] = useState(0)
        const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 })

        const sizeConfig = {
            sm: {
                containerHeight: 'h-12',
                containerPadding: 6,
                glassHeight: 36, // h-9
                glassTop: 6, // top-1.5
                buttonPadding: 'px-5 py-2',
                fontSize: 'text-sm',
                scale: 'scale-75 sm:scale-90',
                cornerRadius: 18,
            },
            default: {
                containerHeight: 'h-16',
                containerPadding: 8,
                glassHeight: 48, // h-12
                glassTop: 8, // top-2
                buttonPadding: 'px-7 py-3',
                fontSize: 'text-base',
                scale: 'scale-75 sm:scale-100',
                cornerRadius: 24,
            },
            lg: {
                containerHeight: 'h-20',
                containerPadding: 10,
                glassHeight: 64, // h-16
                glassTop: 8, // top-2
                buttonPadding: 'px-9 py-4',
                fontSize: 'text-lg',
                scale: 'scale-90 sm:scale-100',
                cornerRadius: 32,
            },
        }

        const config = sizeConfig[size]

        // Update glass position to active tab
        useEffect(() => {
            updateGlassPosition(activeTab)
        }, [activeTab])

        // Handle resize
        useEffect(() => {
            const handleResize = () => {
                updateGlassPosition(activeTab)
                updateDragConstraints()
            }
            window.addEventListener('resize', handleResize)
            setTimeout(() => {
                updateGlassPosition(activeTab)
                updateDragConstraints()
            }, 0)
            return () => window.removeEventListener('resize', handleResize)
        }, [activeTab, tabs])

        const updateDragConstraints = () => {
            const containerEl = containerRef.current
            if (!containerEl) return

            const containerRect = containerEl.getBoundingClientRect()
            const padding = config.containerPadding

            // Get first and last tab positions
            const firstTab = tabRefs.current.get(tabs[0]?.id)
            const lastTab = tabRefs.current.get(tabs[tabs.length - 1]?.id)

            if (firstTab && lastTab) {
                const firstRect = firstTab.getBoundingClientRect()
                const lastRect = lastTab.getBoundingClientRect()

                const leftBound = firstRect.left - containerRect.left - padding
                const rightBound = lastRect.right - containerRect.left - padding - glassWidth

                setDragConstraints({ left: leftBound, right: rightBound })
            }
        }

        const updateGlassPosition = (tabId: string, animate = true) => {
            const buttonEl = tabRefs.current.get(tabId)
            const containerEl = containerRef.current

            if (buttonEl && containerEl) {
                const containerRect = containerEl.getBoundingClientRect()
                const buttonRect = buttonEl.getBoundingClientRect()
                const padding = config.containerPadding

                const targetX = buttonRect.left - containerRect.left - padding
                const targetWidth = buttonRect.width

                setGlassWidth(targetWidth)

                if (animate) {
                    // Smooth spring animation
                    glassX.set(targetX)
                } else {
                    // Instant update
                    glassX.jump(targetX)
                }
            }
        }

        const handleTabClick = (tabId: string) => {
            if (isDragging) return // Don't switch tabs while dragging

            if (controlledValue === undefined) {
                setInternalValue(tabId)
            }
            onValueChange?.(tabId)
        }

        const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
            setIsDragging(false)

            // Find the closest tab
            const currentX = glassX.get()
            const containerEl = containerRef.current
            if (!containerEl) return

            const containerRect = containerEl.getBoundingClientRect()
            const padding = config.containerPadding

            let closestTab = tabs[0].id
            let closestDistance = Infinity

            tabs.forEach((tab) => {
                const buttonEl = tabRefs.current.get(tab.id)
                if (!buttonEl) return

                const buttonRect = buttonEl.getBoundingClientRect()
                const tabX = buttonRect.left - containerRect.left - padding
                const distance = Math.abs(currentX - tabX)

                if (distance < closestDistance) {
                    closestDistance = distance
                    closestTab = tab.id
                }
            })

            // Snap to closest tab
            if (controlledValue === undefined) {
                setInternalValue(closestTab)
            }
            onValueChange?.(closestTab)
        }

        return (
            <div ref={containerRef} className={cn('inline-flex relative', className)}>
                <div
                    ref={containerRef}
                    className={cn(
                        'relative flex items-center justify-between rounded-full',
                        config.containerHeight,
                        `p-${config.containerPadding > 6 ? '2' : '1.5'}`,
                        config.scale
                    )}
                >
                       
                    {/* Outer shell with dark metallic gradient */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-b from-neutral-700 to-neutral-800 shadow-[0_8px_32px_rgba(0,0,0,0.6),0_2px_8px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1),inset_0_-1px_2px_rgba(0,0,0,0.5)]" />

                    {/* Inner container with deeper gradient */}
                    <div className="absolute inset-[3px] rounded-full bg-gradient-to-b from-neutral-800 to-neutral-900 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8),inset_0_-1px_2px_rgba(255,255,255,0.05)]" />

                    {/* Subtle inner glow track */}
                    <div
                        ref={trackRef}
                        className={cn(
                            'absolute rounded-full bg-gradient-to-b from-white/10 to-white/5',
                            'shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)] backdrop-blur-sm', 
                        )}
                    />

                    <LiquidGlass
                        mouseContainer={containerRef}
                        displacementScale={isDragging ? 200 : 0}
                        blurAmount={isDragging ? 1.5 : 0}
                        saturation={saturation}
                        aberrationIntensity={isDragging ? 4 : aberrationIntensity}
                        elasticity={isDragging ? 0.5 : elasticity}
                        cornerRadius={config.cornerRadius}
                        overLight={isDragging}
                        mode={mode}  
                        style= {{ 
                            position: 'absolute',
                            width: glassWidth,
                            height: config.glassHeight, 
                            top: 'calc(35% + ' + config.glassTop + 'px)',
                            left: 'calc(35% / 2 + ' + glassX.get() + 'px)',
                            pointerEvents: 'none',
                        }}
                        className={cn(
                            'h-full rounded-full transition-all duration-200',
                            isDragging 
                                ? 'bg-white/10 backdrop-blur-sm shadow-[0_0_40px_rgba(255,255,255,0.8),0_0_80px_rgba(255,255,255,0.4),0_4px_20px_rgba(0,0,0,0.6)] ring-2 ring-white/30'
                                : 'bg-gradient-to-b from-neutral-500/40 to-neutral-600/50 shadow-[0_2px_8px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]',
                        )}
                        children={null}
                    />
                    {/* Tab buttons (content underneath liquid glass) */}
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            ref={(el) => {
                                if (el) {
                                    tabRefs.current.set(tab.id, el)
                                } else {
                                    tabRefs.current.delete(tab.id)
                                }
                            }}
                            onClick={() => handleTabClick(tab.id)}
                            className={cn(
                                'relative rounded-full flex justify-center items-center gap-2',
                                'cursor-pointer transition-colors z-10',
                                config.buttonPadding
                            )}
                            aria-selected={activeTab === tab.id}
                            role="tab"
                        >
                            {tab.icon && (
                                <span
                                    className={cn(
                                        'transition-all duration-200',
                                        activeTab === tab.id ? 'text-neutral-900' : 'text-neutral-300'
                                    )}
                                >
                                    {tab.icon}
                                </span>
                            )}
                            <span
                                className={cn(
                                    'text-center font-medium font-sans leading-tight transition-all duration-200',
                                    config.fontSize,
                                    activeTab === tab.id ? 'text-neutral-900' : 'text-neutral-300'
                                )}
                            >
                                {tab.label}
                            </span>
                        </button>
                    ))}

                    {/* Draggable Liquid Glass Overlay */}
                    <motion.div
                        drag="x"
                        dragConstraints={dragConstraints}
                        dragElastic={0.2}
                        dragMomentum={false}
                        onDragStart={() => setIsDragging(true)}
                        onDragEnd={handleDragEnd}
                        style={{
                            x: glassX,
                            width: glassWidth,
                            height: config.glassHeight,
                            top: config.glassTop,
                        }}
                        className="absolute z-50 cursor-grab active:cursor-grabbing rounded-full touch-none"
                        animate={{
                            width: glassWidth,
                            height: isDragging ? config.glassHeight * 1.3 : config.glassHeight,
                            scale: isDragging ? 1.15 : 1,
                        }}
                        transition={{
                            x: {
                                type: 'spring',
                                stiffness: 400,
                                damping: 30,
                                mass: 0.8,
                            },
                            width: {
                                type: 'spring',
                                stiffness: 400,
                                damping: 30,
                            },
                            height: {
                                type: 'spring',
                                stiffness: 500,
                                damping: 25,
                            },
                            scale: {
                                type: 'spring',
                                stiffness: 600,
                                damping: 20,
                            },
                        }}
                    >
                        {/* Invisible but interactive hit area */}
                        <div className="w-full h-full rounded-full bg-transparent" />
                    </motion.div>
                </div>
             </div>
        )
    }
)

SegmentedTabs.displayName = 'SegmentedTabs'

