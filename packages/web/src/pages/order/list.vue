<template>
  <div class="page">
    <!-- Header -->
    <header class="page-header">
      <span class="back-btn" @click="router.back()">←</span>
      <h2>我的订单</h2>
      <span></span>
    </header>

    <!-- Filter Tabs -->
    <div class="filter-tabs">
      <div v-for="tab in tabs" :key="tab.key" class="filter-tab" :class="{ active: activeTab === tab.key }" @click="activeTab = tab.key">
        {{ tab.label }}
        <span class="tab-badge" v-if="tab.count > 0">{{ tab.count }}</span>
      </div>
    </div>

    <!-- Order List -->
    <div class="order-list" v-if="filteredOrders.length > 0">
      <div v-for="order in filteredOrders" :key="order.id" class="order-card" @click="router.push(`/order/detail?id=${order.id}`)">
        <div class="card-header">
          <span class="card-order-no">#{{ order.orderNo }}</span>
          <span class="card-status" :class="order.status">{{ statusMap[order.status] || order.status }}</span>
        </div>
        <div class="card-body">
          <div class="route-line">
            <div class="route-stop">
              <span class="route-dot pickup"></span>
              <span class="route-addr">{{ order.pickupAddress }}</span>
            </div>
            <div class="route-stop">
              <span class="route-dot dropoff"></span>
              <span class="route-addr">{{ order.dropoffAddress }}</span>
            </div>
          </div>
          <div class="card-meta" v-if="order.vehicleTypeName">
            <span>{{ order.vehicleTypeName }}</span>
            <span v-if="order.distanceKm">{{ order.distanceKm }}km</span>
          </div>
        </div>
        <div class="card-footer">
          <span class="card-price">¥{{ order.totalPrice }}</span>
          <span class="card-time">{{ formatTime(order.createdAt) }}</span>
        </div>
        <!-- Action hint -->
        <div class="card-action-hint" v-if="order.status === 'pending'">点击去支付</div>
        <div class="card-action-hint" v-else-if="['paid', 'dispatched', 'arrived', 'loading', 'delivering'].includes(order.status)">查看详情</div>
      </div>
    </div>

    <!-- Empty State -->
    <div class="empty-state" v-else>
      <div class="empty-icon">📋</div>
      <p class="empty-title">{{ emptyTitle }}</p>
      <p class="empty-desc">{{ emptyDesc }}</p>
      <button v-if="activeTab === 'all' && !authStore.isLoggedIn" class="btn-go-login" @click="router.push('/auth/login')">去登录</button>
      <button v-if="activeTab === 'all' && authStore.isLoggedIn" class="btn-go-order" @click="router.push('/')">去下单</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { orderApi } from '../../utils/api';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const orders = ref<any[]>([]);
const activeTab = ref('all');

const statusMap: Record<string, string> = {
  pending: '待支付', paid: '待接单', dispatched: '已接单',
  arrived: '已到达', loading: '装货中', delivering: '运输中',
  completed: '已完成', cancelled: '已取消', disputed: '纠纷中',
};

const tabs = computed(() => {
  const pending = orders.value.filter(o => o.status === 'pending').length;
  const active = orders.value.filter(o => ['paid', 'dispatched', 'arrived', 'loading', 'delivering'].includes(o.status)).length;
  const done = orders.value.filter(o => ['completed', 'cancelled'].includes(o.status)).length;
  return [
    { key: 'all', label: '全部', count: orders.value.length },
    { key: 'pending', label: '待支付', count: pending },
    { key: 'active', label: '进行中', count: active },
    { key: 'done', label: '已完成', count: done },
  ];
});

const filteredOrders = computed(() => {
  if (activeTab.value === 'all') return orders.value;
  if (activeTab.value === 'pending') return orders.value.filter(o => o.status === 'pending');
  if (activeTab.value === 'active') return orders.value.filter(o => ['paid', 'dispatched', 'arrived', 'loading', 'delivering'].includes(o.status));
  if (activeTab.value === 'done') return orders.value.filter(o => ['completed', 'cancelled'].includes(o.status));
  return orders.value;
});

const emptyTitle = computed(() => {
  if (activeTab.value === 'pending') return '暂无待支付订单';
  if (activeTab.value === 'active') return '暂无进行中的订单';
  if (activeTab.value === 'done') return '暂无已完成订单';
  return '还没有订单哦';
});

const emptyDesc = computed(() => {
  if (activeTab.value === 'all') return '快去下单吧';
  return '';
});

onMounted(async () => {
  // 支持 ?tab=active 等查询参数预设筛选
  const tabParam = route.query.tab as string;
  if (['all', 'pending', 'active', 'done'].includes(tabParam)) {
    activeTab.value = tabParam;
  }
  try {
    orders.value = await orderApi.getList();
  } catch (e) {
    orders.value = [];
  }
});

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
.btn-go-login { background: var(--color-card); color: var(--color-primary); border: 1px solid var(--color-primary); margin-bottom: 8px; }
</style>
