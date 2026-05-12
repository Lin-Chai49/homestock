<template>
  <BaseChart :option="option" :height="height" />
</template>

<script setup>
import { computed } from 'vue';
import BaseChart from './BaseChart.vue';

const props = defineProps({
  /** [{ x: 'Mon', y: 12, color?: '#FF6B35' }] */
  data: { type: Array, required: true },
  defaultColor: { type: String, default: '#FF6B35' },
  height: { type: Number, default: 220 },
  horizontal: { type: Boolean, default: false },
});

const option = computed(() => {
  const colors = props.data.map((p) => p.color || props.defaultColor);
  const labels = props.data.map((p) => p.x);
  const values = props.data.map((p) => p.y);
  if (props.horizontal) {
    return {
      grid: { top: 8, right: 24, bottom: 16, left: 80 },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      xAxis: {
        type: 'value',
        axisLabel: { fontSize: 11, color: 'var(--color-text-muted)' },
        splitLine: { lineStyle: { color: 'var(--color-divider)', type: 'dashed' } },
      },
      yAxis: {
        type: 'category',
        data: labels,
        axisLabel: { fontSize: 11, color: 'var(--color-text)' },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      series: [
        {
          type: 'bar',
          data: values.map((v, i) => ({ value: v, itemStyle: { color: colors[i] } })),
          barWidth: '60%',
          itemStyle: { borderRadius: [0, 6, 6, 0] },
        },
      ],
    };
  }
  return {
    grid: { top: 24, right: 16, bottom: 28, left: 36 },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: {
      type: 'category',
      data: labels,
      axisLabel: { fontSize: 11, color: 'var(--color-text-muted)' },
      axisLine: { lineStyle: { color: 'var(--color-border)' } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLabel: { fontSize: 11, color: 'var(--color-text-muted)' },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: 'var(--color-divider)', type: 'dashed' } },
      axisTick: { show: false },
    },
    series: [
      {
        type: 'bar',
        data: values.map((v, i) => ({ value: v, itemStyle: { color: colors[i] } })),
        barWidth: '55%',
        itemStyle: { borderRadius: [6, 6, 0, 0] },
      },
    ],
  };
});
</script>
