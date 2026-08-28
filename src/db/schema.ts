import { pgTable, serial, text, integer, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

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
