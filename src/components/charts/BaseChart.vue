<template>
  <div ref="container" class="base-chart" :style="{ height: height + 'px' }" />
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import echarts from './echartsSetup.js';

const props = defineProps({
  option: { type: Object, required: true },
  height: { type: Number, default: 240 },
});

const container = ref(null);
let chart = null;
let observer = null;

function init() {
  if (!container.value) return;
  if (chart) chart.dispose();
  chart = echarts.init(container.value, null, { renderer: 'canvas' });
  chart.setOption(props.option);
}

function resize() {
  chart && chart.resize();
}

watch(
  () => props.option,
  (next) => {
    if (chart) chart.setOption(next, true);
  },
  { deep: true },
);

onMounted(() => {
  nextTick(init);
  observer = new ResizeObserver(resize);
  if (container.value) observer.observe(container.value);
  window.addEventListener('resize', resize);
});

onBeforeUnmount(() => {
  if (observer) observer.disconnect();
  window.removeEventListener('resize', resize);
  if (chart) chart.dispose();
  chart = null;
});
</script>

<style scoped>
.base-chart {
  width: 100%;
  min-height: 200px;
}
</style>
