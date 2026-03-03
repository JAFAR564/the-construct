import React from 'react';
import { useTypewriter } from '@/hooks/useTypewriter';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  mode?: 'character' | 'word';
  onComplete?: () => void;
  className?: string;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed,
  mode = 'character',
  onComplete,
  className = ''
}) => {
  const { displayedText, isComplete } = useTypewriter(text, speed, onComplete, mode);

  return (
    <span className={`terminal-glow ${className}`}>
      {displayedText}
      {!isComplete && <span style={{ animation: 'flicker 0.8s infinite' }}>█</span>}
    </span>
  );
};
