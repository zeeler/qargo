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
          <span v-else class="action-btn" @click="router.push('/user/profile')">我的</span>
        </div>
      </div>
    </header>

    <!-- Service Type Tabs -->
    <div class="service-tabs">
      <div v-for="s in serviceTypes" :key="s.key" class="service-tab" :class="{ active: activeService === s.key }" @click="activeService = s.key">
        <span class="svc-icon">{{ s.icon }}</span>
        <span class="svc-name">{{ s.name }}</span>
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
            <input v-model="pickupAddress" placeholder="你在哪里上车？" @input="onPickupInput" @focus="pickupFocused = true" @blur="pickupFocused = false" />
          </div>
          <div class="addr-divider"></div>
          <div class="addr-row">
            <input v-model="dropoffAddress" placeholder="你要去哪里？" @input="onDropoffInput" @focus="dropoffFocused = true" @blur="dropoffFocused = false" />
          </div>
        </div>
        <div class="addr-swap" @click="swapAddress" v-if="pickupAddress || dropoffAddress">
          <span>⇅</span>
        </div>
      </div>
      <!-- Suggestions -->
      <div class="suggestions" v-if="(pickupFocused && pickupSuggestions.length) || (dropoffFocused && dropoffSuggestions.length)">
        <div v-for="item in (pickupFocused ? pickupSuggestions : dropoffSuggestions)" :key="item.id" class="suggestion-item" @mousedown.prevent="pickupFocused ? selectPickup(item) : selectDropoff(item)">
          <span class="sug-icon">📍</span>
          <div class="sug-info">
            <span class="sug-name">{{ item.name }}</span>
            <span class="sug-addr">{{ item.address }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Vehicle Type Selection -->
    <div class="vehicle-section">
      <h3 class="section-title">选择车型</h3>
      <div class="vehicle-grid">
        <div v-for="vt in vehicleTypes" :key="vt.code" class="vehicle-card" :class="{ active: selectedType === vt.code }" @click="selectVehicle(vt)">
          <span class="v-icon">{{ getVehicleIcon(vt) }}</span>
          <span class="v-name">{{ vt.name }}</span>
          <span class="v-size" v-if="getVehicleSize(vt)">{{ getVehicleSize(vt) }}</span>
          <span class="v-price" v-if="pricingMap[vt.code]">¥{{ pricingMap[vt.code]?.basePrice || '--' }}起</span>
        </div>
      </div>
    </div>

    <!-- Price Estimate -->
    <div class="price-card" v-if="selectedType && priceResult">
      <div class="price-header">
        <span class="price-label">预估价格</span>
        <span class="price-distance">{{ priceResult.distanceKm }} km</span>
      </div>
      <div class="price-breakdown">
        <div class="p-row">
          <span>{{ selectedTypeName }} 起步价（含{{ pricingMap[selectedType]?.includedKm || 5 }}km）</span>
          <span>¥{{ priceResult.basePrice }}</span>
        </div>
        <div class="p-row" v-if="priceResult.distancePrice > 0">
          <span>里程费（超出部分）</span>
          <span>¥{{ priceResult.distancePrice }}</span>
        </div>
        <div class="p-row" v-if="priceResult.surgeFee > 0">
          <span>高峰期加价</span>
          <span style="color:var(--color-warning)">¥{{ priceResult.surgeFee }}</span>
        </div>
      </div>
      <div class="price-total">
        <span>合计</span>
        <span class="total-num">¥{{ priceResult.totalPrice }}</span>
      </div>
    </div>

    <!-- Spacer for bottom bar -->
    <div style="height:80px"></div>

    <!-- Bottom Bar -->
    <div class="bottom-bar" v-if="authStore.isLoggedIn">
      <div class="bottom-price" v-if="priceResult">
        <span class="bp-total">¥{{ priceResult.totalPrice }}</span>
        <span class="bp-hint" v-if="selectedType">已选 {{ selectedTypeName }}</span>
      </div>
      <div class="bottom-price" v-else>
        <span class="bp-hint">请选择车型</span>
      </div>
      <button class="btn-order" :disabled="!canOrder" @click="goCreateOrder">立即下单</button>
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
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useOrderStore } from '../../stores/order';
import { vehicleApi } from '../../utils/api';

const router = useRouter();
const authStore = useAuthStore();
const orderStore = useOrderStore();

// Service types
const serviceTypes = [
  { key: 'freight', name: '货运', icon: '🚛' },
  { key: 'moving', name: '搬家', icon: '📦' },
  { key: 'bulky', name: '大件', icon: '🏗️' },
];
const activeService = ref('freight');

// Address
const pickupAddress = ref('');
const dropoffAddress = ref('');
const pickupFocused = ref(false);
const dropoffFocused = ref(false);
const pickupSuggestions = ref<any[]>([]);
const dropoffSuggestions = ref<any[]>([]);

// Vehicle
const selectedType = ref('');
const selectedTypeName = ref('');
const vehicleTypes = ref<any[]>([]);
const pricingMap = ref<Record<string, any>>({});
const priceResult = ref<any>(null);
const calculating = ref(false);

