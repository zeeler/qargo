import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory('/admin/'),
  routes: [
    {
      path: '/',
      component: () => import('../views/Layout.vue'),
      children: [
        { path: '', redirect: '/dashboard' },
        { path: 'dashboard', name: 'Dashboard', component: () => import('../views/statistics/Dashboard.vue'), meta: { title: '数据看板' } },
        { path: 'drivers', name: 'Drivers', component: () => import('../views/driver-review/DriverList.vue'), meta: { title: '司机审核' } },
        { path: 'orders', name: 'Orders', component: () => import('../views/order-list/OrderList.vue'), meta: { title: '订单管理' } },
        { path: 'complaints', name: 'Complaints', component: () => import('../views/dispute/ComplaintList.vue'), meta: { title: '投诉处理' } },
        { path: 'pricing', name: 'Pricing', component: () => import('../views/pricing/PricingList.vue'), meta: { title: '定价管理' } },
        { path: 'coupons', name: 'Coupons', component: () => import('../views/coupon/CouponList.vue'), meta: { title: '优惠券管理' } },
        { path: 'settlements', name: 'Settlements', component: () => import('../views/settlement/SettlementList.vue'), meta: { title: '结算管理' } },
      ],
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue'),
    },
  ],
});

export default router;
