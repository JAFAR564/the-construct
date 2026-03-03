function getRemainingRateLimit(userId) {
  const result = checkRateLimit(userId, 'CHAT');
  // Revert the check if we're just checking to not count this twice?
  // Well, actual handler will call checkRateLimit, so here just look at current count
  // Actually the prompt says "Quick check of user's remaining chat requests in current minute window"
  // It's easier just to read the DB directly
  const rows = findRows(CONFIG.SHEETS.RATE_LIMITS, 'userId', userId);
  let record = rows.find(r => r.data.endpoint === 'CHAT');
  if (!record) return CONFIG.RATE_LIMITS.CHAT_PER_MINUTE;
  
  const windowStartMs = new Date(record.data.windowStart).getTime();
  if (new Date().getTime() - windowStartMs > 60000) return CONFIG.RATE_LIMITS.CHAT_PER_MINUTE;
  
  return Math.max(0, CONFIG.RATE_LIMITS.CHAT_PER_MINUTE - Number(record.data.requestCount));
}

function handleChat(userId, payload) {
  const startTime = new Date().getTime();
  
  const sanitizedMessage = sanitizeInput(payload.message || '');
  if (!sanitizedMessage) throw new Error("Empty message");
  
  const user = getUser(userId);
  if (!user) throw new Error("User not found: " + userId);
  
  // Try payload context first, fallback to DB if empty
  let contextMsgs = payload.context || [];
  if (contextMsgs.length === 0) {
    contextMsgs = getUserMessages(userId, 5);
  }
  
  const systemPrompt = getSystemPrompt();
  const chatPrompt = buildChatPrompt(sanitizedMessage, contextMsgs, user);
  
  const aiResult = callAI(chatPrompt, systemPrompt);
  const parsed = parseAIResponseText(aiResult.text);
  
  if (aiResult.model === 'fallback') {
    parsed.choices = aiResult.choices || [];
    // Randomize stat changes lightly for fallback to emulate AI
    if (Math.random() > 0.7) {
      parsed.statChanges.push({ stat: 'XP', delta: 15 });
    }
  }
  
  // Base rewards
  parsed.statChanges.push({ stat: 'XP', delta: CONFIG.GAME.XP_PER_CHAT });
  parsed.statChanges.push({ stat: 'PRESTIGE', delta: CONFIG.GAME.PRESTIGE_PER_CHAT });
  
  const userMessage = {
    id: generateId(),
    source: 'ARCHITECT',
    content: sanitizedMessage,
    timestamp: now(),
    choices: [],
    statChanges: [],
    glitch: false
  };
  
  const isAnomaly = parsed.narrative.toUpperCase().includes('ANOMALY') || Math.random() < 0.05;
  const aiMessage = {
    id: generateId(),
    source: 'AI_DM',
    content: parsed.narrative,
    timestamp: now(),
    choices: parsed.choices,
    statChanges: parsed.statChanges,
    glitch: isAnomaly
  };
  
  saveMessage(userId, userMessage);
  saveMessage(userId, aiMessage);
  
  // Apply stat changes
  user.xp = Number(user.xp) || 0;
  user.prestige = Number(user.prestige) || 0;
  
  for (const change of parsed.statChanges) {
    if (change.stat === 'XP') user.xp += change.delta;
    else if (change.stat === 'PRESTIGE') user.prestige += change.delta;
    else if (user.skills[change.stat] !== undefined) {
      user.skills[change.stat] += change.delta;
    }
  }
  
  user.totalMessages = (user.totalMessages || 0) + 2;
  user.lastActiveAt = now();
  
  const promoCheck = checkRankPromotion(user.rank, user.prestige);
  if (promoCheck.promoted) {
    user.rank = promoCheck.newRank;
    const newRankObj = calculateRankForPrestige(user.prestige);
    user.xpToNextRank = newRankObj.xpPerRank;
  }
  
  if (parsed.questUpdate) {
    // Attempt logic to find an active quest and update it. Since the prompt only gave us current/total,
    // we'll find the first ACTIVE quest and apply progress if it fits.
    const activeQuests = getUserQuests(userId, 'ACTIVE');
    if (activeQuests.length > 0) {
      progressQuest(userId, activeQuests[0].id, parsed.questUpdate.current);
    }
  }
  
  saveUser(user);
  updateFactionPower(user.faction, 1);
  
  const latency = measureLatency(startTime);
  
  return formatSuccess({
    narrative: parsed.narrative,
    choices: parsed.choices,
    statChanges: parsed.statChanges,
    questUpdate: parsed.questUpdate,
    glitch: aiMessage.glitch
  }, {
    aiModel: aiResult.model,
    latencyMs: latency,
    rateLimitRemaining: getRemainingRateLimit(userId)
  });
}
