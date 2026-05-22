<template>
  <div class="page">
    <!-- Header -->
    <header class="page-header">
      <span class="back-btn" @click="router.push('/')">←</span>
      <h2>我的</h2>
      <span class="settings-btn" @click="router.push('/auth/login')" v-if="!authStore.isLoggedIn">登录</span>
      <span v-else></span>
    </header>

    <!-- User Card -->
    <div class="user-card" v-if="authStore.isLoggedIn">
      <div class="avatar">{{ (authStore.user?.name || '用户')[0] }}</div>
      <div class="user-info">
        <h3>{{ authStore.user?.name || '用户' }}</h3>
        <p>{{ authStore.user?.phone || '' }}</p>
        <span v-if="authStore.isDriver" class="role-badge driver">司机</span>
        <span v-else class="role-badge user">普通用户</span>
      </div>
    </div>
    <div class="user-card" v-else @click="router.push('/auth/login')">
      <div class="avatar placeholder">👤</div>
      <div class="user-info">
        <h3>点击登录</h3>
        <p>登录后享受更多服务</p>
      </div>
      <span class="arrow-right">›</span>
    </div>

    <!-- Menu Group 1: Orders -->
    <div class="menu-group">
      <div class="menu-group-title">我的服务</div>
      <div class="menu-item" @click="router.push('/order/list')">
        <span class="menu-icon">📋</span>
        <span class="menu-label">我的订单</span>
        <span class="menu-arrow">›</span>
      </div>
      <div class="menu-item" v-if="authStore.isDriver" @click="router.push('/driver/orders')">
        <span class="menu-icon">🚛</span>
        <span class="menu-label">司机接单</span>
        <span class="menu-arrow">›</span>
      </div>
      <div class="menu-item" v-if="!authStore.isDriver" @click="router.push('/driver/register')">
        <span class="menu-icon">👨‍✈️</span>
        <span class="menu-label">成为司机</span>
        <span class="menu-arrow">›</span>
      </div>
    </div>

    <!-- Menu Group 2: Wallet & Rewards -->
    <div class="menu-group">
      <div class="menu-group-title">资产与优惠</div>
      <div class="menu-item" @click="router.push('/user/wallet')">
        <span class="menu-icon">💰</span>
        <span class="menu-label">我的钱包</span>
        <span class="menu-value">¥{{ walletBalance.toFixed(2) }}</span>
        <span class="menu-arrow">›</span>
      </div>
      <div class="menu-item" @click="router.push('/user/coupon')">
        <span class="menu-icon">🎫</span>
        <span class="menu-label">优惠券</span>
        <span class="menu-value">{{ couponCount }}张</span>
        <span class="menu-arrow">›</span>
      </div>
      <div class="menu-item" @click="router.push('/user/points')">
        <span class="menu-icon">⭐</span>
        <span class="menu-label">积分中心</span>
        <span class="menu-value">{{ pointsBalance }}分</span>
        <span class="menu-arrow">›</span>
      </div>
    </div>

    <!-- Menu Group 3: Tools -->
    <div class="menu-group">
      <div class="menu-group-title">常用工具</div>
      <div class="menu-item" @click="router.push('/user/addresses')">
        <span class="menu-icon">🏷️</span>
        <span class="menu-label">常用地址</span>
        <span class="menu-arrow">›</span>
      </div>
      <div class="menu-item" @click="router.push('/user/invoice')">
        <span class="menu-icon">📊</span>
        <span class="menu-label">发票管理</span>
        <span class="menu-arrow">›</span>
      </div>
      <div class="menu-item" @click="router.push('/user/service')">
        <span class="menu-icon">🎧</span>
        <span class="menu-label">客服中心</span>
        <span class="menu-arrow">›</span>
      </div>
      <div class="menu-item" @click="router.push('/user/settings')">
        <span class="menu-icon">⚙️</span>
        <span class="menu-label">设置</span>
        <span class="menu-arrow">›</span>
      </div>
    </div>

    <!-- Logout -->
    <div class="logout-section" v-if="authStore.isLoggedIn">
      <button class="btn-logout" @click="handleLogout">退出登录</button>
    </div>

    <!-- Version -->
    <p class="version">快货 v1.0.0</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { http } from '../../utils/http';

