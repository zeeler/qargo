# Web 前端绿色系设计刷新 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 packages/web 全局配色从橙色系切换为鼠尾草绿系，提升卡片阴影/空间/微交互质感。

**Architecture:** 所有改动集中在 `<style scoped>` 块内，不动模板和脚本逻辑。App.vue 作为全局变量源，各页面替换硬编码色值为 CSS 变量引用。

**Tech Stack:** Vue 3 SFC + CSS 变量

**Spec:** [docs/superpowers/specs/2026-05-17-web-green-redesign-design.md](../specs/2026-05-17-web-green-redesign-design.md)

---

### Task 1: App.vue — 全局 CSS 变量 + 页面过渡动画

**Files:**
- Modify: `packages/web/src/App.vue`

- [ ] **Step 1: 替换全部 CSS 变量并添加页面过渡**

替换 `:root` 块中的 CSS 变量，新增渐变和阴影变量，在 body 上添加微过渡，给 `<router-view>` 加 fade 动画。

完整替换 `<style>` 块：

```css
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
```

同时修改 `<template>` 块，让 `<router-view>` 支持过渡：

```html
<template>
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add packages/web/src/App.vue
git commit -m "feat: 全局切换绿色系配色变量，添加页面fade过渡"
```

---

### Task 2: home/index.vue — Header渐变 + 车型卡片过渡

**Files:**
- Modify: `packages/web/src/pages/home/index.vue:190-220`

- [ ] **Step 1: 替换 header 和 vehicle 相关样式**

替换 `.header` 背景、车辆卡片样式、底部栏样式。只改 `<style scoped>` 块中以下代码段：

```css
/* Header */
.header { background: var(--color-primary-gradient); padding: 12px 16px; }
```

```css
/* Vehicle Detail Card */
.vehicle-detail { margin: 12px 12px 0; background: var(--color-card); border-radius: var(--radius-md); padding: 16px; border: 1px solid var(--color-primary); box-shadow: var(--shadow-card); }
```

```css
/* Vehicle Scroll */
.vehicle-section { padding: 0 16px; margin-top: 12px; }
.section-title { font-size: var(--font-size-h3); font-weight: 700; padding: 0 4px 8px; }
.vehicle-scroll { display: flex; flex-wrap: wrap; gap: 8px; padding: 4px 0 8px; }
.vehicle-card { background: var(--color-card); border-radius: var(--radius-round); padding: 8px 14px; text-align: center; border: 1.5px solid var(--color-border); cursor: pointer; transition: border-color 0.2s, background 0.2s, transform 0.15s; box-shadow: var(--shadow-sm); }
.vehicle-card:active { transform: scale(0.985); }
.vehicle-card.active { border-color: var(--color-primary); background: var(--color-primary-light); }
.v-name { font-size: var(--font-size-sm); font-weight: 600; color: var(--color-text); white-space: nowrap; }
```

```css
/* Bottom Bar */
.bottom-bar { position: fixed; bottom: 0; left: 0; right: 0; background: rgba(255,255,255,0.92); backdrop-filter: blur(12px); padding: 12px 16px calc(12px + var(--safe-bottom)); display: flex; align-items: center; justify-content: space-between; box-shadow: var(--shadow-raised); z-index: 100; }
.btn-order { background: var(--color-primary-gradient); color: #fff; padding: 12px 32px; border-radius: var(--radius-round); font-size: var(--font-size-lg); font-weight: 600; border: none; cursor: pointer; transition: all 0.2s ease; }
.btn-order:active { transform: translateY(1px) scale(0.98); box-shadow: var(--shadow-sm); }
.btn-order:disabled { background: #ccc; cursor: not-allowed; box-shadow: none; }
```

地址卡也加上卡片阴影：
```css
.address-card { margin: 12px 16px; background: var(--color-card); border-radius: var(--radius-md); padding: 16px; box-shadow: var(--shadow-card); border: 1px solid var(--color-border); }
```

