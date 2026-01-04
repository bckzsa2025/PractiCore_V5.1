/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 🧠 PRACTIZONE™© - API CONTROLLER
 * Acts as the 'Virtual Server', routing requests to the LocalDatabase.
 */

import { User, Appointment, AppointmentCreate, TwilioConfig, AISettings, Supplier } from '../types';
import { db } from './db'; 
import { generateEmbedding } from '../services/ai';

// Brand New OpenRouter Key provided by user
const OPENROUTER_KEY = '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';

// Helper: Cosine Similarity for RAG
function cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dot += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

class ApiClient {
  private token: string | null = localStorage.getItem('access_token');
  private callSessions: Map<string, { role: string, parts: any[] }[]> = new Map();

  // Expose DB for direct access in DevConsole
  public db = db;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('access_token', token);
  }

  logout() {
    this.token = null;
    localStorage.removeItem('access_token');
    window.location.reload();
  }

  // --- Auth Module ---
  auth = {
    login: async (email: string): Promise<User> => {
       const users = await db.getAll<User>('users');
       let user = users.find(u => u.email === email);
       
       if (!user) {
           const role = email.includes('admin') || email.includes('dev') ? (email.includes('dev') ? 'developer' : 'admin') : 'patient';
           user = {
               id: 'u_' + Math.random().toString(36).substr(2, 5),
               name: email.split('@')[0] || 'User',
               email: email,
               role: role,
               medicalSummary: { conditions: [], allergies: [] }
           };
           await db.put('users', user);
       }
       
       this.setToken("virtual_session_" + Date.now());
       return user;
    }
  };

  // --- Appointments Module ---
  appointments = {
    list: async (patientId?: string): Promise<Appointment[]> => {
        if (patientId) {
            return db.getByIndex('appointments', 'patientId', patientId);
        }
        return db.getAll('appointments');
    },
    create: async (data: AppointmentCreate): Promise<Appointment> => {
        const newAppt: Appointment = {
            id: 'apt_' + Date.now(),
            ...data,
            date: data.start, 
            status: 'confirmed', 
            type: data.serviceId === 's6' ? 'telehealth' : 'in-person'
        };
        await db.put('appointments', newAppt);
        return newAppt;
    }
  };
  
  // --- Patient Module ---
  patients = {
    get: async (id: string): Promise<User | undefined> => db.get('users', id),
    update: async (user: User): Promise<User> => {
        await db.put('users', user);
        return user;
    },
    bulkCreate: async (patients: User[]): Promise<{success: boolean, count: number}> => {
        for (const p of patients) await db.put('users', p);
        return { success: true, count: patients.length };
    }
  };

  // --- Suppliers Module ---
  suppliers = {
      list: async (): Promise<Supplier[]> => db.getAll('suppliers'),
      bulkCreate: async (suppliers: Supplier[]): Promise<{success: boolean, count: number}> => {
          for (const s of suppliers) await db.put('suppliers', s);
          return { success: true, count: suppliers.length };
      }
  };

  // --- Documents & Content (Images) Module ---
  content = {
      upload: async (key: string, dataUrl: string): Promise<void> => {
          await db.put('content', { key, value: dataUrl });
          setTimeout(() => {
              window.dispatchEvent(new Event('local-cms-update'));
          }, 100);
      },
      get: async (key: string): Promise<string | null> => {
          const item = await db.get<{key: string, value: string}>('content', key);
          return item ? item.value : null;
      }
  };

  documents = {
      upload: async (patientId: string, file: File): Promise<any> => {
          return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = async (e) => {
                  const dataUrl = e.target?.result;
                  const doc = {
                      id: 'doc_' + Date.now(),
                      patientId,
                      name: file.name,
                      type: 'upload',
                      date: new Date().toLocaleDateString(),
                      source: 'Portal Upload',
                      data: dataUrl 
                  };
                  await db.put('documents', doc);
                  resolve(doc);
              };
              reader.onerror = reject;
              reader.readAsDataURL(file);
          });
      },
      list: async (patientId: string): Promise<any[]> => {
          return db.getByIndex('documents', 'patientId', patientId);
      }
  };

  // --- AI Knowledge Base (RAG) ---
  knowledge = {
      add: async (text: string, sourceName: string) => {
          const embedding = await generateEmbedding(text);
          const doc = {
              id: 'vec_' + Date.now(),
              text,
              source: sourceName,
              embedding: embedding || [],
              timestamp: Date.now()
          };
          await db.put('vectors', doc);
          return doc;
      },
      search: async (query: string, limit = 3) => {
          const queryEmbedding = await generateEmbedding(query);
          if (!queryEmbedding) return [];
          const allDocs = await db.getAll<any>('vectors');
          const scored = allDocs.map(doc => ({
              ...doc,
              score: cosineSimilarity(queryEmbedding, doc.embedding)
          }));
          scored.sort((a, b) => b.score - a.score);
          return scored.slice(0, limit);
      }
  };

  // --- Settings ---
  settings = {
    getTwilioConfig: async (): Promise<TwilioConfig> => {
        const s = localStorage.getItem('twilio_config');
        return s ? JSON.parse(s) : { accountSid: '', authToken: '', phoneNumber: '', webhookUrl: '' };
    },
    saveTwilioConfig: async (config: TwilioConfig) => localStorage.setItem('twilio_config', JSON.stringify(config)),
    getAI: async (): Promise<AISettings> => {
        const s = localStorage.getItem('ai_settings');
        return s ? JSON.parse(s) : { 
            provider: 'openrouter', 
            apiKey: '', // Use fallback logic in ai.ts
            models: { 
                chat: 'nex-agi/deepseek-v3.1-nex-n1:free', 
            } 
        };
    },
    saveAI: async (settings: AISettings) => localStorage.setItem('ai_settings', JSON.stringify(settings))
  };

  // --- Telephony Webhook Simulator ---
  webhooks = {
    twilio: {
      voice: async (transcript: string) => {
        const history = this.callSessions.get('demo') || [];
        history.push({ role: 'user', parts: [{ text: transcript }] });
        
        try {
            const text = "Processing voice input via OpenRouter..."; 
            history.push({ role: 'model', parts: [{ text }] });
            this.callSessions.set('demo', history);
            return `<?xml version="1.0" encoding="UTF-8"?><Response><Say>${text}</Say></Response>`;
        } catch(e) {
            return `<?xml version="1.0"?><Response><Say>System error.</Say></Response>`;
        }
      },
      resetSession: () => this.callSessions.delete('demo')
    }
  };
}

export const apiClient = new ApiClient();
