import React from 'react';
import { motion } from 'motion/react';
import { 
  Rocket, 
  Activity, 
  Brain, 
  Check, 
  History, 
  Signature, 
  Video,
  FileText,
  ShieldCheck,
  ChevronRight,
  Database,
  Search,
  Stethoscope
} from 'lucide-react';

export default function TechnicalDashboard() {
  return (
    <div className="max-w-7xl mx-auto pb-24">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6"
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-tech-navy animate-pulse"></span>
            <p className="font-label-caps text-label-caps text-tech-navy tracking-widest">ENGINEERING HUB</p>
          </div>
          <h1 className="font-headline-lg text-3xl md:text-5xl text-white">Project Console</h1>
        </div>
        <button className="glass-panel-elevated bg-tech-navy/10 border-tech-navy/30 hover:bg-tech-navy/20 text-tech-navy px-8 py-4 rounded flex items-center gap-3 transition-all duration-300 font-label-caps text-sm tracking-widest">
          <Rocket size={18} fill="currentColor" />
          <span>MATCH NEW PROJECT</span>
        </button>
      </motion.div>

      {/* 12-Column Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Main Feed (Col 1-8) */}
        <div className="md:col-span-8 space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="font-headline-md text-xl md:text-2xl text-white flex items-center gap-2">
              <Stethoscope className="text-clinical-green" />
              <span>Available Clinical Challenges</span>
            </h2>
          </div>
          
          {/* Feed Item 1 */}
          <div className="glass-panel p-8 rounded-lg relative overflow-hidden group hover:border-white/20 transition-colors duration-300">
            <div className="absolute top-0 left-0 w-1 h-full bg-tech-navy"></div>
            <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-surface-container-high flex items-center justify-center border border-white/10">
                  <Activity className="text-tech-navy" size={20} />
                </div>
                <div>
                  <h3 className="text-white font-medium text-lg">Cardiovascular Anomaly Detection</h3>
                  <p className="text-white/50 text-sm">Dr. E. Chen, Mount Sinai • 2h ago</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-tech-navy/10 text-tech-navy border border-tech-navy/20 rounded-full text-[10px] font-bold tracking-widest">URGENT</span>
            </div>
            <p className="text-white/70 mb-6 leading-relaxed">
              Seeking engineering teams to develop a real-time CNN capable of identifying subtle morphological changes in echocardiograms.
            </p>
            <div className="flex flex-wrap items-center gap-6 border-t border-white/5 pt-4">
              <span className="flex items-center text-white/40 text-[10px] uppercase font-bold tracking-widest gap-2">
                <Database size={14} />
                <span>45TB Annotated Bio-Streams</span>
              </span>
              <button className="ml-auto text-tech-navy hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">Express Interest</button>
            </div>
          </div>

          <div className="glass-panel p-8 rounded-lg border-l-4 border-tech-navy/30">
            <h3 className="text-white/50 font-label-caps text-label-caps mb-6">MY ACTIVE INNOVATIONS</h3>
            <div className="space-y-4">
              <div className="glass-panel-elevated p-4 rounded flex justify-between items-center">
                 <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-tech-navy"></div>
                    <span className="text-white font-medium">NeuralLink-Alpha</span>
                 </div>
                 <span className="text-[10px] text-white/30 uppercase tracking-widest">Eşleşme Bulundu</span>
              </div>
              <div className="glass-panel-elevated p-4 rounded flex justify-between items-center">
                 <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-white/20"></div>
                    <span className="text-white font-medium">Auto-EHR Parser v2</span>
                 </div>
                 <span className="text-[10px] text-white/30 uppercase tracking-widest">Aktif İlan</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar (Col 9-12) */}
        <div className="md:col-span-4 space-y-8">
          <div className="glass-panel p-6 rounded-lg bg-tech-navy/5 border-tech-navy/20">
             <h3 className="text-tech-navy font-bold text-sm uppercase tracking-widest mb-4">Engineering Guidelines</h3>
             <ul className="space-y-3 text-[11px] text-white/60 leading-tight">
               <li className="flex gap-2">
                 <span className="text-tech-navy font-bold">•</span>
                 <span>No Technical Document Uploads Allowed.</span>
               </li>
               <li className="flex gap-2">
                 <span className="text-tech-navy font-bold">•</span>
                 <span>NDA execution is mandatory before data access.</span>
               </li>
               <li className="flex gap-2">
                 <span className="text-tech-navy font-bold">•</span>
                 <span>Clinical validation must occur via external meetings.</span>
               </li>
             </ul>
          </div>

          <div className="glass-panel p-6 rounded-lg">
            <h3 className="font-label-caps text-label-caps text-white/50 mb-6 border-b border-white/10 pb-2">UPCOMING MEETINGS</h3>
            <div className="space-y-4">
               <div className="glass-panel-elevated p-4 rounded">
                  <p className="text-white text-xs font-bold font-mono">14:00 EST / TOMORROW</p>
                  <p className="text-white/50 text-[10px] mt-1">Dr. Patel • Cardiac AI Group</p>
                  <button className="mt-3 w-full py-2 bg-tech-navy/20 text-tech-navy rounded text-[10px] font-bold hover:bg-tech-navy/30 transition-all uppercase tracking-widest">Join via External Link</button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
