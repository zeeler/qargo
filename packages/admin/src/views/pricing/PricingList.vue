<template>
  <n-space vertical :size="16">
    <n-data-table :columns="columns" :data="pricingRules" :loading="loading" />

    <n-card title="定价说明">
      <n-p>定价公式：总价 = 起步价 + max(0, 里程 - 起步包含里程) × 每公里单价 + 浮动费用 + 用户加价</n-p>
      <n-p>浮动费用包括：高峰时段(1.2x)、夜间(1.5x)、雨天(1.3x)等</n-p>
      <n-p>点击表格中的价格数据即可编辑</n-p>
    </n-card>

    <!-- Edit Modal -->
    <n-modal v-model:show="showEdit" preset="card" title="编辑定价" style="width:400px;">
      <n-form :model="editForm" label-placement="left" label-width="120px">
        <n-form-item label="车型代码">
          <n-text>{{ editForm.vehicleTypeCode }}</n-text>
        </n-form-item>
        <n-form-item label="起步价（元）">
          <n-input-number v-model:value="editForm.basePrice" :min="0" />
        </n-form-item>
        <n-form-item label="包含里程（km）">
          <n-input-number v-model:value="editForm.includedKm" :min="0" />
        </n-form-item>
        <n-form-item label="每公里单价（元）">
          <n-input-number v-model:value="editForm.pricePerKm" :min="0" :step="0.5" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showEdit = false">取消</n-button>
          <n-button type="primary" @click="handleSave" :loading="saving">保存</n-button>
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
const saving = ref(false);
const showEdit = ref(false);
const pricingRules = ref<any[]>([]);
const editForm = ref({ id: '', vehicleTypeCode: '', basePrice: 0, includedKm: 5, pricePerKm: 0 });

const columns = [
  { title: '车型代码', key: 'vehicleTypeCode', width: 120 },
  {
    title: '起步价(元)', key: 'basePrice', width: 110,
    render: (row: any) => h('span', {
      style: 'color: #4a9e4e; cursor: pointer; font-weight: 600;',
      onClick: () => openEdit(row),
    }, `¥${row.basePrice}`),
  },
  {
    title: '包含里程(km)', key: 'includedKm', width: 120,
    render: (row: any) => h('span', {
      style: 'cursor: pointer;',
      onClick: () => openEdit(row),
    }, `${row.includedKm}km`),
  },
  {
    title: '每公里单价(元)', key: 'pricePerKm', width: 130,
    render: (row: any) => h('span', {
      style: 'color: #2196f3; cursor: pointer; font-weight: 600;',
      onClick: () => openEdit(row),
    }, `¥${row.pricePerKm}`),
  },
  { title: '生效日期', key: 'effectiveDate', width: 120 },
];

function openEdit(row: any) {
  editForm.value = {
    id: row.id,
    vehicleTypeCode: row.vehicleTypeCode,
    basePrice: row.basePrice,
    includedKm: row.includedKm,
    pricePerKm: row.pricePerKm,
  };
  showEdit.value = true;
}

async function handleSave() {
  saving.value = true;
  try {
    await adminApi.updatePricing(editForm.value.id, {
      basePrice: editForm.value.basePrice,
      includedKm: editForm.value.includedKm,
      pricePerKm: editForm.value.pricePerKm,
    });
    message.success('定价已更新');
    showEdit.value = false;
    fetchPricing();
  } catch (e: any) {
    message.error(e?.response?.data?.message || '保存失败');
  }
  saving.value = false;
}

async function fetchPricing() {
  loading.value = true;
  try {
    pricingRules.value = await adminApi.getPricingRules() as any || [];
  } catch (e) {
    pricingRules.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(fetchPricing);
</script>
