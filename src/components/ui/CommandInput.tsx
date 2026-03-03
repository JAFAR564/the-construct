import React, { useState, useRef, useEffect } from 'react';
import { useSlashCommands } from '@/hooks/useSlashCommands';
import { SoundManager } from '@/utils/soundManager';

interface Props {
  onSubmit: (value: string) => void;
  disabled?: boolean;
}

export const CommandInput: React.FC<Props> = ({ onSubmit, disabled }) => {
  const [input, setInput] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { filterCommands } = useSlashCommands();

  const commands = filterCommands(input);
  const showAutocomplete = commands.length > 0;

  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showAutocomplete) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => (i + 1) % commands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => (i - 1 + commands.length) % commands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onSubmit(commands[selectedIndex].command);
        setInput('');
      } else if (e.key === 'Escape') {
        setInput('');
      }
    } else if (e.key === 'Enter' && input.trim()) {
      onSubmit(input);
      setInput('');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setSelectedIndex(0);
    if (e.target.value.length > 0) {
      SoundManager.playKeystroke();
    }
  };

    return (
        <div style={{ position: 'relative', marginTop: 16 }}>
            {showAutocomplete && (
                <div style={{ position: 'absolute', bottom: '100%', left: 0, width: '100%', backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-terminal)', zIndex: 10 }}>
                    {commands.map((cmd, idx) => (
                        <div
                            key={cmd.command}
                            style={{ padding: '8px 12px', cursor: 'pointer', backgroundColor: idx === selectedIndex ? 'var(--bg-surface)' : 'transparent', color: idx === selectedIndex ? 'var(--text-primary)' : 'var(--text-muted)' }}
                            onClick={() => { onSubmit(cmd.command); setInput(''); }}
                        >
                            <strong>{cmd.command}</strong> - {cmd.description}
                        </div>
                    ))}
                </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', marginRight: 8, animation: 'flicker 1s infinite' }}>&gt;</span>
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    style={{ flex: 1, backgroundColor: 'transparent', border: 'none', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '1rem', outline: 'none' }}
                    autoComplete="off"
                    spellCheck="false"
                />
            </div>
        </div>
    );
};
