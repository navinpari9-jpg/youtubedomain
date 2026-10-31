import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowDown, Play, ExternalLink } from 'lucide-react';
import luffyHero4k from '../assets/images/luffy_hero_4k_1793367987591.jpg';

interface HeroSectionProps {
  subscribeUrl: string;
}

const UPLOADED_LUFFY_BG = luffyHero4k;
const FALLBACK_LUFFY_BG = '/assets/aistudio/luffy_9090c427.jpeg';
const TITLE_CHARS = 'LUFFYEDITZ26'.split('');

const PARTICLES = [
  { id: 1, left: '14%', top: '76%', size: 2.5, duration: 8.5, delay: 0.2 },
  { id: 2, left: '29%', top: '84%', size: 2, duration: 9.6, delay: 1.4 },
  { id: 3, left: '48%', top: '80%', size: 2.5, duration: 8.8, delay: 0.8 },
  { id: 4, left: '66%', top: '86%', size: 2, duration: 10.4, delay: 2.1 },
  { id: 5, left: '81%', top: '74%', size: 2.5, duration: 9.1, delay: 1.1 },
];

export const HeroSection: React.FC<HeroSectionProps> = ({ subscribeUrl }) => {
  const [heroSrc, setHeroSrc] = useState<string>(UPLOADED_LUFFY_BG);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 900], ['0%', '10%']);
  const bgScale = useTransform(scrollY, [0, 900], [1.08, 1.16]);
  const contentOpacity = useTransform(scrollY, [0, 560], [1, 0]);

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!finePointer || reducedMotion) return;

    const handleMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 10;
      const ny = (e.clientY / window.innerHeight - 0.5) * 6;
      setMouseOffset({ x: nx, y: ny });
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  const scrollToVideos = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const videosEl = document.getElementById('videos');
    if (videosEl) {
      videosEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="hero"
      className="relative h-screen min-h-[100dvh] w-screen max-w-full flex flex-col justify-end overflow-hidden bg-[#0A0A0A] pb-8 md:pb-12"
    >
      {/* Fullscreen 4K Background Image Layer — Edge-to-Edge 100vw x 100vh */}
      <motion.div
        style={{
          y: bgY,
          scale: bgScale,
          x: mouseOffset.x * -0.4,
        }}
        className="absolute inset-0 w-full h-full z-0 pointer-events-none"
      >
        <motion.img
          src={heroSrc}
          alt="Luffy 4K Fullscreen Hero — luffyeditz26 / NK"
          referrerPolicy="no-referrer"
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            if (heroSrc !== FALLBACK_LUFFY_BG) {
              setHeroSrc(FALLBACK_LUFFY_BG);
            }
          }}
          animate={{ scale: [1.06, 1.1, 1.06] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          className={`w-full h-full object-cover object-center transition-opacity duration-700 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </motion.div>

      {/* Light Top Navbar Scrim + Localized Bottom Readability Gradient */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-28 z-10 pointer-events-none bg-gradient-to-b from-[#0A0A0A]/70 to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-[62%] z-10 pointer-events-none bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/70 to-transparent"
      />

      {/* Subtle Floating Crimson Particles */}
      <div aria-hidden="true" className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        {PARTICLES.map((p) => (
          <motion.span
            key={p.id}
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
            }}
            animate={{
              y: [0, -85, -150],
              opacity: [0, 0.65, 0],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: 'easeOut',
            }}
            className="absolute rounded-full bg-[#F50707] shadow-[0_0_8px_#F50707]"
          />
        ))}
      </div>

      {/* Foreground Content Anchored Cleanly in Lower Frame */}
      <motion.div
        style={{ opacity: contentOpacity }}
        className="relative z-20 max-w-[1360px] w-full mx-auto px-6 md:px-12"
      >
        <div className="max-w-5xl">
          {/* Secondary Monogram Lockup: NK (Mirror Chrome Style) */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-4 mb-4"
          >
            <span className="inline-flex items-center justify-center px-3.5 py-1 border border-[#F50707] bg-[#0A0A0A]/85 backdrop-blur-xs font-display text-sm md:text-base font-bold tracking-[0.28em] mirror-heading">
              NK
            </span>
            <span className="h-[1px] w-10 bg-[#F50707]" />
            <span className="font-display text-[11px] sm:text-xs font-semibold tracking-[0.28em] text-white/95 uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
              NAVIN KUMAR · VISUAL DIRECTOR
            </span>
          </motion.div>

          {/* Main Title: LUFFYEDITZ26 — Mirror Chrome Finish + Cross-Browser Mirror Floor Reflection */}
          <div className="relative inline-block max-w-full">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-x-6 -inset-y-2 bg-[radial-gradient(ellipse_at_center,rgba(245,7,7,0.22)_0%,transparent_70%)] blur-2xl animate-aura-breathe"
            />

            <h1
              aria-label="LUFFYEDITZ26"
              className="relative font-display font-extrabold text-[clamp(2.2rem,6.6vw,5.8rem)] leading-[0.96] tracking-[0.12em] flex flex-wrap items-baseline"
            >
              {TITLE_CHARS.map((char, index) => {
                const isNumber = char === '2' || char === '6';
                return (
                  <span
                    key={`${char}-${index}`}
                    className="inline-block overflow-visible py-1"
                  >
                    <motion.span
                      initial={{ y: '100%', opacity: 0, scaleY: 1.25 }}
                      animate={{ y: '0%', opacity: 1, scaleY: 1 }}
                      whileHover={{
                        y: -5,
                        scale: 1.05,
                        transition: { duration: 0.18, ease: 'easeOut' },
                      }}
                      transition={{
                        duration: 0.8,
                        delay: 0.22 + index * 0.05,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className={`inline-block cursor-default select-none drop-shadow-[0_8px_28px_rgba(0,0,0,0.95)] ${
                        isNumber ? 'mirror-crimson-char' : 'mirror-hero-char'
                      }`}
                    >
                      {char}
                    </motion.span>
                  </span>
                );
              })}
            </h1>

            {/* Cross-Browser Vertical Mirror Reflection Layer */}
            <motion.div
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.32 }}
              transition={{ duration: 1, delay: 0.9 }}
              className="pointer-events-none select-none font-display font-extrabold text-[clamp(2.2rem,6.6vw,5.8rem)] leading-[0.96] tracking-[0.12em] flex flex-wrap items-baseline scale-y-[-0.38] origin-top -mt-1 blur-[0.6px] [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.85)_0%,transparent_75%)]"
            >
              {TITLE_CHARS.map((char, index) => {
                const isNumber = char === '2' || char === '6';
                return (
                  <span
                    key={`reflect-${char}-${index}`}
                    className={isNumber ? 'text-[#F50707]' : 'text-white'}
                  >
                    {char}
                  </span>
                );
              })}
            </motion.div>

            {/* Elegant Precision Crimson Horizon Slash with Center Diamond Accent */}
            <div className="relative -mt-4 sm:-mt-6 flex items-center">
              <motion.div
                aria-hidden="true"
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ duration: 1.1, delay: 0.95, ease: [0.22, 1, 0.36, 1] }}
                className="h-[1px] w-full origin-left bg-gradient-to-r from-[#F50707] via-[#F50707]/80 to-transparent shadow-[0_0_16px_#F50707]"
              />
              <motion.span
                aria-hidden="true"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.15, ease: [0.22, 1, 0.36, 1] }}
                className="absolute left-0 w-2 h-2 rotate-45 bg-[#F50707] shadow-[0_0_12px_#F50707]"
              />
            </div>
          </div>

          {/* Subtitle in Mirror Display Font */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.05, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 font-display text-xs sm:text-sm md:text-base font-bold tracking-[0.3em] mirror-heading uppercase max-w-2xl drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]"
          >
            ANIME ENERGY. CREATIVE VISION. REAL TECH.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="mt-7 flex flex-wrap items-center gap-4 sm:gap-5"
          >
            <a
              href="#videos"
              onClick={scrollToVideos}
              className="group inline-flex items-center justify-center gap-3 px-7 py-3.5 text-xs sm:text-sm font-display font-bold tracking-[0.22em] text-white bg-[#0A0A0A]/80 backdrop-blur-xs border border-white/30 hover:border-[#F50707] hover:bg-[#0A0A0A] transition-all duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#F50707]"
            >
              <Play className="w-3.5 h-3.5 text-[#F50707] fill-[#F50707] transition-transform duration-150 group-hover:scale-110" />
              <span>EXPLORE VIDEOS</span>
            </a>

            <a
              href={subscribeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 px-8 py-3.5 text-xs sm:text-sm font-display font-bold tracking-[0.22em] text-white bg-[#F50707] hover:bg-[#d80606] transition-all duration-150 animate-crimson-pulse whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-white"
            >
              <span>SUBSCRIBE</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </motion.div>
        </div>

        {/* Bottom Bar with Elegant Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.45 }}
          className="mt-8 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-white/75"
        >
          <div className="flex items-center gap-3 font-mono tracking-[0.18em]">
            <span className="text-[#F50707]">01</span>
            <span>/</span>
            <span>PIRATE AWAKENING</span>
          </div>

          <a
            href="#about"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group inline-flex items-center gap-2.5 font-mono tracking-[0.2em] text-white/85 hover:text-white transition-colors whitespace-nowrap"
          >
            <span>SCROLL</span>
            <motion.span
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-flex items-center justify-center w-6 h-6 border border-white/25 group-hover:border-[#F50707] transition-colors"
            >
              <ArrowDown className="w-3.5 h-3.5 text-[#F50707]" />
            </motion.span>
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
};
