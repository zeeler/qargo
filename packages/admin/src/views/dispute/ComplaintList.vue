<template>
  <n-space vertical :size="16">
    <n-data-table :columns="columns" :data="complaints" :loading="loading" />

    <!-- Resolve/Dismiss Modal -->
    <n-modal v-model:show="showResolve" preset="card" :title="modalMode === 'dismiss' ? '驳回投诉' : '处理投诉'" style="width:480px;">
      <n-form label-placement="left" label-width="80px">
        <n-form-item label="投诉人">
          <n-text>{{ currentComplaint?.user?.name || '—' }}</n-text>
        </n-form-item>
        <n-form-item label="投诉类型">
          <n-tag :type="typeTagType(currentComplaint?.type)">{{ typeLabel(currentComplaint?.type) }}</n-tag>
        </n-form-item>
        <n-form-item label="投诉内容">
          <n-text>{{ currentComplaint?.content }}</n-text>
        </n-form-item>
        <n-form-item label="关联订单">
          <n-text>{{ currentComplaint?.order?.orderNo || '—' }}</n-text>
        </n-form-item>
        <n-form-item :label="modalMode === 'dismiss' ? '驳回原因' : '处理意见'" :required="modalMode === 'resolve'">
          <n-input v-model:value="resolution" type="textarea" :placeholder="modalMode === 'dismiss' ? '驳回原因（选填）...' : '请输入处理意见...'" :autosize="{ minRows: 2, maxRows: 4 }" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showResolve = false">取消</n-button>
          <n-button type="primary" @click="handleResolveConfirm" :loading="resolving">
            {{ modalMode === 'dismiss' ? '确认驳回' : '确认处理' }}
          </n-button>
        </n-space>
      </template>
    </n-modal>
  </n-space>
</template>

<script setup lang="ts">
import { ref, h, onMounted } from 'vue';
import { useMessage } from 'naive-ui';
import { adminApi } from '../../utils/api';

const message = useMessage();
const loading = ref(false);
const resolving = ref(false);
const showResolve = ref(false);
const modalMode = ref<'resolve' | 'dismiss'>('resolve');
const complaints = ref<any[]>([]);
const currentComplaint = ref<any>(null);
const resolution = ref('');

const typeLabels: Record<string, string> = {
  service: '服务态度', damage: '货物损坏', delay: '配送延迟',
  overcharge: '乱收费', missing: '货物丢失', other: '其他',
};

const statusLabels: Record<string, string> = {
  pending: '待处理', resolved: '已处理', dismissed: '已驳回',
};

function typeLabel(type: string) {
  return typeLabels[type] || type;
}

function typeTagType(type: string) {
  const map: Record<string, string> = {
    service: 'warning', damage: 'error', delay: 'warning',
    overcharge: 'error', missing: 'error', other: 'default',
  };
  return (map[type] || 'default') as any;
}

const columns = [
  { title: '投诉ID', key: 'id', width: 100 },
  { title: '投诉人', key: 'user.name', width: 100 },
  {
    title: '类型', key: 'type', width: 100,
    render: (row: any) => typeLabel(row.type),
  },
  { title: '内容', key: 'content', ellipsis: { tooltip: true } },
  {
    title: '状态', key: 'status', width: 80,
    render: (row: any) => statusLabels[row.status] || row.status,
  },
  { title: '创建时间', key: 'createdAt', width: 100 },
  {
    title: '操作', key: 'actions', width: 80,
    render: (row: any) => {
      if (row.status !== 'pending') return '—';
      return h('span', {}, [
        h('a', {
          style: 'color: #4a9e4e; cursor: pointer; margin-right: 8px;',
          onClick: () => openModal(row, 'resolve'),
        }, '处理'),
        h('a', {
          style: 'color: #999; cursor: pointer;',
          onClick: () => openModal(row, 'dismiss'),
        }, '驳回'),
      ]);
    },
  },
];

function openModal(complaint: any, mode: 'resolve' | 'dismiss') {
  currentComplaint.value = complaint;
  resolution.value = '';
  modalMode.value = mode;
  showResolve.value = true;
}

async function handleResolveConfirm() {
  if (modalMode.value === 'resolve' && !resolution.value.trim()) {
    message.warning('请填写处理意见');
    return;
  }
  resolving.value = true;
  try {
    if (modalMode.value === 'dismiss') {
      await adminApi.dismissComplaint(currentComplaint.value.id, resolution.value.trim() || undefined);
      message.success('投诉已驳回');
    } else {
      await adminApi.resolveComplaint(currentComplaint.value.id, resolution.value.trim());
      message.success('投诉已处理');
    }
    showResolve.value = false;
    fetchComplaints();
  } catch (e: any) {
    message.error(e?.response?.data?.message || '操作失败');
  }
  resolving.value = false;
}

async function fetchComplaints() {
  loading.value = true;
  try {
    complaints.value = await adminApi.getComplaints() as any || [];
  } catch (e) {
    complaints.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(fetchComplaints);
</script>
