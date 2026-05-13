import { defineStore } from 'pinia';
import { ref } from 'vue';
import { orderApi, vehicleApi } from '../utils/api';

export const useOrderStore = defineStore('order', () => {
  const vehicleTypes = ref<any[]>([]);
  const orders = ref<any[]>([]);
  const currentOrder = ref<any>(null);
  const nearbyOrders = ref<any[]>([]);

  async function fetchVehicleTypes() {
    vehicleTypes.value = (await vehicleApi.getTypes()) ;
  }

  async function calculatePrice(data: any) {
    return vehicleApi.calculatePrice(data);
  }

  async function createOrder(data: any) {
    const order: any = await orderApi.create(data);
    currentOrder.value = order;
    return order;
  }

  async function fetchOrders() {
    orders.value = (await orderApi.getList()) ;
  }

  async function fetchOrderDetail(id: string) {
    currentOrder.value = await orderApi.getDetail(id);
  }

  async function payOrder(id: string) {
    await orderApi.pay(id);
    if (currentOrder.value) currentOrder.value.status = 'paid';
  }

  async function cancelOrder(id: string) {
    await orderApi.cancel(id);
    if (currentOrder.value) currentOrder.value.status = 'cancelled';
  }

  async function fetchNearbyOrders(data: any) {
    nearbyOrders.value = (await orderApi.getNearby(data)) ;
  }

  async function dispatchOrder(id: string) {
    await orderApi.dispatch(id);
  }

  return {
    vehicleTypes, orders, currentOrder, nearbyOrders,
    fetchVehicleTypes, calculatePrice, createOrder,
    fetchOrders, fetchOrderDetail, payOrder, cancelOrder,
    fetchNearbyOrders, dispatchOrder,
  };
});
