import React, { useEffect, useRef, useMemo } from 'react';
import { useGameStore } from '@/stores/useGameStore';
import { useSlashCommands } from '@/hooks/useSlashCommands';
import { FeedLayout } from '@/components/feed/FeedLayout';
import { FeedCard, QuestStatusCard, QuestDecisionCard, LoadingCard } from '@/components/feed/FeedCard';
import { PremiumCommandInput } from '@/components/feed/PremiumCommandInput';
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

  /* Welcome message */
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

  /* Auto-scroll + notification sound */
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });

    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.source === 'AI_DM') {
        SoundManager.playNotification();
      }
    }
  }, [messages, isLoading, currentChoice]);

  /* Mark stage as viewed */
  useEffect(() => {
    if (!activeQuest || !user) return;
    if (activeQuest.currentStage === 0 && !activeQuest.stageViewed?.[0]) {
      updateQuest(activeQuest.id, {
        stageViewed: activeQuest.stageViewed?.map((v, i) => i === 0 ? true : v) || [true]
      });
    }
  }, [activeQuest, user, updateQuest]);

  /* Handlers */
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

  return (
    <FeedLayout
      inputBar={<PremiumCommandInput onSubmit={handleSubmit} disabled={isLoading} />}
    >
      {/* Message feed as cards */}
      {messages.map((msg: ChatMessage, idx: number) => (
        <FeedCard
          key={msg.id}
          message={msg}
          onChoice={handleChoice}
          animationDelay={idx > messages.length - 4 ? (messages.length - 1 - idx) * 60 : 0}
        />
      ))}

      {/* Loading indicator */}
      {isLoading && <LoadingCard />}

      {/* Quest Status — pinned directive (when no decision pending) */}
      {activeQuest && !currentChoice && (
        <QuestStatusCard quest={activeQuest} />
      )}

      {/* Quest Decision — interactive choice panel */}
      {currentChoice && user && (
        <QuestDecisionCard
          choice={currentChoice}
          user={user}
          onChoose={handleQuestChoice}
        />
      )}

      <div ref={endRef} />
    </FeedLayout>
  );
};
