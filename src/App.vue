<template>
  <AppShell>
    <router-view />
  </AppShell>
  <ToastHost />
</template>

<script setup>
import AppShell from '@/components/layout/AppShell.vue';
import ToastHost from '@/components/ToastHost.vue';
</script>
