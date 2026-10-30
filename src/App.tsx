/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { VideosSection } from './components/VideosSection';
import { ImpactSection } from './components/ImpactSection';
import { ContactSection } from './components/ContactSection';
import { CustomCursor } from './components/CustomCursor';
import { YouTubeChannelPayload } from './types/youtube';

const DEFAULT_CHANNEL_URL = 'https://www.youtube.com/channel/UC-ZyJFA9ZcGtzRg7J0QntDQ';
const DEFAULT_SUBSCRIBE_URL =
  'https://www.youtube.com/channel/UC-ZyJFA9ZcGtzRg7J0QntDQ?sub_confirmation=1';
const AUTO_REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export default function App() {
  const [channelData, setChannelData] = useState<YouTubeChannelPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('');
  const [showIntroWipe, setShowIntroWipe] = useState<boolean>(true);

  const fetchChannelData = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) {
      setSyncing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const endpoint = forceRefresh
        ? `/api/youtube/channel?refresh=true&t=${Date.now()}`
        : '/api/youtube/channel';
      const response = await fetch(endpoint);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to synchronize channel data.');
      }

      setChannelData(data);
    } catch (err: any) {
      setError(
        err?.message || 'Unable to connect to the YouTube synchronization service right now.'
      );
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, []);

  // Initial load + automatic periodic refresh
  useEffect(() => {
    fetchChannelData(false);

    const intervalId = window.setInterval(() => {
      fetchChannelData(true);
    }, AUTO_REFRESH_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [fetchChannelData]);

  // Dismiss intro crimson screen-wipe after animation completes
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      setShowIntroWipe(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setShowIntroWipe(false);
    }, 950);
    return () => window.clearTimeout(timer);
  }, []);

  // Track active section in viewport for Navbar crimson underline
  useEffect(() => {
    const sectionIds = ['hero', 'about', 'videos', 'impact', 'contact'];
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight * 0.35;
      let current = '';

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            current = id === 'hero' ? '' : id;
            break;
          }
        }
      }
      setActiveSection(current);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const subscribeUrl = channelData?.subscribeUrl || DEFAULT_SUBSCRIBE_URL;
  const channelUrl = channelData?.channelUrl || DEFAULT_CHANNEL_URL;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white relative selection:bg-[#F50707] selection:text-white overflow-x-hidden">
      {/* Crimson Screen-Wipe Page Introduction */}
      <AnimatePresence>
        {showIntroWipe && (
          <motion.div
            key="intro-wipe"
            aria-hidden="true"
            initial={{ scaleY: 1 }}
            animate={{ scaleY: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: 'top' }}
            className="fixed inset-0 z-[60] pointer-events-none bg-[#F50707] flex items-center justify-center"
          >
            <motion.span
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="font-display text-2xl sm:text-4xl font-black tracking-[0.35em] text-white"
            >
              NK
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightweight Film Grain Overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-30 film-grain mix-blend-overlay"
      />

      {/* Desktop Custom Cursor Glow */}
      <CustomCursor />

      {/* Top Navigation Bar */}
      <Navbar activeSection={activeSection} subscribeUrl={subscribeUrl} />

      {/* Main Content Sections */}
      <main>
        <HeroSection subscribeUrl={subscribeUrl} />

        <AboutSection />

        <VideosSection
          videos={channelData?.videos || []}
          loading={loading}
          error={error}
          channelUrl={channelUrl}
          onRetry={() => fetchChannelData(true)}
        />

        <ImpactSection
          channelData={channelData}
          loading={loading}
          syncing={syncing}
          error={error}
          onSyncLive={() => fetchChannelData(true)}
        />
      </main>

      {/* Contact & Social Footer */}
      <ContactSection channelUrl={channelUrl} />
    </div>
  );
}
