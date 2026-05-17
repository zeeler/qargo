<template>
  <div class="page">
    <!-- Header -->
    <header class="page-header">
      <span class="back-btn" @click="router.back()">←</span>
      <h2>确认下单</h2>
      <span></span>
    </header>

    <!-- Order Info -->
    <div class="section">
      <div class="sec-title">📋 订单信息</div>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">车型</span>
          <span class="info-value">{{ typeName }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">取货地址</span>
          <span class="info-value addr">{{ pickupAddress }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">收货地址</span>
          <span class="info-value addr">{{ dropoffAddress }}</span>
        </div>
      </div>
    </div>

    <!-- Cargo Info -->
    <div class="section">
      <div class="sec-title">📦 货物信息</div>
      <div class="cargo-types">
        <div v-for="ct in cargoTypes" :key="ct" class="cargo-tag" :class="{ active: cargoType === ct }" @click="cargoType = ct">{{ ct }}</div>
      </div>
      <div class="form-row">
        <div class="form-item half">
          <label class="form-label">预估重量</label>
          <div class="weight-selector">
            <input v-model.number="cargoWeight" type="number" placeholder="重量(吨)" class="input" min="0" step="0.1" />
            <span class="unit">吨</span>
          </div>
        </div>
        <div class="form-item half">
          <label class="form-label">备注</label>
          <input v-model="remark" placeholder="选填" class="input" />
        </div>
      </div>
    </div>

    <!-- Contact Info -->
    <div class="section">
      <div class="sec-title">👤 联系人信息</div>
      <div class="form-row">
        <div class="form-item half">
          <label class="form-label">取货联系人</label>
          <input v-model="pickupContact" placeholder="姓名" class="input" />
        </div>
        <div class="form-item half">
          <label class="form-label">联系电话</label>
          <input v-model="pickupPhone" placeholder="手机号" type="tel" class="input" maxlength="11" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-item half">
          <label class="form-label">收货联系人</label>
          <input v-model="dropoffContact" placeholder="姓名" class="input" />
        </div>
        <div class="form-item half">
          <label class="form-label">联系电话</label>
          <input v-model="dropoffPhone" placeholder="手机号" type="tel" class="input" maxlength="11" />
        </div>
      </div>
    </div>

    <!-- Tip -->
    <div class="section">
      <div class="sec-title">💰 加价小费（选填）</div>
      <div class="tip-section">
        <div class="tip-slider-wrap">
          <input type="range" v-model.number="additionalFee" min="0" max="50" step="5" class="tip-slider" />
          <div class="tip-marks">
            <span v-for="t in [0, 10, 20, 30, 40, 50]" :key="t" class="tip-mark" :class="{ active: additionalFee >= t }" @click="additionalFee = t">¥{{ t }}</span>
          </div>
        </div>
        <span class="tip-value" v-if="additionalFee > 0">+¥{{ additionalFee }}</span>
      </div>
    </div>

    <!-- Payment Method -->
    <div class="section">
      <div class="sec-title">💳 支付方式</div>
      <div class="payment-options">
        <div class="payment-option" :class="{ active: pm === 'wechat' }" @click="pm = 'wechat'">
          <span class="pm-icon">💚</span>
          <span class="pm-name">微信支付</span>
          <span class="pm-check" v-if="pm === 'wechat'">✓</span>
        </div>
        <div class="payment-option" :class="{ active: pm === 'alipay' }" @click="pm = 'alipay'">
          <span class="pm-icon">💙</span>
          <span class="pm-name">支付宝</span>
          <span class="pm-check" v-if="pm === 'alipay'">✓</span>
        </div>
      </div>
    </div>

    <!-- Price Summary -->
    <div class="section price-summary-section">
      <div class="price-row">
        <span>起步价</span>
        <span>¥{{ price?.basePrice || 0 }}</span>
      </div>
      <div class="price-row" v-if="price?.distancePrice">
        <span>里程费</span>
        <span>¥{{ price.distancePrice }}</span>
      </div>
      <div class="price-row" v-if="additionalFee > 0">
        <span>加价小费</span>
        <span class="tip-text">+¥{{ additionalFee }}</span>
      </div>
      <div class="price-row total-row">
        <span>合计</span>
        <span class="total-price">¥{{ computedTotal }}</span>
      </div>
    </div>

    <div style="height:80px"></div>

    <!-- Bottom Submit -->
    <div class="bottom-bar">
      <div class="bottom-price">
        <span class="bp-label">合计</span>
        <span class="bp-num">¥{{ computedTotal }}</span>
      </div>
      <button class="btn-submit" @click="handleCreate">确认下单</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useOrderStore } from '../../stores/order';
import { useAuthStore } from '../../stores/auth';

const route = useRoute();
const router = useRouter();
const orderStore = useOrderStore();
const authStore = useAuthStore();

const typeName = ref(route.query.typeName as string || '');
const pickupAddress = ref(route.query.pickup as string || '');
const dropoffAddress = ref(route.query.dropoff as string || '');

const cargoTypes = ['普通货物', '家具家电', '建材物料', '食品饮料', '其他'];
const cargoType = ref('普通货物');
const cargoWeight = ref<number | null>(null);
const remark = ref('');

const pickupContact = ref(authStore.user?.name || '');
const pickupPhone = ref('');
const dropoffContact = ref('');
const dropoffPhone = ref('');

const additionalFee = ref(0);
const pm = ref('wechat');
const price = ref<any>(null);

const computedTotal = computed(() => {
  return (price.value?.totalPrice || 0) + (additionalFee.value || 0);
});

onMounted(async () => {
  try {
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
    price.value = await orderStore.calculatePrice({
      vehicleTypeCode: route.query.type as string,
      pickupLng: pickup.lng, pickupLat: pickup.lat,
      dropoffLng: dropoff.lng, dropoffLat: dropoff.lat,
    });
  } catch (e) {
    price.value = { basePrice: 100, distancePrice: 0, totalPrice: 100 };
  }
});

async function handleCreate() {
  if (!pickupContact.value || !pickupPhone.value) { alert('请填写取货联系人信息'); return; }
  if (pickupPhone.value.length !== 11) { alert('请输入正确的手机号'); return; }
  try {
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
    await orderStore.createOrder({
      vehicleTypeCode: route.query.type as string,
      pickupAddress: pickupAddress.value, pickupLng: pickup.lng, pickupLat: pickup.lat,
      pickupContactName: pickupContact.value, pickupContactPhone: pickupPhone.value,
      dropoffAddress: dropoffAddress.value, dropoffLng: dropoff.lng, dropoffLat: dropoff.lat,
      dropoffContactName: dropoffContact.value || pickupContact.value,
      dropoffContactPhone: dropoffPhone.value || pickupPhone.value,
      userAdditionalFee: additionalFee.value, remark: `${cargoType.value}${cargoWeight.value ? ' ' + cargoWeight.value + '吨' : ''} ${remark.value}`.trim() || undefined,
      paymentMethod: pm.value,
    });
    router.push(`/order/detail?id=${orderStore.currentOrder?.id}`);
  } catch (e: any) {
    alert(e?.response?.data?.message || e?.message || '下单失败');
  }
}
</script>

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
.input { width: 100%; height: 42px; background: var(--color-bg); border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: 0 12px; font-size: var(--font-size-sm); outline: none; transition: border-color 0.2s; }
.input:focus { border-color: var(--color-primary); background: var(--color-card); }
.weight-selector { position: relative; }
.weight-selector .input { padding-right: 32px; }
.weight-selector .unit { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: var(--font-size-sm); color: var(--color-text-muted); }

/* Tip Slider */
.tip-section { display: flex; align-items: center; gap: 12px; }
.tip-slider-wrap { flex: 1; }
.tip-slider { width: 100%; height: 6px; -webkit-appearance: none; background: linear-gradient(to right, var(--color-primary), var(--color-primary) var(--p), #e0e0e0 var(--p)); border-radius: 3px; outline: none; }
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
