"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface WorkingTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "default" | "ghost" | "outline"
  containerClassName?: string
  autoResize?: boolean
  maxHeight?: string
}

const WorkingTextarea = React.forwardRef<
  HTMLTextAreaElement,
  WorkingTextareaProps
>(({ className, containerClassName, size = "md", variant = "default", autoResize = false, maxHeight, ...props }, ref) => {
  const [textareaElement, setTextareaElement] = React.useState<HTMLTextAreaElement | null>(null)
  
  const combinedRef = React.useCallback((node: HTMLTextAreaElement | null) => {
    // Update our internal state
    setTextareaElement(node)
    
    // Forward to the external ref
    if (typeof ref === 'function') {
      ref(node)
    } else if (ref) {
      ref.current = node
    }
  }, [ref])

  // Auto-resize functionality
  React.useEffect(() => {
    if (!textareaElement || !autoResize) return

    const resizeTextarea = () => {
      // Reset height to auto to get accurate scrollHeight
      textareaElement.style.height = 'auto'
      
      // Calculate new height based on content
      const newHeight = textareaElement.scrollHeight
      
      // Apply max-height constraint if specified
      if (maxHeight) {
        const maxHeightPx = parseInt(maxHeight.replace(/[^0-9]/g, ''))
        if (newHeight > maxHeightPx) {
          textareaElement.style.height = maxHeight
          textareaElement.style.overflowY = 'auto'
        } else {
          textareaElement.style.height = `${newHeight}px`
          textareaElement.style.overflowY = 'hidden'
        }
      } else {
        textareaElement.style.height = `${newHeight}px`
        textareaElement.style.overflowY = 'hidden'
      }
    }

    // Initial resize
    resizeTextarea()

    // Add event listeners
    textareaElement.addEventListener('input', resizeTextarea)
    textareaElement.addEventListener('change', resizeTextarea)

    return () => {
      textareaElement.removeEventListener('input', resizeTextarea)
      textareaElement.removeEventListener('change', resizeTextarea)
    }
  }, [textareaElement, autoResize, maxHeight, props.value])

  // Size variants - minimum heights for textareas (NOT containers)
  // For auto-resize, use smaller min-heights as starting point
  const textareaSizeClasses = {
    sm: autoResize ? "min-h-[80px]" : "min-h-[120px]",
    md: autoResize ? "min-h-[80px]" : "min-h-[120px] md:min-h-[140px]", 
    lg: autoResize ? "min-h-[120px]" : "min-h-[200px] md:min-h-[240px]",
    xl: autoResize ? "min-h-[160px]" : "min-h-[240px] md:min-h-[280px]"
  }

  // Container variant styles (matches current onboarding design)
  const containerVariantClasses = {
    default: "bg-card/50 border border-border backdrop-blur-sm",
    ghost: "bg-transparent border-transparent", 
    outline: "bg-transparent border border-border"
  }

  return (
    <div
      className={cn(
        // CRITICAL FIX: Use h-auto like InteractivePromptSection
        "w-full h-auto p-3 rounded-xl flex flex-col",
        
        // Focus states - use focus-within for proper focus indication
        "focus-within:ring-2 focus-within:ring-brand/50 focus-within:border-brand focus-within:ring-offset-0",
        
        // Hover states
        "hover:border-brand/30 transition-colors duration-200",
        
        // Variant styles for container
        containerVariantClasses[variant],
        
        containerClassName
      )}
    >
      <textarea
        ref={combinedRef}
        className={cn(
          // CRITICAL FIX: Apply min-height to textarea directly, not h-full
          "w-full bg-transparent text-base md:text-lg",
          "text-foreground placeholder:text-muted-foreground",
          "resize-none focus:outline-none appearance-none flex-grow",
          
          // Apply size directly to textarea
          textareaSizeClasses[size],
          
          className
        )}
        {...props}
      />
    </div>
  )
})

WorkingTextarea.displayName = "WorkingTextarea"

export { WorkingTextarea }