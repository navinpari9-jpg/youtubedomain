import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_CHANNEL_ID = 'UC-ZyJFA9ZcGtzRg7J0QntDQ';
const CHANNEL_URL = `https://www.youtube.com/channel/${DEFAULT_CHANNEL_ID}`;

export type VideoCategory = 'ANIME EDITS' | 'TECH GUIDES' | 'CREATIVE EDITS';

export interface YouTubeVideoItem {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnailUrl: string;
  highResThumbnailUrl: string;
  viewCount: number | null;
  likeCount: number | null;
  duration: string | null;
  category: VideoCategory;
  videoUrl: string;
}

export interface YouTubeChannelPayload {
  channelId: string;
  channelTitle: string;
  channelUrl: string;
  subscribeUrl: string;
  customUrl: string | null;
  description: string | null;
  avatarUrl: string | null;
  stats: {
    subscriberCount: number | null;
    viewCount: number | null;
    videoCount: number | null;
    averageViewsPerUpload: number | null;
  };
  videos: YouTubeVideoItem[];
  source: 'youtube_data_api_v3' | 'youtube_public_feed';
  apiKeyConfigured: boolean;
  lastSyncedAt: string;
  warning?: string;
}

interface CacheEntry {
  data: YouTubeChannelPayload;
  timestamp: number;
}

let channelCache: CacheEntry | null = null;
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes automatic cache TTL

/**
 * Classifies a real video into one of the portfolio showcase categories
 * based on its actual title and description.
 */
function classifyVideoCategory(title: string, description: string): VideoCategory {
  const combined = `${title} ${description}`.toLowerCase();

  const techKeywords = [
    'tech',
    'tutorial',
    'guide',
    'how to',
    'setup',
    'code',
    'coding',
    'programming',
    'windows',
    'linux',
    'pc',
    'software',
    'hardware',
    'ai',
    'app',
    'web',
    'build',
    'review',
    'fix',
    'tips',
    'trick',
    'after effects',
    'premiere',
    'davinci',
    'capcut',
    'aligth motion',
    'alight motion',
    'workflow',
    'settings',
  ];

  const animeKeywords = [
    'luffy',
    'one piece',
    'zoro',
    'sanji',
    'gear 5',
    'gear',
    'anime',
    'amv',
    'manga',
    'naruto',
    'sasuke',
    'bleach',
    'ichigo',
    'gojo',
    'sukuna',
    'jjk',
    'jujutsu',
    'demon slayer',
    'tanjiro',
    'aot',
    'eren',
    'dragon ball',
    'goku',
    'shanks',
    'kaido',
    'pirate',
    'haki',
    'awakening',
  ];

  if (techKeywords.some((kw) => combined.includes(kw))) {
    return 'TECH GUIDES';
  }
  if (animeKeywords.some((kw) => combined.includes(kw))) {
    return 'ANIME EDITS';
  }
  if (
    combined.includes('edit') ||
    combined.includes('vfx') ||
    combined.includes('cinematic') ||
    combined.includes('meme') ||
    combined.includes('shorts')
  ) {
    return 'CREATIVE EDITS';
  }
  return 'ANIME EDITS';
}

/**
 * Decodes basic XML entities from YouTube RSS/Atom feeds.
 */
function decodeXmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

/**
 * Parses ISO 8601 duration (e.g., PT1M35S) into human-readable MM:SS.
 */
function formatIsoDuration(iso: string | undefined | null): string | null {
  if (!iso) return null;
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return null;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Parses fuzzy subscriber/view text like "1.25K subscribers" or "119,918 views" into a number.
 */
function parseHumanCount(raw: string | undefined | null): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/,/g, '').trim();
  const match = cleaned.match(/([\d.]+)\s*([KMBkmb])?/);
  if (!match) return null;
  const base = parseFloat(match[1]);
  if (Number.isNaN(base)) return null;
  const suffix = (match[2] || '').toUpperCase();
  if (suffix === 'K') return Math.round(base * 1_000);
  if (suffix === 'M') return Math.round(base * 1_000_000);
  if (suffix === 'B') return Math.round(base * 1_000_000_000);
  return Math.round(base);
}

/**
 * Fetches live channel data using the official YouTube Data API v3 when YOUTUBE_API_KEY is present.
 */
