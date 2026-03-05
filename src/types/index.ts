export type Faction = 'TECHNOCRATS' | 'KEEPERS_OF_THE_VEIL' | 'IRONBORN_COLLECTIVE';

export type Rank = 'INITIATE' | 'OPERATIVE' | 'SPECIALIST' | 'SENTINEL' | 'WARDEN' | 'COMMANDER' | 'OVERLORD' | 'SOVEREIGN';

export type CoreSkill = 'HACKING' | 'COMBAT' | 'DIPLOMACY' | 'SURVIVAL' | 'ARCANA' | 'ENGINEERING';

export type ElementalAffinity = 'FIRE' | 'ICE' | 'LIGHTNING' | 'VOID' | 'NATURE' | 'CHRONO';

export type QuestType = 'STORY_ARC' | 'DAILY_CONTRACT' | 'WEEKLY_BOUNTY' | 'ANOMALY_EVENT';

export type QuestStatus = 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'EXPIRED';

export type MessageSource = 'SYSTEM' | 'ARCHITECT' | 'AI_DM' | 'NPC' | 'ANOMALY';

// === EQUIPMENT & ABILITIES ===

export type EquipmentSlot =
  | 'WEAPON'
  | 'ARMOR'
  | 'ACCESSORY'
  | 'COMPANION'
  | 'IMPLANT'
  | 'RELIC';

export type Rarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export type AbilityCategory = 'OFFENSIVE' | 'DEFENSIVE' | 'UTILITY' | 'PASSIVE';

export interface Equipment {
  id: string;
  name: string;
  slot: EquipmentSlot;
  rarity: Rarity;
  description: string;
  stats: Partial<Record<CoreSkill, number>>;
  lore: string;
  acquiredAt: string;
  source: string;
}

export interface Ability {
  id: string;
  name: string;
  category: AbilityCategory;
  description: string;
  levelRequired: number;
  cooldown: string;
  cost: string;
  effect: string;
  unlocked: boolean;
}

export type Alignment =
  | 'LAWFUL_GOOD'
  | 'NEUTRAL_GOOD'
  | 'CHAOTIC_GOOD'
  | 'LAWFUL_NEUTRAL'
  | 'TRUE_NEUTRAL'
  | 'CHAOTIC_NEUTRAL'
  | 'LAWFUL_EVIL'
  | 'NEUTRAL_EVIL'
  | 'CHAOTIC_EVIL';

export interface CharacterProfile {
  backstory: string;
  alignment: Alignment;
  strengths: string[];
  weaknesses: string[];
  allies: string[];
  enemies: string[];
  personalMotto: string;
  themeSong: string;
  memoryLog: MemoryLogEntry[];
  privacyLevel: 'public' | 'faction_only' | 'private';
}

export interface MemoryLogEntry {
  id: string;
  timestamp: string;
  event: string;
  type: 'quest' | 'combat' | 'discovery' | 'social' | 'achievement';
}

export interface UserSettings {
  soundEnabled: boolean;
  scanlineIntensity: number;
  crtFlicker: boolean;
  textSpeed: number;
  themeIntensity: 'subtle' | 'balanced' | 'maximum';
}

export interface User {
  id: string;
  designation: string;
  faction: Faction;
  rank: Rank;
  prestige: number;
  xp: number;
  xpToNextRank: number;
  currentSector: number;
  skills: Record<CoreSkill, number>;
  primaryElement: ElementalAffinity;
  secondaryElement: ElementalAffinity | null;
  titles: string[];
  joinedAt: string;
  lastActiveAt: string;
  settings: UserSettings;
  equipment: Equipment[];
  equippedItems: Partial<Record<EquipmentSlot, string>>;
  abilities: Ability[];
  characterProfile: CharacterProfile;
  avatarDataUrl?: string;
  level: number;
  xpToNextLevel: number;
  totalXP: number;
}

export interface Choice {
  key: string;
  label: string;
  disabled?: boolean;
}

export interface StatChange {
  stat: CoreSkill | 'XP' | 'PRESTIGE';
  delta: number;
}

export interface ChatMessage {
  id: string;
  source: MessageSource;
  content: string;
  timestamp: string;
  choices?: Choice[];
  statChanges?: StatChange[];
  glitch?: boolean;
}

export interface Reward {
  type: 'XP' | 'PRESTIGE' | 'SKILL' | 'TITLE' | 'ITEM';
  value: number | string;
  skill?: CoreSkill;
}

