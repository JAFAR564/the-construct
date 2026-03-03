import React, { useEffect, useRef, useMemo } from 'react';
import { useGameStore } from '@/stores/useGameStore';
import { useSlashCommands } from '@/hooks/useSlashCommands';
import { CommandInput } from '@/components/ui/CommandInput';
import { GlitchText } from '@/components/ui/GlitchText';
import { checkSkillRequirement } from '@/services/questGenerator';
import { SoundManager } from '@/utils/soundManager';
import type { ChatMessage, Choice, Quest } from '@/types';

export const Terminal: React.FC = () => {
  const { messages, addMessage, sendMessage, isLoading, user, quests, updateQuest } = useGameStore();
  const { executeCommand } = useSlashCommands();
  const endRef = useRef<HTMLDivElement>(null);
  const welcomeSent = useRef(false);

  const activeQuest = useMemo(() => {
    const safeQuests = Array.isArray(quests) ? quests : [];
    return safeQuests.find((q: Quest) => q?.status === 'ACTIVE');
  }, [quests]);

  const currentChoice = useMemo(() => {
    if (!activeQuest) return null;
    return activeQuest.choices?.find(c => c.stageIndex === activeQuest.currentStage && !c.chosenOption);
  }, [activeQuest]);

  useEffect(() => {
    if (welcomeSent.current) return;
    if (messages.length > 0) return;
    if (!user) return;

    welcomeSent.current = true;

    addMessage({
      id: Date.now().toString(),
      source: 'SYSTEM',
      content: `Welcome back, Architect ${user.designation || 'UNKNOWN'}.\nCurrent location: Sector S-${String(user.currentSector ?? 0).padStart(2, '0')}\nActive directive: ${activeQuest?.title || 'None'}\n\nWhat would you like to do?`,
      timestamp: new Date().toISOString(),
      choices: [
        { key: 'A', label: 'Continue current directive' },
        { key: 'B', label: 'Scan local sector' },
        { key: 'C', label: 'Check faction status' },
        { key: 'D', label: 'Open communications' }
      ],
      glitch: false
    });
  }, [messages.length, user, activeQuest, addMessage]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });

    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.source === 'AI_DM') {
        SoundManager.playNotification();
      }
    }
  }, [messages, isLoading, currentChoice]);

  useEffect(() => {
    if (!activeQuest || !user) return;
    if (activeQuest.currentStage === 0 && !activeQuest.stageViewed?.[0]) {
      updateQuest(activeQuest.id, {
        stageViewed: activeQuest.stageViewed?.map((v, i) => i === 0 ? true : v) || [true]
      });
    }
  }, [activeQuest, user, updateQuest]);

  const handleSubmit = (val: string) => {
    if (val.startsWith('/')) {
      executeCommand(val);
    } else {
      sendMessage(val);
    }
  };

  const handleChoice = (c: Choice) => {
    sendMessage(c.label);
  };

  const handleQuestChoice = (choiceId: string, optionId: string) => {
    if (!activeQuest) return;

    const choice = activeQuest.choices?.find(c => c.id === choiceId);
    if (!choice) return;

    const updatedChoices = activeQuest.choices?.map(c =>
      c.id === choiceId ? { ...c, chosenOption: optionId } : c
    );

    updateQuest(activeQuest.id, { choices: updatedChoices });

    const chosenOption = choice.options.find(o => o.id === optionId);
    addMessage({
      id: Date.now().toString(),
      source: 'ARCHITECT',
      content: `[CHOICE] ${chosenOption?.label || 'Unknown'}`,
      timestamp: new Date().toISOString(),
    });
  };

  const renderMessage = (msg: ChatMessage) => {
    const isGlitch = msg.glitch || msg.source === 'ANOMALY';
    let color = 'var(--text-primary)';
    let prefix = '';

    switch (msg.source) {
      case 'SYSTEM': color = 'var(--text-secondary)'; prefix = 'SYSTEM: '; break;
      case 'ARCHITECT': color = 'var(--text-primary)'; prefix = '> '; break;
      case 'AI_DM': color = 'var(--text-primary)'; prefix = ''; break;
      case 'NPC': color = 'var(--accent-info)'; prefix = '[NPC]: '; break;
      case 'ANOMALY': color = 'var(--accent-danger)'; prefix = ''; break;
    }

    const contentStr = prefix + msg.content;
    const isAiDm = msg.source === 'AI_DM';

    return (
      <div key={msg.id} style={{ marginBottom: 16, color, whiteSpace: 'pre-wrap' }} className={isAiDm ? 'terminal-glow' : ''}>
        {isGlitch ? <GlitchText text={contentStr} /> : <span>{contentStr}</span>}
        {msg.choices && msg.choices.length > 0 && (
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {msg.choices.map(c => (
              <button
                key={c.key}
                onClick={() => handleChoice(c)}
                disabled={c.disabled}
                style={{
                  background: 'none', border: `1px solid ${color}`, color,
                  padding: '4px 8px', fontFamily: 'var(--font-mono)', cursor: c.disabled ? 'not-allowed' : 'pointer',
                  opacity: c.disabled ? 0.5 : 1, textAlign: 'left'
                }}
              >
                [{c.key}] {c.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      maxHeight: 'calc(100vh - 120px)',
      overflow: 'hidden'
    }}>
      <div
        className="message-feed"
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingBottom: 16
        }}
      >
        {messages.map(renderMessage)}
        {isLoading && <div style={{ color: 'var(--text-muted)', animation: 'flicker 1s infinite' }}>PROCESSING...</div>}

        {/* Quest Status Display */}
        {activeQuest && !currentChoice && (
          <div style={{
            marginTop: 16,
            padding: 12,
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-terminal)',
          }}>
            <div style={{ color: 'var(--accent-warning)', fontSize: '10px', letterSpacing: 1, marginBottom: 4 }}>
              DIRECTIVE UPDATE
            </div>
            <div style={{ color: 'var(--faction-active)', fontWeight: 'bold', fontSize: '12px' }}>
              [{activeQuest.title}]
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '10px', marginTop: 4 }}>
              Stage {activeQuest.currentStage + 1} of {activeQuest.totalStages}
            </div>
            {activeQuest.currentStage < activeQuest.totalStages && activeQuest.narrative?.[activeQuest.currentStage] && (
              <div style={{
                marginTop: 8,
                padding: 8,
                backgroundColor: 'var(--bg-dark)',
                borderLeft: '2px solid var(--faction-active)',
                color: 'var(--text-secondary)',
                fontSize: '11px',
                lineHeight: 1.6,
              }}>
                {activeQuest.narrative[activeQuest.currentStage]}
              </div>
            )}
          </div>
        )}

        {/* Quest Choice Display */}
        {currentChoice && user && (
          <div style={{
            marginTop: 16,
            padding: 12,
            backgroundColor: 'rgba(255, 215, 0, 0.05)',
            border: '1px solid var(--accent-warning)',
          }}>
            <div style={{ color: 'var(--accent-warning)', fontSize: '10px', letterSpacing: 1, marginBottom: 8 }}>
              ⚠ DECISION REQUIRED
            </div>
            <div style={{ color: 'var(--text-primary)', fontSize: '12px', marginBottom: 12 }}>
              {currentChoice.prompt}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {currentChoice.options.map(option => {
                const skillCheck = checkSkillRequirement(user, option);
                return (
                  <button
                    key={option.id}
                    onClick={() => handleQuestChoice(currentChoice.id, option.id)}
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
                      <span style={{ fontWeight: 'bold' }}>
                        [{option.id.toUpperCase()}] {option.label}
                      </span>
                      {option.skillCheck && (
                        <span style={{
                          fontSize: '10px',
                          color: skillCheck.qualified ? 'var(--faction-active)' : 'var(--accent-danger)',
                        }}>
                          {skillCheck.qualified ? '✓ QUALIFIED' : '✗ INSUFFICIENT'}
                          {' '}({skillCheck.userLevel}/{option.skillThreshold} {option.skillCheck})
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
            <div style={{ color: 'var(--text-muted)', fontSize: '9px', marginTop: 8, fontStyle: 'italic' }}>
              Tip: You can attempt options you're not qualified for, but success chance is reduced.
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      <div style={{ flexShrink: 0, borderTop: '1px solid var(--border-terminal)', paddingTop: 8 }}>
        <CommandInput onSubmit={handleSubmit} disabled={isLoading} />
      </div>
    </div>
  );
};
