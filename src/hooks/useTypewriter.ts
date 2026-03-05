import { useState, useEffect, useRef } from 'react';

export function useTypewriter(
  text: string,
  speed: number = 30,
  onComplete?: () => void,
  mode: 'character' | 'word' = 'character'
) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setDisplayedText('');
    setIsComplete(false);

    if (text.length === 0) {
      setIsComplete(true);
      onComplete?.();
      return;
    }

    if (mode === 'word') {
      const words = text.split(/(\s+)/);
      let wordIndex = 0;

      timerRef.current = window.setInterval(() => {
        if (wordIndex < words.length) {
          setDisplayedText(prev => prev + words[wordIndex]);
          wordIndex++;
        } else {
          if (timerRef.current) clearInterval(timerRef.current);
          setIsComplete(true);
          onComplete?.();
        }
      }, speed);
    } else {
      let i = 0;
      timerRef.current = window.setInterval(() => {
        setDisplayedText(prev => prev + text.charAt(i));
        i++;
        if (i === text.length) {
          if (timerRef.current) clearInterval(timerRef.current);
          setIsComplete(true);
          onComplete?.();
        }
      }, speed);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [text, speed, mode, onComplete]);

  const skip = () => {
    if (isComplete) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setDisplayedText(text);
    setIsComplete(true);
    onComplete?.();
  };

  return { displayedText, isComplete, skip };
}
