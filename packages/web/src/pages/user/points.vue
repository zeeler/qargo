<template>
  <div class="page">
    <header class="page-header">
      <span class="back-btn" @click="router.back()">←</span>
      <h2>积分中心</h2>
      <span></span>
    </header>

    <!-- Balance Card -->
    <div class="balance-card">
      <p class="balance-label">我的积分</p>
      <p class="balance-amount">{{ balance }}</p>
      <p class="balance-sub">下单支付即送积分，1元=1分</p>
    </div>

    <!-- Redeem -->
    <div class="section">
      <div class="section-title">积分兑换优惠券</div>
      <div class="redeem-grid">
        <div class="redeem-card" v-for="rule in rules" :key="rule.points">
          <div class="redeem-info">
            <p class="redeem-value">¥{{ rule.couponValue }}</p>
            <p class="redeem-type">满减券</p>
            <p class="redeem-cost">{{ rule.points }}积分</p>
          </div>
          <button class="btn-redeem" @click="handleRedeem(rule.points)" :disabled="balance < rule.points">
            {{ balance < rule.points ? '积分不足' : '兑换' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Transactions -->
    <div class="section">
      <div class="section-title">积分记录</div>
      <div class="empty-state" v-if="transactions.length === 0">暂无记录</div>
      <div class="tx-list" v-else>
        <div class="tx-item" v-for="tx in transactions" :key="tx.id">
          <div class="tx-left">
            <span class="tx-icon">{{ tx.type === 'earn' ? '🎁' : '🎫' }}</span>
            <div>
              <p class="tx-type">{{ tx.type === 'earn' ? '下单赠送' : '兑换优惠券' }}</p>
              <p class="tx-time">{{ formatTime(tx.createdAt) }}</p>
            </div>
          </div>
          <div class="tx-right">
            <p class="tx-amount" :class="tx.type === 'earn' ? 'earn' : 'redeem'">
              {{ tx.type === 'earn' ? '+' : '-' }}{{ tx.amount }}
            </p>
            <p class="tx-balance">余额 {{ tx.balanceAfter }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { http } from '../../utils/http';

interface PointsData {
  id: string;
  userId: string;
  balance: number;
}

interface Tx {
  id: string;
  userId: string;
  type: 'earn' | 'redeem';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: string;
}

interface RedeemRule {
  points: number;
  couponType: string;
  couponValue: number;
  minOrderAmount: number;
}

const router = useRouter();
const balance = ref(0);
const transactions = ref<Tx[]>([]);
const rules = ref<RedeemRule[]>([]);

async function fetchPoints() {
  try {
    const p: PointsData = await http.get('/points');
    balance.value = p.balance;
  } catch (e: any) { alert(e.message || '加载失败'); }
}

async function fetchTransactions() {
  try {
    transactions.value = await http.get('/points/transactions');
  } catch { /* ignore */ }
}

async function fetchRules() {
  try {
    rules.value = await http.get('/points/rules');
  } catch { /* ignore */ }
}

async function handleRedeem(points: number) {
  if (!confirm(`确定使用${points}积分兑换？`)) return;
  try {
    const result = await http.post('/points/redeem', { points });
    balance.value = result.balance;
    alert(`兑换成功！获得优惠券 ${result.coupon.code}`);
    await fetchTransactions();
  } catch (e: any) { alert(e.message || '兑换失败'); }
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

onMounted(() => {
  fetchPoints();
  fetchTransactions();
  fetchRules();
});
</script>

<style scoped>
.page { min-height: 100vh; background: var(--color-bg); }
.page-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #fff; position: sticky; top: 0; z-index: 10; border-bottom: 1px solid var(--color-border); }
.page-header h2 { font-size: var(--font-size-lg); font-weight: 700; }
.back-btn { cursor: pointer; font-size: 20px; color: var(--color-text); width: 32px; }

.balance-card { margin: 16px; padding: 28px 24px; background: linear-gradient(135deg, #ff9a3c, #ff6b35); border-radius: var(--radius-md); text-align: center; color: #fff; }
.balance-label { font-size: var(--font-size-sm); opacity: 0.85; margin-bottom: 8px; }
.balance-amount { font-size: 44px; font-weight: 700; margin-bottom: 8px; }
.balance-sub { font-size: var(--font-size-xs); opacity: 0.7; }

.section { background: var(--color-card); margin: 0 0 8px; padding: 0 16px; }
.section-title { padding: 12px 0 6px; font-size: var(--font-size-xs); color: var(--color-text-muted); }
.empty-state { padding: 30px 0; text-align: center; color: var(--color-text-muted); font-size: var(--font-size-sm); }

.redeem-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; padding: 8px 0 16px; }
.redeem-card { border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 14px 10px; text-align: center; }
.redeem-info { margin-bottom: 10px; }
.redeem-value { font-size: 22px; font-weight: 700; color: var(--color-text); }
.redeem-type { font-size: var(--font-size-xs); color: var(--color-text-muted); }
.redeem-cost { font-size: var(--font-size-xs); color: var(--color-primary); margin-top: 4px; }
.btn-redeem { width: 100%; padding: 6px 0; border: 1px solid var(--color-primary); border-radius: var(--radius-round); background: #fff; color: var(--color-primary); font-size: var(--font-size-sm); cursor: pointer; }
.btn-redeem:disabled { border-color: var(--color-border); color: var(--color-text-muted); cursor: not-allowed; }

.tx-list { }
.tx-item { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid var(--color-divider); }
.tx-item:last-child { border-bottom: none; }
.tx-left { display: flex; align-items: center; gap: 12px; }
.tx-icon { font-size: 20px; }
.tx-type { font-size: var(--font-size-base); color: var(--color-text); }
.tx-time { font-size: var(--font-size-xs); color: var(--color-text-muted); margin-top: 2px; }
.tx-right { text-align: right; }
.tx-amount { font-size: var(--font-size-base); font-weight: 600; }
.tx-amount.earn { color: #4caf50; }
.tx-amount.redeem { color: var(--color-danger); }
.tx-balance { font-size: var(--font-size-xs); color: var(--color-text-muted); margin-top: 2px; }
</style>
