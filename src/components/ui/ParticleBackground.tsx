import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/hooks/useTheme';

interface Particle {
    id: number;
    x: number;
    y: number;
    char: string;
    opacity: number;
    speed: number;
    size: number;
}

const PARTICLE_CHARS: Record<string, string[]> = {
    runes: ['◈', '◇', '△', '☽', '✦', '⟡', '᛭', '⚶'],
    rain: ['│', '┃', '╎', '╏', '║'],
    sparks: ['·', '•', '∘', '⋅', '✧'],
    gears: ['⚙', '⟐', '◎', '⊕', '⊗'],
    void: ['◉', '○', '◌', '◯', '⊙'],
};

export function ParticleBackground() {
    const theme = useTheme();
    const [particles, setParticles] = useState<Particle[]>([]);
    const frameRef = useRef<number | undefined>(undefined);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const chars = PARTICLE_CHARS[theme.particleType] || PARTICLE_CHARS.runes;
        const count = 25; // Keep it subtle

        // Initialize particles
        const initial: Particle[] = Array.from({ length: count }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            char: chars[Math.floor(Math.random() * chars.length)],
            opacity: Math.random() * 0.15 + 0.03, // Very subtle: 0.03 to 0.18
            speed: Math.random() * 0.3 + 0.1,
            size: Math.random() * 6 + 10,
        }));
        setParticles(initial);

        // Animation loop
        let lastTime = Date.now();
        const animate = () => {
            const now = Date.now();
            const delta = (now - lastTime) / 1000;
            lastTime = now;

            setParticles(prev => prev.map(p => {
                let newY = p.y;
                let newX = p.x;
                let newOpacity = p.opacity;

                switch (theme.particleType) {
                    case 'rain':
                        newY = p.y + p.speed * delta * 30;
                        if (newY > 105) {
                            newY = -5;
                            newX = Math.random() * 100;
                        }
                        break;
                    case 'runes':
                        newY = p.y - p.speed * delta * 8;
                        newX = p.x + Math.sin(Date.now() * 0.001 + p.id) * 0.02;
                        if (newY < -5) {
                            newY = 105;
                            newX = Math.random() * 100;
                        }
                        break;
                    case 'sparks':
                        newOpacity = Math.abs(Math.sin(Date.now() * 0.003 + p.id * 0.7)) * 0.15;
                        newX = p.x + (Math.random() - 0.5) * 0.1;
                        newY = p.y - p.speed * delta * 5;
                        if (newY < -5) {
                            newY = 105;
                            newX = Math.random() * 100;
                        }
                        break;
                    case 'gears':
                        // Gears drift slowly sideways
                        newX = p.x + Math.sin(Date.now() * 0.0005 + p.id) * 0.03;
                        newY = p.y + p.speed * delta * 2;
                        if (newY > 105) {
                            newY = -5;
                            newX = Math.random() * 100;
                        }
                        break;
                    case 'void':
                        newOpacity = Math.abs(Math.sin(Date.now() * 0.001 + p.id * 1.3)) * 0.12;
                        break;
                }

                return { ...p, x: newX, y: newY, opacity: newOpacity };
            }));

            frameRef.current = requestAnimationFrame(animate);
        };

        frameRef.current = requestAnimationFrame(animate);

        return () => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, [theme.particleType]);

    return (
        <div
            ref={containerRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 1,
                overflow: 'hidden',
            }}
            aria-hidden="true"
        >
            {particles.map(p => (
                <span
                    key={p.id}
                    style={{
                        position: 'absolute',
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        color: theme.primary,
                        opacity: p.opacity,
                        fontSize: `${p.size}px`,
                        fontFamily: 'var(--font-mono)',
                        transition: 'none',
                        willChange: 'transform, opacity',
                        userSelect: 'none',
                    }}
                >
                    {p.char}
                </span>
            ))}
        </div>
    );
}