- [ ] **Step 2: Commit**

```bash
git add packages/web/src/pages/home/index.vue
git commit -m "feat: 首页适配绿色渐变、卡片阴影和按钮微交互"
```

---

### Task 3: order/list.vue — 状态标签 + 卡片统一

**Files:**
- Modify: `packages/web/src/pages/order/list.vue:137-189`

- [ ] **Step 1: 替换订单列表页样式**

替换 `<style scoped>` 块：

```css
<style scoped>
.page { min-height: 100vh; background: var(--color-bg); }

/* Header */
.page-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: var(--color-card); position: sticky; top: 0; z-index: 10; border-bottom: 1px solid var(--color-border); }
.page-header h2 { font-size: var(--font-size-lg); font-weight: 700; }
.back-btn { cursor: pointer; font-size: 20px; color: var(--color-text); width: 32px; }

/* Filter Tabs */
.filter-tabs { display: flex; background: var(--color-card); padding: 0 16px; border-bottom: 1px solid var(--color-divider); position: sticky; top: 45px; z-index: 9; }
.filter-tab { flex: 1; text-align: center; padding: 14px 0; font-size: var(--font-size-sm); color: var(--color-text-secondary); cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.2s; position: relative; }
.filter-tab.active { color: var(--color-primary); font-weight: 700; border-bottom-color: var(--color-primary); }
.tab-badge { display: inline-block; background: var(--color-primary); color: #fff; font-size: 10px; padding: 1px 6px; border-radius: 8px; margin-left: 4px; vertical-align: top; }

/* Order Cards */
.order-list { padding: 12px 16px; }
.order-card { background: var(--color-card); border-radius: var(--radius-md); padding: 16px; margin-bottom: 12px; box-shadow: var(--shadow-card); border: 1px solid var(--color-border); cursor: pointer; transition: transform 0.15s ease; }
.order-card:active { transform: scale(0.985); }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.card-order-no { font-size: var(--font-size-xs); color: var(--color-text-muted); font-family: monospace; }
.card-status { font-size: var(--font-size-xs); padding: 3px 10px; border-radius: 10px; font-weight: 600; }
.card-status.pending { background: var(--color-primary-light); color: var(--color-primary); }
.card-status.paid { background: #e3f2fd; color: var(--color-info); }
.card-status.dispatched { background: #e3f2fd; color: var(--color-info); }
.card-status.arrived, .card-status.loading { background: #fff8e1; color: #f57c00; }
.card-status.delivering { background: var(--color-primary-light); color: var(--color-success); }
.card-status.completed { background: var(--color-primary-light); color: var(--color-success); }
.card-status.cancelled { background: #fce4ec; color: var(--color-danger); }

.card-body { margin-bottom: 10px; }
.route-line { display: flex; flex-direction: column; gap: 6px; }
.route-stop { display: flex; align-items: center; gap: 8px; }
.route-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.route-dot.pickup { background: var(--color-success); }
.route-dot.dropoff { background: var(--color-danger); }
.route-addr { font-size: var(--font-size-sm); color: var(--color-text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.card-meta { display: flex; gap: 12px; margin-top: 8px; padding-left: 16px; }
.card-meta span { font-size: var(--font-size-xs); color: var(--color-text-muted); background: var(--color-bg); padding: 2px 8px; border-radius: 4px; }

.card-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px solid var(--color-divider); }
.card-price { font-size: var(--font-size-lg); font-weight: 700; color: var(--color-primary); }
.card-time { font-size: var(--font-size-xs); color: var(--color-text-muted); }
.card-action-hint { text-align: right; font-size: var(--font-size-xs); color: var(--color-primary); margin-top: 4px; font-weight: 600; }

/* Empty State */
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 100px 40px; text-align: center; }
.empty-icon { font-size: 56px; margin-bottom: 16px; }
.empty-title { font-size: var(--font-size-lg); color: var(--color-text); font-weight: 600; margin-bottom: 8px; }
.empty-desc { font-size: var(--font-size-sm); color: var(--color-text-muted); margin-bottom: 20px; }
.btn-go-order, .btn-go-login { padding: 10px 32px; border-radius: var(--radius-round); font-size: var(--font-size-base); border: none; cursor: pointer; transition: all 0.2s ease; }
.btn-go-order { background: var(--color-primary-gradient); color: #fff; }
.btn-go-order:active { transform: translateY(1px) scale(0.98); }
.btn-go-login { background: var(--color-card); color: var(--color-primary); border: 1px solid var(--color-primary); }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add packages/web/src/pages/order/list.vue
git commit -m "feat: 订单列表页适配绿色系卡片、状态标签和微交互"
```

