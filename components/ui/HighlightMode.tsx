'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Button } from './button';
import { createPortal } from 'react-dom';

interface HighlightedText {
  id: string;
  text: string;
  range: Range;
  element: HTMLElement;
  sourceMetadata?: {
    messageId: string;
    sourceTitle?: string;
    sourceUrl?: string;
    sourceSnippet?: string;
    messageType: 'search' | 'news' | 'general';
  };
}

interface HighlightModeTooltipProps {
  selections: HighlightedText[];
  position: { top: number; left: number };
  show: boolean;
  onGenerateContent: (selections: HighlightedText[], userInstructions?: string) => void;
  onClearAll: () => void;
  onClose: () => void;
}

const HighlightModeTooltip: React.FC<HighlightModeTooltipProps> = ({
  selections,
  position,
  show,
  onGenerateContent,
  onClearAll,
  onClose,
}) => {
  const [mounted, setMounted] = useState(false);
  const [userInstructions, setUserInstructions] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Clear user instructions when tooltip is hidden or no selections
  useEffect(() => {
    if (!show || selections.length === 0) {
      setUserInstructions('');
    }
  }, [show, selections.length]);

  if (!mounted || !show) {
    return null;
  }

  const totalText = selections.map(s => s.text).join(' ... ');
  // No truncation - show full text
  const displayText = totalText;

  const tooltip = (
    <div
      data-highlight-mode-tooltip
      className="fixed transition-all duration-200 ease-out"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        opacity: show ? 1 : 0,
        transform: show ? 'scale(1)' : 'scale(0.95)',
        zIndex: 9999,
        pointerEvents: show ? 'auto' : 'none',
      }}
    >
      <div className="bg-white dark:bg-gray-800 border-2 border-purple-500 dark:border-purple-400 rounded-lg shadow-2xl backdrop-blur-sm p-4 w-96 max-w-none">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {selections.length > 0 ? (
              `${selections.length} text${selections.length !== 1 ? 's' : ''} selected`
            ) : (
              'Highlight Mode Active'
            )}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
        
        <div className="text-xs text-gray-600 dark:text-gray-400 mb-3">
          {selections.length > 0 ? (
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded text-gray-800 dark:text-gray-200 max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-600 text-sm leading-relaxed">
              &ldquo;{displayText}&rdquo;
            </div>
          ) : (
            <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded text-orange-800 dark:text-orange-200 border border-orange-200 dark:border-orange-700 text-sm">
              <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              Click on any text in the chat to select it for content generation
            </div>
          )}
        </div>

        {/* User Instructions Input */}
        <div className="mb-3">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
            Additional instructions (optional):
          </label>
          <textarea
            value={userInstructions}
            onChange={(e) => setUserInstructions(e.target.value)}
            placeholder="e.g., 'rewrite in my professional writing style' or 'focus on benefits for small businesses'"
            className="w-full text-xs p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            rows={2}
          />
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => onGenerateContent(selections, userInstructions.trim())}
            disabled={selections.length === 0}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 19 7.5 19s3.332-.523 4.5-1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 19 17.5 19c-1.746 0-3.332-.523-4.5-1.253" />
            </svg>
            Generate Content
          </Button>
          {selections.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={onClearAll}
              className="text-xs"
            >
              Clear All
            </Button>
          )}
        </div>
        
        {/* Arrow pointing to chat content (positioned to the right of tooltip) */}
        <div className="absolute right-0 top-6 transform translate-x-full">
          <div className="w-0 h-0 border-t-4 border-b-4 border-l-4 border-t-transparent border-b-transparent border-l-white dark:border-l-gray-800"></div>
          <div className="w-0 h-0 border-t-4 border-b-4 border-l-4 border-t-transparent border-b-transparent border-l-gray-200 dark:border-l-gray-700 -ml-1"></div>
        </div>
      </div>
    </div>
  );

  try {
    return createPortal(tooltip, document.body);
  } catch (error) {
    return null;
  }
};

interface HighlightModeProps {
  isActive: boolean;
  containerSelector?: string;
  onSelectionChange?: (selections: HighlightedText[]) => void;
  onGenerateContent?: (selections: HighlightedText[], userInstructions?: string) => void;
  onModeExit?: () => void;
}

