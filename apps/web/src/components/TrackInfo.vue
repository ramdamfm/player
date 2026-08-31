<script setup>
defineProps({
  title: { type: String, default: "" },
  artist: { type: String, default: "" },
});
</script>

<template>
  <div class="track-info">
    <p class="track-info__title">{{ title || "En direct" }}</p>
    <p class="track-info__artist">{{ artist || "RAMDAM" }}</p>
  </div>
</template>
