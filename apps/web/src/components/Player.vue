<script setup>
import { computed, watch } from "vue";
import Wordmark from "./Wordmark.vue";
import Live from "./Live.vue";
import Cover from "./Cover.vue";
import TrackInfo from "./TrackInfo.vue";
import Controls from "./Controls.vue";
import { useRadio } from "../composables/useRadio.js";
import { useNowPlaying } from "../composables/useNowPlaying.js";
import { useCoverArt } from "../composables/useCoverArt.js";

const { playing, muted, togglePlay, toggleMute, setMedia } = useRadio();
const { song } = useNowPlaying();
const { coverUrl } = useCoverArt(song);

const title = computed(() => song.value.title || "En direct");
const artist = computed(() => song.value.artist || "RAMDAM");
const coverAlt = computed(() =>
  song.value.title ? `Pochette de ${song.value.title}` : "",
);

watch(
  [title, artist, coverUrl],
  ([nextTitle, nextArtist, nextCover]) => {
    setMedia({
      title: nextTitle,
      artist: nextArtist,
      artwork: nextCover,
    });
  },
  { immediate: true },
);
</script>

<template>
  <main class="player">
    <header class="player__brand">
      <Wordmark />
      <Live />
    </header>
    <div class="player__stage">
      <Cover :src="coverUrl" :alt="coverAlt">
        <TrackInfo :title="title" :artist="artist" />
      </Cover>
      <Controls
        :playing="playing"
        :muted="muted"
        @toggle-play="togglePlay"
        @toggle-mute="toggleMute"
      />
    </div>
  </main>
</template>
