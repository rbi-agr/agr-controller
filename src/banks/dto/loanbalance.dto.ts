export interface LoanAccountBalanceRequestDto {
    accountNumber: string;
}

export interface LoanAccountBalanceResponseDto {
    error: boolean;
    message?: string;
    totalOutstanding?: string,
    principalOutstanding?: string,
    interestPaid?: string
}