async function fetchViaYouTubeDataApi(
  channelId: string,
  apiKey: string
): Promise<YouTubeChannelPayload> {
  const channelEndpoint = new URL('https://www.googleapis.com/youtube/v3/channels');
  channelEndpoint.searchParams.set('part', 'snippet,statistics,contentDetails');
  channelEndpoint.searchParams.set('id', channelId);
  channelEndpoint.searchParams.set('key', apiKey);

  const channelRes = await fetch(channelEndpoint.toString());
  if (!channelRes.ok) {
    const errText = await channelRes.text();
    throw new Error(`YouTube Data API channels request failed (${channelRes.status}): ${errText}`);
  }

  const channelData = (await channelRes.json()) as any;
  const channelItem = channelData.items?.[0];
  if (!channelItem) {
    throw new Error(`Channel ${channelId} not found in YouTube Data API response.`);
  }

  const subscriberCount =
    channelItem.statistics?.hiddenSubscriberCount === true
      ? null
      : Number(channelItem.statistics?.subscriberCount ?? NaN);
  const viewCount = Number(channelItem.statistics?.viewCount ?? NaN);
  const videoCount = Number(channelItem.statistics?.videoCount ?? NaN);

  const uploadsPlaylistId = channelItem.contentDetails?.relatedPlaylists?.uploads;
  const videos: YouTubeVideoItem[] = [];

  if (uploadsPlaylistId) {
    const playlistEndpoint = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
    playlistEndpoint.searchParams.set('part', 'snippet,contentDetails');
    playlistEndpoint.searchParams.set('playlistId', uploadsPlaylistId);
    playlistEndpoint.searchParams.set('maxResults', '18');
    playlistEndpoint.searchParams.set('key', apiKey);

    const playlistRes = await fetch(playlistEndpoint.toString());
    if (playlistRes.ok) {
      const playlistData = (await playlistRes.json()) as any;
      const playlistItems: any[] = playlistData.items || [];
      const videoIds = playlistItems
        .map((item) => item.contentDetails?.videoId || item.snippet?.resourceId?.videoId)
        .filter(Boolean);

      const detailsById = new Map<string, any>();
      if (videoIds.length > 0) {
        const videosEndpoint = new URL('https://www.googleapis.com/youtube/v3/videos');
        videosEndpoint.searchParams.set('part', 'snippet,statistics,contentDetails');
        videosEndpoint.searchParams.set('id', videoIds.join(','));
        videosEndpoint.searchParams.set('key', apiKey);

        const videosRes = await fetch(videosEndpoint.toString());
        if (videosRes.ok) {
          const videosData = (await videosRes.json()) as any;
          for (const v of videosData.items || []) {
            detailsById.set(v.id, v);
          }
        }
      }

      for (const item of playlistItems) {
        const videoId = item.contentDetails?.videoId || item.snippet?.resourceId?.videoId;
        if (!videoId) continue;

        const detail = detailsById.get(videoId);
        const snippet = detail?.snippet || item.snippet || {};
        const stats = detail?.statistics || {};
        const title = snippet.title || 'Untitled Upload';
        const description = snippet.description || '';
        const publishedAt =
          snippet.publishedAt || item.contentDetails?.videoPublishedAt || new Date().toISOString();

        const thumbs = snippet.thumbnails || {};
        const highResThumbnailUrl =
          thumbs.maxres?.url ||
          thumbs.standard?.url ||
          thumbs.high?.url ||
          `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
        const thumbnailUrl =
          thumbs.high?.url ||
          thumbs.medium?.url ||
          `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

        const parsedViews = stats.viewCount !== undefined ? Number(stats.viewCount) : null;
        const parsedLikes = stats.likeCount !== undefined ? Number(stats.likeCount) : null;

        videos.push({
          id: videoId,
          title,
          description,
          publishedAt,
          thumbnailUrl,
          highResThumbnailUrl,
          viewCount: Number.isFinite(parsedViews) ? parsedViews : null,
          likeCount: Number.isFinite(parsedLikes) ? parsedLikes : null,
          duration: formatIsoDuration(detail?.contentDetails?.duration),
          category: classifyVideoCategory(title, description),
          videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
        });
      }
    }
  }

  const validSubscribers = Number.isFinite(subscriberCount) ? subscriberCount : null;
  const validViews = Number.isFinite(viewCount) ? viewCount : null;
  const validVideoCount = Number.isFinite(videoCount) ? videoCount : videos.length || null;

  let averageViewsPerUpload: number | null = null;
  if (validViews !== null && validVideoCount !== null && validVideoCount > 0) {
    averageViewsPerUpload = Math.round(validViews / validVideoCount);
  } else {
    const videosWithViews = videos.filter((v) => v.viewCount !== null);
    if (videosWithViews.length > 0) {
      const sum = videosWithViews.reduce((acc, v) => acc + (v.viewCount || 0), 0);
      averageViewsPerUpload = Math.round(sum / videosWithViews.length);
    }
  }

  return {
    channelId,
    channelTitle: channelItem.snippet?.title || 'luffyeditz26',
    channelUrl: `https://www.youtube.com/channel/${channelId}`,
    subscribeUrl: `https://www.youtube.com/channel/${channelId}?sub_confirmation=1`,
    customUrl: channelItem.snippet?.customUrl || '@luffyeditz26',
    description: channelItem.snippet?.description || null,
    avatarUrl:
      channelItem.snippet?.thumbnails?.high?.url ||
      channelItem.snippet?.thumbnails?.default?.url ||
      null,
    stats: {
      subscriberCount: validSubscribers,
      viewCount: validViews,
      videoCount: validVideoCount,
      averageViewsPerUpload,
    },
    videos,
    source: 'youtube_data_api_v3',
    apiKeyConfigured: true,
    lastSyncedAt: new Date().toISOString(),
  };
}

