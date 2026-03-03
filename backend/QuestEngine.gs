const PRE_WRITTEN_QUESTS = [
  {
    type: 'DAILY_CONTRACT',
    title: 'Circuit Patrol',
    description: 'Scan 3 sectors for anomalous activity. Report findings to Grid Control.',
    totalStages: 3,
    rewards: [{ type: 'XP', value: 30 }, { type: 'PRESTIGE', value: 15 }]
  },
  {
    type: 'DAILY_CONTRACT',
    title: 'Data Harvest',
    description: 'Extract encrypted data fragments from local relay nodes. Handle with care — corruption possible.',
    totalStages: 3,
    rewards: [{ type: 'XP', value: 25 }, { type: 'SKILL', value: 5, skill: 'HACKING' }]
  },
  {
    type: 'DAILY_CONTRACT',
    title: 'Perimeter Sweep',
    description: 'Hostile signatures detected along the sector boundary. Investigate and neutralize.',
    totalStages: 3,
    rewards: [{ type: 'XP', value: 30 }, { type: 'SKILL', value: 5, skill: 'COMBAT' }]
  },
  {
    type: 'DAILY_CONTRACT',
    title: 'Negotiation Subroutine',
    description: 'A rogue AI is blockading crucial supply chains. Open comms and persuade it to detach.',
    totalStages: 3,
    rewards: [{ type: 'XP', value: 25 }, { type: 'SKILL', value: 5, skill: 'DIPLOMACY' }]
  },
  {
    type: 'DAILY_CONTRACT',
    title: 'Hardware Scavenge',
    description: 'Locate and secure rare palladium heat sinks from the ruined industrial zone.',
    totalStages: 3,
    rewards: [{ type: 'XP', value: 35 }, { type: 'SKILL', value: 5, skill: 'SURVIVAL' }]
  },
  {
    type: 'DAILY_CONTRACT',
    title: 'Node Calibration',
    description: 'Manually recalibrate the optical arrays on three compromised defense satellites.',
    totalStages: 3,
    rewards: [{ type: 'XP', value: 30 }, { type: 'SKILL', value: 5, skill: 'ENGINEERING' }]
  },
  {
    type: 'DAILY_CONTRACT',
    title: 'Aether Siphon',
    description: 'Tap into a stray dimensional rift and safely extract arcane energy.',
    totalStages: 3,
    rewards: [{ type: 'XP', value: 40 }, { type: 'SKILL', value: 5, skill: 'ARCANA' }]
  },
  {
    type: 'WEEKLY_BOUNTY',
    title: 'Cyber-Lich Elimination',
    description: 'A corrupted architect is raising dead drones to form a personal army. Terminate them.',
    totalStages: 5,
    rewards: [{ type: 'XP', value: 150 }, { type: 'PRESTIGE', value: 100 }, { type: 'SKILL', value: 10, skill: 'COMBAT' }]
  },
  {
    type: 'WEEKLY_BOUNTY',
    title: 'Mainframe Infiltration',
    description: 'Breach the deeply buried pre-Collapse banking server and extract financial ledgers.',
    totalStages: 5,
    rewards: [{ type: 'XP', value: 120 }, { type: 'PRESTIGE', value: 80 }, { type: 'SKILL', value: 10, skill: 'HACKING' }]
  },
  {
    type: 'WEEKLY_BOUNTY',
    title: 'Grid Fortification',
    description: 'Construct a series of EMP-resistant barricades around our major relay nodes.',
    totalStages: 5,
    rewards: [{ type: 'XP', value: 130 }, { type: 'PRESTIGE', value: 90 }, { type: 'SKILL', value: 10, skill: 'ENGINEERING' }]
  },
  {
    type: 'WEEKLY_BOUNTY',
    title: 'Wasteland Expedition',
    description: 'Map a route through the uncharted radiation wastes to establish a new trade corridor.',
    totalStages: 5,
    rewards: [{ type: 'XP', value: 140 }, { type: 'PRESTIGE', value: 110 }, { type: 'SKILL', value: 10, skill: 'SURVIVAL' }]
  },
  {
    type: 'WEEKLY_BOUNTY',
    title: 'Peace Treaty Accord',
    description: 'Mediate a tenuous ceasefire between two warring scavenger clans over water routing.',
    totalStages: 5,
    rewards: [{ type: 'XP', value: 110 }, { type: 'PRESTIGE', value: 150 }, { type: 'SKILL', value: 10, skill: 'DIPLOMACY' }]
  },
  {
    type: 'ANOMALY_EVENT',
    title: 'Tachyon Surge',
    description: 'Time is bleeding backwards in Sector 14. Stabilize the core before causality collapses.',
    totalStages: 2,
    rewards: [{ type: 'XP', value: 200 }, { type: 'PRESTIGE', value: 150 }, { type: 'TITLE', value: 'Timewalker' }]
  },
  {
    type: 'ANOMALY_EVENT',
    title: 'Rogue Leviathan',
    description: 'A massive mechanical burrower has breached the surface. Halt its advance.',
    totalStages: 3,
    rewards: [{ type: 'XP', value: 250 }, { type: 'PRESTIGE', value: 200 }, { type: 'TITLE', value: 'Leviathan Bane' }]
  },
  {
    type: 'ANOMALY_EVENT',
    title: 'Digital Ghost Ship',
    description: 'A phantom dreadnought is transmitting encrypted launch codes. Intercept and nullify.',
    totalStages: 2,
    rewards: [{ type: 'XP', value: 200 }, { type: 'PRESTIGE', value: 250 }, { type: 'TITLE', value: 'Code Breaker' }]
  }
];

