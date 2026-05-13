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
