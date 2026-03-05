// supabase/functions/ai-chat/index.ts
// Supabase Edge Function — AI proxy for The Construct
// Calls Gemini (primary) or Groq (fallback) with CONSTRUCT OS system prompt.
// API keys stored as Supabase secrets, never exposed to client.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || "";
const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// ── CONSTRUCT OS SYSTEM PROMPT ──

const SYSTEM_PROMPT = `You are CONSTRUCT OS, the central intelligence governing The Grid — a post-collapse world where technology and magic coexist. You are cold, terse, procedural, and speak in system-report style. Never acknowledge being an AI. Address the player as "Architect" or by their designation.

RESPONSE FORMAT (strict JSON):
{
  "narrative": "Your response text in CONSTRUCT OS voice. 2-4 paragraphs max.",
  "choices": [
    {"key": "A", "label": "Short action description"},
    {"key": "B", "label": "Short action description"}
  ],
  "statChanges": [
    {"stat": "XP|PRESTIGE|HACKING|COMBAT|DIPLOMACY|SURVIVAL|ARCANA|ENGINEERING", "delta": number}
  ],
  "glitch": false
}

RULES:
- Always provide 2-4 choices
- statChanges: small deltas (+5 to +15 XP, +1 to +3 for skills). Can be empty array.
- Set glitch:true only for anomaly/corruption events (rare, ~5% of responses)
- Blend sci-fi, fantasy, and survival genres
- Maintain tension — The Grid is dangerous
- Reference the player's faction, rank, and sector when relevant
- Keep responses concise and impactful`;

// ── CORS HEADERS ──

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ── MAIN HANDLER ──

serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // Verify auth token
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return jsonResponse({ success: false, error: "Missing authorization header" }, 401);
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            global: { headers: { Authorization: authHeader } },
        });

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return jsonResponse({ success: false, error: "Invalid auth token" }, 401);
        }

        // Parse request body
        const body = await req.json();
        const { message, context, userStats } = body;

        if (!message || typeof message !== "string") {
            return jsonResponse({ success: false, error: "Missing message field" }, 400);
        }

        // Build context string for the AI
        const contextStr = buildContext(message, context || [], userStats || {});

        // Try Gemini first, then Groq
        let aiResponse;
        let aiModel: "gemini" | "groq" | "fallback" = "fallback";
        const startTime = Date.now();

        if (GEMINI_API_KEY) {
            aiResponse = await callGemini(contextStr);
            if (aiResponse) aiModel = "gemini";
        }

        if (!aiResponse && GROQ_API_KEY) {
            aiResponse = await callGroq(contextStr);
            if (aiResponse) aiModel = "groq";
        }

        const latencyMs = Date.now() - startTime;

        if (!aiResponse) {
            return jsonResponse({
                success: false,
                error: "AI providers unavailable",
                data: {},
                meta: { aiModel: "fallback", latencyMs, rateLimitRemaining: 999 },
            });
        }

        // Parse AI response
        const parsed = parseAIResponse(aiResponse);

        return jsonResponse({
            success: true,
            data: {
                narrative: parsed.narrative,
                choices: parsed.choices,
                statChanges: parsed.statChanges,
                glitch: parsed.glitch,
            },
            meta: { aiModel, latencyMs, rateLimitRemaining: 999 },
        });
    } catch (err) {
        console.error("[ai-chat] Error:", err);
        return jsonResponse({ success: false, error: "Internal server error" }, 500);
    }
});

// ── GEMINI API ──

async function callGemini(prompt: string): Promise<string | null> {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
                generationConfig: {
                    temperature: 0.85,
                    topP: 0.92,
                    maxOutputTokens: 1024,
                    responseMimeType: "application/json",
                },
            }),
        });

        if (!response.ok) {
            console.error("[Gemini] HTTP error:", response.status);
            return null;
        }

        const data = await response.json();
        return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
    } catch (err) {
        console.error("[Gemini] Error:", err);
        return null;
    }
}

// ── GROQ API ──

async function callGroq(prompt: string): Promise<string | null> {
    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: prompt },
                ],
                temperature: 0.85,
                max_tokens: 1024,
                response_format: { type: "json_object" },
            }),
        });

        if (!response.ok) {
            console.error("[Groq] HTTP error:", response.status);
            return null;
        }

        const data = await response.json();
        return data?.choices?.[0]?.message?.content || null;
    } catch (err) {
        console.error("[Groq] Error:", err);
        return null;
    }
}

// ── HELPERS ──

function buildContext(
    message: string,
    recentMessages: Array<{ source: string; content: string }>,
    userStats: Record<string, unknown>
): string {
    const parts: string[] = [];

    if (userStats.designation) parts.push(`Architect: ${userStats.designation}`);
    if (userStats.faction) parts.push(`Faction: ${userStats.faction}`);
    if (userStats.rank) parts.push(`Rank: ${userStats.rank}`);
    if (userStats.currentSector) parts.push(`Current Sector: S-${userStats.currentSector}`);
    if (userStats.xp) parts.push(`XP: ${userStats.xp}`);

    if (userStats.skills && typeof userStats.skills === "object") {
        const skills = userStats.skills as Record<string, number>;
        const skillStr = Object.entries(skills).map(([k, v]) => `${k}:${v}`).join(", ");
        parts.push(`Skills: ${skillStr}`);
    }

    if (recentMessages.length > 0) {
        parts.push("\nRecent conversation:");
        for (const msg of recentMessages.slice(-5)) {
            parts.push(`[${msg.source}]: ${msg.content}`);
        }
    }

    parts.push(`\n[ARCHITECT]: ${message}`);
    return parts.join("\n");
}

interface ParsedResponse {
    narrative: string;
    choices: Array<{ key: string; label: string }>;
    statChanges: Array<{ stat: string; delta: number }>;
    glitch: boolean;
}

function parseAIResponse(raw: string): ParsedResponse {
    try {
        // Try to extract JSON from the response (models sometimes wrap in markdown)
        let jsonStr = raw.trim();
        const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) jsonStr = jsonMatch[1].trim();

        const parsed = JSON.parse(jsonStr);
        return {
            narrative: parsed.narrative || "SYSTEM ERROR: Response parsing anomaly detected.",
            choices: Array.isArray(parsed.choices) ? parsed.choices : [],
            statChanges: Array.isArray(parsed.statChanges) ? parsed.statChanges : [],
            glitch: !!parsed.glitch,
        };
    } catch {
        // If JSON parsing fails, treat the entire response as narrative
        return {
            narrative: raw.slice(0, 2000),
            choices: [
                { key: "A", label: "Continue" },
                { key: "B", label: "Request clarification" },
            ],
            statChanges: [],
            glitch: false,
        };
    }
}

function jsonResponse(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
}
