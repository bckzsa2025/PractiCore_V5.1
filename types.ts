
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

export interface Supplier {
    id: string;
    name: string;
    category: string; // e.g., 'Medical Supplies', 'Pharma', 'IT'
    contactPerson: string;
    email: string;
    phone: string;
}

export interface Service {
  id: string;
  name: string;
  category: string; // Added Category field
  duration: number; // minutes
  price: number;
  description: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image?: string;
  bio?: string; // Added for individual profiles
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  serviceId: string;
  date: string; // ISO string
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
    reasoning_details?: any; // For OpenRouter/Reasoning models
}

export interface TwilioConfig {
    accountSid: string;
    authToken: string;
    phoneNumber: string;
    webhookUrl: string;
}

export interface AISettings {
  provider: 'openrouter' | 'custom';
  apiKey: string;
  endpoint: string; // Required for custom providers
  models: {
    chat: string;
  };
}
