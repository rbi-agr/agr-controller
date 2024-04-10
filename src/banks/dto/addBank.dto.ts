import { BankName } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsString, IsUUID } from "class-validator";

export class AddBankDto {
    @IsNotEmpty()
    @IsString()
    @IsUUID()
    bankId: string;

    @IsEnum(BankName)
    @IsNotEmpty()
    bankName: BankName;
}