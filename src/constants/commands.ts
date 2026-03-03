export interface Command {
    command: string;
    description: string;
    action: string;
}

export const COMMANDS: Command[] = [
    { command: '/quest', description: 'View current active directive', action: 'quest_view' },
    { command: '/quests', description: 'Open directive log', action: 'navigate_quests' },
    { command: '/scan', description: 'Scan local sector for anomalies', action: 'scan_sector' },
    { command: '/stats', description: 'Display Architect dossier', action: 'show_stats' },
    { command: '/faction', description: 'Display current faction status', action: 'show_faction' },
    { command: '/lore', description: 'Query archives for context', action: 'query_lore' },
    { command: '/map', description: 'Open the Grid map', action: 'navigate_map' },
    { command: '/help', description: 'List available commands', action: 'show_help' },
    { command: '/clear', description: 'Clear terminal output', action: 'clear_terminal' }
];
