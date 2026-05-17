<template>
  <div class="home">
    <!-- Header -->
    <header class="header">
      <div class="header-top">
        <div class="location" @click="router.push('/user/profile')">
          <span class="loc-icon">📍</span>
          <span class="loc-text">{{ authStore.isLoggedIn ? (authStore.user?.defaultAddress || '深圳') : '深圳' }}</span>
          <span class="loc-arrow">▾</span>
        </div>
        <div class="header-actions">
          <span v-if="authStore.isDriver" class="action-btn" @click="router.push('/driver/orders')">司机端</span>
          <span v-else-if="!authStore.isLoggedIn" class="action-btn" @click="router.push('/auth/login')">登录</span>
          <template v-else>
            <span v-if="pendingOrderCount > 0" class="action-btn pending-badge" @click="router.push('/order/list?tab=pending')">{{ pendingOrderCount }} 单未支付</span>
            <span v-if="activeOrderCount > 0" class="action-btn active-badge" @click="router.push('/order/list?tab=active')">{{ activeOrderCount }} 单进行中</span>
            <span class="action-btn" @click="router.push('/user/profile')">我的</span>
          </template>
        </div>
      </div>
    </header>

    <!-- Vehicle Detail Card -->
    <div class="vehicle-detail" v-if="selectedDetail">
      <div class="vd-header">
        <span class="vd-icon">{{ selectedDetail.icon || '🚛' }}</span>
        <div class="vd-title">
          <span class="vd-name">{{ selectedDetail.name }}</span>
          <span class="vd-price" v-if="pricingMap[selectedDetail.code]">起步价 ¥{{ pricingMap[selectedDetail.code].basePrice }}</span>
        </div>
      </div>
      <div class="vd-dims">
        <div class="vd-dim">
          <span class="vd-dim-val">{{ selectedDetail.length }}<small>m</small></span>
          <span class="vd-dim-label">厢长</span>
        </div>
        <div class="vd-dim">
          <span class="vd-dim-val">{{ selectedDetail.width }}<small>m</small></span>
          <span class="vd-dim-label">厢宽</span>
        </div>
        <div class="vd-dim">
          <span class="vd-dim-val">{{ selectedDetail.height }}<small>m</small></span>
          <span class="vd-dim-label">厢高</span>
        </div>
        <div class="vd-dim">
          <span class="vd-dim-val">{{ selectedDetail.loadCapacity }}<small>t</small></span>
          <span class="vd-dim-label">载重</span>
        </div>
        <div class="vd-dim">
          <span class="vd-dim-val">{{ selectedDetail.volume }}<small>m³</small></span>
          <span class="vd-dim-label">载方</span>
        </div>
      </div>
    </div>

    <!-- Vehicle Type List -->
    <div class="vehicle-section">
      <h3 class="section-title">选择车型</h3>
      <div class="vehicle-scroll">
        <div v-for="vt in vehicleTypes" :key="vt.code" class="vehicle-card" :class="{ active: selectedType === vt.code }" @click="selectVehicle(vt)">
          <span class="v-name">{{ vt.name }}</span>
        </div>
      </div>
    </div>

    <!-- Address Section -->
    <div class="address-card">
      <div class="addr-route">
        <div class="route-dots">
          <span class="dot start"></span>
          <span class="dot-line"></span>
          <span class="dot end"></span>
        </div>
        <div class="route-inputs">
          <div class="addr-row">
            <input v-model="pickupAddress" placeholder="你在哪里上车？" />
          </div>
          <div class="addr-divider"></div>
          <div class="addr-row">
            <input v-model="dropoffAddress" placeholder="你要去哪里？" />
          </div>
        </div>
        <div class="addr-swap" @click="swapAddress" v-if="pickupAddress || dropoffAddress">
          <span>⇅</span>
        </div>
      </div>
    </div>

    <!-- Spacer -->
    <div style="height:80px"></div>

    <!-- Bottom Bar -->
    <div class="bottom-bar" v-if="authStore.isLoggedIn">
      <div class="bottom-price">
        <span class="bp-hint">{{ !selectedType ? '请选择车型' : !pickupAddress || !dropoffAddress ? '请填写地址' : selectedDetail ? `已选 ${selectedDetail.name}` : '' }}</span>
      </div>
      <button class="btn-order" :disabled="!canOrder" @click="goCalc">
        {{ canOrder ? '下一步' : '请完善信息' }}
      </button>
    </div>
    <div class="bottom-bar" v-else>
      <div class="bottom-price">
        <span class="bp-hint">登录后即可下单</span>
      </div>
      <button class="btn-order" @click="router.push('/auth/login')">登录</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useOrderStore } from '../../stores/order';
