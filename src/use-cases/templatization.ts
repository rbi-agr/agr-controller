import { PrismaService } from "src/prisma/prisma.service";
import { getEduMsg } from "src/utils/utils";

enum NarrationType {
    CHG_FOR_ONUS_WDL = "CHG FOR ONUS WDL",
    ATM_WDL_CHARGES = "ATM WDL CHARGES",
    ATM_ENQ_CHARGES = "ATM ENQ CHARGES",
    ATM_INSUFFICIENT_FUNDS_CHARGES = "ATM INSUFFICIENT FUNDS CHARGES",
    ATM_Card_Issuance_Fe = "ATM _Card _Issuance_ Fe",
    ATM_AMC_CHGS = "ATM AMC CHGS",
    MIN_BAL_CHGS = "MIN BAL CHGS",
}


export async function getTemplateResponse(bankNarration: any, accountType: string, amount: number, language: string, prisma: PrismaService) {

    let template: string[] = [];
    switch (bankNarration.narration) {
        case NarrationType.CHG_FOR_ONUS_WDL:
        case NarrationType.ATM_WDL_CHARGES:
        case NarrationType.ATM_ENQ_CHARGES:
        case NarrationType.ATM_INSUFFICIENT_FUNDS_CHARGES:
            const template1 = await prisma.templates.findFirst({
                where: {
                    narration: bankNarration.narration,
                    // language,
                    accountType
                },
                select: {
                    template: true
                }
            });
            if (template1) {
                template = template1.template
            }
            break;
        case NarrationType.ATM_Card_Issuance_Fe:
        case NarrationType.ATM_AMC_CHGS:
            const template2 = await prisma.templates.findFirst({
                where: {
                    narration: bankNarration.narration,
                    // language,
                    amount
                },
                select: {
                    template: true
                }
            });
            if (template2) {
                template = template2.template
            }
            break;
        case NarrationType.MIN_BAL_CHGS:
            const template3 = await prisma.templates.findFirst({
                where: {
                    narration: bankNarration.narration,
                    // language,
                    accountType,
                    amount
                },
                select: {
                    template: true
                }
            });
            if (template3) {
                template = template3.template
            }
            break;
        default:
            return getEduMsg(bankNarration, accountType, amount);
    }

    if(template.length) {
        for(let i = 0; i < template.length; i++) {
            template[i] = template[i].replace("${amount}", amount.toString())
        }
        return template;
    }
    return getEduMsg(bankNarration, accountType, amount);
}