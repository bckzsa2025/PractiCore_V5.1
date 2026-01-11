
import React, { useState } from 'react';
import { ShieldCheck, Scale, AlertTriangle, FileText, Globe, Check, Bot, Lock, Database, UserCheck, HeartPulse, ShieldAlert, ZapOff } from 'lucide-react';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import { SaILabsBadge } from '../components/ui/SaILabsBadge';

interface LegalProps {
    onLoginClick: () => void;
    onHomeClick: () => void;
}

const Legal: React.FC<LegalProps> = ({ onLoginClick, onHomeClick }) => {
  const [activeTab, setActiveTab] = useState<'tos' | 'disclaimer' | 'ai_disclaimer' | 'waiver' | 'licenses'>('tos');

  // Helper for Version/Timestamp
  const DocHeader = ({ title, version, updated }: { title: string, version: string, updated: string }) => (
      <div className="border-b border-slate-200 pb-4 mb-6">
          <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
          <div className="flex gap-4 mt-2 text-xs text-slate-500">
              <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-mono">v{version}</span>
              <span>Last Updated: {updated}</span>
          </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header onLoginClick={onLoginClick} onHomeClick={onHomeClick} />
      
      <div className="bg-slate-900 text-white py-12">
          <div className="max-w-4xl mx-auto px-4 text-center">
              <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-white/20">
                  <ShieldCheck className="w-4 h-4" /> Compliance & Governance
              </div>
              <h1 className="text-3xl font-display font-bold">Legal Documentation</h1>
              <p className="text-slate-400 mt-2">Transparency, terms of use, and regulatory information for MediCore.</p>
          </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 flex-1 w-full">
          <div className="flex flex-col md:flex-row gap-8">
              {/* Sidebar Menu */}
              <div className="w-full md:w-72 shrink-0 space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase px-4 mb-2">Policy Categories</p>
                  
                  <button onClick={() => setActiveTab('tos')} className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold flex items-center gap-3 transition-all ${activeTab === 'tos' ? 'bg-primary text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}>
                      <FileText className="w-4 h-4" /> Terms of Service
                  </button>
                  <button onClick={() => setActiveTab('disclaimer')} className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold flex items-center gap-3 transition-all ${activeTab === 'disclaimer' ? 'bg-primary text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}>
                      <AlertTriangle className="w-4 h-4" /> Medical Disclaimer
                  </button>
                  <button onClick={() => setActiveTab('ai_disclaimer')} className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold flex items-center gap-3 transition-all ${activeTab === 'ai_disclaimer' ? 'bg-primary text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}>
                      <Bot className="w-4 h-4" /> AI Usage Policy
                  </button>
                  <button onClick={() => setActiveTab('waiver')} className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold flex items-center gap-3 transition-all ${activeTab === 'waiver' ? 'bg-primary text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}>
                      <Scale className="w-4 h-4" /> Liability Waiver
                  </button>
                  <button onClick={() => setActiveTab('licenses')} className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold flex items-center gap-3 transition-all ${activeTab === 'licenses' ? 'bg-primary text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}>
                      <ShieldCheck className="w-4 h-4" /> Professional Licenses
                  </button>
                  
                  <div className="mt-8 px-4">
                      <SaILabsBadge size="sm" />
                  </div>
              </div>

              {/* Document Viewport */}
              <div className="flex-1 bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200 min-h-[600px]">
                  
                  {activeTab === 'tos' && (
                      <div className="prose prose-slate max-w-none text-sm">
                          <DocHeader title="Terms of Service" version="1.2.0" updated="January 20, 2025" />
                          <p>Welcome to the MediCore Practice Management System ("MediCore"). By accessing or using our Service, you agree to be bound by these Terms.</p>
                          
                          <h4>1. Use of Services</h4>
                          <p>You may use our Services only if you can form a binding contract with us, and only in compliance with these Terms and all applicable laws. When you create your MediCore account, you must provide us with accurate and complete information.</p>
                          
                          <h4>2. Patient Responsibilities</h4>
                          <p>You agree to provide accurate medical history and attend scheduled appointments. Cancellation fees may apply if notice is not given within 24 hours.</p>
                          
                          <h4>3. Data Protection (POPIA)</h4>
                          <p>We are committed to protecting your personal information. All data is processed in accordance with the Protection of Personal Information Act (POPIA). By using this service, you consent to the processing of your data for medical administration purposes.</p>
                          
                          <h4>4. Governing Law</h4>
                          <p>These Terms shall be governed by the laws of the Republic of South Africa.</p>
                      </div>
                  )}

                  {activeTab === 'disclaimer' && (
                      <div className="prose prose-slate max-w-none text-sm">
                          <DocHeader title="Medical Disclaimer" version="1.0.0" updated="January 15, 2024" />
                          
                          <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r mb-6">
                              <div className="flex items-center gap-2 text-rose-700 font-bold mb-1">
                                  <ShieldAlert className="w-5 h-5" /> EMERGENCY WARNING
                              </div>
                              <p className="text-rose-800 m-0">IF YOU HAVE A MEDICAL EMERGENCY, CALL 10177 OR GO TO THE NEAREST HOSPITAL IMMEDIATELY. DO NOT USE THIS PLATFORM FOR ACUTE OR LIFE-THREATENING ISSUES.</p>
                          </div>

                          <h4>1. No Medical Advice</h4>
                          <p>The contents of this website, including text, graphics, images, and other material contained on the website ("Content") are for informational purposes only. The Content is not intended to be a substitute for professional medical advice, diagnosis, or treatment.</p>
                          
                          <h4>2. Doctor-Patient Relationship</h4>
                          <p>Use of this website does not create a doctor-patient relationship. Such a relationship is established only after an in-person consultation or a formal telehealth session with a qualified practitioner.</p>
                      </div>
                  )}

                  {activeTab === 'ai_disclaimer' && (
                      <div className="prose prose-slate max-w-none text-sm">
                          <DocHeader title="Nurse Betty AI Usage Policy" version="2.2.0" updated="February 10, 2025" />
                          
                          <div className="flex items-start gap-4 bg-cyan-50 border border-cyan-200 p-6 rounded-2xl mb-8">
                              <Bot className="w-12 h-12 text-cyan-600 shrink-0" />
                              <div>
                                  <h4 className="text-cyan-900 font-bold m-0 text-lg">AI Assistant Notice</h4>
                                  <p className="text-cyan-800 m-0 text-sm mt-1 leading-relaxed">Nurse Betty is an advanced Large Language Model (LLM) designed for administrative support and patient education. It is an automated system managed by SA-iLabs™.</p>
                              </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 not-prose">
                              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                  <div className="flex items-center gap-2 text-slate-800 font-bold mb-2">
                                      <ZapOff className="w-4 h-4 text-amber-500" />
                                      Key Limitations
                                  </div>
                                  <ul className="text-xs text-slate-600 space-y-2">
                                      <li className="flex gap-2"><Check className="w-3 h-3 text-emerald-500 shrink-0" /> Cannot perform clinical diagnosis.</li>
                                      <li className="flex gap-2"><Check className="w-3 h-3 text-emerald-500 shrink-0" /> May generate "hallucinated" or inaccurate data.</li>
                                      <li className="flex gap-2"><Check className="w-3 h-3 text-emerald-500 shrink-0" /> Responses are not verified in real-time.</li>
                                  </ul>
                              </div>
                              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                  <div className="flex items-center gap-2 text-slate-800 font-bold mb-2">
                                      <Lock className="w-4 h-4 text-emerald-500" />
                                      Data & Privacy
                                  </div>
                                  <ul className="text-xs text-slate-600 space-y-2">
                                      <li className="flex gap-2"><Check className="w-3 h-3 text-emerald-500 shrink-0" /> Encrypted via TLS 1.3 in transit.</li>
                                      <li className="flex gap-2"><Check className="w-3 h-3 text-emerald-500 shrink-0" /> Prompts are anonymized before processing.</li>
                                      <li className="flex gap-2"><Check className="w-3 h-3 text-emerald-500 shrink-0" /> Compliant with POPIA standards.</li>
                                  </ul>
                              </div>
                          </div>

                          <h4>1. Role of the AI Assistant</h4>
                          <p>Interaction with Nurse Betty does not constitute a doctor-patient relationship. Reliance on any information provided by the AI is strictly at your own risk. Always seek the advice of a qualified health provider with any questions you may have regarding a medical condition.</p>

                          <h4>2. No Liability for Hallucinations</h4>
                          <p>While we strive to keep the AI's medical knowledge grounded via reputable sources, medical science changes rapidly. The AI may provide outdated or contextually inappropriate information. MediCore and SA-iLabs™ expressly disclaim all liability for actions taken based on AI responses.</p>

                          <h4>3. Third-Party Processing</h4>
                          <p>We utilize enterprise-grade AI providers (Google Cloud Vertex AI, OpenRouter). By using the chat or voice features, you consent to the transmission of your queries to these secure third-party processors. No personally identifiable health records (PII) are stored permanently by these models.</p>

                          <h4>4. Voice & Audio Processing</h4>
                          <p>If utilizing "Voice Mode", your audio is streamed for immediate transcription and inference. Audio data is not recorded or archived, though text transcripts are saved locally to your device to maintain chat history continuity.</p>
                      </div>
                  )}

                  {activeTab === 'waiver' && (
                      <div className="prose prose-slate max-w-none text-sm">
                          <DocHeader title="Liability Waiver" version="1.0.0" updated="January 15, 2024" />
                          <p>By using the telecommunications and AI services provided by MediCore, you hereby waive certain liabilities.</p>
                          <h4>1. Technology Failure</h4>
                          <p>We are not liable for any delays or failures in communication caused by internet service providers, power outages, or software bugs.</p>
                          <h4>2. Third-Party Services</h4>
                          <p>This application uses third-party services (Google Cloud, Twilio, OpenRouter) for functionality. We are not responsible for the data handling practices of these external entities beyond our configuration control.</p>
                      </div>
                  )}

                  {activeTab === 'licenses' && (
                      <div className="prose prose-slate max-w-none text-sm">
                          <DocHeader title="Professional Licenses" version="1.0.0" updated="January 15, 2024" />
                          <ul className="list-disc pl-5 space-y-2">
                              <li><strong>Registration:</strong> MediCore provides software services to registered Health Professionals.</li>
                              <li><strong>Software License:</strong> MediCore™ is licensed under a proprietary agreement with SA-iLabs™©.</li>
                              <li><strong>Open Source:</strong> This application utilizes React, Lucide, and other open-source libraries under MIT License.</li>
                          </ul>
                      </div>
                  )}

              </div>
          </div>
      </div>

      <Footer onLoginClick={onLoginClick} onHomeClick={onHomeClick} />
    </div>
  );
};

export default Legal;
