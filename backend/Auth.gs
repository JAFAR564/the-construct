function checkRateLimit(userId, endpoint) {
  const sheet = getSheet(CONFIG.SHEETS.RATE_LIMITS);
  if (!sheet) return { allowed: false, remaining: 0, resetIn: 60 };
  
  const nowMs = new Date().getTime();
  const ONE_MINUTE = 60 * 1000;
  
  const limitValue = CONFIG.RATE_LIMITS[`${endpoint}_PER_MINUTE`] || 10;
  
  const rows = findRows(CONFIG.SHEETS.RATE_LIMITS, 'userId', userId);
  let record = rows.find(r => r.data.endpoint === endpoint);
  
  if (!record) {
    appendRow(CONFIG.SHEETS.RATE_LIMITS, {
      userId: userId,
      endpoint: endpoint,
      requestCount: 1,
      windowStart: now(),
      lastRequest: now()
    });
    return { allowed: true, remaining: limitValue - 1, resetIn: 60 };
  }
  
  const windowStartMs = new Date(record.data.windowStart).getTime();
  const timePassed = nowMs - windowStartMs;
  
  if (timePassed > ONE_MINUTE) {
    // Reset window
    updateRow(CONFIG.SHEETS.RATE_LIMITS, record.rowIndex, {
      requestCount: 1,
      windowStart: now(),
      lastRequest: now()
    });
    return { allowed: true, remaining: limitValue - 1, resetIn: 60 };
  }
  
  const newCount = Number(record.data.requestCount) + 1;
  const remaining = limitValue - newCount;
  const resetIn = Math.ceil((ONE_MINUTE - timePassed) / 1000);
  
  if (newCount > limitValue) {
    return { allowed: false, remaining: 0, resetIn: resetIn };
  }
  
  updateRow(CONFIG.SHEETS.RATE_LIMITS, record.rowIndex, {
    requestCount: newCount,
    lastRequest: now()
  });
  
  return { allowed: true, remaining: remaining, resetIn: resetIn };
}

function checkGlobalRateLimit() {
  const sheet = getSheet(CONFIG.SHEETS.RATE_LIMITS);
  if (!sheet) return { allowed: false, remaining: 0 };
  
  const nowMs = new Date().getTime();
  const ONE_MINUTE = 60 * 1000;
  const limitValue = CONFIG.RATE_LIMITS.GLOBAL_PER_MINUTE;
  
  const data = getSheetData(CONFIG.SHEETS.RATE_LIMITS);
  let globalCount = 0;
  
  for (const row of data) {
    const windowStartMs = new Date(row.windowStart).getTime();
    if (nowMs - windowStartMs <= ONE_MINUTE) {
      globalCount += Number(row.requestCount);
    }
  }
  
  const remaining = limitValue - globalCount - 1;
  return { allowed: remaining >= 0, remaining: Math.max(0, remaining) };
}

function checkDailyAILimit(model) {
  const sheet = getSheet(CONFIG.SHEETS.CONFIG);
  if (!sheet) return { allowed: false, remaining: 0 };
  
  const configData = getSheetData(CONFIG.SHEETS.CONFIG);
  
  const dateKey = configData.find(c => c.key === 'daily_count_date');
  const geminiKey = configData.find(c => c.key === 'gemini_daily_count');
  const groqKey = configData.find(c => c.key === 'groq_daily_count');
  
  const todayStr = new Date().toISOString().split('T')[0];
  
  if (dateKey && dateKey.value !== todayStr) {
    // Reset daily counters
    const dateRow = findRow(CONFIG.SHEETS.CONFIG, 'key', 'daily_count_date');
    const gemRow = findRow(CONFIG.SHEETS.CONFIG, 'key', 'gemini_daily_count');
    const groqRow = findRow(CONFIG.SHEETS.CONFIG, 'key', 'groq_daily_count');
    
    if (dateRow) updateRow(CONFIG.SHEETS.CONFIG, dateRow.rowIndex, { value: todayStr, updatedAt: now() });
    if (gemRow) updateRow(CONFIG.SHEETS.CONFIG, gemRow.rowIndex, { value: 0, updatedAt: now() });
    if (groqRow) updateRow(CONFIG.SHEETS.CONFIG, groqRow.rowIndex, { value: 0, updatedAt: now() });
    
    const limit = model === 'gemini' ? CONFIG.AI.GEMINI_DAILY_LIMIT : CONFIG.AI.GROQ_DAILY_LIMIT;
    return { allowed: true, remaining: limit - 1 };
  }
  
  if (model === 'gemini') {
    const count = Number(geminiKey?.value || 0);
    const remaining = CONFIG.AI.GEMINI_DAILY_LIMIT - count;
    return { allowed: remaining > 0, remaining: Math.max(0, remaining) };
  } else if (model === 'groq') {
    const count = Number(groqKey?.value || 0);
    const remaining = CONFIG.AI.GROQ_DAILY_LIMIT - count;
    return { allowed: remaining > 0, remaining: Math.max(0, remaining) };
  }
  
  return { allowed: false, remaining: 0 };
}

function incrementDailyAICount(model) {
  const keyName = model === 'gemini' ? 'gemini_daily_count' : 'groq_daily_count';
  const row = findRow(CONFIG.SHEETS.CONFIG, 'key', keyName);
  
  if (row) {
    const newCount = Number(row.data.value) + 1;
    updateRow(CONFIG.SHEETS.CONFIG, row.rowIndex, {
      value: newCount,
      updatedAt: now()
    });
  }
}

function validateUserId(userId) {
  if (typeof userId !== 'string' || userId.trim() === '') return false;
  return true;
}

function validateRequest(payload) {
  if (!payload || typeof payload !== 'object') {
    return { valid: false, error: 'Invalid payload format' };
  }
  
  const validActions = ['CHAT', 'SYNC_USER', 'GET_LEADERBOARD', 'GET_FACTION_STATUS', 'GET_DAILY_QUESTS'];
  if (!validActions.includes(payload.action)) {
    return { valid: false, error: 'Unknown action: ' + payload.action };
  }
  
  if (payload.action !== 'GET_FACTION_STATUS' && !validateUserId(payload.userId)) {
    return { valid: false, error: 'Invalid or missing userId' };
  }
  
  return { valid: true, error: null };
}
