import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi, userApi } from '../utils/api';
import router from '../router';

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '');
  const user = ref<any>(JSON.parse(localStorage.getItem('user') || 'null'));

  const isLoggedIn = computed(() => !!token.value);
  const isDriver = computed(() => user.value?.role === 'driver' || user.value?.role === 'admin');
  const isAdmin = computed(() => user.value?.role === 'admin');

  async function sendCode(phone: string) {
    await authApi.sendCode(phone);
  }

  async function register(data: { phone: string; code: string; name: string; defaultAddress?: string }) {
    const res: any = await authApi.register(data);
    token.value = res.accessToken;
    localStorage.setItem('token', res.accessToken);
    await fetchProfile();
  }

  async function login(data: { phone: string; code: string }) {
    const res: any = await authApi.login(data);
    token.value = res.accessToken;
    localStorage.setItem('token', res.accessToken);
    await fetchProfile();
  }

  async function fetchProfile() {
    try {
      user.value = await userApi.getProfile();
      localStorage.setItem('user', JSON.stringify(user.value));
    } catch (e) {
      console.error('Failed to fetch profile', e);
    }
  }

  function logout() {
    token.value = '';
    user.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/auth/login');
  }

  return { token, user, isLoggedIn, isDriver, isAdmin, sendCode, register, login, fetchProfile, logout };
});