---

### Task 4: order/create.vue — 卡片阴影 + 底部栏毛玻璃

**Files:**
- Modify: `packages/web/src/pages/order/create.vue:225-293`

- [ ] **Step 1: 替换创建订单页样式**

替换 `<style scoped>` 块中相关样式：

```css
<style scoped>
.page { min-height: 100vh; background: var(--color-bg); padding-bottom: 80px; }

/* Header */
.page-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: var(--color-card); position: sticky; top: 0; z-index: 10; border-bottom: 1px solid var(--color-border); }
.page-header h2 { font-size: var(--font-size-lg); font-weight: 700; }
.back-btn { cursor: pointer; font-size: 20px; color: var(--color-text); width: 32px; }

/* Sections */
.section { background: var(--color-card); margin: 8px 16px; border-radius: var(--radius-md); padding: 16px; box-shadow: var(--shadow-card); border: 1px solid var(--color-border); }
.sec-title { font-size: var(--font-size-h3); font-weight: 700; margin-bottom: 12px; color: var(--color-text); }

/* Info Grid */
.info-grid { display: flex; flex-direction: column; gap: 10px; }
.info-item { display: flex; gap: 12px; }
.info-label { font-size: var(--font-size-sm); color: var(--color-text-muted); flex-shrink: 0; min-width: 56px; }
.info-value { font-size: var(--font-size-sm); color: var(--color-text); }
.info-value.addr { word-break: break-all; }

/* Cargo Types */
.cargo-types { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px; }
.cargo-tag { padding: 6px 14px; font-size: var(--font-size-sm); border-radius: var(--radius-round); background: var(--color-bg); color: var(--color-text-secondary); cursor: pointer; transition: all 0.2s; border: 1px solid transparent; }
.cargo-tag.active { background: var(--color-primary-light); color: var(--color-primary); border-color: var(--color-primary); font-weight: 600; }

/* Form */
.form-row { display: flex; gap: 12px; margin-bottom: 12px; }
.form-row:last-child { margin-bottom: 0; }
.form-item { flex: 1; }
.form-item.half { flex: 1; }
.form-label { font-size: var(--font-size-xs); color: var(--color-text-muted); display: block; margin-bottom: 4px; }
.input { width: 100%; height: 42px; background: var(--color-bg); border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: 0 12px; font-size: var(--font-size-sm); outline: none; transition: border-color 0.2s, background 0.2s; }
.input:focus { border-color: var(--color-primary); background: var(--color-card); }
.weight-selector { position: relative; }
.weight-selector .input { padding-right: 32px; }
.weight-selector .unit { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: var(--font-size-sm); color: var(--color-text-muted); }

/* Tip Slider */
.tip-section { display: flex; align-items: center; gap: 12px; }
.tip-slider-wrap { flex: 1; }
.tip-slider { width: 100%; height: 6px; -webkit-appearance: none; background: linear-gradient(to right, var(--color-primary), var(--color-primary) var(--p), var(--color-border) var(--p)); border-radius: 3px; outline: none; }
.tip-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 24px; height: 24px; border-radius: 50%; background: #fff; border: 2px solid var(--color-primary); box-shadow: var(--shadow-sm); cursor: pointer; }
.tip-marks { display: flex; justify-content: space-between; margin-top: 6px; }
.tip-mark { font-size: var(--font-size-xs); color: var(--color-text-muted); cursor: pointer; }
.tip-mark.active { color: var(--color-primary); font-weight: 600; }
.tip-value { font-size: var(--font-size-lg); color: var(--color-primary); font-weight: 700; flex-shrink: 0; }

/* Payment Options */
.payment-options { display: flex; gap: 12px; }
.payment-option { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 16px 12px; border: 2px solid var(--color-border); border-radius: var(--radius-md); cursor: pointer; transition: all 0.2s; position: relative; background: var(--color-card); }
.payment-option.active { border-color: var(--color-primary); background: var(--color-primary-light); }
.pm-icon { font-size: 28px; }
.pm-name { font-size: var(--font-size-sm); font-weight: 600; }
.pm-check { position: absolute; top: 8px; right: 8px; width: 20px; height: 20px; border-radius: 50%; background: var(--color-primary); color: #fff; font-size: 12px; display: flex; align-items: center; justify-content: center; }

/* Price Summary */
.price-summary-section { margin-bottom: 12px; }
.price-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: var(--font-size-sm); color: var(--color-text-secondary); }
.total-row { border-top: 1px solid var(--color-divider); padding-top: 12px; margin-top: 6px; font-size: var(--font-size-lg); font-weight: 700; color: var(--color-text); }
.total-price { color: var(--color-primary); font-size: var(--font-size-xl); font-weight: 700; }
.tip-text { color: var(--color-warning); font-weight: 600; }

/* Bottom Bar */
.bottom-bar { position: fixed; bottom: 0; left: 0; right: 0; background: rgba(255,255,255,0.92); backdrop-filter: blur(12px); padding: 12px 16px calc(12px + var(--safe-bottom)); display: flex; align-items: center; justify-content: space-between; box-shadow: var(--shadow-raised); z-index: 100; }
.bottom-price { display: flex; align-items: baseline; gap: 6px; }
.bp-label { font-size: var(--font-size-sm); color: var(--color-text-muted); }
.bp-num { font-size: var(--font-size-xl); color: var(--color-primary); font-weight: 700; }
.btn-submit { background: var(--color-primary-gradient); color: #fff; padding: 12px 36px; border-radius: var(--radius-round); font-size: var(--font-size-lg); font-weight: 600; border: none; cursor: pointer; transition: all 0.2s ease; }
.btn-submit:active { transform: translateY(1px) scale(0.98); box-shadow: var(--shadow-sm); }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add packages/web/src/pages/order/create.vue
git commit -m "feat: 创建订单页适配绿色系卡片、底部毛玻璃和按钮交互"
```

