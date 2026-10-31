import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, Mail, Send, CheckCircle2, AlertCircle } from 'lucide-react';

interface ContactSectionProps {
  channelUrl: string;
}

const SOCIAL_LINKS = [
  {
    label: 'YouTube',
    handle: '@luffyeditz26',
    href: 'https://www.youtube.com/channel/UC-ZyJFA9ZcGtzRg7J0QntDQ',
  },
  {
    label: 'Instagram',
    handle: '@luffyeditz26',
    href: 'https://www.instagram.com/luffyeditz26/',
  },
  {
    label: 'GitHub',
    handle: 'Navin Kumar (NK)',
    href: 'https://github.com/navinkumar',
  },
];

export const ContactSection: React.FC<ContactSectionProps> = ({ channelUrl }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formResult, setFormResult] = useState<{
    notice: string;
    mailtoUrl: string;
    smtpConfigured: boolean;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormResult(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();

    if (trimmedName.length < 2) {
      setFormError('Please enter your name (at least 2 characters).');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setFormError('Please enter a valid email address.');
      return;
    }

    if (trimmedMessage.length < 10) {
      setFormError('Please enter a message of at least 10 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          subject: trimmedSubject,
          message: trimmedMessage,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Could not validate message.');
      }

      setFormResult({
        notice: data.notice,
        mailtoUrl: data.mailtoUrl,
        smtpConfigured: Boolean(data.smtpConfigured),
      });
    } catch {
      const fallbackMailto = `mailto:navinzoro3108@gmail.com?subject=${encodeURIComponent(
        trimmedSubject || `Message from ${trimmedName}`
      )}&body=${encodeURIComponent(
        `Name: ${trimmedName}\nEmail: ${trimmedEmail}\n\n${trimmedMessage}`
      )}`;
      setFormResult({
        notice:
          'Input validated. Automated server email delivery requires an SMTP email backend; use the direct mailto button below to send via your email client.',
        mailtoUrl: fallbackMailto,
        smtpConfigured: false,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer
      id="contact"
      className="relative w-full bg-[#0A0A0A] pt-24 md:pt-36 pb-16 border-t border-white/10"
    >
      <div className="max-w-[1360px] mx-auto px-6 md:px-12">
        {/* Section Index Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-between pb-8 mb-14 md:mb-20 border-b border-white/10"
        >
          <div className="flex items-center gap-3 font-mono text-xs tracking-[0.22em] text-white/70">
            <span className="text-[#F50707]">05</span>
            <span>/</span>
            <span>CONTACT &amp; SOCIAL LINKS</span>
          </div>
          <span className="font-mono text-xs tracking-[0.22em] text-white/50 hidden sm:inline">
            DIRECT CHANNEL
          </span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-16 items-start">
          {/* Left Column: Creator Identity, Large Mailto Link & Social Directory */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-10"
          >
            <div>
              <p className="font-mono text-xs tracking-[0.24em] text-[#F50707] mb-3">
                CREATOR &amp; VISUAL DIRECTOR
              </p>
              <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-[0.08em] mirror-heading leading-[1.12]">
                NAVIN KUMAR <span className="text-[#F50707]">(NK)</span>
              </h2>
            </div>

            {/* Direct Clickable Email */}
            <div className="pt-4 border-t border-white/10">
              <p className="font-mono text-xs tracking-[0.2em] text-white/55 mb-3">
                DIRECT ELECTRONIC MAIL
              </p>
              <a
                href="mailto:navinzoro3108@gmail.com"
                className="group inline-flex items-center gap-3 font-display text-lg sm:text-2xl md:text-3xl font-bold mirror-heading hover:text-[#F50707] transition-colors break-all focus-visible:outline-2 focus-visible:outline-[#F50707]"
              >
                <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-[#F50707] shrink-0" />
                <span className="underline decoration-white/25 group-hover:decoration-[#F50707] underline-offset-8">
                  navinzoro3108@gmail.com
                </span>
                <ArrowUpRight className="w-5 h-5 text-[#F50707] shrink-0 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>

            {/* Functional Social Links */}
            <div className="pt-6 border-t border-white/10">
              <p className="font-mono text-xs tracking-[0.2em] text-white/55 mb-5">
                OFFICIAL PLATFORMS
              </p>
              <div className="divide-y divide-white/10 border-t border-b border-white/10">
                {SOCIAL_LINKS.map((item) => {
                  const resolvedHref = item.label === 'YouTube' ? channelUrl : item.href;
                  return (
                    <a
                      key={item.label}
                      href={resolvedHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group py-4 flex items-center justify-between gap-4 text-white hover:text-[#F50707] transition-colors"
                    >
                      <span className="font-display text-lg sm:text-xl font-bold tracking-[0.1em] mirror-heading">
                        {item.label}
                      </span>
                      <div className="flex items-center gap-3 font-mono text-xs tracking-[0.16em] text-white/65 group-hover:text-white">
                        <span>{item.handle}</span>
                        <ArrowUpRight className="w-4 h-4 text-[#F50707] transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Right Column: Validated Direct Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 p-6 sm:p-8 border border-white/15 bg-[#0A0A0A]"
          >
            <div className="pb-5 mb-6 border-b border-white/10">
              <h3 className="font-display text-xl font-bold tracking-[0.1em] mirror-heading">
                SEND A MESSAGE
              </h3>
              <p className="text-xs text-white/60 mt-2 leading-relaxed">
                Reach out regarding video editing, creative direction, or channel feedback.
                Automated server delivery requires an SMTP email backend; validated messages can
                also be dispatched immediately via your email client.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div>
                <label
                  htmlFor="contact-name"
                  className="block font-display text-[11px] font-bold tracking-[0.2em] text-white/75 mb-2"
                >
                  NAME *
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-3 text-sm text-white bg-[#0A0A0A] border border-white/20 focus:border-[#F50707] focus:outline-none transition-colors placeholder:text-white/30"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-email"
                  className="block font-display text-[11px] font-bold tracking-[0.2em] text-white/75 mb-2"
                >
                  EMAIL ADDRESS *
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 text-sm text-white bg-[#0A0A0A] border border-white/20 focus:border-[#F50707] focus:outline-none transition-colors placeholder:text-white/30"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-subject"
                  className="block font-display text-[11px] font-bold tracking-[0.2em] text-white/75 mb-2"
                >
                  SUBJECT
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject"
                  className="w-full px-4 py-3 text-sm text-white bg-[#0A0A0A] border border-white/20 focus:border-[#F50707] focus:outline-none transition-colors placeholder:text-white/30"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="block font-display text-[11px] font-bold tracking-[0.2em] text-white/75 mb-2"
                >
                  MESSAGE *
                </label>
                <textarea
                  id="contact-message"
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your message..."
                  className="w-full px-4 py-3 text-sm text-white bg-[#0A0A0A] border border-white/20 focus:border-[#F50707] focus:outline-none transition-colors placeholder:text-white/30 resize-y"
                />
              </div>

              {formError && (
                <div className="p-3.5 border border-[#F50707] bg-[#F50707]/10 flex items-start gap-2.5 text-xs text-white">
                  <AlertCircle className="w-4 h-4 text-[#F50707] shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {formResult && (
                <div className="p-4 border border-white/25 bg-white/[0.03] space-y-3 text-xs text-white/85">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#F50707] shrink-0 mt-0.5" />
                    <p className="leading-relaxed">{formResult.notice}</p>
                  </div>
                  <a
                    href={formResult.mailtoUrl}
                    className="inline-flex items-center gap-2 px-4 py-2 font-display text-[11px] font-bold tracking-[0.16em] text-white bg-[#F50707] hover:bg-[#d10606] transition-colors whitespace-nowrap"
                  >
                    <span>OPEN IN EMAIL CLIENT</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 text-xs font-display font-bold tracking-[0.2em] text-white bg-[#F50707] hover:bg-[#d10606] disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'VALIDATING...' : 'VALIDATE & PREPARE MESSAGE'}</span>
              </button>
            </form>
          </motion.div>
        </div>

        {/* Bottom Copyright & Brand Lockup */}
        <div className="mt-20 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono tracking-[0.18em] text-white/50">
          <div className="flex items-center gap-3">
            <span className="font-display font-bold mirror-heading tracking-[0.22em]">
              LUFFYEDITZ26 / NK
            </span>
            <span>·</span>
            <span>NAVIN KUMAR</span>
          </div>
          <div>
            <span>© {new Date().getFullYear()} LUFFYEDITZ26. ALL RIGHTS RESERVED.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
