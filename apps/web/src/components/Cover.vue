<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  src: { type: String, default: "" },
  alt: { type: String, default: "" },
});

const currentSrc = ref(props.src || "");

watch(
  () => props.src,
  (value) => {
    currentSrc.value = value || "";
  },
);

function onError() {
  currentSrc.value = "";
}
</script>

<template>
  <div class="cover">
    <img
      v-if="currentSrc"
      class="cover__image"
      :src="currentSrc"
      :alt="alt"
      @error="onError"
    />
    <slot />
  </div>
</template>
