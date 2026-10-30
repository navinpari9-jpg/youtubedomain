import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, ExternalLink, X, AlertCircle, RefreshCw, Film } from 'lucide-react';
import { VideoCategory, YouTubeVideoItem } from '../types/youtube';

interface VideosSectionProps {
  videos: YouTubeVideoItem[];
  loading: boolean;
  error: string | null;
  channelUrl: string;
  onRetry: () => void;
}

const CATEGORIES: VideoCategory[] = ['ALL', 'ANIME EDITS', 'TECH GUIDES', 'CREATIVE EDITS'];

const FALLBACK_THUMBS: Record<Exclude<VideoCategory, 'ALL'>, string> = {
  'ANIME EDITS': '/src/assets/images/thumb_anime_awakening_1793366223850.jpg',
  'TECH GUIDES': '/src/assets/images/thumb_tech_workflow_1793366225832.jpg',
  'CREATIVE EDITS': '/src/assets/images/thumb_creative_vfx_1793366225977.jpg',
};

function formatPublishedDate(iso: string): string {
  try {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    }).format(date);
  } catch {
    return iso;
  }
}

function formatNumber(num: number | null): string | null {
  if (num === null || !Number.isFinite(num)) return null;
  return new Intl.NumberFormat('en-US').format(num);
}

interface VideoThumbnailImageProps {
  video: YouTubeVideoItem;
  highRes?: boolean;
  className?: string;
}

const VideoThumbnailImage: React.FC<VideoThumbnailImageProps> = ({
  video,
  highRes = false,
  className = '',
}) => {
  const initialSrc = highRes ? video.highResThumbnailUrl : video.thumbnailUrl;
  const [src, setSrc] = useState(initialSrc);

  useEffect(() => {
    setSrc(highRes ? video.highResThumbnailUrl : video.thumbnailUrl);
  }, [video.highResThumbnailUrl, video.thumbnailUrl, highRes]);

  return (
    <img
      src={src}
      alt={video.title}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => {
        if (src !== video.thumbnailUrl) {
          setSrc(video.thumbnailUrl);
        } else {
          const categoryFallback = FALLBACK_THUMBS[video.category];
          if (src !== categoryFallback) {
            setSrc(categoryFallback);
          }
        }
      }}
      className={className}
    />
  );
};

