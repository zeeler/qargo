<template>
  <div class="page">
    <header class="page-header">
      <span class="back-btn" @click="router.back()">←</span>
      <h2>常用地址</h2>
      <span></span>
    </header>

    <div class="empty-state" v-if="addresses.length === 0 && !loading">
      <span class="empty-icon">📍</span>
      <p>暂无常用地址</p>
      <button class="btn-add-empty" @click="openForm()">新增地址</button>
    </div>

    <div class="address-list" v-else>
      <div class="address-card" v-for="addr in addresses" :key="addr.id" @click="openForm(addr)">
        <div class="card-header">
          <span class="label-tag" :class="{ default: addr.isDefault }">{{ addr.label || '未命名' }}</span>
          <span class="default-badge" v-if="addr.isDefault">默认</span>
        </div>
        <p class="address-text">{{ addr.address }}</p>
        <p class="contact-info">{{ addr.contactName }} {{ addr.contactPhone }}</p>
        <div class="card-actions">
          <button class="action-btn" @click.stop="handleDelete(addr)">删除</button>
          <button class="action-btn primary" v-if="!addr.isDefault" @click.stop="setDefault(addr)">设为默认</button>
        </div>
      </div>
    </div>

    <div class="bottom-bar" v-if="addresses.length > 0">
      <button class="btn-add" @click="openForm()">+ 新增地址</button>
    </div>

    <div class="modal-overlay" v-if="showForm" @click.self="closeForm">
      <div class="modal-content">
        <h3>{{ editingId ? '编辑地址' : '新增地址' }}</h3>
        <div class="form-group">
          <label>标签</label>
          <input v-model="form.label" placeholder="如：公司、家" />
        </div>
        <div class="form-group">
          <label>详细地址</label>
          <input v-model="form.address" placeholder="请输入地址" />
          <div class="suggestions" v-if="addressHints.length > 0">
            <div class="suggestion-item" v-for="hint in addressHints" :key="hint.name" @click="selectHint(hint)">
              <span>{{ hint.name }}</span>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label>联系人</label>
          <input v-model="form.contactName" placeholder="请输入联系人" />
        </div>
        <div class="form-group">
          <label>手机号</label>
          <input v-model="form.contactPhone" placeholder="请输入手机号" maxlength="11" type="tel" />
        </div>
        <div class="form-actions">
          <button class="btn-cancel" @click="closeForm">取消</button>
          <button class="btn-save" @click="handleSave" :disabled="!formValid">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { http } from '../../utils/http';

interface Address {
  id: string;
  label: string | null;
  address: string;
  lng: number;
  lat: number;
  contactName: string;
  contactPhone: string;
  isDefault: boolean;
}

interface AddressHint {
  name: string;
  lng: number;
  lat: number;
}

const SZ_ADDRESSES: AddressHint[] = [
  { name: '深圳北站', lng: 114.03, lat: 22.61 },
  { name: '华强北商业街', lng: 114.09, lat: 22.55 },
  { name: '福田口岸', lng: 114.07, lat: 22.52 },
  { name: '南山科技园', lng: 113.95, lat: 22.53 },
  { name: '福田保税区', lng: 114.05, lat: 22.52 },
  { name: '罗湖商业城', lng: 114.12, lat: 22.54 },
];

const router = useRouter();
const addresses = ref<Address[]>([]);
const loading = ref(true);
const showForm = ref(false);
const editingId = ref<string | null>(null);
const addressHints = ref<AddressHint[]>([]);

const form = ref({
  label: '',
  address: '',
  lng: 0,
  lat: 0,
  contactName: '',
  contactPhone: '',
  isDefault: false,
});

const formValid = computed(() => {
  return form.value.address && form.value.contactName && /^1[3-9]\d{9}$/.test(form.value.contactPhone);
});

function resetForm() {
  form.value = { label: '', address: '', lng: 0, lat: 0, contactName: '', contactPhone: '', isDefault: false };
  editingId.value = null;
  addressHints.value = [];
}

async function fetchAddresses() {
  loading.value = true;
  try {
    addresses.value = await http.get('/user/addresses');
  } catch (e: any) {
    alert(e.message || '加载地址失败');
  } finally {
    loading.value = false;
  }
}

function openForm(addr?: Address) {
  resetForm();
  if (addr) {
    editingId.value = addr.id;
    form.value = {
      label: addr.label || '',
      address: addr.address,
      lng: addr.lng,
      lat: addr.lat,
      contactName: addr.contactName,
      contactPhone: addr.contactPhone,
      isDefault: addr.isDefault,
    };
  }
  showForm.value = true;
}

function closeForm() {
  showForm.value = false;
  resetForm();
}

watch(() => form.value.address, (val) => {
  if (!val || editingId.value) {
    addressHints.value = [];
    return;
  }
  const keyword = val.toLowerCase();
  addressHints.value = SZ_ADDRESSES.filter(h => h.name.toLowerCase().includes(keyword)).slice(0, 5);
});

