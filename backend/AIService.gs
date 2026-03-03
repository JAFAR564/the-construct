function callGemini(prompt, systemPrompt) {
  const apiKey = getGeminiKey();
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.AI.GEMINI_MODEL}:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: [
      { role: "user", parts: [{ text: systemPrompt + "\n\n" + prompt }] }
    ],
    generationConfig: {
      temperature: CONFIG.AI.TEMPERATURE,
      maxOutputTokens: CONFIG.AI.MAX_RESPONSE_TOKENS
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" }
    ]
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  const responseCode = response.getResponseCode();
  const responseText = response.getContentText();

  if (responseCode === 429) {
    throw new Error('GEMINI_RATE_LIMIT');
  }

  if (responseCode !== 200) {
    throw new Error(`Gemini API Error: ${responseCode} - ${responseText}`);
  }

  const result = JSON.parse(responseText);
  
  if (!result.candidates || result.candidates.length === 0) {
    throw new Error('Gemini API returned no candidates');
  }
  
  const generatedText = result.candidates[0].content.parts[0].text;
  incrementDailyAICount('gemini');
  return generatedText;
}

function callGroq(prompt, systemPrompt) {
  const apiKey = getGroqKey();
  if (!apiKey) throw new Error('GROQ_API_KEY is not set');

  const url = 'https://api.groq.com/openai/v1/chat/completions';
  
  const payload = {
    model: CONFIG.AI.GROQ_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt }
    ],
    temperature: CONFIG.AI.TEMPERATURE,
    max_tokens: CONFIG.AI.MAX_RESPONSE_TOKENS
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': `Bearer ${apiKey}`
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  const responseCode = response.getResponseCode();
  const responseText = response.getContentText();

  if (responseCode === 429) {
    throw new Error('GROQ_RATE_LIMIT');
  }

  if (responseCode !== 200) {
    throw new Error(`Groq API Error: ${responseCode} - ${responseText}`);
  }

  const result = JSON.parse(responseText);
  
  if (!result.choices || result.choices.length === 0) {
    throw new Error('Groq API returned no choices');
  }
  
  const generatedText = result.choices[0].message.content;
  incrementDailyAICount('groq');
  return generatedText;
}

function callAI(prompt, systemPrompt) {
  let modelUsed = 'none';
  let generatedText = '';
  let parsedChoices = null;
  
  // Step 1: Gemini
  const geminiLimit = checkDailyAILimit('gemini');
  if (geminiLimit.allowed) {
    try {
      generatedText = callGemini(prompt, systemPrompt);
      return { text: generatedText, model: 'gemini' };
    } catch (e) {
      Logger.log('Gemini failed: ' + e.message);
    }
  } else {
    Logger.log('Gemini daily limit exceeded');
  }
  
  // Step 2: Groq
  const groqLimit = checkDailyAILimit('groq');
  if (groqLimit.allowed) {
    try {
      generatedText = callGroq(prompt, systemPrompt);
      return { text: generatedText, model: 'groq' };
    } catch (e) {
      Logger.log('Groq failed: ' + e.message);
    }
  } else {
    Logger.log('Groq daily limit exceeded');
  }
  
  // Step 3: Fallback content
  Logger.log('Using fallback content');
  const fallback = getFallbackResponse('generic');
  return { 
    text: fallback.content, 
    model: 'fallback', 
    choices: fallback.choices 
  };
}

function parseAIResponseText(rawText) {
  let narrative = rawText;
  const choices = [];
  const statChanges = [];
  let questUpdate = null;
  
  // Parse Choices: [A] Choice text
  const choiceRegex = /\[([A-D])\]\s*(.+)/g;
  let match;
  while ((match = choiceRegex.exec(narrative)) !== null) {
    choices.push({ key: match[1], label: match[2].trim() });
  }
  // Strip choices from narrative
  narrative = narrative.replace(choiceRegex, '');
  
  // Parse Stat Changes: +10 HACKING or -5 SURVIVAL
  const statRegex = /([+-]\d+)\s+(HACKING|COMBAT|DIPLOMACY|SURVIVAL|ARCANA|ENGINEERING|XP|PRESTIGE)/gi;
  while ((match = statRegex.exec(narrative)) !== null) {
    statChanges.push({ stat: match[2].toUpperCase(), delta: parseInt(match[1]) });
  }
  // Strip stat changes
  narrative = narrative.replace(statRegex, '');
  
  // Parse Quest Progress: QUEST_PROGRESS: 2/5
  const questRegex = /QUEST_PROGRESS:\s*(\d+)\/(\d+)/i;
  const questMatch = questRegex.exec(narrative);
  if (questMatch) {
    questUpdate = {
      current: parseInt(questMatch[1]),
      total: parseInt(questMatch[2])
    };
    narrative = narrative.replace(questMatch[0], '');
  }
  
  // Clean up trailing empty lines
  narrative = narrative.trim();
  
  return { narrative, choices, statChanges, questUpdate };
}
