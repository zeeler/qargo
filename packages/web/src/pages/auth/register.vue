<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="logo-section">
        <span class="logo-icon">📝</span>
        <h1 class="title">注册账号</h1>
        <p class="subtitle">加入快货，货运更简单</p>
      </div>

      <div class="form-item">
        <label class="form-label">姓名</label>
        <input v-model="name" placeholder="请输入姓名" />
      </div>
      <div class="form-item">
        <label class="form-label">手机号</label>
        <input v-model="phone" placeholder="请输入手机号" type="tel" maxlength="11" />
      </div>
      <div class="form-item code-row">
        <div class="code-input-wrap">
          <label class="form-label">验证码</label>
          <input v-model="code" placeholder="请输入验证码" type="text" maxlength="6" />
        </div>
        <button class="btn-code" :disabled="countdown > 0" @click="handleSendCode">
          {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
        </button>
      </div>
      <div class="form-item">
        <label class="form-label">默认地址（选填）</label>
        <input v-model="defaultAddress" placeholder="例如：深圳市南山区" />
      </div>
      <button class="btn-register" :disabled="loading" @click="handleRegister">注册</button>
      <p class="links">
        <span class="link" @click="goLogin">已有账号？去登录</span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const name = ref('');
const phone = ref('');
const code = ref('');
const defaultAddress = ref('');
const countdown = ref(0);
const loading = ref(false);

async function handleSendCode() {
  if (phone.value.length !== 11) { alert('请输入正确手机号'); return; }
  await authStore.sendCode(phone.value);
  countdown.value = 60;
  const timer = setInterval(() => { countdown.value--; if (countdown.value <= 0) clearInterval(timer); }, 1000);
}

async function handleRegister() {
  if (!name.value || !phone.value || !code.value) { alert('请填写完整信息'); return; }
  loading.value = true;
  try {
    if (countdown.value <= 0) {
      await authStore.sendCode(phone.value);
    }
    await authStore.register({ phone: phone.value, code: code.value, name: name.value, defaultAddress: defaultAddress.value });
    router.push('/');
  } catch (e: any) {
    alert(e?.response?.data?.message || '注册失败');
  } finally {
    loading.value = false;
  }
}

function goLogin() { router.push('/auth/login'); }
</script>

<style scoped>
.auth-page { min-height: 100vh; display: flex; justify-content: center; padding-top: 60px; background: var(--color-bg); }
.auth-card { width: 360px; padding: 32px 24px; }
.logo-section { text-align: center; margin-bottom: 28px; }
.logo-icon { font-size: 48px; display: block; margin-bottom: 12px; }
.title { font-size: var(--font-size-xxl); font-weight: 700; color: var(--color-text); }
.subtitle { font-size: var(--font-size-sm); color: var(--color-text-muted); margin-top: 6px; }
.form-item { margin-bottom: 16px; }
.form-label { font-size: var(--font-size-sm); color: var(--color-text-secondary); display: block; margin-bottom: 6px; }
.form-item input { width: 100%; height: 48px; background: var(--color-bg); border: 1px solid transparent; border-radius: var(--radius-sm); padding: 0 16px; font-size: var(--font-size-base); outline: none; transition: border-color 0.2s; }
.form-item input:focus { border-color: var(--color-primary); background: #fff; }
.code-row { display: flex; gap: 12px; align-items: flex-end; }
.code-input-wrap { flex: 1; }
.code-input-wrap input { width: 100%; }
.btn-code { height: 48px; padding: 0 16px; font-size: var(--font-size-sm); background: var(--color-primary-light); color: var(--color-primary); border: 1px solid var(--color-primary); border-radius: var(--radius-sm); cursor: pointer; white-space: nowrap; font-weight: 600; }
.btn-code:disabled { background: var(--color-bg); color: var(--color-text-muted); border-color: var(--color-border); cursor: not-allowed; }
.btn-register { width: 100%; height: 50px; background: var(--color-primary-gradient); color: #fff; border: none; border-radius: var(--radius-round); font-size: var(--font-size-lg); font-weight: 600; cursor: pointer; margin-top: 20px; transition: all 0.2s ease; }
.btn-register:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-register:active { transform: translateY(1px) scale(0.98); box-shadow: var(--shadow-sm); }
.links { text-align: center; margin-top: 20px; }
.link { font-size: var(--font-size-sm); color: var(--color-primary); cursor: pointer; }
</style>
