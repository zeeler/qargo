# Cargo 快货 - 货运平台

同城货运 O2O 平台，支持用户下单、司机接单、管理后台三大核心场景，参考货拉拉业务模式设计。

## 功能介绍

### 用户端

- **注册/登录** — 手机号 + 短信验证码登录，支持用户/司机双角色
- **首页** — 地址选择、20 种车型展示、运费预估（基于 Haversine 距离 + 分段计价）
- **下单** — 填写货物信息、联系人、小费、支付方式
- **订单管理** — 查看全部/待支付/进行中/已完成订单，支持支付、取消
- **个人中心** — 个人资料、收货地址管理、订单入口

### 司机端

- **司机注册** — 实名信息 + 车辆信息提交，需管理员审核
- **附近订单** — 查看 10km 内待接订单，一键接单
- **运输流程** — 抵达装货地 → 拍照上传货物 → 出发 → 完成送达
- **位置上报** — 实时更新当前位置

### 管理后台

- **数据看板** — 用户数、司机数、订单数、交易额等 7 项统计
- **司机审核** — 审核/驳回司机注册申请
- **订单管理** — 查看全部订单，支持取消和完成操作
- **投诉处理** — 查看用户投诉并处理
- **定价管理** — 编辑各车型的基础价格、包含公里数、每公里单价

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端框架 | Vue 3 + TypeScript | Composition API |
| 构建工具 | Vite 5 | 开发服务器 + 生产构建 |
| 路由 | Vue Router 4 | 懒加载路由 |
| 状态管理 | Pinia 2 | 轻量级状态管理 |
| HTTP 客户端 | Axios | 请求拦截、Token 注入 |
| UI 组件库 (管理后台) | Naive UI 2.40 | 数据表格、表单、通知 |
| 后端框架 | NestJS 10 | 模块化架构、装饰器、守卫 |
| ORM | Prisma 5 | 类型安全的数据库操作 |
| 数据库 | PostgreSQL | 关系型数据库 |
| 认证 | JWT (Passport) | Bearer Token 认证 |
| 运行时 | Node.js >= 18 | 支持 ES2022 |
| 包管理 | pnpm >= 8 | Workspace Monorepo |

## 目录结构

```
open-trade/
├── packages/
│   ├── shared/                  # 共享类型和常量
│   │   └── src/
│   │       ├── constants/       # 枚举、车型定义、计价规则
│   │       └── types/           # DTO、VO 类型定义
│   ├── server/                  # NestJS 后端服务
│   │   ├── prisma/              # 数据库模型 + 迁移 + 种子数据
│   │   └── src/
│   │       ├── common/          # 装饰器 (@Public, @Roles, @CurrentUser)
│   │       │   └── guards/      # JWT 认证守卫、角色守卫
│   │       ├── prisma/          # Prisma 全局模块
│   │       └── modules/
│   │           ├── auth/        # 认证模块 (登录/注册/发验证码)
│   │           ├── user/        # 用户模块 (资料/地址)
│   │           ├── driver/      # 司机模块 (注册/状态/位置)
│   │           ├── vehicle/     # 车型模块 (类型/定价/费用计算)
│   │           ├── order/       # 订单模块 (CRUD/接单/运输流程)
│   │           ├── payment/     # 支付模块
│   │           ├── admin/       # 管理后台模块
│   │           └── sms/         # 短信服务 (Mock)
│   ├── web/                     # 用户端前端 (Vue 3)
│   │   └── src/
│   │       ├── pages/           # 页面组件
│   │       │   ├── home/        # 首页
│   │       │   ├── auth/        # 登录/注册
│   │       │   ├── order/       # 下单/订单列表/订单详情
│   │       │   ├── user/        # 个人中心
│   │       │   └── driver/      # 司机注册/附近订单/运输详情
│   │       ├── router/          # 路由配置
│   │       ├── stores/          # Pinia 状态管理
│   │       └── utils/           # API 封装、HTTP 工具
│   └── admin/                   # 管理后台前端 (Vue 3 + Naive UI)
│       └── src/
│           ├── views/           # 页面视图
│           │   ├── statistics/  # 数据看板
│           │   ├── order-list/  # 订单管理
│           │   ├── driver-review/ # 司机审核
│           │   ├── dispute/     # 投诉处理
│           │   └── pricing/     # 定价管理
│           ├── router/          # 路由配置
│           └── utils/           # API 封装
├── package.json                 # 根配置 + 统一脚本
├── pnpm-workspace.yaml          # 工作区配置
├── tsconfig.base.json           # 共享 TypeScript 配置
└── TEST_CASES.md                # 手动测试用例清单
```

## 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 8
- PostgreSQL（推荐 14+）

### 安装与配置

```bash
# 1. 安装依赖
pnpm install

# 2. 启动 PostgreSQL（Docker）
docker run -d --name open-trade-pg \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=open_trade \
  -p 5432:5432 \
  postgres:16-alpine

# 3. 配置环境变量
cp packages/server/.env.example packages/server/.env
# 默认 .env.example 已匹配上述 Docker 配置，无需修改

# 4. 构建共享包
pnpm build:shared

# 5. 数据库迁移 + 种子数据
pnpm db:migrate
pnpm db:seed
```

### 启动开发服务

```bash
# 终端 1：启动后端 (默认端口 3000)
pnpm dev:server

# 终端 2：启动用户端 (默认端口 5173)
pnpm dev:web

# 终端 3：启动管理后台 (默认端口 5174)
pnpm dev:admin
```

