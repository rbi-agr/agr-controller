export interface ComplaintRequestDto {
    accountNumber: string;
    mobileNumber: string;
    complaintCategory: string;
    complaintCategoryType: string;
    complaintCategorySubtype: string;
    amount: string;
    transactionDate: string;
    complaintDetails: string;
}

export interface ComplaintResponseDto {
    ticketNumber: string
}