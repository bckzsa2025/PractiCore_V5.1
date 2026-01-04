
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Service, Doctor, Appointment, User } from "../types";

// Updated Pricing Structure per Spec
export const SERVICES: Service[] = [
  { 
    id: 's1', 
    name: 'Standard Consultation', 
    category: 'General Care', 
    duration: 30, 
    price: 450, 
    description: 'Comprehensive assessment and diagnosis. Medical Aid accepted.' 
  },
  { 
    id: 's2', 
    name: 'First Consult (Token)', 
    category: 'General Care', 
    duration: 30, 
    price: 250, 
    description: 'New Patient Special (Cash Only). Requires Reward Token redemption.' 
  },
  { 
    id: 's3', 
    name: 'Chronic Management', 
    category: 'Chronic Care', 
    duration: 30, 
    price: 450, 
    description: 'Follow-up for diabetes, hypertension, and ongoing care plans.' 
  },
  { 
    id: 's4', 
    name: 'Pediatric Check-up', 
    category: 'Pediatrics', 
    duration: 30, 
    price: 450, 
    description: 'Child health monitoring, milestones, and general wellness.' 
  },
  { 
    id: 's5', 
    name: 'Minor Procedures', 
    category: 'Procedures', 
    duration: 60, 
    price: 0, // Quoted individually
    description: 'Stitching, mole removal, wound care. Quoted per case.' 
  },
  { 
    id: 's6', 
    name: 'Telehealth Session', 
    category: 'Telehealth', 
    duration: 20, 
    price: 350, 
    description: 'Remote video consultation via secure portal.' 
  },
];

export const DOCTORS: Doctor[] = [
  { 
    id: 'd1', 
    name: 'Dr. Beate Setzer', 
    specialty: 'General Practitioner (MBChB Wits)', 
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=300',
    bio: 'With over 30 years of clinical experience, Dr. Setzer provides comprehensive, compassionate family healthcare. She focuses on accurate diagnosis, chronic disease management, and preventative wellness for all ages.'
  }, 
  { 
    id: 'ai_assistant', 
    name: 'Nurse Beate-Ai', 
    specialty: 'Online Medical Assistant (AI)', 
    image: 'https://cdn-icons-png.flaticon.com/512/4712/4712035.png',
    bio: 'Nurse Beate-Ai is the practice’s dedicated digital assistant, powered by advanced artificial intelligence. Available 24/7, she facilitates appointment bookings, provides general medical information, and assists with administrative triage. Please Note: Nurse Beate-Ai is a software entity, not a human being. She does not diagnose conditions, prescribe medication, or replace the professional judgment of Dr. Setzer. She is here to ensure you have constant access to support and information.'
  }, 
];

const STORAGE_KEY_APPTS = 'dr_setzer_appointments';

// Mock API Functions
export const getAvailableSlots = (date: Date, doctorId: string): string[] => {
  const slots = [
    '09:15', '09:45', '10:15', '11:00', '12:30', '14:00', '15:15', '16:00'
  ];
  return slots.filter(() => Math.random() > 0.3);
};

export const saveAppointment = async (appt: Omit<Appointment, 'id'>): Promise<Appointment> => {
  const newAppt: Appointment = {
    ...appt,
    id: Math.random().toString(36).substr(2, 9),
  };
  const existing = getAppointments();
  const updated = [...existing, newAppt];
  localStorage.setItem(STORAGE_KEY_APPTS, JSON.stringify(updated));
  await new Promise(resolve => setTimeout(resolve, 800));
  return newAppt;
};

export const sendConfirmationEmail = async (email: string, details: any): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.group("📧 [EMAIL SERVICE] Sending Confirmation");
  console.log(`To: ${email}`);
  console.log("Subject: Appointment Confirmation - Dr. Beate Setzer");
  console.log(JSON.stringify(details, null, 2));
  console.groupEnd();
};

export const getAppointments = (): Appointment[] => {
  const stored = localStorage.getItem(STORAGE_KEY_APPTS);
  return stored ? JSON.parse(stored) : [];
};

export const getAppointmentsForPatient = (patientId: string): Appointment[] => {
  return getAppointments().filter(a => a.patientId === patientId);
};

export const loginUser = async (email: string): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    id: 'p_12345',
    name: 'Alex Thompson',
    email: email,
    role: 'patient',
    phone: '+27 72 555 1234',
    medicalSummary: {
      allergies: ['Penicillin', 'Peanuts'],
      conditions: ['Mild Asthma']
    }
  };
};
