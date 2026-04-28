import React from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  MoreHorizontal, 
  Eye, 
  ArrowRight, 
  PlusSquare,
  Search,
  Plus,
  Users,
  Compass
} from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-clinical-green animate-pulse"></span>
            <p className="font-label-caps text-label-caps text-clinical-green tracking-widest">CLINICAL AUTHORITY CONSOLE</p>
          </div>
          <h1 className="font-headline-lg text-3xl md:text-5xl text-white">Clinical Dashboard</h1>
        </div>
        <button className="glass-panel-elevated bg-clinical-green/10 hover:bg-clinical-green/20 text-clinical-green border-clinical-green/30 px-8 py-4 rounded-lg font-label-caps text-sm tracking-widest transition-all duration-300 flex items-center gap-3">
          <PlusSquare size={18} />
          <span>CREATE CLINICAL NEED</span>
        </button>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-8">
        
        {/* Discover Engineers (Spans 8 cols) */}
        <section className="col-span-12 lg:col-span-8 space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="font-headline-md text-xl md:text-2xl text-white flex items-center gap-2">
              <Compass className="text-clinical-green" />
              <span>Discover Engineering Partners</span>
            </h2>
            <div className="hidden md:flex gap-2">
              <span className="bg-white/5 px-3 py-1 rounded-full text-[10px] text-white/40 uppercase tracking-widest border border-white/10">ML / AI</span>
              <span className="bg-white/5 px-3 py-1 rounded-full text-[10px] text-white/40 uppercase tracking-widest border border-white/10">Robotics</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Engineer Card 1 */}
            <motion.div whileHover={{ y: -5 }} className="glass-panel p-6 rounded-xl flex flex-col gap-4 border-t-2 border-t-tech-navy/50">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded bg-tech-navy/10 flex items-center justify-center">
                  <Users className="text-tech-navy" />
                </div>
                <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-white/40 uppercase tracking-widest font-bold">Project Available</span>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">NeuroSync Lab</h3>
                <p className="text-white/50 text-xs mt-1">MIT • Neural Interface Specialists</p>
              </div>
              <p className="text-sm text-white/60 line-clamp-2">Looking for clinical partners to validate a non-invasive EEG wearable for seizure prediction.</p>
              <button className="mt-2 text-tech-navy hover:text-white transition-colors text-sm font-bold flex items-center gap-1 group">
                Review Proposal <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>

            {/* Engineer Card 2 */}
            <motion.div whileHover={{ y: -5 }} className="glass-panel p-6 rounded-xl flex flex-col gap-4 border-t-2 border-t-tech-navy/50">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded bg-tech-navy/10 flex items-center justify-center">
                  <Users className="text-tech-navy" />
                </div>
                <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-white/40 uppercase tracking-widest font-bold">Active Lab</span>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Visionary MedTech</h3>
                <p className="text-white/50 text-xs mt-1">Stanford • Computer Vision Team</p>
              </div>
              <p className="text-sm text-white/60 line-clamp-2">Seeking ophthalmologists to provide annotated surgical footage for active object detection model.</p>
              <button className="mt-2 text-tech-navy hover:text-white transition-colors text-sm font-bold flex items-center gap-1 group">
                Review Proposal <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>

          <div className="glass-panel rounded-xl p-8 mt-8 border-l-4 border-l-clinical-green">
             <h2 className="font-headline-md text-xl text-white mb-6">My Active Clinical Needs</h2>
             <div className="space-y-4">
                <div className="glass-panel-elevated p-5 rounded-lg flex justify-between items-center group cursor-pointer hover:bg-white/10 transition-colors">
                  <div>
                    <h4 className="text-white font-medium">AI for MRI Analysis</h4>
                    <p className="text-white/40 text-xs mt-1 uppercase tracking-widest">3 Matches Found • NDA Pending</p>
                  </div>
                  <ArrowRight className="text-white/20 group-hover:text-clinical-green transition-colors" />
                </div>
                <div className="glass-panel-elevated p-5 rounded-lg flex justify-between items-center group cursor-pointer hover:bg-white/10 transition-colors">
                  <div>
                    <h4 className="text-white font-medium">NLP for Patient Intake</h4>
                    <p className="text-white/40 text-xs mt-1 uppercase tracking-widest">1 Match Found • Initial Review</p>
                  </div>
                  <ArrowRight className="text-white/20 group-hover:text-clinical-green transition-colors" />
                </div>
             </div>
          </div>
        </section>

        {/* Action Center & Meeting Requests (Spans 4 cols) */}
        <section className="col-span-12 lg:col-span-4 space-y-8">
          <div className="glass-panel rounded-xl p-6">
            <h2 className="font-label-caps text-label-caps text-white/50 mb-6 border-b border-white/5 pb-2">MEETING REQUESTS</h2>
            <div className="space-y-4">
              <div className="glass-panel-elevated rounded-lg p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-tech-navy/20 flex items-center justify-center border border-tech-navy/30">
                    <Users className="text-tech-navy" size={18} />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">Tech Team: X-Sigma</p>
                    <p className="text-white/40 text-[10px] uppercase tracking-widest">Regarding: AI MRI Analysis</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-3 bg-clinical-green text-on-primary rounded text-xs font-bold uppercase tracking-widest">Accept NDA</button>
                  <button className="px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded text-xs font-bold uppercase tracking-widest flex items-center justify-center leading-none"><Eye size={16}/></button>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-xl p-6 border-t-2 border-t-system-red/30">
            <h2 className="font-label-caps text-label-caps text-system-red mb-6 border-b border-white/5 pb-2">CRITICAL RESTRICTION</h2>
            <p className="text-xs text-white/50 leading-relaxed">
              As a Healthcare professional, you are <span className="text-white font-bold">Strictly Forbidden</span> from uploading patient records, scans, or PII. All data sharing must occur through secure institutional pipelines outside this portal.
            </p>
            <div className="mt-6 p-4 bg-system-red/10 rounded-lg flex items-start gap-3 border border-system-red/20">
               <FileText className="text-system-red shrink-0" size={18} />
               <p className="text-[10px] text-system-red font-bold uppercase tracking-widest">Sovereign Compliance Check Active</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
