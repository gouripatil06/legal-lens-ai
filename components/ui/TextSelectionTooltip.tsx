'use client';

import React, { useEffect, useState } from 'react';
import { Button } from './button';
import { TextSelectionData } from '@/hooks/useTextSelection';
import { createPortal } from 'react-dom';

interface TextSelectionTooltipProps {
  selection: TextSelectionData;
  show: boolean;
  onGenerateContent: (selectionData: TextSelectionData) => void;
  onClose: () => void;
}

export const TextSelectionTooltip: React.FC<TextSelectionTooltipProps> = ({
  selection,
  show,
  onGenerateContent,
  onClose,
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [arrowDirection, setArrowDirection] = useState<'left' | 'right' | 'up' | 'down'>('right');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (show && selection) {
      // Calculate tooltip position
      const rect = selection.rect;
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;
      
      // Get viewport dimensions for boundary checking
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Tooltip approximate dimensions
      const tooltipWidth = 280; // min-w-64 + padding
      const tooltipHeight = 120; // approximate height
      
      // Calculate ideal position: left of selection, vertically centered
      let left = rect.left + scrollX - tooltipWidth - 12; // 12px gap from selection
      let top = rect.top + scrollY + (rect.height / 2) - (tooltipHeight / 2); // Center vertically
      let direction: 'left' | 'right' | 'up' | 'down' = 'right';
      
      // Boundary checks and adjustments
      if (left < 20) {
        // If tooltip would go off left edge, position to right of selection
        left = rect.right + scrollX + 12;
        direction = 'left';
        
        // If that would go off right edge, center it horizontally
        if (left + tooltipWidth > viewportWidth - 20) {
          left = Math.max(20, (viewportWidth - tooltipWidth) / 2);
          
          // Position above selection if centered
          if (rect.top + scrollY > tooltipHeight + 20) {
            top = rect.top + scrollY - tooltipHeight - 8;
            direction = 'down';
          } else {
            // Position below if not enough space above
            top = rect.bottom + scrollY + 8;
            direction = 'up';
          }
        }
      }
      
      // Ensure tooltip doesn't go off top/bottom of viewport
      if (top < scrollY + 20) {
        top = scrollY + 20;
      } else if (top + tooltipHeight > scrollY + viewportHeight - 20) {
        top = scrollY + viewportHeight - tooltipHeight - 20;
      }
      
      setPosition({ top, left });
      setArrowDirection(direction);
    }
  }, [show, selection]);

  const handleGenerateClick = () => {
    onGenerateContent(selection);
    onClose();
  };

  if (!mounted || !show || !selection) {
    return null;
  }

  const tooltip = (
    <div
      data-text-selection-tooltip
      className="fixed z-50 transform -translate-y-1/2 transition-all duration-200 ease-out"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        opacity: show ? 1 : 0,
        transform: show ? 'translateY(-50%) scale(1)' : 'translateY(-50%) scale(0.95)',
      }}
    >
      {/* Tooltip positioned to the left of selection */}
      <div className="relative">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl backdrop-blur-sm p-3 min-w-64 transition-all duration-200 hover:shadow-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Button
              size="sm"
              onClick={handleGenerateClick}
              className="h-8 px-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium whitespace-nowrap transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 19 7.5 19s3.332-.523 4.5-1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 19 17.5 19c-1.746 0-3.332-.523-4.5-1.253" />
              </svg>
              Generate Content
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0 transition-all duration-200 hover:scale-110 active:scale-90"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
          
          {/* Show selection preview */}
          <div className="text-xs text-gray-600 dark:text-gray-400">
            <div className="mb-1 font-medium">Selected text:</div>
            <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded text-gray-800 dark:text-gray-200 max-h-20 overflow-y-auto border border-gray-200 dark:border-gray-600 transition-colors duration-200">
&ldquo;{selection.text.length > 120 ? selection.text.substring(0, 120) + '...' : selection.text}&rdquo;
            </div>
            {selection.sourceMetadata?.sourceTitle && (
              <div className="text-gray-500 dark:text-gray-500 mt-2 text-xs opacity-80 hover:opacity-100 transition-opacity duration-200">
                📄 From: {selection.sourceMetadata.sourceTitle}
              </div>
            )}
          </div>
        </div>
        
        {/* Dynamic arrow pointing to selection */}
        {arrowDirection === 'right' && (
          <div className="absolute top-1/2 left-full transform -translate-y-1/2">
            <div className="w-0 h-0 border-t-4 border-b-4 border-l-4 border-t-transparent border-b-transparent border-l-white dark:border-l-gray-800"></div>
            <div className="w-0 h-0 border-t-4 border-b-4 border-l-4 border-t-transparent border-b-transparent border-l-gray-200 dark:border-l-gray-700 -ml-1"></div>
          </div>
        )}
        
        {arrowDirection === 'left' && (
          <div className="absolute top-1/2 right-full transform -translate-y-1/2">
            <div className="w-0 h-0 border-t-4 border-b-4 border-r-4 border-t-transparent border-b-transparent border-r-white dark:border-r-gray-800"></div>
            <div className="w-0 h-0 border-t-4 border-b-4 border-r-4 border-t-transparent border-b-transparent border-r-gray-200 dark:border-r-gray-700 -mr-1"></div>
          </div>
        )}
        
        {arrowDirection === 'down' && (
          <div className="absolute left-1/2 top-full transform -translate-x-1/2">
            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white dark:border-t-gray-800"></div>
            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-200 dark:border-t-gray-700 -mt-1"></div>
          </div>
        )}
        
        {arrowDirection === 'up' && (
          <div className="absolute left-1/2 bottom-full transform -translate-x-1/2">
            <div className="w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-white dark:border-b-gray-800"></div>
            <div className="w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-gray-200 dark:border-b-gray-700 -mb-1"></div>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(tooltip, document.body);
};