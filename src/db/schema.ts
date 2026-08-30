import { pgTable, serial, text, integer, timestamp, uniqueIndex, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  username: text('username'),
  rarityCounts: text('rarity_counts'), // JSON serialized
  lastRollAt: timestamp('last_roll_at'),
  lastSellAt: timestamp('last_sell_at'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  uniqueIndex('users_email_idx').on(table.email),
]);

export const leaderboard = pgTable('leaderboard', {
  id: serial('id').primaryKey(),
  userEmail: text('user_email').notNull(),
  score: integer('score').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const userCosmetics = pgTable('user_cosmetics', {
  id: serial('id').primaryKey(),
  userEmail: text('user_email').notNull(),
  cosmeticId: text('cosmetic_id').notNull(),
  acquiredAt: timestamp('acquired_at').defaultNow(),
});

export const globalStats = pgTable('global_stats', {
  id: serial('id').primaryKey(),
  docId: text('doc_id').notNull().default('main'),
  totalRolls: integer('total_rolls').default(0),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull(),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull()
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' })
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  expiresAt: timestamp('expiresAt'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull()
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt'),
  updatedAt: timestamp('updatedAt')
});
