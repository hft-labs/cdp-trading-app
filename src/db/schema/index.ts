import { pgTable, text, serial, timestamp, decimal, boolean, integer, index, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    user_id: text("user_id").notNull().unique(), // CDP user ID
    authentication_methods: jsonb("authentication_methods").notNull().default([]), // Array of auth methods
    evm_accounts: jsonb("evm_accounts").notNull().default([]), // Array of EVM addresses
    evm_smart_accounts: jsonb("evm_smart_accounts").notNull().default([]), // Array of smart account addresses
    solana_accounts: jsonb("solana_accounts").notNull().default([]), // Array of Solana addresses
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    userIdIdx: index("user_id_idx").on(table.user_id),
}));

export const transactions = pgTable("transactions", {
    id: serial("id").primaryKey(),
    transaction_type: text("transaction_type").notNull(),
    description: text("description").notNull(),
    value_usd: decimal("value_usd", { precision: 20, scale: 8 }),
    asset_amount: decimal("asset_amount", { precision: 30, scale: 18 }),
    asset_symbol: text("asset_symbol"),
    wallet_address: text("wallet_address").notNull(),
    counterparty_address: text("counterparty_address"),
    transaction_hash: text("transaction_hash"),
    block_number: text("block_number"),
    gas_fee: decimal("gas_fee", { precision: 30, scale: 18 }),
    gas_fee_usd: decimal("gas_fee_usd", { precision: 20, scale: 8 }),
    created_at: timestamp("created_at").defaultNow().notNull(),
    block_timestamp: timestamp("block_timestamp"),
    is_successful: boolean("is_successful").default(true),
    user_id: text("user_id").notNull(),
    network: text("network").default('ethereum'),
});

export const accounts = pgTable("accounts", {
    id: serial("id").primaryKey(),
    user_id: text("user_id").notNull().references(() => users.user_id),
    wallet_address: text("wallet_address").notNull(),
    network: text("network").default('base').notNull(),
    is_active: boolean("is_active").default(true),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    userWalletIdx: index("user_wallet_idx").on(table.user_id, table.wallet_address),
    walletIdx: index("wallet_idx").on(table.wallet_address),
}));

export const tokens = pgTable("tokens", {
    id: serial("id").primaryKey(),
    symbol: text("symbol").notNull(),
    name: text("name").notNull(),
    contract_address: text("contract_address").notNull(),
    decimals: integer("decimals").notNull(),
    network: text("network").default('base').notNull(),
    image_url: text("image_url"),
    is_active: boolean("is_active").default(true),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    symbolIdx: index("symbol_idx").on(table.symbol),
    contractIdx: index("contract_idx").on(table.contract_address),
}));

export const token_balances = pgTable("token_balances", {
    id: serial("id").primaryKey(),
    account_id: integer("account_id").notNull().references(() => accounts.id),
    token_id: integer("token_id").notNull().references(() => tokens.id),
    balance_amount: decimal("balance_amount", { precision: 30, scale: 18 }).notNull(),
    balance_usd: decimal("balance_usd", { precision: 20, scale: 8 }).notNull(),
    token_price_usd: decimal("token_price_usd", { precision: 20, scale: 8 }).notNull(),
    last_updated: timestamp("last_updated").defaultNow().notNull(),
}, (table) => ({
    accountTokenIdx: index("account_token_idx").on(table.account_id, table.token_id),
    accountIdx: index("account_idx").on(table.account_id),
}));

export const balance_history = pgTable("balance_history", {
    id: serial("id").primaryKey(),
    account_id: integer("account_id").notNull().references(() => accounts.id),
    token_id: integer("token_id").notNull().references(() => tokens.id),
    balance_amount: decimal("balance_amount", { precision: 30, scale: 18 }).notNull(),
    balance_usd: decimal("balance_usd", { precision: 20, scale: 8 }).notNull(),
    token_price_usd: decimal("token_price_usd", { precision: 20, scale: 8 }).notNull(),
    recorded_at: timestamp("recorded_at").defaultNow().notNull(),
}, (table) => ({
    accountTokenTimeIdx: index("account_token_time_idx").on(table.account_id, table.token_id, table.recorded_at),
    timeIdx: index("time_idx").on(table.recorded_at),
}));
