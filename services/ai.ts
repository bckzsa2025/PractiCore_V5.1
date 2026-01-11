
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { AIMessage, AISettings, Attachment } from "../types";
import { apiClient } from "../libs/api";
import { GoogleGenAI, FunctionDeclaration, Type } from "@google/genai";
import { generateEmbedding as generateEmbeddingUtil } from "../libs/vectorEngine";

// ---------------------------------------------------------------------------
// CONFIGURATION & INIT
// ---------------------------------------------------------------------------

// Fallback for development if process.env is not hydrated by the build system
const API_KEY = process.env.API_KEY || (import.meta as any).env?.VITE_GOOGLE_API_KEY || '';

export const getEffectiveApiKey = (apiKey?: string): string => {
    return apiKey && apiKey.trim().length > 0 ? apiKey : API_KEY;
};

// Global default client (using env key)
const defaultClient = new GoogleGenAI({ apiKey: API_KEY });

// ---------------------------------------------------------------------------
// TOOL DEFINITIONS
// ---------------------------------------------------------------------------

const generateImageTool: FunctionDeclaration = {
    name: 'generate_medical_image',
    description: 'Generates a medical diagram, anatomical illustration, or visual aid based on a description.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            prompt: {
                type: Type.STRING,
                description: 'Detailed description of the medical visual to generate.'
            }
        },
        required: ['prompt']
    }
};

const generateVideoTool: FunctionDeclaration = {
    name: 'generate_educational_video',
    description: 'Generates a short educational video or animation explaining a medical concept.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            topic: {
                type: Type.STRING,
                description: 'The medical concept to animate (e.g. "How the heart pumps blood").'
            }
        },
        required: ['topic']
    }
};

// ---------------------------------------------------------------------------
// CORE SERVICES
// ---------------------------------------------------------------------------

/**
 * Orchestrates the conversation using Gemini 2.5 Flash as the reasoning engine.
 * Handles RAG (Retrieval) and Tool Execution (Image/Video generation).
 */
