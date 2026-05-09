import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Loader2, MessageSquare, Send, X } from 'lucide-react';
import { messages as messagesApi } from '../api/client';
import { useAuth } from '../context/AuthContext';

interface Msg {
  id: string;
  content: string;
  createdAt: string;
  sender: { id: string; name: string; role: string };
}

interface Props {
  meetingId: string;
  otherPartyName: string;
  onClose: () => void;
}

const ROLE_COLORS: Record<string, string> = {
  HEALTHCARE: 'text-clinical-green',
  ENGINEER: 'text-[#60a5fa]',
  ADMIN: 'text-system-red',
};

export default function ChatWindow({ meetingId, otherPartyName, onClose }: Props) {
  const { user } = useAuth();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const data = await messagesApi.getMessages(meetingId);
      setMsgs(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [meetingId]);

  useEffect(() => {
    void fetchMessages();
    pollRef.current = setInterval(() => { void fetchMessages(); }, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setInput('');
    try {
      const msg = await messagesApi.sendMessage(meetingId, text);
      setMsgs(prev => [...prev, msg]);
    } catch {
      setInput(text);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <div className="mt-4 border-t border-white/8 pt-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MessageSquare size={13} className="text-clinical-green" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">
            Chat with {otherPartyName}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-white/25 hover:text-white/50 transition-colors"
          aria-label="Close chat"
        >
          <X size={14} />
        </button>
      </div>

      <div className="bg-black/20 rounded-xl border border-white/8 flex flex-col h-64">
        <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 size={18} className="text-white/20 animate-spin" />
            </div>
          ) : msgs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-2">
              <MessageSquare size={22} className="text-white/10" />
              <p className="text-white/25 text-xs">No messages yet. Say hello!</p>
            </div>
          ) : (
            msgs.map(msg => {
              const isMe = msg.sender.id === user?.id;
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                    isMe
                      ? 'bg-primary/20 text-white rounded-br-sm border border-primary/20'
                      : 'bg-white/8 text-white/80 rounded-bl-sm border border-white/8'
                  }`}>
                    {!isMe && (
                      <p className={`text-[9px] font-bold uppercase tracking-widest mb-1 ${ROLE_COLORS[msg.sender.role] ?? 'text-white/40'}`}>
                        {msg.sender.name}
                      </p>
                    )}
                    <p>{msg.content}</p>
                    <p className="text-[9px] text-white/25 mt-1 text-right">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-white/8 p-2 flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type a message..."
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-primary/40 transition-colors"
          />
          <button
            onClick={() => void handleSend()}
            disabled={!input.trim() || sending}
            className="px-3 py-2 bg-primary text-on-primary rounded-lg text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-30 flex items-center gap-1"
          >
            {sending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
          </button>
        </div>
      </div>
    </div>
  );
}
