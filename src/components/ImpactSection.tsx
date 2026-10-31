import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { RefreshCw, ExternalLink, AlertCircle, Check } from 'lucide-react';
import { YouTubeChannelPayload } from '../types/youtube';

interface ImpactSectionProps {
  channelData: YouTubeChannelPayload | null;
  loading: boolean;
  syncing: boolean;
  error: string | null;
  onSyncLive: () => void;
}

interface AnimatedStatValueProps {
  value: number | null;
  loading: boolean;
  syncTrigger?: string;
}

const AnimatedStatValue: React.FC<AnimatedStatValueProps> = ({ value, loading, syncTrigger }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.15 });
  const [displayValue, setDisplayValue] = useState<number>(value ?? 0);
  const prevValueRef = useRef<number>(0);

  useEffect(() => {
    if (value === null || !Number.isFinite(value)) return;

    if (!isInView) {
      setDisplayValue(value);
      return;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      setDisplayValue(value);
      prevValueRef.current = value;
      return;
    }

    const startValue = prevValueRef.current !== value ? 0 : 0;
    let startTimestamp: number | null = null;
    const duration = 950;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + eased * (value - startValue));
      setDisplayValue(current);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
        prevValueRef.current = value;
      }
    };

    const frameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(frameId);
  }, [value, isInView, syncTrigger]);

  return (
    <div ref={containerRef} className="min-h-[3.5rem] flex items-baseline">
      {loading && value === null ? (
        <span className="inline-block w-36 h-12 bg-white/10 animate-pulse" />
      ) : value === null || !Number.isFinite(value) ? (
        <span className="font-mono text-2xl sm:text-3xl text-white/45 tracking-wider">
          UNAVAILABLE
        </span>
      ) : (
        <span className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mirror-stat tabular-nums">
          {new Intl.NumberFormat('en-US').format(displayValue)}
        </span>
      )}
    </div>
  );
};

function formatTimestamp(iso: string | undefined): string {
  if (!iso) return 'Syncing...';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      month: 'short',
      day: '2-digit',
    }).format(d);
  } catch {
    return iso;
  }
}

