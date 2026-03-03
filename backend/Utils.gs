function generateId() {
  const timestamp = new Date().getTime().toString(16);
  const chars = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
  return timestamp + '-' + chars;
}

function now() {
  return new Date().toISOString();
}

function parseJSON(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    return null;
  }
}

function toJSON(obj) {
  return JSON.stringify(obj);
}

function clamp(value, min, max) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function getRandomElement(array) {
  if (!array || array.length === 0) return null;
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function calculateRankForPrestige(prestige) {
  for (let i = CONFIG.RANKS.length - 1; i >= 0; i--) {
    if (prestige >= CONFIG.RANKS[i].prestige) {
      return CONFIG.RANKS[i];
    }
  }
  return CONFIG.RANKS[0]; // Fallback to INITIATE
}

function checkRankPromotion(currentRank, newPrestige) {
  const prevRankIndex = CONFIG.RANKS.findIndex(r => r.rank === currentRank);
  const newRankObj = calculateRankForPrestige(newPrestige);
  const newRankIndex = CONFIG.RANKS.findIndex(r => r.rank === newRankObj.rank);
  
  return {
    promoted: newRankIndex > prevRankIndex,
    newRank: newRankObj.rank,
    oldRank: currentRank
  };
}

function sanitizeInput(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/<[^>]*>?/gm, '') // Remove HTML tags
    .replace(/\0/g, '')        // Remove null bytes
    .replace(/[\x01-\x1F\x7F]/g, '') // Remove simple control characters
    .trim()
    .substring(0, 500);
}

function formatError(message, code) {
  return {
    success: false,
    error: message,
    errorCode: code,
    data: {},
    meta: { aiModel: 'none', latencyMs: 0, rateLimitRemaining: 0 }
  };
}

function formatSuccess(data, meta) {
  return {
    success: true,
    data: data,
    meta: meta || { aiModel: 'none', latencyMs: 0, rateLimitRemaining: 0 }
  };
}

function measureLatency(startTime) {
  return new Date().getTime() - startTime;
}
