import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  activeSection: string;
  subscribeUrl: string;
}

const NAV_ITEMS = [
  { id: 'about', label: 'About' },
  { id: 'videos', label: 'Videos' },
  { id: 'impact', label: 'Impact' },
  { id: 'contact', label: 'Contact' },
];

export const Navbar: React.FC<NavbarProps> = ({ activeSection, subscribeUrl }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 36);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0A0A0A]/90 backdrop-blur-md border-b border-white/10 py-3.5'
          : 'bg-gradient-to-b from-[#0A0A0A]/80 to-transparent py-6'
      }`}
    >
      <div className="max-w-[1360px] mx-auto px-6 md:px-12 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark in Mirror Chrome */}
        <a
          href="#hero"
          onClick={(e) => handleNavClick(e, 'hero')}
          className="font-display text-lg md:text-xl font-extrabold tracking-[0.22em] mirror-heading hover:text-[#F50707] transition-colors duration-200 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#F50707]"
        >
          LUFFYEDITZ26
        </a>

        {/* Zone 2: 4 concise single-line navigation links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-9 text-xs font-display font-bold"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => handleNavClick(e, item.id)}
                className={`relative py-1.5 tracking-[0.18em] uppercase transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#F50707] ${
                  isActive ? 'text-white' : 'text-white/70 hover:text-white'
                }`}
              >
                {item.label}
                <span
                  className={`absolute bottom-0 left-0 right-0 h-[2px] bg-[#F50707] transition-transform duration-200 origin-left ${
                    isActive ? 'scale-x-100' : 'scale-x-0'
                  }`}
                />
              </a>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action (+ mobile menu trigger on small screens) */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href={subscribeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 text-xs font-display font-bold tracking-[0.18em] uppercase text-white bg-[#F50707] hover:bg-[#d10606] transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-white"
          >
            Subscribe
          </a>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 text-white border border-white/15 hover:border-[#F50707] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[#F50707]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden bg-[#0A0A0A]/98 backdrop-blur-xl border-b border-[#F50707]/40 px-6 pt-4 pb-8"
          >
            <nav className="flex flex-col space-y-2" aria-label="Mobile Navigation">
              {NAV_ITEMS.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={(e) => handleNavClick(e, item.id)}
                    className={`flex items-center justify-between py-3.5 text-base font-display font-bold tracking-[0.16em] uppercase border-b border-white/10 transition-colors ${
                      isActive ? 'text-[#F50707]' : 'text-white/80 hover:text-white'
                    }`}
                  >
                    <span>{item.label}</span>
                    {isActive && <span className="w-6 h-[2px] bg-[#F50707]" />}
                  </a>
                );
              })}
              <div className="pt-4">
                <a
                  href={subscribeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center py-3.5 px-6 text-xs font-display font-bold tracking-[0.2em] uppercase text-white bg-[#F50707] hover:bg-[#d10606] transition-colors whitespace-nowrap"
                >
                  Subscribe on YouTube
                </a>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
