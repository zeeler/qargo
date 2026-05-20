<template>
  <div class="page">
    <header class="page-header">
      <span class="back-btn" @click="router.back()">←</span>
      <h2>我的钱包</h2>
      <span></span>
    </header>

    <!-- Balance Card -->
    <div class="balance-card">
      <p class="balance-label">余额（元）</p>
      <p class="balance-amount">{{ balance.toFixed(2) }}</p>
      <div class="balance-actions">
        <button class="btn-action" @click="openTopup">充值</button>
        <button class="btn-action secondary" disabled>提现</button>
      </div>
    </div>

    <!-- Transactions -->
    <div class="section">
      <div class="section-title">交易记录</div>
      <div class="empty-state" v-if="transactions.length === 0 && !loading">
        <p>暂无交易记录</p>
      </div>
      <div class="transaction-list" v-else>
        <div class="tx-item" v-for="tx in transactions" :key="tx.id">
          <div class="tx-left">
            <span class="tx-icon">{{ tx.type === 'topup' ? '↓' : '↑' }}</span>
            <div>
              <p class="tx-type">{{ tx.type === 'topup' ? '充值' : '退款' }}</p>
              <p class="tx-time">{{ formatTime(tx.createdAt) }}</p>
            </div>
          </div>
          <div class="tx-right">
            <p class="tx-amount" :class="tx.type === 'topup' ? 'positive' : 'negative'">
              {{ tx.type === 'topup' ? '+' : '-' }}{{ Number(tx.amount).toFixed(2) }}
            </p>
            <p class="tx-balance">余额 {{ Number(tx.balanceAfter).toFixed(2) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Topup Modal -->
    <div class="modal-overlay" v-if="showTopup" @click.self="showTopup = false">
      <div class="modal-content">
        <h3>充值</h3>
        <div class="amount-grid">
          <div class="amount-item" :class="{ selected: topupAmount === 50 }" @click="topupAmount = 50">¥50</div>
          <div class="amount-item" :class="{ selected: topupAmount === 100 }" @click="topupAmount = 100">¥100</div>
          <div class="amount-item" :class="{ selected: topupAmount === 200 }" @click="topupAmount = 200">¥200</div>
          <div class="amount-item" :class="{ selected: topupAmount === 500 }" @click="topupAmount = 500">¥500</div>
        </div>
        <div class="form-actions">
          <button class="btn-cancel" @click="showTopup = false">取消</button>
          <button class="btn-save" @click="handleTopup" :disabled="topupping">确认充值</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { http } from '../../utils/http';

interface WalletData {
  id: string;
  userId: string;
  balance: number;
}

interface Transaction {
  id: string;
  walletId: string;
  type: 'topup' | 'refund';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: string;
}

const router = useRouter();
const balance = ref(0);
const walletId = ref('');
const transactions = ref<Transaction[]>([]);
const loading = ref(true);
const showTopup = ref(false);
const topupAmount = ref(100);
const topupping = ref(false);

async function fetchWallet() {
  try {
    const wallet: WalletData = await http.get('/wallet');
    balance.value = Number(wallet.balance);
    walletId.value = wallet.id;
  } catch (e: any) {
    alert(e.message || '加载钱包失败');
  }
}

async function fetchTransactions() {
  loading.value = true;
  try {
    transactions.value = await http.get('/wallet/transactions');
  } catch (e: any) {
    alert(e.message || '加载交易记录失败');
  } finally {
    loading.value = false;
  }
}

function openTopup() {
  topupAmount.value = 100;
  showTopup.value = true;
}

async function handleTopup() {
  topupping.value = true;
  try {
    const result = await http.post('/wallet/topup', { amount: topupAmount.value });
    balance.value = Number(result.balance);
    showTopup.value = false;
    await fetchTransactions();
  } catch (e: any) {
    alert(e.message || '充值失败');
  } finally {
    topupping.value = false;
  }
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

onMounted(() => {
  fetchWallet();
  fetchTransactions();
});
</script>

<style scoped>
.page { min-height: 100vh; background: var(--color-bg); }

.page-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #fff; position: sticky; top: 0; z-index: 10; border-bottom: 1px solid var(--color-border); }
.page-header h2 { font-size: var(--font-size-lg); font-weight: 700; }
.back-btn { cursor: pointer; font-size: 20px; color: var(--color-text); width: 32px; }

/* Balance Card */
.balance-card { margin: 16px; padding: 32px 24px; background: var(--color-primary-gradient); border-radius: var(--radius-md); text-align: center; color: #fff; }
.balance-label { font-size: var(--font-size-sm); opacity: 0.85; margin-bottom: 8px; }
.balance-amount { font-size: 40px; font-weight: 700; letter-spacing: 1px; margin-bottom: 24px; }
.balance-actions { display: flex; gap: 12px; justify-content: center; }
.btn-action { padding: 10px 40px; background: rgba(255,255,255,0.2); color: #fff; border: 1px solid rgba(255,255,255,0.3); border-radius: var(--radius-round); font-size: var(--font-size-base); cursor: pointer; transition: background 0.2s; }
.btn-action:active { background: rgba(255,255,255,0.35); }
.btn-action.secondary { opacity: 0.5; }
.btn-action.secondary:disabled { cursor: not-allowed; }

/* Transactions */
.section { background: var(--color-card); margin: 0 0 8px; padding: 0 16px; }
.section-title { padding: 12px 0 6px; font-size: var(--font-size-xs); color: var(--color-text-muted); }
.empty-state { padding: 40px 0; text-align: center; color: var(--color-text-muted); font-size: var(--font-size-sm); }

.transaction-list { }
.tx-item { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid var(--color-divider); }
.tx-item:last-child { border-bottom: none; }
.tx-left { display: flex; align-items: center; gap: 12px; }
.tx-icon { width: 32px; height: 32px; border-radius: 50%; background: var(--color-bg); display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
.tx-type { font-size: var(--font-size-base); color: var(--color-text); }
.tx-time { font-size: var(--font-size-xs); color: var(--color-text-muted); margin-top: 2px; }
.tx-right { text-align: right; }
.tx-amount { font-size: var(--font-size-base); font-weight: 600; }
.tx-amount.positive { color: #4caf50; }
.tx-amount.negative { color: var(--color-danger); }
.tx-balance { font-size: var(--font-size-xs); color: var(--color-text-muted); margin-top: 2px; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 100; display: flex; align-items: flex-end; }
.modal-content { width: 100%; background: #fff; border-radius: 16px 16px 0 0; padding: 24px 16px 32px; }
.modal-content h3 { font-size: var(--font-size-lg); margin-bottom: 20px; }
.amount-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
.amount-item { padding: 16px; text-align: center; border: 2px solid var(--color-border); border-radius: var(--radius-md); font-size: var(--font-size-lg); font-weight: 600; cursor: pointer; transition: all 0.2s; }
.amount-item.selected { border-color: var(--color-primary); color: var(--color-primary); background: rgba(255,107,53,0.05); }
.form-actions { display: flex; gap: 12px; }
.btn-cancel { flex: 1; height: 48px; border: 1px solid var(--color-border); border-radius: var(--radius-round); background: #fff; color: var(--color-text); font-size: var(--font-size-base); cursor: pointer; }
.btn-save { flex: 1; height: 48px; border: none; border-radius: var(--radius-round); background: var(--color-primary-gradient); color: #fff; font-size: var(--font-size-base); cursor: pointer; }
.btn-save:disabled { opacity: 0.5; }
</style>
