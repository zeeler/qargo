# 常用地址管理 — 设计文档

## 概述

为用户个人中心新增"常用地址"管理页面，替换现有占位符（`alert("功能开发中")`）。后端补齐更新接口。

## 后端

### 新增接口

- `PUT /user/addresses/:id` — 更新地址。接收 `UpdateAddressDto`（字段与 CreateAddressDto 相同，全部可选）。需校验地址属于当前用户。

### 文件改动

| 文件 | 改动 |
|------|------|
| `user.service.ts` | 新增 `updateAddress(userId, addressId, dto)` 方法 |
| `user.controller.ts` | 新增 `@Put('addresses/:id')` 路由 |
| `user.dto.ts` | 新增 `UpdateAddressDto`，所有字段 `@IsOptional()` |

## 前端

### 新页面：`pages/user/addresses.vue`

- **地址列表**：卡片形式展示每条地址（标签、详细地址、联系人、手机号、默认标记）
- **新增地址**：底部按钮 → 弹出表单（复用首页 mock 地址建议列表），字段：label/tag、详细地址、联系人、手机号
- **编辑地址**：点击卡片 → 弹出表单（与新增共用），预填当前值
- **删除地址**：卡片上删除按钮 → 确认弹窗 → 调用 `DELETE /user/addresses/:id`
- **设为默认**：卡片上按钮 → 调用 `PUT /user/addresses/:id` 设置 `isDefault: true`
- **空状态**：无地址时显示引导文案 + 新增按钮

### 路由

- `/user/addresses` → `pages/user/addresses.vue`

### 菜单

- `profile.vue` 中"常用地址"菜单项改为 `router.push('/user/addresses')`

## 不涉及

- 共享类型（UserAddress/CreateAddressDto 已存在）
- 数据库（UserAddress 模型完整）
- 管理后台
