import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
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
  Loader2,
  Settings,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth, AuthUser } from '../context/AuthContext';
import { auth } from '../api/client';
import ChatBot from './ChatBot';

interface LayoutProps {
  children: React.ReactNode;
}

type ModalTab = 'login' | 'register';

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, login, logout, getAccentColor } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ModalTab>('login');

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Register state
  const [regName, setRegName] = useState('');
  const [regInstitution, setRegInstitution] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<'HEALTHCARE' | 'ENGINEER' | ''>('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);
  const [regLoading, setRegLoading] = useState(false);

  const isLanding = location.pathname === '/';
  const accentColor = getAccentColor();

  const EDU_REGEX = /\.(edu|edu\.tr)$/i;

  const closeModal = () => {
    setIsLoginModalOpen(false);
    setLoginError('');
    setRegError('');
    setRegSuccess(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const res = await auth.login({ email: loginEmail, password: loginPassword }) as { token: string; user: AuthUser };
      login(res.token, res.user);
      closeModal();
      if (res.user.role === 'ADMIN') navigate('/admin');
      else if (res.user.role === 'ENGINEER') navigate('/projects');
      else navigate('/dashboard');
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    if (!regRole) { setRegError('Please select your role'); return; }
    if (!EDU_REGEX.test(regEmail)) { setRegError('Only .edu or .edu.tr institutional emails are allowed'); return; }
    setRegLoading(true);
    try {
      await auth.register({ email: regEmail, password: regPassword, name: regName, institution: regInstitution, role: regRole });
      setRegSuccess(true);
    } catch (err: unknown) {
      setRegError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setRegLoading(false);
    }
  };

  const getRoleTitle = () => {
    if (user?.role === 'HEALTHCARE') return 'Clinical Hub';
    if (user?.role === 'ENGINEER') return 'Engineering Console';
    if (user?.role === 'ADMIN') return 'Sovereign Control';
    return 'Precision Workspace';
  };

  const getHomePath = () => {
    if (user?.role === 'ADMIN') return '/admin';
    return '/home';
  };

  const getSidebarItems = () => {
    if (user?.role === 'ADMIN') {
      return [
        { name: 'Admin Console', icon: ShieldAlert, path: '/admin' },
        { name: 'Profile', icon: Settings, path: '/profile' },
      ];
    }
    return [
      { name: 'Home', icon: Megaphone, path: '/home' },
      { name: 'Create Post', icon: PlusCircle, path: '/create-post' },
      { name: 'My Posts', icon: FileText, path: '/my-posts' },
      { name: 'Discover', icon: user?.role === 'HEALTHCARE' ? Cpu : Stethoscope, path: '/discover' },
      { name: 'Meetings', icon: CalendarCheck, path: '/meetings' },
      { name: 'Profile', icon: Settings, path: '/profile' },
    ];
  };

  const initials = user ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '';

  const inputClass = 'w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors';

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-on-background flex flex-col font-sans transition-colors duration-500">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 bg-[#0E0E0E]/80 backdrop-blur-xl border-b border-white/10 h-16 md:h-20">
        <div className="flex justify-between items-center px-6 md:px-8 h-full w-full max-w-[1440px] mx-auto">
          <div className="flex items-center gap-4 md:gap-12">
            <Link to={user ? getHomePath() : '/'} className="text-xl md:text-2xl font-bold tracking-tighter text-white">HEALTH AI</Link>
            {user && (
              <div className="hidden md:flex items-center gap-8">
                <Link
                  to={getHomePath()}
                  className={`font-medium tracking-tight h-full flex items-center border-b-2 transition-colors duration-200 ${location.pathname === getHomePath() ? `text-white border-${accentColor}` : 'text-white/60 border-transparent hover:text-white'}`}
                >
                  Home
                </Link>
                {user.role !== 'ADMIN' && (
                  <>
                    <Link to="/my-posts" className={`font-medium tracking-tight transition-colors duration-200 ${location.pathname === '/my-posts' ? 'text-white' : 'text-white/60 hover:text-white'}`}>My Posts</Link>
                    <Link to="/discover" className={`font-medium tracking-tight transition-colors duration-200 ${location.pathname === '/discover' ? 'text-white' : 'text-white/60 hover:text-white'}`}>Discover</Link>
                    <Link to="/meetings" className={`font-medium tracking-tight transition-colors duration-200 ${location.pathname === '/meetings' ? 'text-white' : 'text-white/60 hover:text-white'}`}>Meetings</Link>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {!user ? (
              <>
                <button
                  onClick={() => { setActiveTab('login'); setIsLoginModalOpen(true); }}
                  className="text-white/70 hover:bg-white/10 transition-all px-4 py-2 rounded-lg text-xs uppercase tracking-widest font-bold"
                >
                  Login
                </button>
                <button
                  onClick={() => { setActiveTab('register'); setIsLoginModalOpen(true); }}
                  className="bg-primary text-on-primary hover:opacity-90 transition-all px-6 py-2 rounded-lg text-xs uppercase tracking-widest font-bold"
                >
                  Register
                </button>
              </>
            ) : (
              <>
                <button onClick={() => navigate('/meetings')} className="text-white/60 hover:text-white transition-all w-10 h-10 flex items-center justify-center rounded-full" aria-label="Open meetings">
                  <Bell size={20} />
                </button>
                <button onClick={logout} className="text-white/60 hover:text-red-400 transition-all w-10 h-10 flex items-center justify-center rounded-full"><LogOut size={20} /></button>
                <Link
                  to="/profile"
                  className={`w-8 h-8 rounded-full bg-surface-container flex items-center justify-center border border-${accentColor} cursor-pointer shadow-[0_0_10px_rgba(0,0,0,0.5)] text-xs font-bold text-white`}
                  aria-label="Open profile"
                >
                  {initials}
                </Link>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-white w-10 h-10 flex items-center justify-center"><Menu size={24} /></button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex flex-1 pt-16 md:pt-20">
        {user && (
          <aside className="hidden md:flex flex-col py-6 fixed left-0 top-16 md:top-20 h-[calc(100vh-80px)] w-64 border-r border-white/10 bg-[#0E0E0E]/40 backdrop-blur-xl z-40">
            <div className="px-6 mb-6">
              <p className={`text-[10px] text-${accentColor} mb-1 uppercase tracking-[0.2em] opacity-80`}>Command Center</p>
              <p className="text-lg text-white font-semibold">{getRoleTitle()}</p>
            </div>
            <nav className="flex-1 space-y-1 px-3">
              {getSidebarItems().map((item) => {
                const isActive = item.path.includes('#')
                  ? location.pathname === item.path.split('#')[0]
                  : location.pathname === item.path;
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
            {user?.role !== 'ADMIN' && (
              <div className="px-6 mt-auto">
                <button
                  onClick={() => navigate('/my-posts?create=true')}
                  className={`w-full py-3 bg-${accentColor}/10 hover:bg-${accentColor}/20 text-${accentColor} border border-${accentColor}/20 rounded-lg text-[10px] tracking-widest transition-all flex items-center justify-center gap-2 uppercase font-bold`}
                >
                  <Plus size={14} />
                  <span>NEW REQUEST</span>
                </button>
              </div>
            )}
          </aside>
        )}

        <main className={`flex-1 ${user ? 'md:ml-64' : ''} p-6 md:p-12 overflow-x-hidden`}>
          {children}
        </main>
      </div>

      <AnimatePresence>
        {user && isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] md:hidden"
          >
            <button className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} aria-label="Close mobile menu" />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="absolute right-0 top-0 h-full w-72 bg-[#111111] border-l border-white/10 p-6 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-white font-semibold">{getRoleTitle()}</p>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-white/50 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-2">
                {getSidebarItems().map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <item.icon size={18} />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AnimatePresence>
        {isLoginModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative glass-panel p-8 rounded-2xl w-full max-w-md border border-white/20"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl text-white font-bold mb-1">
                    {activeTab === 'login' ? 'Welcome Back' : 'Join HEALTH AI'}
                  </h2>
                  <p className="text-white/50 text-sm">
                    {activeTab === 'login' ? 'Sign in to your account' : 'Institutional email required'}
                  </p>
                </div>
                <button onClick={closeModal} className="text-white/40 hover:text-white transition-colors"><X size={20} /></button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mb-6 bg-white/5 p-1 rounded-lg">
                {(['login', 'register'] as ModalTab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => { setActiveTab(tab); setLoginError(''); setRegError(''); setRegSuccess(false); }}
                    className={`flex-1 py-2 rounded-md text-xs font-bold uppercase tracking-widest transition-all duration-200 ${activeTab === tab ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Login Form */}
              {activeTab === 'login' && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <input
                      type="email"
                      placeholder="Institutional email"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      placeholder="Password"
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      className={inputClass}
                      required
                    />
                  </div>
                  {loginError && (
                    <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{loginError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full py-3 bg-primary text-on-primary rounded-lg font-bold text-sm uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loginLoading && <Loader2 size={16} className="animate-spin" />}
                    {loginLoading ? 'Signing in...' : 'Sign In'}
                  </button>
                </form>
              )}

              {/* Register Form */}
              {activeTab === 'register' && (
                <>
                  {regSuccess ? (
                    <div className="text-center py-8 space-y-4">
                      <div className="w-14 h-14 rounded-full bg-clinical-green/10 flex items-center justify-center mx-auto border border-clinical-green/30">
                        <ShieldCheck className="text-clinical-green" size={28} />
                      </div>
                      <h3 className="text-white font-bold text-lg">Check Your Inbox</h3>
                      <p className="text-white/50 text-sm leading-relaxed">
                        We've sent a verification link to <span className="text-primary">{regEmail}</span>. Click it to activate your account.
                      </p>
                      <button
                        onClick={() => { setRegSuccess(false); setActiveTab('login'); }}
                        className="text-xs text-white/40 hover:text-white underline transition-colors"
                      >
                        Back to login
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleRegister} className="space-y-3">
                      <input
                        type="text"
                        placeholder="Full name"
                        value={regName}
                        onChange={e => setRegName(e.target.value)}
                        className={inputClass}
                        required
                      />
                      <input
                        type="text"
                        placeholder="Institution (e.g. METU, Hacettepe)"
                        value={regInstitution}
                        onChange={e => setRegInstitution(e.target.value)}
                        className={inputClass}
                        required
                      />
                      <div className="space-y-1">
                        <input
                          type="email"
                          placeholder="Institutional email (.edu or .edu.tr)"
                          value={regEmail}
                          onChange={e => setRegEmail(e.target.value)}
                          className={inputClass}
                          required
                        />
                        {regEmail && !EDU_REGEX.test(regEmail) && (
                          <p className="text-red-400 text-[11px] px-1">Only .edu or .edu.tr emails allowed</p>
                        )}
                      </div>
                      <input
                        type="password"
                        placeholder="Password (min 8 chars, 1 uppercase, 1 number)"
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        className={inputClass}
                        required
                      />

                      {/* Role Selection */}
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <button
                          type="button"
                          onClick={() => setRegRole('HEALTHCARE')}
                          className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left ${regRole === 'HEALTHCARE' ? 'bg-clinical-green/10 border-clinical-green/50 text-clinical-green' : 'glass-interactive border-white/10 text-white/50 hover:text-white'}`}
                        >
                          <Stethoscope size={18} />
                          <div>
                            <p className="font-bold text-xs">Healthcare</p>
                            <p className="text-[9px] opacity-60 uppercase tracking-widest">Clinical</p>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setRegRole('ENGINEER')}
                          className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left ${regRole === 'ENGINEER' ? 'bg-tech-navy/10 border-tech-navy/50 text-tech-navy' : 'glass-interactive border-white/10 text-white/50 hover:text-white'}`}
                        >
                          <Cpu size={18} />
                          <div>
                            <p className="font-bold text-xs">Engineer</p>
                            <p className="text-[9px] opacity-60 uppercase tracking-widest">Technical</p>
                          </div>
                        </button>
                      </div>

                      {regError && (
                        <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{regError}</p>
                      )}
                      <button
                        type="submit"
                        disabled={regLoading}
                        className="w-full py-3 bg-primary text-on-primary rounded-lg font-bold text-sm uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {regLoading && <Loader2 size={16} className="animate-spin" />}
                        {regLoading ? 'Creating account...' : 'Create Account'}
                      </button>
                    </form>
                  )}
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {(isLanding && !user) && (
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
      {user && <ChatBot />}
    </div>
  );
}
