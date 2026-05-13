<template>
  <n-space vertical :size="16">
    <n-tabs v-model:value="tab">
      <n-tab name="pending" tab="待审核" />
      <n-tab name="all" tab="全部" />
    </n-tabs>

    <n-data-table :columns="columns" :data="drivers" :loading="loading" :pagination="false" />

    <n-modal v-model:show="showReview" preset="card" :title="reviewAction === 'approve' ? '确认通过' : '确认驳回'" style="width:420px;">
      <n-text>确定要{{ reviewAction === 'approve' ? '通过' : '驳回' }}此司机申请吗？</n-text>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showReview = false">取消</n-button>
          <n-button :type="reviewAction === 'approve' ? 'success' : 'error'" @click="confirmReview" :loading="reviewing">确定</n-button>
        </n-space>
      </template>
    </n-modal>
  </n-space>
</template>

<script setup lang="ts">
import { ref, h, onMounted, watch } from 'vue';
import { useMessage } from 'naive-ui';
import { adminApi } from '../../utils/api';

const message = useMessage();
const tab = ref('pending');
const loading = ref(false);
const drivers = ref<any[]>([]);
const showReview = ref(false);
const reviewAction = ref<'approve' | 'reject'>('approve');
const reviewing = ref(false);
const currentDriverId = ref('');

const columns = [
  { title: '姓名', key: 'realName' },
  { title: '手机号', key: 'user.phone' },
  { title: '车型', key: 'vehicle.vehicleTypeCode' },
  { title: '车牌号', key: 'vehicle.plateNumber' },
  { title: '状态', key: 'status', render: (row: any) => statusRender(row.status) },
  { title: '操作', key: 'actions', render: (row: any) => actionRender(row) },
];

function statusRender(status: string) {
  const map: Record<string, { label: string; type: string }> = {
    pending: { label: '待审核', type: 'warning' },
    approved: { label: '已通过', type: 'success' },
    rejected: { label: '已驳回', type: 'error' },
  };
  const info = map[status] || { label: status, type: 'default' };
  return h('span', { style: `color: ${info.type === 'warning' ? '#f5a623' : info.type === 'success' ? '#07c160' : info.type === 'error' ? '#e53935' : '#666'}` }, info.label);
}

function actionRender(row: any) {
  if (row.status !== 'pending') return null;
  return h('span', [
    h('a', { style: 'color: #07c160; margin-right: 12px; cursor: pointer;', onClick: () => handleReview(row.id, 'approve') }, '通过'),
    h('a', { style: 'color: #e53935; cursor: pointer;', onClick: () => handleReview(row.id, 'reject') }, '驳回'),
  ]);
}

async function fetchDrivers() {
  loading.value = true;
  try {
    const data = tab.value === 'pending'
      ? await adminApi.getPendingDrivers() as any
      : await adminApi.getAllDrivers() as any;
    drivers.value = data || [];
  } catch (e) {
    drivers.value = [];
  } finally {
    loading.value = false;
  }
}

function handleReview(id: string, action: 'approve' | 'reject') {
  currentDriverId.value = id;
  reviewAction.value = action;
  showReview.value = true;
}

async function confirmReview() {
  reviewing.value = true;
  try {
    await adminApi.reviewDriver(currentDriverId.value, reviewAction.value);
    message.success('操作成功');
    showReview.value = false;
    fetchDrivers();
  } catch (e: any) {
    message.error(e?.response?.data?.message || '操作失败');
  } finally {
    reviewing.value = false;
  }
}

watch(tab, fetchDrivers);

onMounted(fetchDrivers);
</script>
