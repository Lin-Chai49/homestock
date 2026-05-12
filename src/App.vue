<template>
  <AppShell>
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </AppShell>
  <ToastHost />
</template>

<script setup>
import AppShell from '@/components/layout/AppShell.vue';
import ToastHost from '@/components/ToastHost.vue';
</script>
