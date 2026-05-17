<template>
  <div class="page">
    <div class="section">
      <h3 class="section-title">个人信息</h3>
      <div class="form-item"><input v-model="realName" placeholder="真实姓名" /></div>
      <div class="form-item"><input v-model="idCard" placeholder="身份证号" /></div>
      <div class="form-item"><input v-model="licenseInfo" placeholder="驾驶证号" /></div>
    </div>

    <div class="section">
      <h3 class="section-title">车辆信息</h3>
      <div class="form-item"><input v-model="vehicle.brand" placeholder="品牌" /></div>
      <div class="form-item"><input v-model="vehicle.model" placeholder="型号" /></div>
      <div class="form-item"><input v-model="vehicle.color" placeholder="颜色" /></div>
      <div class="form-item"><input v-model="vehicle.plateNumber" placeholder="车牌号" /></div>
      <div class="form-item">
        <select v-model="vehicle.vehicleTypeCode" class="input">
          <option value="" disabled>选择车型</option>
          <option v-for="vt in types" :key="vt.code" :value="vt.code">{{ vt.name }}</option>
        </select>
      </div>
      <div class="form-row">
        <input v-model.number="vehicle.length" placeholder="车长(m)" type="number" class="half" />
        <input v-model.number="vehicle.width" placeholder="车宽(m)" type="number" class="half" />
      </div>
      <div class="form-item"><input v-model.number="vehicle.height" placeholder="车高(m)" type="number" /></div>
      <div class="form-item"><input v-model="vehicle.vin" placeholder="车架号" /></div>
    </div>

    <button class="btn-submit" @click="handleRegister">提交注册</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { driverApi, vehicleApi } from '../../utils/api';

const router = useRouter();
const realName = ref(''); const idCard = ref(''); const licenseInfo = ref('');
const vehicle = ref({ brand: '', model: '', color: '', plateNumber: '', vehicleTypeCode: '', length: 0, width: 0, height: 0, vin: '' });
const types = ref<any[]>([]);

onMounted(async () => { try { types.value = (await vehicleApi.getTypes()) ; } catch (e) { /* ok */ } });

async function handleRegister() {
  if (!realName.value || !idCard.value || !vehicle.value.plateNumber) { alert('请填写完整信息'); return; }
  try {
    await driverApi.register({ realName: realName.value, idCard: idCard.value, licenseInfo: licenseInfo.value, vehicle: vehicle.value });
    alert('注册成功，等待审核');
    router.push('/');
  } catch (e: any) { alert(e?.response?.data?.message || '注册失败'); }
}
</script>

<style scoped>
.page { padding: 16px; }
.section { background: var(--color-card); border-radius: var(--radius-md); padding: 16px; margin-bottom: 12px; box-shadow: var(--shadow-card); border: 1px solid var(--color-border); }
.section-title { font-size: var(--font-size-h3); font-weight: 700; margin-bottom: 12px; }
.form-item { margin-bottom: 12px; }
.form-item input, .input { width: 100%; height: 44px; background: var(--color-bg); border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: 0 12px; font-size: var(--font-size-base); outline: none; transition: border-color 0.2s; }
.form-item input:focus, .input:focus { border-color: var(--color-primary); }
.form-row { display: flex; gap: 12px; margin-bottom: 12px; }
.half { flex: 1; height: 44px; background: var(--color-bg); border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: 0 12px; font-size: var(--font-size-base); outline: none; }
select.input { appearance: auto; }
.btn-submit { width: 100%; height: 50px; background: var(--color-primary-gradient); color: #fff; border: none; border-radius: var(--radius-round); font-size: var(--font-size-lg); font-weight: 600; cursor: pointer; margin-top: 12px; transition: all 0.2s ease; }
.btn-submit:active { transform: translateY(1px) scale(0.98); box-shadow: var(--shadow-sm); }
</style>