---

### Task 5: order/calc.vue — 卡片 + 底部栏 + 弹出框阴影

**Files:**
- Modify: `packages/web/src/pages/order/calc.vue:223-284`

- [ ] **Step 1: 替换费用计算页样式**

替换 `<style scoped>` 块：

```css
<style scoped>
.page { min-height: 100vh; background: var(--color-bg); }

/* Header */
.page-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: var(--color-card); position: sticky; top: 0; z-index: 10; border-bottom: 1px solid var(--color-border); }
.page-header h2 { font-size: var(--font-size-lg); font-weight: 700; }
.back-btn { cursor: pointer; font-size: 20px; color: var(--color-text); width: 32px; }

/* Cards */
.card { background: var(--color-card); border-radius: var(--radius-md); margin: 12px 16px; padding: 16px; box-shadow: var(--shadow-card); border: 1px solid var(--color-border); }

/* Route Card */
.route-line { display: flex; flex-direction: column; gap: 0; }
.route-stop { display: flex; align-items: center; gap: 10px; padding: 6px 0; }
.route-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.route-dot.pickup { background: var(--color-success); }
.route-dot.dropoff { background: var(--color-danger); }
.route-text { font-size: var(--font-size-base); color: var(--color-text); font-weight: 500; }
.route-divider { width: 1px; flex: 1; border-left: 1px dashed var(--color-border); margin: 2px 0 2px 4px; min-height: 10px; }

.route-vehicle { display: flex; align-items: center; gap: 8px; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--color-divider); }
.rv-icon { font-size: 24px; }
.rv-name { font-size: var(--font-size-base); font-weight: 600; color: var(--color-text); }
.rv-size { font-size: var(--font-size-xs); color: var(--color-text-muted); margin-left: auto; }

/* Fee Card */
.fee-row { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; cursor: pointer; }
.fee-divider { height: 1px; background: var(--color-divider); }
.fee-left { display: flex; flex-direction: column; gap: 2px; }
.fee-mode { font-size: var(--font-size-base); font-weight: 600; color: var(--color-text); }
.fee-desc { font-size: var(--font-size-xs); color: var(--color-text-muted); }
.fee-right { display: flex; align-items: center; gap: 8px; }
.fee-price { font-size: var(--font-size-lg); font-weight: 700; color: var(--color-primary); }
.fee-placeholder { font-size: var(--font-size-lg); color: var(--color-text-muted); }
.fee-edit { font-size: var(--font-size-xs); color: var(--color-primary); padding: 2px 8px; border: 1px solid var(--color-primary); border-radius: 10px; cursor: pointer; }
.fee-radio { width: 20px; height: 20px; border-radius: 50%; border: 2px solid var(--color-border); flex-shrink: 0; transition: all 0.2s; }
.fee-radio.checked { border-color: var(--color-primary); background: var(--color-primary); box-shadow: inset 0 0 0 3px #fff; }

/* Bottom Bar */
.bottom-bar { position: fixed; bottom: 0; left: 0; right: 0; background: rgba(255,255,255,0.92); backdrop-filter: blur(12px); padding: 12px 16px calc(12px + var(--safe-bottom)); display: flex; align-items: center; justify-content: space-between; box-shadow: var(--shadow-raised); z-index: 100; }
.bottom-price { display: flex; align-items: baseline; gap: 8px; }
.bp-label { font-size: var(--font-size-sm); color: var(--color-text-secondary); }
.bp-total { font-size: var(--font-size-xl); color: var(--color-primary); font-weight: 700; }
.btn-confirm { background: var(--color-primary-gradient); color: #fff; padding: 12px 32px; border-radius: var(--radius-round); font-size: var(--font-size-lg); font-weight: 600; border: none; cursor: pointer; transition: all 0.2s ease; }
.btn-confirm:active { transform: translateY(1px) scale(0.98); box-shadow: var(--shadow-sm); }
.btn-confirm:disabled { background: #ccc; cursor: not-allowed; box-shadow: none; }

/* Bid Dialog */
.dialog-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 24px; }
.dialog { background: var(--color-card); border-radius: var(--radius-lg); padding: 24px; width: 100%; max-width: 320px; text-align: center; box-shadow: var(--shadow-raised); }
.dialog h3 { font-size: var(--font-size-lg); margin-bottom: 16px; }
.bid-input-row { display: flex; align-items: center; justify-content: center; gap: 4px; margin-bottom: 12px; }
.bid-yuan { font-size: 28px; font-weight: 600; color: var(--color-text); }
.bid-input { width: 180px; font-size: 28px; font-weight: 700; border: none; border-bottom: 2px solid var(--color-primary); outline: none; padding: 4px 8px; text-align: center; background: transparent; }
.bid-min-hint { font-size: var(--font-size-sm); color: var(--color-text-muted); margin-bottom: 20px; }
.dialog-actions { display: flex; gap: 10px; }
.dialog-actions button { flex: 1; height: 44px; border-radius: var(--radius-round); font-size: var(--font-size-base); cursor: pointer; border: none; transition: all 0.2s ease; }
.btn-cancel { background: var(--color-bg); color: var(--color-text-secondary); }
.btn-ok { background: var(--color-primary-gradient); color: #fff; }
.btn-ok:disabled { background: #ccc; }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add packages/web/src/pages/order/calc.vue
git commit -m "feat: 费用计算页适配绿色系卡片、底部毛玻璃和弹窗阴影"
```

