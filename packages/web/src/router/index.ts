import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: () => import('../pages/home/index.vue') },
    { path: '/auth/login', name: 'login', component: () => import('../pages/auth/login.vue') },
    { path: '/auth/register', name: 'register', component: () => import('../pages/auth/register.vue') },
    { path: '/order/calc', name: 'orderCalc', component: () => import('../pages/order/calc.vue') },
    { path: '/order/create', name: 'orderCreate', component: () => import('../pages/order/create.vue') },
    { path: '/order/list', name: 'orderList', component: () => import('../pages/order/list.vue') },
    { path: '/order/detail', name: 'orderDetail', component: () => import('../pages/order/detail.vue') },
    { path: '/user/profile', name: 'userProfile', component: () => import('../pages/user/profile.vue') },
    { path: '/driver/register', name: 'driverRegister', component: () => import('../pages/driver/register.vue') },
    { path: '/driver/orders', name: 'driverOrders', component: () => import('../pages/driver/orders.vue') },
    { path: '/driver/order-detail', name: 'driverOrderDetail', component: () => import('../pages/driver/order-detail.vue') },
  ],
});

export default router;