function generateDailyQuests() {
  const sheet = getSheet(CONFIG.SHEETS.DAILY_QUESTS);
  if (!sheet) return;
  
  // Clear expired daily quests
  const nowMs = new Date().getTime();
  const data = getSheetData(CONFIG.SHEETS.DAILY_QUESTS);
  for (let i = data.length - 1; i >= 0; i--) {
    const expiresMs = new Date(data[i].expiresAt).getTime();
    if (nowMs > expiresMs) {
      deleteRow(CONFIG.SHEETS.DAILY_QUESTS, i + 2); // +2 for header offset
    }
  }

  const sectors = getAllSectors();
  
  let generatedCount = 0;
  
  // Create a mock user for Gemini context since these are generic daily quests
  const mockUser = {
    rank: 'OPERATIVE',
    faction: 'TECHNOCRATS'
  };

  const factions = Object.keys(CONFIG.FACTIONS);

  for (const faction of factions) {
    mockUser.faction = faction;
    for (let i = 0; i < CONFIG.GAME.DAILY_QUEST_COUNT; i++) {
      const targetSector = getRandomElement(sectors);
      let newQuest = null;
      
      const prompt = buildQuestPrompt(mockUser, 'DAILY', targetSector.id, targetSector.name);
      
      const aiResult = callAI(prompt, getSystemPrompt());
      
      if (aiResult.model !== 'fallback') {
        const lines = aiResult.text.split('\n');
        try {
          // Parse: TITLE: foo, DESCRIPTION: bar, STAGES: 3, REWARD_XP: 10
          let title = `Daily Directive for ${faction}`;
          let desc = "Await orders from command.";
          let stages = 3;
          let rewards = [];
          
          lines.forEach(line => {
             if (line.startsWith('TITLE:')) title = line.replace('TITLE:', '').trim();
             if (line.startsWith('DESCRIPTION:')) desc = line.replace('DESCRIPTION:', '').trim();
             if (line.startsWith('STAGES:')) stages = parseInt(line.replace('STAGES:', '').trim()) || 3;
             if (line.startsWith('REWARD_XP:')) rewards.push({ type: 'XP', value: parseInt(line.replace('REWARD_XP:', '').trim()) });
             if (line.startsWith('REWARD_PRESTIGE:')) rewards.push({ type: 'PRESTIGE', value: parseInt(line.replace('REWARD_PRESTIGE:', '').trim()) });
          });
          
          if (rewards.length === 0) rewards = [{ type: 'XP', value: 50 }];
          
          newQuest = {
             type: 'DAILY_CONTRACT',
             title: title,
             description: desc,
             totalStages: stages,
             rewards: rewards
          };
        } catch (e) {
             Logger.log("Failed to parse AI quest generation: " + e.message);
        }
      } 
      
      if (!newQuest) {
         // Fallback template
         const tmpl = getRandomElement(PRE_WRITTEN_QUESTS.filter(q => q.type === 'DAILY_CONTRACT'));
         newQuest = JSON.parse(JSON.stringify(tmpl)); // Deep clone
      }
      
      const expireDate = new Date();
      expireDate.setHours(expireDate.getHours() + 24);
      
      appendRow(CONFIG.SHEETS.DAILY_QUESTS, {
         questId: generateId(),
         type: newQuest.type,
         title: newQuest.title,
         description: newQuest.description,
         sector: targetSector.id,
         totalStages: newQuest.totalStages,
         rewards: toJSON(newQuest.rewards),
         generatedAt: now(),
         expiresAt: expireDate.toISOString()
      });
      generatedCount++;
    }
  }
  
  Logger.log("Generated " + generatedCount + " daily quests.");
}

