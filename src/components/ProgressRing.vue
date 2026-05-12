<template>
  <div class="ring" :style="{ width: size + 'px', height: size + 'px' }">
    <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`">
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        fill="none"
        :stroke-width="stroke"
        :stroke="trackColor"
      />
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        fill="none"
        :stroke="resolvedColor"
        :stroke-width="stroke"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        stroke-linecap="round"
        :transform="`rotate(-90 ${size / 2} ${size / 2})`"
      />
    </svg>
    <div class="ring-center">
      <div v-if="icon" class="ring-icon" aria-hidden="true">{{ icon }}</div>
      <div v-if="label !== null && label !== undefined" class="ring-label">{{ label }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  percent: { type: Number, required: true },
  size: { type: Number, default: 88 },
  stroke: { type: Number, default: 8 },
  color: { type: String, default: '' },
  trackColor: { type: String, default: 'rgba(255, 107, 53, 0.12)' },
  icon: { type: String, default: '' },
  label: { type: [String, Number], default: null },
});

const radius = computed(() => (props.size - props.stroke) / 2);
const circumference = computed(() => 2 * Math.PI * radius.value);
const clamped = computed(() => Math.max(0, Math.min(1, props.percent)));
const dashOffset = computed(() => circumference.value * (1 - clamped.value));

const resolvedColor = computed(() => {
  if (props.color) return props.color;
  if (clamped.value <= 0.2) return 'var(--color-danger)';
  if (clamped.value <= 0.5) return 'var(--color-warning)';
  return 'var(--color-success)';
});
</script>

<style scoped>
.ring {
  position: relative;
  display: inline-block;
}

.ring-center {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  pointer-events: none;
}

.ring-icon {
  font-size: 22px;
  line-height: 1;
}

.ring-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-strong);
  line-height: 1;
}

svg {
  display: block;
  transition: stroke-dashoffset 0.4s ease;
}
</style>
