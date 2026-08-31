import { onMounted, onUnmounted, ref } from "vue";

const STREAM_URL =
  import.meta.env.VITE_STREAM_URL ||
  "https://azuracast.ramdam.fm/listen/ramdam/feed.mp3";

export function useRadio() {
  const audio = new Audio();
  audio.preload = "none";
  audio.autoplay = true;
  audio.crossOrigin = "anonymous";

  const playing = ref(false);
  const muted = ref(false);
  const blocked = ref(false);

  function liveSrc() {
    const glue = STREAM_URL.includes("?") ? "&" : "?";
    return `${STREAM_URL}${glue}t=${Date.now()}`;
  }

  function loadLive() {
    audio.src = liveSrc();
    audio.load();
  }

  function disconnect() {
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
  }

  async function play() {
    loadLive();
    try {
      await audio.play();
      playing.value = true;
      blocked.value = false;
      updateMediaSession();
    } catch {
      playing.value = false;
      blocked.value = true;
      updateMediaSession();
    }
  }

  function pause() {
    disconnect();
    playing.value = false;
    updateMediaSession();
  }

  function togglePlay() {
    if (playing.value) {
      pause();
    } else {
      play();
    }
  }

  function toggleMute() {
    muted.value = !muted.value;
    audio.muted = muted.value;
  }

  function onPlaying() {
    playing.value = true;
    blocked.value = false;
    updateMediaSession();
  }

  function onPause() {
    if (!audio.src) {
      playing.value = false;
      updateMediaSession();
    }
  }

  function unlockFromGesture(event) {
    if (!blocked.value) {
      return;
    }
    if (event.target?.closest?.("[data-control='play']")) {
      return;
    }
    play();
  }

  let media = { title: "RAMDAM", artist: "En direct", artwork: "" };

  function updateMediaSession() {
    if (!("mediaSession" in navigator)) {
      return;
    }
    const metadata = {
      title: media.title || "RAMDAM",
      artist: media.artist || "En direct",
      album: "RAMDAM",
    };
    if (media.artwork) {
      metadata.artwork = [{ src: media.artwork, sizes: "600x600" }];
    }
    navigator.mediaSession.metadata = new MediaMetadata(metadata);
    navigator.mediaSession.playbackState = playing.value ? "playing" : "paused";
  }

  function setMedia(next) {
    media = { ...media, ...next };
    updateMediaSession();
  }

  onMounted(() => {
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("pause", onPause);

    if ("mediaSession" in navigator) {
      navigator.mediaSession.setActionHandler("play", () => {
        play();
      });
      navigator.mediaSession.setActionHandler("pause", () => {
        pause();
      });
    }

    window.addEventListener("pointerdown", unlockFromGesture);
    window.addEventListener("keydown", unlockFromGesture);
    window.addEventListener("touchstart", unlockFromGesture, { passive: true });

    play();
  });

  onUnmounted(() => {
    audio.removeEventListener("playing", onPlaying);
    audio.removeEventListener("pause", onPause);
    window.removeEventListener("pointerdown", unlockFromGesture);
    window.removeEventListener("keydown", unlockFromGesture);
    window.removeEventListener("touchstart", unlockFromGesture);
    disconnect();
  });

  return {
    playing,
    muted,
    blocked,
    play,
    pause,
    togglePlay,
    toggleMute,
    setMedia,
  };
}
