import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Message {
  id: number;
  role: 'bot' | 'user';
  text: string;
}

const RESPONSES: Array<{ patterns: string[]; reply: string }> = [
  {
    patterns: ['merhaba', 'hello', 'hi', 'selam', 'hey'],
    reply: "Merhaba! HEALTH AI platformu hakkında sorularınızı yanıtlamak için buradayım. Ne öğrenmek istersiniz?",
  },
  {
    patterns: ['nasıl çalış', 'how does', 'platform', 'ne işe', 'nedir'],
    reply: "HEALTH AI, sağlık profesyonelleri ile mühendisleri buluşturan bir matchmaking platformudur. Sağlıkçılar klinik ihtiyaçlarını ilan olarak yayınlar, mühendisler de teknik çözümleri için klinik partner arar. Her iki taraf birbirinin ilanlarını görür ve 'Express Interest' butonuyla iletişim sürecini başlatır.",
  },
  {
    patterns: ['ilan', 'post', 'yayınla', 'create', 'oluştur'],
    reply: "İlan oluşturmak için sol menüdeki 'My Posts' → 'New Post' seçeneğini kullanın. Başlık, alan, gerekli uzmanlık, lokasyon ve toplantı platformu seçimini içeren formu doldurun. Draft olarak kaydedebilir veya direkt yayınlayabilirsiniz.",
  },
  {
    patterns: ['nda', 'gizlilik', 'confidential', 'anlaşma'],
    reply: "NDA (Non-Disclosure Agreement) platforma özel bir gizlilik protokolüdür. Bir ilana ilk kez ilgi ifade ettiğinizde imzalamanız istenir. Bir kez kabul ettiğinizde, sonraki tüm 'Express Interest' işlemlerinde tekrar görmezsiniz. Profil sayfanızda NDA kabul tarihini görebilirsiniz.",
  },
  {
    patterns: ['toplantı', 'meeting', 'zoom', 'meet', 'teams', 'görüşme'],
    reply: "Toplantı süreci şöyle işler:\n1. İlgi ifade edersiniz (Express Interest)\n2. NDA'yı kabul edersiniz\n3. İlan sahibi size 1-3 zaman dilimi önerir (Zoom/Meet/Teams linki ile birlikte)\n4. Bir zaman dilimi seçip onaylarsınız\n5. Post durumu 'Meeting Scheduled' olarak güncellenir",
  },
  {
    patterns: ['edu', 'email', 'kayıt', 'register', 'hesap'],
    reply: "Platforma kayıt olmak için kurumsal .edu veya .edu.tr uzantılı e-posta adresiniz gereklidir. Kayıt sonrası e-posta adresinize doğrulama linki gönderilir. Gmail gibi kişisel adresler kabul edilmez.",
  },
  {
    patterns: ['matchmaking', 'ai', 'yapay zeka', 'öneri', 'eşleştir'],
    reply: "Matchmaking AI özelliği Discover sayfasında bulunur. Profilinizde girdiğiniz uzmanlık alanları ve ilgi konularına göre en uygun ilanları puan sırasına göre listeler. Profil sayfanızı ne kadar detaylı doldurursanız öneriler o kadar isabetli olur!",
  },
  {
    patterns: ['profil', 'profile', 'bilgi', 'güncelle'],
    reply: "Profil sayfanızda isim, kurum, klinik/teknik uzmanlık, eğitim geçmişi ve araştırma ilgi alanlarınızı düzenleyebilirsiniz. Bu bilgiler Matchmaking AI'ın sizi doğru ilanlarla eşleştirmesi için kullanılır.",
  },
  {
    patterns: ['admin', 'yönetici', 'moderasyon'],
    reply: "Admin paneli ADMIN rolündeki kullanıcılar içindir. Kullanıcı doğrulama, içerik moderasyonu, audit log takibi ve CSV export işlemleri admin konsolundan yapılır. Normal kullanıcılar admin paneline erişemez.",
  },
  {
    patterns: ['şifre', 'password', 'unut', 'reset'],
    reply: "Şifre sıfırlama özelliği yakında eklenecektir. Şu an için şifrenizi hatırlıyorsanız Profil sayfasından hesap silme ve yeniden kayıt seçeneğini kullanabilirsiniz.",
  },
  {
    patterns: ['gdpr', 'veri', 'sil', 'export', 'kişisel'],
    reply: "GDPR hakklarınızı Profil → Data & Privacy bölümünden kullanabilirsiniz:\n• **Export**: Tüm verilerinizi JSON formatında indirin\n• **Delete**: Hesabınızı kalıcı olarak silin (aktif ilanlar anonim yapılır)",
  },
];

function getBotReply(input: string): string {
  const lower = input.toLowerCase();
  for (const { patterns, reply } of RESPONSES) {
    if (patterns.some(p => lower.includes(p))) return reply;
  }
  return "Üzgünüm, tam olarak anlayamadım. 'nasıl çalışır', 'ilan oluştur', 'NDA', 'toplantı' veya 'matchmaking AI' hakkında sorular sorabilirsiniz!";
}

const SUGGESTIONS = ['Nasıl çalışır?', 'İlan nasıl oluştururum?', 'NDA nedir?', 'Matchmaking AI'];

let idCounter = 0;
const uid = () => ++idCounter;

export default function ChatBot() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: uid(), role: 'bot', text: `Merhaba${user ? ' ' + user.name.split(' ')[0] : ''}! HEALTH AI platformu hakkında her şeyi sorun. Size yardımcı olmak için buradayım.` },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: uid(), role: 'user', text: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      const reply = getBotReply(text);
      setMessages(prev => [...prev, { id: uid(), role: 'bot', text: reply }]);
      setTyping(false);
    }, 600 + Math.random() * 400);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`fixed bottom-6 right-6 z-[90] w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${open ? 'bg-white/10 border border-white/20 rotate-0' : 'bg-primary hover:opacity-90'}`}
        title="AI Assistant"
      >
        {open ? <X size={20} className="text-white" /> : <MessageCircle size={22} className="text-on-primary" />}
        {!open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-clinical-green rounded-full border-2 border-[#0E0E0E] animate-pulse" />
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-[89] w-80 md:w-96 glass-panel border border-white/15 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{ maxHeight: '70vh' }}>
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-white/3">
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
              <Bot size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-white text-xs font-bold">HEALTH AI Assistant</p>
              <p className="text-[10px] text-clinical-green flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-clinical-green animate-pulse inline-block" />
                Online
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ minHeight: 200 }}>
            {messages.map(m => (
              <div key={m.id} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {m.role === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot size={12} className="text-primary" />
                  </div>
                )}
                <div className={`max-w-[75%] px-3 py-2 rounded-xl text-xs leading-relaxed whitespace-pre-line ${
                  m.role === 'bot'
                    ? 'bg-white/8 text-white/80 rounded-tl-none'
                    : 'bg-primary/20 text-white rounded-tr-none'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex gap-2 items-center">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Bot size={12} className="text-primary" />
                </div>
                <div className="px-3 py-2 bg-white/8 rounded-xl rounded-tl-none flex items-center gap-1">
                  <Loader2 size={11} className="text-white/40 animate-spin" />
                  <span className="text-[10px] text-white/30">yazıyor...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 2 && (
            <div className="px-3 pb-2 flex flex-wrap gap-1.5">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-[10px] px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex gap-2 p-3 border-t border-white/10">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send(input)}
              placeholder="Bir şeyler sorun..."
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-primary/40 transition-colors"
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || typing}
              className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center hover:opacity-90 disabled:opacity-30 transition-opacity shrink-0"
            >
              <Send size={13} className="text-on-primary" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
