<template>
  <div>
    <n-h2 style="margin-bottom: 20px;">优惠券管理</n-h2>

    <n-alert v-if="errorMsg" type="error" :title="errorMsg" style="margin-bottom: 16px;" />

    <!-- Create Form -->
    <n-card title="创建优惠券" style="margin-bottom: 24px;">
      <n-form label-placement="left" label-width="100">
        <n-form-item label="兑换码">
          <n-input v-model:value="form.code" placeholder="如 NEW50" />
        </n-form-item>
        <n-form-item label="类型">
          <n-select v-model:value="form.type" :options="typeOptions" style="width: 200px;" />
        </n-form-item>
        <n-form-item label="面值">
          <n-input-number v-model:value="form.value" :min="0.01" :step="1" style="width: 200px;" />
        </n-form-item>
        <n-form-item label="满减门槛（元）">
          <n-input-number v-model:value="form.minOrderAmount" :min="0" style="width: 200px;" />
        </n-form-item>
        <n-form-item label="有效期起">
          <n-date-picker v-model:value="form.validFrom" type="date" style="width: 200px;" />
        </n-form-item>
        <n-form-item label="有效期止">
          <n-date-picker v-model:value="form.validUntil" type="date" style="width: 200px;" />
        </n-form-item>
        <n-button type="primary" @click="handleCreate" :disabled="creating">
          {{ creating ? '创建中...' : '创建优惠券' }}
        </n-button>
      </n-form>
    </n-card>

    <!-- Coupon List -->
    <n-card title="优惠券列表">
      <n-spin :show="loading">
        <n-table v-if="coupons.length > 0" :single-line="false">
          <thead>
            <tr>
              <th>兑换码</th>
              <th>类型</th>
              <th>面值</th>
              <th>门槛</th>
              <th>有效期</th>
              <th>已领/总量</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in coupons" :key="c.id">
              <td><n-tag>{{ c.code }}</n-tag></td>
              <td>{{ c.type === 'fixed' ? '满减' : '折扣' }}</td>
              <td>{{ c.type === 'fixed' ? '¥' + Number(c.value) : (Number(c.value) * 10).toFixed(1) + '折' }}</td>
              <td>{{ Number(c.minOrderAmount) > 0 ? '¥' + Number(c.minOrderAmount) : '无门槛' }}</td>
              <td>{{ formatDate(c.validFrom) }} ~ {{ formatDate(c.validUntil) }}</td>
              <td>{{ c.usedCount }} / {{ c.usageLimit }}</td>
              <td><n-button size="small" type="error" @click="handleDelete(c.id)">删除</n-button></td>
            </tr>
          </tbody>
        </n-table>
        <n-empty v-else description="暂无优惠券" />
      </n-spin>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onBeforeMount } from 'vue';
import api from '../../utils/api';
import { NH2, NCard, NForm, NFormItem, NInput, NInputNumber, NSelect, NDatePicker, NButton, NTable, NTag, NAlert, NSpin, NEmpty } from 'naive-ui';

interface Coupon {
  id: string;
  code: string;
  type: string;
  value: number;
  minOrderAmount: number;
  validFrom: string;
  validUntil: string;
  usageLimit: number;
  usedCount: number;
}

const coupons = ref<Coupon[]>([]);
const creating = ref(false);
const loading = ref(false);
const errorMsg = ref('');

const typeOptions = [
  { label: '满减券', value: 'fixed' },
  { label: '折扣券', value: 'percent' },
];

const form = reactive({
  code: '',
  type: 'fixed' as string,
  value: 10,
  minOrderAmount: 0,
  validFrom: null as number | null,
  validUntil: null as number | null,
});

async function fetchCoupons() {
  loading.value = true;
  errorMsg.value = '';
  try {
    coupons.value = (await api.get('/coupon')) as Coupon[];
  } catch (e: any) {
    const msg = e?.response?.data?.message || e?.message || '加载失败';
    errorMsg.value = msg;
    if (e?.response?.status === 401) errorMsg.value = '请先登录管理后台';
  } finally {
    loading.value = false;
  }
}

async function handleCreate() {
  if (!form.code || !form.validFrom || !form.validUntil) {
    alert('请填写完整信息');
    return;
  }
  creating.value = true;
  try {
    await api.post('/coupon', {
      code: form.code,
      type: form.type,
      value: form.value,
      minOrderAmount: form.minOrderAmount,
      validFrom: new Date(form.validFrom).toISOString(),
      validUntil: new Date(form.validUntil).toISOString(),
    });
    alert('创建成功');
    form.code = '';
    await fetchCoupons();
  } catch (e: any) {
    alert(e?.response?.data?.message || e?.message || '创建失败');
  } finally {
    creating.value = false;
  }
}

async function handleDelete(id: string) {
  if (!confirm('确定删除？')) return;
  try {
    await api.delete(`/coupon/${id}`);
    await fetchCoupons();
  } catch (e: any) {
    alert(e?.response?.data?.message || e?.message || '删除失败');
  }
}

function formatDate(dateStr: string) {
  return dateStr ? dateStr.split('T')[0] : '';
}

onBeforeMount(fetchCoupons);
</script>
