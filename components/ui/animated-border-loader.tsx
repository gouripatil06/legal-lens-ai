import React, { useState, useEffect, useRef, Fragment } from 'react';
import { cn } from "@/lib/utils";

interface AnimatedBorderProps {
    children: React.ReactNode;
    isAnimating?: boolean;
    className?: string;
    pace?: number; // Controls the speed of the animation (default: 1)
    loadingTexts?: string[]; // Array of loading texts to cycle through
    showLoadingText?: boolean; // Controls whether to show the loading text at the bottom
}

const defaultLoadingTexts = [
    "Researching latest trends...",
    "Analyzing social data...",
    "Crafting engaging content...",
    "Optimizing for engagement...",
    "Finding relevant hashtags...",
    "Checking trending topics...",
    "Generating insights...",
    "Preparing your content..."
];

const AnimatedBorder = ({ 
    children, 
    isAnimating = false, 
    className, 
    pace = 1,
    loadingTexts = defaultLoadingTexts,
    showLoadingText = true
}: AnimatedBorderProps) => {
    const [currentTextIndex, setCurrentTextIndex] = useState(0);
    const animationRef = useRef<SVGRectElement>(null);
    const animationDuration = 15 / pace; // in seconds
    
    // Handle animation end to change text
    useEffect(() => {
        if (!isAnimating) return;
        
        const handleAnimationIteration = () => {
            setCurrentTextIndex(prev => (prev + 1) % loadingTexts.length);
        };
        
        const rectElement = animationRef.current;
        if (rectElement) {
            rectElement.addEventListener('animationiteration', handleAnimationIteration);
            
            return () => {
                rectElement.removeEventListener('animationiteration', handleAnimationIteration);
            };
        }
    }, [isAnimating, loadingTexts.length]);
    
    useEffect(() => {
        // Add the animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes progressDash {
                    0% {
                        stroke-dasharray: 1 2000;
                        stroke-dashoffset: 0;
                    }
                    10% {  /* Fast initial progress (first 10% of time) */
                        stroke-dasharray: 300 2000;  /* 40% of total progress */
                        stroke-dashoffset: 0;
                    }
                    50% {  /* Very slow for most of remaining time */
                        stroke-dasharray: 800 2000;
                        stroke-dashoffset: 0;
                    }
                    90% {  /* Very slow for most of remaining time */
                        stroke-dasharray: 1500 2000;
                        stroke-dashoffset: 0;
                    }
                    100% {
                        stroke-dasharray: 1950 2000;
                        stroke-dashoffset: 0;
                    }
            }
            
            .animate-progress-dash {
                animation: progressDash calc(15s / var(--pace)) cubic-bezier(1, 0, 0, 1) infinite;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

    return (
        <div className={cn("relative", className)}>
            {/* Dark background border */}
            <div className="absolute inset-0 border border-gray-800 rounded-lg"></div>

            {/* Animated border */}
            {isAnimating && (
                <>
                    <div className="absolute inset-0 rounded-lg overflow-hidden">
                        <svg width="100%" height="100%" className="absolute inset-0" style={{ "--pace": pace } as React.CSSProperties}>
                            <defs>
                                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                    <feGaussianBlur stdDeviation="2" result="blur" />
                                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#ff6b00" />
                                    <stop offset="50%" stopColor="#ff9500" />
                                    <stop offset="100%" stopColor="#ffa726" />
                                </linearGradient>
                            </defs>
                            <rect
                                ref={animationRef}
                                x="0"
                                y="0"
                                width="100%"
                                height="100%"
                                fill="none"
                                strokeWidth="2"
                                stroke="url(#gradient)"
                                className="animate-progress-dash"
                                rx="6"
                                ry="6"
                                filter="url(#glow)"
                            />
                        </svg>
                    </div>
                    
                    {/* Loading spinner and text at bottom */}
                    {showLoadingText && (
                        <div className="absolute -bottom-8 left-0 right-0 flex items-center justify-center gap-2 text-xs text-gray-400">
                            <div className="animate-spin h-3 w-3">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                            <span className="transition-opacity duration-300">{loadingTexts[currentTextIndex]}</span>
                        </div>
                    )}
                </>
            )}

            {/* Content */}
            <div className="relative">
                {children}
            </div>
        </div>
    );
};

export default AnimatedBorder;