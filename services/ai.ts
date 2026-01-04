/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { AIMessage, AISettings } from "../types";

/**
 * Brand New OpenRouter API Key provided by user.
 */
const FALLBACK_OPENROUTER_KEY = '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';

// Default configuration with the requested DeepSeek model
const DEFAULT_SETTINGS: AISettings = {
    provider: 'openrouter',
    apiKey: '', 
    endpoint: 'https://openrouter.ai/api/v1',
    models: {
        chat: 'nex-agi/deepseek-v3.1-nex-n1:free', 
    }
};

/**
 * Strips any hidden or non-ASCII characters that cause header rejection.
 */
const sanitizeHeader = (str: string | undefined | null): string => {
    if (!str) return "";
    return String(str).replace(/[^\x20-\x7E]/g, "").trim();
};

export const getAISettings = (): AISettings => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('ai_settings');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                return { 
                    ...DEFAULT_SETTINGS, 
                    ...parsed, 
                    models: { ...DEFAULT_SETTINGS.models, ...parsed.models }
                };
            } catch (e) {
                console.warn("Failed to parse AI settings", e);
            }
        }
    }
    return DEFAULT_SETTINGS;
};

/**
 * API Key Hierarchy:
 * 1. Explicit override (from UI testing)
 * 2. Manually saved key in Admin Console
 * 3. Brand spanking new fallback key
 */
export const getEffectiveApiKey = (overrideKey?: string): string => {
    const cleanOverride = sanitizeHeader(overrideKey);
    if (cleanOverride && cleanOverride.length > 20) return cleanOverride;
    
    const settings = getAISettings();
    const manualKey = sanitizeHeader(settings.apiKey);
    if (manualKey && manualKey.length > 20) return manualKey;
    
    return sanitizeHeader(FALLBACK_OPENROUTER_KEY);
};

/**
 * Chat with AI (Agnostic OpenRouter Fetch)
 */
export const chatWithAi = async (
    history: AIMessage[], 
    newMessage: string | null, 
    systemInstruction?: string,
    overrideSettings?: AISettings
) => {
  const settings = overrideSettings || getAISettings();
  const apiKey = getEffectiveApiKey(settings.apiKey);
  const endpoint = (settings.endpoint || "https://openrouter.ai/api/v1").trim();

  try {
    if (!apiKey) {
        throw new Error("API Key is missing. Please configure it in the Admin Console.");
    }

    const messages = [];
    if (systemInstruction) {
        messages.push({ role: "system", content: systemInstruction });
    }
    
    history.forEach(msg => {
        if (msg.role === 'user' || msg.role === 'assistant') {
            messages.push({ role: msg.role, content: msg.content || '' });
        }
    });

    if (newMessage) {
        messages.push({ role: "user", content: newMessage });
    }

    const payload = {
        model: settings.models.chat || 'nex-agi/deepseek-v3.1-nex-n1:free',
        messages: messages,
        temperature: 0.7,
        top_p: 1,
        repetition_penalty: 1
    };

    const baseUrl = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint;
    const url = `${baseUrl}/chat/completions`;
    
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": typeof window !== 'undefined' ? window.location.origin : "https://practizone.local",
            "X-Title": "PractiZone Medical PRM"
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        let errorMessage = "Unknown API Error";
        try {
            const errorJson = await response.json();
            if (errorJson.error) {
                errorMessage = typeof errorJson.error === 'string' 
                    ? errorJson.error 
                    : (errorJson.error.message || JSON.stringify(errorJson.error));
            } else if (errorJson.message) {
                errorMessage = errorJson.message;
            }
        } catch (e) {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }

        if (response.status === 401) {
            throw new Error(`Authentication Failed: ${errorMessage}. The API Key may be invalid or missing credits.`);
        }
        throw new Error(`AI Provider Error (${response.status}): ${errorMessage}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "No response content.";
    const reasoning = data.choices?.[0]?.message?.reasoning_content || null;

    return {
        text: content,
        sources: [], 
        reasoning_details: reasoning ? { text: reasoning } : null
    };

  } catch (error: any) {
    const finalMsg = error.message || String(error);
    console.error("AI_CHAT_FAILURE:", finalMsg);
    throw new Error(finalMsg);
  }
};

export const generateEmbedding = async (text: string): Promise<number[] | null> => {
    return new Array(768).fill(0).map(() => Math.random());
};

export const generateImage = async (prompt: string) => null;
export const generateMedicalVideo = async (prompt: string) => null;
export const transcribeAudio = async (base64Data: string, mimeType: string) => "Transcription unavailable.";
