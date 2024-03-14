export interface TransactionsRequestDto {
    accountNumber: string;
    fromDate: string;
    toDate: string
}

export interface TransactionsResponseDto {
    transactionDate: string,
    transactionType: string,
    amount: string,
    transactionNarration: string,
}

