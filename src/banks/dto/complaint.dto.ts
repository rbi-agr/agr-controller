export interface ComplaintRequestDto {
    accountNumber: string;
    mobileNumber: string;
    complaintCategoryId: string;
    complaintCategory: string;
    complaintCategoryType: string;
    complaintCategorySubtype: string;
    amount: string;
    transactionDate: Date;
    complaintDetails: string;
}

export interface ComplaintResponseDto {
    error: boolean;
    message?: string;
    ticketNumber?: string;
}