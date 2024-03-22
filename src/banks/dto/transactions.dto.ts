export interface TransactionsRequestDto {
    accountNumber: string;
    fromDate: Date;
    toDate: Date
}

export interface TransactionsResponseDto {
    transactionDate: string,
    transactionType: string,
    amount: string,
    transactionNarration: string,
}