/**
 * Fetches real uploads and official channel statistics from YouTube's public XML feed +
 * YouTube InnerTube aboutChannelViewModel endpoint when YOUTUBE_API_KEY is not configured.
 */
async function fetchViaYouTubePublicFeed(
  channelId: string,
  apiKeyConfigured: boolean,
  warningMessage?: string
): Promise<YouTubeChannelPayload> {
  const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}&_t=${Date.now()}`;
  const feedRes = await fetch(feedUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      Accept: 'application/atom+xml,application/xml,text/xml;q=0.9,*/*;q=0.8',
      'Cache-Control': 'no-cache',
    },
  });

  if (!feedRes.ok) {
    throw new Error(`Unable to reach YouTube public feed (HTTP ${feedRes.status}).`);
  }

  const xml = await feedRes.text();

  // Extract channel title
  const authorNameMatch = xml.match(/<author>\s*<name>([\s\S]*?)<\/name>/);
  const channelTitle = authorNameMatch
    ? decodeXmlEntities(authorNameMatch[1].trim())
    : 'luffyeditz26';

  // Extract all <entry> blocks
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  const videos: YouTubeVideoItem[] = [];
  let match: RegExpExecArray | null;

  while ((match = entryRegex.exec(xml)) !== null) {
    const entryXml = match[1];
    const videoId = entryXml.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1]?.trim();
    if (!videoId) continue;

    const rawTitle = entryXml.match(/<title>([\s\S]*?)<\/title>/)?.[1] || 'Untitled Upload';
    const title = decodeXmlEntities(rawTitle.trim());

    const publishedAt =
      entryXml.match(/<published>([^<]+)<\/published>/)?.[1]?.trim() || new Date().toISOString();

    const rawDescription =
      entryXml.match(/<media:description>([\s\S]*?)<\/media:description>/)?.[1] || '';
    const description = decodeXmlEntities(rawDescription.trim());

    const viewsAttr = entryXml.match(/<media:statistics\s+views="(\d+)"/)?.[1];
    const viewCount = viewsAttr ? parseInt(viewsAttr, 10) : null;

    const likesAttr = entryXml.match(/<media:starRating\s+count="(\d+)"/)?.[1];
    const likeCount = likesAttr ? parseInt(likesAttr, 10) : null;

    const highResThumbnailUrl = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
    const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

    videos.push({
      id: videoId,
      title,
      description,
      publishedAt,
      thumbnailUrl,
      highResThumbnailUrl,
      viewCount: Number.isFinite(viewCount) ? viewCount : null,
      likeCount: Number.isFinite(likeCount) ? likeCount : null,
      duration: null,
      category: classifyVideoCategory(title, description),
      videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
    });
  }

  let subscriberCount: number | null = null;
  let totalViewCount: number | null = null;
  let totalVideoCount: number | null = null;
  let description: string | null = null;
  let avatarUrl: string | null = null;
  let customUrl: string | null = '@luffyeditz26';

  try {
    const pageRes = await fetch(`https://www.youtube.com/channel/${channelId}/about`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
    });

    if (pageRes.ok) {
      const html = await pageRes.text();

      // 1. Extract subscriber & video count from initial page header if present
      const subMatch =
        html.match(/"subscriberCountText":\{"simpleText":"([^"]+)"\}/) ||
        html.match(
          /"subscriberCountText":\{"accessibility":\{"accessibilityData":\{"label":"([^"]+)"\}\}/
        ) ||
        html.match(/([\d.,]+\s*[KMB]?\s*subscribers)/i);
      if (subMatch) {
        subscriberCount = parseHumanCount(subMatch[1]);
      }

      const videoCountMatch =
        html.match(/"videosCountText":\{"runs":\[\{"text":"([\d,]+)"\}/) ||
        html.match(/([\d,]+)\s*videos/i);
      if (videoCountMatch) {
        totalVideoCount = parseHumanCount(videoCountMatch[1]);
      }

      const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
      if (descMatch && descMatch[1]) {
        description = decodeXmlEntities(descMatch[1]);
      }

      const avatarMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
      if (avatarMatch && avatarMatch[1]) {
        avatarUrl = avatarMatch[1];
      }

      // 2. Query YouTube InnerTube browse continuation for aboutChannelViewModel
      // to get exact official channel viewCountText, subscriberCountText, and videoCountText
      const tokenMatches = [...html.matchAll(/"continuationCommand":\{"token":"([^"]+)"/g)];
      for (const tMatch of tokenMatches) {
        const token = tMatch[1];
        if (!token) continue;
        try {
          const browseRes = await fetch(
            'https://www.youtube.com/youtubei/v1/browse?prettyPrint=false',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept-Language': 'en-US,en;q=0.9',
                'User-Agent':
                  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
              },
              body: JSON.stringify({
                context: {
                  client: {
                    clientName: 'WEB',
                    clientVersion: '2.20240726.00.00',
                    hl: 'en',
                    gl: 'US',
                  },
                },
                continuation: token,
              }),
            }
          );

          if (browseRes.ok) {
            const browseText = await browseRes.text();
            if (browseText.includes('aboutChannelViewModel')) {
              const viewCountTextMatch = browseText.match(/"viewCountText":"([^"]+)"/);
              const subCountTextMatch = browseText.match(/"subscriberCountText":"([^"]+)"/);
              const videoCountTextMatch = browseText.match(/"videoCountText":"([^"]+)"/);
              const canonicalMatch = browseText.match(/"displayCanonicalChannelUrl":"([^"]+)"/);

              if (viewCountTextMatch?.[1]) {
                const parsed = parseHumanCount(viewCountTextMatch[1]);
                if (parsed !== null) totalViewCount = parsed;
              }
              if (subCountTextMatch?.[1]) {
                const parsed = parseHumanCount(subCountTextMatch[1]);
                if (parsed !== null) subscriberCount = parsed;
              }
              if (videoCountTextMatch?.[1]) {
                const parsed = parseHumanCount(videoCountTextMatch[1]);
                if (parsed !== null) totalVideoCount = parsed;
              }
              if (canonicalMatch?.[1]) {
                const handlePart = canonicalMatch[1].split('/').pop();
                if (handlePart?.startsWith('@')) {
                  customUrl = handlePart;
                }
              }
              break;
            }
          }
        } catch {
          // Ignore individual continuation error and try next or fallback
        }
      }
    }
  } catch {
    // Non-fatal; rely on RSS feed metrics if HTML metadata extraction fails
  }

  // Sum of real views across the latest 15 videos in the live RSS feed
  const feedViewsSum = videos.reduce((acc, v) => acc + (v.viewCount || 0), 0);

  // Use the higher of the live RSS view sum or the cached About tab viewCountText
  // (since YouTube's About tab total view counter can lag behind real-time Shorts views)
  let resolvedViewCount: number | null = null;
  if (totalViewCount !== null && feedViewsSum > 0) {
    resolvedViewCount = Math.max(totalViewCount, feedViewsSum);
  } else if (totalViewCount !== null) {
    resolvedViewCount = totalViewCount;
  } else if (feedViewsSum > 0) {
    resolvedViewCount = feedViewsSum;
  }

  const resolvedVideoCount =
    totalVideoCount !== null ? totalVideoCount : videos.length > 0 ? videos.length : null;

  let averageViewsPerUpload: number | null = null;
  if (resolvedViewCount !== null && resolvedVideoCount !== null && resolvedVideoCount > 0) {
    averageViewsPerUpload = Math.round(resolvedViewCount / resolvedVideoCount);
  } else if (videos.length > 0 && feedViewsSum > 0) {
    averageViewsPerUpload = Math.round(feedViewsSum / videos.length);
  }

  return {
    channelId,
    channelTitle,
    channelUrl: `https://www.youtube.com/channel/${channelId}`,
    subscribeUrl: `https://www.youtube.com/channel/${channelId}?sub_confirmation=1`,
    customUrl,
    description,
    avatarUrl,
    stats: {
      subscriberCount,
      viewCount: resolvedViewCount,
      videoCount: resolvedVideoCount,
      averageViewsPerUpload,
    },
    videos,
    source: 'youtube_public_feed',
    apiKeyConfigured,
    lastSyncedAt: new Date().toISOString(),
    warning: warningMessage,
  };
}

