<template>
  <div class="page">
    <header class="page-header">
      <span class="back-btn" @click="router.back()">←</span>
      <h2>发票管理</h2>
      <span></span>
    </header>

    <!-- Empty -->
    <div class="empty-state" v-if="invoices.length === 0 && !loading">
      <span class="empty-icon">📊</span>
      <p>暂无发票</p>
      <button class="btn-add" @click="showForm = true">申请开票</button>
    </div>

    <!-- Invoice List -->
    <div class="section" v-else>
      <div class="section-title">我的发票 <span class="count">({{ invoices.length }})</span></div>
      <div class="invoice-card" v-for="inv in invoices" :key="inv.id">
        <div class="inv-left">
          <p class="inv-no">{{ inv.invoiceNo }}</p>
          <p class="inv-title">{{ inv.title }}</p>
          <p class="inv-order">{{ inv.order.orderNo }}</p>
        </div>
        <div class="inv-right">
          <p class="inv-amount">¥{{ Number(inv.amount).toFixed(2) }}</p>
          <span class="inv-status" :class="inv.status">{{ inv.status === 'issued' ? '已开具' : '待开具' }}</span>
        </div>
      </div>
      <button class="btn-add-bottom" @click="showForm = true">+ 申请开票</button>
    </div>

    <!-- Apply Form -->
    <div class="modal-overlay" v-if="showForm" @click.self="showForm = false">
      <div class="modal-content">
        <h3>申请开票</h3>
        <div class="form-group">
          <label>选择订单</label>
          <select v-model="form.orderId">
            <option value="" disabled>请选择已完成订单</option>
            <option v-for="o in completedOrders" :key="o.id" :value="o.id">
              {{ o.orderNo }} — ¥{{ o.totalPrice }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>发票类型</label>
          <div class="type-toggle">
            <span :class="{ active: form.type === 'personal' }" @click="form.type = 'personal'">个人</span>
            <span :class="{ active: form.type === 'company' }" @click="form.type = 'company'">企业</span>
          </div>
        </div>
        <div class="form-group">
          <label>发票抬头</label>
          <input v-model="form.title" placeholder="个人姓名或公司名称" />
        </div>
        <div class="form-group" v-if="form.type === 'company'">
          <label>税号</label>
          <input v-model="form.taxNumber" placeholder="企业税号" />
        </div>
        <div class="form-actions">
          <button class="btn-cancel" @click="showForm = false">取消</button>
          <button class="btn-save" @click="handleSubmit" :disabled="!formValid || submitting">提交</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { http } from '../../utils/http';

interface Invoice {
  id: string;
  orderId: string;
  type: string;
  title: string;
  taxNumber: string | null;
  amount: number;
  invoiceNo: string;
  status: string;
  order: { orderNo: string; totalPrice: number };
}

interface Order {
  id: string;
  orderNo: string;
  totalPrice: number;
}

const router = useRouter();
const invoices = ref<Invoice[]>([]);
const completedOrders = ref<Order[]>([]);
const loading = ref(true);
const showForm = ref(false);
const submitting = ref(false);

const form = ref({ orderId: '', type: 'personal' as string, title: '', taxNumber: '' });

const formValid = computed(() => form.value.orderId && form.value.title.trim());

async function fetchInvoices() {
  loading.value = true;
  try { invoices.value = await http.get('/invoice'); } catch { /* ignore */ }
  finally { loading.value = false; }
}

async function fetchCompletedOrders() {
  try {
    const orders = await http.get('/order/list');
    completedOrders.value = (orders as Order[])
      .filter((o: any) => o.status === 'completed')
      .filter((o: any) => !invoices.value.some(inv => inv.orderId === o.id));
  } catch { /* ignore */ }
}

async function handleSubmit() {
  if (!formValid.value) return;
  submitting.value = true;
  try {
    await http.post('/invoice', { ...form.value });
    showForm.value = false;
    form.value = { orderId: '', type: 'personal', title: '', taxNumber: '' };
    await fetchInvoices();
  } catch (e: any) { alert(e.message || '提交失败'); }
  finally { submitting.value = false; }
}

onMounted(() => { fetchInvoices(); fetchCompletedOrders(); });
</script>

<style scoped>
.page { min-height: 100vh; background: var(--color-bg); }
.page-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #fff; position: sticky; top: 0; z-index: 10; border-bottom: 1px solid var(--color-border); }
.page-header h2 { font-size: var(--font-size-lg); font-weight: 700; }
.back-btn { cursor: pointer; font-size: 20px; color: var(--color-text); width: 32px; }

.empty-state { display: flex; flex-direction: column; align-items: center; padding: 80px 16px; }
.empty-icon { font-size: 48px; margin-bottom: 16px; }
.empty-state p { color: var(--color-text-muted); margin-bottom: 20px; }
.btn-add { padding: 10px 32px; background: var(--color-primary-gradient); color: #fff; border: none; border-radius: var(--radius-round); font-size: var(--font-size-base); cursor: pointer; }

.section { background: var(--color-card); margin: 0 0 8px; padding: 0 16px; }
.section-title { padding: 12px 0 6px; font-size: var(--font-size-xs); color: var(--color-text-muted); }
.count { color: var(--color-primary); }

.invoice-card { display: flex; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid var(--color-divider); }
.invoice-card:last-child { border-bottom: none; }
.inv-no { font-size: var(--font-size-sm); color: var(--color-text-muted); }
.inv-title { font-size: var(--font-size-base); font-weight: 600; color: var(--color-text); margin: 2px 0; }
.inv-order { font-size: var(--font-size-xs); color: var(--color-text-muted); }
.inv-right { text-align: right; }
.inv-amount { font-size: var(--font-size-base); font-weight: 600; color: var(--color-text); }
.inv-status { font-size: 11px; padding: 2px 8px; border-radius: 8px; }
.inv-status.pending { background: #fff3e0; color: #ff9800; }
.inv-status.issued { background: #e8f5e9; color: #4caf50; }

.btn-add-bottom { width: 100%; padding: 14px 0; border: none; background: transparent; color: var(--color-primary); font-size: var(--font-size-base); cursor: pointer; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 100; display: flex; align-items: flex-end; }
.modal-content { width: 100%; background: #fff; border-radius: 16px 16px 0 0; padding: 24px 16px 32px; max-height: 80vh; overflow-y: auto; }
.modal-content h3 { font-size: var(--font-size-lg); margin-bottom: 20px; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; font-size: var(--font-size-sm); color: var(--color-text-muted); margin-bottom: 6px; }
.form-group input, .form-group select { width: 100%; height: 44px; padding: 0 12px; border: 1px solid var(--color-border); border-radius: 8px; font-size: var(--font-size-base); box-sizing: border-box; background: #fff; }
.type-toggle { display: flex; gap: 0; border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden; }
.type-toggle span { flex: 1; text-align: center; padding: 10px 0; cursor: pointer; font-size: var(--font-size-sm); background: #fff; }
.type-toggle span.active { background: var(--color-primary-gradient); color: #fff; }
.form-actions { display: flex; gap: 12px; margin-top: 24px; }
.btn-cancel { flex: 1; height: 44px; border: 1px solid var(--color-border); border-radius: var(--radius-round); background: #fff; color: var(--color-text); font-size: var(--font-size-base); cursor: pointer; }
.btn-save { flex: 1; height: 44px; border: none; border-radius: var(--radius-round); background: var(--color-primary-gradient); color: #fff; font-size: var(--font-size-base); cursor: pointer; }
.btn-save:disabled { opacity: 0.4; }
</style>
