'use client'

import React, { useState } from "react"
import { useTheme } from "next-themes"
import * as Icons from 'lucide-react'
import { Button } from '@/components/ui-2/button'
import { GlassContainer } from "@/components/ui/glass-container"

interface DashboardProps {
    onLogin?: () => void
}


const Dashboard = ({ onLogin }: DashboardProps) => {
    const { setTheme, resolvedTheme } = useTheme()
    const theme = resolvedTheme === 'system' ? resolvedTheme : resolvedTheme

    const toggletheme = () => {
        const newTheme = theme === 'premium' ? 'light' : 'premium'
        setTheme(newTheme)
    }

    return (

        <div className="w-full h-full flex items-center justify-center">
            {/* Premium Dashboard Mockup */}
            <div className="max-w-[1400px] max-h-full w-full relative z-20 animate-fade-in delay-500" >
                <div className={`absolute -inset-0.5 ${theme === 'premium' ? 'bg-gradient-to-b from-blue-500/20 to-purple-500/20' : 'bg-zinc-200/50'} rounded-xl blur-2xl opacity-50 -z-10 transition-colors duration-500`} />

                <div className={`rounded-xl border transition-colors duration-500 shadow-2xl overflow-hidden ring-1 ring-white/5 ${theme === 'premium' ? 'bg-[#09090b] border-white/10' : 'bg-white border-zinc-200'
                    }`}>
                    {/* Window Controls */}
                    <div className={`h-10 border-b flex items-center px-4 justify-between select-none transition-colors duration-500 ${theme === 'premium' ? 'bg-[#09090b] border-white/5' : 'bg-zinc-50 border-zinc-200'
                        }`}>
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#FB5F58]"></div>
                            <div className="w-3 h-3 rounded-full bg-[#FDBF2D]"></div>
                            <div className="w-3 h-3 rounded-full bg-[#28C840]"></div>
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-md border text-[10px] font-mono transition-colors duration-500 ${theme === 'premium' ? 'bg-zinc-900 border-white/5 text-zinc-500' : 'bg-white border-zinc-200 text-zinc-400'
                            }`}>
                            <Icons.Shield className="w-3 h-3" /> autlify.com
                        </div>
                        <div className="w-10"></div>
                    </div>

                    {/* Dashboard Layout */}
                    <div className="flex h-[700px] transition-colors duration-500">
                        {/* Sidebar */}
                        <div className={`w-[260px] border-r flex flex-col transition-colors duration-500 ${theme === 'premium' ? 'bg-[#050505] border-white/5' : 'bg-zinc-50 border-zinc-200'
                            }`}>
                            <div className="p-4">
                                <div className={`flex items-center gap-2 px-2 py-2 mb-6 font-medium transition-colors duration-500 ${theme === 'premium' ? 'text-white' : 'text-zinc-900'
                                    }`}>
                                    <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-[10px] shadow-lg border border-blue-500/50 text-white">A</div>
                                    <span className="tracking-tight text-sm">Autlify Inc.</span>
                                    <Icons.ChevronDown className="w-3 h-3 ml-auto text-zinc-400" />
                                </div>

                                <div className="space-y-1">
                                    <div className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium cursor-pointer transition-colors duration-300 ${theme === 'premium' ? 'bg-white/5 text-white' : 'bg-blue-50 text-blue-600'
                                        }`}>
                                        <Icons.LayoutDashboardIcon className="w-4 h-4" /> Overview
                                    </div>
                                    {['Clients', 'Projects', 'AI Agents'].map((item, i) => (
                                        <div key={item} className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-colors duration-300 cursor-pointer ${theme === 'premium' ? 'text-zinc-400 hover:bg-white/5 hover:text-white' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                                            }`}>
                                            {i === 0 ? <Icons.Users className="w-4 h-4" /> : i === 1 ? <Icons.Touchpad className="w-4 h-4" /> : <Icons.Bot className="w-4 h-4" />}
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className={`mt-auto p-4 border-t transition-colors duration-500 ${theme === 'premium' ? 'border-white/5' : 'border-zinc-200'}`}>
                                <div className="flex items-center gap-3 px-2">
                                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-medium transition-colors duration-500 ${theme === 'premium' ? 'bg-gradient-to-tr from-zinc-700 to-zinc-600 border-white/10 text-white' : 'bg-zinc-200 border-zinc-300 text-zinc-900'
                                        }`}>ZT</div>
                                    <div>
                                        <div className={`text-xs font-medium transition-colors duration-500 ${theme === 'premium' ? 'text-white' : 'text-zinc-900'}`}>Zayn Tan</div>
                                        <div className="text-[10px] text-zinc-500">Admin</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className={`flex-1 flex flex-col relative transition-colors duration-500 ${theme === 'premium' ? 'bg-[#09090b]' : 'bg-white'
                            }`}>
                            {/* Header */}
                            <div className={`h-16 border-b flex items-center justify-between px-8 transition-colors duration-500 ${theme === 'premium' ? 'border-white/5' : 'border-zinc-100'
                                }`}>
                                <div className="flex items-center gap-2 text-sm text-zinc-400">
                                    <span>Overview</span>
                                    <Icons.ChevronRight className="w-3 h-3" />
                                    <span className={theme === 'premium' ? 'text-white font-medium' : 'text-zinc-900 font-medium'}>Dashboard</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs transition-all duration-300 cursor-pointer ${theme === 'premium' ? 'bg-zinc-900 border-white/10 text-zinc-400 hover:border-white/20' : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:bg-zinc-100'
                                        }`}>
                                        <Icons.Search className="w-3 h-3" />
                                        <span>Search...</span>
                                    </div>
                                    {/* Functional Theme Toggle */}
                                    <button
                                        onClick={toggletheme}
                                        className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${theme === 'premium' ? 'border-white/5 text-yellow-400 hover:bg-white/5' : 'border-zinc-200 text-blue-600 hover:bg-zinc-50'
                                            }`}
                                        title={`Switch to ${theme === 'premium' ? 'Light' : 'premium'} Mode`}
                                    >
                                        {theme === 'premium' ? <Icons.Sun className="w-4 h-4" /> : <Icons.Moon className="w-4 h-4" />}
                                    </button>
                                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors duration-300 cursor-pointer ${theme === 'premium' ? 'border-white/5 text-zinc-400 hover:text-white hover:bg-white/5' : 'border-zinc-200 text-zinc-500 hover:bg-zinc-50'
                                        }`}>
                                        <Icons.Bell className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>

                            {/* Content Body */}
                            <div className="p-8 overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-4 gap-6 mb-8">
                                    {[
                                        { title: "Monthly Revenue", value: "$42,500", trend: "+12%", trendUp: true, icon: <Icons.DollarSign /> },
                                        { title: "Active Projects", value: "18", trend: "+4", trendUp: true, icon: <Icons.Touchpad /> },
                                        { title: "Avg. Turnaround", value: "12 Days", trend: "-2 Days", trendUp: true, icon: <Icons.Clock /> },
                                        { title: "Pending Invoices", value: "$8,200", trend: "3 overdue", trendUp: false, icon: <Icons.AlertTriangle /> }
                                    ].map((card, i) => (
                                        <div key={i} className={`border rounded-xl p-5 transition-all duration-300 group ${theme === 'premium' ? 'bg-[#0e0e10] border-white/5 hover:border-white/10' : 'bg-zinc-50 border-zinc-200 hover:shadow-lg'
                                            }`}>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className={`p-2 rounded-lg transition-colors ${theme === 'premium' ? 'bg-white/5 text-zinc-400 group-hover:text-white' : 'bg-blue-600 text-white'
                                                    }`}>
                                                    {React.cloneElement(card.icon as React.ReactElement<{ className?: string }>, { className: "w-4 h-4" })}
                                                </div>
                                                <div className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${card.trendUp ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                                    {card.trend}
                                                </div>
                                            </div>
                                            <div className={`text-2xl font-semibold tracking-tight mb-1 transition-colors duration-500 ${theme === 'premium' ? 'text-white' : 'text-zinc-900'}`}>{card.value}</div>
                                            <div className="text-xs text-zinc-500 font-medium">{card.title}</div>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-3 gap-6 mb-8">
                                    <div className={`col-span-2 border rounded-xl p-6 h-[320px] flex flex-col transition-colors duration-500 ${theme === 'premium' ? 'bg-[#0e0e10] border-white/5' : 'bg-zinc-50 border-zinc-200'
                                        }`}>
                                        <div className="flex justify-between items-center mb-6">
                                            <div>
                                                <h3 className={`text-sm font-semibold transition-colors duration-500 ${theme === 'premium' ? 'text-white' : 'text-zinc-900'}`}>Revenue Growth</h3>
                                                <p className="text-xs text-zinc-500">Income breakdown over the last 6 months</p>
                                            </div>
                                        </div>
                                        <div className="flex-1 flex items-end justify-between px-2 gap-3">
                                            {[40, 65, 55, 80, 70, 90, 85, 95, 80, 75, 60, 85].map((h, i) => (
                                                <div key={i} className="w-full h-full flex items-end relative group">
                                                    <div
                                                        className={`w-full rounded-t-sm transition-all duration-500 ${theme === 'premium' ? 'bg-gradient-to-t from-blue-600/20 to-blue-500/50 group-hover:from-blue-600/40' : 'bg-blue-600/80 group-hover:bg-blue-600'
                                                            }`}
                                                        style={{ height: `${h}%` }}
                                                    ></div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex justify-between mt-4 px-2 text-[10px] text-zinc-500 uppercase font-medium tracking-wider">
                                            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                                            <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                                        </div>
                                    </div>

                                    <div className={`col-span-1 border rounded-xl p-6 flex flex-col transition-colors duration-500 ${theme === 'premium' ? 'bg-[#0e0e10] border-white/5' : 'bg-zinc-50 border-zinc-200'
                                        }`}>
                                        <h3 className={`text-sm font-semibold mb-4 transition-colors duration-500 ${theme === 'premium' ? 'text-white' : 'text-zinc-900'}`}>Project Status</h3>
                                        <div className="flex-1 flex items-center justify-center relative">
                                            <div className={`w-40 h-40 rounded-full border-[12px] relative flex items-center justify-center transition-colors duration-500 ${theme === 'premium' ? 'border-zinc-800' : 'border-zinc-200'
                                                }`}>
                                                <svg className="absolute inset-0 rotate-[-90deg]" viewBox="0 0 100 100">
                                                    <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="10" strokeDasharray="180 251" strokeLinecap="round" />
                                                    <circle cx="50" cy="50" r="40" fill="none" stroke="#a855f7" strokeWidth="10" strokeDasharray="50 251" strokeDashoffset="-190" strokeLinecap="round" />
                                                </svg>
                                                <div className="text-center">
                                                    <div className={`text-2xl font-bold transition-colors duration-500 ${theme === 'premium' ? 'text-white' : 'text-zinc-900'}`}>92%</div>
                                                    <div className="text-[10px] text-zinc-500 uppercase tracking-wide">On Track</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )
}

Dashboard.displayName = "DashboardMockup"

export { Dashboard }