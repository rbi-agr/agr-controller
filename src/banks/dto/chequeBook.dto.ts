export interface ChequeBookStatusRequestDto {
    accountNumber: string;
}

export interface ChequeBookStatusResponseDto {
    error: boolean;
    message?: string;
    trackingId?: string,
    bookingDate?: string,
}