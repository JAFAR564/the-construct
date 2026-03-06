import React, { useState, useRef, useEffect } from 'react';
import './MessengerLayout.css';

interface MessengerInputProps {
    onSend: (value: string) => void;
    placeholder?: string;
    isCombatChannel?: boolean;
    isLocked?: boolean;
}

export const MessengerInput: React.FC<MessengerInputProps> = ({
    onSend, placeholder, isCombatChannel, isLocked,
}) => {
    const [input, setInput] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    if (isLocked) {
        return (
            <div className="msger-input--locked">
                🔒 This channel is read-only. Only faction leadership can post.
            </div>
        );
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && input.trim()) {
            onSend(input);
            setInput('');
        }
    };

    const handleSend = () => {
        if (!input.trim()) return;
        onSend(input);
        setInput('');
    };

    return (
        <div className="msger-input">
            {isCombatChannel && (
                <div className="msger-input__combat-hint">
                    ⚔️ COMBAT ARENA — Use /challenge, /attack, /defend, /flee
                </div>
            )}
            <div className="msger-input__bar">
                <span className="msger-input__prompt">&gt;</span>
                <input
                    ref={inputRef}
                    className="msger-input__field"
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder || 'Transmit...'}
                    autoComplete="off"
                    spellCheck={false}
                />
                <button className="msger-input__send" onClick={handleSend}>
                    SEND
                </button>
            </div>
        </div>
    );
};
