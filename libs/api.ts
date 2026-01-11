
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Appointment, AppointmentCreate, TwilioConfig, AISettings, Supplier, PracticeConfig, Service, Doctor, AIMessage } from '../types';
import { db } from './db'; 
import { vectorEngine } from './vectorEngine';

// Seed Data Defaults - WHITE LABEL
const DEFAULT_SERVICES: Service[] = [
  { id: 's1', name: 'General Consultation', category: 'General Care', duration: 30, price: 500, description: 'Standard medical assessment and diagnosis.' },
  { id: 's2', name: 'Follow-up Visit', category: 'General Care', duration: 15, price: 300, description: 'Review of progress and medication adjustment.' },
  { id: 's3', name: 'Telehealth Consult', category: 'Telehealth', duration: 20, price: 350, description: 'Remote video consultation via secure portal.' },
  { id: 's4', name: 'Wellness Screening', category: 'Preventative', duration: 45, price: 850, description: 'Full body checkup including vitals and blood pressure.' }
];

const DEFAULT_DOCTORS: Doctor[] = [
  { 
      id: 'd1', 
      name: 'Dr. Sarah Smith', 
      specialty: 'Senior Practitioner', 
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=300', 
      bio: 'A dedicated medical professional with a focus on family health and preventative care. Committed to providing patient-centered treatment plans.' 
  },
  { 
      id: 'd2', 
      name: 'Dr. John Doe', 
      specialty: 'General Practitioner', 
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300&h=300', 
      bio: 'Experienced in acute care and chronic disease management. Passionate about using technology to improve patient outcomes.' 
  },
  { 
      id: 'ai_assistant', 
      name: 'Nurse Betty', 
      specialty: 'AI Medical Support', 
      image: 'https://cdn-icons-png.flaticon.com/512/4712/4712035.png', 
      bio: 'Nurse Betty is the advanced AI assistant for MediCore. Always available to help with triage, scheduling, and general medical inquiries.' 
  }
];

const DEFAULT_PRACTICE: PracticeConfig = {
    name: "MediCore Medical Centre",
    email: "admin@medicore.local",
    phone: "+27 21 000 0000",
    address: "123 Wellness Way, Health City, 8000",
    workingHours: "Mon-Fri: 08:00-17:00 | Sat: 09:00-13:00",
    emergencyPhone: "10111",
    aiName: "Nurse Betty",
    aiBio: "I am Nurse Betty, the virtual assistant for MediCore Medical Centre. I can help with appointments, general inquiries, and symptom triage.",
    currency: "R"
};

export interface ChatSession {
    id: string;
    title: string;
    messages: AIMessage[];
    timestamp: number;
}

class ApiClient {
  public db = db;
  private initialized = false;

  constructor() {
      this.initVectorStore();
  }

  // Load persistent vectors into memory on boot
  private async initVectorStore() {
      if (this.initialized) return;
      const vectors = await db.getAll<any>('vectors');
      if (vectors.length > 0) {
          vectors.forEach(v => vectorEngine.add(v.id, v.text, { source: v.source }));
      } else {
          // Index default data
          vectorEngine.add('default_hours', DEFAULT_PRACTICE.workingHours, { source: 'Practice Hours' });
          vectorEngine.add('default_address', DEFAULT_PRACTICE.address, { source: 'Location' });
          vectorEngine.add('default_services', DEFAULT_SERVICES.map(s => s.name).join(', '), { source: 'Services' });
      }
      this.initialized = true;
  }

  // --- Practice Config Module ---
  practice = {
      get: async (): Promise<PracticeConfig> => {
          const config = await db.get<{key: string, value: PracticeConfig}>('config', 'practice_info');
          if (!config) {
              await db.put('config', { key: 'practice_info', value: DEFAULT_PRACTICE });
              return DEFAULT_PRACTICE;
          }
          return config.value;
      },
      update: async (data: PracticeConfig): Promise<void> => {
          await db.put('config', { key: 'practice_info', value: data });
          window.dispatchEvent(new Event('practice-config-update'));
      }
  };

  // --- Services Module ---
  services = {
      list: async (): Promise<Service[]> => {
          const list = await db.getAll<Service>('services');
          if (list.length === 0) {
              for (const s of DEFAULT_SERVICES) await db.put('services', s);
              return DEFAULT_SERVICES;
          }
          return list;
      },
      save: async (svc: Service) => db.put('services', svc),
      delete: async (id: string) => db.delete('services', id)
  };

  // --- Doctors Module ---
  doctors = {
      list: async (): Promise<Doctor[]> => {
          const list = await db.getAll<Doctor>('doctors');
          if (list.length === 0) {
              for (const d of DEFAULT_DOCTORS) await db.put('doctors', d);
              return DEFAULT_DOCTORS;
          }
          return list;
      },
      save: async (doc: Doctor) => db.put('doctors', doc),
      delete: async (id: string) => db.delete('doctors', id)
  };

  // --- Auth Module ---
  auth = {
    login: async (email: string): Promise<User> => {
       const users = await db.getAll<User>('users');
       let user = users.find(u => u.email === email);
       if (!user) {
           const role = email.includes('admin') || email.includes('dev') ? (email.includes('dev') ? 'developer' : 'admin') : 'patient';
           user = { id: 'u_' + Math.random().toString(36).substr(2, 5), name: email.split('@')[0], email, role, medicalSummary: { conditions: [], allergies: [] } };
           await db.put('users', user);
       }
       localStorage.setItem('access_token', "virtual_session_" + Date.now());
       return user;
    }
  };

