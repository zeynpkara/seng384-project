import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Clock } from 'lucide-react';

interface Props {
  title: string;
  description?: string;
}

export default function ComingSoon({ title, description }: Props) {
  const { getAccentColor } = useAuth();
  const accent = getAccentColor();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="glass-panel rounded-2xl p-16 text-center">
        <div className={`w-16 h-16 mx-auto mb-6 rounded-full bg-${accent}/10 flex items-center justify-center border border-${accent}/20`}>
          <Clock className={`text-${accent}`} size={28} />
        </div>
        <p className={`text-[10px] text-${accent} tracking-[0.2em] uppercase font-bold mb-3`}>Coming Soon</p>
        <h1 className="text-3xl md:text-5xl text-white font-bold mb-4">{title}</h1>
        <p className="text-white/40 text-sm max-w-md mx-auto leading-relaxed">
          {description ?? 'This feature is currently under development and will be available in a future update.'}
        </p>
      </div>
    </div>
  );
}
