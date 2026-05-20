# 常用地址管理 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为用户个人中心新增常用地址管理页面，支持新建、编辑、删除、设为默认地址。

**Architecture:** 后端补齐 `PUT /user/addresses/:id` 更新接口；前端新增 `/user/addresses` 页面，从 profile.vue 菜单跳转进入，通过 http 工具调用已有 API。

**Tech Stack:** NestJS (server), Vue 3 Composition API + Vue Router (web), Prisma (ORM)

---

### Task 1: 后端 — 新增 UpdateAddressDto

**Files:**
- Modify: `packages/server/src/modules/user/dto/user.dto.ts`

- [ ] **Step 1: 添加 UpdateAddressDto**

在 `user.dto.ts` 顶部 import 保留不变，在 `CreateAddressDto` 之后追加：

```typescript
export class UpdateAddressDto {
  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsNumber()
  lng?: number;

  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsString()
  contactName?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
```

- [ ] **Step 2: 编译检查**

```bash
cd packages/server && npx tsc --noEmit
```

Expected: No errors.

---

### Task 2: 后端 — 新增 updateAddress 服务方法

**Files:**
- Modify: `packages/server/src/modules/user/user.service.ts`

- [ ] **Step 1: 导入 UpdateAddressDto**

将第 3 行 import 改为：

```typescript
import { UpdateProfileDto, CreateAddressDto, UpdateAddressDto } from './dto/user.dto';
```

- [ ] **Step 2: 在 deleteAddress 方法之后、类结尾之前，添加 updateAddress 方法**

```typescript
async updateAddress(userId: string, addressId: string, dto: UpdateAddressDto) {
  if (dto.isDefault) {
    await this.prisma.userAddress.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }
  return this.prisma.userAddress.updateMany({
    where: { id: addressId, userId },
    data: dto,
  });
}
```

- [ ] **Step 3: 编译检查**

```bash
cd packages/server && npx tsc --noEmit
```

Expected: No errors.

---

### Task 3: 后端 — 新增 PUT 路由

**Files:**
- Modify: `packages/server/src/modules/user/user.controller.ts`

- [ ] **Step 1: 导入 UpdateAddressDto**

将第 3 行 import 改为：

```typescript
import { UpdateProfileDto, CreateAddressDto, UpdateAddressDto } from './dto/user.dto';
```

- [ ] **Step 2: 在 deleteAddress 方法之后、类结尾之前，添加 updateAddress 路由**

```typescript
@Put('addresses/:id')
updateAddress(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateAddressDto) {
  return this.userService.updateAddress(user.userId, id, dto);
}
```

- [ ] **Step 3: 编译检查**

```bash
cd packages/server && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: 重启服务器并验证 API**

```bash
# 重启服务器
kill $(lsof -i :3000 -t) 2>/dev/null; sleep 1
cd /Users/terry/Documents/cc_projects/open-trade && pnpm dev:server > /tmp/server.log 2>&1 &
sleep 4

