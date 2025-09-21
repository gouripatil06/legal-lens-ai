import React from 'react';

interface AnimatedBorderProps {
  children: React.ReactNode;
  className?: string;
}

const AnimatedBorder = ({ children, className = '' }: AnimatedBorderProps) => {
  return (
    <div className={`group relative ${className}`}>
      {/* Animated border background */}
      <div
        className="absolute -inset-[3px] rounded-xl bg-gradient-to-r from-pink-500 via-teal-500 to-blue-500 opacity-75 blur-[2px] transition-all group-hover:opacity-100"
      />
      <div
        className="animate-border relative rounded-xl bg-gradient-to-r from-pink-500 via-teal-500 to-blue-500 bg-[length:400%_400%] p-[3px]"
      >
        {/* Content container */}
        <div className="relative rounded-xl bg-[#1E1E1E] overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AnimatedBorder;
