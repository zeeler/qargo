<template>
  <n-space vertical :size="16">
    <n-grid :cols="4" :x-gap="16">
      <n-gi>
        <n-card title="总订单" hoverable>
          <n-h2 style="margin: 0;">{{ stats.totalOrders }}</n-h2>
        </n-card>
      </n-gi>
      <n-gi>
        <n-card title="待处理订单" hoverable>
          <n-h2 style="margin: 0; color: #f5a623;">{{ stats.pendingOrders }}</n-h2>
        </n-card>
      </n-gi>
      <n-gi>
        <n-card title="已完成" hoverable>
          <n-h2 style="margin: 0; color: #07c160;">{{ stats.completedOrders }}</n-h2>
        </n-card>
      </n-gi>
      <n-gi>
        <n-card title="总交易额" hoverable>
          <n-h2 style="margin: 0; color: #4a9e4e;">¥{{ stats.totalRevenue }}</n-h2>
        </n-card>
      </n-gi>
    </n-grid>

    <n-grid :cols="3" :x-gap="16">
      <n-gi>
        <n-card title="司机总数" hoverable>
          <n-h2 style="margin: 0;">{{ stats.totalDrivers }}</n-h2>
        </n-card>
      </n-gi>
      <n-gi>
        <n-card title="待审核司机" hoverable>
          <n-h2 style="margin: 0; color: #f5a623;">{{ stats.pendingDrivers }}</n-h2>
        </n-card>
      </n-gi>
      <n-gi>
        <n-card title="待处理投诉" hoverable>
          <n-h2 style="margin: 0; color: #e53935;">{{ stats.totalComplaints }}</n-h2>
        </n-card>
      </n-gi>
    </n-grid>
  </n-space>
</template>

<script setup lang="ts">
import { ref, onBeforeMount } from 'vue';
import { adminApi } from '../../utils/api';

const loading = ref(true);
const stats = ref({
  totalOrders: 0, pendingOrders: 0, completedOrders: 0,
  totalDrivers: 0, pendingDrivers: 0, totalRevenue: 0, totalComplaints: 0,
});

async function fetchStats() {
  loading.value = true;
  try {
    stats.value = await adminApi.getDashboard() as any;
  } catch (e) {
    console.error('Failed to fetch stats', e);
  } finally {
    loading.value = false;
  }
}

onBeforeMount(fetchStats);
</script>
