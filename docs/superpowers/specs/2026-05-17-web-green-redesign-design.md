# Web 前端绿色系设计刷新

**日期**: 2026-05-17  
**范围**: `packages/web` 全部页面  
**不改**: `packages/admin`（管理后台保持现有风格）

## 一、色彩体系

### 主色调：橙 → 鼠尾草绿

| 变量 | 旧值 | 新值 | 用途 |
|------|------|------|------|
| `--color-primary` | `#ff6b35` | `#4a9e4e` | 主按钮、选中态、强调元素 |
| `--color-primary-dark` | `#e55a2b` | `#3d8340` | 按钮按下态 |
| `--color-primary-light` | `#fff8f3` | `#f0f7f0` | 选中背景、浅底 |
| `--color-bg` | `#f5f5f5` | `#f3f6f3` | 页面背景带绿调 |

### 新增变量

```css
--color-primary-gradient: linear-gradient(135deg, #4a9e4e, #66bb6a);
```

用于 header、按钮渐变、用户卡片等需要视觉深度的区域。

### 语义色微调

| 变量 | 旧值 | 新值 |
|------|------|------|
| `--color-success` | `#07c160` | `#4caf50` |
| `--color-text-secondary` | `#666666` | `#5a6b5a` |

其余 `--color-danger` / `--color-warning` / `--color-info` 不变。

## 二、卡片与空间

### 阴影层级（2层 → 3层）

| 变量 | 值 | 用途 |
|------|-----|------|
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.04)` | 轻层级 |
| `--shadow-card` | `0 2px 12px rgba(0,0,0,0.06)` | 卡片默认 |
| `--shadow-raised` | `0 4px 20px rgba(0,0,0,0.08)` | 弹窗/悬浮/底部栏 |

### 半径与间距

- `--radius-md`: `12px → 14px`
- `--radius-round`: `24px → 22px`
- `--radius-sm`: 保持 `8px`
- 页面外边距: `12px → 16px` 统一
- 卡片间距: `8-10px → 12px` 统一

### 卡片通用样式

所有 section/card 型容器统一：
```css
background: var(--color-card);
border-radius: var(--radius-md);
padding: 16px;
box-shadow: var(--shadow-card);
border: 1px solid var(--color-border);
```

### 字体

- `--font-size-xs`: `11px → 12px`
- 新增 `--font-size-h3: 15px`，用于 section 标题

## 三、微交互

### 按钮统一反馈
```css
transition: all 0.2s ease;
/* :active */ transform: translateY(1px) scale(0.98); box-shadow: var(--shadow-sm);
```

### 卡片点击
```css
/* :active */ transform: scale(0.985); transition: transform 0.15s ease;
```

### 选中态过渡
```css
transition: border-color 0.2s, background 0.2s, transform 0.15s;
```

### 页面切换
App.vue 添加 `<router-view v-slot>` + fade 过渡动画（opacity 0.2s）。

### 底部栏
毛玻璃效果：`background: rgba(255,255,255,0.92); backdrop-filter: blur(12px);`

### Header
双色渐变替代单色：`background: var(--color-primary-gradient);`

## 四、改动范围

### App.vue（全局变量 + 页面过渡）
- 替换所有 CSS 变量值
- 新增变量和 shadow 层级
- 添加 fade 过渡动画

### 首页 (home/index.vue)
- header 渐变 → 使用 `--color-primary-gradient`
- 车型卡片更新阴影和过渡
- 选中卡片边框色自动变绿

### 订单页 (order/list.vue, create.vue, calc.vue)
- 状态标签硬编码色 → 语义化变量
- 卡片阴影 → `--shadow-card`
- 底部栏 → 毛玻璃

### 用户页 (user/profile.vue)
- 用户卡片渐变 → `--color-primary-gradient`
- 菜单项微交互

### 认证页 (auth/login.vue, register.vue)
- 输入框 focus 色自动跟随
- 按钮交互统一

### 司机页 (driver/orders.vue, order-detail.vue)
- 状态横幅渐变调整与绿色协调
- 按钮和卡片统一变量

## 五、不改

- `packages/admin`（管理后台配色独立）
- 页面布局结构
- 组件逻辑
- API 调用

## 六、验收

1. 所有 `packages/web` 页面视觉一致为绿色系
2. 按钮/卡片有统一的微交互反馈
3. 页面切换有 fade 过渡
4. 无硬编码橙色残留（`#ff6b35` / `#e55a2b` / `#fff8f3`）
5. 移动端适配正常