  // --- Appointments Module ---
  appointments = {
    list: async (patientId?: string): Promise<Appointment[]> => patientId ? db.getByIndex('appointments', 'patientId', patientId) : db.getAll('appointments'),
    create: async (data: AppointmentCreate): Promise<Appointment> => {
        const newAppt: Appointment = { id: 'apt_' + Date.now(), ...data, date: data.start, status: 'confirmed', type: data.serviceId === 's6' ? 'telehealth' : 'in-person' };
        await db.put('appointments', newAppt);
        return newAppt;
    }
  };
  
  patients = {
    get: async (id: string): Promise<User | undefined> => db.get('users', id),
    update: async (user: User): Promise<User> => { await db.put('users', user); return user; },
    bulkCreate: async (patients: User[]): Promise<{success: boolean, count: number}> => {
        for (const p of patients) await db.put('users', p);
        return { success: true, count: patients.length };
    }
  };

  suppliers = {
      list: async (): Promise<Supplier[]> => db.getAll('suppliers'),
      bulkCreate: async (suppliers: Supplier[]): Promise<{success: boolean, count: number}> => {
          for (const s of suppliers) await db.put('suppliers', s);
          return { success: true, count: suppliers.length };
      }
  };

  content = {
      upload: async (key: string, dataUrl: string): Promise<void> => {
          await db.put('content', { key, value: dataUrl });
          window.dispatchEvent(new Event('local-cms-update'));
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
                  const docId = 'doc_' + Date.now();
                  const doc = { id: docId, patientId, name: file.name, type: 'upload', date: new Date().toLocaleDateString(), source: 'Portal Upload', data: e.target?.result };
                  await db.put('documents', doc);
                  
                  // Index for RAG
                  const indexText = `Document: ${file.name} uploaded by patient ${patientId}. Date: ${doc.date}.`;
                  await apiClient.knowledge.add(indexText, 'document_upload');
                  
                  resolve(doc);
              };
              reader.readAsDataURL(file);
          });
      },
      list: async (patientId: string): Promise<any[]> => db.getByIndex('documents', 'patientId', patientId)
  };

  knowledge = {
      add: async (text: string, sourceName: string) => {
          const id = 'vec_' + Date.now();
          const doc = { id, text, source: sourceName, timestamp: Date.now() };
          
          // Store in DB for persistence
          await db.put('vectors', doc);
          
          // Add to In-Memory Engine
          vectorEngine.add(id, text, { source: sourceName });
          
          return doc;
      },
      search: async (query: string, limit = 2) => {
          // Use the new TF-IDF Vector Engine
          const results = vectorEngine.search(query, limit);
          return results.map(r => ({
              text: r.item.text,
              source: r.item.metadata.source,
              score: r.score
          }));
      }
  };

  logs = {
      add: async (message: string, level: 'info'|'warn'|'error'|'email'|'sms' = 'info') => {
          const logEntry = { id: Date.now(), timestamp: new Date().toISOString(), message, level };
          await db.put('logs', logEntry);
      },
      list: async () => db.getAll('logs')
  };

  settings = {
    getTwilioConfig: async (): Promise<TwilioConfig> => {
        const s = localStorage.getItem('twilio_config');
        return s ? JSON.parse(s) : { accountSid: '', authToken: '', phoneNumber: '', webhookUrl: '' };
    },
    saveTwilioConfig: async (config: TwilioConfig) => localStorage.setItem('twilio_config', JSON.stringify(config)),
    getAI: async (): Promise<AISettings> => {
        const s = localStorage.getItem('ai_settings');
        return s ? JSON.parse(s) : { provider: 'openrouter', apiKey: '', models: { chat: 'nex-agi/deepseek-v3.1-nex-n1:free' } };
    },
    saveAI: async (settings: AISettings) => localStorage.setItem('ai_settings', JSON.stringify(settings))
  };

  // --- Chat Sessions Module ---
  chats = {
      list: async (): Promise<ChatSession[]> => {
          const sessions = await db.getAll<ChatSession>('chats');
          return sessions.sort((a, b) => b.timestamp - a.timestamp);
      },
      get: async (id: string): Promise<ChatSession | undefined> => {
          return db.get<ChatSession>('chats', id);
      },
      save: async (session: ChatSession): Promise<ChatSession> => {
          return db.put('chats', session);
      },
      delete: async (id: string): Promise<void> => {
          return db.delete('chats', id);
      }
  };

  webhooks = {
    twilio: {
      voice: async (transcript: string) => {
        const practice = await db.get<{key: string, value: PracticeConfig}>('config', 'practice_info');
        const name = practice?.value?.name || "the Medical Practice";
        const aiName = practice?.value?.aiName || "Nurse Betty";
        
        // Log the call interaction
        await apiClient.logs.add(`Incoming Voice Call: "${transcript}"`, 'info');

        // Context-Aware Response Logic
        // 1. Search knowledge base
        const results = vectorEngine.search(transcript, 1);
        let infoSnippet = "";
        
        if (results.length > 0 && results[0].score > 0.1) {
            infoSnippet = ` I found this info: ${results[0].item.text}.`;
        }

        // 2. Construct Response
        let text = `Hello, this is ${aiName} at ${name}.`;
        
        if (transcript.toLowerCase().includes('appointment') || transcript.toLowerCase().includes('book')) {
            text += ` I can help you book an appointment. Please visit our website or hold for a receptionist.${infoSnippet}`;
        } else if (infoSnippet) {
            text += infoSnippet + " Is there anything else?";
        } else {
            text += ` I heard you say: "${transcript}". One moment while I check our records.`;
        }

        return `<?xml version="1.0" encoding="UTF-8"?><Response><Say>${text}</Say></Response>`;
      }
    }
  };
}

export const apiClient = new ApiClient();
