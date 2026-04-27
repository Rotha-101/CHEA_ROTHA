import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Mail, MapPin, Phone, Send } from 'lucide-react';
import { useDataStore } from '../store/dataStore';

export default function Contact() {
  const { profile, profileLoaded, fetchProfileAndSkills } = useDataStore();
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
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
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
        <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-zinc-900 dark:text-white mb-6">
          Get in Touch
        </h1>
        <p className="text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Feel free to reach out for collaborations or just a friendly hello.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl flex-shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-zinc-900 dark:text-white">Email</h3>
              <a
                href={`mailto:${profile?.email}`}
                className="text-zinc-500 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              >
                {profile?.email}
              </a>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl flex-shrink-0">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-zinc-900 dark:text-white">Phone</h3>
              <a
                href={`tel:${profile?.phone}`}
                className="text-zinc-500 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              >
                {profile?.phone}
              </a>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl flex-shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-zinc-900 dark:text-white">Location</h3>
              <p className="text-zinc-500 dark:text-zinc-400">{profile?.location}</p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white dark:bg-zinc-900/50 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm"
        >
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
              placeholder="john@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Message</label>
            <textarea
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all resize-none"
              placeholder="How can I help you?"
            />
          </div>

          {status === 'success' && (
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-400">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">Message sent successfully! I will get back to you soon.</p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">{errorMsg}</p>
                {errorMsg.toLowerCase().includes('not set up') && (
                  <div className="text-xs mt-2 opacity-90 space-y-1">
                    <p className="font-medium">Email configuration needed:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Go to Admin Dashboard → Settings</li>
                      <li>Scroll to "Email Settings (Gmail)"</li>
                      <li>Enter your Gmail address</li>
                      <li>Generate a 16-digit <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="underline font-medium hover:opacity-75">Gmail App Password</a></li>
                      <li>Ensure 2-Step Verification is enabled</li>
                      <li>Save settings and try again</li>
                    </ol>
                  </div>
                )}
                {(errorMsg.toLowerCase().includes('authentication failed') || errorMsg.toLowerCase().includes('authentication')) && (
                  <div className="text-xs mt-2 opacity-90 space-y-1">
                    <p className="font-medium">Gmail rejected the credentials. Please verify:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Gmail address is correct and ends with @gmail.com</li>
                      <li>Using a 16-digit Gmail App Password (not your regular password)</li>
                      <li>2-Step Verification is enabled on your Gmail account</li>
                      <li><a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="underline font-medium hover:opacity-75">Generate a new App Password</a> if needed</li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'sending'}
            className="w-full py-3 px-6 bg-amber-400 hover:bg-amber-500 disabled:opacity-60 disabled:cursor-not-allowed text-zinc-950 font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {status === 'sending' ? (
              <>
                <div className="w-4 h-4 border-2 border-zinc-900/30 border-t-zinc-900 rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Message
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
