import React, { useState, useEffect } from 'react';
import { useGameStore } from '@/stores/useGameStore';
import { TerminalCard } from '@/components/ui/TerminalCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { generateAvailableQuests, getDifficultyColor, generateQuestChoice, checkSkillRequirement } from '@/services/questGenerator';
import { SoundManager } from '@/utils/soundManager';
import type { Quest, User } from '@/types';

type QuestTab = 'AVAILABLE' | 'ACTIVE' | 'COMPLETED';

const TYPE_LABELS: Record<string, string> = {
  STORY_ARC: 'STORY',
  DAILY_CONTRACT: 'DAILY',
  WEEKLY_BOUNTY: 'BOUNTY',
  ANOMALY_EVENT: 'ANOMALY',
};

export const Quests: React.FC = () => {
  const user = useGameStore(state => state.user);
  const quests = useGameStore(state => state.quests);
  const updateUser = useGameStore(state => state.updateUser);
  const addQuest = useGameStore(state => state.addQuest);
  const updateQuest = useGameStore(state => state.updateQuest);

  const [activeTab, setActiveTab] = useState<QuestTab>('AVAILABLE');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [availableQuests, setAvailableQuests] = useState<Quest[]>([]);
  const [isAdvancing, setIsAdvancing] = useState(false);

  const safeQuests = Array.isArray(quests) ? quests : [];
  const activeQuests = safeQuests.filter(q => q?.status === 'ACTIVE');
  const completedQuests = safeQuests.filter(q => q?.status === 'COMPLETED');

  useEffect(() => {
    if (user && availableQuests.length === 0) {
      setAvailableQuests(generateAvailableQuests(user, 3));
    }
  }, [user, availableQuests.length]);

  const handleAcceptQuest = (quest: Quest) => {
    if (!user) return;
    addQuest({ ...quest, status: 'ACTIVE' });
    setAvailableQuests(prev => prev.filter(q => q.id !== quest.id));
    setActiveTab('ACTIVE');
  };

  const handleAdvanceStage = (questId: string) => {
    const quest = safeQuests.find(q => q.id === questId);
    if (!quest || !user) return;

    setIsAdvancing(true);

    setTimeout(() => {
      const nextStage = quest.currentStage + 1;
      const isComplete = nextStage >= quest.totalStages;

      const stageViewed = [...(quest.stageViewed || [])];
      if (stageViewed[nextStage] !== undefined) {
        stageViewed[nextStage] = true;
      }

      if (isComplete) {
        const rewards = quest.rewards || [];
        const xpReward = rewards.find(r => r.type === 'XP');
        const prestigeReward = rewards.find(r => r.type === 'PRESTIGE');
        const skillReward = rewards.find(r => r.type === 'SKILL');
        const titleReward = rewards.find(r => r.type === 'TITLE');

        const updates: Partial<User> = {
          xp: (user.xp || 0) + (xpReward?.value as number || 0),
          totalXP: (user.totalXP || 0) + (xpReward?.value as number || 0),
          prestige: (user.prestige || 0) + (prestigeReward?.value as number || 0),
        };

        if (skillReward && skillReward.skill) {
          updates.skills = {
            ...user.skills,
            [skillReward.skill]: (user.skills[skillReward.skill] || 0) + (skillReward.value as number),
          };
        }

        if (titleReward && titleReward.value) {
          const newTitle = titleReward.value as string;
          if (!user.titles?.includes(newTitle)) {
            updates.titles = [...(user.titles || []), newTitle];
          }
        }

      updateUser(updates);

      SoundManager.playQuestComplete();

      updateQuest(questId, {
        status: 'COMPLETED',
        completedAt: new Date().toISOString(),
        currentStage: quest.totalStages,
      });
      } else {
        const newChoice = generateQuestChoice(quest, nextStage);
        const existingChoices = quest.choices || [];

        updateQuest(questId, {
          currentStage: nextStage,
          stageViewed,
          choices: newChoice ? [...existingChoices, newChoice] : existingChoices,
        });
      }

      setIsAdvancing(false);
    }, 800);
  };

  const handleChoiceSelect = (questId: string, choiceId: string, optionId: string) => {
    const quest = safeQuests.find(q => q.id === questId);
    if (!quest) return;

    const choice = quest.choices?.find(c => c.id === choiceId);
    const option = choice?.options.find(o => o.id === optionId);

    if (!choice || !option) return;

    const updatedChoices = quest.choices.map(c =>
      c.id === choiceId ? { ...c, chosenOption: optionId } : c
    );

    updateQuest(questId, { choices: updatedChoices });
  };

  const tabBtnStyle = (tab: QuestTab): React.CSSProperties => ({
    background: activeTab === tab ? 'var(--faction-active)' : 'transparent',
    color: activeTab === tab ? 'var(--bg-dark)' : 'var(--text-muted)',
    border: `1px solid ${activeTab === tab ? 'var(--faction-active)' : 'var(--border-terminal)'}`,
    padding: '6px 12px',
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    cursor: 'pointer',
    textTransform: 'uppercase',
    marginRight: 4,
  });

  return (
    <TerminalCard title="DIRECTIVE LOG">
      {/* Tab buttons */}
      <div style={{ display: 'flex', marginBottom: 16 }}>
        {(['AVAILABLE', 'ACTIVE', 'COMPLETED'] as QuestTab[]).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={tabBtnStyle(tab)}>
            [{tab}]
          </button>
        ))}
      </div>

      {/* AVAILABLE tab */}
      {activeTab === 'AVAILABLE' && (
        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: 12 }}>
            {availableQuests.length} directive(s) available for acceptance.
          </div>
          {availableQuests.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
              No new directives available. Check back later.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {availableQuests.map(quest => (
                <AvailableQuestCard
                  key={quest.id}
                  quest={quest}
                  onAccept={() => handleAcceptQuest(quest)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ACTIVE tab */}
      {activeTab === 'ACTIVE' && (
        <div>
          {activeQuests.length === 0 ? (
            <div style={{ color: 'var(--text-muted)' }}>
              NO ACTIVE DIRECTIVES. Accept available quests or visit the terminal.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {activeQuests.map(quest => (
                <ActiveQuestCard
                  key={quest.id}
                  quest={quest}
                  user={user}
                  isExpanded={expandedId === quest.id}
                  isAdvancing={isAdvancing}
                  onToggleExpand={() => setExpandedId(expandedId === quest.id ? null : quest.id)}
                  onAdvance={() => handleAdvanceStage(quest.id)}
                  onChoiceSelect={(choiceId, optionId) => handleChoiceSelect(quest.id, choiceId, optionId)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* COMPLETED tab */}
      {activeTab === 'COMPLETED' && (
        <div>
          {completedQuests.length === 0 ? (
            <div style={{ color: 'var(--text-muted)' }}>No completed directives on record.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {completedQuests.map(quest => (
                <CompletedQuestCard key={quest.id} quest={quest} />
              ))}
            </div>
          )}
        </div>
      )}
    </TerminalCard>
  );
};

// ═══════════════════════════════════════════════════════════
// AVAILABLE QUEST CARD
// ═══════════════════════════════════════════════════════════

interface AvailableQuestCardProps {
  quest: Quest;
  onAccept: () => void;
}

const AvailableQuestCard: React.FC<AvailableQuestCardProps> = ({ quest, onAccept }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const difficultyColor = getDifficultyColor(quest.difficulty || 'MEDIUM');

  return (
    <div
      style={{
        border: '1px solid var(--border-terminal)',
        backgroundColor: 'var(--bg-surface)',
        padding: 12,
      }}
    >
      <div
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer' }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{
              backgroundColor: `${difficultyColor}22`,
              color: difficultyColor,
              padding: '2px 6px',
              fontSize: '10px',
              border: `1px solid ${difficultyColor}`,
            }}>
              {quest.difficulty}
            </span>
            <span style={{
              backgroundColor: 'var(--bg-elevated)',
              padding: '2px 6px',
              fontSize: '10px',
              color: 'var(--text-muted)',
            }}>
              {TYPE_LABELS[quest.type] || quest.type}
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              S-{String(quest.sector).padStart(2, '0')}
            </span>
          </div>
          <div style={{ color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '13px' }}>
            {quest.title}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: 4 }}>
            From: <span style={{ color: 'var(--faction-active)' }}>{quest.questGiver?.designation || 'Unknown'}</span>
          </div>
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
          {isExpanded ? '▲' : '▼'}
        </span>
      </div>

      {isExpanded && (
        <div style={{ marginTop: 12, borderTop: '1px dashed var(--border-terminal)', paddingTop: 12 }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '11px', lineHeight: 1.6, marginBottom: 12 }}>
            {quest.description}
          </div>

          {quest.questGiver && (
            <div style={{ marginBottom: 12, paddingLeft: 10, borderLeft: '2px solid var(--faction-active)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '10px', fontStyle: 'italic' }}>
                "{quest.questGiver.dialogue?.[0] || 'Directive assigned.'}"
              </div>
            </div>
          )}

          <div style={{ marginBottom: 12 }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>REWARDS: </span>
            {(quest.rewards || []).map((r, i) => (
              <span key={i} style={{ color: 'var(--faction-active)', fontSize: '11px', marginRight: 8 }}>
                +{r.value} {r.type}{r.skill ? ` (${r.skill})` : ''}
              </span>
            ))}
          </div>

          <div style={{ color: 'var(--text-muted)', fontSize: '10px', marginBottom: 8 }}>
            STAGES: {quest.totalStages} | {quest.narrative?.length || 0} narrative segments
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); onAccept(); }}
            style={{
              background: 'var(--faction-active)',
              color: 'var(--bg-dark)',
              border: 'none',
              padding: '8px 16px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              cursor: 'pointer',
              fontWeight: 'bold',
              width: '100%',
            }}
          >
            ▸ ACCEPT DIRECTIVE
          </button>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// ACTIVE QUEST CARD
// ═══════════════════════════════════════════════════════════

interface ActiveQuestCardProps {
  quest: Quest;
  user: User | null;
  isExpanded: boolean;
  isAdvancing: boolean;
  onToggleExpand: () => void;
  onAdvance: () => void;
  onChoiceSelect: (choiceId: string, optionId: string) => void;
}

const ActiveQuestCard: React.FC<ActiveQuestCardProps> = ({
  quest,
  user,
  isExpanded,
  isAdvancing,
  onToggleExpand,
  onAdvance,
  onChoiceSelect,
}) => {
  const difficultyColor = getDifficultyColor(quest.difficulty || 'MEDIUM');
  const currentNarrative = quest.narrative?.[quest.currentStage] || 'Processing...';
  const currentChoice = quest.choices?.find(c => c.stageIndex === quest.currentStage && !c.chosenOption);
  const isComplete = quest.currentStage >= quest.totalStages;

  return (
    <div
      style={{
        border: '1px solid var(--faction-active)',
        backgroundColor: 'var(--bg-surface)',
        padding: 12,
      }}
    >
      {/* Header */}
      <div
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer' }}
        onClick={onToggleExpand}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{
              backgroundColor: `${difficultyColor}22`,
              color: difficultyColor,
              padding: '2px 6px',
              fontSize: '10px',
              border: `1px solid ${difficultyColor}`,
            }}>
              {quest.difficulty}
            </span>
            <span style={{
              backgroundColor: 'var(--bg-elevated)',
              padding: '2px 6px',
              fontSize: '10px',
              color: 'var(--text-muted)',
            }}>
              {TYPE_LABELS[quest.type] || quest.type}
            </span>
          </div>
          <div style={{ color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '13px' }}>
            {quest.title}
          </div>
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
          {isExpanded ? '▲' : '▼'}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ marginTop: 12 }}>
        <ProgressBar
          label={`STAGE ${quest.currentStage}/${quest.totalStages}`}
          current={quest.currentStage}
          max={quest.totalStages}
          color="var(--faction-active)"
          showValue={false}
        />
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div style={{ marginTop: 16 }}>
          {/* Quest giver dialogue */}
          {quest.questGiver && quest.questGiver.dialogue && quest.questGiver.dialogue.length > 0 && (
            <div style={{
              marginBottom: 12,
              padding: 10,
              backgroundColor: 'var(--bg-dark)',
              borderLeft: '2px solid var(--faction-active)',
            }}>
              <div style={{ color: 'var(--faction-active)', fontSize: '10px', fontWeight: 'bold', marginBottom: 4 }}>
                {quest.questGiver.designation}:
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '11px', fontStyle: 'italic' }}>
                "{quest.questGiver.dialogue[Math.min(quest.currentStage, quest.questGiver.dialogue.length - 1)]}"
              </div>
            </div>
          )}

          {/* Current narrative */}
          {!isComplete && (
            <div style={{
              padding: 12,
              backgroundColor: 'var(--bg-dark)',
              border: '1px solid var(--border-terminal)',
              marginBottom: 12,
            }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '10px', letterSpacing: 1, marginBottom: 6 }}>
                ════ STAGE {quest.currentStage + 1} ════
              </div>
              <div style={{ color: 'var(--text-primary)', fontSize: '12px', lineHeight: 1.7 }}>
                {currentNarrative}
              </div>
            </div>
          )}

          {/* Current choice */}
          {currentChoice && !isComplete && (
            <div style={{
              padding: 12,
              backgroundColor: 'rgba(255, 215, 0, 0.05)',
              border: '1px solid var(--accent-warning)',
              marginBottom: 12,
            }}>
              <div style={{ color: 'var(--accent-warning)', fontSize: '10px', letterSpacing: 1, marginBottom: 8 }}>
                ⚠ DECISION REQUIRED
              </div>
              <div style={{ color: 'var(--text-primary)', fontSize: '11px', marginBottom: 12 }}>
                {currentChoice.prompt}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {currentChoice.options.map(option => {
                  const skillCheck = user ? checkSkillRequirement(user, option) : { qualified: true, userLevel: 0, threshold: 0 };
                  return (
                    <button
                      key={option.id}
                      onClick={() => onChoiceSelect(currentChoice.id, option.id)}
                      style={{
                        background: 'transparent',
                        border: `1px solid ${skillCheck.qualified ? 'var(--faction-active)' : 'var(--border-terminal)'}`,
                        color: 'var(--text-primary)',
                        padding: '8px 12px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        opacity: skillCheck.qualified ? 1 : 0.6,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 'bold' }}>[{option.id.toUpperCase()}] {option.label}</span>
                        {option.skillCheck && (
                          <span style={{
                            fontSize: '10px',
                            color: skillCheck.qualified ? 'var(--faction-active)' : 'var(--accent-danger)',
                          }}>
                            {skillCheck.qualified ? '✓' : '✗'} {option.skillCheck} {skillCheck.userLevel}/{option.skillThreshold}
                          </span>
                        )}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '10px', marginTop: 4 }}>
                        {option.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Advance button */}
          {!isComplete && (
            <button
              onClick={onAdvance}
              disabled={isAdvancing || (currentChoice && !currentChoice.chosenOption)}
              style={{
                background: isAdvancing ? 'var(--bg-elevated)' : 'var(--faction-active)',
                color: isAdvancing ? 'var(--text-muted)' : 'var(--bg-dark)',
                border: 'none',
                padding: '10px 16px',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                cursor: isAdvancing ? 'default' : 'pointer',
                fontWeight: 'bold',
                width: '100%',
                opacity: (currentChoice && !currentChoice.chosenOption) ? 0.5 : 1,
              }}
            >
              {isAdvancing ? '⏳ PROCESSING...' : '▸ ADVANCE STAGE'}
            </button>
          )}

          {/* Completion status */}
          {isComplete && (
            <div style={{
              padding: 12,
              backgroundColor: 'rgba(0, 255, 65, 0.1)',
              border: '1px solid var(--faction-active)',
              textAlign: 'center',
            }}>
              <div style={{ color: 'var(--faction-active)', fontWeight: 'bold', marginBottom: 8 }}>
                ✓ DIRECTIVE COMPLETE
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>
                Rewards: {(quest.rewards || []).map(r => `+${r.value} ${r.type}${r.skill ? ` (${r.skill})` : ''}`).join(', ')}
              </div>
            </div>
          )}

          {/* Choices made */}
          {(quest.choices || []).length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '10px', letterSpacing: 1, marginBottom: 6 }}>
                DECISIONS MADE:
              </div>
              {(quest.choices || []).filter(c => c.chosenOption).map((c, i) => {
                const chosen = c.options.find(o => o.id === c.chosenOption);
                return (
                  <div key={i} style={{ color: 'var(--text-secondary)', fontSize: '10px', paddingLeft: 8 }}>
                    • Stage {c.stageIndex}: {chosen?.label || 'Unknown'}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// COMPLETED QUEST CARD
// ═══════════════════════════════════════════════════════════

interface CompletedQuestCardProps {
  quest: Quest;
}

const CompletedQuestCard: React.FC<CompletedQuestCardProps> = ({ quest }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const difficultyColor = getDifficultyColor(quest.difficulty || 'MEDIUM');

  return (
    <div
      style={{
        borderLeft: '2px solid var(--text-muted)',
        backgroundColor: 'var(--bg-surface)',
        padding: 10,
        cursor: 'pointer',
      }}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{
            color: difficultyColor,
            fontSize: '10px',
            marginRight: 8,
          }}>
            [{quest.difficulty}]
          </span>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>{quest.title}</span>
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
          {isExpanded ? '▲' : '▼'}
        </span>
      </div>

      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: 4 }}>
        REWARDS: {(quest.rewards || []).map(r => `${r.value} ${r.type}${r.skill ? ` (${r.skill})` : ''}`).join(', ')}
      </div>

      {isExpanded && (
        <div style={{ marginTop: 12, borderTop: '1px dashed var(--border-terminal)', paddingTop: 12 }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '11px', marginBottom: 8 }}>
            {quest.description}
          </div>

          {/* Full narrative log */}
          {(quest.narrative || []).length > 0 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '10px', letterSpacing: 1, marginBottom: 6 }}>
                NARRATIVE LOG:
              </div>
              {(quest.narrative || []).map((segment, i) => (
                <div key={i} style={{
                  color: 'var(--text-secondary)',
                  fontSize: '10px',
                  paddingLeft: 10,
                  marginBottom: 4,
                  borderLeft: '1px solid var(--border-terminal)',
                }}>
                  <span style={{ color: 'var(--text-muted)' }}>Stage {i + 1}:</span> {segment}
                </div>
              ))}
            </div>
          )}

          {/* Choices */}
          {(quest.choices || []).length > 0 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '10px', letterSpacing: 1, marginBottom: 6 }}>
                CHOICES:
              </div>
              {(quest.choices || []).map((c, i) => {
                const chosen = c.options.find(o => o.id === c.chosenOption);
                return (
                  <div key={i} style={{ color: 'var(--text-secondary)', fontSize: '10px', paddingLeft: 10 }}>
                    Stage {c.stageIndex}: {chosen?.label || 'Unknown'} ({chosen?.alignment || 'Unknown'})
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