const canOrder = computed(() => selectedType.value && pickupAddress.value && dropoffAddress.value);

onMounted(async () => {
  await orderStore.fetchVehicleTypes();
  vehicleTypes.value = orderStore.vehicleTypes;
  try {
    const pricing: any = await vehicleApi.getPricing();
    if (Array.isArray(pricing)) {
      for (const p of pricing) pricingMap.value[p.vehicleTypeCode] = p;
    }
  } catch (e) { /* pricing from DB may not exist yet */ }
});

// Address logic
function onPickupInput() {
  pickupSuggestions.value = pickupAddress.value.length > 1
    ? [
        { id: '1', name: '深圳北站', address: '龙华区致远中路18号' },
        { id: '2', name: '华强北商业街', address: '福田区华强北路1019号' },
        { id: '3', name: '福田口岸', address: '福田区福田口岸地铁站' },
      ]
    : [];
}
function onDropoffInput() {
  dropoffSuggestions.value = dropoffAddress.value.length > 1
    ? [
        { id: '4', name: '南山科技园', address: '南山区科技南路16号' },
        { id: '5', name: '福田保税区', address: '福田区红花路208号' },
        { id: '6', name: '罗湖商业城', address: '罗湖区人民南路3002号' },
      ]
    : [];
}
function selectPickup(item: any) {
  pickupAddress.value = item.name;
  pickupSuggestions.value = [];
  pickupFocused.value = false;
}
function selectDropoff(item: any) {
  dropoffAddress.value = item.name;
  dropoffSuggestions.value = [];
  dropoffFocused.value = false;
}
function swapAddress() {
  const tmp = pickupAddress.value;
  pickupAddress.value = dropoffAddress.value;
  dropoffAddress.value = tmp;
  // re-calculate if both addresses and a vehicle selected
  if (selectedType.value && pickupAddress.value && dropoffAddress.value) {
    calculatePrice();
  }
}

// Vehicle selection
async function selectVehicle(vt: any) {
  selectedType.value = vt.code;
  selectedTypeName.value = vt.name;
  if (pickupAddress.value && dropoffAddress.value) {
    await calculatePrice();
  }
}

async function calculatePrice() {
  if (!selectedType.value || calculating.value) return;
  calculating.value = true;
  try {
    // Use mock coordinates based on address
    const coords: Record<string, { lng: number; lat: number }> = {
      '深圳北站': { lng: 114.03, lat: 22.61 },
      '华强北商业街': { lng: 114.09, lat: 22.55 },
      '福田口岸': { lng: 114.07, lat: 22.52 },
      '南山科技园': { lng: 113.95, lat: 22.53 },
      '福田保税区': { lng: 114.05, lat: 22.51 },
      '罗湖商业城': { lng: 114.12, lat: 22.54 },
    };
    const pickup = coords[pickupAddress.value] || { lng: 114.06, lat: 22.54 };
    const dropoff = coords[dropoffAddress.value] || { lng: 113.95, lat: 22.53 };
    priceResult.value = await vehicleApi.calculatePrice({
      vehicleTypeCode: selectedType.value,
      pickupLng: pickup.lng,
      pickupLat: pickup.lat,
      dropoffLng: dropoff.lng,
      dropoffLat: dropoff.lat,
    });
  } catch (e) {
    console.error('Price calculation failed', e);
  }
  calculating.value = false;
}

function getVehicleIcon(vt: any) {
  const icons: Record<string, string> = {
    mini_truck: '🛵', small_flatbed: '🛻', small_van: '🚐',
    m3_8: '🚚', medium_truck: '🚛', m5_2: '🚛', m6_2: '🚛',
    m6_8: '🚛', m7_6: '🚛', m8_2: '🚛', m8_6: '🚛',
    m9_6: '🚛', m11_7: '🚛', m12_5: '🚛', m13: '🚛',
    m13_7: '🚛', m15: '🚛', m16: '🚛', m17_5: '🚛',
    reefer: '🧊',
  };
  return icons[vt.code] || vt.icon || '🚛';
}

function getVehicleSize(vt: any) {
  const sizes: Record<string, string> = {
    mini_truck: '1.5×1.0m', small_flatbed: '2.4×1.5m', small_van: '2.5×1.5m',
    m3_8: '3.8×1.9m', medium_truck: '4.2×2.1m', m5_2: '5.2×2.2m',
    m6_2: '6.2×2.3m', m6_8: '6.8×2.4m', m7_6: '7.6×2.4m',
    m8_2: '8.2×2.4m', m8_6: '8.6×2.4m', m9_6: '9.6×2.4m',
    m11_7: '11.7×2.5m', m12_5: '12.5×2.5m', m13: '13×2.5m',
    m13_7: '13.7×2.5m', m15: '15×2.5m', m16: '16×2.5m',
    m17_5: '17.5×2.8m', reefer: '9.6×2.4m',
  };
  return sizes[vt.code] || '';
}