访问地址：
- 用户端：http://localhost:5173
- 管理后台：http://localhost:5174
- API 接口：http://localhost:3000

### 生产构建

```bash
pnpm build:shared
pnpm build:server
pnpm build:web
pnpm build:admin

# 启动生产服务
cd packages/server && node dist/main.js
# 前端静态文件部署到 Nginx/CDN
```

## API 接口概览

| 模块 | 路径 | 说明 |
|------|------|------|
| 认证 | `POST /auth/send-code` | 发送短信验证码 |
| 认证 | `POST /auth/register` | 用户注册 |
| 认证 | `POST /auth/login` | 用户登录 |
| 用户 | `GET/PUT /user/profile` | 获取/更新个人资料 |
| 用户 | `GET/POST/DELETE /user/addresses` | 地址管理 |
| 车型 | `GET /vehicle/types` | 获取车型列表 |
| 车型 | `GET /vehicle/pricing` | 获取定价规则 |
| 车型 | `POST /vehicle/price` | 计算运费 |
| 司机相关 | `POST /driver/register` | 司机注册（实名+车辆信息） |
| 司机相关 | `GET /driver/status` | 获取司机审核状态 |
| 司机相关 | `PUT /driver/location` | 更新司机当前位置 |
| 订单 | `POST /order/create` | 创建订单 |
| 订单 | `GET /order/list` | 用户订单列表 |
| 订单 | `GET /order/driver/list` | 司机订单列表 |
| 订单 | `GET /order/:id` | 订单详情 |
| 订单 | `PUT /order/:id/pay` | 支付订单 |
| 订单 | `PUT /order/:id/cancel` | 取消订单 |
| 司机订单 | `POST /order/nearby` | 附近订单查询 |
| 司机订单 | `PUT /order/:id/dispatch` | 接单 |
| 司机订单 | `PUT /order/:id/arrive` | 到达装货地 |
| 司机订单 | `PUT /order/:id/photo` | 上传货物照片 |
| 司机订单 | `PUT /order/:id/depart` | 出发 |
| 司机订单 | `PUT /order/:id/complete` | 完成送达 |
| 管理后台 | `GET /admin/statistics/dashboard` | 数据看板 |
| 管理后台 | `GET/PUT /admin/drivers/*` | 司机审核 |
| 管理后台 | `GET/PUT /admin/orders/*` | 订单管理 |
| 管理后台 | `GET/PUT /admin/complaints/*` | 投诉处理 |
| 管理后台 | `GET/PUT /admin/pricing/*` | 定价管理 |

## 数据库模型

共 12 个核心模型：

| 模型 | 表名 | 说明 |
|------|------|------|
| User | users | 用户（支持 customer/driver/admin 角色） |
| UserAddress | user_addresses | 用户收货地址 |
| Driver | drivers | 司机信息（实名、驾照、审核状态） |
| Vehicle | vehicles | 车辆信息（车型、车牌、尺寸） |
| VehicleType | vehicle_types | 车型定义（20 种车型） |
| PricingRule | pricing_rules | 定价规则（基础价 + 每公里价 + 动态加价） |
| Order | orders | 订单（发货/收货地址、价格、状态流转） |
| OrderTrack | order_tracks | 订单轨迹 |
| Payment | payments | 支付记录 |
| Settlement | settlements | 司机结算单 |
| Review | reviews | 订单评价 |
| Complaint | complaints | 投诉记录 |

完整 Schema 见 [packages/server/prisma/schema.prisma](packages/server/prisma/schema.prisma)。

## 订单状态流转

```
pending (待支付) → paid (已支付) → dispatched (已派单) → arrived (已到达)
                                                              ↓
                                                        loading (装载中)
                                                              ↓
                                                       delivering (运输中)
                                                              ↓
                                                       completed (已完成)

任意状态 → cancelled (已取消)
任意状态 → disputed (争议中，通过投诉触发)
```

## 测试

当前项目通过手动测试覆盖核心流程，测试用例见 [TEST_CASES.md](TEST_CASES.md)，覆盖以下场景：

- 用户注册/登录/登出
- 首页地址选择、车型展示、费用预估
- 订单创建、支付、取消、状态追踪
- 司机注册、审核、接单、运输流程
- 管理后台数据看板、审核、订单管理、定价
- 跨角色完整业务闭环

运行方式：启动 `pnpm dev:server` + `pnpm dev:web`，按照 TEST_CASES.md 逐项验证。

## 部署

### 后端部署

```bash
pnpm build:shared && pnpm build:server
# 将 packages/server/dist + node_modules + prisma 部署到服务器
# 设置环境变量后执行：
node dist/main.js
# 或使用 PM2：
pm2 start dist/main.js --name open-trade-server
```

### 前端部署

```bash
pnpm build:web   # 输出到 packages/web/dist
pnpm build:admin # 输出到 packages/admin/dist
```

将构建产物部署到 Nginx 或 CDN，需配置 API 反向代理将 `/api/*` 转发到后端服务。

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name example.com;

    # 用户端
    location / {
        root /var/www/open-trade/web;
        try_files $uri $uri/ /index.html;
    }

    # 管理后台
    location /admin {
        root /var/www/open-trade/admin;
        try_files $uri $uri/ /admin/index.html;
    }

    # API 代理
    location /api {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 项目状态

此项目为学习/演示用途，以下功能暂未对接真实服务：

- 短信验证码（使用 Mock，固定验证码 `123456`）
- 支付（前端模拟微信/支付宝支付流程）
- 地图（使用 Mock 位置数据）
- 文件上传（司机货物照片使用 Canvas Mock）