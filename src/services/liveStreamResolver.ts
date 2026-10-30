import { LiveChannel } from '../constants/liveChannels';

// In-memory cache of resolved live video IDs for the current session
const resolvedLiveCache: Record<string, { videoId: string; timestamp: number }> = {};
const CACHE_TTL_MS = 1000 * 60 * 15; // 15 minutes

async function isEmbeddable(videoId: string): Promise<boolean> {
  try {
    const oembedRes = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    );
    return oembedRes.ok;
  } catch {
    return false;
  }
}

/**
 * Resolves the currently broadcasting real-time YouTube Live videoId for a channel.
 * First checks the official channel `/live` URL if provided, then falls back to
 * YouTube's strict "Live Now" filter (sp=EgJAAQ%3D%3D) + oEmbed verification.
 */
export async function resolveActiveLiveStreamId(channel: LiveChannel): Promise<string> {
  const cached = resolvedLiveCache[channel.id];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.videoId;
  }

  // 1. If the channel has an official /@handle/live URL, check its canonical live watch link first
  if (channel.liveChannelUrl) {
    try {
      const livePageRes = await fetch(channel.liveChannelUrl, {
        headers: { 'Accept-Language': 'en-US,en;q=0.9' },
      });
      if (livePageRes.ok) {
        const liveHtml = await livePageRes.text();
        const canonMatch = liveHtml.match(
          /rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})"/
        );
        if (canonMatch?.[1] && (await isEmbeddable(canonMatch[1]))) {
          resolvedLiveCache[channel.id] = {
            videoId: canonMatch[1],
            timestamp: Date.now(),
          };
          return canonMatch[1];
        }
      }
    } catch {
      // Continue to search fallback
    }
  }

  try {
    // 2. Search YouTube strictly filtered to currently active LIVE broadcasts (sp=EgJAAQ%3D%3D)
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
      channel.liveSearchQuery
    )}&sp=EgJAAQ%3D%3D`;

    const response = await fetch(searchUrl, {
      headers: {
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (response.ok) {
      const html = await response.text();
      const regex = /"videoId":"([a-zA-Z0-9_-]{11})"/g;
      const matches: string[] = [];
      let match: RegExpExecArray | null;
      while ((match = regex.exec(html)) !== null) {
        if (!matches.includes(match[1])) {
          matches.push(match[1]);
        }
        if (matches.length >= 6) break;
      }

      for (const candidateId of matches) {
        if (await isEmbeddable(candidateId)) {
          resolvedLiveCache[channel.id] = {
            videoId: candidateId,
            timestamp: Date.now(),
          };
          return candidateId;
        }
      }
    }
  } catch {
    // Fallback to pre-verified live ID
  }

  return channel.youtubeId;
}
