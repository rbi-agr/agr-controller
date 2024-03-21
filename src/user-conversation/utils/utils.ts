import axios from "axios";

export async function getEduMsg(bankNarration: any, amount: number) {
    const userprompt = `amount: ${amount}, narration: "${bankNarration.narration}", nature of charge: "${bankNarration.natureOfCharge}", details: {${bankNarration.details}}`
    const task = "Get me the reason for these charges and how I can prevent them based on amount, bank narration, nature of charge and details provided"
    return getDataFromLLM(userprompt, task)
}

export async function getComplaintDetails(complaint: any) {

    const userprompt = `complaint category: ${complaint.complaintCategory}, complaint category type: ${complaint.complaintCategoryType}, complaint category subtype: ${complaint.complaintCategorySubtype}, bank narration: "${complaint.narration}", nature of charge: "${complaint.natureOfCharge}", amount: {${complaint.amount}}`
    const task = "Based on the the complaint category, complaint category type, complaint category subtype, bank narration, nature of charge and amount, get me the short description of the complaint"

    return getDataFromLLM(userprompt, task)
}

export async function getDataFromLLM(userPrompt: string, task: string) {
    try {
        const requestBody = {
            userprompt: userPrompt,
            task: task,
        };
        const response = await axios.post(`${process.env.BASEURL}`,requestBody)
        return response.data;
    } catch (error) {
        return { statusCode: 400, message: 'Error in fetching data from mistral AI', error: error }
    }

}