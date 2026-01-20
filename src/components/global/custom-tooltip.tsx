'use client'
import * as React from 'react'
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

type CustomTooltipProps = {
  content: React.ReactNode
  children: React.ReactNode
  className?: string
}

const CustomTooltip = ({ content, children, className }: CustomTooltipProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn('inline-block', className)}>{children}</div>
        </TooltipTrigger>
        <TooltipContent>{content}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

CustomTooltip.displayName = 'CustomTooltip'

export default CustomTooltip