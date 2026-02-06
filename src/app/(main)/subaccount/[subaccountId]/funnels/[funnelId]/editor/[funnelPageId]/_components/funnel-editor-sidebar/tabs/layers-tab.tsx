'use client'
import React from 'react'
import { useEditor, EditorElement } from '@/providers/editor/editor-provider'
import { SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { ChevronRight, ChevronDown, Box, Type, Link, Image, CreditCard, Mail, Video, Layers2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const LayersTab = () => {
  const { state, dispatch } = useEditor()

  const handleSelectElement = (element: EditorElement) => {
    dispatch({
      type: 'CHANGE_CLICKED_ELEMENT',
      payload: {
        elementDetails: element,
      },
    })
  }

  return (
    <>
      <SheetHeader className="text-left p-6">
        <SheetTitle>Layers</SheetTitle>
        <SheetDescription>
          View and select elements in your page hierarchy
        </SheetDescription>
      </SheetHeader>
      <div className="px-4 pb-6">
        {state.editor.elements.map((element) => (
          <LayerItem
            key={element.id}
            element={element}
            selectedId={state.editor.selectedElement.id}
            onSelect={handleSelectElement}
            depth={0}
          />
        ))}
      </div>
    </>
  )
}

interface LayerItemProps {
  element: EditorElement
  selectedId: string
  onSelect: (element: EditorElement) => void
  depth: number
}

const LayerItem = ({ element, selectedId, onSelect, depth }: LayerItemProps) => {
  const [isExpanded, setIsExpanded] = React.useState(true)
  const hasChildren = Array.isArray(element.content) && element.content.length > 0
  const isSelected = element.id === selectedId

  const getIcon = (type: EditorElement['type']) => {
    switch (type) {
      case '__body':
        return <Layers2 className="h-4 w-4" />
      case 'container':
      case 'section':
      case '2Col':
      case '3Col':
        return <Box className="h-4 w-4" />
      case 'text':
        return <Type className="h-4 w-4" />
      case 'link':
        return <Link className="h-4 w-4" />
      case 'image':
        return <Image className="h-4 w-4" />
      case 'video':
        return <Video className="h-4 w-4" />
      case 'paymentForm':
        return <CreditCard className="h-4 w-4" />
      case 'contactForm':
        return <Mail className="h-4 w-4" />
      default:
        return <Box className="h-4 w-4" />
    }
  }

  return (
    <div className="select-none">
      <div
        className={cn(
          'flex items-center gap-1 py-1 px-2 rounded cursor-pointer hover:bg-muted/50 transition-colors',
          isSelected && 'bg-primary/10 text-primary'
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => onSelect(element)}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
            className="p-0.5 hover:bg-muted rounded"
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>
        ) : (
          <span className="w-4" />
        )}
        {getIcon(element.type)}
        <span className="text-sm truncate flex-1">{element.name}</span>
      </div>
      {hasChildren && isExpanded && (
        <div>
          {(element.content as EditorElement[]).map((child) => (
            <LayerItem
              key={child.id}
              element={child}
              selectedId={selectedId}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default LayersTab
