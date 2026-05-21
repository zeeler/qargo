<template>
  <div class="page">
    <header class="page-header">
      <span class="back-btn" @click="router.back()">←</span>
      <h2>客服中心</h2>
      <span></span>
    </header>

    <!-- FAQ -->
    <div class="section">
      <div class="section-title">常见问题</div>
      <div class="faq-item" v-for="faq in faqs" :key="faq.q">
        <div class="faq-question" @click="faq.open = !faq.open">
          <span>{{ faq.q }}</span>
          <span class="faq-arrow" :class="{ open: faq.open }">›</span>
        </div>
        <div class="faq-answer" v-if="faq.open">
          <p>{{ faq.a }}</p>
        </div>
      </div>
    </div>

    <!-- Contact Form -->
    <div class="section">
      <div class="section-title">联系我们</div>
      <div class="form">
        <div class="form-group">
          <input v-model="form.name" placeholder="您的姓名" />
        </div>
        <div class="form-group">
          <input v-model="form.phone" placeholder="手机号" maxlength="11" type="tel" />
        </div>
        <div class="form-group">
          <textarea v-model="form.content" placeholder="请描述您的问题" rows="4"></textarea>
        </div>
        <button class="btn-submit" @click="handleSubmit" :disabled="!formValid || submitting">
          {{ submitting ? '提交中...' : '提交反馈' }}
        </button>
        <p class="submit-tip" v-if="submitted">✅ 感谢您的反馈，我们会尽快处理</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { http } from '../../utils/http';

const router = useRouter();

const faqs = reactive([
  { q: '如何下单？', a: '在首页选择取货地址和收货地址，选择车型后点击"立即下单"，填写货物信息和联系人信息，确认后即可提交订单。', open: false },
  { q: '如何支付？', a: '下单后可选择微信支付或支付宝支付。点击"确认下单"后进入订单详情，点击"去支付"按钮完成支付即可。', open: false },
  { q: '如何取消订单？', a: '在订单详情页点击"取消订单"按钮，确认后即可取消。已完成的订单不可取消。', open: false },
  { q: '货物损坏怎么办？', a: '如发现货物在运输过程中损坏，请在订单详情页点击"投诉订单"提交投诉，上传货物照片并描述损坏情况，我们将尽快处理。', open: false },
  { q: '如何成为司机？', a: '在个人中心点击"成为司机"，填写个人信息和车辆信息后提交，等待管理员审核通过后即可开始接单。', open: false },
  { q: '如何开具发票？', a: '订单完成后，可在个人中心的"发票管理"中申请开具电子发票。该功能正在开发中，敬请期待。', open: false },
]);

const form = reactive({ name: '', phone: '', content: '' });
const submitting = ref(false);
const submitted = ref(false);

const formValid = computed(() => {
  return form.name.trim() && /^1[3-9]\d{9}$/.test(form.phone) && form.content.trim();
});

async function handleSubmit() {
  if (!formValid.value) return;
  submitting.value = true;
  try {
    await http.post('/feedback', { ...form });
    submitted.value = true;
    form.name = '';
    form.phone = '';
    form.content = '';
  } catch (e: any) {
    alert(e.message || '提交失败');
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.page { min-height: 100vh; background: var(--color-bg); }

.page-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #fff; position: sticky; top: 0; z-index: 10; border-bottom: 1px solid var(--color-border); }
.page-header h2 { font-size: var(--font-size-lg); font-weight: 700; }
.back-btn { cursor: pointer; font-size: 20px; color: var(--color-text); width: 32px; }

.section { background: var(--color-card); margin: 0 0 8px; padding: 0 16px; }
.section-title { padding: 12px 0 6px; font-size: var(--font-size-xs); color: var(--color-text-muted); }

/* FAQ */
.faq-item { border-bottom: 1px solid var(--color-divider); }
.faq-item:last-child { border-bottom: none; }
.faq-question { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; cursor: pointer; font-size: var(--font-size-base); color: var(--color-text); }
.faq-question:active { background: var(--color-bg); margin: 0 -16px; padding-left: 16px; padding-right: 16px; }
.faq-arrow { font-size: 18px; color: var(--color-border); transition: transform 0.2s; }
.faq-arrow.open { transform: rotate(90deg); }
.faq-answer { padding: 0 0 14px; font-size: var(--font-size-sm); color: var(--color-text-muted); line-height: 1.6; }

/* Form */
.form { padding: 8px 0 20px; }
.form-group { margin-bottom: 12px; }
.form-group input, .form-group textarea { width: 100%; padding: 10px 12px; border: 1px solid var(--color-border); border-radius: 8px; font-size: var(--font-size-base); box-sizing: border-box; font-family: inherit; }
.form-group textarea { resize: vertical; }
.btn-submit { width: 100%; height: 44px; background: var(--color-primary-gradient); color: #fff; border: none; border-radius: var(--radius-round); font-size: var(--font-size-base); cursor: pointer; margin-top: 4px; }
.btn-submit:disabled { opacity: 0.4; }
.submit-tip { text-align: center; margin-top: 12px; font-size: var(--font-size-sm); color: #4caf50; }
</style>
