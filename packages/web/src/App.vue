<template>
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<style>
:root {
  --color-primary: #4a9e4e;
  --color-primary-dark: #3d8340;
  --color-primary-light: #f0f7f0;
  --color-primary-gradient: linear-gradient(135deg, #4a9e4e, #66bb6a);
  --color-success: #4caf50;
  --color-danger: #e53935;
  --color-warning: #ff9800;
  --color-info: #2196f3;
  --color-white: #ffffff;
  --color-bg: #f3f6f3;
  --color-card: #ffffff;
  --color-text: #333333;
  --color-text-secondary: #5a6b5a;
  --color-text-muted: #999999;
  --color-border: #e8ebe8;
  --color-divider: #f0f2f0;
  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 16px;
  --radius-round: 22px;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.04);
  --shadow-card: 0 2px 12px rgba(0,0,0,0.06);
  --shadow-raised: 0 4px 20px rgba(0,0,0,0.08);
  --font-size-xs: 12px;
  --font-size-sm: 13px;
  --font-size-base: 15px;
  --font-size-h3: 15px;
  --font-size-lg: 18px;
  --font-size-xl: 22px;
  --font-size-xxl: 28px;
  --safe-bottom: env(safe-area-inset-bottom, 0px);
}

* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
  background: var(--color-bg);
  color: var(--color-text);
  -webkit-font-smoothing: antialiased;
  -webkit-tap-highlight-color: transparent;
}
input, select, textarea, button { font-family: inherit; }

/* Page transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
