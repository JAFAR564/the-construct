function generateLeaderboard() {
  const allUsers = getAllUsers();
  
  // Sort descending by prestige
  allUsers.sort((a, b) => b.prestige - a.prestige);
  
  // Take top 100
  const top100 = allUsers.slice(0, 100);
  
  const sheet = getSheet(CONFIG.SHEETS.LEADERBOARD);
  if (!sheet) return;
  
  // Clear existing (keep header)
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
  }
  
  if (top100.length === 0) return;
  
  const rows = top100.map((u, i) => [
    i + 1,
    u.id,
    u.designation,
    u.faction,
    u.rank,
    u.prestige,
    now()
  ]);
  
  sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  Logger.log("Leaderboard generated successfully.");
}

function getLeaderboard(requestingUserId, factionFilter) {
  const rawData = getSheetData(CONFIG.SHEETS.LEADERBOARD);
  
  let entries = rawData.map(r => ({
    rank: Number(r.rank),
    userId: r.userId,
    designation: r.designation,
    faction: r.faction,
    playerRank: r.playerRank,
    prestige: Number(r.prestige),
    isCurrentUser: r.userId === requestingUserId
  }));
  
  if (factionFilter) {
    entries = entries.filter(e => e.faction === factionFilter);
  }
  
  // Check if requesting user is in the top 100 entries.
  // If not, fetch their data directly and append without a full query if we can
  const userInTop = entries.some(e => e.userId === requestingUserId);
  
  if (!userInTop && requestingUserId && !factionFilter) {
    const userRankInfo = getUserRank(requestingUserId);
    if (userRankInfo.position > 0) {
      const u = getUser(requestingUserId);
      if (u) {
        entries.push({
          rank: userRankInfo.position,
          userId: u.id,
          designation: u.designation,
          faction: u.faction,
          playerRank: u.rank,
          prestige: u.prestige,
          isCurrentUser: true
        });
      }
    }
  }
  
  // We don't send userId to client usually, but it's okay for the leaderboard internal processing
  // Strip userId to save bandwidth and privacy
  return entries.map(e => {
    delete e.userId;
    return e;
  });
}

function getUserRank(userId) {
  const allUsers = getAllUsers();
  
  // Sort descending by prestige
  allUsers.sort((a, b) => b.prestige - a.prestige);
  
  const index = allUsers.findIndex(u => u.id === userId);
  return {
    position: index >= 0 ? index + 1 : 0,
    totalPlayers: allUsers.length
  };
}
