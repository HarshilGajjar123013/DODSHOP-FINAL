// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// @dod/database — Barrel Export
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Re-export Prisma client singleton
export { prisma } from './client';

// Re-export fallback database manager
export { fallbackDb } from './fallbackDb';

// Re-export all generated Prisma types
export type {
  AdminUser,
  Category,
  Collection,
  Product,
  Customer,
  Address,
  CartItem,
  WishlistItem,
  Order,
  OrderItem,
  InventoryLog,
  ReturnRequest,
  ContactForm,
  CMSConfig,
  Coupon,
  SecurityLog,
} from '@prisma/client';

// Re-export all enums
export {
  AdminRole,
  AccountStatus,
  ProductStatus,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  InventoryLogType,
  ContactStatus,
  ReturnStatus,
  AuditStatus,
} from '@prisma/client';