---

### Task 6: order/detail.vue — 状态条 + 进度光环 + 评价按钮

**Files:**
- Modify: `packages/web/src/pages/order/detail.vue:452-763`

- [ ] **Step 1: 替换订单详情页样式**

替换全部 `<style scoped>` 内容。关键改动：

- `.status-bar.pending` 渐变从橙色 → 绿色渐变
- `.progress-step.current .step-dot` 光晕从橙色 `rgba(255,107,53,0.25)` → 绿色 `rgba(74,158,78,0.25)`
- `.btn-review` 渐变从橙色 → 绿色渐变  
- 所有 `.section` 添加 `box-shadow: var(--shadow-card); border: 1px solid var(--color-border)`
- 所有 `.dialog` 添加 `box-shadow: var(--shadow-raised)`

完整样式（关键改动段）：

```css
/* Status Bar — pending 用绿色渐变替代橙色 */
.status-bar.pending { background: var(--color-primary-gradient); }

/* Progress — 光晕色从橙改为绿 */
.progress-step.current .step-dot { background: var(--color-primary); box-shadow: 0 0 0 4px rgba(74,158,78,0.25); width: 10px; height: 10px; }

/* Sections — 添加卡片阴影和边框 */
.section { background: var(--color-card); margin: 8px 16px; border-radius: var(--radius-md); padding: 16px; box-shadow: var(--shadow-card); border: 1px solid var(--color-border); }

/* Review button — 橙色渐变改绿色 */
.btn-review { width: 100%; height: 44px; background: var(--color-primary-gradient); color: #fff; border: none; border-radius: var(--radius-round); font-size: var(--font-size-base); font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
.btn-review:active { transform: translateY(1px) scale(0.98); }

/* Dialogs — 添加阴影 */
.dialog { background: var(--color-card); border-radius: var(--radius-lg); padding: 24px; width: 100%; max-width: 320px; text-align: center; box-shadow: var(--shadow-raised); }

/* Complaint type active tag */
.complaint-type-tag.active { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }

/* 其余样式保持不变，只替换硬编码 #fff 背景为 var(--color-card) 和 #ddd 虚线为 var(--color-border) */
.addr-divider-line { width: 1px; flex: 1; border-left: 1px dashed var(--color-border); margin: 4px 0 4px 4px; min-height: 12px; }

.progress-section { background: var(--color-card); margin: 0 16px 8px; border-radius: var(--radius-md); padding: 20px 16px 16px; box-shadow: var(--shadow-card); border: 1px solid var(--color-border); }
```

