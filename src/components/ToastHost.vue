<template>
  <Teleport to="body">
    <div v-if="visible" class="toast" role="status">{{ message }}</div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const visible = ref(false);
const message = ref('');
let timer = null;

function show(text, duration = 2200) {
  message.value = text;
  visible.value = true;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    visible.value = false;
  }, duration);
}

function onToast(e) {
  show(e.detail?.message || '', e.detail?.duration);
}

onMounted(() => {
  window.addEventListener('app:toast', onToast);
});

onUnmounted(() => {
  window.removeEventListener('app:toast', onToast);
  if (timer) clearTimeout(timer);
});
</script>
