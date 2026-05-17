<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-message-provider>
      <n-notification-provider>
        <n-dialog-provider>
          <router-view />
        </n-dialog-provider>
      </n-notification-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import type { GlobalThemeOverrides } from 'naive-ui';

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#4a9e4e',
    primaryColorHover: '#66bb6a',
    primaryColorPressed: '#3d8340',
    primaryColorSuppl: '#66bb6a',
    bodyColor: '#f0f2f0',
    cardColor: '#f8faf8',
    inputColor: '#f0f2f0',
  },
};
</script>
