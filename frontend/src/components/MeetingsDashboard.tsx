import React, { useState, useEffect, useCallback } from 'react';
import {
  CalendarCheck, Clock, CheckCircle2, XCircle, Loader2, Plus, Send, ShieldCheck,
  Video, Users, ExternalLink, Building2, MessageSquare,
} from 'lucide-react';
import { meetings as meetingsApi } from '../api/client';
import ChatWindow from './ChatWindow';

interface Slot { date: string; time: string }

interface Party {
  id: string;
  name: string;
  institution: string;
  role: 'HEALTHCARE' | 'ENGINEER' | 'ADMIN';
}

interface Meeting {
  id: string;
  status: string;
  message: string | null;
  proposedSlots: Slot[] | null;
  confirmedSlot: Slot | null;
  meetingLink: string | null;
  post: { id: string; title: string; domain: string; city: string; preferredPlatform: string };
  requester: Party;
  postOwner: Party;
}

interface Props {
  userId: string;
  refreshKey?: number;
}

const PLATFORM_LABELS: Record<string, { label: string; color: string }> = {
  ZOOM: { label: 'Zoom', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  GOOGLE_MEET: { label: 'Google Meet', color: 'text-green-400 bg-green-400/10 border-green-400/20' },
  TEAMS: { label: 'Teams', color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20' },
  OTHER: { label: 'Platform TBD', color: 'text-white/30 bg-white/5 border-white/10' },
};

const ROLE_COLORS: Record<string, string> = {
  HEALTHCARE: 'bg-clinical-green/20 text-clinical-green border-clinical-green/30',
  ENGINEER: 'bg-tech-navy/20 text-tech-navy border-tech-navy/30',
  ADMIN: 'bg-system-red/20 text-system-red border-system-red/20',
};

const ROLE_LABELS: Record<string, string> = {
  HEALTHCARE: 'Healthcare',
  ENGINEER: 'Engineer',
  ADMIN: 'Admin',
};

function Initials({ name, role }: { name: string; role: string }) {
  const parts = name.trim().split(' ');
  const initials = parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
  const colorMap: Record<string, string> = {
    HEALTHCARE: 'bg-clinical-green/20 text-clinical-green',
    ENGINEER: 'bg-tech-navy/20 text-[#60a5fa]',
    ADMIN: 'bg-system-red/20 text-system-red',
  };
  return (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border ${colorMap[role] ?? 'bg-white/10 text-white/60'} border-white/10`}>
      {initials}
    </div>
  );
}

function PartyCard({ party, label }: { party: Party; label: string }) {
  return (
    <div className="flex items-center gap-2.5 p-2.5 bg-white/3 rounded-lg border border-white/5">
      <Initials name={party.name} role={party.role} />
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-white text-xs font-semibold truncate">{party.name}</span>
          <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full border ${ROLE_COLORS[party.role] ?? ''}`}>
            {ROLE_LABELS[party.role]}
          </span>
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          <Building2 size={10} className="text-white/30 shrink-0" />
          <span className="text-[10px] text-white/40 truncate">{party.institution}</span>
        </div>
      </div>
      <span className="text-[9px] text-white/25 uppercase tracking-widest ml-auto shrink-0">{label}</span>
    </div>
  );
}

function ProposeSlots({ meetingId, onProposed }: { meetingId: string; onProposed: () => void }) {
  const [slots, setSlots] = useState([{ date: '', time: '' }, { date: '', time: '' }]);
  const [meetingLink, setMeetingLink] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [linkError, setLinkError] = useState('');

  const updateSlot = (i: number, field: 'date' | 'time', val: string) =>
    setSlots(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s));

  const addSlot = () => {
    if (slots.length < 3) setSlots(prev => [...prev, { date: '', time: '' }]);
  };

  const handleSubmit = async () => {
    const valid = slots.filter(s => s.date && s.time);
    if (valid.length === 0) return;

    if (meetingLink && !meetingLink.startsWith('http')) {
      setLinkError('Link must start with http:// or https://');
      return;
    }
    setLinkError('');
    setSubmitting(true);
    try {
      await meetingsApi.proposeSlots(meetingId, valid, meetingLink || undefined);
      onProposed();
    } catch {
      // silent refresh on next load
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = 'flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 transition-colors';
  const hasValid = slots.some(s => s.date && s.time);

  return (
    <div className="space-y-3 mt-2 pt-3 border-t border-white/5">
      <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Propose Time Slots:</p>
      {slots.map((s, i) => (
        <div key={i} className="flex gap-2 items-center">
          <span className="text-[10px] text-white/20 w-4 shrink-0">{i + 1}.</span>
          <input type="date" value={s.date} onChange={e => updateSlot(i, 'date', e.target.value)} className={inputCls} />
          <input type="time" value={s.time} onChange={e => updateSlot(i, 'time', e.target.value)} className={inputCls} />
        </div>
      ))}
      {slots.length < 3 && (
        <button onClick={addSlot} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 text-white/40 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors border border-white/10">
          <Plus size={11} /> Add Slot
        </button>
      )}

      <div className="pt-1 space-y-1">
        <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold flex items-center gap-1.5">
          <Video size={11} /> Meeting Link <span className="text-white/25 normal-case tracking-normal font-normal">(optional — share now or later)</span>
        </p>
        <input
          type="url"
          value={meetingLink}
          onChange={e => { setMeetingLink(e.target.value); setLinkError(''); }}
          placeholder="https://zoom.us/j/... or meet.google.com/..."
          className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-colors"
        />
        {linkError && <p className="text-red-400 text-[10px]">{linkError}</p>}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!hasValid || submitting}
        className="w-full py-2 bg-primary text-on-primary rounded text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-1.5"
      >
        {submitting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
        Send Slots
      </button>
    </div>
  );
}

function statusLabel(status: string) {
  const map: Record<string, { label: string; cls: string }> = {
    NDA_PENDING: { label: 'NDA Required', cls: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
    PENDING: { label: 'Awaiting Slots', cls: 'text-primary bg-primary/10 border-primary/20' },
    SLOTS_PROPOSED: { label: 'Slots Proposed', cls: 'text-tech-navy bg-tech-navy/10 border-tech-navy/20' },
    CONFIRMED: { label: 'Confirmed', cls: 'text-clinical-green bg-clinical-green/10 border-clinical-green/20' },
    REJECTED: { label: 'Rejected', cls: 'text-system-red bg-system-red/10 border-system-red/20' },
    CANCELLED: { label: 'Cancelled', cls: 'text-white/30 bg-white/5 border-white/10' },
  };
  return map[status] ?? { label: status, cls: 'text-white/40 bg-white/5 border-white/10' };
}

export default function MeetingsDashboard({ userId, refreshKey }: Props) {
  const [meetingList, setMeetingList] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [acceptingNdaId, setAcceptingNdaId] = useState<string | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<Record<string, string>>({});
  const [openChatId, setOpenChatId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await meetingsApi.getMyMeetings() as Meeting[];
      setMeetingList(data);
    } catch {
      setMeetingList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load, refreshKey]);

  const handleConfirm = async (meetingId: string) => {
    const key = selectedSlots[meetingId];
    if (!key) return;
    const [date, time] = key.split('|');
    setConfirmingId(meetingId);
    try {
      await meetingsApi.confirmSlot(meetingId, { date, time });
      await load();
    } catch {
      // silently refresh
    } finally {
      setConfirmingId(null);
    }
  };

  const handleReject = async (meetingId: string) => {
    try {
      await meetingsApi.rejectMeeting(meetingId);
      await load();
    } catch { /* silent */ }
  };

  const handleAcceptNda = async (meetingId: string) => {
    setAcceptingNdaId(meetingId);
    try {
      await meetingsApi.acceptNda(meetingId);
      await load();
    } catch {
      // silent refresh on next load
    } finally {
      setAcceptingNdaId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map(i => <div key={i} className="h-20 bg-white/5 rounded-lg animate-pulse" />)}
      </div>
    );
  }

  if (meetingList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Users size={32} className="text-white/10 mb-3" />
        <p className="text-white/30 text-sm">No meeting requests yet.</p>
        <p className="text-white/20 text-xs mt-1">Express interest in a post to start collaborating.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {meetingList.map(m => {
        const { label, cls } = statusLabel(m.status);
        const isRequester = m.requester.id === userId;
        const otherParty = isRequester ? m.postOwner : m.requester;
        const platform = PLATFORM_LABELS[m.post.preferredPlatform] ?? PLATFORM_LABELS.OTHER;

        return (
          <div key={m.id} className="glass-panel-elevated p-5 rounded-xl space-y-3">
            {/* Post title + status badge */}
            <div className="flex justify-between items-start gap-3">
              <div className="min-w-0">
                <p className="text-white font-semibold text-sm truncate">{m.post.title}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-[10px] text-white/35 uppercase tracking-widest">{m.post.domain}</span>
                  {m.post.city && <span className="text-[10px] text-white/25">· {m.post.city}</span>}
                  <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full border ${platform.color}`}>
                    {platform.label}
                  </span>
                </div>
              </div>
              <span className={`shrink-0 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${cls}`}>
                {label}
              </span>
            </div>

            {/* Who is who */}
            <PartyCard
              party={otherParty}
              label={isRequester ? 'Post Owner' : 'Applicant'}
            />

            {/* ── NDA_PENDING — requester needs to sign */}
            {m.status === 'NDA_PENDING' && isRequester && (
              <div className="space-y-3 pt-1">
                <p className="text-xs text-white/50 leading-relaxed">
                  Accept the platform NDA to convert this interest into a real meeting request.
                </p>
                <button
                  onClick={() => handleAcceptNda(m.id)}
                  disabled={acceptingNdaId === m.id}
                  className="w-full py-2 bg-primary text-on-primary rounded-lg text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-1.5"
                >
                  {acceptingNdaId === m.id ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
                  Accept NDA
                </button>
              </div>
            )}
            {m.status === 'NDA_PENDING' && !isRequester && (
              <p className="flex items-center gap-2 text-xs text-white/40">
                <Clock size={13} /> Waiting for {m.requester.name} to accept the platform NDA
              </p>
            )}

            {/* ── PENDING — requester waits, owner proposes slots */}
            {m.status === 'PENDING' && isRequester && (
              <p className="flex items-center gap-2 text-xs text-white/40">
                <Clock size={13} /> Waiting for {m.postOwner.name} to propose time slots
              </p>
            )}
            {m.status === 'PENDING' && !isRequester && (
              <ProposeSlots meetingId={m.id} onProposed={load} />
            )}

            {/* ── SLOTS_PROPOSED — requester picks a slot */}
            {m.status === 'SLOTS_PROPOSED' && m.proposedSlots && isRequester && (
              <div className="space-y-2 pt-1">
                <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Select a time slot:</p>
                {m.proposedSlots.map(s => {
                  const key = `${s.date}|${s.time}`;
                  return (
                    <label key={key} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border ${selectedSlots[m.id] === key ? 'bg-tech-navy/10 border-tech-navy/30 text-white' : 'bg-white/3 border-white/10 text-white/60 hover:bg-white/5'}`}>
                      <input
                        type="radio"
                        name={`slot-${m.id}`}
                        value={key}
                        checked={selectedSlots[m.id] === key}
                        onChange={() => setSelectedSlots(p => ({ ...p, [m.id]: key }))}
                        className="accent-tech-navy"
                      />
                      <CalendarCheck size={14} />
                      <span className="text-sm font-medium">{s.date}</span>
                      <span className="text-sm text-white/60">at {s.time}</span>
                    </label>
                  );
                })}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleConfirm(m.id)}
                    disabled={!selectedSlots[m.id] || confirmingId === m.id}
                    className="flex-1 py-2 bg-clinical-green text-on-primary rounded-lg text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-1.5"
                  >
                    {confirmingId === m.id && <Loader2 size={12} className="animate-spin" />}
                    Confirm Slot
                  </button>
                  <button
                    onClick={() => handleReject(m.id)}
                    className="px-4 py-2 bg-system-red/10 text-system-red border border-system-red/20 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-system-red/20 transition-colors"
                  >
                    Decline
                  </button>
                </div>
              </div>
            )}
            {m.status === 'SLOTS_PROPOSED' && !isRequester && (
              <p className="flex items-center gap-2 text-xs text-white/40">
                <Clock size={13} /> Waiting for {m.requester.name} to confirm a slot
              </p>
            )}

            {/* ── CONFIRMED */}
            {m.status === 'CONFIRMED' && m.confirmedSlot && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2 text-clinical-green text-sm font-semibold">
                  <CheckCircle2 size={16} />
                  <span>{m.confirmedSlot.date} at {m.confirmedSlot.time}</span>
                </div>
                {m.meetingLink ? (
                  <a
                    href={m.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-clinical-green/10 border border-clinical-green/20 rounded-lg text-clinical-green text-xs font-bold hover:bg-clinical-green/20 transition-colors"
                  >
                    <Video size={13} />
                    Join Meeting
                    <ExternalLink size={11} className="ml-auto opacity-60" />
                  </a>
                ) : (
                  <p className="text-[10px] text-white/30 flex items-center gap-1.5">
                    <Video size={11} />
                    Meeting link not added yet — the host will share it before the call
                  </p>
                )}
                <button
                  onClick={() => setOpenChatId(openChatId === m.id ? null : m.id)}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-clinical-green/20 text-clinical-green text-xs font-bold uppercase tracking-widest hover:bg-clinical-green/10 transition-colors"
                >
                  <MessageSquare size={12} />
                  {openChatId === m.id ? 'Close Chat' : 'Open Chat'}
                </button>
              </div>
            )}

            {/* ── Chat for non-confirmed (message request) */}
            {(m.status === 'PENDING' || m.status === 'SLOTS_PROPOSED' || m.status === 'NDA_PENDING') && (
              <div className="pt-1">
                <button
                  onClick={() => setOpenChatId(openChatId === m.id ? null : m.id)}
                  className="flex items-center gap-1.5 text-[10px] text-white/30 hover:text-white/60 transition-colors font-bold uppercase tracking-widest"
                >
                  <MessageSquare size={11} />
                  {openChatId === m.id ? 'Close Messages' : 'Send a Message'}
                </button>
              </div>
            )}

            {/* ── Chat window */}
            {openChatId === m.id && (
              <ChatWindow
                meetingId={m.id}
                otherPartyName={otherParty.name}
                onClose={() => setOpenChatId(null)}
              />
            )}

            {/* ── REJECTED */}
            {m.status === 'REJECTED' && (
              <div className="flex items-center gap-2 text-system-red/70 text-xs">
                <XCircle size={14} />
                <span>This meeting request was declined</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
