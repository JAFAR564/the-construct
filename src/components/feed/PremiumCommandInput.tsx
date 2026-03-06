import React, { useState, useRef, useEffect } from 'react';
import { useSlashCommands } from '@/hooks/useSlashCommands';
import { SoundManager } from '@/utils/soundManager';
import '@/components/feed/FeedLayout.css';

interface Props {
    onSubmit: (value: string) => void;
    disabled?: boolean;
}

export const PremiumCommandInput: React.FC<Props> = ({ onSubmit, disabled }) => {
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
        <div className="premium-input-bar">
            {/* Autocomplete popup */}
            {showAutocomplete && (
                <div className="premium-input-bar__autocomplete">
                    {commands.map((cmd, idx) => (
                        <div
                            key={cmd.command}
                            className={`premium-input-bar__autocomplete-item ${idx === selectedIndex ? 'premium-input-bar__autocomplete-item--selected' : ''}`}
                            onClick={() => { onSubmit(cmd.command); setInput(''); }}
                        >
                            <span className="premium-input-bar__autocomplete-cmd">{cmd.command}</span>
                            <span className="premium-input-bar__autocomplete-desc">{cmd.description}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Input field */}
            <div className="premium-input-bar__inner">
                <span className="premium-input-bar__prompt">&gt;</span>
                <input
                    ref={inputRef}
                    type="text"
                    className="premium-input-bar__field"
                    value={input}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    placeholder="Type a command or message..."
                    autoComplete="off"
                    spellCheck={false}
                />
            </div>
        </div>
    );
};