完整文件改动较多但都是机械替换。可用 `replace_all` 处理：
- `background: #fff` → `background: var(--color-card)` (全文件)
- `margin: 8px 12px` → `margin: 8px 16px` (全文件)  
- `#ddd` → `var(--color-border)` (全文件)
- `0 12px 8px` → `0 16px 8px` (progress-section)

以及上述关键改动。

- [ ] **Step 2: Commit**

```bash
git add packages/web/src/pages/order/detail.vue
git commit -m "feat: 订单详情页适配绿色系状态条、进度光环和卡片样式"
```

---

### Task 7: auth/login.vue — 按钮交互统一

**Files:**
- Modify: `packages/web/src/pages/auth/login.vue:64-85`

- [ ] **Step 1: 替换登录页按钮交互样式**

替换 `.btn-login` 和 `.btn-login:active`：

```css
.btn-login { width: 100%; height: 50px; background: var(--color-primary-gradient); color: #fff; border: none; border-radius: var(--radius-round); font-size: var(--font-size-lg); font-weight: 600; cursor: pointer; margin-top: 24px; transition: all 0.2s ease; }
.btn-login:active { transform: translateY(1px) scale(0.98); box-shadow: var(--shadow-sm); }
```

- [ ] **Step 2: Commit**

```bash
git add packages/web/src/pages/auth/login.vue
git commit -m "feat: 登录页按钮适配绿色渐变和统一交互"
```

