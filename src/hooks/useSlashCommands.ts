import { useNavigate } from 'react-router-dom';
import { COMMANDS } from '@/constants/commands';
import type { Command } from '@/constants/commands';
import { useGameStore } from '@/stores/useGameStore';

export function useSlashCommands() {
    const navigate = useNavigate();
    // We'll define clearMessages in useGameStore mapping
    const clearMessages = useGameStore(state => state.clearMessages);
    const addMessage = useGameStore(state => state.addMessage);

    const filterCommands = (input: string): Command[] => {
        if (!input.startsWith('/')) return [];
        const search = input.toLowerCase();
        return COMMANDS.filter(cmd => cmd.command.startsWith(search));
    };

    const executeCommand = (commandStr: string) => {
        const cmd = COMMANDS.find(c => c.command === commandStr.trim());
        if (!cmd) {
            addMessage({
                id: Date.now().toString(),
                source: 'SYSTEM',
                content: `Error: Command ${commandStr} not recognized.`,
                timestamp: new Date().toISOString()
            });
            return;
        }

        switch (cmd.action) {
            case 'quest_view':
            case 'navigate_quests':
                navigate('/quests');
                break;
            case 'scan_sector':
                addMessage({
                    id: Date.now().toString(),
                    source: 'SYSTEM',
                    content: 'Scanning sector... No anomalies detected.',
                    timestamp: new Date().toISOString()
                });
                break;
            case 'show_stats':
                navigate('/profile');
                break;
            case 'show_faction':
                navigate('/ranks');
                break;
            case 'query_lore':
                addMessage({
                    id: Date.now().toString(),
                    source: 'SYSTEM',
                    content: 'Lore databanks offline.',
                    timestamp: new Date().toISOString()
                });
                break;
            case 'navigate_map':
                navigate('/world');
                break;
            case 'clear_terminal':
                clearMessages();
                break;
            case 'show_help':
                addMessage({
                    id: Date.now().toString(),
                    source: 'SYSTEM',
                    content: 'Available Commands: ' + COMMANDS.map(c => c.command).join(', '),
                    timestamp: new Date().toISOString()
                });
                break;
        }
    };

    return { commands: COMMANDS, filterCommands, executeCommand };
}
