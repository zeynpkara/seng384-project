import React from 'react';
import { motion } from 'motion/react';
import ClinicalMatrix from '../components/ClinicalMatrix';
import {
  UserPlus as HowToRegIcon,
  FilePlus as PostAddIcon,
  Handshake as HandshakeIcon,
  FileCheck as ContractIcon,
  MessageSquare as ForumIcon,
  Stethoscope,
  Cpu,
  ShieldCheck,
  ShieldAlert as AdminPanelSettingsIcon,
  ArrowRight as ArrowForwardIcon,
  GraduationCap as SchoolIcon,
  Lock as LockIcon
} from 'lucide-react';

export default function Landing() {
  return (
    <main className="w-full">
      {/* 1. HERO SECTION */}
      <section className="relative w-full min-h-screen flex items-center justify-center pb-32 pt-20 px-8 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-80">
          <ClinicalMatrix />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
          className="relative z-10 max-w-7xl mx-auto text-center flex flex-col items-center gap-8"
        >
          <div className="glass-panel px-6 py-2 rounded-full inline-flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="font-label-caps text-label-caps uppercase text-primary">Secure Clinical Workspace</span>
          </div>
          <h1 className="font-display-xl text-3xl md:text-5xl lg:text-7xl text-on-surface max-w-4xl mx-auto">
            Welcome to the HEALTH AI Platform
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            An exclusive, high-trust ecosystem designed to bridge the gap between medical visionaries and engineering execution.
          </p>
          <button
            onClick={() => document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
            className="mt-8 bg-primary text-on-primary px-8 py-4 rounded-lg font-label-caps text-label-caps uppercase tracking-widest hover:bg-primary-fixed transition-all duration-300 active:scale-95"
          >
            Explore the Ecosystem
          </button>
        </motion.div>
      </section>

      {/* 2. SEAMLESS EXPLORATION CONTENT */}
      <section id="about-section" className="py-spacing-section-gap px-8 w-full border-t border-white/5 bg-[#0E0E0E]">
        <div className="max-w-7xl mx-auto flex flex-col gap-16">
          <div className="flex flex-col gap-6 max-w-4xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-[1px] bg-primary"></div>
              <p className="font-label-caps text-label-caps text-primary tracking-[0.3em]">SOVEREIGN DEFINITION</p>
            </div>
            <h2 className="font-display-xl text-4xl md:text-6xl text-white leading-tight">What is Health AI?</h2>
            <p className="font-body-lg text-xl md:text-2xl text-white/70 leading-relaxed max-w-3xl">
              Health AI is a <span className="text-white font-bold underline decoration-primary underline-offset-8">sovereign clinical-engineering bridge</span>.
              We solve the structural fragmentation in healthcare by providing a high-trust, encrypted environment where medical experts and technical masters co-create the future of medicine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <motion.div
              whileHover={{ y: -5 }}
              className="glass-panel p-10 rounded-2xl border-l-2 border-l-primary/30 flex flex-col gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <ShieldCheck className="text-primary" size={24} />
              </div>
              <h3 className="font-headline-md text-xl text-white">Bridge Context</h3>
              <p className="text-white/50 text-sm leading-relaxed">Translating complex medical vision into executable technical specs through structured collaboration and clinical-first design.</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="glass-panel p-10 rounded-2xl border-l-2 border-l-clinical-green/30 flex flex-col gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-clinical-green/10 flex items-center justify-center mb-2">
                <Stethoscope className="text-clinical-green" size={24} />
              </div>
              <h3 className="font-headline-md text-xl text-white">Validation First</h3>
              <p className="text-white/50 text-sm leading-relaxed">Strict academic governance ensures that every problem posted is clinically relevant, impact-verified, and ethically sound.</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="glass-panel p-10 rounded-2xl border-l-2 border-l-tech-navy/30 flex flex-col gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-tech-navy/10 flex items-center justify-center mb-2">
                <Cpu className="text-tech-navy" size={24} />
              </div>
              <h3 className="font-headline-md text-xl text-white">Secure Matching</h3>
              <p className="text-white/50 text-sm leading-relaxed">Privacy-first matching infrastructure that handles NDAs and institutional verification, protecting intellectual and clinical property.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. THE PURPOSE */}
      <section className="py-spacing-section-gap pt-32 pb-48 px-8 w-full border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-spacing-gutter items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col gap-6 pr-8 md:pr-16"
          >
            <h2 className="font-headline-lg text-3xl md:text-4xl text-on-surface leading-tight">Bridging Medical Vision & Engineering Execution</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
              Healthcare innovation is currently fragmented. Clinicians lack technical builders, and engineers lack validated clinical problems. This platform provides the rigorous environment necessary to securely match these distinct disciplines.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-panel rounded-xl h-[300px] md:h-[450px] relative overflow-hidden flex items-center justify-center p-8"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent"></div>
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAEB-VRvKTGTQqyzbZqzttGYrw_oQAfhBEh2DErN7s8tIm24Y89wFHWxrgpRVm-7lQk46j8rVn5cQkvQebbIsslgHqXbd1fkpoyIT4TbrbqOfwh-h9p22X2jFgSi1hRvgvZWwTsN6pMIIY1BWd6P8mVr-hM3T6l9g855omi32CA-SDKnt0E5YWt1mvrXkE71_3CPJY5BjGLrOezxUKjoZSoL6ZEVh2Ixn4ugqPLUGHmG_ZrANhuRhZ8dj_rNkGDfxYYDN8yZW08FlM"
              alt="Synergy Abstract"
              className="w-full h-full object-cover rounded-lg opacity-80 mix-blend-screen"
            />
          </motion.div>
        </div>
      </section>

      {/* 4. THE REQUIREMENTS */}
      <section className="py-spacing-section-gap px-8 w-full bg-surface-container-lowest border-y border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-emerald-900/10 to-transparent pointer-events-none"></div>
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center gap-12 relative z-10">
          <div className="flex flex-col items-center gap-4 max-w-3xl">
            <h2 className="font-headline-md text-2xl md:text-3xl text-on-surface">Strict Academic Governance</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              To ensure a high-trust environment for sensitive data and ideas, participation is highly restricted.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
            <motion.div
              whileHover={{ y: -5 }}
              className="glass-interactive p-8 rounded-xl flex flex-col items-center text-center gap-4 border-emerald-500/30"
            >
              <SchoolIcon className="w-12 h-12 text-emerald-400 mb-2" />
              <h3 className="font-headline-md text-xl text-white">Verified Access</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Registration requires a verified .edu or .edu.tr institutional email address. No exceptions.
              </p>
              <div className="mt-4 bg-emerald-500/10 text-emerald-400 px-4 py-1 rounded-full font-label-caps text-label-caps">SECURE DOMAIN</div>
            </motion.div>
            <motion.div
              whileHover={{ y: -5 }}
              className="glass-interactive p-8 rounded-xl flex flex-col items-center text-center gap-4 border-emerald-500/30"
            >
              <LockIcon className="w-12 h-12 text-emerald-400 mb-2" />
              <h3 className="font-headline-md text-xl text-white">Mandatory NDA</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                All inter-disciplinary interactions require signing a strict Non-Disclosure Agreement before engagement.
              </p>
              <div className="mt-4 bg-emerald-500/10 text-emerald-400 px-4 py-1 rounded-full font-label-caps text-label-caps">ENCRYPTED</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. THE WORKFLOW */}
      <section className="pt-40 pb-spacing-section-gap px-8 w-full">
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          <div className="text-center">
            <h2 className="font-headline-md text-2xl md:text-3xl text-on-surface">The Workflow</h2>
          </div>
          <div className="relative w-full py-8">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-[1px] bg-white/10 -translate-y-1/2 z-0"></div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative z-10">
              {[
                { step: '01', title: 'Register', icon: HowToRegIcon },
                { step: '02', title: 'Post a Need', icon: PostAddIcon },
                { step: '03', title: 'Match', icon: HandshakeIcon },
                { step: '04', title: 'Sign NDA', icon: ContractIcon },
                { step: '05', title: 'Meet', icon: ForumIcon },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass-panel p-6 rounded-lg flex flex-col items-center text-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center font-label-caps text-label-caps border border-white/10 mb-2">
                    {item.step}
                  </div>
                  <h4 className="font-headline-md text-lg text-white">{item.title}</h4>
                  <item.icon className="w-6 h-6 text-on-surface-variant" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. THE ECOSYSTEM */}
      <section className="py-spacing-section-gap px-8 w-full bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto flex flex-col gap-12">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-headline-md text-2xl md:text-3xl text-on-surface mb-4">The Ecosystem</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">A synchronized network of specialists.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="glass-interactive p-8 rounded-xl flex flex-col gap-4 border-t-2 border-t-emerald-500/50"
            >
              <Stethoscope className="w-10 h-10 text-emerald-400" />
              <h3 className="font-headline-md text-xl text-white">Healthcare Professional</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Identify clinical bottlenecks and find technical builders.</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="glass-interactive p-8 rounded-xl flex flex-col gap-4 border-t-2 border-t-blue-500/50"
            >
              <Cpu className="w-10 h-10 text-blue-400" />
              <h3 className="font-headline-md text-xl text-white">Engineer</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Bring technical mastery and find validated medical problems/data.</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="glass-interactive p-8 rounded-xl flex flex-col gap-4 border-t-2 border-t-red-500/50"
            >
              <AdminPanelSettingsIcon className="w-10 h-10 text-red-400" />
              <h3 className="font-headline-md text-xl text-white">System Admin</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Monitoring security, ensuring compliance, and protecting the community.</p>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
