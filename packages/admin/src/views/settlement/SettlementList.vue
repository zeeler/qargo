<template>
  <div>
    <n-h2 style="margin-bottom: 20px;">结算管理</n-h2>

    <n-alert v-if="errorMsg" type="error" :title="errorMsg" style="margin-bottom: 16px;" />

    <n-button type="primary" @click="handleGenerate" :disabled="generating" style="margin-bottom: 24px;">
      {{ generating ? '生成中...' : '生成结算单' }}
    </n-button>

    <n-card title="结算单列表">
      <n-table :single-line="false">
        <thead>
          <tr>
            <th>司机</th>
            <th>手机号</th>
            <th>周期开始</th>
            <th>周期结束</th>
            <th>订单数</th>
            <th>总收入</th>
            <th>平台费</th>
            <th>司机收入</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in settlements" :key="s.id">
            <td>{{ s.driver.user.name }}</td>
            <td>{{ s.driver.user.phone }}</td>
            <td>{{ formatDate(s.periodStart) }}</td>
            <td>{{ formatDate(s.periodEnd) }}</td>
            <td>{{ s.orderCount }}</td>
            <td>¥{{ s.totalAmount }}</td>
            <td>¥{{ s.platformFee }}</td>
            <td>¥{{ s.netAmount }}</td>
            <td><n-tag :type="s.status === 'settled' ? 'success' : 'warning'">{{ s.status === 'settled' ? '已结算' : '待结算' }}</n-tag></td>
            <td>
              <n-button v-if="s.status === 'pending'" size="small" type="primary" @click="handleSettle(s.id)">确认结算</n-button>
              <span v-else style="color: #999;">—</span>
            </td>
          </tr>
        </tbody>
      </n-table>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeMount } from 'vue';
import api from '../../utils/api';
import { NH2, NButton, NCard, NTable, NTag, NAlert } from 'naive-ui';

interface Settlement {
  id: string;
  driverId: string;
  periodStart: string;
  periodEnd: string;
  orderCount: number;
  totalAmount: number;
  platformFee: number;
  netAmount: number;
  status: string;
  driver: { user: { name: string; phone: string } };
}

const settlements = ref<Settlement[]>([]);
const generating = ref(false);
const errorMsg = ref('');

async function fetchSettlements() {
  errorMsg.value = '';
  try {
    settlements.value = await api.get('/settlement');
  } catch (e: any) {
    const msg = e?.response?.data?.message || e?.message || '加载失败';
    errorMsg.value = msg;
    if (e?.response?.status === 401) errorMsg.value = '请先登录管理后台';
  }
}

async function handleGenerate() {
  generating.value = true;
  try {
    await api.post('/settlement/generate');
    await fetchSettlements();
  } catch (e: any) {
    alert(e.message || '生成失败');
  } finally {
    generating.value = false;
  }
}

async function handleSettle(id: string) {
  if (!confirm('确认结算？')) return;
  try {
    await api.put(`/settlement/${id}/settle`);
    await fetchSettlements();
  } catch (e: any) { alert(e.message || '操作失败'); }
}

function formatDate(dateStr: string) {
  return dateStr ? dateStr.split('T')[0] : '';
}

onBeforeMount(fetchSettlements);
</script>
