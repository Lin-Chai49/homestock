<template>
  <BaseChart :option="option" :height="height" />
</template>

<script setup>
import { computed } from 'vue';
import BaseChart from './BaseChart.vue';

const props = defineProps({
  /** [{ x: 'Jan', y: 100 }] */
  data: { type: Array, required: true },
  color: { type: String, default: '#FF6B35' },
  height: { type: Number, default: 220 },
  yLabel: { type: String, default: '' },
  showMarkPoints: { type: Boolean, default: true },
});

const option = computed(() => ({
  grid: { top: 24, right: 16, bottom: 32, left: 48 },
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(45,42,38,0.92)',
    borderWidth: 0,
    textStyle: { color: '#fff', fontSize: 12 },
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: props.data.map((p) => p.x),
    axisLabel: { fontSize: 11, color: 'var(--color-text-muted)' },
    axisLine: { lineStyle: { color: 'var(--color-border)' } },
    axisTick: { show: false },
  },
  yAxis: {
    type: 'value',
    name: props.yLabel,
    nameTextStyle: { fontSize: 11, color: 'var(--color-text-muted)' },
    axisLabel: { fontSize: 11, color: 'var(--color-text-muted)' },
    axisLine: { show: false },
    splitLine: { lineStyle: { color: 'var(--color-divider)', type: 'dashed' } },
    axisTick: { show: false },
  },
  series: [
    {
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 7,
      lineStyle: { color: props.color, width: 3 },
      itemStyle: { color: props.color, borderColor: '#fff', borderWidth: 2 },
      areaStyle: {
        opacity: 0.18,
        color: props.color,
      },
      data: props.data.map((p) => p.y),
      markPoint: props.showMarkPoints
        ? {
            data: [
              { type: 'max', name: '最高', label: { color: '#fff', fontSize: 10 } },
              { type: 'min', name: '最低', label: { color: '#fff', fontSize: 10 } },
            ],
            symbolSize: 36,
            itemStyle: { color: props.color },
          }
        : undefined,
    },
  ],
}));
</script>
