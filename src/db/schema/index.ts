import { pgTable, text, serial } from "drizzle-orm/pg-core";

export const wallets = pgTable("wallets", {
    id: serial("id").primaryKey(),
    owner_address: text("owner_address").notNull(),
    smart_account_address: text("smart_account_address").notNull(),
    user_id: text("user_id").notNull(),
});