import { vehicleApi, orderApi } from '../../utils/api';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const orderStore = useOrderStore();

// Address
const pickupAddress = ref('');
const dropoffAddress = ref('');

// Vehicle
const selectedType = ref('');
const vehicleTypes = ref<any[]>([]);
const pricingMap = ref<Record<string, any>>({});
const activeOrderCount = ref(0);
const pendingOrderCount = ref(0);

const selectedDetail = computed(() => {
  if (!selectedType.value) return null;
  return vehicleTypes.value.find((v: any) => v.code === selectedType.value) || null;
});

const canOrder = computed(() => !!selectedType.value && !!pickupAddress.value.trim() && !!dropoffAddress.value.trim());

onMounted(async () => {
  await orderStore.fetchVehicleTypes();
  vehicleTypes.value = orderStore.vehicleTypes;
  try {
    const pricing: any = await vehicleApi.getPricing();
    if (Array.isArray(pricing)) {
      for (const p of pricing) pricingMap.value[p.vehicleTypeCode] = p;
    }
  } catch (e) { /* ignore */ }

  // 从费用计算页返回时恢复之前的选择，否则默认选中"小厢货"
  const qType = route.query.type as string;
  const qPickup = route.query.pickup as string;
  const qDropoff = route.query.dropoff as string;
  selectedType.value = qType || 'small_van';
  if (qPickup) pickupAddress.value = qPickup;
  if (qDropoff) dropoffAddress.value = qDropoff;

  if (authStore.isLoggedIn) {
    try {
      const orders: any[] = await orderApi.getList();
      pendingOrderCount.value = orders.filter((o: any) => o.status === 'pending').length;
      activeOrderCount.value = orders.filter(
        (o: any) => ['paid', 'dispatched', 'arrived', 'loading', 'delivering'].includes(o.status)
      ).length;
    } catch (e) { /* ignore */ }
  }
});

function selectVehicle(vt: any) {
  selectedType.value = vt.code;
}

function swapAddress() {
  const tmp = pickupAddress.value;
  pickupAddress.value = dropoffAddress.value;
  dropoffAddress.value = tmp;
}

function goCalc() {
  if (!canOrder.value) return;
  router.push(`/order/calc?type=${selectedType.value}&pickup=${encodeURIComponent(pickupAddress.value.trim())}&dropoff=${encodeURIComponent(dropoffAddress.value.trim())}`);
}
</script>

<style scoped>
.home { min-height: 100vh; background: var(--color-bg); }

