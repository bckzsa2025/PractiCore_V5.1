
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Service, Doctor, Appointment, User } from "../types";
import { apiClient } from "../libs/api";

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
    name: 'Dr. Sarah Smith', 
    specialty: 'Senior Practitioner', 
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=300',
    bio: 'A dedicated medical professional with a focus on family health and preventative care. Committed to providing patient-centered treatment plans.'
  }, 
  { 
    id: 'ai_assistant', 
    name: 'Nurse Betty', 
    specialty: 'Online Medical Assistant (AI)', 
    image: 'https://cdn-icons-png.flaticon.com/512/4712/4712035.png',
    bio: 'Nurse Betty is the advanced AI assistant for MediCore. Always available to help with triage, scheduling, and general medical inquiries.'
  }, 
];

const STORAGE_KEY_APPTS = 'medicore_appointments';

// Mock API Functions
export const getAvailableSlots = (date: Date, doctorId: string): string[] => {
  const slots = [
    '09:15', '09:45', '10:15', '11:00', '12:30', '14:00', '15:15', '16:00'
  ];
  return slots.filter(() => Math.random() > 0.3);
};

export const saveAppointment = async (appt: Omit<Appointment, 'id'>): Promise<Appointment> => {
  // Use the central API client to save, ensuring it hits IndexedDB
  // Mapping the loose "Omit" type to the strict AppointmentCreate type is handled here loosely for the mock
  return apiClient.appointments.create({
      patientId: appt.patientId,
      doctorId: appt.doctorId,
      serviceId: appt.serviceId,
      start: appt.date,
      reason: appt.notes || "Web Booking",
      contactMethod: "email"
  });
};

export const sendConfirmationEmail = async (email: string, details: any): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Log to Persistent DB
  await apiClient.logs.add(
      `📧 EMAIL SENT to ${email} | Subject: Booking Confirmed | Content: ${JSON.stringify(details)}`, 
      'info'
  );
  
  console.group("📧 [EMAIL SERVICE] Sending Confirmation");
  console.log(`To: ${email}`);
  console.log("Subject: Appointment Confirmation - MediCore");
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
  return apiClient.auth.login(email);
};
