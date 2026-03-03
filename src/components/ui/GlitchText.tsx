import React, { useState, useEffect, useRef } from 'react';
import { glitchText } from '@/utils/glitchEngine';
import { SoundManager } from '@/utils/soundManager';

interface Props {
  text: string;
  intensity?: number;
  interval?: number;
  className?: string;
}

export const GlitchText: React.FC<Props> = ({ text, intensity = 0.3, interval = 150, className = '' }) => {
  const [displayText, setDisplayText] = useState(text);
  const [isGlitching, setIsGlitching] = useState(false);
  const lastGlitchSoundTime = useRef(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const active = Math.random() > 0.5;
      setIsGlitching(active);
      setDisplayText(active ? glitchText(text, active ? intensity * 2 : intensity) : text);

      if (active) {
        const now = Date.now();
        if (now - lastGlitchSoundTime.current > 2000) {
          SoundManager.playGlitch();
          lastGlitchSoundTime.current = now;
        }
      }
    }, interval);
    return () => clearInterval(timer);
  }, [text, intensity, interval]);

  return (
    <span className={className} style={{ color: isGlitching ? 'var(--accent-danger)' : 'inherit', textShadow: isGlitching ? '0 0 5px var(--accent-danger)' : 'inherit' }}>
      {displayText}
    </span>
  );
};
