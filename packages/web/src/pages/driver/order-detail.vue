<template>
  <div class="page">
    <!-- Header -->
    <header class="page-header">
      <span class="back-btn" @click="router.back()">←</span>
      <h2>订单处理</h2>
      <span></span>
    </header>

    <!-- Status Banner -->
    <div class="status-banner" :class="order?.status">
      <span class="status-icon">{{ statusIcon[order?.status] || '📍' }}</span>
      <h2>{{ statusMap[order?.status] || '处理中' }}</h2>
      <p class="order-no">#{{ order?.orderNo }}</p>
    </div>

    <!-- Action Button -->
    <div class="action-section">
      <button v-if="order?.status === 'dispatched'" class="btn-action arrive" @click="handleArrive">
        🚗 我已到达取货点
      </button>
      <button v-if="order?.status === 'arrived'" class="btn-action photo" @click="handlePhoto">
        📸 拍照上传货物
      </button>
      <button v-if="order?.status === 'loading'" class="btn-action depart" @click="handleDepart">
        🚛 出发送货
      </button>
      <button v-if="order?.status === 'delivering'" class="btn-action complete" @click="handleComplete">
        ✅ 确认货物已送达
      </button>
      <div v-if="order?.status === 'completed'" class="complete-message">
        <span class="complete-icon">🎉</span>
        <p>订单已完成</p>
        <p class="complete-income">本次收入 ¥{{ order?.totalPrice ? Math.round(order.totalPrice * 0.95) : '--' }}</p>
      </div>
    </div>

    <!-- Address -->
    <div class="section">
      <div class="addr-block">
        <div class="addr-row">
          <span class="dot pickup"></span>
          <div>
            <span class="addr-tag pickup-tag">取</span>
            <span class="addr-text">{{ order?.pickupAddress }}</span>
            <span class="addr-contact">联系人：{{ order?.pickupContactName }} {{ order?.pickupContactPhone }}</span>
          </div>
          <a class="nav-link" :href="`https://uri.amap.com/navigation?to=${order?.pickupLng},${order?.pickupLat}`" target="_blank">🧭</a>
        </div>
        <div class="addr-divider"></div>
        <div class="addr-row">
          <span class="dot dropoff"></span>
          <div>
            <span class="addr-tag dropoff-tag">送</span>
            <span class="addr-text">{{ order?.dropoffAddress }}</span>
            <span class="addr-contact">联系人：{{ order?.dropoffContactName }} {{ order?.dropoffContactPhone }}</span>
          </div>
          <a class="nav-link" :href="`https://uri.amap.com/navigation?to=${order?.dropoffLng},${order?.dropoffLat}`" target="_blank">🧭</a>
        </div>
      </div>
    </div>

    <!-- Order Info -->
    <div class="section">
      <div class="sec-title">📋 订单信息</div>
      <div class="info-row"><span>车型</span><span>{{ order?.vehicleTypeName || '--' }}</span></div>
      <div class="info-row"><span>距离</span><span>{{ order?.distanceKm }}km</span></div>
      <div class="info-row"><span>运费</span><span class="price-highlight">¥{{ order?.totalPrice }}</span></div>
      <div class="info-row" v-if="order?.userAdditionalFee > 0"><span>用户加价</span><span class="tip-highlight">+¥{{ order?.userAdditionalFee }}</span></div>
      <div class="info-row income-row"><span>预计收入</span><span class="income">¥{{ Math.round((order?.totalPrice || 0) * 0.95) }}</span></div>
      <div class="info-row" v-if="order?.remark"><span>备注</span><span>{{ order?.remark }}</span></div>
    </div>

    <!-- Photos -->
    <div class="section" v-if="order?.cargoPhotos?.length">
      <div class="sec-title">📸 已上传照片（{{ order?.cargoPhotos.length }}张）</div>
      <div class="photo-grid">
        <div v-for="(photo, i) in order.cargoPhotos" :key="i" class="photo-item">
          <span>📷 照片 {{ i + 1 }}</span>
        </div>
      </div>
    </div>

    <div style="height:40px"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { orderApi, driverApi } from '../../utils/api';

const route = useRoute();
const router = useRouter();
const order = ref<any>(null);

const statusMap: Record<string, string> = {
  dispatched: '前往取货点', arrived: '到达取货点，请装货',
  loading: '运输中', delivering: '运输中', completed: '已完成',
};
const statusIcon: Record<string, string> = {
  dispatched: '🚗', arrived: '📍', loading: '🚛', delivering: '🚛', completed: '✅',
};

onMounted(async () => {
  const id = route.query.id as string;
  if (id) {
    try { order.value = await orderApi.getDetail(id); } catch (e) { alert('订单不存在'); router.back(); }
  }
});

async function handleArrive() {
  if (!order.value) return;
  try {
    await driverApi.arrive(order.value.id);
    order.value.status = 'arrived';
    alert('已标记到达取货点！请拍照上传货物');
  } catch (e: any) {
    alert(e?.response?.data?.message || '操作失败');
  }
}

