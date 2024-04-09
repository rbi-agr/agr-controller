import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
    const narration1 = await prisma.bankNarrations.create({
        data: {
            "narration": "DUP PASSBOOK CHG",
            "natureOfCharge": "Charges for issuing duplicate passbook/ statement",
            "details": "\"Cheque Book Charges:\n\nSavings Bank (SB) accounts: ₹4 per cheque leaf\nCurrent Account (CA), Cash Credit (CC), Overdraft (OD) accounts: ₹5 per leaf\nFor SB accounts, the first cheque book of 20 leaves is free in a calendar year.\nFor issue of more than one cheque book at a time (for finance companies/home loan repayment of other banks/institutions, etc.): ₹6 per leaf\nNo cheque book charges for advance cheques issued for the bank’s home loans/structured loan products.\nThere is no waiver of charges for Government Departments/Religious/Welfare associations/RRBs/Charitable Institutions/Service Institutions (except for Bank’s staff society). No cheque book charges for facility deposit accounts.\nOther Charges:\n\nIssue of passbook/statement of account/issue of balance confirmation: Free of charges\nIssue of duplicate passbook/statement: ₹100 for SB/CA/CC/OD accounts\""
        }
    })
    console.log('narration 24', narration1)
    const narration2 = await prisma.bankNarrations.create({
        data: {
            "narration": "UNCOLL CHRG DT",
            "natureOfCharge": "Uncllocted charges",
            "details": ""
        }
    })
    console.log('narration 24', narration2)
    const narration3 = await prisma.bankNarrations.create({
        data: {
            "narration": "CHG FOR ONUS WDL",
            "natureOfCharge": "Charges for cash withdrawal per transaction in Indian bank ATMs and other bank ATMs for SB and CA",
            "details": "Indian Bank ATM:\n\nUp to 5 transactions per month, including financial & non-financial:\nSavings Account (SB) and Current Account (CA): Free\nExceeding free transactions per month:\nSB: ₹15\nCA: ₹6\nOther Banks ATM (Domestic):\n\nMetro ATMs*: Up to 3 transactions per month:\nFree\nNon-Metro ATMs: Up to 5 transactions per month:\nSB: Free\nCA: Free\nFor transactions exceeding free transactions in a month:\nSB: ₹21\nCA: ₹10\n*Note: Metro ATMs refer to ATMs located in metropolitan cities, while non-Metro ATMs are those located outside metropolitan cities."
        }
    })
    console.log('narration 24', narration3)
    const narration4 = await prisma.bankNarrations.create({
        data: {
            "narration": "ATM WDL CHARGES",
            "natureOfCharge": "Charges for cash withdrawal per transaction in Indian bank ATMs and other bank ATMs for SB and CA",
            "details": "Indian Bank ATM:\n\nUp to 5 transactions per month, including financial & non-financial:\nSavings Account (SB) and Current Account (CA): Free\nExceeding free transactions per month:\nSB: ₹15\nCA: ₹6\nOther Banks ATM (Domestic):\n\nMetro ATMs*: Up to 3 transactions per month:\nFree\nNon-Metro ATMs: Up to 5 transactions per month:\nSB: Free\nCA: Free\nFor transactions exceeding free transactions in a month:\nSB: ₹21\nCA: ₹10\n*Note: Metro ATMs refer to ATMs located in metropolitan cities, while non-Metro ATMs are those located outside metropolitan cities."
        }
    })
    console.log('narration 24', narration4)
    const narration5 = await prisma.bankNarrations.create({
        data: {
            "narration": "ATM ENQ CHARGES",
            "natureOfCharge": "Charges for cash withdrawal per transaction in Indian bank ATMs and other bank ATMs for SB and CA",
            "details": "Indian Bank ATM:\n\nUp to 5 transactions per month, including financial & non-financial:\nSavings Account (SB) and Current Account (CA): Free\nExceeding free transactions per month:\nSB: ₹15\nCA: ₹6\nOther Banks ATM (Domestic):\n\nMetro ATMs*: Up to 3 transactions per month:\nFree\nNon-Metro ATMs: Up to 5 transactions per month:\nSB: Free\nCA: Free\nFor transactions exceeding free transactions in a month:\nSB: ₹21\nCA: ₹10\n*Note: Metro ATMs refer to ATMs located in metropolitan cities, while non-Metro ATMs are those located outside metropolitan cities."
        }
    })
    console.log('narration 24', narration5)
    const narration6 = await prisma.bankNarrations.create({
        data: {
            "narration": "ATM INSUFFICIENT FUNDS CHARGES",
            "natureOfCharge": "Withdrawal transaction decline due to insufficient balance through ATM/ BNAs",
            "details": "\"Revised ATM/BNA Transaction Charges (effective from 01.12.2023):\n\nOnus Cash Deposit Transaction - SB Account:\n\nUp to 5 transactions/month: Free\nBeyond 5 transactions/month: ₹25 per transaction\nOnus Cash Deposit Transaction - CA Account:\n\n₹10 per transaction\nTransaction Decline due to Insufficient Balance:\n\n₹15 per transaction (applicable to both Onus and Issuer)\""
        }
    })
    console.log('narration 24', narration6)
    const narration7 = await prisma.bankNarrations.create({
        data: {
            "narration": "ATM _Card _Issuance_ Fe",
            "natureOfCharge": "Membership fee for ATM card",
            "details": "Revised Debit Card Service Charges (effective from 01.11.2023):\n\nMembership Fee:\n\nRupay Platinum (Domestic & International), Visa Gold/Platinum, International Master Cards: ₹100\nMaster My Design Customised Image Card: ₹300\nRupay Select Debit Card: ₹1000\nAnnual Maintenance Charges (AMC):\n\nAMC for 1st year: Free\nAMC from 2nd year onwards:\nSenior Citizen card/cards for Visually Challenged/SHG/RuPay KCC/RuPay PMJDY cards: Free\nClassic Rupay cards (other than PMJDY), Rupay IBDigi cards, Domestic Mastercards including ePurse cards, Visa Classic cards: ₹200\nRuPay Platinum (Domestic/International), International MasterCard & Visa (Gold & Platinum) Cards: ₹300\nRuPay Debit Select Card: ₹1000"
        }
    })
    console.log('narration 24', narration7)
    const narration8 = await prisma.bankNarrations.create({
        data: {
            "narration": "DUP CARD",
            "natureOfCharge": "ATM/ Debit card replacement charges",
            "details": "ATM/Debit Card Replacement Charges (including PIN):\n\nRuPay Classic/MasterCard (Domestic), including ePurse cards & Visa Classic Cards:\n\nReplacement Fee: ₹150\nRuPay Platinum (Domestic & International), Rupay Select Debit Cards, Visa Gold/Platinum Cards, International Master Card:\n\nReplacement Fee: ₹250"
        }
    })
    console.log('narration 24', narration8)
    const narration9 = await prisma.bankNarrations.create({
        data: {
            "narration": "ATM AMC CHGS",
            "natureOfCharge": "Annual Maintenance Charges ATM card",
            "details": "Annual Maintenance Charges (AMC):\n\nAMC for 1st year: Free\nAMC from 2nd year onwards:\nSenior Citizen card/cards for Visually Challenged/SHG/RuPay KCC/RuPay PMJDY cards: Free\nClassic RuPay cards (other than PMJDY), RuPay IBDigi cards, Domestic Mastercards including ePurse cards, Visa Classic cards: ₹200\nRuPay Platinum (Domestic/International), International MasterCard & Visa (Gold & Platinum) Cards: ₹300\nRuPay Debit Select Card: ₹1000"
        }
    })
    console.log('narration 24', narration9)
    const narration10 = await prisma.bankNarrations.create({
        data: {
            "narration": "CHG FOR ATM ONUS DEP",
            "natureOfCharge": "Cash deposit charges through ATM/cash recyclers(BNA)",
            "details": "ATM/BNA Cash Deposit Transaction Service Charges (effective from 01.12.2023):\n\nOnus Cash Deposit Transaction - SB Account:\n\nUp to 5 transactions/month: Free\nBeyond 5 transactions/month: ₹25 per transaction\nOnus Cash Deposit Transaction - CA Account:\n\n₹10 per transaction"
        }
    })
    console.log('narration 24', narration10)
    const narration11 = await prisma.bankNarrations.create({
        data: {
            "narration": "CHQ DISHONOUR",
            "natureOfCharge": "Cheque return charges",
            "details": "Cheque Return Inward Charges:\n\nUp to ₹1 lakh: ₹250\nMore than ₹1 lakh and up to ₹1 crore: ₹500\nAbove ₹1 crore: ₹750"
        }
    })
    console.log('narration 24', narration11)
    const narration12 = await prisma.bankNarrations.create({
        data: {
            "narration": "ACH RTN CHRGS",
            "natureOfCharge": "ECS Debit return charges",
            "details": "ECS Debit Return Charges:\n\nFor ECS debit return charges:\n\nUp to ₹50,000:\n\nIndividuals: ₹100\nNon-Individuals: ₹150\nPensioners, Senior Citizens, and individuals in Rural areas: ₹75\nMore than ₹50,000 to less than ₹5 lakhs: ₹200\n\n₹5 lakhs to less than ₹10 lakhs: ₹300\n\n₹10 lakhs and above: ₹500"
        }
    })
    console.log('narration 24', narration12)
    const narration13 = await prisma.bankNarrations.create({
        data: {
            "narration": "NEFT Charge",
            "natureOfCharge": "NEFT charges",
            "details": "\"Summary of RTGS and NEFT Charges:\n\nRTGS Charges:\n₹2 lakhs to ₹5 lakhs: ₹24.50 per transaction\nAbove ₹5 lakhs: ₹49.50 per transaction\n\nNEFT Charges:\nSB customers are waived from charges for NEFT online transactions.\nUp to ₹0.10 lakh: ₹2.25 per transaction\nAbove ₹0.10 lakh to ₹1 lakh: ₹4.75 per transaction\nAbove ₹1 lakh to ₹2 lakhs: ₹14.75 per transaction\nAbove ₹2 lakhs: ₹24.75 per transaction\n\nIMPS Charges\nFor Financial Transactions:\n\nUp to ₹1,000: NIL\n₹1,001 to ₹10,000: ₹2.50 per transaction\n₹10,001 to ₹25,000: ₹5 per transaction\n₹25,001 to ₹1,00,000: ₹7.50 per transaction\nAbove ₹1 lakh to ₹2 lakhs: ₹10 per transaction\nAbove ₹2 lakhs: ₹15 per transaction\nNon-Financial Transactions: Nil\""
        }
    })
    console.log('narration 24', narration13)
    const narration14 = await prisma.bankNarrations.create({
        data: {
            "narration": "RGTS Charge",
            "natureOfCharge": "RGTS Charges",
            "details": "\"Summary of RTGS and NEFT Charges:\n\nRTGS Charges:\n₹2 lakhs to ₹5 lakhs: ₹24.50 per transaction\nAbove ₹5 lakhs: ₹49.50 per transaction\n\nNEFT Charges:\nSB customers are waived from charges for NEFT online transactions.\nUp to ₹0.10 lakh: ₹2.25 per transaction\nAbove ₹0.10 lakh to ₹1 lakh: ₹4.75 per transaction\nAbove ₹1 lakh to ₹2 lakhs: ₹14.75 per transaction\nAbove ₹2 lakhs: ₹24.75 per transaction\n\nIMPS Charges\nFor Financial Transactions:\n\nUp to ₹1,000: NIL\n₹1,001 to ₹10,000: ₹2.50 per transaction\n₹10,001 to ₹25,000: ₹5 per transaction\n₹25,001 to ₹1,00,000: ₹7.50 per transaction\nAbove ₹1 lakh to ₹2 lakhs: ₹10 per transaction\nAbove ₹2 lakhs: ₹15 per transaction\nNon-Financial Transactions: Nil\""
        }
    })
    console.log('narration 24', narration14)
    const narration15 = await prisma.bankNarrations.create({
        data: {
            "narration": "IMPS COMMISSION CHARGES",
            "natureOfCharge": "IMPS Charges",
            "details": "\"Summary of RTGS and NEFT Charges:\n\nRTGS Charges:\n₹2 lakhs to ₹5 lakhs: ₹24.50 per transaction\nAbove ₹5 lakhs: ₹49.50 per transaction\n\nNEFT Charges:\nSB customers are waived from charges for NEFT online transactions.\nUp to ₹0.10 lakh: ₹2.25 per transaction\nAbove ₹0.10 lakh to ₹1 lakh: ₹4.75 per transaction\nAbove ₹1 lakh to ₹2 lakhs: ₹14.75 per transaction\nAbove ₹2 lakhs: ₹24.75 per transaction\n\nIMPS Charges\nFor Financial Transactions:\n\nUp to ₹1,000: NIL\n₹1,001 to ₹10,000: ₹2.50 per transaction\n₹10,001 to ₹25,000: ₹5 per transaction\n₹25,001 to ₹1,00,000: ₹7.50 per transaction\nAbove ₹1 lakh to ₹2 lakhs: ₹10 per transaction\nAbove ₹2 lakhs: ₹15 per transaction\nNon-Financial Transactions: Nil\""
        }
    })
    console.log('narration 24', narration15)
    const narration16 = await prisma.bankNarrations.create({
        data: {
            "narration": "SI Charge",
            "natureOfCharge": "Standing instruction charges",
            "details": "Standing Instructions (SI) Charges:\n\nSI Registration: ₹50 per registration.\nNon-execution of SI due to insufficient funds: ₹50 per transaction.\nNotes:\nNo charges for crediting loan installments, RD installments, and Term Deposit interest.\nNo charges if carried out through digital channels."
        }
    })
    console.log('narration 24', narration16)
    const narration17 = await prisma.bankNarrations.create({
        data: {
            "narration": "Cash handling charges",
            "natureOfCharge": "Cash handling charges",
            "details": "Cash Handling Charges:\n\nSavings Bank:\n\nHome Branch: NIL\nCurrent Account:\n\nMAB up to ₹1 lakh:\nUp to ₹1 lakh per day: Free\nAbove ₹1 lakh per day: ₹2 per ₹1000 (Min: ₹100, Max: ₹20000)\nMAB above ₹1 lakh:\nUp to ₹2 lakhs per day: Free\nAbove ₹2 lakhs per day: ₹2 per ₹1000 (Min: ₹200, Max: ₹20000)\nOD/OCC:\n\nUp to ₹2 lakhs: Free\nBeyond ₹2 lakhs: ₹1 per ₹1000 (Min: ₹100, Max: ₹5000)"
        }
    })
    console.log('narration 24', narration17)
    const narration18 = await prisma.bankNarrations.create({
        data: {
            "narration": "SMS_ CHGS_",
            "natureOfCharge": "SMS alert charges",
            "details": "Summary of SMS Alert Charges:\n\nCharges per SMS:\nDomestic: 25 paise per SMS\nInternational: ₹2 per SMS\nCap:\n₹15 per month for Savings Bank account\n₹30 per month for Current Account/OD/OCC account\nCharges debited monthly from the customer's account.\nExempted Categories:\nStaff, Senior Citizen, and Ex-staff\nUPI transactions\nSpecific products requested by Business verticals with approval from competent authority."
        }
    })
    console.log('narration 24', narration18)
    const narration19 = await prisma.bankNarrations.create({
        data: {
            "narration": "MIN BAL CHGS",
            "natureOfCharge": "Non maintenance of minimum balance charges in SB/ CA",
            "details": "Charges for Non-Maintenance of Minimum Balance:\n\nIn Savings Account (SB):\n\nCharges based on the shortfall in the average monthly balance:\n76% - 100% shortfall: ₹100 per month\n51% - 75% shortfall: ₹75 per month\n26% - 50% shortfall: ₹50 per month\n11% - 25% shortfall: ₹25 per month\n1% - 10% shortfall: ₹10 per month\nExemptions: BSBDA/Small Accounts, accounts of Students, Pensioners (without cheque facility), and Inoperative accounts. Charges start from the 2nd month of opening the account.\nNon-Maintenance of Minimum Balance in Current Account (CA):\n\nFor non-maintenance of quarterly average balance:\nUrban/Metropolitan: ₹600 per quarter\nRural/Semi-urban: ₹350 per quarter\nProportionate charges to be applied for accounts opened or closed during the quarter."
        }
    })
    console.log('narration 24', narration19)
    const narration20 = await prisma.bankNarrations.create({
        data: {
            "narration": "LOCKER RENT",
            "natureOfCharge": "Rent on locker",
            "details": "Summary of Locker Rent Charges:\n\n(I) One-time Registration:\n\nSmall/Medium Locker: ₹500\nLarge/Extra Large Locker: ₹1000\n(ii) Replacement of Locker Lock:\n\nLock Replacement: ₹500 + GST, plus actual charges for breaking open of locker.\n(iii) Penalty for Non-payment of Locker Rent:\n\nI Quarter: 10% of rent due\nII Quarter: 20% of rent due\nIII Quarter: 25% of rent due\nIV Quarter onwards: 40% of rent due\nMore than 1 year and up to 3 years: 50% of overdue rent\nAfter 3 years, break open action would be initiated as per the board-approved policy.\n(iv) Number of Operations:\n\n12 operations free per year.\nBeyond that: ₹100 per visit."
        }
    })
    console.log('narration 24', narration20)
    const narration21 = await prisma.bankNarrations.create({
        data: {
            "narration": "Cash deposit chrages other",
            "natureOfCharge": "Cash deposit chrages at Non-home branch",
            "details": "Service Charges for Cash Deposit on Interoperable Cash Deposit (ICD) Mode:\n\nAcquirer: Whose BNA/CDM is used by cardholder for depositing cash\n\nIndian Bank Customer at Indian Bank BNA:\n\nOur Bank (Indian Bank) Customer:\nFor cash deposit up to ₹10,000: No charges\nFor deposit amount above ₹10,000 - ₹49,900: ₹12.50 from customer account immediately, ₹25 from customer account immediately.\nOther Bank Customer:\n₹12.50 from customer account immediately for cash deposit up to ₹10,000.\n₹25 from customer account immediately for deposit amount above ₹10,000 - ₹49,900.\nIndian Bank Customer at Other Bank BNA:\n\nOur Bank (Indian Bank) Customer (Same Account):\n₹25 from customer account immediately.\n₹50 from customer account immediately.\nIndian Bank Customer (Different Account):\n₹12.50 from customer account immediately.\n₹12.50 from customer account (A) immediately after verification in the NPCI file received on the next day.\nOther Bank Customer at Indian Bank BNA:\n\n₹25 from customer account immediately for cash deposit up to ₹10,000.\n₹25 from customer account immediately for deposit amount above ₹10,000 - ₹49,900.\nOther Bank Customer at Other Bank BNA:\n\nOther Bank Customer:\n₹12.50 from customer account immediately after verification in the NPCI file received on the next day.\n₹25 from customer account immediately after verification in the NPCI file received on the next day."
        }
    })
    console.log('narration 24', narration21)
    const narration22 = await prisma.bankNarrations.create({
        data: {
            "narration": "Mandate Reg Chgs",
            "natureOfCharge": "ECS mandate registration charges",
            "details": "CS Debit Return Charges and One-time Mandate Registration Fees:\n\nECS Debit Return Charges:\n\nUp to ₹50,000:\nIndividuals: ₹100\nNon-Individuals: ₹150\nPensioners, Senior Citizens, and individuals in Rural areas: ₹75\nMore than ₹50,000 to less than ₹5 lakhs: ₹200\n₹5 lakhs to less than ₹10 lakhs: ₹300\n₹10 lakhs and above: ₹500\nECS One-time Mandate Registration Fees:\n\nIncluding signature verification: ₹115"
        }
    })
    console.log('narration 24', narration22)
    const narration23 = await prisma.bankNarrations.create({
        data: {
            "narration": "Folio Charges -Txn",
            "natureOfCharge": "Account keeping charges",
            "details": "Account Keeping Charges:\n\nFor Current Accounts:\n\nApplicable to Current Accounts.\nCharged quarterly.\nBased on Quarterly Average Credit (Cr) Balance.\nCharges vary based on the number of transactions and average credit balance:\nAverage Credit Balance up to ₹25,000: All transactions are chargeable.\nAverage Credit Balance above ₹25,000 to ₹1 lakh: Chargeable after 80 transactions per quarter.\nAverage Credit Balance ₹1 lakh to ₹2 lakh: Chargeable after 200 transactions.\nAverage Credit Balance ₹2 lakh to ₹5 lakh: Chargeable after 400 transactions.\nAverage Credit Balance above ₹5 lakh: Charges not applicable.\nFor OD/OCC Accounts:\n\nApplicable to OD/OCC Accounts, irrespective of the limit.\nNo free transactions.\nCharges: ₹200 for 40 transactions.\nCharges recovered half-yearly on 30th September and 31st March every year or at the time of closure of the account, whichever is earlier."
        }
    })
    console.log('narration 24', narration23)
    const narration24 = await prisma.bankNarrations.create({
        data: {
            "narration": "Excess wdl charges",
            "natureOfCharge": "Excess withdrawal charges",
            "details": "Excess Withdrawal Charges:\n\nIndian Bank ATM:\n\nUp to 5 transactions per month (including Financial & Non-financial): Free.\nExceeding free transactions per month: ₹15 for Savings Account (SB) and ₹6 for Current Account (CA).\nOther Banks ATM (Domestic):\n\nMetro ATMs*: Up to 3 transactions per month: Free.\nNon-Metro ATMs: Up to 5 transactions per month: Free.\nFor transactions exceeding free transactions in a month:\nMetro ATMs: ₹21\nNon-Metro ATMs: ₹10\n\n*Other Bank ATMs located in Delhi, Mumbai, Chennai, Hyderabad, Kolkata, and Bengaluru."
        }
    })
    console.log('narration 24', narration24)
}

main()
    .then(async () => {
        const narration = await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        const narration = await prisma.$disconnect()
        process.exit(1)
    })