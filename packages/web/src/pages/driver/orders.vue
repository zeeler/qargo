<template>
  <div class="page">
    <!-- Header -->
    <header class="page-header">
      <span class="back-btn" @click="router.back()">←</span>
      <h2>司机端</h2>
      <span class="refresh-btn" @click="refreshCurrent">🔄</span>
    </header>

    <!-- Tabs -->
    <div class="tabs">
      <div class="tab" :class="{ active: tab === 'nearby' }" @click="tab = 'nearby'; fetchNearby()">附近订单</div>
      <div class="tab" :class="{ active: tab === 'mine' }" @click="tab = 'mine'; fetchMine()">我的订单</div>
    </div>

    <!-- Nearby Orders -->
    <div v-if="tab === 'nearby'" class="order-list">
      <div v-if="nearbyOrders.length === 0" class="empty-state">
        <div class="empty-icon">📡</div>
        <p class="empty-title">暂无附近订单</p>
        <p class="empty-desc">附近暂无待接订单，请稍后再试</p>
      </div>
      <div v-for="order in nearbyOrders" :key="order.id" class="order-card">
        <div class="card-header">
          <span class="card-price">¥{{ order.totalPrice }}</span>
          <span class="card-distance">{{ order.distanceKm }}km</span>
          <span v-if="order.userAdditionalFee > 0" class="card-tip">+¥{{ order.userAdditionalFee }}</span>
        </div>
        <div class="card-route">
          <div class="route-stop">
            <span class="route-dot pickup"></span>
            <span class="route-text">{{ order.pickupAddress }}</span>
          </div>
          <div class="route-stop">
            <span class="route-dot dropoff"></span>
            <span class="route-text">{{ order.dropoffAddress }}</span>
          </div>
        </div>
        <div class="card-meta">
          <span>{{ order.vehicleTypeName || '未知车型' }}</span>
          <span>{{ formatTime(order.createdAt) }}</span>
        </div>
        <button class="btn-dispatch" @click.stop="selectOrder(order)">接单</button>
      </div>
    </div>

    <!-- My Orders -->
    <div v-else class="order-list">
      <div v-if="myOrders.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <p class="empty-title">暂无订单</p>
        <p class="empty-desc">你还没有接过订单</p>
      </div>
      <div v-for="order in myOrders" :key="order.id" class="order-card" @click="router.push(`/driver/order-detail?id=${order.id}`)">
        <div class="card-header">
          <span class="card-status-badge" :class="order.status">{{ statusMap[order.status] || order.status }}</span>
          <span class="card-price">¥{{ order.totalPrice }}</span>
        </div>
        <div class="card-route">
          <div class="route-stop">
            <span class="route-dot pickup"></span>
            <span class="route-text">{{ order.pickupAddress }}</span>
          </div>
          <div class="route-stop">
            <span class="route-dot dropoff"></span>
            <span class="route-text">{{ order.dropoffAddress }}</span>
          </div>
        </div>
        <div class="card-action-row">
          <span class="card-order-no">#{{ order.orderNo }}</span>
          <span v-if="order.status === 'dispatched'" class="action-hint">前往取货 →</span>
          <span v-else-if="order.status === 'arrived'" class="action-hint">拍照装货 →</span>
          <span v-else-if="order.status === 'loading'" class="action-hint">确认送达 →</span>
          <span v-else-if="order.status === 'completed'" class="action-hint done">已完成 ✓</span>
        </div>
      </div>
    </div>

    <!-- Dispatch Confirm Dialog -->
    <div class="dialog-overlay" v-if="selectedOrder" @click.self="selectedOrder = null">
      <div class="dialog">
        <h3>确认接单？</h3>
        <div class="confirm-info">
          <div class="ci-row"><span>取货</span><span>{{ selectedOrder.pickupAddress }}</span></div>
          <div class="ci-row"><span>送货</span><span>{{ selectedOrder.dropoffAddress }}</span></div>
          <div class="ci-row"><span>距离</span><span>{{ selectedOrder.distanceKm }}km</span></div>
          <div class="ci-row"><span>收入</span><span class="ci-income">¥{{ selectedOrder.totalPrice }}</span></div>
          <div class="ci-row" v-if="selectedOrder.userAdditionalFee > 0"><span>含加价</span><span class="ci-tip">+¥{{ selectedOrder.userAdditionalFee }}</span></div>
        </div>
        <div class="dialog-actions">
          <button class="btn-dialog-cancel" @click="selectedOrder = null">取消</button>
          <button class="btn-dialog-primary" :disabled="dispatching" @click="handleDispatch(selectedOrder.id)">
            {{ dispatching ? '接单中...' : '确认接单' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { orderApi, driverApi } from '../../utils/api';

const router = useRouter();
const tab = ref('nearby');
const nearbyOrders = ref<any[]>([]);
const myOrders = ref<any[]>([]);
const selectedOrder = ref<any>(null);
const dispatching = ref(false);

const statusMap: Record<string, string> = {
  dispatched: '前往取货', arrived: '已到达', loading: '装货中',
  delivering: '运输中', completed: '已完成',
};

onMounted(fetchNearby);

async function fetchNearby() {
  try { nearbyOrders.value = await orderApi.getNearby({ lng: 114.06, lat: 22.54 }); } catch (e) { nearbyOrders.value = []; }
}
async function fetchMine() {
  try { myOrders.value = await driverApi.getOrders(); } catch (e) { myOrders.value = []; }
}

function selectOrder(order: any) {
  selectedOrder.value = order;
}

async function handleDispatch(id: string) {
  dispatching.value = true;
  try {
    await orderApi.dispatch(id);
    selectedOrder.value = null;
    nearbyOrders.value = nearbyOrders.value.filter(o => o.id !== id);
    alert('接单成功！请前往取货地点');
  } catch (e: any) {
    alert(e?.response?.data?.message || '接单失败');
  }
  dispatching.value = false;
}

function refreshCurrent() {
  if (tab.value === 'nearby') fetchNearby();
  else fetchMine();
}

function formatTime(d: string) {
  if (!d) return '';
  const date = new Date(d);
  const m = date.getMonth() + 1;
  const day = date.getDate();
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${m}/${day} ${h}:${min}`;
}
</script>

<style scoped>
.page { min-height: 100vh; background: var(--color-bg); }

/* Header */
.page-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #fff; position: sticky; top: 0; z-index: 10; border-bottom: 1px solid var(--color-border); }
.page-header h2 { font-size: var(--font-size-lg); font-weight: 700; }
.back-btn { cursor: pointer; font-size: 20px; color: var(--color-text); width: 32px; }
.refresh-btn { cursor: pointer; font-size: 18px; width: 32px; text-align: right; }

/* Tabs */
.tabs { display: flex; background: var(--color-card); margin-bottom: 8px; }
.tab { flex: 1; text-align: center; padding: 14px; font-size: var(--font-size-base); color: var(--color-text-secondary); cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.15s; }
.tab.active { color: var(--color-primary); font-weight: 700; border-bottom-color: var(--color-primary); }

/* Order List */
.order-list { padding: 0 16px 12px; }
.order-card { background: var(--color-card); border-radius: var(--radius-md); padding: 16px; margin-bottom: 12px; box-shadow: var(--shadow-card); border: 1px solid var(--color-border); position: relative; transition: transform 0.15s ease; }
.order-card:active { transform: scale(0.985); }
.order-card[onclick] { cursor: pointer; }

.card-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.card-price { font-size: var(--font-size-xl); font-weight: 700; color: var(--color-primary); }
.card-distance { font-size: var(--font-size-xs); color: var(--color-text-secondary); background: var(--color-bg); padding: 2px 10px; border-radius: 10px; }
.card-tip { font-size: var(--font-size-xs); color: var(--color-warning); font-weight: 600; background: #fff8e1; padding: 2px 10px; border-radius: 10px; }

.card-route { margin-bottom: 10px; }
.route-stop { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.route-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.route-dot.pickup { background: var(--color-success); }
.route-dot.dropoff { background: var(--color-danger); }
.route-text { font-size: var(--font-size-sm); color: var(--color-text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.card-meta { display: flex; justify-content: space-between; font-size: var(--font-size-xs); color: var(--color-text-muted); }

.card-status-badge { font-size: var(--font-size-xs); padding: 3px 10px; border-radius: 10px; font-weight: 600; }
.card-status-badge.dispatched { background: #e3f2fd; color: #1976d2; }
.card-status-badge.arrived { background: #fff8e1; color: #f57c00; }
.card-status-badge.loading { background: #e8f5e9; color: #388e3c; }
.card-status-badge.delivering { background: #e8f5e9; color: var(--color-success); }
.card-status-badge.completed { background: #e8f5e9; color: var(--color-success); }

.card-action-row { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--color-divider); }
.card-order-no { font-size: var(--font-size-xs); color: var(--color-text-muted); font-family: monospace; }
.action-hint { font-size: var(--font-size-xs); color: var(--color-primary); font-weight: 600; }
.action-hint.done { color: var(--color-success); }

/* Dispatch Button */
.btn-dispatch { display: block; width: 100%; height: 42px; background: var(--color-primary-gradient); color: #fff; border: none; border-radius: 21px; font-size: var(--font-size-base); font-weight: 600; cursor: pointer; margin-top: 12px; transition: all 0.2s ease; }
.btn-dispatch:active { transform: translateY(1px) scale(0.98); box-shadow: var(--shadow-sm); }

/* Empty State */
.empty-state { display: flex; flex-direction: column; align-items: center; padding: 100px 40px; text-align: center; }
.empty-icon { font-size: 56px; margin-bottom: 16px; }
.empty-title { font-size: var(--font-size-lg); color: var(--color-text); font-weight: 600; margin-bottom: 8px; }
.empty-desc { font-size: var(--font-size-sm); color: var(--color-text-muted); }

/* Dialog */
.dialog-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 24px; }
.dialog { background: var(--color-card); border-radius: var(--radius-lg); padding: 24px; width: 100%; max-width: 320px; box-shadow: var(--shadow-raised); }
.dialog h3 { font-size: var(--font-size-lg); text-align: center; margin-bottom: 16px; }
.confirm-info { background: var(--color-bg); border-radius: var(--radius-sm); padding: 12px; margin-bottom: 16px; }
.ci-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: var(--font-size-sm); }
.ci-row span:first-child { color: var(--color-text-muted); }
.ci-income { color: var(--color-primary); font-weight: 700; }
.ci-tip { color: var(--color-warning); font-weight: 600; }
.dialog-actions { display: flex; gap: 10px; }
.dialog-actions button { flex: 1; height: 44px; border-radius: var(--radius-round); font-size: var(--font-size-base); border: none; cursor: pointer; }
.btn-dialog-cancel { background: var(--color-bg); color: var(--color-text-secondary); }
.btn-dialog-primary { background: var(--color-primary-gradient); color: #fff; font-weight: 600; transition: all 0.2s ease; }
.btn-dialog-primary:active { transform: translateY(1px) scale(0.98); }
.btn-dialog-primary:disabled { background: #ccc; }
</style>
