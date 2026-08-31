import { ref, watch } from "vue";

const cache = new Map();

function upscaleArtwork(url) {
  return url.replace("100x100bb", "600x600bb").replace("100x100", "600x600");
}

function isTrustedArtworkUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname.endsWith(".mzstatic.com");
  } catch {
    return false;
  }
}

export function useCoverArt(song) {
  const coverUrl = ref("");

  watch(
    () => [song.value?.id, song.value?.artist, song.value?.title],
    async ([id, artist, title]) => {
      if (!id) {
        coverUrl.value = "";
        return;
      }

      if (cache.has(id)) {
        coverUrl.value = cache.get(id);
        return;
      }

      const term = `${artist || ""} ${title || ""}`.trim();
      if (!term) {
        cache.set(id, "");
        coverUrl.value = "";
        return;
      }

      try {
        const params = new URLSearchParams({
          term,
          entity: "song",
          limit: "1",
        });
        const response = await fetch(`/api/cover?${params.toString()}`);
        if (!response.ok) {
          throw new Error("cover lookup failed");
        }
        const data = await response.json();
        const artwork = data.results?.[0]?.artworkUrl100;
        const url = artwork ? upscaleArtwork(artwork) : "";
        if (url && isTrustedArtworkUrl(url)) {
          cache.set(id, url);
          coverUrl.value = url;
          return;
        }
      } catch {
        // Pas de fallback logo : le carré reste uni.
      }

      cache.set(id, "");
      coverUrl.value = "";
    },
    { immediate: true },
  );

  return { coverUrl };
}
