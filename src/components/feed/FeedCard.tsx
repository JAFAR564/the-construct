import React from 'react';
import { GlitchText } from '@/components/ui/GlitchText';
import type { ChatMessage, Choice, Quest, QuestChoice, QuestOption, User } from '@/types';
import { checkSkillRequirement } from '@/services/questGenerator';
import './FeedCard.css';

/* ────────── Source → Visual mappings ────────── */
const SOURCE_CONFIG: Record<string, {
  icon: string;
  label: string;
  accent: string;
  avatarBg: string;
  avatarBorder: string;
  avatarGlow: string;
  badgeBg: string;
  badgeColor: string;
  badgeBorder: string;
}> = {
  SYSTEM: {
    icon: '⚙',
    label: 'SYSTEM',
    accent: 'var(--text-secondary)',
    avatarBg: 'rgba(0,204,51,0.1)',
    avatarBorder: 'rgba(0,204,51,0.25)',
    avatarGlow: 'rgba(0,204,51,0.2)',
    badgeBg: 'rgba(0,204,51,0.1)',
    badgeColor: 'var(--text-secondary)',
    badgeBorder: 'rgba(0,204,51,0.2)',
  },
  ARCHITECT: {
    icon: '▶',
    label: 'YOU',
    accent: 'var(--accent-info)',
    avatarBg: 'rgba(0,191,255,0.1)',
    avatarBorder: 'rgba(0,191,255,0.25)',
    avatarGlow: 'rgba(0,191,255,0.2)',
    badgeBg: 'rgba(0,191,255,0.1)',
    badgeColor: 'var(--accent-info)',
    badgeBorder: 'rgba(0,191,255,0.2)',
  },
  AI_DM: {
    icon: '◆',
    label: 'CONSTRUCT AI',
    accent: 'var(--text-primary)',
    avatarBg: 'rgba(0,255,65,0.12)',
    avatarBorder: 'rgba(0,255,65,0.25)',
    avatarGlow: 'rgba(0,255,65,0.25)',
    badgeBg: 'rgba(0,255,65,0.1)',
    badgeColor: 'var(--text-primary)',
    badgeBorder: 'rgba(0,255,65,0.2)',
  },
  NPC: {
    icon: '◇',
    label: 'NPC',
    accent: 'var(--accent-info)',
    avatarBg: 'rgba(0,191,255,0.1)',
    avatarBorder: 'rgba(0,191,255,0.25)',
    avatarGlow: 'rgba(0,191,255,0.2)',
    badgeBg: 'rgba(0,191,255,0.1)',
    badgeColor: 'var(--accent-info)',
    badgeBorder: 'rgba(0,191,255,0.2)',
  },
  ANOMALY: {
    icon: '⚠',
    label: 'ANOMALY',
    accent: 'var(--accent-danger)',
    avatarBg: 'rgba(255,51,51,0.12)',
    avatarBorder: 'rgba(255,51,51,0.3)',
    avatarGlow: 'rgba(255,51,51,0.25)',
    badgeBg: 'rgba(255,51,51,0.1)',
    badgeColor: 'var(--accent-danger)',
    badgeBorder: 'rgba(255,51,51,0.2)',
  },
};

/* ────────── Time formatter ────────── */
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 10) return 'Just now';
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/* ────────── Interfaces ────────── */
interface FeedCardProps {
  message: ChatMessage;
  onChoice?: (choice: Choice) => void;
  animationDelay?: number;
}

interface QuestStatusCardProps {
  quest: Quest;
}

interface QuestDecisionCardProps {
  choice: QuestChoice;
  user: User;
  onChoose: (choiceId: string, optionId: string) => void;
}

interface LoadingCardProps {}

