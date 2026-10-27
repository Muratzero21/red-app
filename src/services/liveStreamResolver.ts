import { LiveChannel } from '../constants/liveChannels';

// In-memory cache of resolved live video IDs for the current session
const resolvedLiveCache: Record<string, { videoId: string; timestamp: number }> = {};
const CACHE_TTL_MS = 1000 * 60 * 15; // 15 minutes

/**
 * Resolves the currently broadcasting real-time YouTube Live videoId for a channel
 * using YouTube's strict "Live Now" filter (sp=EgJAAQ%3D%3D) + oEmbed verification.
 */
export async function resolveActiveLiveStreamId(channel: LiveChannel): Promise<string> {
  const cached = resolvedLiveCache[channel.id];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.videoId;
  }

  try {
    // 1. Search YouTube strictly filtered to currently active LIVE broadcasts (sp=EgJAAQ%3D%3D)
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

      // Verify embeddability via oEmbed
      for (const candidateId of matches) {
        try {
          const oembedRes = await fetch(
            `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${candidateId}&format=json`
          );
          if (oembedRes.ok) {
            resolvedLiveCache[channel.id] = {
              videoId: candidateId,
              timestamp: Date.now(),
            };
            return candidateId;
          }
        } catch {
          // Try next candidate
        }
      }
    }
  } catch {
    // Fallback to pre-verified live ID
  }

  return channel.youtubeId;
}