export type QuestDifficulty = 'TRIVIAL' | 'EASY' | 'MEDIUM' | 'HARD' | 'LEGENDARY';

export interface QuestOption {
  id: string;
  label: string;
  alignment: Alignment;
  skillCheck?: CoreSkill;
  skillThreshold?: number;
  description: string;
}

export interface QuestChoice {
  id: string;
  stageIndex: number;
  prompt: string;
  options: QuestOption[];
  chosenOption?: string;
  consequence?: string;
}

export interface QuestNPC {
  designation: string;
  faction: Faction;
  role: 'quest_giver' | 'ally' | 'enemy' | 'neutral' | 'betrayer';
  personality: string;
  dialogue: string[];
}

export interface QuestBranch {
  id: string;
  condition: string;
  description: string;
  resultStages: number;
}

export interface Quest {
  id: string;
  type: QuestType;
  title: string;
  description: string;
  sector: number;
  status: QuestStatus;
  currentStage: number;
  totalStages: number;
  rewards: Reward[];
  expiresAt?: string;
  completedAt?: string;
  difficulty: QuestDifficulty;
  questGiver: QuestNPC;
  choices: QuestChoice[];
  npcsInvolved: QuestNPC[];
  branches: QuestBranch[];
  alignmentShift: Partial<Record<Alignment, number>>;
  narrative: string[];
  isChainQuest: boolean;
  chainId?: string;
  chainPosition?: number;
  failConsequence?: string;
  stageViewed: boolean[];
}

export type SectorTerrain = 'urban' | 'wasteland' | 'forest' | 'underground' | 'aquatic' | 'void' | 'mountain' | 'ruins';
export type SectorWeather = 'clear' | 'rain' | 'storm' | 'fog' | 'sandstorm' | 'anomaly';

export interface PointOfInterest {
  id: string;
  name: string;
  type: 'dungeon' | 'settlement' | 'landmark' | 'anomaly' | 'vendor';
  discovered: boolean;
  description: string;
}

export interface Sector {
  id: number;
  name: string;
  controlledBy: Faction | null;
  threatLevel: number;
  activeEvents: string[];
  description: string;
  terrain: SectorTerrain;
  weather: SectorWeather;
  resources: string[];
  npcsPresent: string[];
  discovered: boolean;
  adjacentSectors: number[];
  pointsOfInterest: PointOfInterest[];
}

export interface FactionStatus {
  faction: Faction;
  totalPower: number;
  sectorsControlled: number;
  memberCount: number;
  weeklyChange: number;
}

export interface LeaderboardEntry {
  rank: number;
  designation: string;
  faction: Faction;
  playerRank: Rank;
  prestige: number;
  isCurrentUser: boolean;
}

// === CHAT CHANNELS ===

export type ChannelType = 'general' | 'combat' | 'roleplay' | 'announcements' | 'whisper';

export interface ChatChannel {
  id: string;
  name: string;
  type: ChannelType;
  description: string;
  faction: Faction | 'GLOBAL';
  messages: ChannelMessage[];
  pinnedMessages: string[];
  isLocked: boolean;
}

export interface ChannelMessage {
  id: string;
  channelId: string;
  userId: string;
  designation: string;
  faction: Faction;
  rank: Rank;
  content: string;
  timestamp: string;
  reactions: Record<string, string[]>;
  replyTo?: string;
  isNPC: boolean;
  isPinned: boolean;
}

// === COMBAT SYSTEM ===

export type CombatStatus = 'SETUP' | 'ACTIVE' | 'JUDGING' | 'COMPLETE';

export interface CombatSession {
  id: string;
  channelId: string;
  status: CombatStatus;
  participants: CombatParticipant[];
  rounds: CombatRound[];
  currentRound: number;
  maxRounds: number;
  environment: string;
  environmentModifiers: string[];
  aiJudgeEnabled: boolean;
  winner?: string;
  rewards?: Reward[];
  startedAt: string;
  completedAt?: string;
}

export interface CombatParticipant {
  userId: string;
  designation: string;
  faction: Faction;
  hp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
  status: 'active' | 'defeated' | 'fled';
}

export interface CombatRound {
  roundNumber: number;
  actions: CombatAction[];
  aiJudgment?: string;
  environmentEvent?: string;
}

export interface CombatAction {
  userId: string;
  designation: string;
  action: string;
  timestamp: string;
  aiAnalysis?: string;
  damage?: number;
  statUsed?: CoreSkill;
}
