<template>
  <router-view />
</template>

<style>
:root {
  --color-primary: #ff6b35;
  --color-primary-dark: #e55a2b;
  --color-primary-light: #fff8f3;
  --color-success: #07c160;
  --color-danger: #e53935;
  --color-warning: #ff9800;
  --color-info: #2196f3;
  --color-white: #ffffff;
  --color-bg: #f5f5f5;
  --color-card: #ffffff;
  --color-text: #333333;
  --color-text-secondary: #666666;
  --color-text-muted: #999999;
  --color-border: #eeeeee;
  --color-divider: #f0f0f0;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-round: 24px;
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.06);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.1);
  --font-size-xs: 11px;
  --font-size-sm: 13px;
  --font-size-base: 15px;
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
</style>
