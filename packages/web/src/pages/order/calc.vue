<template>
  <div class="page">
    <!-- Header -->
    <header class="page-header">
      <span class="back-btn" @click="goBack">←</span>
      <h2>费用计算</h2>
      <span></span>
    </header>

    <!-- Card 1: Route + Vehicle -->
    <div class="card route-card">
      <div class="route-line">
        <div class="route-stop">
          <span class="route-dot pickup"></span>
          <span class="route-text">{{ pickup }}</span>
        </div>
        <div class="route-divider"></div>
        <div class="route-stop">
          <span class="route-dot dropoff"></span>
          <span class="route-text">{{ dropoff }}</span>
        </div>
      </div>
      <div class="route-vehicle" v-if="vehicleInfo">
        <span class="rv-icon">{{ vehicleInfo.icon }}</span>
        <span class="rv-name">{{ vehicleInfo.name }}</span>
        <span class="rv-size" v-if="vehicleInfo.length">厢长{{ vehicleInfo.length }}m | 载重{{ vehicleInfo.loadCapacity }}t | {{ vehicleInfo.volume }}m³</span>
      </div>
    </div>

    <!-- Card 2: Fee Options -->
    <div class="card fee-card">
      <div class="fee-row" :class="{ selected: mode === 'platform' }" @click="selectPlatform">
        <div class="fee-left">
          <span class="fee-mode">快车</span>
          <span class="fee-desc">平台计价</span>
        </div>
        <div class="fee-right">
          <span class="fee-price">¥{{ platformPrice.totalPrice.toFixed(2) }}</span>
          <span class="fee-radio" :class="{ checked: mode === 'platform' }"></span>
        </div>
      </div>
      <div class="fee-divider"></div>
      <div class="fee-row" :class="{ selected: mode === 'bid' }" @click="onBidRowClick">
        <div class="fee-left">
          <span class="fee-mode">用户出价</span>
          <span class="fee-desc">自定义出价</span>
        </div>
        <div class="fee-right">
          <span class="fee-price" v-if="bidAmount">¥{{ bidAmount.toFixed(2) }}</span>
          <span class="fee-placeholder" v-else>-</span>
          <span class="fee-edit" v-if="mode === 'bid' && bidAmount" @click.stop="showBidModal = true">修改</span>
          <span class="fee-radio" :class="{ checked: mode === 'bid' }"></span>
        </div>
      </div>
    </div>

    <!-- Spacer -->
    <div style="height:100px"></div>

    <!-- Bottom Bar -->
    <div class="bottom-bar">
      <div class="bottom-price">
        <span class="bp-label">合计</span>
        <span class="bp-total">¥{{ selectedPrice.toFixed(2) }}</span>
      </div>
      <button class="btn-confirm" :disabled="creating" @click="handleCreate">
        {{ creating ? '下单中...' : '确认下单' }}
      </button>
    </div>

    <!-- Bid Modal -->
    <div class="dialog-overlay" v-if="showBidModal" @click.self="showBidModal = false">
      <div class="dialog bid-dialog">
        <h3>输入您的出价</h3>
        <div class="bid-input-row">
          <span class="bid-yuan">¥</span>
          <input type="number" v-model="bidInput" placeholder="请输入出价金额" class="bid-input" @keyup.enter="confirmBid" />
        </div>
        <p class="bid-min-hint">最低出价：¥{{ minBid.toFixed(2) }}（平台价的八折）</p>
        <div class="dialog-actions">
          <button class="btn-cancel" @click="showBidModal = false">取消</button>
          <button class="btn-ok" :disabled="!isBidValid" @click="confirmBid">确定</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useOrderStore } from '../../stores/order';
import { vehicleApi } from '../../utils/api';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const orderStore = useOrderStore();

// Query params
const type = (route.query.type as string) || '';
const pickup = (route.query.pickup as string) || '';
const dropoff = (route.query.dropoff as string) || '';

// Vehicle info
const vehicleInfo = ref<any>(null);

// Price
const platformPrice = ref({ totalPrice: 0, basePrice: 0, distancePrice: 0, surgeFee: 0 });

// Mode: 'platform' | 'bid'
const mode = ref<'platform' | 'bid'>('platform');
const bidAmount = ref<number>(0);
const bidInput = ref<number | null>(null);
const showBidModal = ref(false);
const creating = ref(false);

const minBid = computed(() => {
  const p = platformPrice.value.totalPrice * 0.8;
  return Math.round(p * 100) / 100;
});

const isBidValid = computed(() => {
  return bidInput.value !== null && bidInput.value >= minBid.value;
});

const selectedPrice = computed(() => {
  if (mode.value === 'bid' && bidAmount.value > 0) return bidAmount.value;
  return platformPrice.value.totalPrice;
});

onMounted(async () => {
  // Validate params
  if (!type || !pickup || !dropoff) {
    router.replace('/');
    return;
  }

  // Load vehicle types
  if (orderStore.vehicleTypes.length === 0) {
    await orderStore.fetchVehicleTypes();
  }
  vehicleInfo.value = orderStore.vehicleTypes.find((v: any) => v.code === type) || null;

  // Calculate platform price with default Shenzhen center coordinates
  try {
    const result = await vehicleApi.calculatePrice({
      vehicleTypeCode: type,
      pickupLng: 114.06,
      pickupLat: 22.54,
      dropoffLng: 114.06,
      dropoffLat: 22.54,
    });
    platformPrice.value = {
      totalPrice: Math.round(result.totalPrice),
      basePrice: result.basePrice,
      distancePrice: result.distancePrice,
      surgeFee: result.surgeFee,
    };
  } catch (e) {
    // Fallback
    platformPrice.value = { totalPrice: 100, basePrice: 80, distancePrice: 20, surgeFee: 0 };
  }
});

function selectPlatform() {
  mode.value = 'platform';
}

function onBidRowClick() {
  if (!bidAmount.value) {
    showBidModal.value = true;
  } else {
    mode.value = 'bid';
  }
}

function confirmBid() {
  if (!isBidValid.value) return;
  bidAmount.value = bidInput.value!;
  mode.value = 'bid';
  showBidModal.value = false;
}

async function handleCreate() {
  if (creating.value) return;
  creating.value = true;

  const userAdditionalFee = mode.value === 'bid'
    ? bidAmount.value - platformPrice.value.totalPrice
    : 0;

  try {
    const order = await orderStore.createOrder({
      vehicleTypeCode: type,
      pickupAddress: pickup,
      pickupLng: 114.06,
      pickupLat: 22.54,
      pickupContactName: authStore.user?.name || '用户',
      pickupContactPhone: authStore.user?.phone || '',
      dropoffAddress: dropoff,
      dropoffLng: 114.06,
      dropoffLat: 22.54,
      dropoffContactName: authStore.user?.name || '用户',
      dropoffContactPhone: authStore.user?.phone || '',
      userAdditionalFee,
      paymentMethod: 'wechat',
    });
    router.replace(`/order/detail?id=${order.id}`);
  } catch (e: any) {
    alert(e?.response?.data?.message || e?.message || '创建订单失败');
  }
  creating.value = false;
}

function goBack() {
  router.push(`/?type=${type}&pickup=${encodeURIComponent(pickup)}&dropoff=${encodeURIComponent(dropoff)}`);
}
</script>

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
