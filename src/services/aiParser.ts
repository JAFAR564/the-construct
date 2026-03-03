import type { ChatMessage, StatChange, Quest, Choice } from '@/types';
import type { APIResponse } from '@/services/client';

export function parseAIResponse(raw: APIResponse): { messages: ChatMessage[], statChanges: StatChange[], questUpdate: Partial<Quest> | null, choices: Choice[] } {
    const result = {
        messages: [] as ChatMessage[],
        statChanges: [] as StatChange[],
        questUpdate: null as Partial<Quest> | null,
        choices: [] as Choice[]
    };

    if (!raw || !raw.success) {
        result.messages.push({
            id: Date.now().toString(),
            source: 'SYSTEM',
            content: raw?.error || 'CRITICAL ERROR: NEURAL LINK SEVERED.',
            timestamp: new Date().toISOString()
        });
        return result;
    }

    const { data } = raw;

    if (data.narrative) {
        result.messages.push({
            id: Date.now().toString(),
            source: 'AI_DM',
            content: data.narrative,
            timestamp: new Date().toISOString(),
            glitch: data.glitch,
            choices: data.choices || []
        });
    }

    if (data.choices) result.choices = data.choices;
    if (data.statChanges) result.statChanges = data.statChanges;
    if (data.questUpdate) result.questUpdate = data.questUpdate;

    return result;
}
