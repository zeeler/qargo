<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="logo-section">
        <span class="logo-icon">🚛</span>
        <h1 class="title">欢迎使用快货</h1>
        <p class="subtitle">货运平台 · 一键下单</p>
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

      <button class="btn-login" @click="handleLogin">登录</button>
      <p class="links">
        <span class="link" @click="goRegister">没有账号？去注册</span>
      </p>
      <p class="mock-hint">Mock 验证码：123456</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const phone = ref('');
const code = ref('');
const countdown = ref(0);

async function handleSendCode() {
  if (phone.value.length !== 11) { alert('请输入正确手机号'); return; }
  await authStore.sendCode(phone.value);
  countdown.value = 60;
  const timer = setInterval(() => { countdown.value--; if (countdown.value <= 0) clearInterval(timer); }, 1000);
}

async function handleLogin() {
  if (!phone.value || !code.value) { alert('请填写完整信息'); return; }
  try {
    await authStore.login({ phone: phone.value, code: code.value });
    router.push('/');
  } catch (e: any) {
    alert(e?.response?.data?.message || e.message || '登录失败');
  }
}

function goRegister() { router.push('/auth/register'); }
</script>

<style scoped>
.auth-page { min-height: 100vh; display: flex; justify-content: center; padding-top: 80px; background: var(--color-bg); }
.auth-card { width: 360px; padding: 32px 24px; }
.logo-section { text-align: center; margin-bottom: 32px; }
.logo-icon { font-size: 48px; display: block; margin-bottom: 12px; }
.title { font-size: var(--font-size-xxl); font-weight: 700; color: var(--color-text); }
.subtitle { font-size: var(--font-size-sm); color: var(--color-text-muted); margin-top: 6px; }
.form-item { margin-bottom: 18px; }
.form-label { font-size: var(--font-size-sm); color: var(--color-text-secondary); display: block; margin-bottom: 6px; }
.form-item input { width: 100%; height: 48px; background: var(--color-bg); border: 1px solid transparent; border-radius: var(--radius-sm); padding: 0 16px; font-size: var(--font-size-base); outline: none; transition: border-color 0.2s; }
.form-item input:focus { border-color: var(--color-primary); background: #fff; }
.code-row { display: flex; gap: 12px; align-items: flex-end; }
.code-input-wrap { flex: 1; }
.code-input-wrap input { width: 100%; }
.btn-code { height: 48px; padding: 0 16px; font-size: var(--font-size-sm); background: var(--color-primary-light); color: var(--color-primary); border: 1px solid var(--color-primary); border-radius: var(--radius-sm); cursor: pointer; white-space: nowrap; font-weight: 600; }
.btn-code:disabled { background: var(--color-bg); color: var(--color-text-muted); border-color: var(--color-border); cursor: not-allowed; }
.btn-login { width: 100%; height: 50px; background: var(--color-primary-gradient); color: #fff; border: none; border-radius: var(--radius-round); font-size: var(--font-size-lg); font-weight: 600; cursor: pointer; margin-top: 24px; transition: all 0.2s ease; }
.btn-login:active { transform: translateY(1px) scale(0.98); box-shadow: var(--shadow-sm); }
.links { text-align: center; margin-top: 20px; }
.link { font-size: var(--font-size-sm); color: var(--color-primary); cursor: pointer; }
.mock-hint { text-align: center; margin-top: 12px; color: var(--color-text-muted); font-size: var(--font-size-xs); background: var(--color-bg); padding: 8px; border-radius: var(--radius-sm); }
</style>
