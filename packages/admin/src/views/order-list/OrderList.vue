<template>
  <n-space vertical :size="16">
    <n-space>
      <n-select v-model:value="statusFilter" :options="statusOptions" placeholder="全部状态" style="width: 160px;" clearable @update:value="fetchOrders" />
      <n-button @click="fetchOrders" secondary>刷新</n-button>
    </n-space>

    <n-data-table :columns="columns" :data="orders" :loading="loading" :pagination="pagination" @update:page="handlePageChange" />

    <n-modal v-model:show="showCancel" preset="card" title="确认取消订单" style="width:420px;">
      <n-text>确定要取消订单 {{ currentOrder?.orderNo }} 吗？</n-text>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showCancel = false">再想想</n-button>
          <n-button type="error" @click="confirmCancel" :loading="operating">确认取消</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal v-model:show="showComplete" preset="card" title="确认完成订单" style="width:420px;">
      <n-text>确定要强制完成订单 {{ currentOrder?.orderNo }} 吗？</n-text>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showComplete = false">再想想</n-button>
          <n-button type="success" @click="confirmComplete" :loading="operating">确认完成</n-button>
        </n-space>
      </template>
    </n-modal>
  </n-space>
</template>

<script setup lang="ts">
import { ref, h, onMounted } from 'vue';
import { useMessage, NTag } from 'naive-ui';
import { adminApi } from '../../utils/api';

const message = useMessage();
const loading = ref(false);
const orders = ref<any[]>([]);
const statusFilter = ref<string | null>(null);
const pagination = ref({ page: 1, pageSize: 20, itemCount: 0 });
const showCancel = ref(false);
const showComplete = ref(false);
const operating = ref(false);
const currentOrder = ref<any>(null);

const statusOptions = [
  { label: '待支付', value: 'pending' },
  { label: '待接单', value: 'paid' },
  { label: '已接单', value: 'dispatched' },
  { label: '已到达', value: 'arrived' },
  { label: '装货中', value: 'loading' },
  { label: '运输中', value: 'delivering' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' },
];

const statusMap: Record<string, { label: string; type: string }> = {
  pending: { label: '待支付', type: 'warning' },
  paid: { label: '待接单', type: 'info' },
  dispatched: { label: '已接单', type: 'info' },
  arrived: { label: '已到达', type: 'warning' },
  loading: { label: '装货中', type: 'warning' },
  delivering: { label: '运输中', type: 'success' },
  completed: { label: '已完成', type: 'success' },
  cancelled: { label: '已取消', type: 'default' },
  disputed: { label: '纠纷中', type: 'error' },
};

const columns = [
  { title: '订单号', key: 'orderNo', width: 180 },
  { title: '用户', key: 'user.name', width: 100 },
  { title: '取货地址', key: 'pickupAddress', ellipsis: { tooltip: true } },
  { title: '收货地址', key: 'dropoffAddress', ellipsis: { tooltip: true } },
  {
    title: '金额', key: 'totalPrice', width: 90,
    render: (row: any) => `¥${row.totalPrice}`,
  },
  {
    title: '状态', key: 'status', width: 90,
    render: (row: any) => {
      const s = statusMap[row.status] || { label: row.status, type: 'default' };
      return h(NTag, { type: s.type as any, size: 'small' }, () => s.label);
    },
  },
  { title: '创建时间', key: 'createdAt', width: 100 },
  {
    title: '操作', key: 'actions', width: 140,
    render: (row: any) => {
      const btns = [];
      if (['pending', 'paid'].includes(row.status)) {
        btns.push(h('a', {
          style: 'color: #e53935; cursor: pointer; margin-right: 12px;',
          onClick: () => handleCancel(row),
        }, '取消'));
      }
      if (['dispatched', 'arrived', 'loading', 'delivering'].includes(row.status)) {
        btns.push(h('a', {
          style: 'color: #07c160; cursor: pointer;',
          onClick: () => handleComplete(row),
        }, '完成'));
      }
      return btns.length > 0 ? btns : h('span', { style: 'color: #999;' }, '—');
    },
  },
];

async function fetchOrders() {
  loading.value = true;
  try {
    const data = await adminApi.getOrders({
      status: statusFilter.value || undefined,
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
    }) as any;
    orders.value = data.items || [];
    pagination.value.itemCount = data.total || 0;
  } catch (e) {
    orders.value = [];
  } finally {
    loading.value = false;
  }
}

function handleCancel(row: any) {
  currentOrder.value = row;
  showCancel.value = true;
}

function handleComplete(row: any) {
  currentOrder.value = row;
  showComplete.value = true;
}

async function confirmCancel() {
  operating.value = true;
  try {
    await adminApi.cancelOrder(currentOrder.value.id);
    message.success('订单已取消');
    showCancel.value = false;
    fetchOrders();
  } catch (e: any) {
    message.error(e?.response?.data?.message || '操作失败');
  } finally {
    operating.value = false;
  }
}

async function confirmComplete() {
  operating.value = true;
  try {
    await adminApi.completeOrder(currentOrder.value.id);
    message.success('订单已完成');
    showComplete.value = false;
    fetchOrders();
  } catch (e: any) {
    message.error(e?.response?.data?.message || '操作失败');
  } finally {
    operating.value = false;
  }
}

function handlePageChange(page: number) {
  pagination.value.page = page;
  fetchOrders();
}

onMounted(fetchOrders);
</script>
