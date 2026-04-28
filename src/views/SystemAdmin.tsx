import React from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  CheckCircle, 
  Clock, 
  FileText, 
  Check, 
  X, 
  GraduationCap, 
  AlertTriangle,
  Search,
  Plus,
  ShieldAlert,
  Server
} from 'lucide-react';

export default function SystemAdmin() {
  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-24">
      {/* Page Header */}
      <header>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-system-red animate-pulse"></span>
          <p className="font-label-caps text-label-caps text-system-red tracking-[0.2em]">SOVEREIGN OVERSIGHT</p>
        </div>
        <h1 className="font-headline-lg text-3xl md:text-5xl text-white">System Administration</h1>
      </header>

      {/* System Overview Bento Grid */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-xl flex flex-col justify-between h-40 border-l-4 border-l-system-red">
            <div className="flex justify-between items-start">
              <Users className="text-white/40" size={24} />
              <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded uppercase tracking-widest">Global Stable</span>
            </div>
            <div>
              <p className="font-display-xl text-4xl font-bold text-white leading-none">12,408</p>
              <p className="font-body-md text-xs text-white/50 mt-2 uppercase tracking-widest">Verified .edu Nodes</p>
            </div>
          </div>
          <div className="glass-panel p-6 rounded-xl flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
              <ShieldAlert className="text-white/40" size={24} />
              <span className="text-[10px] font-bold text-system-red bg-system-red/10 px-2 py-1 rounded uppercase tracking-widest">Active NDAs</span>
            </div>
            <div>
              <p className="font-display-xl text-4xl font-bold text-white leading-none">8,192</p>
              <p className="font-body-md text-xs text-white/50 mt-2 uppercase tracking-widest">Encrypted Agreements</p>
            </div>
          </div>
          <div className="glass-panel p-6 rounded-xl flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
              <Server className="text-white/40" size={24} />
              <span className="text-[10px] font-bold text-tertiary bg-tertiary/10 px-2 py-1 rounded uppercase tracking-widest">Queue Status</span>
            </div>
            <div>
              <p className="font-display-xl text-4xl font-bold text-system-red leading-none">47</p>
              <p className="font-body-md text-xs text-white/50 mt-2 uppercase tracking-widest">Pending Moderations</p>
            </div>
          </div>
        </div>
      </section>

      {/* Dual Columns: Moderation & Verification */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Moderation Queue */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-label-caps text-label-caps text-white/70 tracking-[0.2em] uppercase">Content Moderation Feed</h3>
            <button className="text-[10px] text-system-red hover:text-white transition-colors uppercase font-bold tracking-widest">Review All</button>
          </div>
          <div className="glass-panel rounded-xl overflow-hidden border-t border-system-red/20">
            <div className="divide-y divide-white/5">
              {/* Item 1 */}
              <div className="p-5 hover:bg-white/5 transition-colors group">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-system-red"></span>
                      <h4 className="font-bold text-white text-sm">Clinical Trial Results: Phase III</h4>
                    </div>
                    <p className="text-xs text-white/50 line-clamp-1 italic">Potentially includes prohibited data types...</p>
                    <div className="flex items-center gap-4 mt-3 text-[10px] text-white/30 uppercase tracking-widest">
                      <span className="flex items-center gap-1"><Clock size={12} /> 10m ago</span>
                      <span className="flex items-center gap-1 font-bold">Node: Dr. E. Carter</span>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-8 h-8 rounded bg-green-500/10 text-green-400 flex items-center justify-center hover:bg-green-500 hover:text-white transition-all"><Check size={14} /></button>
                    <button className="w-8 h-8 rounded bg-system-red/10 text-system-red flex items-center justify-center hover:bg-system-red hover:text-white transition-all"><X size={14} /></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* User Verification */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-label-caps text-label-caps text-white/70 tracking-[0.2em] uppercase">Entity Verification</h3>
            <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[10px] text-white uppercase tracking-widest">12 Pending Nodes</span>
          </div>
          <div className="glass-panel rounded-xl overflow-hidden border-t border-system-red/20">
            <div className="divide-y divide-white/5">
              {/* User 1 */}
              <div className="p-5 flex items-center justify-between hover:bg-white/5 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded glass-panel flex items-center justify-center group-hover:border-clinical-green/30 transition-colors">
                    <GraduationCap className="text-white/40 group-hover:text-clinical-green" size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">jsmith@stanford.edu</p>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest">Domain Check: Verified</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-system-red/10 text-system-red rounded text-[10px] font-bold uppercase tracking-widest hover:bg-system-red hover:text-white transition-all">Identify</button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Audit Logs */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-label-caps text-label-caps text-white/70 tracking-[0.2em] uppercase">Sovereign Audit Trail</h3>
          <button className="text-[10px] bg-white/5 px-3 py-1 rounded text-white/60 hover:text-white transition-colors uppercase tracking-widest font-bold border border-white/10">Export CSV</button>
        </div>
        <div className="glass-panel p-8 rounded-xl border-t border-system-red/20">
          <div className="space-y-4 font-mono text-[11px] text-white/40">
            {[
              { time: '14:02:45 UTC', type: '[AUTHENTICATED]', msg: 'Global Administrator Node initialized via SSO.', color: 'text-green-400' },
              { time: '13:58:12 UTC', type: '[ALERT]', msg: 'Unauthorized attempt detected at ingress node 192.168.1.104.', color: 'text-system-red' },
              { time: '13:15:00 UTC', type: '[INTEGRITY]', msg: 'Deep-cold storage backup verified and sealed.', color: 'text-tertiary' },
              { time: '12:45:22 UTC', type: '[CONTENT]', msg: 'Node "MedTechUI" matched with node "ClinicianGamma". NDA lock engaged.', color: 'text-blue-400' },
            ].map((log, idx) => (
              <div key={idx} className="flex flex-col md:flex-row gap-2 md:gap-6 border-b border-white/5 pb-3 last:border-0 last:pb-0 group">
                <span className="text-white/20 w-32 shrink-0">{log.time}</span>
                <span className={`${log.color} w-32 shrink-0 font-bold`}>{log.type}</span>
                <span className="group-hover:text-white transition-colors">{log.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