---

### Task 8: auth/register.vue — 按钮交互统一

**Files:**
- Modify: `packages/web/src/pages/auth/register.vue:79-101`

- [ ] **Step 1: 替换注册页按钮交互样式**

替换 `.btn-register` 和 `.btn-register:active`：

```css
.btn-register { width: 100%; height: 50px; background: var(--color-primary-gradient); color: #fff; border: none; border-radius: var(--radius-round); font-size: var(--font-size-lg); font-weight: 600; cursor: pointer; margin-top: 20px; transition: all 0.2s ease; }
.btn-register:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-register:active { transform: translateY(1px) scale(0.98); box-shadow: var(--shadow-sm); }
```

- [ ] **Step 2: Commit**

```bash
git add packages/web/src/pages/auth/register.vue
git commit -m "feat: 注册页按钮适配绿色渐变和统一交互"
```

---

### Task 9: user/profile.vue — 用户卡片渐变 + 菜单微交互

**Files:**
- Modify: `packages/web/src/pages/user/profile.vue:124-160`

- [ ] **Step 1: 替换用户中心页样式**

关键改动：

```css
/* User Card — 渐变改绿色 */
.user-card { margin: 12px 16px; background: var(--color-primary-gradient); border-radius: var(--radius-md); padding: 24px 16px; display: flex; align-items: center; gap: 16px; cursor: pointer; }

/* Menu Groups — 添加卡片样式 */
.menu-group { background: var(--color-card); margin: 0 0 8px; padding: 0 16px; }
.menu-item { display: flex; align-items: center; padding: 14px 0; gap: 12px; cursor: pointer; border-bottom: 1px solid var(--color-divider); transition: background 0.15s; }
.menu-item:active { background: var(--color-bg); }
.menu-item:last-child { border-bottom: none; }

/* Menu arrow color */
.menu-arrow { color: var(--color-border); font-size: 18px; flex-shrink: 0; }

/* Logout button */
.btn-logout { width: 100%; height: 48px; background: var(--color-card); color: var(--color-danger); border: 1px solid var(--color-border); border-radius: var(--radius-round); font-size: var(--font-size-base); cursor: pointer; transition: all 0.2s ease; }
.btn-logout:active { background: #fce4ec; transform: scale(0.98); }
```

- [ ] **Step 2: Commit**

```bash
git add packages/web/src/pages/user/profile.vue
git commit -m "feat: 用户中心适配绿色渐变卡片和菜单微交互"
```

---

### Task 10: driver/orders.vue — 状态标签 + 卡片 + 接单按钮

**Files:**
- Modify: `packages/web/src/pages/driver/orders.vue:160-230`

- [ ] **Step 1: 替换司机订单页样式**

关键改动：

```css
/* Tabs */
.tabs { display: flex; background: var(--color-card); margin-bottom: 8px; }

/* Order Cards */
.order-list { padding: 0 16px 12px; }
.order-card { background: var(--color-card); border-radius: var(--radius-md); padding: 16px; margin-bottom: 12px; box-shadow: var(--shadow-card); border: 1px solid var(--color-border); position: relative; transition: transform 0.15s ease; }
.order-card:active { transform: scale(0.985); }
.card-tip { font-size: var(--font-size-xs); color: var(--color-warning); font-weight: 600; background: #fff8e1; padding: 2px 10px; border-radius: 10px; }

/* Dispatch Button */
.btn-dispatch { display: block; width: 100%; height: 42px; background: var(--color-primary-gradient); color: #fff; border: none; border-radius: 21px; font-size: var(--font-size-base); font-weight: 600; cursor: pointer; margin-top: 12px; transition: all 0.2s ease; }
.btn-dispatch:active { transform: translateY(1px) scale(0.98); box-shadow: var(--shadow-sm); }

/* Dialog */
.dialog { background: var(--color-card); border-radius: var(--radius-lg); padding: 24px; width: 100%; max-width: 320px; box-shadow: var(--shadow-raised); }
.btn-dialog-primary { background: var(--color-primary-gradient); color: #fff; font-weight: 600; transition: all 0.2s ease; }
.btn-dialog-primary:active { transform: translateY(1px) scale(0.98); }
.btn-dialog-primary:disabled { background: #ccc; }
```

