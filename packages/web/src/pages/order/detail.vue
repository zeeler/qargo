<template>
  <div class="page">
    <!-- Header -->
    <header class="page-header">
      <span class="back-btn" @click="router.back()">←</span>
      <h2>订单详情</h2>
      <span class="home-btn" @click="router.push('/')">🏠</span>
    </header>

    <!-- Status Bar -->
    <div class="status-bar" :class="o?.status">
      <h2>{{ statusMap[o?.status] || '订单详情' }}</h2>
      <p class="order-no">订单号：{{ o?.orderNo }}</p>
    </div>

    <!-- Status Progress -->
    <div class="progress-section" v-if="o && !['cancelled', 'disputed'].includes(o.status)">
      <div class="progress-track">
        <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
      </div>
      <div class="progress-steps">
        <div v-for="step in progressSteps" :key="step.key" class="progress-step" :class="{ done: step.done, current: step.current }">
          <span class="step-dot"></span>
          <span class="step-label">{{ step.label }}</span>
        </div>
      </div>
    </div>

    <!-- Address Info -->
    <div class="section">
      <div class="addr-block">
        <div class="addr-row">
          <span class="dot pickup"></span>
          <div class="addr-content">
            <span class="addr-tag">取</span>
            <div>
              <span class="addr-text">{{ o?.pickupAddress }}</span>
              <span class="addr-contact" v-if="o">联系人：{{ o.pickupContactName }} {{ o.pickupContactPhone }}</span>
            </div>
          </div>
        </div>
        <div class="addr-divider-line"></div>
        <div class="addr-row">
          <span class="dot dropoff"></span>
          <div class="addr-content">
            <span class="addr-tag send">送</span>
            <div>
              <span class="addr-text">{{ o?.dropoffAddress }}</span>
              <span class="addr-contact" v-if="o">联系人：{{ o.dropoffContactName }} {{ o.dropoffContactPhone }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Driver Info -->
    <div class="section" v-if="o?.driver">
      <div class="sec-title">🚛 司机信息</div>
      <div class="driver-card">
        <div class="driver-avatar">{{ o.driver.user?.name?.[0] || '司' }}</div>
        <div class="driver-info">
          <span class="driver-name">{{ o.driver.user?.name || '未命名' }}</span>
          <span class="driver-plate">{{ o.driver.vehicle?.plateNumber || '' }}</span>
          <span class="driver-vehicle-type" v-if="o.driver.vehicle?.vehicleTypeName">{{ o.driver.vehicle.vehicleTypeName }}</span>
        </div>
        <a class="driver-call" v-if="o.driver.user?.phone" :href="'tel:' + o.driver.user.phone">📞</a>
      </div>
    </div>

    <!-- Price Breakdown -->
    <div class="section">
      <div class="sec-title">📊 费用明细</div>
      <div class="price-row">
        <span>起步价（含{{ o?.includedKm || 5 }}km）</span>
        <span>¥{{ o?.basePrice || 0 }}</span>
      </div>
      <div class="price-row" v-if="o?.distancePrice > 0">
        <span>里程费 {{ o?.distanceKm }}km</span>
        <span>¥{{ o?.distancePrice }}</span>
      </div>
      <div class="price-row" v-if="o?.surgeFee > 0">
        <span>高峰期加价</span>
        <span>¥{{ o?.surgeFee }}</span>
      </div>
      <div class="price-row" v-if="o?.userAdditionalFee > 0">
        <span>用户加价</span>
        <span class="tip-highlight">+¥{{ o?.userAdditionalFee }}</span>
      </div>
      <div class="price-row total">
        <span>合计</span>
        <span class="total-num">¥{{ o?.totalPrice }}</span>
      </div>
    </div>

    <!-- Remark -->
    <div class="section" v-if="o?.remark">
      <div class="sec-title">📝 备注</div>
      <p class="remark-text">{{ o.remark }}</p>
    </div>

    <!-- Payment Method -->
    <div class="section" v-if="o?.payment?.method">
      <div class="sec-title">💳 支付方式</div>
      <span>{{ o.payment.method === 'wechat' ? '微信支付' : '支付宝' }}</span>
    </div>

    <!-- Photos -->
    <div class="section" v-if="o?.cargoPhotos?.length">
      <div class="sec-title">📸 货物照片（{{ o.cargoPhotos.length }}张）</div>
      <div class="photo-grid">
        <div v-for="(photo, i) in o.cargoPhotos" :key="i" class="photo-item">
          <span>📷 照片 {{ i + 1 }}</span>
        </div>
      </div>
    </div>

    <!-- Timestamps -->
    <div class="section" v-if="o">
      <div class="sec-title">⏱️ 时间记录</div>
      <div class="time-row"><span>创建</span><span>{{ formatTime(o.createdAt) }}</span></div>
      <div class="time-row" v-if="o.paidAt"><span>支付</span><span>{{ formatTime(o.paidAt) }}</span></div>
      <div class="time-row" v-if="o.dispatchedAt"><span>接单</span><span>{{ formatTime(o.dispatchedAt) }}</span></div>
      <div class="time-row" v-if="o.arrivedAt"><span>到达</span><span>{{ formatTime(o.arrivedAt) }}</span></div>
      <div class="time-row" v-if="o.completedAt"><span>完成</span><span>{{ formatTime(o.completedAt) }}</span></div>
    </div>

    <!-- Actions -->
    <div class="action-section" v-if="o">
      <button v-if="o.status === 'pending'" class="btn-pay" @click="showPayDialog = true">去支付 ¥{{ o.totalPrice }}</button>
      <button v-if="['pending', 'paid'].includes(o.status)" class="btn-cancel" @click="showCancelConfirm = true">取消订单</button>
      <div v-if="!['pending', 'paid', 'cancelled', 'disputed'].includes(o.status)" class="status-hint">
        <span v-if="o.status === 'dispatched'">司机正在前往取货...</span>
        <span v-else-if="['arrived', 'loading'].includes(o.status)">司机正在装货...</span>
        <span v-else-if="o.status === 'delivering'">司机正在送货中...</span>
        <span v-else-if="o.status === 'completed'">🎉 订单已完成</span>
      </div>
    </div>

    <!-- Review (completed only) -->
    <div class="section" v-if="o?.status === 'completed'">
      <div class="sec-title">⭐ 评价司机</div>
      <div v-if="existingReview" class="review-done">
        <div class="review-stars">{{ '★'.repeat(existingReview.rating) }}{{ '☆'.repeat(5 - existingReview.rating) }}</div>
        <p class="review-content" v-if="existingReview.content">{{ existingReview.content }}</p>
      </div>
      <button v-else class="btn-review" @click="showReviewDialog = true">评价司机</button>
    </div>

    <!-- Complaint (paid ~ completed, not disputed) -->
    <div class="section" v-if="canComplain">
      <button class="btn-complaint" @click="showComplaintDialog = true">投诉订单</button>
    </div>

    <div style="height:40px"></div>

    <!-- WeChat Pay Dialog -->
    <div class="dialog-overlay" v-if="showPayDialog && o?.payment?.method === 'wechat'" @click.self="showPayDialog = false">
      <div class="dialog wechat-pay-dialog">
        <div class="wechat-header">
          <span class="wechat-brand">微信支付</span>
          <span class="wechat-close" @click="showPayDialog = false">✕</span>
        </div>
        <div class="wechat-amount-section">
          <span class="wechat-yuan">¥</span>
          <span class="wechat-num">{{ o?.totalPrice }}</span>
        </div>
        <div class="wechat-merchant">
          <span class="wechat-merchant-label">收款方</span>
          <span class="wechat-merchant-name">Cargo 货运平台</span>
        </div>
        <div class="wechat-divider"></div>
        <div class="wechat-pay-method-row">
          <span class="wechat-pay-icon">💳</span>
          <span>零钱</span>
          <span class="wechat-check">✓</span>
        </div>
        <div class="wechat-divider"></div>
        <button class="wechat-pay-btn" :disabled="paying" @click="handlePay">
          {{ paying ? '支付中...' : '立即支付' }}
        </button>
      </div>
    </div>

    <!-- Alipay Dialog -->
    <div class="dialog-overlay" v-if="showPayDialog && o?.payment?.method === 'alipay'" @click.self="showPayDialog = false">
      <div class="dialog alipay-dialog">
        <div class="alipay-header">
          <span class="alipay-logo">支</span>
          <span class="alipay-brand">支付宝</span>
        </div>
        <div class="alipay-body">
          <div class="alipay-amount-label">付款金额</div>
          <div class="alipay-amount">¥ {{ o?.totalPrice }}</div>
          <div class="alipay-info-row">
            <span>收款方</span>
            <span>Cargo 货运平台</span>
          </div>
          <div class="alipay-info-row">
            <span>付款方式</span>
            <span>花呗</span>
          </div>
          <div class="alipay-info-row">
            <span>订单号</span>
            <span>{{ o?.orderNo }}</span>
          </div>
        </div>
        <div class="alipay-actions">
          <button class="alipay-cancel-btn" @click="showPayDialog = false">取消</button>
          <button class="alipay-confirm-btn" :disabled="paying" @click="handlePay">
            {{ paying ? '支付中...' : '确认付款' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Pay Result Dialog -->
    <div class="dialog-overlay" v-if="payResult">
      <div class="dialog result-dialog">
        <span class="result-icon" :class="payResult">{{ payResult === 'success' ? '✅' : '❌' }}</span>
        <h3>{{ payResult === 'success' ? '支付成功' : '支付失败' }}</h3>
        <p v-if="payResult === 'success'">订单已提交，等待司机接单</p>
        <p v-else>请重试或更换支付方式</p>
        <button class="btn-confirm-pay" @click="closePayResult">{{ payResult === 'success' ? '查看订单' : '重新支付' }}</button>
      </div>
    </div>

    <!-- Cancel Confirm Dialog -->
    <div class="dialog-overlay" v-if="showCancelConfirm" @click.self="showCancelConfirm = false">
      <div class="dialog">
        <h3>确认取消订单？</h3>
        <p class="dialog-hint">取消后无法恢复，确定要取消此订单吗？</p>
        <div class="dialog-actions">
          <button class="btn-dialog-cancel" @click="showCancelConfirm = false">再想想</button>
          <button class="btn-dialog-danger" @click="handleCancel">确认取消</button>
        </div>
      </div>
    </div>

    <!-- Review Dialog -->
    <div class="dialog-overlay" v-if="showReviewDialog" @click.self="showReviewDialog = false">
      <div class="dialog">
        <h3>评价司机</h3>
        <div class="star-picker">
          <span v-for="s in 5" :key="s" class="star-btn" :class="{ active: reviewRating >= s }" @click="reviewRating = s">
            {{ reviewRating >= s ? '★' : '☆' }}
          </span>
        </div>
        <textarea class="dialog-textarea" v-model="reviewContent" placeholder="说说你的体验（选填）..." maxlength="200"></textarea>
        <div class="dialog-actions">
          <button class="btn-dialog-cancel" @click="showReviewDialog = false">取消</button>
          <button class="btn-confirm-pay" @click="handleReview" :disabled="submittingReview">
            {{ submittingReview ? '提交中...' : '提交评价' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Complaint Dialog -->
    <div class="dialog-overlay" v-if="showComplaintDialog" @click.self="showComplaintDialog = false">
      <div class="dialog">
        <h3>投诉订单</h3>
        <div class="complaint-types">
          <span v-for="t in complaintTypeOptions" :key="t.value" class="complaint-type-tag" :class="{ active: complaintType === t.value }" @click="complaintType = t.value">
            {{ t.label }}
          </span>
        </div>
        <textarea class="dialog-textarea" v-model="complaintContent" placeholder="请描述具体问题..." maxlength="500"></textarea>
        <div class="dialog-actions">
          <button class="btn-dialog-cancel" @click="showComplaintDialog = false">取消</button>
          <button class="btn-dialog-danger" @click="handleComplaint" :disabled="submittingComplaint || !complaintContent.trim()">
            {{ submittingComplaint ? '提交中...' : '提交投诉' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useOrderStore } from '../../stores/order';
import { reviewApi, complaintApi } from '../../utils/api';

const route = useRoute();
const router = useRouter();
const orderStore = useOrderStore();

const o = ref<any>(null);
const showPayDialog = ref(false);
const showCancelConfirm = ref(false);
const payResult = ref<string | null>(null);
const paying = ref(false);

// Review state
const showReviewDialog = ref(false);
const reviewRating = ref(5);
const reviewContent = ref('');
const submittingReview = ref(false);
const existingReview = ref<any>(null);

// Complaint state
const showComplaintDialog = ref(false);
const complaintType = ref('service');
const complaintContent = ref('');
const submittingComplaint = ref(false);

const complaintTypeOptions = [
  { value: 'service', label: '服务态度' },
  { value: 'damage', label: '货物损坏' },
  { value: 'delay', label: '配送延迟' },
  { value: 'overcharge', label: '乱收费' },
  { value: 'missing', label: '货物丢失' },
  { value: 'other', label: '其他' },
];

const COMPLAINABLE_STATUSES = ['paid', 'dispatched', 'arrived', 'loading', 'delivering', 'completed'];

const canComplain = computed(() => {
  if (!o.value) return false;
  return COMPLAINABLE_STATUSES.includes(o.value.status);
});

const statusMap: Record<string, string> = {
  pending: '待支付', paid: '待接单', dispatched: '已接单',
  arrived: '已到达', loading: '装货中', delivering: '运输中',
  completed: '已完成', cancelled: '已取消', disputed: '纠纷中',
};

const statusOrder = ['pending', 'paid', 'dispatched', 'arrived', 'loading', 'delivering', 'completed'];
const stepLabels: Record<string, string> = {
  pending: '待支付', paid: '已支付', dispatched: '已接单',
  arrived: '已到达', loading: '装货中', delivering: '运输中', completed: '已完成',
};

const progressSteps = computed(() => {
  const currentIdx = statusOrder.indexOf(o.value?.status);
  return statusOrder.map((key, idx) => ({
    key,
    label: stepLabels[key],
    done: idx < currentIdx,
    current: idx === currentIdx,
  }));
});

const progressPercent = computed(() => {
  const currentIdx = statusOrder.indexOf(o.value?.status);
  if (currentIdx < 0) return 0;
  const steps = statusOrder.length - 1;
  return steps > 0 ? (currentIdx / steps) * 100 : 0;
});

onMounted(async () => {
  const id = route.query.id as string;
  if (id) {
    try {
      await orderStore.fetchOrderDetail(id);
      o.value = orderStore.currentOrder;
    } catch (e) {
      alert('订单不存在');
      router.back();
      return;
    }

    if (o.value?.status === 'completed') {
      try {
        existingReview.value = await reviewApi.getByOrder(id) as any;
      } catch (e) { /* no review yet */ }
    }
  }
});

async function handleReview() {
  if (!o.value || submittingReview.value) return;
  submittingReview.value = true;
  try {
    await reviewApi.create({
      orderId: o.value.id,
      rating: reviewRating.value,
      content: reviewContent.value.trim() || undefined,
    });
    existingReview.value = { rating: reviewRating.value, content: reviewContent.value.trim() };
    showReviewDialog.value = false;
  } catch (e: any) {
    alert(e?.response?.data?.message || '评价失败');
  }
  submittingReview.value = false;
}

async function handleComplaint() {
  if (!o.value || submittingComplaint.value || !complaintContent.value.trim()) return;
  submittingComplaint.value = true;
  try {
    await complaintApi.create({
      orderId: o.value.id,
      type: complaintType.value,
      content: complaintContent.value.trim(),
    });
    o.value.status = 'disputed';
    showComplaintDialog.value = false;
    alert('投诉已提交，客服将尽快处理');
  } catch (e: any) {
    alert(e?.response?.data?.message || '投诉失败');
  }
  submittingComplaint.value = false;
}

async function handlePay() {
  if (!o.value || paying.value) return;
  paying.value = true;
  try {
    await orderStore.payOrder(o.value.id);
    payResult.value = 'success';
    o.value.status = 'paid';
  } catch (e: any) {
    payResult.value = 'failed';
  }
  paying.value = false;
  showPayDialog.value = false;
}

function closePayResult() {
  payResult.value = null;
  if (o.value?.status === 'paid') {
    // refresh
    orderStore.fetchOrderDetail(o.value.id).then(() => { o.value = orderStore.currentOrder; });
  }
}

async function handleCancel() {
  if (!o.value) return;
  try {
    await orderStore.cancelOrder(o.value.id);
    showCancelConfirm.value = false;
    o.value.status = 'cancelled';
  } catch (e: any) {
    alert(e?.response?.data?.message || '取消失败');
  }
}

function formatTime(d: string) {
  if (!d) return '';
  const date = new Date(d);
  const m = date.getMonth() + 1;
  const day = date.getDate();
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${m}/${day} ${h}:${min}`;
}
</script>

<style scoped>
.page { min-height: 100vh; background: var(--color-bg); }

/* Header */
.page-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: var(--color-card); position: sticky; top: 0; z-index: 10; border-bottom: 1px solid var(--color-border); }
.page-header h2 { font-size: var(--font-size-lg); font-weight: 700; }
.back-btn { cursor: pointer; font-size: 20px; color: var(--color-text); width: 32px; }
.home-btn { cursor: pointer; font-size: 18px; width: 32px; text-align: right; }

/* Status Bar */
.status-bar { padding: 20px 16px; color: #fff; text-align: center; }
.status-bar.pending { background: var(--color-primary-gradient); }
.status-bar.paid, .status-bar.dispatched { background: linear-gradient(135deg, #2196f3, #1976d2); }
.status-bar.arrived, .status-bar.loading { background: linear-gradient(135deg, var(--color-warning), #f57c00); }
.status-bar.delivering { background: linear-gradient(135deg, #4caf50, #388e3c); }
.status-bar.completed { background: linear-gradient(135deg, var(--color-success), #05a050); }
.status-bar.cancelled { background: linear-gradient(135deg, #999, #777); }
.status-bar.disputed { background: linear-gradient(135deg, #e74c3c, #c0392b); }
.status-bar h2 { font-size: var(--font-size-xl); margin: 0; }
.order-no { font-size: var(--font-size-xs); opacity: 0.85; margin-top: 4px; }

/* Progress */
.progress-section { background: var(--color-card); margin: 0 16px 8px; border-radius: var(--radius-md); padding: 20px 16px 16px; box-shadow: var(--shadow-card); border: 1px solid var(--color-border); }
.progress-track { height: 4px; background: var(--color-border); border-radius: 2px; margin-bottom: 10px; position: relative; }
.progress-fill { height: 100%; background: var(--color-primary); border-radius: 2px; transition: width 0.5s ease; }
.progress-steps { display: flex; justify-content: space-between; }
.progress-step { display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1; }
.step-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--color-border); }
.progress-step.done .step-dot { background: var(--color-primary); }
.progress-step.current .step-dot { background: var(--color-primary); box-shadow: 0 0 0 4px rgba(74,158,78,0.25); width: 10px; height: 10px; }
.step-label { font-size: 10px; color: var(--color-text-muted); white-space: nowrap; }
.progress-step.done .step-label, .progress-step.current .step-label { color: var(--color-primary); font-weight: 600; }
.progress-step.current .step-label { font-size: 11px; }

/* Sections */
.section { background: var(--color-card); margin: 8px 16px; border-radius: var(--radius-md); padding: 16px; box-shadow: var(--shadow-card); border: 1px solid var(--color-border); }
.sec-title { font-size: var(--font-size-base); font-weight: 700; margin-bottom: 12px; }

/* Address */
.addr-block { display: flex; flex-direction: column; }
.addr-row { display: flex; gap: 10px; }
.dot { width: 10px; height: 10px; border-radius: 50%; margin-top: 5px; flex-shrink: 0; }
.dot.pickup { background: var(--color-success); }
.dot.dropoff { background: var(--color-danger); }
.addr-divider-line { width: 1px; flex: 1; border-left: 1px dashed var(--color-border); margin: 4px 0 4px 4px; min-height: 12px; }
.addr-content { display: flex; gap: 8px; align-items: flex-start; padding: 4px 0; flex: 1; }
.addr-tag { padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 600; color: #fff; background: var(--color-success); flex-shrink: 0; white-space: nowrap; }
.addr-tag.send { background: var(--color-danger); }
.addr-text { font-size: var(--font-size-sm); color: var(--color-text); display: block; }
.addr-contact { font-size: var(--font-size-xs); color: var(--color-text-muted); display: block; margin-top: 2px; }

/* Driver Card */
.driver-card { display: flex; align-items: center; gap: 12px; }
.driver-avatar { width: 48px; height: 48px; border-radius: 50%; background: var(--color-primary); color: #fff; font-size: var(--font-size-lg); font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.driver-info { flex: 1; display: flex; flex-direction: column; }
.driver-name { font-size: var(--font-size-base); font-weight: 600; }
.driver-plate { font-size: var(--font-size-sm); color: var(--color-text-secondary); }
.driver-vehicle-type { font-size: var(--font-size-xs); color: var(--color-text-muted); }
.driver-call { font-size: 28px; text-decoration: none; cursor: pointer; flex-shrink: 0; }

/* Price */
.price-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: var(--font-size-sm); color: var(--color-text-secondary); }
.price-row.total { border-top: 1px solid var(--color-divider); padding-top: 10px; margin-top: 6px; font-size: var(--font-size-base); font-weight: 700; color: var(--color-text); }
.total-num { color: var(--color-primary); font-size: var(--font-size-xl); }
.tip-highlight { color: var(--color-warning); font-weight: 600; }

.remark-text { font-size: var(--font-size-sm); color: var(--color-text-secondary); }

/* Time */
.time-row { display: flex; justify-content: space-between; padding: 3px 0; font-size: var(--font-size-sm); color: var(--color-text-secondary); }

/* Photos */
.photo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.photo-item { aspect-ratio: 1; background: var(--color-bg); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; font-size: var(--font-size-sm); color: var(--color-text-muted); }

/* Actions */
.action-section { padding: 16px 12px; display: flex; flex-direction: column; gap: 10px; }
.btn-pay { width: 100%; height: 50px; background: var(--color-primary); color: #fff; border: none; border-radius: var(--radius-round); font-size: var(--font-size-lg); font-weight: 600; cursor: pointer; }
.btn-pay:active { background: var(--color-primary-dark); }
.btn-cancel { width: 100%; height: 44px; background: var(--color-card); color: var(--color-text-secondary); border: 1px solid var(--color-border); border-radius: var(--radius-round); font-size: var(--font-size-base); cursor: pointer; }
.status-hint { text-align: center; font-size: var(--font-size-base); color: var(--color-text-secondary); padding: 12px; }

/* Dialogs */
.dialog-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 24px; }
.dialog { background: var(--color-card); border-radius: var(--radius-lg); padding: 24px; width: 100%; max-width: 320px; text-align: center; box-shadow: var(--shadow-raised); }
.dialog h3 { font-size: var(--font-size-lg); margin-bottom: 12px; }
.dialog-hint { font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-bottom: 20px; }
.pay-amount { display: flex; flex-direction: column; gap: 4px; margin: 16px 0; }
.pay-label { font-size: var(--font-size-sm); color: var(--color-text-muted); }
.pay-num { font-size: 36px; font-weight: 700; color: var(--color-primary); }
.pay-method { font-size: var(--font-size-base); margin-bottom: 16px; color: var(--color-text-secondary); }
.result-icon { font-size: 56px; display: block; margin-bottom: 12px; }
.result-dialog h3 { font-size: var(--font-size-xl); }
.result-dialog p { font-size: var(--font-size-sm); color: var(--color-text-muted); margin-bottom: 16px; }
.btn-confirm-pay { width: 100%; height: 48px; background: var(--color-primary); color: #fff; border: none; border-radius: var(--radius-round); font-size: var(--font-size-lg); font-weight: 600; cursor: pointer; margin-bottom: 8px; }
.btn-confirm-pay:active { background: var(--color-primary-dark); }
.btn-confirm-pay:disabled { background: #ccc; }
.btn-dialog-cancel { width: 100%; height: 44px; background: var(--color-bg); color: var(--color-text-secondary); border: none; border-radius: var(--radius-round); font-size: var(--font-size-base); cursor: pointer; }
.dialog-actions { display: flex; gap: 10px; }
.dialog-actions button { flex: 1; }
.btn-dialog-danger { height: 44px; background: var(--color-danger); color: #fff; border: none; border-radius: var(--radius-round); font-size: var(--font-size-base); cursor: pointer; }

/* Review */
.btn-review { width: 100%; height: 44px; background: var(--color-primary-gradient); color: #fff; border: none; border-radius: var(--radius-round); font-size: var(--font-size-base); font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
.btn-review:active { transform: translateY(1px) scale(0.98); }
.review-done { text-align: center; }
.review-stars { font-size: 28px; color: #f5a623; letter-spacing: 4px; }
.review-content { font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-top: 8px; }

.star-picker { display: flex; justify-content: center; gap: 12px; margin: 16px 0; }
.star-btn { font-size: 40px; color: var(--color-border); cursor: pointer; transition: color 0.15s; user-select: none; }
.star-btn.active { color: #f5a623; }

.dialog-textarea { width: 100%; min-height: 80px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: 10px; font-size: var(--font-size-sm); resize: vertical; margin-bottom: 12px; box-sizing: border-box; font-family: inherit; }
.dialog-textarea:focus { outline: none; border-color: var(--color-primary); }

/* Complaint */
.btn-complaint { width: 100%; height: 44px; background: var(--color-card); color: var(--color-text-secondary); border: 1px solid var(--color-border); border-radius: var(--radius-round); font-size: var(--font-size-base); cursor: pointer; }
.btn-complaint:active { background: var(--color-bg); }
.complaint-types { display: flex; flex-wrap: wrap; gap: 8px; margin: 16px 0; }
.complaint-type-tag { padding: 6px 14px; border: 1px solid var(--color-border); border-radius: 20px; font-size: var(--font-size-sm); cursor: pointer; transition: all 0.15s; }
.complaint-type-tag.active { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }

/* WeChat Pay Dialog */
.wechat-pay-dialog {
  background: var(--color-card);
  border-radius: 12px;
  padding: 0;
  width: 100%;
  max-width: 320px;
  text-align: center;
  overflow: hidden;
}
.wechat-header {
  background: #07C160;
  color: #fff;
  padding: 14px 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}
.wechat-brand {
  font-size: 17px;
  font-weight: 600;
  letter-spacing: 1px;
}
.wechat-close {
  position: absolute;
  right: 16px;
  font-size: 18px;
  cursor: pointer;
  opacity: 0.8;
}
.wechat-amount-section {
  padding: 28px 16px 8px;
}
.wechat-yuan {
  font-size: 24px;
  font-weight: 400;
  color: #333;
  vertical-align: top;
}
.wechat-num {
  font-size: 48px;
  font-weight: 700;
  color: #333;
  line-height: 1;
}
.wechat-merchant {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  font-size: 14px;
  color: #888;
}
.wechat-merchant-name {
  color: #333;
  font-weight: 500;
}
.wechat-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 0 16px;
}
.wechat-pay-method-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  font-size: 15px;
  color: #333;
}
.wechat-pay-icon {
  font-size: 18px;
}
.wechat-check {
  margin-left: auto;
  color: #07C160;
  font-weight: 700;
  font-size: 16px;
}
.wechat-pay-btn {
  display: block;
  width: calc(100% - 32px);
  margin: 20px 16px 24px;
  height: 48px;
  background: #07C160;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  letter-spacing: 2px;
}
.wechat-pay-btn:active { background: #06ad56; }
.wechat-pay-btn:disabled { background: #a0e0bf; }

/* Alipay Dialog */
.alipay-dialog {
  background: var(--color-card);
  border-radius: 12px;
  padding: 0;
  width: 100%;
  max-width: 320px;
  overflow: hidden;
}
.alipay-header {
  background: linear-gradient(135deg, #1677FF, #1677FF);
  color: #fff;
  padding: 18px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.alipay-logo {
  background: var(--color-card);
  color: #1677FF;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
}
.alipay-brand {
  font-size: 17px;
  font-weight: 600;
  letter-spacing: 1px;
}
.alipay-body {
  padding: 24px 16px 0;
  text-align: center;
}
.alipay-amount-label {
  font-size: 14px;
  color: #999;
  margin-bottom: 8px;
}
.alipay-amount {
  font-size: 40px;
  font-weight: 700;
  color: #1677FF;
  margin-bottom: 24px;
}
.alipay-info-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  font-size: 14px;
  color: #666;
  border-bottom: 1px solid #f5f5f5;
}
.alipay-info-row span:last-child {
  color: #333;
  font-weight: 500;
}
.alipay-actions {
  display: flex;
  gap: 0;
  margin-top: 24px;
  border-top: 1px solid #f0f0f0;
}
.alipay-cancel-btn {
  flex: 1;
  height: 52px;
  background: var(--color-card);
  color: #999;
  border: none;
  font-size: 16px;
  cursor: pointer;
  border-right: 1px solid #f0f0f0;
}
.alipay-cancel-btn:active { background: #f5f5f5; }
.alipay-confirm-btn {
  flex: 2;
  height: 52px;
  background: #1677FF;
  color: #fff;
  border: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 0 0 12px 0;
}
.alipay-confirm-btn:active { background: #1565d9; }
.alipay-confirm-btn:disabled { background: #93bff5; }
</style>
