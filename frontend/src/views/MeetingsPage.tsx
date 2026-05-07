import React, { useState } from 'react';
import { CalendarCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import MeetingsDashboard from '../components/MeetingsDashboard';

export default function MeetingsPage() {
  const { user, getAccentColor } = useAuth();
  const accent = getAccentColor();
  const [refreshKey] = useState(0);
  const subtitle = user?.role === 'HEALTHCARE'
    ? 'Review incoming interest, propose slots, and move the right conversations into external meetings.'
    : user?.role === 'ENGINEER'
      ? 'Track the opportunities you pursued, accept NDAs, and confirm slots when healthcare partners respond.'
      : 'Monitor operational meeting activity across the platform.';

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <span className={`w-2 h-2 rounded-full bg-${accent} animate-pulse`} />
          <p className={`text-[10px] text-${accent} tracking-widest uppercase font-bold`}>Collaborative Sessions</p>
        </div>
        <h1 className="text-3xl md:text-5xl text-white font-bold flex items-center gap-4">
          My Meetings
          <CalendarCheck className={`text-${accent}`} size={32} />
        </h1>
        <p className="text-white/50 mt-4 max-w-2xl">{subtitle}</p>
      </div>

      <div className="glass-panel rounded-xl p-8">
        {user ? (
          <MeetingsDashboard userId={user.id} refreshKey={refreshKey} />
        ) : (
          <p className="text-white/30 text-sm">Log in to see your meetings.</p>
        )}
      </div>
    </div>
  );
}
