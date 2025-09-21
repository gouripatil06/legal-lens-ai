import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface AnimatedLoadingTextProps {
  duration?: number; // Duration in milliseconds
}

const knowledgeLoadingMessages = [
  "Scanning uploaded documents...",
  "Extracting key information...",
  "Processing data structures...",
  "Indexing content segments...",
  "Building knowledge graph...",
  "Organizing information hierarchy...",
];

const AnimatedLoadingText: React.FC<AnimatedLoadingTextProps> = ({ duration = 60000 }) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const startTime = Date.now();
    let timeoutId: NodeJS.Timeout;

    // Function to set next message with variable timing
    const scheduleNextMessage = () => {
      // Random interval between 4-7 seconds for more natural timing
      const nextInterval = Math.floor(Math.random() * 3000) + 4000;

      timeoutId = setTimeout(() => {
        // Check if we've exceeded the total duration
        if (Date.now() - startTime >= duration) {
          setIsActive(false);
          return;
        }

        setCurrentMessageIndex((prevIndex) =>
          (prevIndex + 1) % knowledgeLoadingMessages.length
        );

        // Schedule the next message
        scheduleNextMessage();
      }, nextInterval);
    };

    // Start the cycle
    scheduleNextMessage();

    // Cleanup
    return () => clearTimeout(timeoutId);
  }, [duration]);

  if (!isActive) return null;

  return (
    <div className="relative h-8 flex justify-center items-center overflow-hidden">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={currentMessageIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="absolute w-full text-gray-400 text-sm"
        >
          {knowledgeLoadingMessages[currentMessageIndex]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AnimatedLoadingText;
