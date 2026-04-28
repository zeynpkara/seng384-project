import React, { useState } from 'react';
import { X, ShieldCheck, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { meetings } from '../api/client';

interface Props {
  isOpen: boolean;
  meetingId: string;
  onAccepted: () => void;
  onCancel: () => void;
}

export default function NdaModal({ isOpen, meetingId, onAccepted, onCancel }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAccept = async () => {
    setError('');
    setLoading(true);
    try {
      await meetings.acceptNda(meetingId);
      onAccepted();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to accept NDA');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
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
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                  <ShieldCheck className="text-primary" size={20} />
                </div>
                <div>
                  <h2 className="text-lg text-white font-bold">Non-Disclosure Agreement</h2>
                  <p className="text-white/40 text-xs uppercase tracking-widest">Binding & Permanent</p>
                </div>
              </div>
              <button onClick={onCancel} className="text-white/40 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* NDA Text */}
            <div className="glass-panel rounded-xl p-5 mb-6 border-l-2 border-l-primary/40">
              <p className="text-white/70 text-sm leading-relaxed">
                By proceeding, you agree to maintain strict confidentiality regarding all information shared through the HEALTH AI platform. This includes any clinical data, research methodologies, technical specifications, or proprietary processes disclosed during collaboration.
              </p>
              <p className="text-white/50 text-sm leading-relaxed mt-3">
                This agreement is <span className="text-white font-semibold">binding and permanent</span>. Once accepted, you will not be asked to sign again for future collaborations on this platform.
              </p>
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2">
                <ShieldCheck size={14} className="text-clinical-green" />
                <p className="text-[10px] text-clinical-green uppercase tracking-widest font-bold">ENCRYPTED · INSTITUTIONAL GOVERNANCE</p>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2 mb-4">{error}</p>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white/50 border border-white/10 rounded-lg font-bold text-xs uppercase tracking-widest transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAccept}
                disabled={loading}
                className="flex-1 py-3 bg-primary text-on-primary rounded-lg font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                I Accept &amp; Proceed
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