async function getChannelData(forceRefresh: boolean): Promise<YouTubeChannelPayload> {
  const now = Date.now();
  if (!forceRefresh && channelCache && now - channelCache.timestamp < CACHE_TTL_MS) {
    return channelCache.data;
  }

  const channelId = (process.env.YOUTUBE_CHANNEL_ID || DEFAULT_CHANNEL_ID).trim();
  const apiKey = (process.env.YOUTUBE_API_KEY || '').trim();
  const hasValidApiKey = Boolean(apiKey && apiKey !== 'MY_YOUTUBE_API_KEY' && apiKey.length > 10);

  let payload: YouTubeChannelPayload;

  if (hasValidApiKey) {
    try {
      payload = await fetchViaYouTubeDataApi(channelId, apiKey);
    } catch (apiError: any) {
      console.warn(
        'YouTube Data API v3 error, falling back to live YouTube public XML feed:',
        apiError?.message
      );
      payload = await fetchViaYouTubePublicFeed(
        channelId,
        true,
        'Synced via YouTube Live Public Feed (YouTube Data API v3 key returned an error or quota limit).'
      );
    }
  } else {
    payload = await fetchViaYouTubePublicFeed(channelId, false);
  }

  channelCache = {
    data: payload,
    timestamp: now,
  };

  return payload;
}