/* ────────── Main Feed Card ────────── */
export const FeedCard: React.FC<FeedCardProps> = ({ message, onChoice, animationDelay = 0 }) => {
  const config = SOURCE_CONFIG[message.source] || SOURCE_CONFIG.SYSTEM;
  const isGlitch = message.glitch || message.source === 'ANOMALY';
  const sourceClass = `feed-card--${message.source.toLowerCase()}`;

  const cssVars = {
    '--card-accent': config.accent,
    '--avatar-bg': config.avatarBg,
    '--avatar-color': config.accent,
    '--avatar-border': config.avatarBorder,
    '--avatar-glow': config.avatarGlow,
    '--badge-bg': config.badgeBg,
    '--badge-color': config.badgeColor,
    '--badge-border': config.badgeBorder,
    animationDelay: `${animationDelay}ms`,
  } as React.CSSProperties;

  return (
    <div className={`feed-card ${sourceClass}`} style={cssVars}>
      {/* Header */}
      <div className="feed-card__header">
        <div className="feed-card__avatar">{config.icon}</div>
        <div className="feed-card__meta">
          <div className="feed-card__author">
            {config.label}
            <span className="feed-card__badge">{message.source}</span>
          </div>
          <div className="feed-card__timestamp">{timeAgo(message.timestamp)}</div>
        </div>
      </div>

      {/* Body */}
      <div className="feed-card__body">
        {isGlitch ? <GlitchText text={message.content} /> : message.content}
      </div>

      {/* Stat change chips */}
      {message.statChanges && message.statChanges.length > 0 && (
        <div className="feed-card__stats">
          {message.statChanges.map((sc, i) => (
            <span
              key={i}
              className={`feed-card__stat-chip ${sc.delta >= 0 ? 'feed-card__stat-chip--positive' : 'feed-card__stat-chip--negative'}`}
            >
              {sc.delta >= 0 ? '▲' : '▼'} {sc.stat} {sc.delta >= 0 ? '+' : ''}{sc.delta}
            </span>
          ))}
        </div>
      )}

      {/* Choice buttons */}
      {onChoice && message.choices && message.choices.length > 0 && (
        <div className="feed-card__actions">
          {message.choices.map(c => (
            <button
              key={c.key}
              className="feed-card__action-btn"
              onClick={() => onChoice(c)}
              disabled={c.disabled}
            >
              <span className="feed-card__action-key">[{c.key}]</span>
              {c.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ────────── Quest Status Card (pinned directive) ────────── */
export const QuestStatusCard: React.FC<QuestStatusCardProps> = ({ quest }) => (
  <div className="feed-card feed-card--system" style={{ '--card-accent': 'var(--accent-warning)' } as React.CSSProperties}>
    <div className="feed-card__directive">
      <div className="feed-card__directive-label">DIRECTIVE UPDATE</div>
      <div className="feed-card__directive-title">[{quest.title}]</div>
      <div className="feed-card__directive-stage">
        Stage {quest.currentStage + 1} of {quest.totalStages}
      </div>
      {quest.currentStage < quest.totalStages && quest.narrative?.[quest.currentStage] && (
        <div className="feed-card__directive-narrative">
          {quest.narrative[quest.currentStage]}
        </div>
      )}
    </div>
  </div>
);

/* ────────── Quest Decision Card ────────── */
export const QuestDecisionCard: React.FC<QuestDecisionCardProps> = ({ choice, user, onChoose }) => (
  <div className="feed-card" style={{ '--card-accent': 'var(--accent-warning)' } as React.CSSProperties}>
    <div className="feed-card__quest-panel">
      <div className="feed-card__quest-label">⚠ DECISION REQUIRED</div>
      <div className="feed-card__quest-prompt">{choice.prompt}</div>
      <div className="feed-card__quest-options">
        {choice.options.map((option: QuestOption) => {
          const skillCheck = checkSkillRequirement(user, option);
          return (
            <button
              key={option.id}
              className={`feed-card__quest-option ${skillCheck.qualified ? 'feed-card__quest-option--qualified' : ''}`}
              onClick={() => onChoose(choice.id, option.id)}
            >
              <div>
                <div className="feed-card__quest-option-label">
                  [{option.id.toUpperCase()}] {option.label}
                </div>
                <div className="feed-card__quest-option-desc">{option.description}</div>
              </div>
              {option.skillCheck && (
                <span className={`feed-card__quest-check ${skillCheck.qualified ? 'feed-card__quest-check--pass' : 'feed-card__quest-check--fail'}`}>
                  {skillCheck.qualified ? '✓ QUALIFIED' : '✗ INSUFFICIENT'}{' '}
                  ({skillCheck.userLevel}/{option.skillThreshold} {option.skillCheck})
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="feed-card__quest-tip">
        Tip: You can attempt options you're not qualified for, but success chance is reduced.
      </div>
    </div>
  </div>
);

/* ────────── Loading Card ────────── */
export const LoadingCard: React.FC<LoadingCardProps> = () => (
  <div className="feed-card feed-card--loading" style={{ '--card-accent': 'var(--text-primary)' } as React.CSSProperties}>
    <div className="feed-card__loading-text">
      <span className="feed-card__loading-dot" />
      <span className="feed-card__loading-dot" />
      <span className="feed-card__loading-dot" />
      PROCESSING SIGNAL...
    </div>
  </div>
);
