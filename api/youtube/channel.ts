const DEFAULT_CHANNEL_ID = 'UC-ZyJFA9ZcGtzRg7J0QntDQ';

type VideoCategory = 'ANIME EDITS' | 'TECH GUIDES' | 'CREATIVE EDITS';

function classifyVideoCategory(title: string, description: string): VideoCategory {
  const combined = `${title} ${description}`.toLowerCase();
  const techKeywords = [
    'tech', 'tutorial', 'guide', 'how to', 'setup', 'code', 'coding', 'programming',
    'windows', 'linux', 'pc', 'software', 'hardware', 'ai', 'app', 'web', 'build',
    'review', 'fix', 'tips', 'trick', 'after effects', 'premiere', 'davinci',
    'capcut', 'alight motion', 'workflow', 'settings',
  ];
  const animeKeywords = [
    'luffy', 'one piece', 'zoro', 'sanji', 'gear 5', 'gear', 'anime', 'amv', 'manga',
    'naruto', 'sasuke', 'bleach', 'ichigo', 'gojo', 'sukuna', 'jjk', 'jujutsu',
    'demon slayer', 'tanjiro', 'aot', 'eren', 'dragon ball', 'goku', 'shanks',
    'kaido', 'pirate', 'haki', 'awakening',
  ];

  if (techKeywords.some((kw) => combined.includes(kw))) return 'TECH GUIDES';
  if (animeKeywords.some((kw) => combined.includes(kw))) return 'ANIME EDITS';
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

function decodeXmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

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

export default async function handler(req: any, res: any) {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    const channelId = (process.env.YOUTUBE_CHANNEL_ID || DEFAULT_CHANNEL_ID).trim();

    const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}&_t=${Date.now()}`;
    const feedRes = await fetch(feedUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'application/atom+xml,application/xml,text/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!feedRes.ok) {
      throw new Error(`Unable to reach YouTube public feed (HTTP ${feedRes.status}).`);
    }

    const xml = await feedRes.text();
    const authorNameMatch = xml.match(/<author>\s*<name>([\s\S]*?)<\/name>/);
    const channelTitle = authorNameMatch
      ? decodeXmlEntities(authorNameMatch[1].trim())
      : 'Luffy Editz';

    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    const videos: any[] = [];
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

      videos.push({
        id: videoId,
        title,
        description,
        publishedAt,
        thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        highResThumbnailUrl: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
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
    let customUrl = '@luffyeditz26';

    try {
      const pageRes = await fetch(`https://www.youtube.com/channel/${channelId}/about`, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });

      if (pageRes.ok) {
        const html = await pageRes.text();
        const subMatch = html.match(/([\d.,]+\s*[KMB]?\s*subscribers)/i);
        if (subMatch) subscriberCount = parseHumanCount(subMatch[1]);

        const videoCountMatch = html.match(/([\d,]+)\s*videos/i);
        if (videoCountMatch) totalVideoCount = parseHumanCount(videoCountMatch[1]);

        const tokenMatches = [...html.matchAll(/"continuationCommand":\{"token":"([^"]+)"/g)];
        for (const tMatch of tokenMatches) {
          const token = tMatch[1];
          if (!token) continue;
          const browseRes = await fetch(
            'https://www.youtube.com/youtubei/v1/browse?prettyPrint=false',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept-Language': 'en-US,en;q=0.9',
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
              if (viewCountTextMatch?.[1]) totalViewCount = parseHumanCount(viewCountTextMatch[1]);
              if (subCountTextMatch?.[1]) subscriberCount = parseHumanCount(subCountTextMatch[1]);
              if (videoCountTextMatch?.[1]) totalVideoCount = parseHumanCount(videoCountTextMatch[1]);
              break;
            }
          }
        }
      }
    } catch {
      // Fallback to RSS feed totals
    }

    const feedViewsSum = videos.reduce((acc, v) => acc + (v.viewCount || 0), 0);
    const resolvedViewCount =
      totalViewCount !== null && feedViewsSum > 0
        ? Math.max(totalViewCount, feedViewsSum)
        : totalViewCount ?? (feedViewsSum > 0 ? feedViewsSum : null);
    const resolvedVideoCount = totalVideoCount ?? (videos.length > 0 ? videos.length : null);
    const averageViewsPerUpload =
      resolvedViewCount !== null && resolvedVideoCount !== null && resolvedVideoCount > 0
        ? Math.round(resolvedViewCount / resolvedVideoCount)
        : null;

    res.status(200).json({
      channelId,
      channelTitle,
      channelUrl: `https://www.youtube.com/channel/${channelId}`,
      subscribeUrl: `https://www.youtube.com/channel/${channelId}?sub_confirmation=1`,
      customUrl,
      description: null,
      avatarUrl: null,
      stats: {
        subscriberCount,
        viewCount: resolvedViewCount,
        videoCount: resolvedVideoCount,
        averageViewsPerUpload,
      },
      videos,
      source: 'youtube_public_feed',
      apiKeyConfigured: Boolean(process.env.YOUTUBE_API_KEY),
      lastSyncedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(502).json({
      error: 'Unable to synchronize live YouTube channel data.',
      details: error?.message || 'Unknown error',
    });
  }
}
