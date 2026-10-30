export type VideoCategory = 'ALL' | 'ANIME EDITS' | 'TECH GUIDES' | 'CREATIVE EDITS';

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
  category: Exclude<VideoCategory, 'ALL'>;
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
