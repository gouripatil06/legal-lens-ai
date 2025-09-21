"use client";

import React, { useState, useRef, KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  className?: string;
  disabled?: boolean;
}

export function TagsInput({
  value = [],
  onChange,
  placeholder = "Add a topic and press Enter...",
  maxTags = 20,
  className,
  disabled = false
}: TagsInputProps) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (!trimmedTag) return;

    // Avoid duplicates
    if (value.includes(trimmedTag)) return;

    // Check max tags limit
    if (value.length >= maxTags) return;

    onChange([...value, trimmedTag]);
    setInputValue('');
  };

  const removeTag = (indexToRemove: number) => {
    onChange(value.filter((_, index) => index !== indexToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  const handleInputBlur = () => {
    if (inputValue.trim()) {
      addTag(inputValue);
    }
  };

  return (
    <div className={cn(
      "flex flex-wrap gap-2 p-3 border border-border rounded-xl bg-card/50 backdrop-blur-sm focus-within:ring-2 focus-within:ring-brand/50 focus-within:border-brand transition-all",
      disabled && "opacity-50 cursor-not-allowed",
      className
    )}>
      {/* Existing tags */}
      {value.map((tag, index) => (
        <span
          key={index}
          className="inline-flex items-center gap-1 px-3 py-1 bg-muted text-brand rounded-full text-sm font-medium"
        >
          <span>{tag}</span>
          {!disabled && (
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="hover:bg-brand/30 rounded-full p-0.5 transition-colors"
              aria-label={`Remove ${tag}`}
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </span>
      ))}

      {/* Input for new tags */}
      {!disabled && value.length < maxTags && (
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleInputBlur}
          placeholder={value.length === 0 ? placeholder : "Add another..."}
          className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-foreground placeholder-muted-foreground text-sm"
          disabled={disabled}
        />
      )}

      {/* Max tags indicator */}
      {value.length >= maxTags && (
        <span className="text-xs text-muted-foreground py-1">
          Maximum {maxTags} topics
        </span>
      )}
    </div>
  );
}

// Dynamic topic suggestions for quick selection
interface DynamicTopicPresetsProps {
  onSelect: (topic: string) => void;
  selectedTopics: string[];
  suggestedTopics: string[];
  onRefresh?: () => void;
  isLoading?: boolean;
  className?: string;
}

export function DynamicTopicPresets({ 
  onSelect, 
  selectedTopics, 
  suggestedTopics, 
  onRefresh, 
  isLoading = false, 
  className 
}: DynamicTopicPresetsProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Quick add:</p>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="text-xs text-brand hover:text-brand-hover disabled:opacity-50"
          >
            {isLoading ? "Generating..." : "Refresh"}
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-7 w-16 bg-muted rounded-md animate-pulse"
            />
          ))
        ) : suggestedTopics.length > 0 ? (
          suggestedTopics.map((topic) => {
            const isSelected = selectedTopics.includes(topic);
            return (
              <button
                key={topic}
                type="button"
                onClick={() => !isSelected && onSelect(topic)}
                disabled={isSelected}
                className={cn(
                  "px-2 py-1 text-xs rounded-md border transition-colors",
                  isSelected
                    ? "bg-brand/20 text-brand border-brand/30 cursor-not-allowed opacity-50"
                    : "bg-muted text-foreground border-border hover:bg-muted/80 hover:border-border/80"
                )}
              >
                {topic}
              </button>
            );
          })
        ) : (
          <p className="text-xs text-muted-foreground">No suggestions available</p>
        )}
      </div>
    </div>
  );
}

// Legacy component for backward compatibility
interface TopicPresetsProps {
  onSelect: (topic: string) => void;
  selectedTopics: string[];
  className?: string;
}

export function TopicPresets({ onSelect, selectedTopics, className }: TopicPresetsProps) {
  const presetTopics = [
    "AI/ML", "Startups", "Investing",
    "Marketing", "Social Media", "Content Creation", "Branding",
    "Web3", "Blockchain",
    "Fitness", "Gaming",
    "Education"
  ];

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-sm text-muted-foreground">Quick add:</p>
      <div className="flex flex-wrap gap-2">
        {presetTopics.map((topic) => {
          const isSelected = selectedTopics.includes(topic);
          return (
            <button
              key={topic}
              type="button"
              onClick={() => !isSelected && onSelect(topic)}
              disabled={isSelected}
              className={cn(
                "px-2 py-1 text-xs rounded-md border transition-colors",
                isSelected
                  ? "bg-brand/20 text-brand border-brand/30 cursor-not-allowed opacity-50"
                  : "bg-muted text-foreground border-border hover:bg-muted/80 hover:border-border/80"
              )}
            >
              {topic}
            </button>
          );
        })}
      </div>
    </div>
  );
}