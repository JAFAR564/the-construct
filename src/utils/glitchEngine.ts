const GLITCH_CHARS = ['█', '▓', '░', '▒', '╳', '◈', '◇', '▪'];

export function getRandomGlitchChars(count: number): string {
    let result = '';
    for (let i = 0; i < count; i++) {
        result += GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
    }
    return result;
}

export function glitchText(text: string, intensity: number): string {
    if (intensity <= 0) return text;

    let glitched = '';
    for (let i = 0; i < text.length; i++) {
        if (text[i] === ' ' || text[i] === '\n') {
            glitched += text[i];
        } else if (Math.random() < intensity) {
            glitched += GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
        } else {
            glitched += text[i];
        }
    }
    return glitched;
}
