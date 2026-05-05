import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Mail, MapPin, Phone, Send } from 'lucide-react';
import { motion } from 'motion/react';
import { useDataStore } from '../store/dataStore';

const IS_STATIC_DEPLOY = import.meta.env.VITE_STATIC_DEPLOY === 'true';

export default function Contact() {
  const { profile, profileLoaded, fetchProfileAndSkills, settings } = useDataStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchProfileAndSkills();
  }, [fetchProfileAndSkills]);

  if (!profileLoaded) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#ff4d4d] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!name.trim()) {
      setStatus('error');
      setErrorMsg('Please enter your name.');
      return;
    }

    if (!email.trim()) {
      setStatus('error');
      setErrorMsg('Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus('error');
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (!message.trim()) {
      setStatus('error');
      setErrorMsg('Please enter your message.');
      return;
    }

    if (message.trim().length < 10) {
      setStatus('error');
      setErrorMsg('Message must be at least 10 characters long.');
      return;
    }

    setStatus('sending');
    setErrorMsg('');

    try {
      if (IS_STATIC_DEPLOY) {
        const recipientEmail = profile?.email || 'chearotha.itc.edu@gmail.com';
        const mailtoParams = new URLSearchParams({
          subject: `Portfolio message from ${name.trim()}`,
          body: `Name: ${name.trim()}\nEmail: ${email.trim()}\n\n${message.trim()}`
        });

        window.location.href = `mailto:${recipientEmail}?${mailtoParams.toString()}`;
        setStatus('success');
        setTimeout(() => setStatus('idle'), 2000);
        return;
      }

      const res = await fetch(`/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          senderEmail: email.trim(),
          message: message.trim(),
          recipientEmail: profile?.email || 'chearotha.itc.edu@gmail.com',
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || data.message || 'Failed to send email');
      }
      
      setStatus('success');
      // Clear form after 2 seconds to show success message
      setTimeout(() => {
        setName('');
        setEmail('');
        setMessage('');
        setStatus('idle');
      }, 2000);
    } catch (error: any) {
      setStatus('error');
      setErrorMsg(error.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="max-w-3xl mb-16">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold tracking-tight text-zinc-900 dark:text-white mb-6 flex items-center gap-4">
          <span className="text-[#ff4d4d] font-mono opacity-80">⟩</span>
          {settings?.contactTitle || 'Get in Touch'}
        </h1>
        <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
          {settings?.contactSubtitle || 'Feel free to reach out for collaborations or just a friendly hello.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        <div className="space-y-10">
          <div className="flex items-start gap-6">
            <div className="p-4 bg-[#ff4d4d]/5 text-[#ff4d4d] rounded-2xl flex-shrink-0 border border-[#ff4d4d]/10">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">Email</h3>
              <a
                href={`mailto:${profile?.email}`}
                className="text-zinc-400 hover:text-[#ff4d4d] transition-colors font-medium"
              >
                {profile?.email}
              </a>
            </div>
          </div>

          <div className="flex items-start gap-6">
            <div className="p-4 bg-[#ff4d4d]/5 text-[#ff4d4d] rounded-2xl flex-shrink-0 border border-[#ff4d4d]/10">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">Phone</h3>
              <a
                href={`tel:${profile?.phone}`}
                className="text-zinc-400 hover:text-[#ff4d4d] transition-colors font-medium"
              >
                {profile?.phone}
              </a>
            </div>
          </div>

          <div className="flex items-start gap-6">
            <div className="p-4 bg-[#ff4d4d]/5 text-[#ff4d4d] rounded-2xl flex-shrink-0 border border-[#ff4d4d]/10">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">Location</h3>
              <p className="text-zinc-600 dark:text-zinc-400 font-medium">{profile?.location}</p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-zinc-50 dark:bg-white/5 p-8 sm:p-10 rounded-[32px] border border-zinc-200 dark:border-white/5 transition-all duration-500 hover:border-[#ff4d4d]/20"
        >
          <div className="space-y-2">
            <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-black/40 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#ff4d4d]/50 focus:border-transparent outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-700"
              placeholder="Full Name"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-black/40 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#ff4d4d]/50 focus:border-transparent outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-700"
              placeholder="email@example.com"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1">Message</label>
            <textarea
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-black/40 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#ff4d4d]/50 focus:border-transparent outline-none transition-all resize-none placeholder:text-zinc-400 dark:placeholder:text-zinc-700"
              placeholder="Write your message here..."
            />
          </div>

          {status === 'success' && (
            <div className="flex items-center gap-3 p-4 bg-[#ff4d4d]/5 border border-[#ff4d4d]/20 rounded-2xl text-[#ff4d4d]">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-bold uppercase tracking-tighter">
                {IS_STATIC_DEPLOY
                  ? 'Email Client Launched'
                  : 'Message Received'}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'sending'}
            className="w-full py-4 px-8 bg-[#ff4d4d] hover:bg-[#ff3333] disabled:opacity-60 disabled:cursor-not-allowed text-white text-base font-bold rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,77,77,0.3)]"
          >
            {status === 'sending' ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Initiate Contact
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
