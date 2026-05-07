import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, SlidersHorizontal } from 'lucide-react';

const CITIES = ['Ankara', 'Istanbul', 'Izmir', 'Bursa', 'Antalya'];

const DOMAINS = [
  'Cardiology',
  'Radiology',
  'Orthopedics',
  'Neurology',
  'Ophthalmology',
  'Emergency Medicine',
  'Endocrinology',
  'AI/ML',
  'Robotics',
  'Computer Vision',
  'Medical Devices',
];

interface FilterBarProps {
  onChange: (params: Record<string, string>) => void;
  accentColor?: string;
}

export default function FilterBar({ onChange, accentColor = 'primary' }: FilterBarProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [city, setCity] = useState(searchParams.get('city') ?? '');
  const [domain, setDomain] = useState(searchParams.get('domain') ?? '');
  const [expertise, setExpertise] = useState(searchParams.get('expertise') ?? '');

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync to URL + notify parent whenever city or domain changes immediately
  useEffect(() => {
    const params: Record<string, string> = {};
    if (city) params.city = city;
    if (domain) params.domain = domain;
    if (expertise) params.expertise = expertise;

    setSearchParams(params, { replace: true });
    onChange(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, domain]);

  // Expertise is debounced (300 ms)
  const handleExpertiseChange = (val: string) => {
    setExpertise(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params: Record<string, string> = {};
      if (city) params.city = city;
      if (domain) params.domain = domain;
      if (val) params.expertise = val;
      setSearchParams(params, { replace: true });
      onChange(params);
    }, 300);
  };

  const clearAll = () => {
    setCity('');
    setDomain('');
    setExpertise('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSearchParams({}, { replace: true });
    onChange({});
  };

  const hasFilters = city || domain || expertise;

  const selectClass =
    'bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors appearance-none cursor-pointer min-w-[140px]';
  const optionClass = 'bg-[#111111] text-white';
  const optionStyle = { backgroundColor: '#111111', color: '#ffffff' };

  return (
    <div className="glass-panel rounded-xl p-4 flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 text-white/30 shrink-0">
        <SlidersHorizontal size={15} />
        <span className="text-[10px] uppercase tracking-widest font-bold">Filter</span>
      </div>

      {/* City */}
      <select
        value={city}
        onChange={e => setCity(e.target.value)}
        className={selectClass}
        style={{ colorScheme: 'dark', backgroundColor: '#111111', color: '#ffffff' }}
      >
        <option value="" className={optionClass} style={optionStyle}>All Cities</option>
        {CITIES.map(c => (
          <option key={c} value={c} className={optionClass} style={optionStyle}>{c}</option>
        ))}
      </select>

      {/* Domain */}
      <select
        value={domain}
        onChange={e => setDomain(e.target.value)}
        className={selectClass}
        style={{ colorScheme: 'dark', backgroundColor: '#111111', color: '#ffffff' }}
      >
        <option value="" className={optionClass} style={optionStyle}>All Domains</option>
        {DOMAINS.map(d => (
          <option key={d} value={d} className={optionClass} style={optionStyle}>{d}</option>
        ))}
      </select>

      {/* Expertise text input */}
      <div className="relative flex-1 min-w-[160px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={14} />
        <input
          type="text"
          value={expertise}
          onChange={e => handleExpertiseChange(e.target.value)}
          placeholder="Expertise (e.g. Python, ML)"
          className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-8 pr-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors"
        />
        {expertise && (
          <button
            onClick={() => handleExpertiseChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Clear button */}
      {hasFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest text-white/40 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all shrink-0"
        >
          <X size={12} />
          Clear
        </button>
      )}

      {/* Active filter pills */}
      {hasFilters && (
        <div className="flex flex-wrap gap-1.5 w-full mt-1">
          {city && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold border border-primary/20">
              {city}
              <button onClick={() => setCity('')}><X size={10} /></button>
            </span>
          )}
          {domain && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold border border-primary/20">
              {domain}
              <button onClick={() => setDomain('')}><X size={10} /></button>
            </span>
          )}
          {expertise && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold border border-primary/20">
              {expertise}
              <button onClick={() => handleExpertiseChange('')}><X size={10} /></button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
