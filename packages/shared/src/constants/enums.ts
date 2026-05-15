// 用户角色
export enum UserRole {
  CUSTOMER = 'customer',
  DRIVER = 'driver',
  ADMIN = 'admin',
}

// 用户状态
export enum UserStatus {
  ACTIVE = 'active',
  BANNED = 'banned',
}

// 司机审核状态
export enum DriverStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

// 订单状态
export enum OrderStatus {
  PENDING = 'pending',             // 待支付
  PAID = 'paid',                   // 已支付待接单
  DISPATCHED = 'dispatched',       // 已接单
  ARRIVED = 'arrived',             // 司机已到达
  LOADING = 'loading',             // 装货中
  DELIVERING = 'delivering',       // 运输中
  COMPLETED = 'completed',         // 已完成
  CANCELLED = 'cancelled',         // 已取消
  DISPUTED = 'disputed',           // 纠纷中
}

// 支付方式
export enum PaymentMethod {
  WECHAT = 'wechat',
  ALIPAY = 'alipay',
}

// 支付状态
export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

// 结算状态
export enum SettlementStatus {
  PENDING = 'pending',
  SETTLED = 'settled',
}

// 投诉状态
export enum ComplaintStatus {
  PENDING = 'pending',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed',
}

// 投诉类型
export enum ComplaintType {
  SERVICE = 'service',
  DAMAGE = 'damage',
  DELAY = 'delay',
  OVERCHARGE = 'overcharge',
  MISSING = 'missing',
  OTHER = 'other',
}

// 可投诉的订单状态列表
export const COMPLAINABLE_STATUSES: OrderStatus[] = [
  OrderStatus.PAID,
  OrderStatus.DISPATCHED,
  OrderStatus.ARRIVED,
  OrderStatus.LOADING,
  OrderStatus.DELIVERING,
  OrderStatus.COMPLETED,
];

// 订单状态中文标签
export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: '待支付',
  paid: '已支付',
  dispatched: '已接单',
  arrived: '已到达',
  loading: '装货中',
  delivering: '运输中',
  completed: '已完成',
  cancelled: '已取消',
  disputed: '纠纷中',
};

// 投诉类型中文标签
export const COMPLAINT_TYPE_LABELS: Record<string, string> = {
  service: '服务态度',
  damage: '货物损坏',
  delay: '配送延迟',
  overcharge: '乱收费',
  missing: '货物丢失',
  other: '其他',
};
