
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'staff' | 'admin' | 'developer';
  phone?: string;
  emergencyContact?: EmergencyContact;
  medicalSummary?: {
    allergies: string[];
    conditions: string[];
  };
}

export interface PracticeConfig {
    name: string;
    email: string;
    phone: string;
    address: string;
    workingHours: string;
    emergencyPhone: string;
    aiName: string;
    aiBio: string;
    currency: string;
}

export interface Supplier {
    id: string;
    name: string;
    category: string; 
    contactPerson: string;
    email: string;
    phone: string;
}

export interface Service {
  id: string;
  name: string;
  category: string; 
  duration: number; 
  price: number;
  description: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image?: string;
  bio?: string; 
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  serviceId: string;
  date: string; 
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  notes?: string;
  type: 'in-person' | 'telehealth';
}

export interface AppointmentCreate {
    patientId: string;
    start: string;
    serviceId: string;
    doctorId: string;
    reason: string;
    contactMethod: string;
}

export interface Attachment {
    type: 'image' | 'video' | 'file';
    url: string;
}

export interface Source {
    title: string;
    uri: string;
}

export interface AIMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content?: string;
    timestamp: number;
    attachments?: Attachment[];
    sources?: Source[];
    reasoning_details?: any; 
}

export interface TwilioConfig {
    accountSid: string;
    authToken: string;
    phoneNumber: string;
    webhookUrl: string;
}

export interface AISettings {
  provider: 'openrouter' | 'custom' | 'google';
  apiKey: string;
  endpoint: string; 
  models: {
    chat: string;
  };
  systemInstruction?: string;
}