/* Header */
.header { background: var(--color-primary-gradient); padding: 12px 16px; }
.header-top { display: flex; justify-content: space-between; align-items: center; }
.location { display: flex; align-items: center; gap: 4px; cursor: pointer; }
.loc-icon { font-size: 16px; }
.loc-text { color: #fff; font-size: var(--font-size-lg); font-weight: 600; }
.loc-arrow { color: rgba(255,255,255,0.7); font-size: 12px; margin-left: 2px; }
.action-btn { color: #fff; font-size: var(--font-size-sm); padding: 6px 12px; background: rgba(255,255,255,0.2); border-radius: var(--radius-round); cursor: pointer; white-space: nowrap; }
.active-badge { background: #fff; color: var(--color-primary); font-weight: 600; margin-right: 6px; }
.pending-badge { background: #fff; color: #e74c3c; font-weight: 600; margin-right: 6px; }

/* Vehicle Detail Card */
.vehicle-detail { margin: 12px 12px 0; background: var(--color-card); border-radius: var(--radius-md); padding: 16px; border: 1px solid var(--color-primary); box-shadow: var(--shadow-card); }
.vd-header { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
.vd-icon { font-size: 36px; }
.vd-title { display: flex; flex-direction: column; gap: 2px; }
.vd-name { font-size: var(--font-size-lg); font-weight: 700; color: var(--color-text); }
.vd-price { font-size: var(--font-size-sm); color: var(--color-primary); font-weight: 600; }
.vd-dims { display: flex; gap: 0; }
.vd-dim { flex: 1; text-align: center; }
.vd-dim-val { font-size: var(--font-size-lg); font-weight: 700; color: var(--color-text); display: block; }
.vd-dim-val small { font-size: 11px; color: var(--color-text-muted); font-weight: 400; }
.vd-dim-label { font-size: 11px; color: var(--color-text-muted); margin-top: 2px; display: block; }

/* Vehicle Scroll */
.vehicle-section { padding: 0 16px; margin-top: 12px; }
.section-title { font-size: var(--font-size-h3); font-weight: 700; padding: 0 4px 8px; }
.vehicle-scroll { display: flex; flex-wrap: wrap; gap: 8px; padding: 4px 0 8px; }
.vehicle-card { background: var(--color-card); border-radius: var(--radius-round); padding: 8px 14px; text-align: center; border: 1.5px solid var(--color-border); cursor: pointer; transition: border-color 0.2s, background 0.2s, transform 0.15s; box-shadow: var(--shadow-sm); }
.vehicle-card:active { transform: scale(0.985); }
.vehicle-card.active { border-color: var(--color-primary); background: var(--color-primary-light); }
.v-name { font-size: var(--font-size-sm); font-weight: 600; color: var(--color-text); white-space: nowrap; }

/* Address Card */
.address-card { margin: 12px 16px; background: var(--color-card); border-radius: var(--radius-md); padding: 16px; box-shadow: var(--shadow-card); border: 1px solid var(--color-border); }
.addr-route { display: flex; gap: 10px; align-items: stretch; }
.route-dots { display: flex; flex-direction: column; align-items: center; gap: 0; flex-shrink: 0; padding-top: 10px; width: 20px; }
.dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
.dot.start { background: var(--color-success); box-shadow: 0 0 0 3px rgba(7,193,96,0.2); }
.dot.end { background: var(--color-danger); box-shadow: 0 0 0 3px rgba(229,57,53,0.2); }
.dot-line { width: 2px; flex: 1; background: repeating-linear-gradient(to bottom, #ddd 0px, #ddd 3px, transparent 3px, transparent 6px); min-height: 16px; }
.route-inputs { flex: 1; }
.addr-row input { width: 100%; border: none; padding: 10px 0; font-size: var(--font-size-base); outline: none; background: transparent; }
.addr-row input::placeholder { color: var(--color-text-muted); }
.addr-divider { height: 1px; background: var(--color-divider); }
.addr-swap { display: flex; align-items: center; justify-content: center; width: 32px; cursor: pointer; color: var(--color-text-muted); font-size: 18px; flex-shrink: 0; }

/* Bottom Bar */
.bottom-bar { position: fixed; bottom: 0; left: 0; right: 0; background: rgba(255,255,255,0.92); backdrop-filter: blur(12px); padding: 12px 16px calc(12px + var(--safe-bottom)); display: flex; align-items: center; justify-content: space-between; box-shadow: var(--shadow-raised); z-index: 100; }
.bottom-price { display: flex; flex-direction: column; }
.bp-hint { font-size: var(--font-size-sm); color: var(--color-text-muted); }
.btn-order { background: var(--color-primary-gradient); color: #fff; padding: 12px 32px; border-radius: var(--radius-round); font-size: var(--font-size-lg); font-weight: 600; border: none; cursor: pointer; transition: all 0.2s ease; }
.btn-order:active { transform: translateY(1px) scale(0.98); box-shadow: var(--shadow-sm); }
.btn-order:disabled { background: #ccc; cursor: not-allowed; box-shadow: none; }
</style>
