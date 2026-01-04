
import React from 'react';
import { Heart, Clock, Award, Globe, GraduationCap } from 'lucide-react';
import { useContent } from '../../hooks/useContent';

const AboutUs: React.FC = () => {
  const img1 = useContent('about_team_1');
  const img2 = useContent('about_team_2');
  const img3 = useContent('about_team_3');
  const img4 = useContent('about_team_4');

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Text Content */}
          <div className="space-y-6 animate-in slide-in-from-left duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
               <Heart className="w-4 h-4" /> Meet The Doctor
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900">
              Dr. Beate Setzer <span className="text-primary block text-2xl mt-1">MBChB (Wits)</span>
            </h2>
            
            <div className="prose prose-slate text-slate-600 leading-relaxed">
              <p>
                Dr. Beate Christine Setzer is a highly experienced General Practitioner based in Rugby, Cape Town. 
                A proud graduate of the <strong>University of the Witwatersrand (Class of 1986)</strong>, she has served her community 
                for decades with stellar clinical knowledge and an exceptional bedside manner.
              </p>
              <p>
                As a German-South African physician, Dr. Setzer brings a global perspective and a culturally informed 
                approach to medicine. Her practice philosophy blends traditional clinical excellence with the 
                thoughtful integration of technology—enhancing patient outcomes without compromising the human touch.
              </p>
              <p>
                She is defined by a relentless commitment to personalized care. Her patients describe her as 
                warm, thorough, and reassuring—a doctor who listens first, then treats.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
               <div className="flex items-start gap-3">
                  <div className="bg-blue-50 p-2 rounded-lg text-primary">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Wits Alumni</h4>
                    <p className="text-sm text-slate-500">Class of 1986</p>
                  </div>
               </div>
               <div className="flex items-start gap-3">
                  <div className="bg-blue-50 p-2 rounded-lg text-primary">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Global Perspective</h4>
                    <p className="text-sm text-slate-500">German-South African</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Team Photos - Actual Practice Images */}
          <div className="relative animate-in slide-in-from-right duration-700">
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-4 translate-y-8">
                  {/* Family Wellness */}
                  <div className="bg-slate-200 rounded-2xl h-64 w-full flex items-center justify-center text-slate-400 font-bold overflow-hidden relative group shadow-lg">
                      <img src={img1} className="object-cover w-full h-full opacity-90 group-hover:opacity-100 transition-opacity" alt="Dr Setzer Consulting" />
                      <span className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold text-slate-800 shadow-sm">Patient Focused</span>
                  </div>
                  
                  {/* Top Rated */}
                  <div className="bg-slate-200 rounded-2xl h-48 w-full flex items-center justify-center text-slate-400 font-bold overflow-hidden relative group shadow-lg border border-slate-100">
                      <img src={img2} className="object-cover w-full h-full opacity-90 group-hover:opacity-100 transition-opacity" alt="Reception Desk" />
                      <span className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold text-slate-800 shadow-sm">Warm Welcome</span>
                  </div>
               </div>
               <div className="space-y-4">
                  {/* Caring Staff */}
                  <div className="bg-slate-200 rounded-2xl h-48 w-full flex items-center justify-center text-slate-400 font-bold overflow-hidden relative group shadow-lg border border-slate-100">
                      <img src={img3} className="object-cover w-full h-full opacity-90 group-hover:opacity-100 transition-opacity" alt="Kids Corner" />
                      <span className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold text-slate-800 shadow-sm">Compassionate</span>
                  </div>

                  {/* Quality Care */}
                  <div className="bg-slate-200 rounded-2xl h-64 w-full flex items-center justify-center text-slate-400 font-bold overflow-hidden relative group shadow-lg">
                      <img src={img4} className="object-cover w-full h-full opacity-90 group-hover:opacity-100 transition-opacity" alt="Consulting Room" />
                      <span className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold text-slate-800 shadow-sm">Clinical Excellence</span>
                  </div>
               </div>
            </div>
            {/* Decor element */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-primary/10 to-transparent rounded-full opacity-50 blur-3xl"></div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AboutUs;