const router = useRouter();
const authStore = useAuthStore();
const walletBalance = ref(0);
const couponCount = ref(0);
const pointsBalance = ref(0);

async function fetchWalletBalance() {
  try {
    const wallet = await http.get('/wallet');
    walletBalance.value = Number(wallet.balance);
  } catch { /* ignore */ }
}

async function fetchCouponCount() {
  try {
    const coupons = await http.get('/coupon/my');
    couponCount.value = (coupons as any[]).filter((c: any) => c.status === 'unused').length;
  } catch { /* ignore */ }
}

async function fetchPointsBalance() {
  try {
    const p = await http.get('/points');
    pointsBalance.value = p.balance;
  } catch { /* ignore */ }
}

function showComingSoon(name: string) {
  alert(`${name}功能开发中，敬请期待`);
}

function handleLogout() {
  if (confirm('确定退出登录？')) authStore.logout();
}

onMounted(() => {
  fetchWalletBalance();
  fetchCouponCount();
  fetchPointsBalance();
});
</script>

<style scoped>
.page { min-height: 100vh; background: var(--color-bg); }

/* Header */
.page-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #fff; position: sticky; top: 0; z-index: 10; border-bottom: 1px solid var(--color-border); }
.page-header h2 { font-size: var(--font-size-lg); font-weight: 700; }
.back-btn { cursor: pointer; font-size: 20px; color: var(--color-text); width: 32px; }
.settings-btn { font-size: var(--font-size-sm); color: var(--color-primary); cursor: pointer; }

/* User Card */
.user-card { margin: 12px 16px; background: var(--color-primary-gradient); border-radius: var(--radius-md); padding: 24px 16px; display: flex; align-items: center; gap: 16px; cursor: pointer; }
.avatar { width: 60px; height: 60px; border-radius: 50%; background: rgba(255,255,255,0.25); color: #fff; font-size: 26px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.avatar.placeholder { font-size: 30px; background: rgba(255,255,255,0.15); }
.user-info { flex: 1; color: #fff; }
.user-info h3 { font-size: var(--font-size-xl); margin: 0 0 4px; }
.user-info p { font-size: var(--font-size-sm); opacity: 0.85; margin: 0; }
.role-badge { display: inline-block; padding: 2px 10px; border-radius: 10px; font-size: 11px; margin-top: 4px; }
.role-badge.driver { background: rgba(255,255,255,0.25); }
.role-badge.user { background: rgba(255,255,255,0.15); }
.arrow-right { color: rgba(255,255,255,0.6); font-size: 24px; flex-shrink: 0; }

/* Menu Groups */
.menu-group { background: var(--color-card); margin: 0 0 8px; padding: 0 16px; }
.menu-group-title { padding: 12px 16px 6px; font-size: var(--font-size-xs); color: var(--color-text-muted); }
.menu-item { display: flex; align-items: center; padding: 14px 0; gap: 12px; cursor: pointer; border-bottom: 1px solid var(--color-divider); transition: background 0.15s; }
.menu-item:active { background: var(--color-bg); }
.menu-item:last-child { border-bottom: none; }
.menu-icon { font-size: 20px; flex-shrink: 0; }
.menu-label { font-size: var(--font-size-base); color: var(--color-text); flex: 1; }
.menu-value { font-size: var(--font-size-sm); color: var(--color-text-muted); }
.menu-arrow { color: var(--color-border); font-size: 18px; flex-shrink: 0; }

/* Logout */
.logout-section { padding: 20px 12px; }
.btn-logout { width: 100%; height: 48px; background: var(--color-card); color: var(--color-danger); border: 1px solid var(--color-border); border-radius: var(--radius-round); font-size: var(--font-size-base); cursor: pointer; transition: all 0.2s ease; }
.btn-logout:active { background: #fce4ec; transform: scale(0.98); }
.version { text-align: center; font-size: var(--font-size-xs); color: var(--color-text-muted); padding: 20px 0 40px; }
</style>