function goCreateOrder() {
  if (!canOrder.value) return;
  router.push(`/order/create?type=${selectedType.value}&typeName=${encodeURIComponent(selectedTypeName.value)}&pickup=${encodeURIComponent(pickupAddress.value)}&dropoff=${encodeURIComponent(dropoffAddress.value)}`);
}
</script>

<style scoped>
.home { min-height: 100vh; background: var(--color-bg); }

/* Header */
.header { background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark)); padding: 12px 16px; }
.header-top { display: flex; justify-content: space-between; align-items: center; }
.location { display: flex; align-items: center; gap: 4px; cursor: pointer; }
.loc-icon { font-size: 16px; }
.loc-text { color: #fff; font-size: var(--font-size-lg); font-weight: 600; }
.loc-arrow { color: rgba(255,255,255,0.7); font-size: 12px; margin-left: 2px; }
.action-btn { color: #fff; font-size: var(--font-size-sm); padding: 6px 12px; background: rgba(255,255,255,0.2); border-radius: var(--radius-round); cursor: pointer; }

/* Service Tabs */
.service-tabs { display: flex; gap: 12px; padding: 12px 16px; background: #fff; margin-bottom: 8px; }
.service-tab { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px 16px; border-radius: var(--radius-sm); cursor: pointer; opacity: 0.6; transition: all 0.2s; }
.service-tab.active { opacity: 1; }
.service-tab.active .svc-name { color: var(--color-primary); font-weight: 600; }
.svc-icon { font-size: 24px; }
.svc-name { font-size: var(--font-size-sm); color: var(--color-text); }

/* Address Card */
.address-card { margin: 0 12px 12px; background: #fff; border-radius: var(--radius-md); padding: 16px; position: relative; box-shadow: var(--shadow-sm); }
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

/* Suggestions */
.suggestions { position: absolute; left: 46px; right: 16px; top: 70px; background: #fff; border-radius: var(--radius-sm); box-shadow: var(--shadow-md); z-index: 20; max-height: 200px; overflow-y: auto; }
.suggestion-item { display: flex; align-items: center; gap: 10px; padding: 12px 14px; cursor: pointer; border-bottom: 1px solid var(--color-divider); }
.suggestion-item:last-child { border-bottom: none; }
.sug-icon { font-size: 16px; flex-shrink: 0; }
.sug-info { display: flex; flex-direction: column; }
.sug-name { font-size: var(--font-size-base); color: var(--color-text); }
.sug-addr { font-size: var(--font-size-xs); color: var(--color-text-muted); margin-top: 2px; }

/* Vehicle Section */
.vehicle-section { padding: 0 12px; }
.section-title { font-size: var(--font-size-lg); font-weight: 700; padding: 12px 4px 8px; }
.vehicle-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.vehicle-card { background: #fff; border-radius: var(--radius-md); padding: 14px 8px; text-align: center; border: 2px solid transparent; cursor: pointer; transition: all 0.15s; display: flex; flex-direction: column; align-items: center; gap: 4px; }
.vehicle-card:active { transform: scale(0.97); }
.vehicle-card.active { border-color: var(--color-primary); background: var(--color-primary-light); }
.v-icon { font-size: 32px; line-height: 1; }
.v-name { font-size: var(--font-size-sm); font-weight: 600; color: var(--color-text); }
.v-size { font-size: var(--font-size-xs); color: var(--color-text-muted); }
.v-price { font-size: var(--font-size-sm); color: var(--color-primary); font-weight: 600; }

/* Price Card */
.price-card { margin: 12px; background: #fff; border-radius: var(--radius-md); padding: 16px; box-shadow: var(--shadow-sm); }
.price-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.price-label { font-size: var(--font-size-base); font-weight: 600; }
.price-distance { font-size: var(--font-size-sm); color: var(--color-text-secondary); background: var(--color-bg); padding: 2px 10px; border-radius: 10px; }
.price-breakdown { margin-bottom: 12px; }
.p-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: var(--font-size-sm); color: var(--color-text-secondary); }
.price-total { display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid var(--color-divider); }
.price-total span:first-child { font-size: var(--font-size-base); font-weight: 600; }
.total-num { font-size: var(--font-size-xl); color: var(--color-primary); font-weight: 700; }

/* Bottom Bar */
.bottom-bar { position: fixed; bottom: 0; left: 0; right: 0; background: #fff; padding: 12px 16px calc(12px + var(--safe-bottom)); display: flex; align-items: center; justify-content: space-between; box-shadow: 0 -2px 12px rgba(0,0,0,0.06); z-index: 100; }
.bottom-price { display: flex; flex-direction: column; }
.bp-total { font-size: var(--font-size-xl); color: var(--color-primary); font-weight: 700; }
.bp-hint { font-size: var(--font-size-sm); color: var(--color-text-muted); }
.btn-order { background: var(--color-primary); color: #fff; padding: 12px 32px; border-radius: var(--radius-round); font-size: var(--font-size-lg); font-weight: 600; border: none; cursor: pointer; transition: all 0.15s; }
.btn-order:active { transform: scale(0.97); background: var(--color-primary-dark); }
.btn-order:disabled { background: #ccc; cursor: not-allowed; }
</style>