async function handlePhoto() {
  if (!order.value) return;
  try {
    // Generate a simple data URI as mock cargo photo
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#4a9e4e';
      ctx.fillRect(0, 0, 400, 300);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('📦 货物照片', 200, 130);
      ctx.font = '14px sans-serif';
      ctx.fillText(new Date().toLocaleString('zh-CN'), 200, 160);
    }
    const photoUrl = canvas.toDataURL('image/jpeg', 0.7);
    await driverApi.uploadPhoto(order.value.id, photoUrl);
    order.value.status = 'loading';
    if (!order.value.cargoPhotos) order.value.cargoPhotos = [];
    order.value.cargoPhotos.push(photoUrl);
    alert('货物照片已上传！请出发送货');
  } catch (e: any) {
    alert(e?.response?.data?.message || '操作失败');
  }
}

async function handleDepart() {
  if (!order.value) return;
  try {
    await driverApi.depart(order.value.id);
    order.value.status = 'delivering';
    alert('已出发，请安全驾驶！');
  } catch (e: any) {
    alert(e?.response?.data?.message || '操作失败');
  }
}

async function handleComplete() {
  if (!order.value) return;
  if (!confirm('确认货物已送达收货人？')) return;
  try {
    await driverApi.complete(order.value.id);
    order.value.status = 'completed';
    alert('订单已完成！');
  } catch (e: any) {
    alert(e?.response?.data?.message || '操作失败');
  }
}
</script>

<style scoped>
.page { min-height: 100vh; background: var(--color-bg); }

/* Header */
.page-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #fff; position: sticky; top: 0; z-index: 10; border-bottom: 1px solid var(--color-border); }
.page-header h2 { font-size: var(--font-size-lg); font-weight: 700; }
.back-btn { cursor: pointer; font-size: 20px; color: var(--color-text); width: 32px; }

/* Status Banner */
.status-banner { padding: 28px 16px; color: #fff; text-align: center; }
.status-banner.dispatched { background: linear-gradient(135deg, #2196f3, #1976d2); }
.status-banner.arrived { background: linear-gradient(135deg, var(--color-warning), #f57c00); }
.status-banner.loading { background: linear-gradient(135deg, #4caf50, #388e3c); }
.status-banner.delivering { background: linear-gradient(135deg, #4caf50, #388e3c); }
.status-banner.completed { background: linear-gradient(135deg, var(--color-success), #05a050); }
.status-icon { font-size: 40px; display: block; margin-bottom: 8px; }
.status-banner h2 { font-size: var(--font-size-xl); margin: 0 0 4px; }
.order-no { font-size: var(--font-size-xs); opacity: 0.85; }

/* Action Section */
.action-section { padding: 16px 12px; }
.btn-action { width: 100%; height: 56px; border: none; border-radius: var(--radius-round); font-size: var(--font-size-lg); font-weight: 600; cursor: pointer; color: #fff; transition: all 0.2s ease; }
.btn-action:active { transform: translateY(1px) scale(0.98); box-shadow: var(--shadow-sm); }
.btn-action.arrive { background: var(--color-info); }
.btn-action.photo { background: var(--color-warning); }
.btn-action.depart { background: var(--color-success); }
.btn-action.complete { background: var(--color-success); }
.complete-message { text-align: center; padding: 20px; }
.complete-icon { font-size: 48px; display: block; margin-bottom: 12px; }
.complete-message p { font-size: var(--font-size-lg); font-weight: 600; margin-bottom: 4px; }
.complete-income { font-size: var(--font-size-xl); color: var(--color-primary); font-weight: 700; margin-top: 8px; }

/* Sections */
.section { background: var(--color-card); margin: 8px 16px; border-radius: var(--radius-md); padding: 16px; box-shadow: var(--shadow-card); border: 1px solid var(--color-border); }
.sec-title { font-size: var(--font-size-base); font-weight: 700; margin-bottom: 12px; }

/* Address Block */
.addr-block { display: flex; flex-direction: column; }
.addr-row { display: flex; gap: 10px; align-items: flex-start; }
.addr-divider { height: 12px; border-left: 1px dashed var(--color-border); margin-left: 4px; }
.dot { width: 10px; height: 10px; border-radius: 50%; margin-top: 5px; flex-shrink: 0; }
.dot.pickup { background: var(--color-success); }
.dot.dropoff { background: var(--color-danger); }
.addr-tag { padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 600; color: #fff; margin-right: 6px; }
.pickup-tag { background: var(--color-success); }
.dropoff-tag { background: var(--color-danger); }
.addr-text { font-size: var(--font-size-sm); color: var(--color-text); }
.addr-contact { font-size: var(--font-size-xs); color: var(--color-text-muted); display: block; margin-top: 2px; }
.nav-link { font-size: 22px; text-decoration: none; flex-shrink: 0; margin-top: 2px; }

/* Info Rows */
.info-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: var(--font-size-sm); }
.info-row span:first-child { color: var(--color-text-muted); }
.price-highlight { color: var(--color-primary); font-weight: 600; }
.tip-highlight { color: var(--color-warning); font-weight: 600; }
.income-row { border-top: 1px solid var(--color-divider); padding-top: 12px; margin-top: 6px; font-size: var(--font-size-base); font-weight: 600; }
.income { color: var(--color-success); font-size: var(--font-size-lg); font-weight: 700; }

/* Photo Grid */
.photo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.photo-item { aspect-ratio: 1; background: var(--color-bg); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; font-size: var(--font-size-sm); color: var(--color-text-muted); }
</style>
