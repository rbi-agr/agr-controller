import { NarrationEducatingMessagesMap } from "./eduMsgs";


export function getEduMsg(narrationFromBank: string): string | undefined {
    const narrationFromBankLowerCase = narrationFromBank.toLowerCase()
    for(let key in NarrationEducatingMessagesMap) {
        const keyLowerCase = key.toLowerCase()
        if(narrationFromBankLowerCase.includes(keyLowerCase)) {
            return NarrationEducatingMessagesMap[key]
        }
    }
    return undefined;
}