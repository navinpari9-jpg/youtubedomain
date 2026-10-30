import React, { useState } from 'react';
import { motion } from 'motion/react';

const CREATOR_PORTRAIT_PRIMARY = '/assets/aistudio/nk_42b50194.jpeg';
const CREATOR_PORTRAIT_FALLBACK = '/src/assets/images/luffy_red_moon_hero_1793366220996.jpg';

const DISCIPLINES = ['VIDEO EDITOR', 'TECH BUILDER', 'ANIME CREATOR'];

const EDITORIAL_PILLARS = [
  {
    index: '01',
    title: 'Precision Anime Editing',
    detail:
      'Frame-accurate velocity ramping, impact frames, custom sound design, and atmospheric color grading inspired by theatrical anime openings.',
  },
  {
    index: '02',
    title: 'Creative Direction & Visual Pacing',
    detail:
      'Every cut is structured around emotional cadence and narrative momentum—transforming raw sequences into high-retention visual experiences.',
  },
  {
    index: '03',
    title: 'Real-World Tech & Engineering',
    detail:
      'Clear, practical breakdowns of post-production pipelines, creator software workflows, and modern engineering tools built for fellow creators.',
  },
];

export const AboutSection: React.FC = () => {
  const [portraitSrc, setPortraitSrc] = useState(CREATOR_PORTRAIT_PRIMARY);
  const [portraitLoaded, setPortraitLoaded] = useState(false);

  return (
    <section
      id="about"
      className="relative w-full bg-[#0A0A0A] py-24 md:py-36 border-t border-white/10 overflow-hidden"
    >
      {/* Subtle Top Crimson Hairline Accent */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[1px] bg-gradient-to-r from-transparent via-[#F50707] to-transparent"
      />

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
            <span className="text-[#F50707]">02</span>
            <span>/</span>
            <span>EDITORIAL CREATOR PROFILE</span>
          </div>
          <span className="font-mono text-xs tracking-[0.22em] text-white/50 hidden sm:inline">
            LUFFYEDITZ26 · NK STUDIO
          </span>
        </motion.div>

        {/* Asymmetric Two-Column Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-stretch">
          {/* Left Column: Creator Studio Portrait Framed by Fine Crimson Lines */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 flex flex-col justify-between"
          >
            <div className="group relative h-full min-h-[460px] sm:min-h-[560px] p-3 sm:p-4 border border-[#F50707]/60 bg-[#0A0A0A] flex flex-col">
              {/* Fine Crimson Corner Hairlines */}
              <span
                aria-hidden="true"
                className="absolute -top-[1px] -left-[1px] w-5 h-5 border-t-2 border-l-2 border-[#F50707]"
              />
              <span
                aria-hidden="true"
                className="absolute -top-[1px] -right-[1px] w-5 h-5 border-t-2 border-r-2 border-[#F50707]"
              />
              <span
                aria-hidden="true"
                className="absolute -bottom-[1px] -left-[1px] w-5 h-5 border-b-2 border-l-2 border-[#F50707]"
              />
              <span
                aria-hidden="true"
                className="absolute -bottom-[1px] -right-[1px] w-5 h-5 border-b-2 border-r-2 border-[#F50707]"
              />

              {/* Portrait Container */}
              <div className="relative flex-1 w-full overflow-hidden bg-[#0A0A0A] border border-white/10">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 50% 35%, rgba(245, 7, 7, 0.18), rgba(10, 10, 10, 0.98) 75%)',
                  }}
                />
                <img
                  src={portraitSrc}
                  alt="Navin Kumar (NK) — Editorial Creator Portrait"
                  referrerPolicy="no-referrer"
                  onLoad={() => setPortraitLoaded(true)}
                  onError={() => {
                    if (portraitSrc !== CREATOR_PORTRAIT_FALLBACK) {
                      setPortraitSrc(CREATOR_PORTRAIT_FALLBACK);
                    }
                  }}
                  className={`w-full h-full object-cover object-[50%_18%] group-hover:scale-[1.03] transition-all duration-700 ${
                    portraitLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                />

                {/* Subtle Crimson Edge Lighting & Bottom Contrast Scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent pointer-events-none" />
                <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(245,7,7,0.08)] pointer-events-none" />

                {/* Bottom Caption Inside Frame */}
                <div className="absolute bottom-0 inset-x-0 p-5 flex items-end justify-between border-t border-white/10 bg-[#0A0A0A]/85 backdrop-blur-xs">
                  <div>
                    <p className="font-mono text-[11px] tracking-[0.22em] text-[#F50707]">
                      CREATOR MONOGRAPH · NK
                    </p>
                    <p className="font-display text-sm font-bold tracking-[0.14em] text-white mt-1">
                      NAVIN KUMAR (NK)
                    </p>
                  </div>
                  <span className="font-mono text-xs text-white/60 tabular-nums">DIRECTOR</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Editorial Monograph Typography & Story */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 flex flex-col justify-between lg:pl-4"
          >
            <div>
              {/* Clean Unboxed Discipline Metadata with Crimson Separators */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs tracking-[0.22em] text-white/80 mb-6">
                {DISCIPLINES.map((label, idx) => (
                  <React.Fragment key={label}>
                    <span>{label}</span>
                    {idx < DISCIPLINES.length - 1 && (
                      <span aria-hidden="true" className="text-[#F50707] font-bold">
                        /
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Editorial Serif Section Heading */}
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[0.06em] text-white leading-[1.12] [text-wrap:balance]">
                THE MIND BEHIND THE EDITS
              </h2>

              {/* Creator Name Sub-header */}
              <div className="mt-6 pb-6 border-b border-[#F50707]/40 flex flex-wrap items-baseline justify-between gap-4">
                <p className="font-display text-xl sm:text-2xl font-semibold tracking-[0.1em] text-white">
                  Navin Kumar <span className="text-[#F50707]">(NK)</span>
                </p>
                <span className="font-mono text-xs tracking-[0.2em] text-white/60">
                  FOUNDER &amp; CREATOR · @LUFFYEDITZ26
                </span>
              </div>

              {/* Concise Editorial Introduction */}
              <div className="mt-8 space-y-5 text-base sm:text-[17px] leading-[1.75] text-white/80 max-w-[68ch]">
                <p>
                  Operating at the intersection of high-impact anime editing and modern digital
                  craftsmanship, <strong className="text-white font-semibold">Navin Kumar (NK)</strong>{' '}
                  builds visual stories designed to command attention from the very first frame.
                  Under the banner of <strong className="text-white font-semibold">luffyeditz26</strong>,
                  every release merges the raw kinetic intensity of anime openings with the
                  disciplined pacing of a film director’s reel.
                </p>
                <p>
                  Beyond rhythm-driven character edits and atmospheric visual effects, the channel
                  explores practical technology tutorials, post-production workflows, and real-world
                  engineering concepts—empowering viewers to master both the creative canvas and the
                  technical tools behind it.
                </p>
              </div>
            </div>

            {/* Three Editorial Pillars Separated by Hairline Dividers */}
            <div className="mt-12 pt-8 border-t border-white/15 grid grid-cols-1 md:grid-cols-3 gap-8">
              {EDITORIAL_PILLARS.map((pillar) => (
                <div key={pillar.index} className="group flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 font-mono text-xs tracking-[0.2em] text-[#F50707] mb-3">
                      <span>{pillar.index}.</span>
                      <span className="h-[1px] flex-1 bg-white/15 group-hover:bg-[#F50707]/60 transition-colors" />
                    </div>
                    <h3 className="font-display text-base font-bold tracking-[0.06em] text-white mb-2">
                      {pillar.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-white/65">{pillar.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