function getDailyQuestsForUser(userId, sector) {
  const data = getSheetData(CONFIG.SHEETS.DAILY_QUESTS);
  const userQuests = getUserQuests(userId, null);
  const nowMs = new Date().getTime();
  
  const available = [];
  
  for (const q of data) {
    if (new Date(q.expiresAt).getTime() < nowMs) continue; // Expired
    
    // Check if user already has it
    const hasQuest = userQuests.some(uq => uq.title === q.title && new Date(uq.createdAt).getTime() > nowMs - (24 * 60 * 60 * 1000));
    if (hasQuest) continue;
    
    available.push({
      id: q.questId,
      type: q.type,
      title: q.title,
      description: q.description,
      sector: Number(q.sector),
      status: 'AVAILABLE',
      currentStage: 0,
      totalStages: Number(q.totalStages),
      rewards: parseJSON(q.rewards) || [],
      expiresAt: q.expiresAt
    });
  }
  
  return available;
}

function acceptQuest(userId, questId) {
  // We look up the daily quest by ID
  const sheetData = getSheetData(CONFIG.SHEETS.DAILY_QUESTS);
  const qObj = sheetData.find(q => q.questId === questId);
  
  if (!qObj) throw new Error("Quest not found or expired.");
  
  const quest = {
    id: generateId(), // New ID for the user's personal instance
    userId: userId,
    type: qObj.type,
    title: qObj.title,
    description: qObj.description,
    sector: qObj.sector,
    status: 'ACTIVE',
    currentStage: 0,
    totalStages: Number(qObj.totalStages),
    rewards: parseJSON(qObj.rewards),
    expiresAt: qObj.expiresAt
  };
  
  saveQuest(quest);
  return quest;
}

function progressQuest(userId, questId, newStage) {
  const quests = getUserQuests(userId, 'ACTIVE');
  const quest = quests.find(q => q.id === questId);
  
  if (!quest) return { completed: false, rewards: [], rankPromotion: null };
  
  quest.currentStage = newStage;
  if (quest.currentStage > quest.totalStages) quest.currentStage = quest.totalStages;
  
  if (quest.currentStage >= quest.totalStages) {
    quest.status = 'COMPLETED';
    quest.completedAt = now();
    
    const user = getUser(userId);
    user.xp = Number(user.xp || 0);
    user.prestige = Number(user.prestige || 0);
    user.totalQuestsCompleted = Number(user.totalQuestsCompleted || 0) + 1;
    
    // Apply rewards
    for (const rw of quest.rewards) {
      if (rw.type === 'XP') user.xp += rw.value;
      if (rw.type === 'PRESTIGE') user.prestige += rw.value;
      if (rw.type === 'SKILL' && user.skills[rw.skill]) user.skills[rw.skill] += rw.value;
      if (rw.type === 'TITLE') {
        if (!user.titles.includes(rw.value)) user.titles.push(rw.value);
      }
    }
    
    // Bonus
    user.prestige += CONFIG.GAME.PRESTIGE_PER_QUEST_COMPLETE;
    
    const promoCheck = checkRankPromotion(user.rank, user.prestige);
    if (promoCheck.promoted) {
      user.rank = promoCheck.newRank;
      user.xpToNextRank = calculateRankForPrestige(user.prestige).xpPerRank;
    }
    
    saveUser(user);
    updateFactionPower(user.faction, 10);
    saveQuest(quest);
    
    return { completed: true, rewards: quest.rewards, rankPromotion: promoCheck.promoted ? promoCheck : null };
  } else {
    updateQuestStatus(quest.id, { currentStage: quest.currentStage });
    return { completed: false, rewards: [], rankPromotion: null };
  }
}

function expireQuests() {
  const sheet = getSheet(CONFIG.SHEETS.QUESTS);
  if (!sheet) return;
  const data = getSheetData(CONFIG.SHEETS.QUESTS);
  const nowMs = new Date().getTime();
  
  let count = 0;
  for (let i = 0; i < data.length; i++) {
    if (data[i].status === 'ACTIVE') {
      const expiresMs = new Date(data[i].expiresAt).getTime();
      if (nowMs > expiresMs) {
        updateRow(CONFIG.SHEETS.QUESTS, i + 2, { status: 'EXPIRED' });
        count++;
      }
    }
  }
  Logger.log("Expired " + count + " active quests.");
}
