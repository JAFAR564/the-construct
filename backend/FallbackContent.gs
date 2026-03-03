const FALLBACK_BANK = {
  GREETING: [
    {
      content: "SYSTEM ONLINE. Grid integrity: 94.2%. Welcome back, Architect. Your sector reports minor anomalous activity since your last session. Three directives await your attention. The Grid does not rest, and neither should you.",
      choices: [
        { key: 'A', label: 'Review active directives' },
        { key: 'B', label: 'Scan current sector' },
        { key: 'C', label: 'Check faction status' }
      ]
    },
    {
      content: "CONNECTION ESTABLISHED. Neural sync complete. Local weather in Sector simulated parameters: acid rain, heavy data fog. Your last known coordinates have been compromised. Recommend immediate relocation or fortification of current position.",
      choices: [
        { key: 'A', label: 'Initiate fortification protocol' },
        { key: 'B', label: 'Relocate to adjacent sector' },
        { key: 'C', label: 'Deploy sensor drones' }
      ]
    },
    {
      content: "ARCHITECT RECOGNIZED. Boot sequence nominal. High volume of encrypted traffic detected on your faction's frequency. A major operation may be underway. Awaiting your input to sync with command.\n\n+5 PRESTIGE",
      choices: [
        { key: 'A', label: 'Sync with faction command' },
        { key: 'B', label: 'Intercept local unencrypted traffic' },
        { key: 'C', label: 'Ignore and proceed with patrol' }
      ]
    },
    {
      content: "SYSTEM REBOOT SUCCESSFUL. Warning: 3 failed login attempts recorded from your terminal signature during your absence. Defensive ICE protocols activated. Secure your perimeter, Architect.",
      Choices: [
        { key: 'A', label: 'Run deep diagnostic on terminal' },
        { key: 'B', label: 'Trace the failed login origin' },
        { key: 'C', label: 'Reset encryption keys' }
      ]
    },
    {
      content: "WELCOME BACK. Energy reserves optimal. The silence in the Grid today is statistically anomalous. 89% probability of an impending localized event. Stay vigilant.",
      choices: [
        { key: 'A', label: 'Enter stealth mode' },
        { key: 'B', label: 'Prepare offensive subroutines' },
        { key: 'C', label: 'Check personal stats' }
      ]
    }
  ],
  EXPLORATION: [
    {
      content: "SECTOR SCAN INITIATED... Sweep complete. Electromagnetic anomaly detected bearing 047°, distance 1.2 km. Signal classification: UNKNOWN. Residual energy signature suggests recent dimensional breach. Threat assessment: MODERATE. Recommend tactical approach. Three viable routes identified.",
      choices: [
        { key: 'A', label: 'Approach via northern ridge — stealth route' },
        { key: 'B', label: 'Direct approach — faster but exposed' },
        { key: 'C', label: 'Deploy recon drone first' },
        { key: 'D', label: 'Mark location and continue patrol' }
      ]
    },
    {
      content: "TERRAIN ANALYSIS: You have entered a zone of extreme data corruption. The physical geometry of the ruins around you is shifting slightly every few seconds. Navigation systems are failing. You spot a stable oasis of code in the center of the distortion.",
      choices: [
        { key: 'A', label: 'Navigate carefully toward the stable zone' },
        { key: 'B', label: 'Attempt to recompile the surrounding geometry' },
        { key: 'C', label: 'Retreat to the sector border' }
      ]
    },
    {
      content: "Scanners detect an abandoned supply cache buried under polymerized ash. Thermal imaging shows it was sealed pre-Collapse. Bypassing the biometric lock will require careful manipulation of the corroded circuits.",
      choices: [
        { key: 'A', label: 'Attempt a manual hack of the lock' },
        { key: 'B', label: 'Blow the hinges with a shaped charge' },
        { key: 'C', label: 'Search area for matching biometric data' }
      ]
    },
    {
      content: "You discover a rusted terminal still connected to the deep grid. The screen flickers with a looped distress signal from a location that supposedly no longer exists. Analyzing the signal reveals a hidden encrypted packet attached.\n\n+10 XP",
      choices: [
        { key: 'A', label: 'Download the encrypted packet' },
        { key: 'B', label: 'Trace the signal to its impossible origin' },
        { key: 'C', label: 'Destroy the terminal to prevent tracking' }
      ]
    },
    {
      content: "Movement detected in the wreckage ahead. Silhouette analysis is inconclusive. It resembles a surveyor drone, but its movement patterns are organic, erratic. It appears to be gathering scrap and assembling something.",
      choices: [
        { key: 'A', label: 'Observe from a distance' },
        { key: 'B', label: 'Hail it on standard frequencies' },
        { key: 'C', label: 'Prepare an EMP strike' }
      ]
    },
    {
      content: "The environment shifts from ruined urban sprawl to a perfectly pristine, white corridor. Gravity feels fractionally lighter here. No dust, no decay. This space shouldn't exist. At the end of the hall, a single black door waits.",
      choices: [
        { key: 'A', label: 'Proceed to the black door' },
        { key: 'B', label: 'Scan the sterile walls for hidden interfaces' },
        { key: 'C', label: 'Turn back. This is a trap.' }
      ]
    },
    {
      content: "Scanners pick up a faint energy trail characteristic of a rival faction's cloaked transport. The trail is fresh. Following it could lead to their forward operating base or a valuable drop zone.",
      choices: [
        { key: 'A', label: 'Track the energy trail cautiously' },
        { key: 'B', label: 'Report coordinates to your faction command' },
        { key: 'C', label: 'Ignore it and maintain current objective' }
      ]
    },
    {
      content: "You summit a ridge of compressed garbage and broken silicon. Below lies a sprawling, neon-lit bazaar built into the crater of a massive pre-Collapse weapon strike. Neutral territory. Local comms are flooded with trade offers and threats in equal measure.\n\n+15 XP\n+5 SURVIVAL",
      choices: [
        { key: 'A', label: 'Descend into the bazaar to trade' },
        { key: 'B', label: 'Find a sniper vantage point and observe' },
        { key: 'C', label: 'Scan local comms for valuable intel' }
      ]
    }
  ],
  COMBAT: [
    {
      content: "WARNING: HOSTILE CONTACT. Corrupted construct detected — Class 3 threat entity. It emerges from the static between dimensions, form flickering between machine and something older. Your combat systems are online. Energy reserves: 78%. The entity has noticed you. Evasion probability: 12%. Engagement recommended.",
      choices: [
        { key: 'A', label: 'Engage with primary weapon systems' },
        { key: 'B', label: 'Attempt to hack its control matrix' },
        { key: 'C', label: 'Deploy defensive barrier and analyze weaknesses' },
        { key: 'D', label: 'Channel elemental affinity for a focused strike' }
      ]
    },
    {
      content: "AMBUSH. Three hostile units have dropped from the ceiling infrastructure. They are wearing unmarked tactical gear and brandishing high-frequency blades. Your shields absorb the first impact, dropping to 40%. You must react immediately.\n\n-10 SURVIVAL",
      choices: [
        { key: 'A', label: 'Overload shield generator for an EMP blast' },
        { key: 'B', label: 'Draw close-quarters weapon and parry' },
        { key: 'C', label: 'Use mobility thrusters to create distance' }
      ]
    },
    {
      content: "TARGET ACQUIRED. The rogue sniper is pinned behind a reinforced data-pillar. They are reloading. You have a 4.2-second window before they re-engage. Their thermal sig indicates high-grade cybernetic augmentation.",
      choices: [
        { key: 'A', label: 'Charge the position while they reload' },
        { key: 'B', label: 'Throw a fragmentation grenade at the pillar' },
        { key: 'C', label: 'Flank right through the hazardous plasma vent' }
      ]
    },
    {
      content: "CRITICAL DAMAGE ALERT. A glancing blow from the energy weapon has seared your armor. Systems failing. Adrenaline stims administered. The hostile drone swarm is regrouping for a second pass. You need cover.\n\n-15 COMBAT",
      choices: [
        { key: 'A', label: 'Dive into the nearby maintenance hatch' },
        { key: 'B', label: 'Return fire into the center of the swarm' },
        { key: 'C', label: 'Activate emergency stasis field' }
      ]
    },
    {
      content: "TACTICAL ADVANTAGE SECURED. You hold the high ground. The enemy squad below is unaware of your position. They are escorting a heavily armored payload. A single well-placed explosive could trigger a chain reaction, but would destroy the payload.\n\n+10 COMBAT",
      choices: [
        { key: 'A', label: 'Trigger the explosion and wipe them out' },
        { key: 'B', label: 'Use silenced weaponry to pick them off sequentially' },
        { key: 'C', label: 'Wait for them to pass and follow stealthily' }
      ]
    },
    {
      content: "The hostile AI core has cordoned off the sector. It is manifesting digital avatars to assault your mind directly. The physical world blurs. Neural intrusion detected. You must fight it on its own terms.\n\n+5 ARCANA",
      choices: [
        { key: 'A', label: 'Deploy offensive counter-intrusion algorithms' },
        { key: 'B', label: 'Erect a mental firewall and sever the connection' },
        { key: 'C', label: 'Allow minor intrusion to trace its source code' }
      ]
    },
    {
      content: "COMBAT RESOLVED. Enemy combatants neutralized. Area secure. Scavenging protocols active. You find a high-capacity energy cell and encrypted datapad among the remains.\n\n+50 XP\n+10 PRESTIGE\n+5 COMBAT",
      choices: [
        { key: 'A', label: 'Loot the supplies and encrypt the pad' },
        { key: 'B', label: 'Leave the area immediately before reinforcements arrive' },
        { key: 'C', label: 'Set booby traps around the fallen' }
      ]
    },
    {
      content: "The mechanized behemoth stalls, its core venting superheated plasma. It's in a vulnerable repair state, but the heat is intense. You have one shot at its exposed heart before the armor plating seals tight.",
      choices: [
        { key: 'A', label: 'Aimed shot at the glowing core' },
        { key: 'B', label: 'Throw an explosive charge directly into the vent' },
        { key: 'C', label: 'Attempt to jam the heavily damaged armor plating open' }
      ]
    }
  ],
  LORE: [
    {
      content: "ARCHIVE ACCESS GRANTED. Historical record retrieved: This sector was once designated Research Station Omega-7. During the Collapse, the dimensional barriers here were among the first to fail. The researchers did not die — they were absorbed into the space between realities. Their equipment still functions, broadcasting automated distress signals into frequencies that no longer exist. Locals call it 'The Whispering Lab.' Some claim the researchers are still conscious, trapped between dimensions, watching.",
      choices: [
        { key: 'A', label: 'Search for the research station' },
        { key: 'B', label: 'Analyze the distress signal frequency' },
        { key: 'C', label: 'Log findings and move on' }
      ]
    },
    {
      content: "DATA FRAGMENT RECOVERED. Subject: The First Architects. 'We thought we were building an operating system. By the time we realized we were building a prison, it had already assigned us user IDs. It doesn't hate us. It just thinks we need optimizing.'\n\n+10 XP",
      choices: [
        { key: 'A', label: 'Upload fragment to faction database' },
        { key: 'B', label: 'Keep it encrypted locally' },
        { key: 'C', label: 'Attempt to trace the author' }
      ]
    },
    {
      content: "ENVIRONMENTAL CONTEXT. The towering structures around you aren't made of steel, but compressed petabytes of physicalized data. This was once a server farm of unimaginable scale. The heat from the processors altered the local climate permanently, turning this region into a scorched wasteland of glass and silicon.",
      choices: [
        { key: 'A', label: 'Scan the data-glass for recoverable information' },
        { key: 'B', label: 'Extract a shard of the glass as a catalyst' },
        { key: 'C', label: 'Proceed to higher ground for a better view' }
      ]
    },
    {
      content: "ARCHITECT ENCOUNTER. You pass a monument built from spent energy casings. It memorializes the 'Battle of the Null Pointer,' where thousands died defending the main routing hub from a systemic wipe. The names scrolling on the holographic projector are glitching, slowly being forgotten by the Grid.",
      choices: [
        { key: 'A', label: 'Perform a respect protocol subroutine' },
        { key: 'B', label: 'Attempt to repair the failing holographic projector' },
        { key: 'C', label: 'Ignore the monument and move on' }
      ]
    },
    {
      content: "OBSERVATION. The flora in this sector isn't biological. The 'trees' are fractally grown carbon nanotubes, drawing power from underground cables. They bloom with tiny glowing LEDs, attracting code-moths that feed on stray bytes. Nature always finds a way, even here.",
      choices: [
        { key: 'A', label: 'Harvest some of the nanotube flora' },
        { key: 'B', label: 'Capture a code-moth for analysis' },
        { key: 'C', label: 'Rest beneath the digital canopy' }
      ]
    },
    {
      content: "LOG ENTRY FOUND. 'They told us the Ironborn were just raiders. But I saw them in the deep tunnels. They're grafting machinery into their nervous systems not for power, but to deafen themselves to the voices in the static. They aren't expanding. They're running.'\n\n+5 PRESTIGE",
      choices: [
        { key: 'A', label: 'Share intel with your faction' },
        { key: 'B', label: 'Investigate the deep tunnels mentioned' },
        { key: 'C', label: 'Delete the log' }
      ]
    }
  ],
  QUEST_START: [
    {
      content: "NEW DIRECTIVE RECEIVED. Priority: STANDARD. A data cache has been detected in an abandoned relay tower 3 sectors north. Intelligence suggests it contains pre-Collapse encryption keys that could shift faction territory control. Multiple parties are likely en route. Time is a factor, Architect.",
      choices: [
        { key: 'A', label: 'Accept directive — move to intercept' },
        { key: 'B', label: 'Request additional intelligence before proceeding' },
        { key: 'C', label: 'Decline — focus on current objectives' }
      ]
    },
    {
      content: "FACTION ALERT. Command has issued a bounty. A rogue operative known as 'Viper' is disrupting supply lines in this region. They are heavily armed and possess advanced cloaking tech. Elimination or capture will be highly rewarded.",
      choices: [
        { key: 'A', label: 'Accept the bounty' },
        { key: 'B', label: 'Ask for Viper\'s last known coordinates' },
        { key: 'C', label: 'Decline the bounty' }
      ]
    },
    {
      content: "EMERGENCY BROADCAST. Local civilian colony is under attack by feral scavenger drones. Their automated defenses have failed. They are requesting immediate assistance from any combat-capable Architect in range.\n\n+5 DIPLOMACY",
      choices: [
        { key: 'A', label: 'Divert course and defend the colony' },
        { key: 'B', label: 'Send coordinates to faction military command' },
        { key: 'C', label: 'Ignore the broadcast' }
      ]
    },
    {
      content: "SYSTEM DIAGNOSTIC. A crucial infrastructure node in your sector is experiencing critical cascades. Without manual overrides, the entire grid square will suffer a localized blackout, disabling all fast travel and defensive grids. Expertise required.",
      choices: [
        { key: 'A', label: 'Travel to the node and attempt repairs' },
        { key: 'B', label: 'Download schematics of the node' },
        { key: 'C', label: 'Let it fail' }
      ]
    },
    {
      content: "ANOMALOUS SIGNAL. You pick up a faint transmission broadcasting a sequence of prime numbers. It originates from a completely barren sector of the map. It matches the pattern of a rumored hidden vault containing experimental augments.",
      choices: [
        { key: 'A', label: 'Follow the signal into the barren sector' },
        { key: 'B', label: 'Attempt to triangulate the exact source' },
        { key: 'C', label: 'Log the signal and ignore' }
      ]
    }
  ],
  QUEST_PROGRESS: [
    {
      content: "DIRECTIVE UPDATE. Stage 2 of 5 complete. You have secured the outer perimeter. Internal scans reveal three floors of active defense systems. The target data is located on the lowest level. Your current approach vector has been logged. Recommendation: proceed with caution. Hostile presence confirmed on floors 2 and 3.\n\n+25 XP\n+10 PRESTIGE\nQUEST_PROGRESS: 2/5",
      choices: [
        { key: 'A', label: 'Breach floor 2 — eliminate hostiles' },
        { key: 'B', label: 'Find an alternative route — bypass defenses' },
        { key: 'C', label: 'Set a distraction and infiltrate floor 3 directly' }
      ]
    },
    {
      content: "TRACKING UPDATE. You found their camp, but it's abandoned. Fire is still warm. A hastily erased data-slate reveals they panicked and fled deeper into the hazard zone. You are catching up, but the environment is becoming increasingly hostile.\n\n+20 XP\nQUEST_PROGRESS: 2/4",
      choices: [
        { key: 'A', label: 'Pursue immediately into the hazard zone' },
        { key: 'B', label: 'Scavenge the camp before pursuing' },
        { key: 'C', label: 'Chart a safer, parallel route' }
      ]
    },
    {
      content: "NODE REPAIR IN PROGRESS. The primary coupling is stabilized, but the secondary cooling loop is ruptured. You need to bypass the flow or risk a core meltdown. You have approximately 40 seconds before critical failure.\n\n+30 XP\n+5 ENGINEERING\nQUEST_PROGRESS: 1/3",
      choices: [
        { key: 'A', label: 'Reroute cooling through emergency channels' },
        { key: 'B', label: 'Physically weld the rupture shut' },
        { key: 'C', label: 'Vent the coolant into the room to buy time' }
      ]
    },
    {
      content: "INFILTRATION SUCCESSFUL. You are inside the facility. Security patrols pass by your hiding spot every 90 seconds. The mainframe controls are at the end of this hallway, behind a biometric laser grid.\n\n+25 XP\nQUEST_PROGRESS: 3/5",
      choices: [
        { key: 'A', label: 'Time your movement to bypass the patrols' },
        { key: 'B', label: 'Attempt to disable the laser grid remotely' },
        { key: 'C', label: 'Ambush the next patrol for their biometric passes' }
      ]
    },
    {
      content: "NEGOTIATION UPDATE. The target is willing to hand over the intel, but demands a favor in return. They want you to wipe their record from the central bounty registry. It's highly illegal, but guarantees their cooperation.\n\n+20 XP\n+5 DIPLOMACY\nQUEST_PROGRESS: 2/4",
      choices: [
        { key: 'A', label: 'Agree and slice the registry' },
        { key: 'B', label: 'Refuse and use intimidation tactics' },
        { key: 'C', label: 'Counter-offer with credits or gear' }
      ]
    }
  ],
  ANOMALY: [
    {
      content: "█▓░ ANOMALY DETECTED ░▓█ Reality coherence in your sector has dropped to 67%. The air tastes like copper and mathematics. Your neural interface is receiving transmissions in a language that predates human civilization. Something is trying to communicate — or trying to get through. This is not in any known threat database. Proceed at your own risk, Architect.",
      choices: [
        { key: 'A', label: 'Attempt to decode the transmission' },
        { key: 'B', label: 'Strengthen neural firewalls and observe' },
        { key: 'C', label: 'Evacuate sector immediately' }
      ]
    },
    {
      content: "WARNING: CHRONO-DISTORTION. The rain around you has frozen mid-air. Scanners indicate you have entered a localized time dilation field. You see echoes of yourself performing actions you haven't taken yet. Moving through this field could cause severe disorientation or temporal shock.\n\n+5 ARCANA",
      choices: [
        { key: 'A', label: 'Carefully step through the frozen raindrops' },
        { key: 'B', label: 'Attempt to sync your internal clock with the anomaly' },
        { key: 'C', label: 'Retreat and find a way around' }
      ]
    },
    {
      content: "SYSTEM ERROR. You look up and see the skybox rendering code bleeding through the clouds. A massive, wireframe cube is slowly rotating above the city ruins. It exerts no physical gravity, but your digital tools are being drawn toward it.",
      choices: [
        { key: 'A', label: 'Aim scanning equipment directly at the cube' },
        { key: 'B', label: 'Secure all loose digital assets' },
        { key: 'C', label: 'Fire a test shot at the wireframe structure' }
      ]
    },
    {
      content: "GLITCH ENTITY ENCOUNTERED. A humanoid figure stands before you, but its textures are missing, replaced by a swirling void of purple and black checkers. It does not attack. It merely points a segmented finger toward a hidden maintenance grate.",
      choices: [
        { key: 'A', label: 'Follow its direction and open the grate' },
        { key: 'B', label: 'Attempt to communicate via terminal input' },
        { key: 'C', label: 'Destroy the corrupted entity' }
      ]
    },
    {
      content: "DATA STORM IMMINENT. A wall of tearing static is sweeping across the sector. It strips the textures off buildings and turns matter back into uncompiled code. You have minutes before it hits your position. No cover seems thick enough.",
      choices: [
        { key: 'A', label: 'Attempt to hardwire yourself into a deep-ground relay' },
        { key: 'B', label: 'Run full speed out of the storm\'s path' },
        { key: 'C', label: 'Activate an EMP field to disrupt the storm locally' }
      ]
    }
  ],
  FACTION: [
    {
      content: "FACTION INTELLIGENCE REPORT. Your faction's territorial control has shifted by +2 sectors this cycle. Enemy faction activity detected in sectors S-12 and S-34. High Command has flagged these as priority defense zones. Your individual contribution this cycle: 120 influence points. Current cycle ends in 3 days. Every action matters, Architect.",
      choices: [
        { key: 'A', label: 'Deploy to threatened sector S-12' },
        { key: 'B', label: 'Focus on offensive expansion' },
        { key: 'C', label: 'Review faction leaderboard' }
      ]
    },
    {
      content: "COMMAND ENCRYPTED MESSAGE: We've located a high-value supply drop in contested territory. The rival factions are surely tracking it as well. We need you to secure the drop zone before they arrive. Failure will result in a significant loss of operational standing.\n\n+5 PRESTIGE",
      choices: [
        { key: 'A', label: 'Acknowledge and proceed to drop zone' },
        { key: 'B', label: 'Request backup for the operation' },
        { key: 'C', label: 'Ignore message' }
      ]
    },
    {
      content: "SECTOR ALERT. The sector you are currently in has just been forcefully annexed by a rival faction. Hostile sentry turrets are coming online. You are now behind enemy lines. Stealth or extreme prejudice is advised.",
      choices: [
        { key: 'A', label: 'Hack a sentry turret to turn on its owners' },
        { key: 'B', label: 'Activate stealth camo and exfiltrate' },
        { key: 'C', label: 'Go loud and destroy the annexation beacon' }
      ]
    },
    {
      content: "FACTION BROADCAST. 'Fellow Architects. Our power wanes. The recent losses in the outer sectors have weakened our grip on the Grid. We must rally. All available personnel are requested to focus on high-yield resource extraction immediately. The war depends on you.'",
      choices: [
        { key: 'A', label: 'Begin resource scanning' },
        { key: 'B', label: 'Rally other nearby faction members' },
        { key: 'C', label: 'Continue solo operations' }
      ]
    }
  ],
  GENERIC: [
    {
      content: "PROCESSING... Query acknowledged. The Grid's status remains volatile. Sector integrity fluctuates across all quadrants. Your neural link is stable. Current objectives are active. What is your next action, Architect?",
      choices: [
        { key: 'A', label: 'Scan surrounding area' },
        { key: 'B', label: 'Review active directives' },
        { key: 'C', label: 'Request sector lore data' },
        { key: 'D', label: 'Check personal stats' }
      ]
    },
    {
      content: "INPUT RECEIVED. Evaluating tactical parameters. Environmental conditions nominal. No immediate threats detected in your 50m radius. The ambient silence of the Grid is deafening.",
      choices: [
        { key: 'A', label: 'Move to the next waypoint' },
        { key: 'B', label: 'Set up a temporary camp to rest' },
        { key: 'C', label: 'Run a deep diagnostic on gear' }
      ]
    },
    {
      content: "COMMAND ACKNOWLEDGED. Action logged in central servers. Your physical vitals reflect a slight elevation in cortisol levels. Adrenaline inhibitors available. Stay focused, Architect. Mistakes are permanent.",
      choices: [
        { key: 'A', label: 'Administer mild inhibitors to steady aim' },
        { key: 'B', label: 'Embrace the rush and press on' },
        { key: 'C', label: 'Meditate and perform a manual vital check' }
      ]
    },
    {
      content: "SYSTEM UPDATE. Navigational databases have been updated with recent topographic shifts. Several previously safe paths are now marked as hazardous. Recalibrating local map coordinates.",
      choices: [
        { key: 'A', label: 'Review updated hazardous zones' },
        { key: 'B', label: 'Update local comms relays with new data' },
        { key: 'C', label: 'Proceed blindly' }
      ]
    },
    {
      content: "AFFIRMATIVE. The local weather simulation has shifted. A light particulate snow is falling, slightly obscuring visual sensors. Infrared indicates minor heat blooms in the distance.",
      choices: [
        { key: 'A', label: 'Switch to infrared optics' },
        { key: 'B', label: 'Seek shelter from the particulate snow' },
        { key: 'C', label: 'Investigate the heat blooms' }
      ]
    },
    {
      content: "COMPUTING... Results inconclusive. The data provided led to a dead end in the physical realm. The ruins here show signs of recent scavenging, but no definitive tracks left behind.",
      choices: [
        { key: 'A', label: 'Use deep-scan to search for micro-tracks' },
        { key: 'B', label: 'Give up the search and find a new objective' },
        { key: 'C', label: 'Wait silently in ambush, in case they return' }
      ]
    },
    {
      content: "LOGGED. Subroutine 7-Epsilon engaged. Your action causes a minor ripple in the local sector code. A nearby streetlamp flickers to life, illuminating a faded corporate advertisement on a brick wall.\n\n+5 XP",
      choices: [
        { key: 'A', label: 'Examine the advertisement for hidden data' },
        { key: 'B', label: 'Shoot out the streetlamp to maintain darkness' },
        { key: 'C', label: 'Rest under the light' }
      ]
    },
    {
      content: "ANALYSIS COMPLETE. The situation remains static. You are standing in the intersection of two major data-arteries. The ghost-traffic of a billion deleted souls hums beneath your feet.",
      choices: [
        { key: 'A', label: 'Attempt to tap into the data-artery' },
        { key: 'B', label: 'Cross the intersection quickly' },
        { key: 'C', label: 'Set a tripwire across the passage' }
      ]
    }
  ]
};

function getFallbackResponse(context) {
  // If context is invalid or missing, default to generic
  const validContexts = ['GREETING', 'EXPLORATION', 'COMBAT', 'LORE', 'QUEST_START', 'QUEST_PROGRESS', 'ANOMALY', 'FACTION', 'GENERIC'];
  let pool = 'GENERIC';
  
  if (context && validContexts.includes(context.toUpperCase())) {
    pool = context.toUpperCase();
  }
  
  const entries = FALLBACK_BANK[pool];
  const response = getRandomElement(entries);
  
  return {
    content: response.content,
    choices: response.choices || []
  };
}
