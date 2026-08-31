<script setup>
defineProps({
  playing: { type: Boolean, default: false },
  muted: { type: Boolean, default: false },
});

defineEmits(["toggle-play", "toggle-mute"]);
</script>

<template>
  <div class="controls">
    <button
      class="control control--mute"
      type="button"
      :aria-pressed="muted"
      :aria-label="muted ? 'Rétablir le son' : 'Couper le son'"
      data-control="mute"
      @click="$emit('toggle-mute')"
    >
      <img
        :src="muted ? '/icons/speaker-muted.svg' : '/icons/speaker.svg'"
        alt=""
        width="30"
        height="29"
      />
    </button>
    <button
      class="control control--play"
      type="button"
      data-control="play"
      :aria-label="playing ? 'Pause' : 'Lecture'"
      @click="$emit('toggle-play')"
    >
      <img
        :src="playing ? '/icons/pause.svg' : '/icons/play.svg'"
        alt=""
        width="18"
        height="18"
      />
    </button>
  </div>
</template>
