<template>
  <div class="page">
    <header class="page-header">
      <span class="back-btn" @click="router.back()">←</span>
      <h2>设置</h2>
      <span></span>
    </header>

    <!-- 紧急联系人 -->
    <div class="section">
      <div class="section-title">紧急联系人</div>
      <div class="menu-item" @click="openContactForm">
        <span class="menu-icon">🆘</span>
        <span class="menu-label">紧急联系人</span>
        <span class="menu-value" v-if="emergencyContact.name">{{ emergencyContact.name }} {{ emergencyContact.phone }}</span>
        <span class="menu-value placeholder" v-else>未设置</span>
        <span class="menu-arrow">›</span>
      </div>
    </div>

    <!-- 消息通知 -->
    <div class="section">
      <div class="section-title">消息通知</div>
      <div class="menu-item">
        <span class="menu-icon">📢</span>
        <span class="menu-label">订单状态更新</span>
        <label class="switch">
          <input type="checkbox" v-model="settings.orderNotification" @change="saveSettings">
          <span class="slider"></span>
        </label>
      </div>
      <div class="menu-item">
        <span class="menu-icon">💬</span>
        <span class="menu-label">司机消息</span>
        <label class="switch">
          <input type="checkbox" v-model="settings.driverMessage" @change="saveSettings">
          <span class="slider"></span>
        </label>
      </div>
    </div>

    <!-- 隐私 -->
    <div class="section">
      <div class="section-title">隐私</div>
      <div class="menu-item">
        <span class="menu-icon">🔒</span>
        <span class="menu-label">对司机隐藏手机号</span>
        <label class="switch">
          <input type="checkbox" v-model="settings.hidePhone" @change="saveSettings">
          <span class="slider"></span>
        </label>
      </div>
    </div>

    <!-- 通用 -->
    <div class="section">
      <div class="section-title">通用</div>
      <div class="menu-item" @click="clearCache">
        <span class="menu-icon">🧹</span>
        <span class="menu-label">清除缓存</span>
        <span class="menu-arrow">›</span>
      </div>
      <div class="menu-item" @click="checkUpdate">
        <span class="menu-icon">🔄</span>
        <span class="menu-label">检查更新</span>
        <span class="menu-value version-tag">v1.0.0</span>
        <span class="menu-arrow">›</span>
      </div>
    </div>

    <!-- 关于 -->
    <div class="section">
      <div class="section-title">关于</div>
      <div class="menu-item" @click="showComingSoon('用户协议')">
        <span class="menu-icon">📄</span>
        <span class="menu-label">用户协议</span>
        <span class="menu-arrow">›</span>
      </div>
      <div class="menu-item" @click="showComingSoon('隐私政策')">
        <span class="menu-icon">🛡️</span>
        <span class="menu-label">隐私政策</span>
        <span class="menu-arrow">›</span>
      </div>
      <div class="menu-item">
        <span class="menu-icon">📱</span>
        <span class="menu-label">版本号</span>
        <span class="menu-value version-tag">v1.0.0</span>
      </div>
    </div>

    <!-- 退出登录 -->
    <div class="logout-section">
      <button class="btn-logout" @click="handleLogout">退出登录</button>
    </div>

    <!-- 紧急联系人弹窗 -->
    <div class="modal-overlay" v-if="showContactModal" @click.self="closeContactForm">
      <div class="modal-content">
        <h3>紧急联系人</h3>
        <div class="form-group">
          <label>姓名</label>
          <input v-model="contactForm.name" placeholder="请输入联系人姓名" />
        </div>
        <div class="form-group">
          <label>手机号</label>
          <input v-model="contactForm.phone" placeholder="请输入手机号" maxlength="11" type="tel" />
        </div>
        <div class="form-actions">
          <button class="btn-text" v-if="emergencyContact.name" @click="removeContact">清空联系人</button>
          <button class="btn-cancel" @click="closeContactForm">取消</button>
          <button class="btn-save" @click="saveContact" :disabled="!contactValid">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

interface AppSettings {
  orderNotification: boolean;
  driverMessage: boolean;
  hidePhone: boolean;
}

interface EmergencyContact {
  name: string;
  phone: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  orderNotification: true,
  driverMessage: true,
  hidePhone: false,
};

const router = useRouter();
const authStore = useAuthStore();

const settings = reactive<AppSettings>({ ...DEFAULT_SETTINGS });
const emergencyContact = reactive<EmergencyContact>({ name: '', phone: '' });
const showContactModal = ref(false);

const contactForm = reactive({ name: '', phone: '' });

const contactValid = computed(() => {
  return contactForm.name.trim() && /^1[3-9]\d{9}$/.test(contactForm.phone);
});

function loadSettings() {
  try {
    const saved = localStorage.getItem('app-settings');
    if (saved) Object.assign(settings, JSON.parse(saved));
  } catch { /* ignore */ }

  try {
    const saved = localStorage.getItem('emergency-contact');
    if (saved) Object.assign(emergencyContact, JSON.parse(saved));
  } catch { /* ignore */ }
}