function selectHint(hint: AddressHint) {
  form.value.address = hint.name;
  form.value.lng = hint.lng;
  form.value.lat = hint.lat;
  addressHints.value = [];
}

async function handleSave() {
  if (!formValid.value) return;
  try {
    if (editingId.value) {
      await http.put(`/user/addresses/${editingId.value}`, { ...form.value });
    } else {
      await http.post('/user/addresses', { ...form.value });
    }
    closeForm();
    await fetchAddresses();
  } catch (e: any) {
    alert(e.message || '保存失败');
  }
}

async function handleDelete(addr: Address) {
  if (!confirm(`确定删除地址"${addr.label || addr.address}"？`)) return;
  try {
    await http.delete(`/user/addresses/${addr.id}`);
    await fetchAddresses();
  } catch (e: any) {
    alert(e.message || '删除失败');
  }
}

async function setDefault(addr: Address) {
  try {
    await http.put(`/user/addresses/${addr.id}`, { isDefault: true });
    await fetchAddresses();
  } catch (e: any) {
    alert(e.message || '设置失败');
  }
}

onMounted(fetchAddresses);
</script>

<style scoped>
.page { min-height: 100vh; background: var(--color-bg); }
.page-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #fff; position: sticky; top: 0; z-index: 10; border-bottom: 1px solid var(--color-border); }
.page-header h2 { font-size: var(--font-size-lg); font-weight: 700; }
.back-btn { cursor: pointer; font-size: 20px; color: var(--color-text); width: 32px; }

.empty-state { display: flex; flex-direction: column; align-items: center; padding: 80px 16px; }
.empty-icon { font-size: 48px; margin-bottom: 16px; }
.empty-state p { color: var(--color-text-muted); margin-bottom: 24px; }
.btn-add-empty { padding: 10px 32px; background: var(--color-primary-gradient); color: #fff; border: none; border-radius: var(--radius-round); font-size: var(--font-size-base); cursor: pointer; }

.address-list { padding: 12px 16px; }
.address-card { background: var(--color-card); border-radius: var(--radius-md); padding: 16px; margin-bottom: 12px; cursor: pointer; transition: box-shadow 0.2s; }
.address-card:active { box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.card-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.label-tag { padding: 2px 10px; border-radius: 10px; font-size: 12px; background: var(--color-bg); color: var(--color-text-muted); }
.label-tag.default { background: var(--color-primary-gradient); color: #fff; }
.default-badge { font-size: 11px; color: var(--color-primary); padding: 2px 6px; border: 1px solid var(--color-primary); border-radius: 8px; }
.address-text { font-size: var(--font-size-base); color: var(--color-text); margin-bottom: 4px; }
.contact-info { font-size: var(--font-size-sm); color: var(--color-text-muted); margin-bottom: 12px; }
.card-actions { display: flex; gap: 8px; }
.action-btn { padding: 6px 16px; border: 1px solid var(--color-border); border-radius: var(--radius-round); font-size: var(--font-size-sm); background: transparent; color: var(--color-text); cursor: pointer; }
.action-btn.primary { color: var(--color-primary); border-color: var(--color-primary); }

.bottom-bar { padding: 16px; position: sticky; bottom: 0; background: var(--color-bg); }
.btn-add { width: 100%; height: 48px; background: var(--color-primary-gradient); color: #fff; border: none; border-radius: var(--radius-round); font-size: var(--font-size-base); cursor: pointer; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 100; display: flex; align-items: flex-end; }
.modal-content { width: 100%; background: #fff; border-radius: 16px 16px 0 0; padding: 24px 16px 32px; max-height: 80vh; overflow-y: auto; }
.modal-content h3 { font-size: var(--font-size-lg); margin-bottom: 20px; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; font-size: var(--font-size-sm); color: var(--color-text-muted); margin-bottom: 6px; }
.form-group input { width: 100%; height: 44px; padding: 0 12px; border: 1px solid var(--color-border); border-radius: 8px; font-size: var(--font-size-base); box-sizing: border-box; }
.suggestions { margin-top: 8px; border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden; }
.suggestion-item { padding: 10px 12px; cursor: pointer; font-size: var(--font-size-sm); }
.suggestion-item:active { background: var(--color-bg); }
.form-actions { display: flex; gap: 12px; margin-top: 24px; }
.btn-cancel { flex: 1; height: 44px; border: 1px solid var(--color-border); border-radius: var(--radius-round); background: #fff; color: var(--color-text); font-size: var(--font-size-base); cursor: pointer; }
.btn-save { flex: 1; height: 44px; border: none; border-radius: var(--radius-round); background: var(--color-primary-gradient); color: #fff; font-size: var(--font-size-base); cursor: pointer; }
.btn-save:disabled { opacity: 0.4; }
</style>
