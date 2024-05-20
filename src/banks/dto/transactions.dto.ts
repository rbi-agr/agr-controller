export interface TransactionsRequestDto {
    accountNumber: string;
    fromDate: Date;
    toDate: Date
}
export interface TransactionsResponseDto {
    error: boolean;
    message?: string;
    transactions: Transaction[];
}

export interface Transaction {
    transactionDate: Date,
    transactionType: string,
    amount: string,
    transactionNarration: string,
}