export const ImpactSection: React.FC<ImpactSectionProps> = ({
  channelData,
  loading,
  syncing,
  error,
  onSyncLive,
}) => {
  const [justSynced, setJustSynced] = useState(false);
  const prevSyncedAtRef = useRef<string | undefined>(channelData?.lastSyncedAt);

  useEffect(() => {
    if (
      channelData?.lastSyncedAt &&
      prevSyncedAtRef.current &&
      channelData.lastSyncedAt !== prevSyncedAtRef.current
    ) {
      setJustSynced(true);
      const timer = window.setTimeout(() => setJustSynced(false), 2500);
      prevSyncedAtRef.current = channelData.lastSyncedAt;
      return () => window.clearTimeout(timer);
    }
    prevSyncedAtRef.current = channelData?.lastSyncedAt;
  }, [channelData?.lastSyncedAt]);

  const stats = channelData?.stats;

  const statItems = [
    {
      index: '01',
      label: 'SUBSCRIBERS',
      value: stats?.subscriberCount ?? null,
      context: 'Official YouTube Community Audience',
    },
    {
      index: '02',
      label: 'TOTAL VIEWS',
      value: stats?.viewCount ?? null,
      context: 'Cumulative Channel Reach Across Releases',
    },
    {
      index: '03',
      label: 'PUBLISHED VIDEOS',
      value: stats?.videoCount ?? null,
      context: 'Public Anime Edits, Tech Guides & Reels',
    },
    {
      index: '04',
      label: 'AVERAGE VIEWS PER UPLOAD',
      value: stats?.averageViewsPerUpload ?? null,
      context: 'Computed Across Verified Channel Uploads',
    },
  ];

  return (
    <section
      id="impact"
      className="relative w-full bg-[#0A0A0A] py-24 md:py-36 border-t border-[#F50707]/50"
    >
      <div className="max-w-[1360px] mx-auto px-6 md:px-12">
        {/* Header Row with Live Sync Controls */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-12 border-b border-[#F50707]/40"
        >
          <div>
            <div className="flex items-center gap-3 font-mono text-xs tracking-[0.22em] text-white/70 mb-4">
              <span className="text-[#F50707]">04</span>
              <span>/</span>
              <span>VERIFIED CHANNEL IMPACT</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-[0.08em] mirror-heading [text-wrap:balance]">
              AUDIENCE &amp; REACH
            </h2>
          </div>

          {/* Sync Live Control & Last Updated Timestamp */}
          <div className="flex flex-wrap items-center gap-5">
            <div className="font-mono text-xs tracking-[0.16em] text-white/65 tabular-nums">
              <span>LAST UPDATED: </span>
              <span className="text-white">{formatTimestamp(channelData?.lastSyncedAt)}</span>
            </div>

            <button
              type="button"
              onClick={onSyncLive}
              disabled={syncing || loading}
              className="inline-flex items-center gap-2.5 px-5 py-3 text-xs font-display font-bold tracking-[0.18em] text-white bg-[#0A0A0A] border border-[#F50707] hover:bg-[#F50707] disabled:opacity-50 transition-colors duration-150 cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-white"
            >
              {justSynced && !syncing ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#F50707]" />
                  <span>SYNCED LIVE</span>
                </>
              ) : (
                <>
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${syncing || loading ? 'animate-spin' : ''}`}
                  />
                  <span>{syncing ? 'SYNCING LIVE...' : 'SYNC LIVE'}</span>
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Error Banner if API Request Fails */}
        {error && (
          <div className="mt-8 p-5 border border-[#F50707]/60 bg-[#0A0A0A] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-sm text-white/80">
              <AlertCircle className="w-5 h-5 text-[#F50707] shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={onSyncLive}
              className="px-4 py-2 text-xs font-mono tracking-[0.16em] text-white border border-white/20 hover:border-[#F50707] transition-colors cursor-pointer whitespace-nowrap"
            >
              RETRY
            </button>
          </div>
        )}

        {/* 4-Column Stat Grid with Thin Crimson Dividing Lines */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-b border-[#F50707]/40 divide-y sm:divide-y-0 sm:divide-x divide-[#F50707]/35">
          {statItems.map((item, idx) => (
            <motion.div
              key={item.index}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{
                duration: 0.5,
                delay: idx * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="py-10 sm:px-7 first:sm:pl-0 last:sm:pr-0 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between font-mono text-xs tracking-[0.2em] text-white/60 mb-6">
                  <span className="text-[#F50707]">{item.index}</span>
                  <span>{syncing ? 'UPDATING...' : 'VERIFIED LIVE'}</span>
                </div>

                <div className="my-4">
                  <AnimatedStatValue
                    value={item.value}
                    loading={loading}
                    syncTrigger={channelData?.lastSyncedAt}
                  />
                </div>

                <h3 className="mt-6 font-display text-sm font-bold tracking-[0.16em] mirror-heading">
                  {item.label}
                </h3>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-white/55">{item.context}</p>
            </motion.div>
          ))}
        </div>

        {/* Channel Verification Footer Strip */}
        <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono tracking-[0.16em] text-white/55">
          <div>
            <span>CHANNEL ID: </span>
            <span className="text-white/80">
              {channelData?.channelId || 'UC-ZyJFA9ZcGtzRg7J0QntDQ'}
            </span>
            {channelData?.warning && (
              <span className="block sm:inline sm:ml-4 text-white/50">
                · {channelData.warning}
              </span>
            )}
          </div>

          <a
            href={
              channelData?.channelUrl ||
              'https://www.youtube.com/channel/UC-ZyJFA9ZcGtzRg7J0QntDQ'
            }
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-display font-bold text-white hover:text-[#F50707] transition-colors whitespace-nowrap"
          >
            <span>VERIFY ON YOUTUBE</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#F50707]" />
          </a>
        </div>
      </div>
    </section>
  );
};