export const chatWithAi = async (
    history: AIMessage[], 
    newMessage: string | null, 
    imageData?: { data: string, mimeType: string } | null,
    systemInstruction?: string,
    overrideSettings?: AISettings
): Promise<{ text: string, sources: any[], attachments?: Attachment[] }> => {
  
  // 1. Resolve Configuration (Admin overrides take precedence over code defaults)
  let activeSettings = overrideSettings;
  if (!activeSettings) {
      try {
          activeSettings = await apiClient.settings.getAI();
      } catch (e) { /* ignore */ }
  }

  const effectiveKey = getEffectiveApiKey(activeSettings?.apiKey);
  if (!effectiveKey) throw new Error("Google API Key is missing. Please configure VITE_GOOGLE_API_KEY.");

  const client = (activeSettings?.apiKey && activeSettings.apiKey !== API_KEY) 
      ? new GoogleGenAI({ apiKey: effectiveKey }) 
      : defaultClient;

  // 2. RAG Retrieval Step
  let contextBlock = "";
  let sources: any[] = [];
  
  if (newMessage) {
      try {
          const docs = await apiClient.knowledge.search(newMessage, 2);
          if (docs.length > 0) {
              contextBlock = `\n[PRACTICE KNOWLEDGE BASE]:\n${docs.map(d => `- ${d.text} (Source: ${d.source})`).join('\n')}\n`;
              sources = docs.map(d => ({ title: d.source, uri: '#' }));
          }
      } catch (e) {
          console.warn("RAG Retrieval failed:", e);
      }
  }

  // 3. Build System Prompt
  let finalInstruction = systemInstruction || activeSettings?.systemInstruction || "";
  
  if (!finalInstruction) {
      const practice = await apiClient.practice.get();
      finalInstruction = `You are ${practice.aiName}, an advanced medical assistant for ${practice.name}.
      Identity: ${practice.aiBio}
      Practice Info: ${practice.phone}, ${practice.email}, ${practice.address}. 
      Hours: ${practice.workingHours}.
      
      Capabilities:
      - Answer questions using the Knowledge Base.
      - Generate medical diagrams (use generate_medical_image).
      - Create educational videos (use generate_educational_video).
      
      ${contextBlock}
      
      Rules: 
      - Always disclaim that you are an AI and not a doctor. 
      - If specific medical advice is asked, recommend booking an appointment.
      - Be concise and professional.`;
  }

  // 4. Construct Message History
  const contents = history.map(msg => {
      // Map existing attachments in history to multimodal parts if needed, 
      // but for now we mainly map text. Simplification for MVP.
      return {
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content || '' }]
      };
  });
  
  if (newMessage || imageData) {
      const parts: any[] = [];
      if (newMessage) parts.push({ text: newMessage });
      if (imageData) {
          // Extract base64 if it has prefix
          const base64Data = imageData.data.includes(',') 
              ? imageData.data.split(',')[1] 
              : imageData.data;
              
          parts.push({
              inlineData: {
                  mimeType: imageData.mimeType,
                  data: base64Data
              }
          });
      }
      contents.push({ role: 'user', parts });
  }

  try {
    // 5. Call Gemini 2.5 Flash
    const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
            systemInstruction: finalInstruction,
            tools: [{ functionDeclarations: [generateImageTool, generateVideoTool] }],
            temperature: 0.7,
        }
    });

    const result = response;
    let replyText = result.text || "";
    let attachments: Attachment[] = [];

    // 6. Handle Function Calls (Tools)
    const functionCalls = result.functionCalls;
    if (functionCalls && functionCalls.length > 0) {
        for (const call of functionCalls) {
            if (call.name === 'generate_medical_image') {
                const prompt = (call.args as any).prompt;
                replyText += `\n\n[Generating image for: "${prompt}"...]`;
                const image = await generateImage(prompt);
                if (image) attachments.push(image);
            }
            if (call.name === 'generate_educational_video') {
                const topic = (call.args as any).topic;
                replyText += `\n\n[Generating video for: "${topic}"...]`;
                const video = await generateMedicalVideo(topic);
                if (video) attachments.push(video);
            }
        }
    }

    return { 
        text: replyText, 
        sources: sources,
        attachments: attachments
    };

  } catch (error: any) {
    console.error("AI Service Error:", error);
    throw new Error(error.message || "AI Service unavailable.");
  }
};

/**
 * Generates an image using Gemini 2.5 Flash Image model.
 */
export const generateImage = async (prompt: string): Promise<Attachment | null> => {
    try {
        const response = await defaultClient.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }]
            },
            config: {
                imageConfig: {
                    aspectRatio: "1:1",
                }
            }
        });

        // Extract image from response parts
        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.data) {
                    return {
                        type: 'image',
                        url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
                    };
                }
            }
        }
        return null;
    } catch (e) {
        console.error("Image Generation Failed:", e);
        return null;
    }
};

/**
 * Generates a video using Veo (Preview).
 */
export const generateMedicalVideo = async (prompt: string): Promise<Attachment | null> => {
    try {
        let operation = await defaultClient.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: `Educational medical animation: ${prompt}. Photorealistic, clear, high quality.`,
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '16:9'
            }
        });

        // Polling loop for video generation
        let retries = 0;
        while (!operation.done && retries < 20) { // Max 20 attempts (~2 mins)
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s
            operation = await defaultClient.operations.getVideosOperation({ operation: operation });
            retries++;
        }

        const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (videoUri) {
            const fetchUrl = `${videoUri}&key=${API_KEY}`;
            return {
                type: 'video',
                url: fetchUrl
            };
        }
        return null;
    } catch (e) {
        console.error("Video Generation Failed:", e);
        return null;
    }
};

export const generateEmbedding = generateEmbeddingUtil;
