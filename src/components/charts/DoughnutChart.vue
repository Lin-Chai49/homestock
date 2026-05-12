<template>
  <BaseChart :option="option" :height="height" />
</template>

<script setup>
import { computed } from 'vue';
import BaseChart from './BaseChart.vue';

const props = defineProps({
  /** [{ name: '食品', value: 45, color?: '#FF6B35' }] */
  data: { type: Array, required: true },
  height: { type: Number, default: 240 },
  centerLabel: { type: String, default: '' },
  centerValue: { type: String, default: '' },
});

const palette = ['#FF6B35', '#FFC857', '#7FB069', '#3D7EC9', '#C44569', '#A4D7A6', '#E54B4B', '#A89888'];

const option = computed(() => ({
  tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
  legend: {
    orient: 'horizontal',
    bottom: 0,
    icon: 'circle',
    textStyle: { fontSize: 11, color: 'var(--color-text)' },
  },
  series: [
    {
      type: 'pie',
      radius: ['52%', '78%'],
      center: ['50%', '42%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 6,
        borderColor: 'transparent',
        borderWidth: 2,
      },
      label: { show: false },
      labelLine: { show: false },
      data: props.data.map((d, i) => ({
        name: d.name,
        value: d.value,
        itemStyle: { color: d.color || palette[i % palette.length] },
      })),
    },
  ],
  graphic: props.centerLabel
    ? [
        {
          type: 'text',
          left: 'center',
          top: '36%',
          style: {
            text: props.centerLabel,
            fill: 'var(--color-text-muted)',
            fontSize: 11,
            textAlign: 'center',
          },
        },
        {
          type: 'text',
          left: 'center',
          top: '42%',
          style: {
            text: props.centerValue,
            fill: 'var(--color-text-strong)',
            fontSize: 18,
            fontWeight: 700,
            textAlign: 'center',
          },
        },
      ]
    : [],
}));
</script>
