import axios from "axios";
import { ChatStateManager } from "../state-manager";

export async function getCorrespondingNarration(bankNarration: any, narrationList: string[]) {
    const userprompt = `narration from bank: "${bankNarration}", list of narrations: ${narrationList}`
    const task = `this is the user query: Get me the corresponding narration from the list of narrations: ${narrationList} that matches the narration from bank: "${bankNarration}". If no match is found, return "No match found"`
    const mistralResponse =  await callMistralAI(task)
    console.log('mistralResponse ', mistralResponse)
    return mistralResponse
}


export async function getEduMsg(bankNarration: any, amount: number) {
    const userprompt = `amount: ${amount}, narration: "${bankNarration.narration}", nature of charge: "${bankNarration.natureOfCharge}", details: {${bankNarration.details}}`
    const task = `this is the user query: Get me the reason for the charges: amount: ${amount}, narration: "${bankNarration.narration}", nature of charge: "${bankNarration.natureOfCharge}", details: {${bankNarration.details}} and how I can prevent them based on amount, bank narration, nature of charge and details provided`
    const mistralResponse =  await callMistralAI(task)
    console.log('mistralResponse ', mistralResponse)
    return mistralResponse
}

export async function getComplaintDetails(complaint: any) {
    
    const userprompt = `complaint category: ${complaint.complaintCategory}, complaint category type: ${complaint.complaintCategoryType}, complaint category subtype: ${complaint.complaintCategorySubtype}, bank narration: "${complaint.narration}", nature of charge: "${complaint.natureOfCharge}", amount: {${complaint.amount}}`
    const task = `this is the user query: Based on the the complaint category: ${complaint.complaintCategory}, complaint category type: ${complaint.complaintCategoryType}, complaint category subtype: ${complaint.complaintCategorySubtype}, bank narration: "${complaint.narration}", nature of charge: "${complaint.natureOfCharge}", amount: {${complaint.amount}}, get me the short description of the complaint`

    return await callMistralAI(task)
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

export async function callMistralAI(message) {
    try {
        const url = process.env.MISTRAL_BASE_URL
        const obj = {
            "model": "mistral",
            "messages":[{
                "role": "user",
                "content": message
            }],
            "stream": false
        }
        const mistralResponse = await axios.post(url, obj)
        console.log(mistralResponse)
        return mistralResponse.data
    } catch(error) {
        this.logger.error('Error ', error)
        return { status:"Internal Server Error", message: 'Something went wrong'}
    }
}