export const VideosSection: React.FC<VideosSectionProps> = ({
  videos,
  loading,
  error,
  channelUrl,
  onRetry,
}) => {
  const [activeCategory, setActiveCategory] = useState<VideoCategory>('ALL');
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideoItem | null>(null);

  const filteredVideos = useMemo(() => {
    if (activeCategory === 'ALL') return videos;
    return videos.filter((v) => v.category === activeCategory);
  }, [videos, activeCategory]);

  const featuredVideo = filteredVideos[0] || null;
  const supportingVideos = filteredVideos.slice(1, 9);

  // Close cinema modal on Escape key
  useEffect(() => {
    if (!selectedVideo) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedVideo(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedVideo]);

  return (
    <section
      id="videos"
      className="relative w-full bg-[#0A0A0A] py-24 md:py-36 border-t border-white/10"
    >
      <div className="max-w-[1360px] mx-auto px-6 md:px-12">
        {/* Section Index + Director's Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-white/10"
        >
          <div>
            <div className="flex items-center gap-3 font-mono text-xs tracking-[0.22em] text-white/70 mb-4">
              <span className="text-[#F50707]">03</span>
              <span>/</span>
              <span>CINEMATIC SHOWCASE</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[0.06em] text-white [text-wrap:balance]">
              LATEST RELEASES
            </h2>
          </div>

          {/* Interactive Filter Controls (Functional Buttons) */}
          <div
            role="tablist"
            aria-label="Filter videos by category"
            className="flex flex-wrap items-center gap-2"
          >
            {CATEGORIES.map((category) => {
              const isSelected = activeCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2.5 text-xs font-mono tracking-[0.16em] transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#F50707] ${
                    isSelected
                      ? 'bg-[#F50707] text-white font-semibold'
                      : 'bg-transparent text-white/65 border border-white/15 hover:border-[#F50707]/60 hover:text-white'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Loading Skeleton State */}
        {loading && videos.length === 0 && (
          <div className="mt-12 space-y-12" aria-busy="true" aria-label="Loading channel uploads">
            <div className="w-full aspect-video bg-white/[0.03] border border-white/10 animate-pulse p-8 flex flex-col justify-end">
              <div className="h-3 w-40 bg-white/10 mb-4" />
              <div className="h-8 w-2/3 bg-white/10 mb-3" />
              <div className="h-4 w-48 bg-white/10" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {[0, 1, 2].map((skeletonIdx) => (
                <div
                  key={skeletonIdx}
                  className={`${
                    skeletonIdx === 0 ? 'md:col-span-7' : 'md:col-span-5'
                  } aspect-video bg-white/[0.03] border border-white/10 animate-pulse`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && error && videos.length === 0 && (
          <div className="mt-12 p-10 border border-[#F50707]/50 bg-[#0A0A0A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-[#F50707] shrink-0 mt-0.5" />
              <div>
                <h3 className="font-display text-lg font-bold tracking-[0.08em] text-white">
                  UNABLE TO LOAD LIVE UPLOADS
                </h3>
                <p className="text-sm text-white/70 mt-1 max-w-xl">{error}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-mono tracking-[0.16em] text-white bg-[#F50707] hover:bg-[#d10606] transition-colors cursor-pointer whitespace-nowrap"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>RETRY SYNC</span>
              </button>
              <a
                href={`${channelUrl}/videos`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-mono tracking-[0.16em] text-white border border-white/20 hover:border-[#F50707] transition-colors whitespace-nowrap"
              >
                <span>OPEN YOUTUBE</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* Empty Filter State */}
        {!loading && !error && filteredVideos.length === 0 && (
          <div className="mt-12 py-20 px-6 border border-white/10 text-center">
            <Film className="w-8 h-8 text-[#F50707] mx-auto mb-4" />
            <h3 className="font-display text-xl font-bold tracking-[0.08em] text-white">
              NO UPLOADS IN THIS CATEGORY YET
            </h3>
            <p className="text-sm text-white/65 mt-2 max-w-md mx-auto">
              No recent uploads matched the <span className="text-white">{activeCategory}</span>{' '}
              filter. View the complete archive or switch back to all uploads.
            </p>
            <div className="mt-6 flex items-center justify-center gap-4">
              {activeCategory !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => setActiveCategory('ALL')}
                  className="px-6 py-3 text-xs font-mono tracking-[0.18em] text-white bg-[#F50707] hover:bg-[#d10606] transition-colors cursor-pointer whitespace-nowrap"
                >
                  SHOW ALL UPLOADS
                </button>
              )}
              <a
                href={`${channelUrl}/videos`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 text-xs font-mono tracking-[0.18em] text-white border border-white/20 hover:border-[#F50707] transition-colors whitespace-nowrap"
              >
                VISIT YOUTUBE CHANNEL
              </a>
            </div>
          </div>
        )}

        {/* Director's Portfolio Showcase: 1 Large Featured Video + Asymmetric Grid */}
        {featuredVideo && (
          <div className="mt-12 space-y-12">
            {/* Large Featured Video Occupying Full Showcase Width */}
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="group relative w-full"
            >
              <button
                type="button"
                onClick={() => setSelectedVideo(featuredVideo)}
                aria-label={`Play featured video: ${featuredVideo.title}`}
                className="relative block w-full text-left overflow-hidden border border-white/15 group-hover:border-[#F50707] transition-colors duration-200 bg-[#0A0A0A] cursor-pointer focus-visible:outline-2 focus-visible:outline-[#F50707]"
              >
                <div className="relative w-full aspect-video max-h-[640px] overflow-hidden bg-[#0A0A0A]">
                  <VideoThumbnailImage
                    video={featuredVideo}
                    highRes
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />

                  {/* Measured Contrast Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/45 to-transparent" />

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-[#0A0A0A]/80 border border-white/30 group-hover:border-[#F50707] group-hover:bg-[#F50707] transition-all duration-200">
                      <Play className="w-6 h-6 sm:w-7 sm:h-7 text-white fill-white translate-x-0.5 transition-transform duration-200 group-hover:scale-110" />
                    </div>
                  </div>

                  {/* Featured Video Metadata Overlay */}
                  <div className="absolute bottom-0 inset-x-0 p-6 sm:p-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div className="max-w-3xl">
                      {/* Unboxed Metadata with Typographic Separators */}
                      <div className="flex flex-wrap items-center gap-2 font-mono text-xs tracking-[0.2em] text-white/80 mb-3">
                        <span className="text-[#F50707] font-semibold">FEATURED PREMIERE</span>
                        <span aria-hidden="true">·</span>
                        <span>{featuredVideo.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>{formatPublishedDate(featuredVideo.publishedAt)}</span>
                        {formatNumber(featuredVideo.viewCount) && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="tabular-nums">
                              {formatNumber(featuredVideo.viewCount)} VIEWS
                            </span>
                          </>
                        )}
                        {featuredVideo.duration && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="tabular-nums">{featuredVideo.duration}</span>
                          </>
                        )}
                      </div>

                      <h3 className="font-display text-xl sm:text-3xl md:text-4xl font-bold tracking-[0.04em] text-white leading-tight [text-wrap:balance]">
                        {featuredVideo.title}
                      </h3>
                    </div>

                    <span className="font-mono text-xs tracking-[0.2em] text-white/80 group-hover:text-[#F50707] transition-colors whitespace-nowrap shrink-0">
                      WATCH IN THEATRE →
                    </span>
                  </div>
                </div>
              </button>
            </motion.article>

            {/* Asymmetric Grid of Supporting Videos */}
            {supportingVideos.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10">
                {supportingVideos.map((video, index) => {
                  // Asymmetric editorial spans: alternating 7/5 and 5/7 columns across rows
                  const rowPattern = index % 4;
                  const colSpanClass =
                    rowPattern === 0
                      ? 'md:col-span-7'
                      : rowPattern === 1
                        ? 'md:col-span-5'
                        : rowPattern === 2
                          ? 'md:col-span-5'
                          : 'md:col-span-7';

                  return (
                    <motion.article
                      key={video.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-40px' }}
                      transition={{
                        duration: 0.5,
                        delay: (index % 2) * 0.08,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className={`${colSpanClass} group flex flex-col justify-between`}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedVideo(video)}
                        aria-label={`Play video: ${video.title}`}
                        className="w-full text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-[#F50707]"
                      >
                        <div className="relative aspect-video w-full overflow-hidden bg-[#0A0A0A] border border-white/15 group-hover:border-[#F50707] transition-colors duration-200">
                          <VideoThumbnailImage
                            video={video}
                            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/80 via-transparent to-transparent" />

                          {/* Subtle Play Icon Animation */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 flex items-center justify-center bg-[#0A0A0A]/80 border border-white/30 group-hover:border-[#F50707] group-hover:bg-[#F50707] transition-all duration-200">
                              <Play className="w-4 h-4 text-white fill-white translate-x-0.5 transition-transform duration-200 group-hover:scale-110" />
                            </div>
                          </div>

                          {video.duration && (
                            <span className="absolute bottom-3 right-3 font-mono text-[11px] tracking-[0.12em] text-white/90 bg-[#0A0A0A]/85 px-2 py-0.5 tabular-nums">
                              {video.duration}
                            </span>
                          )}
                        </div>

                        {/* Unboxed Metadata + Title Below Frame */}
                        <div className="mt-4">
                          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] tracking-[0.18em] text-white/60">
                            <span className="text-[#F50707]">{video.category}</span>
                            <span aria-hidden="true">·</span>
                            <span>{formatPublishedDate(video.publishedAt)}</span>
                            {formatNumber(video.viewCount) && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="tabular-nums">
                                  {formatNumber(video.viewCount)} VIEWS
                                </span>
                              </>
                            )}
                          </div>

                          <h3 className="mt-2 font-display text-lg sm:text-xl font-bold tracking-[0.03em] text-white group-hover:text-[#F50707] transition-colors duration-150 line-clamp-2">
                            {video.title}
                          </h3>
                        </div>
                      </button>
                    </motion.article>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Refined "VIEW ALL VIDEOS" Link */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="font-mono text-xs tracking-[0.18em] text-white/60">
            STREAMING DIRECTLY FROM OFFICIAL CHANNEL ARCHIVE
          </p>
          <a
            href={`${channelUrl}/videos`}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 font-display text-sm font-bold tracking-[0.2em] text-white hover:text-[#F50707] transition-colors whitespace-nowrap"
          >
            <span>VIEW ALL VIDEOS</span>
            <span className="w-8 h-[1px] bg-[#F50707] transition-all duration-200 group-hover:w-12" />
            <ExternalLink className="w-4 h-4 text-[#F50707]" />
          </a>
        </div>
      </div>

      {/* Embedded YouTube Cinema Modal Player */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-label={`Playing ${selectedVideo.title}`}
            onClick={() => setSelectedVideo(null)}
            className="fixed inset-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-5xl bg-[#0A0A0A] border border-[#F50707]/60 shadow-[0_0_60px_rgba(0,0,0,0.95)]"
            >
              {/* Modal Top Bar */}
              <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-white/10">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 font-mono text-[11px] tracking-[0.18em] text-white/60">
                    <span className="text-[#F50707]">{selectedVideo.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{formatPublishedDate(selectedVideo.publishedAt)}</span>
                  </div>
                  <h3 className="font-display text-sm sm:text-base font-bold tracking-[0.05em] text-white truncate mt-0.5">
                    {selectedVideo.title}
                  </h3>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <a
                    href={selectedVideo.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono tracking-[0.14em] text-white/80 hover:text-white border border-white/15 hover:border-[#F50707] transition-colors whitespace-nowrap"
                  >
                    <span>YOUTUBE</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setSelectedVideo(null)}
                    aria-label="Close video player"
                    className="inline-flex items-center justify-center w-10 h-10 text-white border border-white/15 hover:border-[#F50707] hover:bg-[#F50707] transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* 16:9 YouTube Player */}
              <div className="relative aspect-video w-full bg-[#0A0A0A]">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${selectedVideo.id}?autoplay=1&rel=0`}
                  title={selectedVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
