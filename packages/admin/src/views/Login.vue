<template>
  <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: #f3f6f3;">
    <n-card title="管理后台登录" style="width: 400px;">
      <n-form>
        <n-form-item label="手机号">
          <n-input v-model:value="phone" placeholder="管理员手机号" />
        </n-form-item>
        <n-form-item label="验证码">
          <n-input v-model:value="code" placeholder="验证码" />
          <n-button :disabled="countdown > 0" @click="handleSendCode" style="margin-left: 8px;">
            {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
          </n-button>
        </n-form-item>
        <n-button type="primary" block @click="handleLogin" :loading="loading">登录</n-button>
        <p style="margin-top: 12px; color: #999; font-size: 12px;">Mock 验证码: 123456</p>
      </n-form>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useMessage } from 'naive-ui';
import { authApi } from '../utils/api';

const router = useRouter();
const message = useMessage();
const phone = ref('13800000000');
const code = ref('');
const countdown = ref(0);
const loading = ref(false);

async function handleSendCode() {
  await authApi.sendCode(phone.value);
  message.success('验证码已发送 (Mock: 123456)');
  countdown.value = 60;
  const timer = setInterval(() => { countdown.value--; if (countdown.value <= 0) clearInterval(timer); }, 1000);
}

async function handleLogin() {
  if (!code.value) { message.error('请输入验证码'); return; }
  loading.value = true;
  try {
    if (countdown.value <= 0) {
      await authApi.sendCode(phone.value);
    }
    const res = await authApi.login(phone.value, code.value) as any;
    localStorage.setItem('admin_token', res.accessToken);
    localStorage.setItem('admin_user', JSON.stringify({ phone: phone.value }));
    message.success('登录成功');
    router.push('/dashboard');
  } catch (e: any) {
    message.error(e?.response?.data?.message || '登录失败');
  } finally {
    loading.value = false;
  }
}
</script>
