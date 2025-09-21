'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TypewriterTextProps {
  text: string;
  speed?: number; // milliseconds per word
  className?: string;
  onComplete?: () => void;
  startDelay?: number;
  showCursor?: boolean;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 80,
  className = '',
  onComplete,
  startDelay = 0,
  showCursor = true,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showTypingCursor, setShowTypingCursor] = useState(true);

  // Split text into words for more natural typing effect
  const words = text.split(' ');

  useEffect(() => {
    if (currentIndex < words.length) {
      const timer = setTimeout(() => {
        const newWord = words[currentIndex];
        const separator = currentIndex === 0 ? '' : ' ';
        
        setDisplayedText(prev => prev + separator + newWord);
        setCurrentIndex(prev => prev + 1);
      }, currentIndex === 0 ? startDelay : speed);

      return () => clearTimeout(timer);
    } else if (currentIndex === words.length && !isComplete) {
      setIsComplete(true);
      setShowTypingCursor(false);
      onComplete?.();
    }
  }, [currentIndex, words, speed, startDelay, isComplete, onComplete]);

  // Reset when text changes
  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
    setIsComplete(false);
    setShowTypingCursor(true);
  }, [text]);

  return (
    <div className={`relative ${className}`}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="inline"
      >
        {displayedText}
        <AnimatePresence>
          {showCursor && showTypingCursor && (
            <motion.span
              initial={{ opacity: 1 }}
              animate={{ opacity: [1, 0] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
              className="inline-block w-0.5 h-5 bg-current ml-1 align-text-bottom"
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

// Component for animating markdown-rendered content
interface AnimatedMarkdownProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  onComplete?: () => void;
}

export const AnimatedMarkdown: React.FC<AnimatedMarkdownProps> = ({
  children,
  delay = 0,
  className = '',
  onComplete,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      // Call onComplete after animation finishes
      setTimeout(() => onComplete?.(), 1000);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
      transition={{
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// For streaming-like word reveal effect
interface StreamingTextProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

export const StreamingText: React.FC<StreamingTextProps> = ({
  text,
  speed = 50,
  className = '',
  onComplete,
}) => {
  const [visibleWords, setVisibleWords] = useState(0);
  const words = text.split(' ');

  useEffect(() => {
    if (visibleWords < words.length) {
      const timer = setTimeout(() => {
        setVisibleWords(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (visibleWords === words.length) {
      onComplete?.();
    }
  }, [visibleWords, words.length, speed, onComplete]);

  // Reset when text changes
  useEffect(() => {
    setVisibleWords(0);
  }, [text]);

  return (
    <div className={className}>
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          initial={{ opacity: 0, y: 5 }}
          animate={
            index < visibleWords
              ? { opacity: 1, y: 0 }
              : { opacity: 0, y: 5 }
          }
          transition={{
            duration: 0.3,
            ease: 'easeOut',
          }}
          className="inline-block mr-1"
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
};