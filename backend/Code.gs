function doPost(e) {
  const startTime = new Date().getTime();
  
  if (!e || !e.postData || !e.postData.contents) {
    return createJsonResponse(formatError('Invalid request body', 'INVALID_REQUEST'));
  }
  
  let payload;
  try {
    payload = JSON.parse(e.postData.contents);
  } catch (err) {
    return createJsonResponse(formatError('Malformed JSON', 'INVALID_JSON'));
  }
  
  const validation = validateRequest(payload);
  if (!validation.valid) {
    return createJsonResponse(formatError(validation.error, 'VALIDATION_FAILED'));
  }
  
  // Rate limits
  const globalRateLimit = checkGlobalRateLimit();
  if (!globalRateLimit.allowed) {
    return createJsonResponse(formatError('GRID OVERLOADED. TRY AGAIN LATER.', 'RATE_LIMIT_GLOBAL'));
  }
  
  // User limits
  if (payload.action !== 'GET_FACTION_STATUS' || payload.userId) {
    const userRateLimit = checkRateLimit(payload.userId, payload.action);
    if (!userRateLimit.allowed) {
      return createJsonResponse(formatError('REQUEST FREQUENCY EXCEEDED. COOLDOWN REQUIRED.', 'RATE_LIMIT_USER'));
    }
  }

  let response;
  try {
    switch (payload.action) {
      case 'CHAT':
        response = handleChatAction(payload.userId, payload);
        break;
      case 'SYNC_USER':
        response = handleSyncUserAction(payload.userId, payload);
        break;
      case 'GET_LEADERBOARD':
        response = handleGetLeaderboardAction(payload.userId, payload);
        break;
      case 'GET_FACTION_STATUS':
        response = handleGetFactionStatusAction();
        break;
      case 'GET_DAILY_QUESTS':
        response = handleGetDailyQuestsAction(payload.userId, payload);
        break;
      default:
        response = formatError('Unknown action dispatcher', 'UNKNOWN_ACTION');
    }
  } catch (err) {
    Logger.log("Execution Error: " + err.message + "\n" + err.stack);
    response = formatError(err.message, 'INTERNAL_SERVER_ERROR');
  }
  
  if (!response.meta) response.meta = { aiModel: 'none', rateLimitRemaining: 0 };
  if (!response.meta.latencyMs) response.meta.latencyMs = measureLatency(startTime);
  
  return createJsonResponse(response);
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function handleChatAction(userId, payload) {
  return handleChat(userId, payload);
}

function handleSyncUserAction(userId, payload) {
  if (!payload || !payload.user) {
    throw new Error('User object missing in sync payload');
  }
  
  const incomingUser = payload.user;
  const existingUser = getUser(userId);
  
  if (existingUser) {
    const mergedObj = Object.assign({}, existingUser, incomingUser);
    saveUser(mergedObj);
    return formatSuccess({ user: mergedObj });
  } else {
    if (!incomingUser.designation || !incomingUser.faction) {
      throw new Error('Missing designation or faction for new user');
    }
    
    saveUser(incomingUser);
    updateFactionMemberCount(incomingUser.faction, 1);
    
    const configData = getSheetData(CONFIG.SHEETS.CONFIG);
    const totalRow = configData.find(c => c.key === 'totalUsersRegistered');
    if (totalRow) {
      const dbRow = findRow(CONFIG.SHEETS.CONFIG, 'key', 'totalUsersRegistered');
      updateRow(CONFIG.SHEETS.CONFIG, dbRow.rowIndex, {
        value: Number(totalRow.value) + 1,
        updatedAt: now()
      });
    }
    
    return formatSuccess({ user: incomingUser });
  }
}

function handleGetLeaderboardAction(userId, payload) {
  const entries = getLeaderboard(userId, payload.factionFilter);
  return formatSuccess({ leaderboard: entries });
}

function handleGetFactionStatusAction() {
  const factions = getFactionStatus();
  const timeRemaining = getWarTimeRemaining();
  const sectors = getAllSectors();
  
  return formatSuccess({ 
    factions: factions,
    warTimeRemaining: timeRemaining,
    sectors: sectors
  });
}

function handleGetDailyQuestsAction(userId, payload) {
  const quests = getDailyQuestsForUser(userId, payload.currentSector);
  return formatSuccess({ quests: quests });
}

function doGet(e) {
  return ContentService.createTextOutput("CONSTRUCT OS v3.0 — BACKEND OPERATIONAL");
}
