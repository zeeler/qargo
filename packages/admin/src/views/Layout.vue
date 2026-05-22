<template>
  <n-layout has-sider style="height: 100vh; background: #e8ebe8;">
    <n-layout-sider bordered content-style="padding: 24px;" :width="220" style="background: #f0f2f0;">
      <n-h3 style="text-align: center; margin-bottom: 24px;">快货管理后台</n-h3>
      <n-menu :options="menuOptions" :value="activeKey" @update:value="handleMenuSelect" />
    </n-layout-sider>
    <n-layout style="background: #e8ebe8;">
      <n-layout-header bordered style="padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; background: #f8faf8;">
        <n-h4 style="margin: 0;">{{ route.meta.title }}</n-h4>
        <n-space>
          <n-tag v-if="user" type="info">{{ user.name }}</n-tag>
          <n-button size="small" @click="handleLogout">退出</n-button>
        </n-space>
      </n-layout-header>
      <n-layout-content content-style="padding: 24px;" style="height: calc(100vh - 60px); overflow-y: auto; background: #e8ebe8;">
        <router-view />
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { NIcon } from 'naive-ui';

const router = useRouter();
const route = useRoute();
const user = ref(JSON.parse(localStorage.getItem('admin_user') || '{}'));

const activeKey = computed(() => route.path);

const menuOptions = [
  { label: '数据看板', key: '/dashboard', icon: () => h(NIcon, null, { default: () => '📊' }) },
  { label: '司机审核', key: '/drivers', icon: () => h(NIcon, null, { default: () => '👤' }) },
  { label: '订单管理', key: '/orders', icon: () => h(NIcon, null, { default: () => '📄' }) },
  { label: '投诉处理', key: '/complaints', icon: () => h(NIcon, null, { default: () => '⚠️' }) },
  { label: '定价管理', key: '/pricing', icon: () => h(NIcon, null, { default: () => '💰' }) },
  { label: '优惠券管理', key: '/coupons', icon: () => h(NIcon, null, { default: () => '🎫' }) },
  { label: '结算管理', key: '/settlements', icon: () => h(NIcon, null, { default: () => '💵' }) },
];

function handleMenuSelect(key: string) {
  router.push(key);
}

function handleLogout() {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_user');
  router.push('/login');
}
</script>