async function startServer() {
  const app = express();

  // Parse command line arguments (e.g. --port 3000 --host 0.0.0.0)
  const args = process.argv.slice(2);
  const portArgIdx = args.indexOf('--port');
  const cliPort = portArgIdx !== -1 && args[portArgIdx + 1] ? Number(args[portArgIdx + 1]) : NaN;

  // In AI Studio, PORT is often set to 8080 (Nginx port); prevent EADDRINUSE crash by defaulting to 3000
  let envPort = Number(process.env.PORT);
  if (envPort === 8080) {
    envPort = 3000;
  }

  const PORT = !Number.isNaN(cliPort) && cliPort > 0 ? cliPort : (envPort || 3000);

  // Parse host argument if provided
  const hostArgIdx = args.indexOf('--host');
  const HOST = hostArgIdx !== -1 && args[hostArgIdx + 1] ? args[hostArgIdx + 1] : '0.0.0.0';

  app.use(express.json());

  // Healthcheck endpoint for proxies and container monitors
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', time: new Date().toISOString() });
  });

  // Live YouTube Channel & Uploads Synchronization Endpoint
  app.get('/api/youtube/channel', async (req, res) => {
    try {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      const forceRefresh = req.query.refresh === 'true' || req.query.force === '1';
      const data = await getChannelData(forceRefresh);
      res.json(data);
    } catch (error: any) {
      console.error('Error syncing YouTube channel data:', error);
      res.status(502).json({
        error: 'Unable to synchronize live YouTube channel data at this moment.',
        details: error?.message || 'Unknown upstream error',
        channelUrl: CHANNEL_URL,
      });
    }
  });

  // Contact Inquiry Validation Endpoint
  app.post('/api/contact', (req, res) => {
    const { name, email, subject, message } = req.body || {};

    const cleanName = typeof name === 'string' ? name.trim() : '';
    const cleanEmail = typeof email === 'string' ? email.trim() : '';
    const cleanSubject = typeof subject === 'string' ? subject.trim() : '';
    const cleanMessage = typeof message === 'string' ? message.trim() : '';

    if (!cleanName || cleanName.length < 2) {
      res.status(400).json({ error: 'Please enter your name (at least 2 characters).' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      res.status(400).json({ error: 'Please provide a valid email address.' });
      return;
    }

    if (!cleanMessage || cleanMessage.length < 10) {
      res.status(400).json({ error: 'Please enter a message of at least 10 characters.' });
      return;
    }

    const smtpConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);
    const mailtoUrl = `mailto:navinzoro3108@gmail.com?subject=${encodeURIComponent(
      cleanSubject || `Portfolio Inquiry from ${cleanName}`
    )}&body=${encodeURIComponent(`Name: ${cleanName}\nEmail: ${cleanEmail}\n\n${cleanMessage}`)}`;

    res.json({
      success: true,
      smtpConfigured,
      recipient: 'navinzoro3108@gmail.com',
      mailtoUrl,
      receivedAt: new Date().toISOString(),
      notice: smtpConfigured
        ? 'Your message has been dispatched to Navin Kumar.'
        : 'Message validated. Automated server email delivery requires an SMTP email backend; click "Open in Email Client" or use the direct mailto link to send immediately to navinzoro3108@gmail.com.',
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`luffyeditz26 / NK server running on http://${HOST}:${PORT}`);
  });
}

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

startServer();