export const HighlightMode: React.FC<HighlightModeProps> = ({
  isActive,
  containerSelector = '[data-message-container]',
  onSelectionChange,
  onGenerateContent,
  onModeExit,
}) => {
  const [selections, setSelections] = useState<HighlightedText[]>([]);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const highlightIdCounter = useRef(0);

  // Generate unique highlight ID
  const generateHighlightId = useCallback(() => {
    highlightIdCounter.current += 1;
    return `highlight-mode-${Date.now()}-${highlightIdCounter.current}`;
  }, []);

  // Add highlight styling to element
  const addHighlightToElement = useCallback((element: HTMLElement, highlightId: string) => {
    element.setAttribute('data-highlight-id', highlightId);
    element.classList.add('highlight-mode-selected');
  }, []);

  // Remove highlight styling from element
  const removeHighlightFromElement = useCallback((element: HTMLElement) => {
    element.removeAttribute('data-highlight-id');
    element.classList.remove('highlight-mode-selected', 'highlight-mode-hover');
  }, []);

  // Handle click on text elements
  const handleTextClick = useCallback((event: MouseEvent) => {
    if (!isActive) return;

    const target = event.target as Element;
    
    // Try multiple selectors to find the message container
    let container = target.closest(containerSelector);
    
    // If not found, try looking for any selectable content area
    if (!container) {
      container = target.closest('[data-message-container], .prose, [role="article"]');
    }
    
    if (!container) return;

    // Find the text node that was clicked
    const range = document.caretRangeFromPoint(event.clientX, event.clientY);
    if (!range) return;

    // Instead of working with single text nodes, find the paragraph or container element
    let targetElement = target.closest('p, div, li, span, .prose > *');
    
    // If we clicked directly on a text element, try to select meaningful content
    if (!targetElement) {
      // Fallback to text node expansion
      const textNode = range.startContainer;
      if (textNode.nodeType !== Node.TEXT_NODE) return;
      targetElement = textNode.parentElement;
    }

    if (!targetElement) return;

    // Get all text content from the target element
    let selectedText = targetElement.textContent?.trim() || '';
    
    // If the element has very little text, try to expand to parent
    if (selectedText.length < 20) {
      const parentElement = targetElement.parentElement;
      if (parentElement && parentElement !== container) {
        const parentText = parentElement.textContent?.trim() || '';
        if (parentText.length > selectedText.length && parentText.length < 1000) {
          selectedText = parentText;
          targetElement = parentElement;
        }
      }
    }

    // Skip if selection is too short or too long
    if (selectedText.length < 5 || selectedText.length > 2000) return;

    // Create range for the entire element's text content
    const selectionRange = document.createRange();
    selectionRange.selectNodeContents(targetElement);

    // Check if this text is already selected
    const existingSelection = selections.find(s => s.text === selectedText);
    if (existingSelection) {
      // Remove existing selection
      setSelections(prev => {
        const updated = prev.filter(s => s.id !== existingSelection.id);
        removeHighlightFromElement(existingSelection.element);
        return updated;
      });
      return;
    }

    // Create new selection
    const highlightId = generateHighlightId();
    const containerElement = container as HTMLElement;

    // Extract source metadata
    const sourceMetadata = {
      messageId: containerElement.getAttribute('data-message-id') || '',
      sourceTitle: containerElement.getAttribute('data-source-title') || undefined,
      sourceUrl: containerElement.getAttribute('data-source-url') || undefined,
      sourceSnippet: containerElement.getAttribute('data-source-snippet') || undefined,
      messageType: (containerElement.getAttribute('data-message-type') as 'search' | 'news' | 'general') || 'general',
    };

    // Instead of wrapping with a span, just add highlight class to the target element
    addHighlightToElement(targetElement as HTMLElement, highlightId);

    const newSelection: HighlightedText = {
      id: highlightId,
      text: selectedText,
      range: selectionRange.cloneRange(),
      element: targetElement as HTMLElement,
      sourceMetadata,
    };

    setSelections(prev => {
      const updated = [...prev, newSelection];
      onSelectionChange?.(updated);
      return updated;
    });

    // Ensure tooltip is visible when we add a selection
    if (!showTooltip) {
      updateTooltipPosition();
      setShowTooltip(true);
    }

    event.preventDefault();
    event.stopPropagation();
  }, [isActive, containerSelector, selections, generateHighlightId, addHighlightToElement, onSelectionChange]);

  // Add hover effects to highlightable text
  const handleMouseOver = useCallback((event: MouseEvent) => {
    if (!isActive) return;

    const target = event.target as Element;
    let container = target.closest(containerSelector);
    
    // If not found, try looking for any selectable content area
    if (!container) {
      container = target.closest('[data-message-container], .prose, [role="article"]');
    }
    
    if (!container) return;

    // Add hover class to the actual text element, not the container
    const textElement = target.closest('p, div, span') as HTMLElement;
    if (textElement && !textElement.classList.contains('highlight-mode-selected')) {
      textElement.classList.add('highlight-mode-hover');
    }
  }, [isActive, containerSelector]);

  const handleMouseOut = useCallback((event: MouseEvent) => {
    if (!isActive) return;

    const target = event.target as Element;
    const textElement = target.closest('p, div, span') as HTMLElement;
    if (textElement) {
      textElement.classList.remove('highlight-mode-hover');
    }
  }, [isActive]);

  // Update tooltip position beside the chat interface
  const updateTooltipPosition = useCallback(() => {
    // Try to find the chat container
    const chatContainer = document.querySelector('[data-message-container]')?.closest('[class*="flex"]') ||
                         document.querySelector('[data-message-container]')?.parentElement ||
                         document.querySelector('.prose')?.closest('[class*="w-"]') ||
                         document.querySelector('main') ||
                         document.querySelector('[role="main"]');
    
    if (chatContainer) {
      const rect = chatContainer.getBoundingClientRect();
      
      const tooltipWidth = 384; // w-96
      const padding = 20;
      
      // Position to the left of chat with fallback to right
      let left = rect.left - tooltipWidth - padding;
      const top = Math.max(100, rect.top + 50); // Stay near top of chat
      
      // If not enough space on left, position on right
      if (left < padding) {
        left = rect.right + padding;
      }
      
      // Ensure it stays within viewport
      const maxLeft = window.innerWidth - tooltipWidth - padding;
      left = Math.min(left, maxLeft);
      
      const finalPosition = { top, left };
      setTooltipPosition(finalPosition);
    } else {
      // Fallback: position near the right side of screen where chat usually is
      const fallbackPosition = {
        top: 120,
        left: Math.max(50, window.innerWidth - 450), // Position towards right side
      };
      setTooltipPosition(fallbackPosition);
    }
  }, []);

  // Clear all selections
  const clearAllSelections = useCallback(() => {
    selections.forEach(selection => {
      removeHighlightFromElement(selection.element);
    });
    setSelections([]);
    setShowTooltip(false);
    onSelectionChange?.([]);
  }, [selections, removeHighlightFromElement, onSelectionChange]);

  // Handle content generation
  const handleGenerateContent = useCallback((selectionsToGenerate: HighlightedText[], userInstructions?: string) => {
    if (selectionsToGenerate.length === 0) {
      return;
    }
    
    onGenerateContent?.(selectionsToGenerate, userInstructions);
    
    // Clear all selections and hide tooltip after generation
    clearAllSelections();
    setShowTooltip(false);
    
    // Exit highlight mode after generating content for better UX
    onModeExit?.();
  }, [onGenerateContent, clearAllSelections, onModeExit]);

  // Set up event listeners
  useEffect(() => {
    if (!isActive) {
      return;
    }

    document.addEventListener('click', handleTextClick, true);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      document.removeEventListener('click', handleTextClick, true);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, [isActive, handleTextClick, handleMouseOver, handleMouseOut]);

  // Update tooltip position when selections change
  useEffect(() => {
    if (selections.length > 0 && showTooltip) {
      updateTooltipPosition();
    }
  }, [selections, showTooltip, updateTooltipPosition]);

  // Clean up on mode exit
  useEffect(() => {
    if (!isActive) {
      if (selections.length > 0) {
        clearAllSelections();
      }
      // Force reset tooltip state
      setShowTooltip(false);
    }
  }, [isActive, selections.length, clearAllSelections]);

  // Ensure all selections maintain their highlights
  useEffect(() => {
    selections.forEach((selection, index) => {
      if (selection.element && !selection.element.classList.contains('highlight-mode-selected')) {
        addHighlightToElement(selection.element, selection.id);
      }
    });
  }, [selections, addHighlightToElement]);

  // Show tooltip when highlight mode is active or when selections exist
  useEffect(() => {
    if (isActive) {
      // Always show tooltip when highlight mode is active
      setShowTooltip(true);
      updateTooltipPosition();
    } else {
      // Hide tooltip when highlight mode is inactive
      setShowTooltip(false);
    }
  }, [isActive, updateTooltipPosition]); // Removed showTooltip and selections.length dependencies to avoid circular updates

  // Update tooltip position when highlight mode becomes active
  useEffect(() => {
    if (isActive) {
      updateTooltipPosition();
    }
  }, [isActive, updateTooltipPosition]);

  return (
    <HighlightModeTooltip
      selections={selections}
      position={tooltipPosition}
      show={showTooltip && isActive}
      onGenerateContent={handleGenerateContent}
      onClearAll={clearAllSelections}
      onClose={() => setShowTooltip(false)}
    />
  );
};