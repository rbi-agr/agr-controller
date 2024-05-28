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
            "details": `Savings Bank Account (SB) Charges:

Indian Bank ATM Charges:
Up to 5 transactions per month (including financial & non-financial): Free
Exceeding free transactions per month: ₹15

Savings Bank Account (SB) Charges:
Other Banks ATM (Domestic) Charges:
Metro ATMs*:
Up to 3 transactions per month: Free
For transactions exceeding free transactions in a month:
Metro ATMs*: ₹21
Non-Metro ATMs: ₹21
Non-Metro ATMs:
Up to 5 transactions per month: Free
For transactions exceeding free transactions in a month:
Metro ATMs*: ₹21
Non-Metro ATMs: ₹21

Current Account (CA) Charges:

Indian Bank ATM Charges:
Up to 5 transactions per month (including financial & non-financial): Free
Exceeding free transactions per month: ₹6

Current Account (CA) Charges:

Other Banks ATM (Domestic) Charges:
Metro ATMs*:
Up to 3 transactions per month: Free
For transactions exceeding free transactions in a month:
Metro ATMs*: ₹10
Non-Metro ATMs: ₹10
Non-Metro ATMs:
Up to 5 transactions per month: Free
For transactions exceeding free transactions in a month:
Metro ATMs*: ₹10
Non-Metro ATMs: ₹10

*Note: Metro ATMs refer to ATMs located in metropolitan cities, while non-Metro ATMs are those located outside metropolitan cities.`
        }
    })
    console.log('narration 24', narration3)
    const narration4 = await prisma.bankNarrations.create({
        data: {
            "narration": "ATM WDL CHARGES",
            "natureOfCharge": "Charges for cash withdrawal per transaction in Indian bank ATMs and other bank ATMs for SB and CA",
            "details": `Savings Bank Account (SB) Charges:

Indian Bank ATM Charges:
Up to 5 transactions per month (including financial & non-financial): Free
Exceeding free transactions per month: ₹15

Savings Bank Account (SB) Charges:
Other Banks ATM (Domestic) Charges:
Metro ATMs*:
Up to 3 transactions per month: Free
For transactions exceeding free transactions in a month:
Metro ATMs*: ₹21
Non-Metro ATMs: ₹21
Non-Metro ATMs:
Up to 5 transactions per month: Free
For transactions exceeding free transactions in a month:
Metro ATMs*: ₹21
Non-Metro ATMs: ₹21

Current Account (CA) Charges:

Indian Bank ATM Charges:
Up to 5 transactions per month (including financial & non-financial): Free
Exceeding free transactions per month: ₹6

Current Account (CA) Charges:

Other Banks ATM (Domestic) Charges:
Metro ATMs*:
Up to 3 transactions per month: Free
For transactions exceeding free transactions in a month:
Metro ATMs*: ₹10
Non-Metro ATMs: ₹10
Non-Metro ATMs:
Up to 5 transactions per month: Free
For transactions exceeding free transactions in a month:
Metro ATMs*: ₹10
Non-Metro ATMs: ₹10

*Note: Metro ATMs refer to ATMs located in metropolitan cities, while non-Metro ATMs are those located outside metropolitan cities.`
        }
    })
    console.log('narration 24', narration4)
    const narration5 = await prisma.bankNarrations.create({
        data: {
            "narration": "ATM ENQ CHARGES",
            "natureOfCharge": "Charges for cash withdrawal per transaction in Indian bank ATMs and other bank ATMs for SB and CA",
            "details": `Savings Bank Account (SB) Charges:

Indian Bank ATM Charges:
Up to 5 transactions per month (including financial & non-financial): Free
Exceeding free transactions per month: ₹15

Savings Bank Account (SB) Charges:
Other Banks ATM (Domestic) Charges:
Metro ATMs*:
Up to 3 transactions per month: Free
For transactions exceeding free transactions in a month:
Metro ATMs*: ₹21
Non-Metro ATMs: ₹21
Non-Metro ATMs:
Up to 5 transactions per month: Free
For transactions exceeding free transactions in a month:
Metro ATMs*: ₹21
Non-Metro ATMs: ₹21

Current Account (CA) Charges:

Indian Bank ATM Charges:
Up to 5 transactions per month (including financial & non-financial): Free
Exceeding free transactions per month: ₹6

Current Account (CA) Charges:

Other Banks ATM (Domestic) Charges:
Metro ATMs*:
Up to 3 transactions per month: Free
For transactions exceeding free transactions in a month:
Metro ATMs*: ₹10
Non-Metro ATMs: ₹10
Non-Metro ATMs:
Up to 5 transactions per month: Free
For transactions exceeding free transactions in a month:
Metro ATMs*: ₹10
Non-Metro ATMs: ₹10

*Note: Metro ATMs refer to ATMs located in metropolitan cities, while non-Metro ATMs are those located outside metropolitan cities.`
        }
    })
    console.log('narration 24', narration5)
    const narration6 = await prisma.bankNarrations.create({
        data: {
            "narration": "ATM INSUFFICIENT FUNDS CHARGES",
            "natureOfCharge": "Withdrawal transaction decline due to insufficient balance through ATM/ BNAs",
            "details": `Savings Bank Account (SB) Charges:

Onus Cash Deposit Transaction:
Up to 5 transactions/month: Free
Beyond 5 transactions/month: ₹25 per transaction
Transaction Decline due to Insufficient Balance:
₹15 per transaction (applicable to both Onus and Issuer)
Current Account (CA) Charges:

Onus Cash Deposit Transaction:
₹10 per transaction
Transaction Decline due to Insufficient Balance:
₹15 per transaction (applicable to both Onus and Issuer)`
        }
    })
    console.log('narration 24', narration6)
    const narration7 = await prisma.bankNarrations.create({
        data: {
            "narration": "ATM _Card _Issuance_ Fe",
            "natureOfCharge": "Membership fee for ATM card",
            "details": `Membership Fee:
Rupay Platinum (Domestic & International), Visa Gold/Platinum, International Master Cards:
Membership Fee: ₹100
Master My Design Customised Image Card:
Membership Fee: ₹300
RuPay Select Debit Card:
Membership Fee: ₹1000

Annual Maintenance Charges (AMC):
AMC for 1st year: Free
AMC from 2nd year onwards:
Senior Citizen card/cards for Visually Challenged/SHG/RuPay KCC/RuPay PMJDY cards:
AMC: Free
Classic Rupay cards (other than PMJDY), Rupay IBDigi cards, Domestic Mastercards including ePurse cards, Visa Classic cards:
AMC: ₹200
RuPay Platinum (Domestic/International), International MasterCard & Visa (Gold & Platinum) Cards:
AMC: ₹300
RuPay Debit Select Card:
AMC: ₹1000`
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
            "details": `Free AMC from 2nd year onwards:
Senior Citizen card/cards for Visually Challenged/SHG/RuPay KCC/RuPay PMJDY cards -  AMC : ₹0

AMC from 2nd year onwards:
Classic RuPay cards - AMC : ₹200

AMC from 2nd year onwards:
RuPay IBDigi cards - AMC: ₹200

AMC from 2nd year onwards:
Domestic Mastercards including ePurse cards - AMC : ₹200

Visa Classic cards -  AMC: ₹200

RuPay Platinum (Domestic/International)- AMC: ₹300
International MasterCard & Visa (Gold & Platinum) Cards - AMC: ₹300
RuPay Debit Select Card - AMC: ₹1000`
        }
    })
    console.log('narration 24', narration9)
    const narration10 = await prisma.bankNarrations.create({
        data: {
            "narration": "CHG FOR ATM ONUS DEP",
            "natureOfCharge": "Cash deposit charges through ATM/cash recyclers(BNA)",
            "details": "ATM/BNA Cash Deposit Transaction Service Charges (effective from 01.12.2023):\n\nOnus Cash Deposit Transaction - SB Account:\n\nUp to 5 transactions/month: Free\nBeyond 5 transactions/month: ₹30 per transaction\nOnus Cash Deposit Transaction - CA Account:\n\n₹10 per transaction"
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
            "details": `In Savings Account (SB):

Charges based on the shortfall in the average monthly balance:
76% - 100% shortfall: ₹100 per month
51% - 75% shortfall: ₹75 per month
26% - 50% shortfall: ₹50 per month
11% - 25% shortfall: ₹25 per month
1% - 10% shortfall: ₹10 per month
Exemptions: BSBDA/Small Accounts, accounts of Students, Pensioners (without cheque facility), and Inoperative accounts. Charges start from the 2nd month of opening the account.

In Current Account (CA):
For non-maintenance of quarterly average balance:
Urban/Metropolitan: ₹600 per quarter
Proportionate charges to be applied for accounts opened or closed during the quarter.

In Current Account (CA): 
For non-maintenance of quarterly average balance:
Rural/Semi-urban: ₹350 per quarter
Proportionate charges to be applied for accounts opened or closed during the quarter.`
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

    const template = await prisma.templates.createMany({
        data: [{
            narration: "CHG FOR ONUS WDL",
            accountType: "SB",
            language: "en",
            template: [
                `The charge of ₹ \${amount} was incurred in your Savings Account because you exceeded the free ATM transactions. The transactions include any withdrawal or enquiry.`,
                `Upto 5 transactions are free with Indian Bank ATM. You will be charged Rs. 14 for each transaction after free transactions.`,
                `Upto 3 transactions are free with other bank ATMs in metro cities and upto 5 transactions are free with other bank ATMs in non metro cities. 

You will be charged Rs. 25 for each transaction after free transactions.`
            ],
        }, {
        //     narration: "CHG FOR ONUS WDL",
        //     accountType: "SB",
        //     language: "od",
        //     template: [
        //         `ଆପଣଙ୍କ ସଞ୍ଚଯ଼ ଆକାଉଣ୍ଟରେ ₹ \${amount} ର ଚାର୍ଜ ଲାଗୁ କରାଯାଇଥିଲା କାରଣ ଆପଣ ମାଗଣା ଏଟିଏମ୍ କାରବାରକୁ ଅତିକ୍ରମ କରିଥିଲେ। ନେଣଦେଣରେ ଯେକୌଣସି ଉଠାଣ କିମ୍ବା ଅନୁସନ୍ଧାନ ଅନ୍ତର୍ଭୁକ୍ତ |`,
        //         `ଇଣ୍ଡିଆନ୍ ବ୍ଯ଼ାଙ୍କ୍ ଏଟିଏମ୍ ସହିତ 5 ଟି କାରବାର ମାଗଣା | ଆପଣଙ୍କ ଠାରୁ ଏକ ଲକ୍ଷ ଟଙ୍କା ଆଦାଯ଼ କରାଯାଇଥାଏ। ମାଗଣା କାରବାର ପରେ ପ୍ରତ୍ଯ଼େକ କାରବାର ପାଇଁ 15 ଟଙ୍କା।`,
        //         `ମେଟ୍ରୋ ସହରରେ ଅନ୍ଯ଼ ବ୍ଯ଼ାଙ୍କ ଏଟିଏମ୍ଗୁଡ଼ିକ ସହିତ 3ଟି ପର୍ଯ୍ଯ଼ନ୍ତ କାରବାର ମାଗଣା ଏବଂ ଅନ୍ଯ଼ ବ୍ଯ଼ାଙ୍କ ଏଟିଏମ୍ଗୁଡ଼ିକ ସହିତ 5ଟି ପର୍ଯ୍ଯ଼ନ୍ତ କାରବାର ମାଗଣା।`
        //     ],
        // }, {
        //     narration: "CHG FOR ONUS WDL",
        //     accountType: "SB",
        //     language: "hi",
        //     template: [
        //         `₹ \${amount} का शुल्क आपके खाते में लगाया गया था क्योंकि आपने एटीएम की मुफ्त लेनदेन की सीमा को पार कर लिया था। लेन-देन में कोई भी निकासी या पूछताछ शामिल होती है।`,
        //         `इंडियन बैंक के ए. टी. एम. के साथ 5 लेनदेन निःशुल्क हैं। मुफ्त लेन-देन के बाद प्रत्येक लेन-देन के लिए आपसे 15. रुपये लिए जाते हैं।`,
        //         `महानगरों में अन्य बैंक के ए. टी. एम. के साथ 3 लेनदेन निःशुल्क हैं और अर्ध शहरी या गाँव में अन्य बैंक के ए. टी. एम. के साथ 5 लेनदेन निःशुल्क हैं।`
        //     ],
        // }, {
            narration: "CHG FOR ONUS WDL",
            accountType: "CA",
            language: "en",
            template: [
                `The charge of ₹ \${amount} was incurred in your Current Account because you exceeded the free ATM transactions. The transactions include any withdrawal or enquiry.`,
                `Upto 5 transactions are free with Indian Bank ATM. You will be charged Rs. 6 for each transaction after free transactions.`,
                `Upto 3 transactions are free with other bank ATMs in metro cities and upto 5 transactions are free with other bank ATMs in non metro cities.
You will be charged Rs. 10 for each transaction after free transactions.`
            ],
        }, {
        //     narration: "CHG FOR ONUS WDL",
        //     accountType: "CA",
        //     language: "od",
        //     template: [
        //         `ଆପଣଙ୍କ 'ଚଳନ୍ତି ଆକାଉଣ୍ଟ' ରେ ₹ \${amount} ର ଶୁଳ୍କ ଲାଗୁ କରାଯାଇଥିଲା କାରଣ ଆପଣ ମାଗଣା ଏଟିଏମ୍ କାରବାରକୁ ଅତିକ୍ରମ କରିଥିଲେ। ନେଣଦେଣରେ ଯେକୌଣସି ଉଠାଣ କିମ୍ବା ଅନୁସନ୍ଧାନ ଅନ୍ତର୍ଭୁକ୍ତ |`,
        //         `ଇଣ୍ଡିଆନ୍ ବ୍ୟାଙ୍କ ଏଟିଏମ୍ ସହିତ 5 ଟି କାରବାର ମାଗଣା | ମାଗଣା କାରବାର ପରେ ପ୍ରତ୍ୟେକ କାରବାର ପାଇଁ ଆପଣଙ୍କୁ ₹ 6 ଚାର୍ଜ କରାଯାଏ |`,
        //         `ମେଟ୍ରୋ ସହରଗୁଡିକର ଅନ୍ୟ ବ୍ୟାଙ୍କ ଏଟିଏମ୍ ସହିତ 3 ଟି କାରବାର ମାଗଣା ଏବଂ ଅଣ ମେଟ୍ରୋ ସହରରେ ଥିବା ଅନ୍ୟ ବ୍ୟାଙ୍କ ଏଟିଏମ୍ ସହିତ 5 ଟି କାରବାର ମାଗଣା ଅଟେ | ମାଗଣା କାରବାର ପରେ ପ୍ରତ୍ୟେକ କାରବାର ପାଇଁ ଆପଣଙ୍କୁ ₹ 10 ଚାର୍ଜ କରାଯାଏ |`
        //     ],
        // }, {
        //     narration: "CHG FOR ONUS WDL",
        //     accountType: "CA",
        //     language: "hi",
        //     template: [
        //         `₹ \${amount} का शुल्क आपके चालू खाते में लगाया गया था क्योंकि आपने मुफ्त एटीएम लेनदेन को पार कर लिया था। लेन-देन में कोई भी निकासी या पूछताछ शामिल होती है।`,
        //         `इंडियन बैंक के एटीएम से 5 लेनदेन तक मुफ्त हैं। मुफ़्त लेनदेन के बाद आपसे प्रत्येक लेनदेन के लिए ₹6 का शुल्क लिया जाता है।`,
        //         `मेट्रो शहरों में अन्य बैंक एटीएम से 3 लेनदेन तक मुफ्त हैं और गैर मेट्रो शहरों में अन्य बैंक एटीएम से 5 लेनदेन तक मुफ्त हैं। मुफ़्त लेनदेन के बाद आपसे प्रत्येक लेनदेन के लिए ₹10 का शुल्क लिया जाता है।`
        //     ],
        // }, {
            narration: "ATM WDL CHARGES",
            accountType: "SB",
            language: "en",
            template: [
                `The charge of ₹ \${amount} was incurred in your Savings Account because you exceeded the free ATM transactions. The transactions include any withdrawal or enquiry.`,
                `Upto 5 transactions are free with Indian Bank ATM. You will be charged Rs. 14 for each transaction after free transactions.`,
                `Upto 3 transactions are free with other bank ATMs in metro cities and upto 5 transactions are free with other bank ATMs in non metro cities. 

You will be charged Rs. 25 for each transaction after free transactions.`
            ],
        }, {
        //     narration: "ATM WDL CHARGES",
        //     accountType: "SB",
        //     language: "od",
        //     template: [
        //         `ଆପଣଙ୍କ ସଞ୍ଚଯ଼ ଆକାଉଣ୍ଟରେ ₹ \${amount} ର ଚାର୍ଜ ଲାଗୁ କରାଯାଇଥିଲା କାରଣ ଆପଣ ମାଗଣା ଏଟିଏମ୍ କାରବାରକୁ ଅତିକ୍ରମ କରିଥିଲେ। ନେଣଦେଣରେ ଯେକୌଣସି ଉଠାଣ କିମ୍ବା ଅନୁସନ୍ଧାନ ଅନ୍ତର୍ଭୁକ୍ତ |`,
        //         `ଇଣ୍ଡିଆନ୍ ବ୍ଯ଼ାଙ୍କ୍ ଏଟିଏମ୍ ସହିତ 5 ଟି କାରବାର ମାଗଣା | ଆପଣଙ୍କ ଠାରୁ ଏକ ଲକ୍ଷ ଟଙ୍କା ଆଦାଯ଼ କରାଯାଇଥାଏ। ମାଗଣା କାରବାର ପରେ ପ୍ରତ୍ଯ଼େକ କାରବାର ପାଇଁ 15 ଟଙ୍କା।`,
        //         `ମେଟ୍ରୋ ସହରରେ ଅନ୍ଯ଼ ବ୍ଯ଼ାଙ୍କ ଏଟିଏମ୍ଗୁଡ଼ିକ ସହିତ 3ଟି ପର୍ଯ୍ଯ଼ନ୍ତ କାରବାର ମାଗଣା ଏବଂ ଅନ୍ଯ଼ ବ୍ଯ଼ାଙ୍କ ଏଟିଏମ୍ଗୁଡ଼ିକ ସହିତ 5ଟି ପର୍ଯ୍ଯ଼ନ୍ତ କାରବାର ମାଗଣା।`
        //     ],
        // }, {
        //     narration: "ATM WDL CHARGES",
        //     accountType: "SB",
        //     language: "hi",
        //     template: [
        //         `₹ \${amount} का शुल्क आपके खाते में लगाया गया था क्योंकि आपने एटीएम की मुफ्त लेनदेन की सीमा को पार कर लिया था। लेन-देन में कोई भी निकासी या पूछताछ शामिल होती है।`,
        //         `इंडियन बैंक के ए. टी. एम. के साथ 5 लेनदेन निःशुल्क हैं। मुफ्त लेन-देन के बाद प्रत्येक लेन-देन के लिए आपसे 15. रुपये लिए जाते हैं।`,
        //         `महानगरों में अन्य बैंक के ए. टी. एम. के साथ 3 लेनदेन निःशुल्क हैं और अर्ध शहरी या गाँव में अन्य बैंक के ए. टी. एम. के साथ 5 लेनदेन निःशुल्क हैं।`
        //     ],
        // }, {
            narration: "ATM WDL CHARGES",
            accountType: "CA",
            language: "en",
            template: [
                `The charge of ₹ \${amount} was incurred in your Current Account because you exceeded the free ATM transactions. The transactions include any withdrawal or enquiry.`,
                `Upto 5 transactions are free with Indian Bank ATM. You will be charged Rs. 6 for each transaction after free transactions.`,
                `Upto 3 transactions are free with other bank ATMs in metro cities and upto 5 transactions are free with other bank ATMs in non metro cities.
You will be charged Rs. 10 for each transaction after free transactions.`
            ],
        }, {
        //     narration: "ATM WDL CHARGES",
        //     accountType: "CA",
        //     language: "od",
        //     template: [
        //         `ଆପଣଙ୍କ 'ଚଳନ୍ତି ଆକାଉଣ୍ଟ' ରେ ₹ \${amount} ର ଶୁଳ୍କ ଲାଗୁ କରାଯାଇଥିଲା କାରଣ ଆପଣ ମାଗଣା ଏଟିଏମ୍ କାରବାରକୁ ଅତିକ୍ରମ କରିଥିଲେ। ନେଣଦେଣରେ ଯେକୌଣସି ଉଠାଣ କିମ୍ବା ଅନୁସନ୍ଧାନ ଅନ୍ତର୍ଭୁକ୍ତ |`,
        //         `ଇଣ୍ଡିଆନ୍ ବ୍ୟାଙ୍କ ଏଟିଏମ୍ ସହିତ 5 ଟି କାରବାର ମାଗଣା | ମାଗଣା କାରବାର ପରେ ପ୍ରତ୍ୟେକ କାରବାର ପାଇଁ ଆପଣଙ୍କୁ ₹ 6 ଚାର୍ଜ କରାଯାଏ |`,
        //         `ମେଟ୍ରୋ ସହରଗୁଡିକର ଅନ୍ୟ ବ୍ୟାଙ୍କ ଏଟିଏମ୍ ସହିତ 3 ଟି କାରବାର ମାଗଣା ଏବଂ ଅଣ ମେଟ୍ରୋ ସହରରେ ଥିବା ଅନ୍ୟ ବ୍ୟାଙ୍କ ଏଟିଏମ୍ ସହିତ 5 ଟି କାରବାର ମାଗଣା ଅଟେ | ମାଗଣା କାରବାର ପରେ ପ୍ରତ୍ୟେକ କାରବାର ପାଇଁ ଆପଣଙ୍କୁ ₹ 10 ଚାର୍ଜ କରାଯାଏ |`
        //     ],
        // }, {
        //     narration: "ATM WDL CHARGES",
        //     accountType: "CA",
        //     language: "hi",
        //     template: [
        //         `₹ \${amount} का शुल्क आपके चालू खाते में लगाया गया था क्योंकि आपने मुफ्त एटीएम लेनदेन को पार कर लिया था। लेन-देन में कोई भी निकासी या पूछताछ शामिल होती है।`,
        //         `इंडियन बैंक के एटीएम से 5 लेनदेन तक मुफ्त हैं। मुफ़्त लेनदेन के बाद आपसे प्रत्येक लेनदेन के लिए ₹6 का शुल्क लिया जाता है।`,
        //         `मेट्रो शहरों में अन्य बैंक एटीएम से 3 लेनदेन तक मुफ्त हैं और गैर मेट्रो शहरों में अन्य बैंक एटीएम से 5 लेनदेन तक मुफ्त हैं। मुफ़्त लेनदेन के बाद आपसे प्रत्येक लेनदेन के लिए ₹10 का शुल्क लिया जाता है।`
        //     ],
        // }, {
            narration: "ATM ENQ CHARGES",
            accountType: "SB",
            language: "en",
            template: [
                `The charge of ₹ \${amount} was incurred in your Savings Account because you exceeded the free ATM transactions. The transactions include any withdrawal or enquiry.`,
                `Upto 5 transactions are free with Indian Bank ATM. You will be charged Rs. 14 for each transaction after free transactions.`,
                `Upto 3 transactions are free with other bank ATMs in metro cities and upto 5 transactions are free with other bank ATMs in non metro cities. 

You will be charged Rs. 25 for each transaction after free transactions.`
            ],
        }, {
        //     narration: "ATM ENQ CHARGES",
        //     accountType: "SB",
        //     language: "od",
        //     template: [
        //         `ଆପଣଙ୍କ ସଞ୍ଚଯ଼ ଆକାଉଣ୍ଟରେ ₹ \${amount} ର ଚାର୍ଜ ଲାଗୁ କରାଯାଇଥିଲା କାରଣ ଆପଣ ମାଗଣା ଏଟିଏମ୍ କାରବାରକୁ ଅତିକ୍ରମ କରିଥିଲେ। ନେଣଦେଣରେ ଯେକୌଣସି ଉଠାଣ କିମ୍ବା ଅନୁସନ୍ଧାନ ଅନ୍ତର୍ଭୁକ୍ତ |`,
        //         `ଇଣ୍ଡିଆନ୍ ବ୍ଯ଼ାଙ୍କ୍ ଏଟିଏମ୍ ସହିତ 5 ଟି କାରବାର ମାଗଣା | ଆପଣଙ୍କ ଠାରୁ ଏକ ଲକ୍ଷ ଟଙ୍କା ଆଦାଯ଼ କରାଯାଇଥାଏ। ମାଗଣା କାରବାର ପରେ ପ୍ରତ୍ଯ଼େକ କାରବାର ପାଇଁ 15 ଟଙ୍କା।`,
        //         `ମେଟ୍ରୋ ସହରରେ ଅନ୍ଯ଼ ବ୍ଯ଼ାଙ୍କ ଏଟିଏମ୍ଗୁଡ଼ିକ ସହିତ 3ଟି ପର୍ଯ୍ଯ଼ନ୍ତ କାରବାର ମାଗଣା ଏବଂ ଅନ୍ଯ଼ ବ୍ଯ଼ାଙ୍କ ଏଟିଏମ୍ଗୁଡ଼ିକ ସହିତ 5ଟି ପର୍ଯ୍ଯ଼ନ୍ତ କାରବାର ମାଗଣା।`
        //     ],
        // }, {
        //     narration: "ATM ENQ CHARGES",
        //     accountType: "SB",
        //     language: "hi",
        //     template: [
        //         `₹ \${amount} का शुल्क आपके खाते में लगाया गया था क्योंकि आपने एटीएम की मुफ्त लेनदेन की सीमा को पार कर लिया था। लेन-देन में कोई भी निकासी या पूछताछ शामिल होती है।`,
        //         `इंडियन बैंक के ए. टी. एम. के साथ 5 लेनदेन निःशुल्क हैं। मुफ्त लेन-देन के बाद प्रत्येक लेन-देन के लिए आपसे 15. रुपये लिए जाते हैं।`,
        //         `महानगरों में अन्य बैंक के ए. टी. एम. के साथ 3 लेनदेन निःशुल्क हैं और अर्ध शहरी या गाँव में अन्य बैंक के ए. टी. एम. के साथ 5 लेनदेन निःशुल्क हैं।`
        //     ],
        // }, {
            narration: "ATM ENQ CHARGES",
            accountType: "CA",
            language: "en",
            template: [
                `The charge of ₹ \${amount} was incurred in your Current Account because you exceeded the free ATM transactions. The transactions include any withdrawal or enquiry.`,
                `Upto 5 transactions are free with Indian Bank ATM. You will be charged Rs. 6 for each transaction after free transactions.`,
                `Upto 3 transactions are free with other bank ATMs in metro cities and upto 5 transactions are free with other bank ATMs in non metro cities.
You will be charged Rs. 10 for each transaction after free transactions.`
            ],
        }, {
        //     narration: "ATM ENQ CHARGES",
        //     accountType: "CA",
        //     language: "od",
        //     template: [
        //         `ଆପଣଙ୍କ 'ଚଳନ୍ତି ଆକାଉଣ୍ଟ' ରେ ₹ \${amount} ର ଶୁଳ୍କ ଲାଗୁ କରାଯାଇଥିଲା କାରଣ ଆପଣ ମାଗଣା ଏଟିଏମ୍ କାରବାରକୁ ଅତିକ୍ରମ କରିଥିଲେ। ନେଣଦେଣରେ ଯେକୌଣସି ଉଠାଣ କିମ୍ବା ଅନୁସନ୍ଧାନ ଅନ୍ତର୍ଭୁକ୍ତ |`,
        //         `ଇଣ୍ଡିଆନ୍ ବ୍ୟାଙ୍କ ଏଟିଏମ୍ ସହିତ 5 ଟି କାରବାର ମାଗଣା | ମାଗଣା କାରବାର ପରେ ପ୍ରତ୍ୟେକ କାରବାର ପାଇଁ ଆପଣଙ୍କୁ ₹ 6 ଚାର୍ଜ କରାଯାଏ |`,
        //         `ମେଟ୍ରୋ ସହରଗୁଡିକର ଅନ୍ୟ ବ୍ୟାଙ୍କ ଏଟିଏମ୍ ସହିତ 3 ଟି କାରବାର ମାଗଣା ଏବଂ ଅଣ ମେଟ୍ରୋ ସହରରେ ଥିବା ଅନ୍ୟ ବ୍ୟାଙ୍କ ଏଟିଏମ୍ ସହିତ 5 ଟି କାରବାର ମାଗଣା ଅଟେ | ମାଗଣା କାରବାର ପରେ ପ୍ରତ୍ୟେକ କାରବାର ପାଇଁ ଆପଣଙ୍କୁ ₹ 10 ଚାର୍ଜ କରାଯାଏ |`
        //     ],
        // }, {
        //     narration: "ATM ENQ CHARGES",
        //     accountType: "CA",
        //     language: "hi",
        //     template: [
        //         `₹ \${amount} का शुल्क आपके चालू खाते में लगाया गया था क्योंकि आपने मुफ्त एटीएम लेनदेन को पार कर लिया था। लेन-देन में कोई भी निकासी या पूछताछ शामिल होती है।`,
        //         `इंडियन बैंक के एटीएम से 5 लेनदेन तक मुफ्त हैं। मुफ़्त लेनदेन के बाद आपसे प्रत्येक लेनदेन के लिए ₹6 का शुल्क लिया जाता है।`,
        //         `मेट्रो शहरों में अन्य बैंक एटीएम से 3 लेनदेन तक मुफ्त हैं और गैर मेट्रो शहरों में अन्य बैंक एटीएम से 5 लेनदेन तक मुफ्त हैं। मुफ़्त लेनदेन के बाद आपसे प्रत्येक लेनदेन के लिए ₹10 का शुल्क लिया जाता है।`
        //     ],
        // }, {
            narration: "ATM INSUFFICIENT FUNDS CHARGES",
            accountType: "SB",
            language: "en",
            template: [
                `The charge of ₹ \${amount} was incurred in your Savings Account for withdrawal transaction decline due to insufficient balance through ATM/ BNAs:

Up to 5 transactions/month: Free
Beyond 5 transactions/month: ₹25 per transaction`
            ],
        }, {
        //     narration: "ATM INSUFFICIENT FUNDS CHARGES",
        //     accountType: "SB",
        //     language: "od",
        //     template: [
        //         `ଏ. ଟି. ଏମ୍./ବି. ଏନ୍. ଏ. ମାଧ୍ଯ଼ମରେ ପର୍ଯ୍ଯ଼ାପ୍ତ ପରିମାଣର ଅର୍ଥ ଜମା ନ ଥିବାରୁ ଉଠାଣ କାରବାର ହ୍ରାସ ପାଇଁ ଆପଣଙ୍କ ସଞ୍ଚଯ଼ ଖାତାରେ ₹ \${amount} ର ଶୁଳ୍କ ଲାଗୁ କରାଯାଇଥିଲାଃ 5ଟି କାରବାର/ମାସ ପର୍ଯ୍ଯ଼ନ୍ତଃ 5ଟି କାରବାର/ମାସ ପରେ ମାଗଣାଃ ପ୍ରତି କାରବାର ପାଇଁ ₹25`
        //     ],
        // }, {
        //     narration: "ATM INSUFFICIENT FUNDS CHARGES",
        //     accountType: "SB",
        //     language: "hi",
        //     template: [
        //         `ए. टी. एम./बी. एन. ए. के माध्यम से अपर्याप्त शेष राशि के कारण निकासी लेनदेन में गिरावट के लिए आपके बचत खाते में ₹ \${amount} का शुल्क लगाया गया थाः 5 लेनदेन/माह तकः 5 लेनदेन/महीने से परे निःशुल्कः ₹25 प्रति लेनदेन`
        //     ],
        // }, {
            narration: "ATM INSUFFICIENT FUNDS CHARGES",
            accountType: "CA",
            language: "en",
            template: [
                `The charge of ₹ \${amount} was incurred in your Current Account for withdrawal transaction decline due to insufficient balance through ATM/ BNAs:

Onus Cash Deposit Transaction - CA Account:
₹10 per transaction
Transaction Decline due to Insufficient Balance:
₹15 per transaction (applicable to both Onus and Issuer)`
            ],
        // }, {
        //     narration: "ATM INSUFFICIENT FUNDS CHARGES",
        //     accountType: "CA",
        //     language: "od",
        //     template: [
        //         `ଏ. ଟି. ଏମ୍./ବି. ଏନ୍. ଏ. ମାଧ୍ଯ଼ମରେ ପର୍ଯ୍ଯ଼ାପ୍ତ ପରିମାଣର ଅର୍ଥ ଜମା ନଥିବା କାରଣରୁ ଉଠାଣ କାରବାର ହ୍ରାସ ପାଇଁ ଆପଣଙ୍କ 'ଚଳନ୍ତି ଆକାଉଣ୍ଟ ରେ' ₹ \${amount} ର ଶୁଳ୍କ ଲାଗୁ କରାଯାଇଥିଲାଃ 'ଅନସ୍ କ୍ଯ଼ାସ୍ ଡିପୋଜିଟ୍ ଟ୍ରାଞ୍ଜାକ୍ସନ୍ "-' ସି. ଏ. ଆକାଉଣ୍ଟ": 'ଅନସ୍ କ୍ଯ଼ାସ୍ ଡିପୋଜିଟ୍ ଟ୍ରାଞ୍ଜାକ୍ସନ୍ "ପ୍ରତି କାରବାର ପାଇଁ 10 ଟଙ୍କା,' ଅନସ୍ କ୍ଯ଼ାସ୍" କାରଣରୁ କାରବାର ହ୍ରାସଃ ପ୍ରତି କାରବାର ପାଇଁ 15 ଟଙ୍କା (ଉଭଯ଼ 'ଅନସ୍ "ଏବଂ' ପ୍ରଦାନକାରୀ" ଙ୍କ ପାଇଁ ଲାଗୁ)।`
        //     ],
        // }, {
        //     narration: "ATM INSUFFICIENT FUNDS CHARGES",
        //     accountType: "CA",
        //     language: "hi",
        //     template: [
        //         `ए. टी. एम./बी. एन. ए. के माध्यम से अपर्याप्त शेष राशि के कारण निकासी लेनदेन में गिरावट के लिए आपके चालू खाते में ₹ \${amount} का शुल्क लगाया गया थाः ऑनस कैश डिपॉजिट ट्रांजैक्शन-सी. ए. खाताः प्रति लेनदेन ₹ 10 अपर्याप्त शेष राशि के कारण लेनदेन में गिरावटः ₹ 15 प्रति लेनदेन (ऑनस और जारीकर्ता दोनों पर लागू)`
        //     ],
        }, {
            narration: "ATM _Card _Issuance_ Fe",
            amount: 100,
            language: "en",
            template: [
                `A membership fee of ₹ 100 was incurred as issuance fee for one of the following ATM cards: Rupay Platinum (Domestic & International), Visa Gold/Platinum, International Master Cards`
            ],
        // }, {
        //     narration: "ATM _Card _Issuance_ Fe",
        //     amount: 100,
        //     language: "od",
        //     template: [
        //         `ଗୋଟିଏ ଅନୁଗାମୀ ଏଟିଏମ୍ କାର୍ଡଃ ରୁପେ ପ୍ଲାଟିନମ୍ (ଘରୋଇ ଏବଂ ଆନ୍ତର୍ଜାତୀଯ଼), ଭିସା ଗୋଲ୍ଡ/ପ୍ଲାଟିନମ୍, ଆନ୍ତର୍ଜାତୀଯ଼ ମାଷ୍ଟର କାର୍ଡ ପାଇଁ ସଦସ୍ଯ଼ତା ଶୁଳ୍କ 100 ଟଙ୍କା ଖର୍ଚ୍ଚ ହୋଇଥିଲା।`
        //     ],
        // }, {
        //     narration: "ATM _Card _Issuance_ Fe",
        //     amount: 100,
        //     language: "hi",
        //     template: [
        //         `निम्नलिखित एटीएम कार्डों में से एक के लिए जारी शुल्क के रूप में ₹100 का सदस्यता शुल्क लिया गया थाः रुपे प्लेटिनम (घरेलू और अंतर्राष्ट्रीय), वीजा गोल्ड/प्लेटिनम, अंतर्राष्ट्रीय मास्टर कार्ड।`
        //     ],
        }, {
            narration: "ATM _Card _Issuance_ Fe",
            amount: 300,
            language: "en",
            template: [
                `A membership fee of ₹ 300 was incurred as issuance fee of Master My Design Customised Image Card`
            ],
        // }, {
        //     narration: "ATM _Card _Issuance_ Fe",
        //     amount: 300,
        //     language: "od",
        //     template: [
        //         `ମାଷ୍ଟର ମାଇଁ ଡିଜାଇନ୍ କଷ୍ଟୋମାଇଜଡ୍ ଇମେଜ୍ କାର୍ଡ ଜାରି କରିବା ପାଇଁ 300 ଟଙ୍କା ସଦସ୍ଯ଼ତା ଶୁଳ୍କ ଦେବାକୁ ପଡ଼ିଥିଲା।`
        //     ],
        // }, {
        //     narration: "ATM _Card _Issuance_ Fe",
        //     amount: 300,
        //     language: "hi",
        //     template: [
        //         `मास्टर माई डिजाइन कस्टमाइज्ड इमेज कार्ड जारी करने के शुल्क के रूप में ₹300 का सदस्यता शुल्क लिया गया था।`
        //     ],
        }, {
            narration: "ATM _Card _Issuance_ Fe",
            amount: 1000,
            language: "en",
            template: [
                `A membership fee of ₹ 1000 was incurred as issuance fee of RuPay Select Debit Card`
            ],
        // }, {
        //     narration: "ATM _Card _Issuance_ Fe",
        //     amount: 1000,
        //     language: "od",
        //     template: [
        //         `ରୁପେ ସିଲେକ୍ଟ ଡେବିଟ୍ କାର୍ଡ ଜାରି କରିବା ପାଇଁ 1000 ଟଙ୍କା ସଦସ୍ଯ଼ତା ଶୁଳ୍କ ଦେବାକୁ ପଡ଼ିଥିଲା।`
        //     ],
        // }, {
        //     narration: "ATM _Card _Issuance_ Fe",
        //     amount: 1000,
        //     language: "hi",
        //     template: [
        //         `रुपे सेलेक्ट डेबिट कार्ड जारी करने के शुल्क के रूप में ₹1000 का सदस्यता शुल्क लगाया गया था।`
        //     ],
        }, {
            narration: "ATM AMC CHGS",
            amount: 118,
            language: "en",
            template: [
                `A charge of ₹ 118 was deducted from your account as Annual Maintenance Charge (AMC) for your ATM Card issued by the bank. An AMC of ₹ 118 is charged from 2nd year post issuance for the following cards:
Classic RuPay cards (other than PMJDY), RuPay IBDigi cards, Domestic Mastercards including ePurse cards, Visa Classic cards

AMC Charges for the above cards in the 1st year is free`
            ],
        // }, {
        //     narration: "ATM AMC CHGS",
        //     amount: 200,
        //     language: "od",
        //     template: [
        //         `ବ୍ଯ଼ାଙ୍କ ଦ୍ୱାରା ଜାରି କରାଯାଇଥିବା ଆପଣଙ୍କ ଏଟିଏମ୍ କାର୍ଡ ପାଇଁ ବାର୍ଷିକ ରକ୍ଷଣାବେକ୍ଷଣ ଶୁଳ୍କ (ଏ. ଏମ୍. ସି.) ଭାବରେ ଆପଣଙ୍କ ଆକାଉଣ୍ଟରୁ 200 ଟଙ୍କା ଶୁଳ୍କ କଟାଯାଇଥିଲା। 2ଯ଼ ବର୍ଷ ଜାରି ହେବା ପରେ ନିମ୍ନଲିଖିତ କାର୍ଡଗୁଡ଼ିକ ପାଇଁ ଏ. ଏମ୍. ସି. ରୁ 200 ଟଙ୍କା ଆଦାଯ଼ କରାଯାଇଥାଏଃ କ୍ଲାସିକ୍ ରୁପେ କାର୍ଡ (ପି. ଏମ୍. ଜେ. ଡି. ୱାଇ. ବ୍ଯ଼ତୀତ), ରୁପେ ଆଇ. ବି. ଡି. ଜି. କାର୍ଡ, ଇ-ନର୍ସ କାର୍ଡ ସମେତ ଘରୋଇ ମାଷ୍ଟର କାର୍ଡ, ଭିସା କ୍ଲାସିକ୍ କାର୍ଡ, ପ୍ରଥମ ବର୍ଷରେ ଉପରୋକ୍ତ କାର୍ଡଗୁଡ଼ିକ ପାଇଁ ଏ. ଏମ୍. ସି. ଦେଯ଼ ମାଗଣାରେ ଆଦାଯ଼ କରାଯାଇଥାଏ।`
        //     ],
        // }, {
        //     narration: "ATM AMC CHGS",
        //     amount: 200,
        //     language: "hi",
        //     template: [
        //         `बैंक द्वारा जारी आपके एटीएम कार्ड के लिए वार्षिक रखरखाव शुल्क (ए. एम. सी.) के रूप में आपके खाते से ₹200 का शुल्क काट लिया गया था। निम्नलिखित कार्डों के लिए जारी होने के दूसरे वर्ष के बाद से 200 रुपये का ए. एम. सी. शुल्क लिया जाता हैः क्लासिक रुपे कार्ड (पी. एम. जे. डी. वाई. के अलावा), रुपे आई. बी. डिगी कार्ड, ई-नर्स कार्ड सहित घरेलू मास्टर कार्ड, वीजा क्लासिक कार्ड ए. एम. सी. पहले वर्ष में उपरोक्त कार्डों के लिए शुल्क निःशुल्क है।`
        //     ],
        }, {
            narration: "ATM AMC CHGS",
            amount: 200,
            language: "en",
            template: [
                `A charge of ₹ 200 was deducted from your account as Annual Maintenance Charge (AMC) for your ATM Card issued by the bank. An AMC of ₹ 200 is charged from 2nd year post issuance for the following cards:
Classic RuPay cards (other than PMJDY), RuPay IBDigi cards, Domestic Mastercards including ePurse cards, Visa Classic cards

AMC Charges for the above cards in the 1st year is free`
            ],
        // }, {
        //     narration: "ATM AMC CHGS",
        //     amount: 200,
        //     language: "od",
        //     template: [
        //         `ବ୍ଯ଼ାଙ୍କ ଦ୍ୱାରା ଜାରି କରାଯାଇଥିବା ଆପଣଙ୍କ ଏଟିଏମ୍ କାର୍ଡ ପାଇଁ ବାର୍ଷିକ ରକ୍ଷଣାବେକ୍ଷଣ ଶୁଳ୍କ (ଏ. ଏମ୍. ସି.) ଭାବରେ ଆପଣଙ୍କ ଆକାଉଣ୍ଟରୁ 200 ଟଙ୍କା ଶୁଳ୍କ କଟାଯାଇଥିଲା। 2ଯ଼ ବର୍ଷ ଜାରି ହେବା ପରେ ନିମ୍ନଲିଖିତ କାର୍ଡଗୁଡ଼ିକ ପାଇଁ ଏ. ଏମ୍. ସି. ରୁ 200 ଟଙ୍କା ଆଦାଯ଼ କରାଯାଇଥାଏଃ କ୍ଲାସିକ୍ ରୁପେ କାର୍ଡ (ପି. ଏମ୍. ଜେ. ଡି. ୱାଇ. ବ୍ଯ଼ତୀତ), ରୁପେ ଆଇ. ବି. ଡି. ଜି. କାର୍ଡ, ଇ-ନର୍ସ କାର୍ଡ ସମେତ ଘରୋଇ ମାଷ୍ଟର କାର୍ଡ, ଭିସା କ୍ଲାସିକ୍ କାର୍ଡ, ପ୍ରଥମ ବର୍ଷରେ ଉପରୋକ୍ତ କାର୍ଡଗୁଡ଼ିକ ପାଇଁ ଏ. ଏମ୍. ସି. ଦେଯ଼ ମାଗଣାରେ ଆଦାଯ଼ କରାଯାଇଥାଏ।`
        //     ],
        // }, {
        //     narration: "ATM AMC CHGS",
        //     amount: 200,
        //     language: "hi",
        //     template: [
        //         `बैंक द्वारा जारी आपके एटीएम कार्ड के लिए वार्षिक रखरखाव शुल्क (ए. एम. सी.) के रूप में आपके खाते से ₹200 का शुल्क काट लिया गया था। निम्नलिखित कार्डों के लिए जारी होने के दूसरे वर्ष के बाद से 200 रुपये का ए. एम. सी. शुल्क लिया जाता हैः क्लासिक रुपे कार्ड (पी. एम. जे. डी. वाई. के अलावा), रुपे आई. बी. डिगी कार्ड, ई-नर्स कार्ड सहित घरेलू मास्टर कार्ड, वीजा क्लासिक कार्ड ए. एम. सी. पहले वर्ष में उपरोक्त कार्डों के लिए शुल्क निःशुल्क है।`
        //     ],
        }, {
            narration: "ATM AMC CHGS",
            amount: 300,
            language: "en",
            template: [
                `A charge of ₹ 300 was deducted from your account as Annual Maintenance Charge (AMC) for your ATM Card issued by the bank. An Annual Maintenance Charge (AMC) of ₹ 300 is charged from 2nd year post issuance for the following cards:
RuPay Platinum (Domestic/International), International MasterCard & Visa (Gold & Platinum) Cards

AMC Charges for the above cards in the 1st year is free`
            ],
        // }, {
        //     narration: "ATM AMC CHGS",
        //     amount: 300,
        //     language: "od",
        //     template: [
        //         `ବ୍ଯ଼ାଙ୍କ ଦ୍ୱାରା ଜାରି କରାଯାଇଥିବା ଆପଣଙ୍କ ଏଟିଏମ୍ କାର୍ଡ ପାଇଁ ବାର୍ଷିକ ରକ୍ଷଣାବେକ୍ଷଣ ଶୁଳ୍କ (ଏ. ଏମ୍. ସି.) ଭାବରେ ଆପଣଙ୍କ ଆକାଉଣ୍ଟରୁ 300 ଟଙ୍କା ଶୁଳ୍କ କଟାଯାଇଥିଲା। ନିମ୍ନଲିଖିତ କାର୍ଡଗୁଡ଼ିକ ପାଇଁ ଜାରି ହେବାର ଦ୍ୱିତୀଯ଼ ବର୍ଷ ଠାରୁ 300 ଟଙ୍କାର ବାର୍ଷିକ ରକ୍ଷଣାବେକ୍ଷଣ ଶୁଳ୍କ (ଏ. ଏମ୍. ସି.) ଆଦାଯ଼ କରାଯାଏଃ ରୁପେ ପ୍ଲାଟିନମ୍ (ଘରୋଇ/ଆନ୍ତର୍ଜାତୀଯ଼), ଆନ୍ତର୍ଜାତୀଯ଼ ମାଷ୍ଟରକାର୍ଡ ଏବଂ ଭିସା (ସୁନା ଏବଂ ପ୍ଲାଟିନମ୍) ପ୍ରଥମ ବର୍ଷରେ ଉପରୋକ୍ତ କାର୍ଡଗୁଡ଼ିକ ପାଇଁ ଏ. ଏମ୍. ସି. ଶୁଳ୍କ ମାଗଣା।`
        //     ],
        // }, {
        //     narration: "ATM AMC CHGS",
        //     amount: 300,
        //     language: "hi",
        //     template: [
        //         `बैंक द्वारा जारी आपके ए. टी. एम. कार्ड के लिए वार्षिक रखरखाव शुल्क (ए. एम. सी.) के रूप में आपके खाते से ₹300 का शुल्क काटा गया था। निम्नलिखित कार्डों के लिए जारी होने के दूसरे वर्ष से ₹300 का वार्षिक रखरखाव शुल्क (ए. एम. सी.) लिया जाता हैः रुपे प्लेटिनम (घरेलू/अंतर्राष्ट्रीय), अंतर्राष्ट्रीय मास्टरकार्ड और वीजा (स्वर्ण और प्लेटिनम) कार्ड ए. एम. सी. पहले वर्ष में उपरोक्त कार्डों के लिए शुल्क निःशुल्क है।`
        //     ],
        }, {
            narration: "ATM AMC CHGS",
            amount: 1000,
            language: "en",
            template: [
                `An Annual Maintenance Charge(AMC) of ₹ 1000 is charged from the 2nd year post issuance for RuPay Debit Select Card issued to you. 

AMC Charges for the above card in the 1st year is free`
            ],
        // }, {
        //     narration: "ATM AMC CHGS",
        //     amount: 1000,
        //     language: "od",
        //     template: [
        //         `ଆପଣଙ୍କୁ ଜାରି କରାଯାଇଥିବା ରୁପେ ଡେବିଟ୍ ଚଯ଼ନ କାର୍ଡ ପାଇଁ ଦ୍ୱିତୀଯ଼ ବର୍ଷ ଜାରି ହେବା ପରେ 1000 ଟଙ୍କାର ବାର୍ଷିକ ରକ୍ଷଣାବେକ୍ଷଣ ଶୁଳ୍କ (ଏ. ଏମ୍. ସି.) ଆଦାଯ଼ କରାଯାଇଥାଏ। ପ୍ରଥମ ବର୍ଷରେ ଉପରୋକ୍ତ କାର୍ଡ ପାଇଁ ଏ. ଏମ୍. ସି. ଦେଯ଼ ମାଗଣା।`
        //     ],
        // }, {
        //     narration: "ATM AMC CHGS",
        //     amount: 1000,
        //     language: "hi",
        //     template: [
        //         `आपको जारी किए गए रुपे डेबिट सेलेक्ट कार्ड के लिए जारी किए गए दूसरे वर्ष के बाद से 1000 रुपये का वार्षिक रखरखाव शुल्क (ए. एम. सी.) लिया जाता है। प्रथम वर्ष में उपरोक्त कार्ड के लिए ए. एम. सी. शुल्क निःशुल्क है।`
        //     ],
        }, {
            narration: "MIN BAL CHGS",
            amount: 100,
            accountType: "SB",
            language: "en",
            template: [
                `A charge of ₹ 100 per month is deducted for non maintenance of minimum balance with a shortfall of 76% to 100% in average monthly balance in your Savings Account`
            ],
        // }, {
        //     narration: "MIN BAL CHGS",
        //     amount: 100,
        //     accountType: "SB",
        //     language: "od",
        //     template: [
        //         `ଆପଣଙ୍କ ସଞ୍ଚଯ଼ ଖାତାରେ ହାରାହାରି ମାସିକ ବାଲାନ୍ସରେ 76 ପ୍ରତିଶତରୁ 100% ର ଅଭାବ ସହିତ ସର୍ବନିମ୍ନ ବାଲାନ୍ସ ରକ୍ଷଣାବେକ୍ଷଣ ନକରିବା ପାଇଁ ମାସିକ 100 ଟଙ୍କା ଶୁଳ୍କ କାଟି ଦିଆଯାଏ |`
        //     ],
        // }, {
        //     narration: "MIN BAL CHGS",
        //     amount: 100,
        //     accountType: "SB",
        //     language: "hi",
        //     template: [
        //         `आपके बचत खाते में औसत मासिक शेष राशि में 76 प्रतिशत की कमी के साथ न्यूनतम शेष राशि का रखरखाव न करने पर प्रति माह 100 रुपये का शुल्क काटा जाता है।`
        //     ],
        }, {
            narration: "MIN BAL CHGS",
            amount: 75,
            accountType: "SB",
            language: "en",
            template: [
                `A charge of ₹ 75 per month is deducted for non maintenance of minimum balance with a shortfall of 51% to 75% in average monthly balance in your Savings Account`
            ],
        // }, {
        //     narration: "MIN BAL CHGS",
        //     amount: 75,
        //     accountType: "SB",
        //     language: "od",
        //     template: [
        //         `ଆପଣଙ୍କ ସଞ୍ଚଯ଼ ଖାତାରେ ହାରାହାରି ମାସିକ ଜମା ରାଶିରେ 51 ପ୍ରତିଶତରୁ 75 ପ୍ରତିଶତ ହ୍ରାସ ସହିତ ସର୍ବନିମ୍ନ ଜମା ରାଶିର ରକ୍ଷଣାବେକ୍ଷଣ ନକଲେ ମାସିକ 75 ଟଙ୍କା ଶୁଳ୍କ କାଟି ଦିଆଯାଏ।`
        //     ],
        // }, {
        //     narration: "MIN BAL CHGS",
        //     amount: 75,
        //     accountType: "SB",
        //     language: "hi",
        //     template: [
        //         `आपके बचत खाते में औसत मासिक शेष राशि में 51 प्रतिशत से 75 प्रतिशत की कमी के साथ न्यूनतम शेष राशि का रखरखाव न करने पर 75 रुपये प्रति माह का शुल्क काटा जाता है।`
        //     ],
        }, {
            narration: "MIN BAL CHGS",
            amount: 50,
            accountType: "SB",
            language: "en",
            template: [
                `A charge of ₹ 50 per month is deducted for non maintenance of minimum balance with a shortfall of 26% to 50% in average monthly balance in your Savings Account`
            ],
        // }, {
        //     narration: "MIN BAL CHGS",
        //     amount: 50,
        //     accountType: "SB",
        //     language: "od",
        //     template: [
        //         `ଆପଣଙ୍କ ସଞ୍ଚଯ଼ ଖାତାରେ ହାରାହାରି ମାସିକ ଜମା ରାଶିରେ 26 ରୁ 50 ପ୍ରତିଶତ ଅଭାବ ସହିତ ସର୍ବନିମ୍ନ ଜମା ରାଶିର ରକ୍ଷଣାବେକ୍ଷଣ ନକଲେ ମାସିକ 50 ଟଙ୍କା ଶୁଳ୍କ କାଟି ଦିଆଯାଏ।`
        //     ],
        // }, {
        //     narration: "MIN BAL CHGS",
        //     amount: 50,
        //     accountType: "SB",
        //     language: "hi",
        //     template: [
        //         `आपके बचत खाते में औसत मासिक शेष राशि में 26 प्रतिशत से 50 प्रतिशत की कमी के साथ न्यूनतम शेष राशि का रखरखाव न करने पर 50 रुपये प्रति माह का शुल्क काटा जाता है।`
        //     ],
        }, {
            narration: "MIN BAL CHGS",
            amount: 25,
            accountType: "SB",
            language: "en",
            template: [
                `A charge of ₹ 25 per month is deducted for non maintenance of minimum balance with a shortfall of 11% to 25% in average monthly balance in your Savings Account`
            ],
        // }, {
        //     narration: "MIN BAL CHGS",
        //     amount: 25,
        //     accountType: "SB",
        //     language: "od",
        //     template: [
        //         `ଆପଣଙ୍କ ସଞ୍ଚଯ଼ ଖାତାରେ ହାରାହାରି ମାସିକ ଜମା ରାଶିରେ 11 ପ୍ରତିଶତରୁ 25 ପ୍ରତିଶତ ହ୍ରାସ ସହିତ ସର୍ବନିମ୍ନ ଜମା ରାଶିର ରକ୍ଷଣାବେକ୍ଷଣ ନକଲେ ମାସିକ 25 ଟଙ୍କା ଶୁଳ୍କ କାଟି ଦିଆଯାଏ।`
        //     ],
        // }, {
        //     narration: "MIN BAL CHGS",
        //     amount: 25,
        //     accountType: "SB",
        //     language: "hi",
        //     template: [
        //         `आपके बचत खाते में औसत मासिक शेष राशि में 11 प्रतिशत से 25 प्रतिशत की कमी के साथ न्यूनतम शेष राशि का रखरखाव न करने पर प्रति माह 25 रुपये का शुल्क काटा जाता है।`
        //     ],
        }, {
            narration: "MIN BAL CHGS",
            amount: 36,
            accountType: "SB",
            language: "en",
            template: [
                `A charge of ₹ 36 per month is deducted for non maintenance of minimum balance with a shortfall of 11% to 25% in average monthly balance in your Savings Account`
            ],
        // }, {
        //     narration: "MIN BAL CHGS",
        //     amount: 25,
        //     accountType: "SB",
        //     language: "od",
        //     template: [
        //         `ଆପଣଙ୍କ ସଞ୍ଚଯ଼ ଖାତାରେ ହାରାହାରି ମାସିକ ଜମା ରାଶିରେ 11 ପ୍ରତିଶତରୁ 25 ପ୍ରତିଶତ ହ୍ରାସ ସହିତ ସର୍ବନିମ୍ନ ଜମା ରାଶିର ରକ୍ଷଣାବେକ୍ଷଣ ନକଲେ ମାସିକ 25 ଟଙ୍କା ଶୁଳ୍କ କାଟି ଦିଆଯାଏ।`
        //     ],
        // }, {
        //     narration: "MIN BAL CHGS",
        //     amount: 25,
        //     accountType: "SB",
        //     language: "hi",
        //     template: [
        //         `आपके बचत खाते में औसत मासिक शेष राशि में 11 प्रतिशत से 25 प्रतिशत की कमी के साथ न्यूनतम शेष राशि का रखरखाव न करने पर प्रति माह 25 रुपये का शुल्क काटा जाता है।`
        //     ],
        }, {
            narration: "MIN BAL CHGS",
            amount: 24,
            accountType: "SB",
            language: "en",
            template: [
                `A charge of ₹ 24 per month is deducted for non maintenance of minimum balance with a shortfall of 11% to 25% in average monthly balance in your Savings Account`
            ],
        // }, {
        //     narration: "MIN BAL CHGS",
        //     amount: 25,
        //     accountType: "SB",
        //     language: "od",
        //     template: [
        //         `ଆପଣଙ୍କ ସଞ୍ଚଯ଼ ଖାତାରେ ହାରାହାରି ମାସିକ ଜମା ରାଶିରେ 11 ପ୍ରତିଶତରୁ 25 ପ୍ରତିଶତ ହ୍ରାସ ସହିତ ସର୍ବନିମ୍ନ ଜମା ରାଶିର ରକ୍ଷଣାବେକ୍ଷଣ ନକଲେ ମାସିକ 25 ଟଙ୍କା ଶୁଳ୍କ କାଟି ଦିଆଯାଏ।`
        //     ],
        // }, {
        //     narration: "MIN BAL CHGS",
        //     amount: 25,
        //     accountType: "SB",
        //     language: "hi",
        //     template: [
        //         `आपके बचत खाते में औसत मासिक शेष राशि में 11 प्रतिशत से 25 प्रतिशत की कमी के साथ न्यूनतम शेष राशि का रखरखाव न करने पर प्रति माह 25 रुपये का शुल्क काटा जाता है।`
        //     ],
        }, {
            narration: "MIN BAL CHGS",
            amount: 14,
            accountType: "SB",
            language: "en",
            template: [
                `A charge of ₹ 14 per month is deducted for non maintenance of minimum balance with a shortfall of 11% to 25% in average monthly balance in your Savings Account`
            ],
        // }, {
        //     narration: "MIN BAL CHGS",
        //     amount: 25,
        //     accountType: "SB",
        //     language: "od",
        //     template: [
        //         `ଆପଣଙ୍କ ସଞ୍ଚଯ଼ ଖାତାରେ ହାରାହାରି ମାସିକ ଜମା ରାଶିରେ 11 ପ୍ରତିଶତରୁ 25 ପ୍ରତିଶତ ହ୍ରାସ ସହିତ ସର୍ବନିମ୍ନ ଜମା ରାଶିର ରକ୍ଷଣାବେକ୍ଷଣ ନକଲେ ମାସିକ 25 ଟଙ୍କା ଶୁଳ୍କ କାଟି ଦିଆଯାଏ।`
        //     ],
        // }, {
        //     narration: "MIN BAL CHGS",
        //     amount: 25,
        //     accountType: "SB",
        //     language: "hi",
        //     template: [
        //         `आपके बचत खाते में औसत मासिक शेष राशि में 11 प्रतिशत से 25 प्रतिशत की कमी के साथ न्यूनतम शेष राशि का रखरखाव न करने पर प्रति माह 25 रुपये का शुल्क काटा जाता है।`
        //     ],
        }, {
            narration: "MIN BAL CHGS",
            amount: 10,
            accountType: "SB",
            language: "en",
            template: [
                `A charge of ₹ 10 per month is deducted for non maintenance of minimum balance with a shortfall of 1% to 10% in average monthly balance in your Savings Account`
            ],
        // }, {
        //     narration: "MIN BAL CHGS",
        //     amount: 10,
        //     accountType: "SB",
        //     language: "od",
        //     template: [
        //         `ଆପଣଙ୍କ ସଞ୍ଚଯ଼ ଖାତାରେ ହାରାହାରି ମାସିକ ଜମା ରାଶିରେ 1 ପ୍ରତିଶତରୁ 10 ପ୍ରତିଶତ ହ୍ରାସ ସହିତ ସର୍ବନିମ୍ନ ଜମା ରାଶିର ରକ୍ଷଣାବେକ୍ଷଣ ନକଲେ ମାସିକ 10 ଟଙ୍କା ଶୁଳ୍କ କାଟି ଦିଆଯାଏ।`
        //     ],
        // }, {
        //     narration: "MIN BAL CHGS",
        //     amount: 10,
        //     accountType: "SB",
        //     language: "hi",
        //     template: [
        //         `आपके बचत खाते में औसत मासिक शेष राशि में 1 प्रतिशत से 10 प्रतिशत की कमी के साथ न्यूनतम शेष राशि का रखरखाव न करने पर प्रति माह 10 रुपये का शुल्क काटा जाता है।`
        //     ],
        }, {
            narration: "MIN BAL CHGS",
            amount: 350,
            accountType: "CA",
            language: "en",
            template: [
                `A charge of ₹ 350 per quarter is deducted for non maintenance of minimum balance with a shortfall of average quarterly balance in your Current Account`
            ],
        // }, {
        //     narration: "MIN BAL CHGS",
        //     amount: 350,
        //     accountType: "CA",
        //     language: "od",
        //     template: [
        //         `ଆପଣଙ୍କ ଚଳନ୍ତି ଆକାଉଣ୍ଟରେ ହାରାହାରି ତ୍ରୈମାସିକ ବାଲାନ୍ସ ଅଭାବ ସହିତ ସର୍ବନିମ୍ନ ବାଲାନ୍ସ ରକ୍ଷଣାବେକ୍ଷଣ ନକରିବା ପାଇଁ ପ୍ରତି ତ୍ରୈମାସରେ 350 ଟଙ୍କା ଶୁଳ୍କ କାଟି ଦିଆଯାଏ |`
        //     ],
        // }, {
        //     narration: "MIN BAL CHGS",
        //     amount: 350,
        //     accountType: "CA",
        //     language: "hi",
        //     template: [
        //         `आपके चालू खाते में औसत तिमाही शेष राशि की कमी के साथ न्यूनतम शेष राशि का रखरखाव न करने पर 350 रुपये प्रति तिमाही का शुल्क काटा जाता है।`
        //     ],
        }, {
            narration: "MIN BAL CHGS",
            amount: 600,
            accountType: "CA",
            language: "en",
            template: [
                `A charge of ₹ 600 per quarter is deducted for non maintenance of minimum balance with a shortfall of average quarterly balance in your Current Account`
            ],
        // }, {
        //     narration: "MIN BAL CHGS",
        //     amount: 600,
        //     accountType: "CA",
        //     language: "od",
        //     template: [
        //         `ଆପଣଙ୍କ ଚଳନ୍ତି ଆକାଉଣ୍ଟରେ ହାରାହାରି ତ୍ରୈମାସିକ ବାଲାନ୍ସ ଅଭାବ ସହିତ ସର୍ବନିମ୍ନ ବାଲାନ୍ସ ରକ୍ଷଣାବେକ୍ଷଣ ନକରିବା ପାଇଁ ପ୍ରତି ତ୍ରୈମାସରେ 600 ଟଙ୍କା ଚାର୍ଜ କାଟି ଦିଆଯାଏ |`
        //     ],
        // }, {
        //     narration: "MIN BAL CHGS",
        //     amount: 600,
        //     accountType: "CA",
        //     language: "hi",
        //     template: [
        //         `आपके चालू खाते में औसत तिमाही शेष राशि की कमी के साथ न्यूनतम शेष राशि का रखरखाव न करने के लिए प्रति तिमाही 600 रुपये का शुल्क काटा जाता है।`
        //     ],
        }]
    })
    console.log('templates: ', template)
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