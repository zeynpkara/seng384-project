import React, { useState, useEffect, useCallback } from 'react';
import { CalendarCheck, Clock, CheckCircle2, XCircle, Loader2, Plus, Send, ShieldCheck } from 'lucide-react';
import { meetings as meetingsApi } from '../api/client';

interface Slot { date: string; time: string }

interface Meeting {
  id: string;
  status: string;
  message: string | null;
  proposedSlots: Slot[] | null;
  confirmedSlot: Slot | null;
  post: { id: string; title: string; domain: string };
  requester: { id: string; name: string };
  postOwner: { id: string; name: string };
}

interface Props {
  userId: string;
  refreshKey?: number;
}

function ProposeSlots({ meetingId, onProposed }: { meetingId: string; onProposed: () => void }) {
  const [slots, setSlots] = useState([{ date: '', time: '' }, { date: '', time: '' }]);
  const [submitting, setSubmitting] = useState(false);

  const updateSlot = (i: number, field: 'date' | 'time', val: string) =>
    setSlots(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s));

  const addSlot = () => {
    if (slots.length < 3) setSlots(prev => [...prev, { date: '', time: '' }]);
  };

  const handleSubmit = async () => {
    const valid = slots.filter(s => s.date && s.time);
    if (valid.length === 0) return;
    setSubmitting(true);
    try {
      await meetingsApi.proposeSlots(meetingId, valid);
      onProposed();
    } catch {
      // silent — will refresh on next load
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
      <div className="flex gap-2 pt-1">
        {slots.length < 3 && (
          <button onClick={addSlot} className="flex items-center gap-1.5 px-3 py-2 bg-white/5 text-white/40 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors border border-white/10">
            <Plus size={11} /> Add Slot
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={!hasValid || submitting}
          className="flex-1 py-2 bg-primary text-on-primary rounded text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-1.5"
        >
          {submitting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
          Send Slots
        </button>
      </div>
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
        {[1, 2].map(i => <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />)}
      </div>
    );
  }

  if (meetingList.length === 0) {
    return <p className="text-white/30 text-sm">No meeting requests yet.</p>;
  }

  return (
    <div className="space-y-4">
      {meetingList.map(m => {
        const { label, cls } = statusLabel(m.status);
        const isRequester = m.requester.id === userId;

        return (
          <div key={m.id} className="glass-panel-elevated p-5 rounded-xl space-y-3">
            {/* Post + status */}
            <div className="flex justify-between items-start gap-3">
              <div className="min-w-0">
                <p className="text-white font-semibold text-sm truncate">{m.post.title}</p>
                <p className="text-white/40 text-[10px] uppercase tracking-widest mt-0.5">
                  {isRequester ? `To: ${m.postOwner.name}` : `From: ${m.requester.name}`}
                </p>
              </div>
              <span className={`shrink-0 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${cls}`}>
                {label}
              </span>
            </div>

            {/* PENDING — requester waits, owner proposes slots */}
            {m.status === 'NDA_PENDING' && isRequester && (
              <div className="space-y-3">
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

            {m.status === 'PENDING' && isRequester && (
              <p className="flex items-center gap-2 text-xs text-white/40">
                <Clock size={13} /> Waiting for the post owner to propose time slots
              </p>
            )}
            {m.status === 'PENDING' && !isRequester && (
              <ProposeSlots meetingId={m.id} onProposed={load} />
            )}

            {/* SLOTS_PROPOSED — requester picks one */}
            {m.status === 'SLOTS_PROPOSED' && m.proposedSlots && isRequester && (
              <div className="space-y-2">
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

            {/* SLOTS_PROPOSED — owner sees slots they proposed */}
            {m.status === 'SLOTS_PROPOSED' && !isRequester && (
              <p className="flex items-center gap-2 text-xs text-white/40">
                <Clock size={13} /> Waiting for {m.requester.name} to confirm a slot
              </p>
            )}

            {/* CONFIRMED */}
            {m.status === 'CONFIRMED' && m.confirmedSlot && (
              <div className="flex items-center gap-2 text-clinical-green text-sm font-semibold">
                <CheckCircle2 size={16} />
                <span>Meeting scheduled — {m.confirmedSlot.date} at {m.confirmedSlot.time}</span>
              </div>
            )}

            {/* REJECTED */}
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
