import React, { useState, useEffect } from 'react';
import { useGameStore } from '@/stores/useGameStore';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { generateAvailableQuests, getDifficultyColor, generateQuestChoice, checkSkillRequirement } from '@/services/questGenerator';
import { SoundManager } from '@/utils/soundManager';
import type { Quest, User } from '@/types';
import '@/styles/PremiumPage.css';

type QuestTab = 'AVAILABLE' | 'ACTIVE' | 'COMPLETED';

const TYPE_LABELS: Record<string, string> = {
  STORY_ARC: 'STORY', DAILY_CONTRACT: 'DAILY', WEEKLY_BOUNTY: 'BOUNTY', ANOMALY_EVENT: 'ANOMALY',
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
      if (stageViewed[nextStage] !== undefined) stageViewed[nextStage] = true;

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
          updates.skills = { ...user.skills, [skillReward.skill]: (user.skills[skillReward.skill] || 0) + (skillReward.value as number) };
        }
        if (titleReward && titleReward.value) {
          const newTitle = titleReward.value as string;
          if (!user.titles?.includes(newTitle)) updates.titles = [...(user.titles || []), newTitle];
        }
        updateUser(updates);
        SoundManager.playQuestComplete();
        updateQuest(questId, { status: 'COMPLETED', completedAt: new Date().toISOString(), currentStage: quest.totalStages });
      } else {
        const newChoice = generateQuestChoice(quest, nextStage);
        const existingChoices = quest.choices || [];
        updateQuest(questId, { currentStage: nextStage, stageViewed, choices: newChoice ? [...existingChoices, newChoice] : existingChoices });
      }
      setIsAdvancing(false);
    }, 800);
  };

  const handleChoiceSelect = (questId: string, choiceId: string, optionId: string) => {
    const quest = safeQuests.find(q => q.id === questId);
    if (!quest) return;
    const updatedChoices = quest.choices.map(c => c.id === choiceId ? { ...c, chosenOption: optionId } : c);
    updateQuest(questId, { choices: updatedChoices });
  };

  return (
    <div className="ppage">
      <div className="ppage__title">DIRECTIVE LOG</div>
      <div className="ppage__title-divider" />

      <div className="ppage__tabs">
        {(['AVAILABLE', 'ACTIVE', 'COMPLETED'] as QuestTab[]).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`ppage__tab ${activeTab === tab ? 'ppage__tab--active' : ''}`}>
            [{tab}]
          </button>
        ))}
      </div>

      {/* AVAILABLE */}
      {activeTab === 'AVAILABLE' && (
        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: 14, fontFamily: 'var(--font-mono)' }}>
            {availableQuests.length} directive(s) available for acceptance.
          </div>
          {availableQuests.length === 0 ? (
            <div className="ppage__empty">No new directives available. Check back later.</div>
          ) : (
            <div className="ppage__flex-col">
              {availableQuests.map(quest => (
                <AvailableQuestCard key={quest.id} quest={quest} onAccept={() => handleAcceptQuest(quest)} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ACTIVE */}
      {activeTab === 'ACTIVE' && (
        <div>
          {activeQuests.length === 0 ? (
            <div className="ppage__empty">NO ACTIVE DIRECTIVES. Accept available quests or visit the terminal.</div>
          ) : (
            <div className="ppage__flex-col ppage__gap-lg">
              {activeQuests.map(quest => (
                <ActiveQuestCard key={quest.id} quest={quest} user={user}
                  isExpanded={expandedId === quest.id} isAdvancing={isAdvancing}
                  onToggleExpand={() => setExpandedId(expandedId === quest.id ? null : quest.id)}
                  onAdvance={() => handleAdvanceStage(quest.id)}
                  onChoiceSelect={(choiceId, optionId) => handleChoiceSelect(quest.id, choiceId, optionId)} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* COMPLETED */}
      {activeTab === 'COMPLETED' && (
        <div>
          {completedQuests.length === 0 ? (
            <div className="ppage__empty">No completed directives on record.</div>
          ) : (
            <div className="ppage__flex-col">
              {completedQuests.map(quest => <CompletedQuestCard key={quest.id} quest={quest} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════
   AVAILABLE QUEST CARD
   ═══════════════════════════════════════════ */

interface AvailableQuestCardProps { quest: Quest; onAccept: () => void; }

const AvailableQuestCard: React.FC<AvailableQuestCardProps> = ({ quest, onAccept }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const difficultyColor = getDifficultyColor(quest.difficulty || 'MEDIUM');

  return (
    <div className="ppage__card ppage__card--interactive" onClick={() => setIsExpanded(!isExpanded)}>
      <div className="ppage__flex-between">
        <div style={{ flex: 1 }}>
          <div className="ppage__flex-row" style={{ marginBottom: 6 }}>
            <span className="ppage__badge" style={{ color: difficultyColor, borderColor: difficultyColor, background: `${difficultyColor}15` }}>{quest.difficulty}</span>
            <span className="ppage__badge" style={{ color: 'var(--text-muted)', borderColor: 'rgba(255,255,255,0.1)' }}>{TYPE_LABELS[quest.type] || quest.type}</span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>S-{String(quest.sector).padStart(2, '0')}</span>
          </div>
          <div style={{ color: 'var(--text-bright)', fontWeight: 700, fontSize: '13px', fontFamily: 'var(--font-ui)' }}>{quest.title}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
            From: <span style={{ color: 'var(--faction-active)' }}>{quest.questGiver?.designation || 'Unknown'}</span>
          </div>
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{isExpanded ? '▲' : '▼'}</span>
      </div>

      {isExpanded && (
        <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '11px', lineHeight: 1.7, marginBottom: 12 }}>{quest.description}</div>
          {quest.questGiver && (
            <div className="ppage__card" style={{ marginBottom: 12, borderLeft: '3px solid var(--faction-active)', borderRadius: '0 10px 10px 0', padding: '8px 12px' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '10px', fontStyle: 'italic' }}>
                "{quest.questGiver.dialogue?.[0] || 'Directive assigned.'}"
              </div>
            </div>
          )}
          <div className="ppage__flex-row" style={{ marginBottom: 12, flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>REWARDS:</span>
            {(quest.rewards || []).map((r, i) => (
              <span key={i} className="ppage__badge" style={{ color: 'var(--faction-active)', borderColor: 'rgba(0,255,65,0.2)' }}>+{r.value} {r.type}{r.skill ? ` (${r.skill})` : ''}</span>
            ))}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '10px', marginBottom: 10, fontFamily: 'var(--font-mono)' }}>
            STAGES: {quest.totalStages} | {quest.narrative?.length || 0} narrative segments
          </div>
          <button className="ppage__btn ppage__btn--primary-solid ppage__btn--full" onClick={e => { e.stopPropagation(); onAccept(); }}>
            ▸ ACCEPT DIRECTIVE
          </button>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════
   ACTIVE QUEST CARD
   ═══════════════════════════════════════════ */

interface ActiveQuestCardProps {
  quest: Quest; user: User | null; isExpanded: boolean; isAdvancing: boolean;
  onToggleExpand: () => void; onAdvance: () => void; onChoiceSelect: (choiceId: string, optionId: string) => void;
}

const ActiveQuestCard: React.FC<ActiveQuestCardProps> = ({ quest, user, isExpanded, isAdvancing, onToggleExpand, onAdvance, onChoiceSelect }) => {
  const difficultyColor = getDifficultyColor(quest.difficulty || 'MEDIUM');
  const currentNarrative = quest.narrative?.[quest.currentStage] || 'Processing...';
  const currentChoice = quest.choices?.find(c => c.stageIndex === quest.currentStage && !c.chosenOption);
  const isComplete = quest.currentStage >= quest.totalStages;

  return (
    <div className="ppage__card ppage__card--active">
      <div className="ppage__flex-between ppage__card--interactive" onClick={onToggleExpand}>
        <div style={{ flex: 1 }}>
          <div className="ppage__flex-row" style={{ marginBottom: 6 }}>
            <span className="ppage__badge" style={{ color: difficultyColor, borderColor: difficultyColor, background: `${difficultyColor}15` }}>{quest.difficulty}</span>
            <span className="ppage__badge" style={{ color: 'var(--text-muted)', borderColor: 'rgba(255,255,255,0.1)' }}>{TYPE_LABELS[quest.type] || quest.type}</span>
          </div>
          <div style={{ color: 'var(--text-bright)', fontWeight: 700, fontSize: '13px', fontFamily: 'var(--font-ui)' }}>{quest.title}</div>
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{isExpanded ? '▲' : '▼'}</span>
      </div>

      <div style={{ marginTop: 12 }}>
        <ProgressBar label={`STAGE ${quest.currentStage}/${quest.totalStages}`} current={quest.currentStage} max={quest.totalStages} color="var(--faction-active)" showValue={false} />
      </div>

      {isExpanded && (
        <div style={{ marginTop: 16 }}>
          {quest.questGiver?.dialogue && quest.questGiver.dialogue.length > 0 && (
            <div className="ppage__card" style={{ marginBottom: 12, borderLeft: '3px solid var(--faction-active)', borderRadius: '0 10px 10px 0', padding: '10px 14px' }}>
              <div style={{ color: 'var(--faction-active)', fontSize: '10px', fontWeight: 700, marginBottom: 4 }}>{quest.questGiver.designation}:</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '11px', fontStyle: 'italic' }}>
                "{quest.questGiver.dialogue[Math.min(quest.currentStage, quest.questGiver.dialogue.length - 1)]}"
              </div>
            </div>
          )}

          {!isComplete && (
            <div className="ppage__card" style={{ marginBottom: 12 }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '10px', letterSpacing: 1, marginBottom: 6, fontFamily: 'var(--font-mono)' }}>════ STAGE {quest.currentStage + 1} ════</div>
              <div style={{ color: 'var(--text-bright)', fontSize: '12px', lineHeight: 1.7 }}>{currentNarrative}</div>
            </div>
          )}

          {currentChoice && !isComplete && (
            <div className="ppage__card ppage__card--warning" style={{ marginBottom: 12 }}>
              <div style={{ color: 'var(--accent-warning)', fontSize: '10px', letterSpacing: 1, marginBottom: 8, fontFamily: 'var(--font-mono)' }}>⚠ DECISION REQUIRED</div>
              <div style={{ color: 'var(--text-bright)', fontSize: '11px', marginBottom: 12 }}>{currentChoice.prompt}</div>
              <div className="ppage__flex-col">
                {currentChoice.options.map(option => {
                  const skillCheck = user ? checkSkillRequirement(user, option) : { qualified: true, userLevel: 0, threshold: 0 };
                  return (
                    <button key={option.id} className={`ppage__btn ppage__btn--full ${skillCheck.qualified ? '' : 'ppage__card--dim'}`}
                      style={{ textAlign: 'left', borderColor: skillCheck.qualified ? 'rgba(0,255,65,0.2)' : 'rgba(255,255,255,0.06)' }}
                      onClick={() => onChoiceSelect(currentChoice.id, option.id)}>
                      <div className="ppage__flex-between">
                        <span style={{ fontWeight: 700 }}>[{option.id.toUpperCase()}] {option.label}</span>
                        {option.skillCheck && (
                          <span style={{ fontSize: '10px', color: skillCheck.qualified ? 'var(--faction-active)' : 'var(--accent-danger)' }}>
                            {skillCheck.qualified ? '✓' : '✗'} {option.skillCheck} {skillCheck.userLevel}/{option.skillThreshold}
                          </span>
                        )}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '10px', marginTop: 4 }}>{option.description}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {!isComplete && (
            <button className={`ppage__btn ppage__btn--full ${isAdvancing ? '' : 'ppage__btn--primary-solid'}`}
              onClick={onAdvance} disabled={isAdvancing || (!!currentChoice && !currentChoice.chosenOption)}
              style={{ opacity: (currentChoice && !currentChoice.chosenOption) ? 0.5 : 1 }}>
              {isAdvancing ? '⏳ PROCESSING...' : '▸ ADVANCE STAGE'}
            </button>
          )}

          {isComplete && (
            <div className="ppage__card ppage__card--success" style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--faction-active)', fontWeight: 700, marginBottom: 8 }}>✓ DIRECTIVE COMPLETE</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>
                Rewards: {(quest.rewards || []).map(r => `+${r.value} ${r.type}${r.skill ? ` (${r.skill})` : ''}`).join(', ')}
              </div>
            </div>
          )}

          {(quest.choices || []).length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '10px', letterSpacing: 1, marginBottom: 6, fontFamily: 'var(--font-mono)' }}>DECISIONS MADE:</div>
              {(quest.choices || []).filter(c => c.chosenOption).map((c, i) => {
                const chosen = c.options.find(o => o.id === c.chosenOption);
                return <div key={i} style={{ color: 'var(--text-secondary)', fontSize: '10px', paddingLeft: 10 }}>• Stage {c.stageIndex}: {chosen?.label || 'Unknown'}</div>;
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════
   COMPLETED QUEST CARD
   ═══════════════════════════════════════════ */

interface CompletedQuestCardProps { quest: Quest; }

const CompletedQuestCard: React.FC<CompletedQuestCardProps> = ({ quest }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const difficultyColor = getDifficultyColor(quest.difficulty || 'MEDIUM');

  return (
    <div className="ppage__card ppage__card--interactive" onClick={() => setIsExpanded(!isExpanded)}>
      <div className="ppage__flex-between">
        <div className="ppage__flex-row">
          <span className="ppage__badge" style={{ color: difficultyColor, borderColor: difficultyColor }}>[{quest.difficulty}]</span>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 700, fontFamily: 'var(--font-ui)', fontSize: '13px' }}>{quest.title}</span>
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{isExpanded ? '▲' : '▼'}</span>
      </div>

      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
        REWARDS: {(quest.rewards || []).map(r => `${r.value} ${r.type}${r.skill ? ` (${r.skill})` : ''}`).join(', ')}
      </div>

      {isExpanded && (
        <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '11px', marginBottom: 8, lineHeight: 1.6 }}>{quest.description}</div>
          {(quest.narrative || []).length > 0 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '10px', letterSpacing: 1, marginBottom: 6, fontFamily: 'var(--font-mono)' }}>NARRATIVE LOG:</div>
              {(quest.narrative || []).map((segment, i) => (
                <div key={i} style={{ color: 'var(--text-secondary)', fontSize: '10px', paddingLeft: 10, marginBottom: 4, borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Stage {i + 1}:</span> {segment}
                </div>
              ))}
            </div>
          )}
          {(quest.choices || []).length > 0 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '10px', letterSpacing: 1, marginBottom: 6, fontFamily: 'var(--font-mono)' }}>CHOICES:</div>
              {(quest.choices || []).map((c, i) => {
                const chosen = c.options.find(o => o.id === c.chosenOption);
                return <div key={i} style={{ color: 'var(--text-secondary)', fontSize: '10px', paddingLeft: 10 }}>Stage {c.stageIndex}: {chosen?.label || 'Unknown'} ({chosen?.alignment || 'Unknown'})</div>;
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
