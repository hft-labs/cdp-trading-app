export type Balance = {
    asset: {
        id: string;
        type: string;
        groupId: string;
        subGroupId: string;
    };
    value: number;
    valueStr: string;
    decimals: number;
}
export type BalanceResponse = {
    jsonrpc: string;
    id: number;
    result: {
        balances: Balance[];
    };
};