function saveSettings() {
  localStorage.setItem('app-settings', JSON.stringify(settings));
}

function openContactForm() {
  contactForm.name = emergencyContact.name;
  contactForm.phone = emergencyContact.phone;
  showContactModal.value = true;
}

function closeContactForm() {
  showContactModal.value = false;
}

function saveContact() {
  if (!contactValid.value) return;
  emergencyContact.name = contactForm.name.trim();
  emergencyContact.phone = contactForm.phone;
  localStorage.setItem('emergency-contact', JSON.stringify({ name: emergencyContact.name, phone: emergencyContact.phone }));
  closeContactForm();
}

function removeContact() {
  emergencyContact.name = '';
  emergencyContact.phone = '';
  localStorage.removeItem('emergency-contact');
  closeContactForm();
}

function clearCache() {
  if (!confirm('确定清除缓存？将保留登录状态。')) return;
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  localStorage.clear();
  if (token) localStorage.setItem('token', token);
  if (user) localStorage.setItem('user', user);
  Object.assign(settings, { ...DEFAULT_SETTINGS });
  saveSettings();
  alert('缓存已清除');
}

function checkUpdate() {
  alert('已是最新版本');
}

function showComingSoon(name: string) {
  alert(`${name}功能开发中，敬请期待`);
}

function handleLogout() {
  if (confirm('确定退出登录？')) authStore.logout();
}

onMounted(loadSettings);
</script>

<style scoped>
.page { min-height: 100vh; background: var(--color-bg); }

.page-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #fff; position: sticky; top: 0; z-index: 10; border-bottom: 1px solid var(--color-border); }
.page-header h2 { font-size: var(--font-size-lg); font-weight: 700; }
.back-btn { cursor: pointer; font-size: 20px; color: var(--color-text); width: 32px; }

/* Sections */
.section { background: var(--color-card); margin: 0 0 8px; padding: 0 16px; }
.section-title { padding: 12px 0 6px; font-size: var(--font-size-xs); color: var(--color-text-muted); }

.menu-item { display: flex; align-items: center; padding: 14px 0; gap: 12px; cursor: pointer; border-bottom: 1px solid var(--color-divider); }
.menu-item:last-child { border-bottom: none; }
.menu-item:active { background: var(--color-bg); }
.menu-icon { font-size: 18px; flex-shrink: 0; }
.menu-label { font-size: var(--font-size-base); color: var(--color-text); flex: 1; }
.menu-value { font-size: var(--font-size-sm); color: var(--color-text); }
.menu-value.placeholder { color: var(--color-text-muted); }
.version-tag { color: var(--color-text-muted) !important; }
.menu-arrow { color: var(--color-border); font-size: 18px; flex-shrink: 0; }

/* Switch */
.switch { position: relative; display: inline-block; width: 48px; height: 28px; flex-shrink: 0; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; inset: 0; background: #ccc; border-radius: 28px; transition: 0.2s; }
.slider::before { content: ''; position: absolute; height: 22px; width: 22px; left: 3px; bottom: 3px; background: #fff; border-radius: 50%; transition: 0.2s; }
.switch input:checked + .slider { background: var(--color-primary-gradient); }
.switch input:checked + .slider::before { transform: translateX(20px); }

/* Logout */
.logout-section { padding: 20px 12px; }
.btn-logout { width: 100%; height: 48px; background: var(--color-card); color: var(--color-danger); border: 1px solid var(--color-border); border-radius: var(--radius-round); font-size: var(--font-size-base); cursor: pointer; transition: all 0.2s ease; }
.btn-logout:active { background: #fce4ec; transform: scale(0.98); }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 100; display: flex; align-items: flex-end; }
.modal-content { width: 100%; background: #fff; border-radius: 16px 16px 0 0; padding: 24px 16px 32px; }
.modal-content h3 { font-size: var(--font-size-lg); margin-bottom: 20px; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; font-size: var(--font-size-sm); color: var(--color-text-muted); margin-bottom: 6px; }
.form-group input { width: 100%; height: 44px; padding: 0 12px; border: 1px solid var(--color-border); border-radius: 8px; font-size: var(--font-size-base); box-sizing: border-box; }
.form-actions { display: flex; gap: 12px; margin-top: 24px; align-items: center; }
.btn-text { flex: 1; height: 44px; border: none; background: transparent; color: var(--color-danger); font-size: var(--font-size-sm); cursor: pointer; text-align: left; }
.btn-cancel { flex: 1; height: 44px; border: 1px solid var(--color-border); border-radius: var(--radius-round); background: #fff; color: var(--color-text); font-size: var(--font-size-base); cursor: pointer; }
.btn-save { flex: 1; height: 44px; border: none; border-radius: var(--radius-round); background: var(--color-primary-gradient); color: #fff; font-size: var(--font-size-base); cursor: pointer; }
.btn-save:disabled { opacity: 0.4; }
</style>
