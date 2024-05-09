export interface ChequeBookStatusRequestDto {
    accountNumber: string;
}

export interface ChequeBookStatusResponseDto {
    error: boolean;
    message?: string;
    name?: string;
    trackingId?: string,
    bookingDate?: string,
}