- [ ] **Step 2: Commit**

```bash
git add packages/web/src/pages/driver/orders.vue
git commit -m "feat: 司机订单页适配绿色系卡片、按钮渐变和弹窗阴影"
```

---

### Task 11: driver/order-detail.vue — 状态横幅 + 操作按钮

**Files:**
- Modify: `packages/web/src/pages/driver/order-detail.vue:176-237`

- [ ] **Step 1: 替换司机订单详情页样式**

关键改动：

```css
/* Sections */
.section { background: var(--color-card); margin: 8px 16px; border-radius: var(--radius-md); padding: 16px; box-shadow: var(--shadow-card); border: 1px solid var(--color-border); }

/* Status banners — loading/delivering 已有的绿色渐变保持不变，completed 也保持绿色调，把 dispatched 和 arrived 保持 */
/* 关键改动：橙色按钮 depart 保持绿色 #4caf50（本就是绿色），确保 complete 和 photo 按钮协调 */
.btn-action.arrive { background: var(--color-info); }
.btn-action.photo { background: var(--color-warning); }
.btn-action.depart { background: var(--color-success); }
.btn-action.complete { background: var(--color-success); }
.btn-action { transition: all 0.2s ease; }
.btn-action:active { transform: translateY(1px) scale(0.98); box-shadow: var(--shadow-sm); }

/* 收入文字颜色跟随主色 */
.complete-income { font-size: var(--font-size-xl); color: var(--color-primary); font-weight: 700; margin-top: 8px; }

/* 虚线边框 */
.addr-divider { height: 12px; border-left: 1px dashed var(--color-border); margin-left: 4px; }

/* Photo item */
.photo-item { aspect-ratio: 1; background: var(--color-bg); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; font-size: var(--font-size-sm); color: var(--color-text-muted); }
```

- [ ] **Step 2: Commit**

```bash
git add packages/web/src/pages/driver/order-detail.vue
git commit -m "feat: 司机订单详情适配绿色系卡片和按钮交互"
```

---

### Task 12: 验收 — 清理 + 测试

- [ ] **Step 1: 确认无橙色残留**

```bash
grep -rn '#ff6b35\|#e55a2b\|#fff8f3' packages/web/src --include='*.vue' --include='*.css'
```
预期：无输出（或在 order/detail.vue 的 canvas mock 代码中有 `#ff6b35` 是 JS 逻辑，不属于样式，可忽略）。

- [ ] **Step 2: 验证所有页面**

手动访问以下路径确认视觉一致：
- http://localhost:5173/ （首页，绿色 header + 小厢货默认选中）
- http://localhost:5173/auth/login （登录页，绿色渐变按钮）
- http://localhost:5173/auth/register （注册页，绿色渐变按钮）
- http://localhost:5173/user/profile （用户中心，绿色渐变卡片）
- http://localhost:5173/order/list （订单列表，绿色系卡片）
- http://localhost:5173/order/calc?type=small_van&pickup=深圳北站&dropoff=南山科技园 （费用计算）
- http://localhost:5173/order/create （创建订单）
- http://localhost:5173/order/detail?id=xxx （订单详情）
- http://localhost:5173/driver/orders （司机订单）
- http://localhost:5173/driver/order-detail?id=xxx （司机订单详情）

- [ ] **Step 3: Commit 验收**

```bash
git add -A
git commit -m "chore: 验收通过，全站绿色系一致，无橙色残留"
```
