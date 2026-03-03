function getFactionStatus() {
  const factions = getFactionData();
  return factions;
}

function processWeeklyWar() {
  const factions = getFactionData();
  if (factions.length === 0) return;
  
  // 1. Get current faction scores
  let winner = factions[0];
  for (const f of factions) {
    if (f.totalPower > winner.totalPower) {
      winner = f;
    }
  }
  
  // Find loser (lowest power)
  let loser = factions[0];
  for (const f of factions) {
    if (f.totalPower < loser.totalPower) {
      loser = f;
    }
  }
  
  const configData = getSheetData(CONFIG.SHEETS.CONFIG);
  const cycleStartObj = configData.find(c => c.key === 'currentWarCycleStart');
  const cycleEndObj = configData.find(c => c.key === 'currentWarCycleEnd');
  
  const cycleStart = cycleStartObj ? cycleStartObj.value : new Date(Date.now() - 7*24*60*60*1000).toISOString();
  const cycleEnd = cycleEndObj ? cycleEndObj.value : now();
  
  const tScore = factions.find(f => f.faction === 'TECHNOCRATS')?.totalPower || 0;
  const kScore = factions.find(f => f.faction === 'KEEPERS_OF_THE_VEIL')?.totalPower || 0;
  const iScore = factions.find(f => f.faction === 'IRONBORN_COLLECTIVE')?.totalPower || 0;
  const totalParticipants = factions.reduce((sum, f) => sum + f.memberCount, 0);
  
  // 3. Log to WarHistory
  appendRow(CONFIG.SHEETS.WAR_HISTORY, {
    cycleId: generateId(),
    startDate: cycleStart,
    endDate: cycleEnd,
    winner: winner.faction,
    technocratScore: tScore,
    keepersScore: kScore,
    ironbornScore: iScore,
    totalParticipants: totalParticipants
  });
  
  // 4. Award bonus to winning faction
  const usersSheet = getSheet(CONFIG.SHEETS.USERS);
  const usersData = usersSheet.getDataRange().getValues();
  const factionCol = usersData[0].indexOf('faction');
  const prestigeCol = usersData[0].indexOf('prestige');
  
  if (factionCol !== -1 && prestigeCol !== -1) {
    for (let i = 1; i < usersData.length; i++) {
      if (usersData[i][factionCol] === winner.faction) {
        const currentP = Number(usersData[i][prestigeCol]) || 0;
        usersSheet.getRange(i + 1, prestigeCol + 1).setValue(currentP + 100);
      }
    }
  }
  
  // 5. Redistribute contested sectors
  const sectors = getAllSectors();
  const contestedSectors = sectors.filter(s => !s.controlledBy);
  const loserSectors = sectors.filter(s => s.controlledBy === loser.faction);
  
  // Winner claims up to 2 contested
  const toClaim = Math.min(2, contestedSectors.length);
  for (let i = 0; i < toClaim; i++) {
    const sec = contestedSectors[i];
    updateSectorControl(sec.id, winner.faction);
  }
  
  // Loser loses 1 sector
  if (loserSectors.length > 0) {
    const secToLose = loserSectors[0];
    updateSectorControl(secToLose.id, null);
  }
  
  // 6. Reset faction power scores
  // Sort factions by power descending
  const sortedFactions = [...factions].sort((a, b) => b.totalPower - a.totalPower);
  const resetValues = [500, 400, 300];
  
  for (let i = 0; i < sortedFactions.length; i++) {
    const f = sortedFactions[i];
    const row = findRow(CONFIG.SHEETS.FACTIONS, 'faction', f.faction);
    if (row) {
      updateRow(CONFIG.SHEETS.FACTIONS, row.rowIndex, {
        totalPower: resetValues[i] || 300,
        weeklyChange: 0,
        lastUpdated: now()
      });
    }
  }
  
  recalculateSectorCounts();
  
  // 7. Update Config
  const nextStart = new Date(cycleEnd);
  const nextEnd = new Date(nextStart.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  if (cycleStartObj) updateRow(CONFIG.SHEETS.CONFIG, findRow(CONFIG.SHEETS.CONFIG, 'key', 'currentWarCycleStart').rowIndex, { value: nextStart.toISOString(), updatedAt: now() });
  if (cycleEndObj) updateRow(CONFIG.SHEETS.CONFIG, findRow(CONFIG.SHEETS.CONFIG, 'key', 'currentWarCycleEnd').rowIndex, { value: nextEnd.toISOString(), updatedAt: now() });
  
  Logger.log(`War cycle processed. Winner: ${winner.faction}`);
}

function getWarTimeRemaining() {
  const row = findRow(CONFIG.SHEETS.CONFIG, 'key', 'currentWarCycleEnd');
  if (!row) return "UNKNOWN";
  
  const endMs = new Date(row.data.value).getTime();
  const nowMs = new Date().getTime();
  const diff = endMs - nowMs;
  
  if (diff <= 0) return "RESOLVING...";
  
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${d}d ${h}h ${m}m`;
}

function contestSector(sectorId) {
  updateSectorControl(sectorId, null);
  Logger.log(`Sector ${sectorId} is now contested.`);
}

function claimSector(sectorId, faction) {
  updateSectorControl(sectorId, faction);
  addFactionPower(faction, 20);
  Logger.log(`Sector ${sectorId} claimed by ${faction}.`);
}

function addFactionPower(faction, amount) {
  updateFactionPower(faction, amount);
  // Sector logic handled elsewhere or in recalculate
}
