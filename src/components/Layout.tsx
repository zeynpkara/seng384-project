import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Settings, 
  Search, 
  Plus, 
  Megaphone, 
  PlusCircle, 
  FileText, 
  CalendarCheck, 
  ShieldCheck, 
  ShieldAlert,
  Menu,
  X,
  LogOut,
  Stethoscope,
  Cpu,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth, UserRole } from '../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { role, login, logout, getAccentColor } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  const isLanding = location.pathname === '/';
  const accentColor = getAccentColor();

  const handleLogin = (selectedRole: UserRole) => {
    login(selectedRole);
    setIsLoginModalOpen(false);
    if (selectedRole === 'ADMIN') navigate('/admin');
    else if (selectedRole === 'ENGINEER') navigate('/projects');
    else navigate('/dashboard');
  };

  const getRoleTitle = () => {
    if (role === 'HEALTHCARE') return 'Clinical Hub';
    if (role === 'ENGINEER') return 'Engineering Console';
    if (role === 'ADMIN') return 'Sovereign Control';
    return 'Precision Workspace';
  };

  const getSidebarItems = () => {
    const baseItems = [
      { name: 'Announcements', icon: Megaphone, path: '/announcements' },
      { name: 'Meetings', icon: CalendarCheck, path: '/meetings' },
      { name: 'NDA Tracking', icon: ShieldCheck, path: '/nda' },
    ];

    if (role === 'ADMIN') {
      return [
        { name: 'Security Audit', icon: ShieldAlert, path: '/admin' },
        ...baseItems
      ];
    }

    const myPostsPath = role === 'ENGINEER' ? '/projects' : '/dashboard';
    return [
      { name: 'Create Post', icon: PlusCircle, path: '/create-post' },
      { name: 'My Posts', icon: FileText, path: myPostsPath },
      ...baseItems
    ];
  };

  return (
    <div className={`min-h-screen bg-[#0E0E0E] text-on-background flex flex-col font-sans transition-colors duration-500`}>
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 bg-[#0E0E0E]/80 backdrop-blur-xl border-b border-white/10 h-16 md:h-20">
        <div className="flex justify-between items-center px-6 md:px-8 h-full w-full max-w-[1440px] mx-auto">
          <div className="flex items-center gap-4 md:gap-12">
            <Link to="/" className="text-xl md:text-2xl font-bold tracking-tighter text-white">HEALTH AI</Link>
            
            {role && (
              <div className="hidden md:flex items-center gap-8">
                <Link to={role === 'ADMIN' ? '/admin' : role === 'ENGINEER' ? '/projects' : '/dashboard'} className={`font-medium tracking-tight h-full flex items-center border-b-2 transition-colors duration-200 ${location.pathname.includes('dashboard') || location.pathname.includes('projects') || location.pathname.includes('admin') ? `text-white border-${accentColor}` : 'text-white/60 border-transparent hover:text-white'}`}>Home</Link>
                <Link to="/collaborators" className="text-white/60 font-medium tracking-tight hover:text-white transition-colors duration-200">Collaborators</Link>
                <Link to="/network" className="text-white/60 font-medium tracking-tight hover:text-white transition-colors duration-200">Network</Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {!role ? (
              <>
                <button 
                  onClick={() => setIsLoginModalOpen(true)}
                  className="text-white/70 hover:bg-white/10 transition-all px-4 py-2 rounded-lg font-label-caps text-xs uppercase"
                >
                  Login
                </button>
                <button className={`bg-primary text-on-primary hover:bg-white/10 transition-all px-6 py-2 rounded-lg font-label-caps text-xs uppercase`}>Register</button>
              </>
            ) : (
              <>
                <div className="relative hidden lg:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                  <input className="bg-white/5 border border-white/10 rounded-lg py-1.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-colors w-48 xl:w-64 placeholder:text-white/30" placeholder="Search..." type="text"/>
                </div>
                <button className="text-white/60 hover:text-white transition-all w-10 h-10 flex items-center justify-center rounded-full"><Bell size={20} /></button>
                <button onClick={() => logout()} className="text-white/60 hover:text-red-400 transition-all w-10 h-10 flex items-center justify-center rounded-full"><LogOut size={20} /></button>
                <div className={`w-8 h-8 rounded-full bg-surface-container overflow-hidden border border-${accentColor} cursor-pointer shadow-[0_0_10px_rgba(0,0,0,0.5)]`}>
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-mbEXxawk8piMilN_eOnsRnlXkDZszUJlKtNCQLEmQWac3j5r5S45yu0-PeHOsQBbNb7Xl2oWHF7UKl9xWFjk82u8wT25djwZvtwQ219bU1qim6qejjwiak7mUKNh4d4ujVpiG3dS4kHHL_-_ZA-LsJSdRylCnZS0WEDZqgaaUXtx8vt2KWOD3F1TdwIyyl5VIdTFlI6YificpmqLEsVqAxJsy_fnqHpmBNFLcv0P9FIKT6p98FgbFkDM08XWTkBzJK28IYsnBP0" className="w-full h-full object-cover" alt="Profile" />
                </div>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-white w-10 h-10 flex items-center justify-center"><Menu size={24} /></button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex flex-1 pt-16 md:pt-20">
        {role && (
          <>
            {/* Sidebar Desktop */}
            <aside className="hidden md:flex flex-col py-6 fixed left-0 top-16 md:top-20 h-[calc(100vh-80px)] w-64 border-r border-white/10 bg-[#0E0E0E]/40 backdrop-blur-xl z-40">
              <div className="px-6 mb-6">
                <p className={`font-label-caps text-[10px] text-${accentColor} mb-1 uppercase tracking-[0.2em] opacity-80`}>Command Center</p>
                <p className="font-headline-md text-lg text-white">{getRoleTitle()}</p>
              </div>
              <nav className="flex-1 space-y-1 px-3">
                {getSidebarItems().map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link 
                      key={item.name}
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-300 ${isActive ? `bg-white/10 text-white border-l-4 border-${accentColor} translate-x-1` : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
                    >
                      <item.icon size={18} className={isActive ? `text-${accentColor}` : ''} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
              <div className="px-6 mt-auto">
                <button className={`w-full py-3 bg-${accentColor}/10 hover:bg-${accentColor}/20 text-${accentColor} border border-${accentColor}/20 rounded-lg font-label-caps text-[10px] tracking-widest transition-all flex items-center justify-center gap-2`}>
                  <Plus size={14} />
                  <span>NEW REQUEST</span>
                </button>
              </div>
            </aside>
          </>
        )}

        <main className={`flex-1 ${role ? 'md:ml-64' : ''} p-6 md:p-12 overflow-x-hidden`}>
          {children}
        </main>
      </div>

      {/* Login Modal */}
      <AnimatePresence>
        {isLoginModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative glass-panel p-8 rounded-2xl w-full max-w-md border border-white/20"
            >
              <div className="flex justify-between items-start mb-6">
                 <div>
                   <h2 className="font-display-xl text-2xl text-white mb-2">Identify Role</h2>
                   <p className="text-white/60 text-sm">Select your verified discipline to enter the ecosystem.</p>
                 </div>
                 <button onClick={() => setIsLoginModalOpen(false)} className="text-white/40 hover:text-white"><X size={20}/></button>
              </div>
              
              <div className="space-y-4">
                <button 
                  onClick={() => handleLogin('HEALTHCARE')}
                  className="w-full flex items-center gap-4 p-4 rounded-xl glass-interactive border-clinical-green/30 text-clinical-green group"
                >
                  <div className="w-10 h-10 rounded-lg bg-clinical-green/10 flex items-center justify-center">
                    <Stethoscope className="group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold">Healthcare Professional</p>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest">Clinical Authority</p>
                  </div>
                </button>

                <button 
                  onClick={() => handleLogin('ENGINEER')}
                  className="w-full flex items-center gap-4 p-4 rounded-xl glass-interactive border-tech-navy/30 text-tech-navy group"
                >
                  <div className="w-10 h-10 rounded-lg bg-tech-navy/10 flex items-center justify-center">
                    <Cpu className="group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold">Engineer</p>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest">Technical Mastery</p>
                  </div>
                </button>

                <button 
                  onClick={() => handleLogin('ADMIN')}
                  className="w-full flex items-center gap-4 p-4 rounded-xl glass-interactive border-system-red/30 text-system-red group"
                >
                  <div className="w-10 h-10 rounded-lg bg-system-red/10 flex items-center justify-center">
                    <Lock className="group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold">System Admin</p>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest">Sovereign Oversight</p>
                  </div>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {(isLanding && !role) && (
        <footer className="w-full border-t border-white/5 py-12 bg-neutral-950 font-sans text-[10px] tracking-widest uppercase">
          <div className="max-w-[1440px] mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-lg font-black text-white">HEALTH AI</div>
            <div className="text-primary/70 text-center md:text-left">© 2024 HEALTH AI. ALL RIGHTS RESERVED. ENCRYPTED CLINICAL WORKSPACE.</div>
            <nav className="flex flex-wrap justify-center gap-6 text-neutral-500">
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-primary transition-colors">API</a>
              <a href="#" className="hover:text-primary transition-colors">Security</a>
              <a href="#" className="hover:text-primary transition-colors">Documentation</a>
            </nav>
          </div>
        </footer>
      )}
    </div>
  );
}