# 获取用户 token
TOKEN=$(curl -s -X POST http://localhost:3000/auth/send-code -H "Content-Type: application/json" -d '{"phone":"13800000000"}' > /dev/null; curl -s -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d '{"phone":"13800000000","code":"123456"}' | python3 -c "import json,sys; print(json.load(sys.stdin)['accessToken'])")

# 创建地址
curl -s -X POST http://localhost:3000/user/addresses -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"label":"公司","address":"深圳南山科技园","lng":113.95,"lat":22.53,"contactName":"张三","contactPhone":"13800000000","isDefault":true}' | python3 -m json.tool

# 更新地址（用上一步返回的 id）
curl -s -X PUT http://localhost:3000/user/addresses/<id> -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"label":"新公司","address":"深圳福田保税区","lng":114.05,"lat":22.52}' | python3 -m json.tool
```

Expected: 创建返回地址对象，更新返回 `{ count: 1 }`。

- [ ] **Step 5: Commit**

```bash
git add packages/server/src/modules/user/dto/user.dto.ts packages/server/src/modules/user/user.service.ts packages/server/src/modules/user/user.controller.ts
git commit -m "feat: 新增地址更新接口 PUT /user/addresses/:id"
```

---

### Task 4: 前端 — 添加路由

**Files:**
- Modify: `packages/web/src/router/index.ts`

- [ ] **Step 1: 添加 addresses 路由**

在 routes 数组中，`/user/profile` 路由之后添加：

```typescript
{ path: '/user/addresses', name: 'userAddresses', component: () => import('../pages/user/addresses.vue') },
```

修改后的 routes 数组局部：

```typescript
{ path: '/user/profile', name: 'userProfile', component: () => import('../pages/user/profile.vue') },
{ path: '/user/addresses', name: 'userAddresses', component: () => import('../pages/user/addresses.vue') },
{ path: '/driver/register', name: 'driverRegister', component: () => import('../pages/driver/register.vue') },
```

- [ ] **Step 2: Commit**

```bash
git add packages/web/src/router/index.ts
git commit -m "feat: 添加 /user/addresses 路由"
```

---

### Task 5: 前端 — 创建地址管理页面

**Files:**
- Create: `packages/web/src/pages/user/addresses.vue`

- [ ] **Step 1: 创建页面文件**

```vue
<template>
  <div class="page">
    <header class="page-header">
      <span class="back-btn" @click="router.back()">←</span>
      <h2>常用地址</h2>
      <span></span>
    </header>

    <!-- 空状态 -->
    <div class="empty-state" v-if="addresses.length === 0 && !loading">
      <span class="empty-icon">📍</span>
      <p>暂无常用地址</p>
      <button class="btn-add-empty" @click="openForm()">新增地址</button>
    </div>

    <!-- 地址列表 -->
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

    <!-- 底部新增按钮 -->
    <div class="bottom-bar" v-if="addresses.length > 0">
      <button class="btn-add" @click="openForm()">+ 新增地址</button>
    </div>

    <!-- 编辑/新增弹窗 -->
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
          <!-- 地址建议 -->
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
import { ref, computed, onMounted } from 'vue';
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

// Mock address hints (same dataset as create.vue)
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
  return form.value.address && form.value.contactName && form.value.contactPhone.length === 11;
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
  } catch (e) {
    console.error('Failed to fetch addresses', e);
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

// Address autocomplete: filter hints when user types
import { watch } from 'vue';
watch(() => form.value.address, (val) => {
  if (!val || editingId.value) {
    addressHints.value = [];
    return;
  }
  const keyword = val.toLowerCase();
  addressHints.value = SZ_ADDRESSES.filter(h => h.name.toLowerCase().includes(keyword) || keyword.length === 0).slice(0, 5);
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

/* Header */
.page-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #fff; position: sticky; top: 0; z-index: 10; border-bottom: 1px solid var(--color-border); }
.page-header h2 { font-size: var(--font-size-lg); font-weight: 700; }
.back-btn { cursor: pointer; font-size: 20px; color: var(--color-text); width: 32px; }

/* Empty */
.empty-state { display: flex; flex-direction: column; align-items: center; padding: 80px 16px; }
.empty-icon { font-size: 48px; margin-bottom: 16px; }
.empty-state p { color: var(--color-text-muted); margin-bottom: 24px; }
.btn-add-empty { padding: 10px 32px; background: var(--color-primary-gradient); color: #fff; border: none; border-radius: var(--radius-round); font-size: var(--font-size-base); cursor: pointer; }

/* Address list */
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

/* Bottom bar */
.bottom-bar { padding: 16px; position: sticky; bottom: 0; background: var(--color-bg); }
.btn-add { width: 100%; height: 48px; background: var(--color-primary-gradient); color: #fff; border: none; border-radius: var(--radius-round); font-size: var(--font-size-base); cursor: pointer; }

/* Modal */
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
```

- [ ] **Step 2: 验证页面编译**

```bash
cd packages/web && npx vue-tsc --noEmit 2>&1 | head -20
```

Expected: No type errors.

- [ ] **Step 3: Commit**

```bash
git add packages/web/src/pages/user/addresses.vue
git commit -m "feat: 新增常用地址管理页面"
```

---

### Task 6: 前端 — 连接菜单

**Files:**
- Modify: `packages/web/src/pages/user/profile.vue:76`

- [ ] **Step 1: 修改"常用地址"菜单项**

将第 76 行：

```vue
<div class="menu-item" @click="showComingSoon('常用地址')">
```

改为：

```vue
<div class="menu-item" @click="router.push('/user/addresses')">
```

- [ ] **Step 2: commit**

```bash
git add packages/web/src/pages/user/profile.vue
git commit -m "feat: 常用地址菜单跳转地址管理页"
```

---

### Task 7: 端到端验证

- [ ] **Step 1: 确保所有服务运行**

```bash
# 检查服务
curl -s http://localhost:3000/vehicle/types | python3 -c "import json,sys; print('server OK, types:', len(json.load(sys.stdin)))"
curl -s http://localhost:5173/ | head -1 && echo "web OK"
```

- [ ] **Step 2: 浏览器中手动验证完整流程**

在 Chrome DevTools (iPhone 12 Pro 375px) 打开 http://localhost:5173：
1. 登录（管理员 13800000000 或普通用户）
2. 进入个人中心 → 点击"常用地址"
3. 新增地址：选择建议地址、填联系人、保存
4. 编辑地址：点击已有地址卡片、修改、保存
5. 设为默认：点击非默认地址的"设为默认"
6. 删除地址：点击删除、确认
7. 空状态：删除所有地址后显示引导
8. 返回个人中心

- [ ] **Step 3: Commit if any fixes**

```bash
git status
# 如有修改，提交修复
```
