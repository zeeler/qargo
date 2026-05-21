<template>
  <div class="page">
    <header class="page-header">
      <span class="back-btn" @click="router.back()">←</span>
      <h2>我的优惠券</h2>
      <span></span>
    </header>

    <!-- Redeem -->
    <div class="redeem-bar">
      <input v-model="redeemCode" placeholder="输入优惠券兑换码" />
      <button class="btn-redeem" @click="handleRedeem" :disabled="!redeemCode.trim() || redeeming">
        {{ redeeming ? '兑换中' : '兑换' }}
      </button>
    </div>

    <!-- Empty -->
    <div class="empty-state" v-if="coupons.length === 0 && !loading">
      <span class="empty-icon">🎫</span>
      <p>暂无优惠券</p>
      <p class="sub">输入兑换码领取优惠券</p>
    </div>

    <!-- Coupon List -->
    <div class="coupon-list" v-else>
      <div class="coupon-card" v-for="uc in coupons" :key="uc.id" :class="{ used: uc.status === 'used' }">
        <div class="coupon-left">
          <p class="coupon-value" v-if="uc.coupon.type === 'fixed'">
            <span class="unit">¥</span>{{ Number(uc.coupon.value) }}
          </p>
          <p class="coupon-value" v-else>
            {{ (Number(uc.coupon.value) * 10).toFixed(1) }}<span class="unit">折</span>
          </p>
          <p class="coupon-min" v-if="Number(uc.coupon.minOrderAmount) > 0">满{{ Number(uc.coupon.minOrderAmount) }}可用</p>
        </div>
        <div class="coupon-right">
          <p class="coupon-type" v-if="uc.coupon.type === 'fixed'">满减券</p>
          <p class="coupon-type" v-else>折扣券</p>
          <p class="coupon-date">有效期至 {{ formatDate(uc.coupon.validUntil) }}</p>
          <span class="status-badge used" v-if="uc.status === 'used'">已使用</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { http } from '../../utils/http';

interface Coupon {
  id: string;
  code: string;
  type: 'fixed' | 'percent';
  value: number;
  minOrderAmount: number;
  validFrom: string;
  validUntil: string;
}

interface UserCoupon {
  id: string;
  userId: string;
  couponId: string;
  status: 'unused' | 'used';
  coupon: Coupon;
}

const router = useRouter();
const coupons = ref<UserCoupon[]>([]);
const loading = ref(true);
const redeemCode = ref('');
const redeeming = ref(false);

async function fetchCoupons() {
  loading.value = true;
  try {
    coupons.value = await http.get('/coupon/my');
  } catch (e: any) {
    alert(e.message || '加载失败');
  } finally {
    loading.value = false;
  }
}

async function handleRedeem() {
  if (!redeemCode.value.trim()) return;
  redeeming.value = true;
  try {
    await http.post('/coupon/redeem', { code: redeemCode.value.trim().toUpperCase() });
    alert('兑换成功！');
    redeemCode.value = '';
    await fetchCoupons();
  } catch (e: any) {
    alert(e.message || '兑换失败');
  } finally {
    redeeming.value = false;
  }
}

function formatDate(dateStr: string) {
  return dateStr.split('T')[0];
}

onMounted(fetchCoupons);
</script>

<style scoped>
.page { min-height: 100vh; background: var(--color-bg); }

.page-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #fff; position: sticky; top: 0; z-index: 10; border-bottom: 1px solid var(--color-border); }
.page-header h2 { font-size: var(--font-size-lg); font-weight: 700; }
.back-btn { cursor: pointer; font-size: 20px; color: var(--color-text); width: 32px; }

/* Redeem */
.redeem-bar { display: flex; gap: 8px; padding: 12px 16px; background: #fff; margin-bottom: 8px; }
.redeem-bar input { flex: 1; height: 40px; padding: 0 12px; border: 1px solid var(--color-border); border-radius: 8px; font-size: var(--font-size-base); }
.btn-redeem { padding: 0 20px; height: 40px; background: var(--color-primary-gradient); color: #fff; border: none; border-radius: var(--radius-round); font-size: var(--font-size-sm); cursor: pointer; white-space: nowrap; }
.btn-redeem:disabled { opacity: 0.4; }

/* Empty */
.empty-state { display: flex; flex-direction: column; align-items: center; padding: 60px 16px; }
.empty-icon { font-size: 48px; margin-bottom: 12px; }
.empty-state p { color: var(--color-text); margin-bottom: 4px; }
.sub { font-size: var(--font-size-sm) !important; color: var(--color-text-muted) !important; }

/* Coupon List */
.coupon-list { padding: 0 16px; }
.coupon-card { display: flex; background: #fff; border-radius: var(--radius-md); margin-bottom: 12px; overflow: hidden; }
.coupon-card.used { opacity: 0.55; }
.coupon-left { width: 100px; min-height: 100px; background: var(--color-primary-gradient); display: flex; flex-direction: column; align-items: center; justify-content: center; color: #fff; flex-shrink: 0; }
.coupon-value { font-size: 28px; font-weight: 700; }
.unit { font-size: var(--font-size-sm); }
.coupon-min { font-size: var(--font-size-xs); opacity: 0.8; margin-top: 4px; }
.coupon-right { flex: 1; padding: 16px; display: flex; flex-direction: column; justify-content: center; }
.coupon-type { font-size: var(--font-size-base); font-weight: 600; color: var(--color-text); }
.coupon-date { font-size: var(--font-size-xs); color: var(--color-text-muted); margin-top: 4px; }
.status-badge { display: inline-block; width: fit-content; padding: 2px 8px; border-radius: 8px; font-size: 11px; margin-top: 6px; }
.status-badge.used { background: var(--color-bg); color: var(--color-text-muted); }
</style>
