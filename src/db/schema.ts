import { pgTable, serial, text, integer, timestamp, uniqueIndex, boolean, index } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  username: text('username'),
  rarityCounts: text('rarity_counts'),
  lastRollAt: timestamp('last_roll_at'),
  lastSellAt: timestamp('last_sell_at'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  uniqueIndex('users_email_idx').on(table.email),
  index('users_email').on(table.email),
]);

export const leaderboard = pgTable('leaderboard', {
  id: serial('id').primaryKey(),
  userEmail: text('user_email').notNull(),
  score: integer('score').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('leaderboard_user_email_idx').on(table.userEmail),
]);

export const userCosmetics = pgTable('user_cosmetics', {
  id: serial('id').primaryKey(),
  userEmail: text('user_email').notNull(),
  cosmeticId: text('cosmetic_id').notNull(),
  acquiredAt: timestamp('acquired_at').defaultNow(),
}, (table) => [
  index('user_cosmetics_user_email_idx').on(table.userEmail),
  index('user_cosmetics_cosmetic_id_idx').on(table.cosmeticId),
]);

export const globalStats = pgTable('global_stats', {
  id: serial('id').primaryKey(),
  docId: text('doc_id').notNull().default('main'),
  totalRolls: integer('total_rolls').default(0),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  uniqueIndex('global_stats_doc_id_idx').on(table.docId),
]);

// Better Auth core tables
export const authUser = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull(),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
}, (table) => [
  uniqueIndex('auth_user_email_idx').on(table.email),
]);

export const authSession = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId').notNull().references(() => authUser.id, { onDelete: 'cascade' }),
}, (table) => [
  uniqueIndex('auth_session_token_idx').on(table.token),
]);

export const authAccount = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId').notNull().references(() => authUser.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  expiresAt: timestamp('expiresAt'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
}, (table) => [
  index('auth_account_user_id_idx').on(table.userId),
]);

export const authVerification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt'),
  updatedAt: timestamp('updatedAt'),
}, (table) => [
  index('auth_verification_identifier_idx').on(table.identifier),
]);
