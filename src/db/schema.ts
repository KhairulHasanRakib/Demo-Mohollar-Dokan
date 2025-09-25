import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

export const profiles = sqliteTable('profiles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().unique(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  roles: text('roles', { mode: 'json' }).notNull(), // JSON array of roles
  activeRole: text('active_role').notNull(),
  latitude: real('latitude'),
  longitude: real('longitude'),
  city: text('city'),
  country: text('country'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const sellers = sqliteTable('sellers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => profiles.id).notNull(),
  displayName: text('display_name').notNull(),
  description: text('description'),
  rating: real('rating').default(0),
  latitude: real('latitude'),
  longitude: real('longitude'),
  city: text('city'),
  country: text('country'),
  createdAt: text('created_at').notNull(),
});

export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sellerId: integer('seller_id').references(() => sellers.id).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  priceCents: integer('price_cents').notNull(),
  currency: text('currency').notNull().default('USD'),
  stock: integer('stock').notNull().default(0),
  photos: text('photos', { mode: 'json' }), // JSON array of photo URLs
  tags: text('tags', { mode: 'json' }), // JSON array of tags
  latitude: real('latitude'),
  longitude: real('longitude'),
  city: text('city'),
  country: text('country'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').notNull(),
});

export const escrows = sqliteTable('escrows', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderId: integer('order_id').notNull(),
  amountCents: integer('amount_cents').notNull(),
  currency: text('currency').notNull().default('USD'),
  status: text('status').notNull().default('frozen'), // frozen, released, refunded
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const orders = sqliteTable('orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  buyerId: integer('buyer_id').references(() => profiles.id).notNull(),
  sellerId: integer('seller_id').references(() => sellers.id).notNull(),
  productId: integer('product_id').references(() => products.id).notNull(),
  quantity: integer('quantity').notNull(),
  itemPriceCents: integer('item_price_cents').notNull(),
  totalCents: integer('total_cents').notNull(),
  currency: text('currency').notNull().default('USD'),
  status: text('status').notNull().default('pending_payment'), // pending_payment, payment_frozen, seller_accepted, worker_assigned, picked_up, delivered, completed, cancelled
  escrowId: integer('escrow_id').references(() => escrows.id),
  pickupCode: text('pickup_code'),
  deliveryCode: text('delivery_code'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const workers = sqliteTable('workers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => profiles.id).notNull(),
  displayName: text('display_name').notNull(),
  rating: real('rating').default(0),
  vehicleType: text('vehicle_type').notNull(),
  serviceRadiusKm: integer('service_radius_km').notNull(),
  latitude: real('latitude'),
  longitude: real('longitude'),
  city: text('city'),
  country: text('country'),
  createdAt: text('created_at').notNull(),
});

export const assignments = sqliteTable('assignments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderId: integer('order_id').references(() => orders.id).notNull(),
  workerId: integer('worker_id').references(() => workers.id).notNull(),
  status: text('status').notNull().default('requested'), // requested, accepted, picked_up, delivered
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const audits = sqliteTable('audits', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  actorProfileId: integer('actor_profile_id').references(() => profiles.id).notNull(),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: integer('entity_id').notNull(),
  meta: text('meta', { mode: 'json' }),
  createdAt: text('created_at').notNull(),
});