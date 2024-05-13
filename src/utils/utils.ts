import axios from "axios";
import { PrismaService } from "src/prisma/prisma.service";
import * as Sentry from '@sentry/node'

export async function getCorrespondingNarration(bankNarration: any, narrationList: string[]) {
    const userprompt = `narration from bank: "${bankNarration}", list of narrations: ${narrationList}`
    const task = `this is the user query: Get me the corresponding narration from the list of narrations: ${narrationList} that matches the narration from bank: "${bankNarration}". If no match is found, return "No match found"`
    const mistralResponse =  await callMistralAI(task)
    console.log('mistralResponse ', mistralResponse)
    return mistralResponse
}


export async function getEduMsg(bankNarration: any, accountType: string, amount: number) {
    // const userprompt = `amount: ${amount}, narration: "${bankNarration.narration}", nature of charge: "${bankNarration.natureOfCharge}", details: {${bankNarration.details}}`
    // const task = `this is the user query: Get me the reason for the charges: amount: ${amount}, narration: "${bankNarration.narration}", nature of charge: "${bankNarration.natureOfCharge}", details: {${bankNarration.details}} and how I can prevent them based on amount, bank narration, nature of charge and details provided`
    const task2 = `this is the context:- amount: ₹${amount}, bank account type: ${accountType},  narration: "${bankNarration.narration}",nature of charge: "${bankNarration.natureOfCharge}", details:{${bankNarration.details}}  task:- get me the reason of deduction and a list of ways for preventing them based on amount, bank narration, nature of charge and details provided. Make sure to give the response in the following stringified JSON format:- {"response":{"reason":<reason>, "prevention_methods": [<method 1>, <method 2>]}}. Make sure to keep the response crisp, and human friendly i.e conversational, and do not add any other message or direction or description. Give the response strictly in the format given`
    const mistralResponse =  await callMistralAI(task2)
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
        Sentry.captureException("LLM Data Fetching Error")
        console.error("LLM Data Fetching Error:", error)
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
        // console.log(mistralResponse)
        return mistralResponse.data
    } catch(error) {
        Sentry.captureException("AI API error")
        console.error('AI API error:', error)
        return { status:"Internal Server Error", message: 'Something went wrong'}
    }
}

export async function PostRequest(message: String,apiUrl: any) :Promise<any> {
    try {
        const requestBody = {
            text: message,
          };
        console.log('API for Post Request')
        const response = await axios.post(apiUrl,requestBody)
        console.log('lan res ', response.data)
        return response.data
    } catch (error) {
        Sentry.captureException("POST Request Utility Error")
        console.error('POST Request Utility Error:', error)
        return { statusCode: 400, message: 'Error in calling this API', error: error }
    }
}
export async function PostRequestforTranslation(message: String,source: String, target:String,apiUrl: any) :Promise<any> {
    try {
        const requestBody = {
            source:source,
            target: target,
            text: message,
          };
        console.log('API for Post Request for Translation')
        const response = await axios.post(apiUrl,requestBody)
        return response.data
    } catch (error) {
        Sentry.captureException("Translation POST Request Utility Error")
        console.error('Translation POST Request Utility Error:', error)
        return { statusCode: 400, message: 'Error in calling this API', error: error }
    }
}

export async function validstate(prevst: any, nextst: any) {
    try {
        console.log('check valid state')
        if (prevst && nextst) {
            const flowArray = [
                [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
                [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            ]
            const valid = flowArray[Number(prevst)][Number(nextst)]
            if (valid) {
                return valid
            }
            return { statusCode: 404, message: 'States not in the flowmatrix. Please provide valid state' }

        }
        return { statusCode: 404, message: 'States not provided. Please provide valid state' }
    } catch (error) {
        Sentry.captureException("State Validation Error")
        console.error('State Validation Error:', error)
        return { statusCode: 400, message: 'Error in this move', error: error }
    }
}

export async function PostRequestforTransactionDates(message: String,apiUrl: any) :Promise<any> {
    try {
        const requestBody = {
            userprompt: message,
            task:"fetch me the start date and end date in format(mm-dd-yyyy example) in json format like:{'transaction_startdate': 'ISODate', 'transaction_enddate': 'ISODate'}"
          };
        console.log('API for Post Request for TransactionDates')
        const response = await axios.post(apiUrl,requestBody)
        return response.data
    } catch (error) {
        Sentry.captureException("Transactions Dates POST Request Utility Error")
        console.error('Transactions Dates POST Request Utility Error:', error)
        return { statusCode: 400, message: 'Error in this move', error: error }
    }
}

export async function addRatingOverall(rating: number, sessionid: string, prisma: PrismaService): Promise<any>{
    try{
        console.log("API for overall rating")
        if(sessionid && rating){
            const existing_session = await prisma.sessions.findUnique({
                where:{
                    sessionId: sessionid
                }
            })
            if(existing_session)
            {
                await prisma.sessions.update({
                    where:{
                        sessionId: sessionid
                    },
                    data:{
                        experienceRating: rating
                    }
                })
                return{
                    status:"Success", 
                    message: 'Overall experience updated successfully'
                }
            }
            return{
                status:"Internal Server Error", 
                message: 'No session found'
            }
            
        }
        else
        {
            return{
                status:"Internal Server Error", 
                message: 'Fields missing'
            }
        }
    }
    catch (error) {
        Sentry.captureException("Add Rating Utility Error")
        console.error('Add Rating Utility Error:', error)
        return { status:"Internal Server Error", message: 'Something went wrong'}
    }
}

export function formatDate(date: Date): string {
    const options = { day: 'numeric', month: 'long', year: 'numeric' } as const;
    const formattedDate = date.toLocaleDateString('en-US', options);
    return formattedDate.replace(/(\d+)(st|nd|rd|th)/, '$1'); // Remove suffix from day
}

export async function translatedResponse(response, languageDetected, sessionId, prisma: PrismaService){
    try {
        let translatedfinalresponse=[]
            for(let e=0; e<response.length; e++)
            {
                let currentmessage = response[e]
                let messageTranslationresp= await PostRequestforTranslation(currentmessage.message,'en',languageDetected,`${process.env.BASEURL}/ai/language-translate`)
                
                if(!messageTranslationresp.error){
                    console.log("Translated",messageTranslationresp.translated)
                    let messageTranslation = messageTranslationresp.translated
                    if(currentmessage.options && currentmessage.options.length>0){
                        let translatedoption=[]
                        for(let o=0; o<currentmessage.options.length; o++){
                            let op = currentmessage.options[o]
                            if(!op.includes('|')) {
                                let translatedoptionresp = await PostRequestforTranslation(op,'en',languageDetected,`${process.env.BASEURL}/ai/language-translate`)
                                console.log("Translatedoption", translatedoptionresp)
                                if(!translatedoptionresp.error){
                                    translatedoption.push(translatedoptionresp.translated)
                                }
                                else
                                {
                                    Sentry.captureException("Message Translation API Error")
                                    console.error("Message Translation API Error:", translatedoptionresp.error)
                                    await this.prisma.sessions.update({
                                        where: { sessionId },
                                        data: {
                                            state: 20
                                        }
                                    })
                                    return [{
                                        status: "Internal Server Error",
                                        "message": "Something went wrong with language translation",
                                        end_connection: false
                                    }, {
                                        status: "Success",
                                        session_id: sessionId,
                                        message: "Please refresh to restart the conversation or select yes to end the conversation.",
                                        options: ['Yes, end the conversation'],
                                        end_connection: false,
                                        prompt: "option_selection",
                                        metadata: {}
                                    }]
                                }
                            } else {
                                translatedoption.push(op)
                            }
                        }
                        console.log("HERE",translatedoption)
                        translatedfinalresponse.push({...currentmessage,message:messageTranslation,options:translatedoption})
                        continue;
                    }
                    console.log("Here")
                    translatedfinalresponse.push({...currentmessage,message:messageTranslation})
                }
                else {
                    Sentry.captureException("Message Translation API Error")
                    console.error("Message Translation API Error:", messageTranslationresp.error)
                    await this.prisma.sessions.update({
                        where: { sessionId },
                        data: {
                            state: 20
                        }
                    })
                    return [{
                        status: "Internal Server Error",
                        "message": "Something went wrong with language translation",
                        end_connection: false
                    }, {
                        status: "Success",
                        session_id: sessionId,
                        message: "Please refresh to restart the conversation or select yes to end the conversation.",
                        options: ['Yes, end the conversation'],
                        end_connection: false,
                        prompt: "option_selection",
                        metadata: {}
                    }]
                }
            }
            return translatedfinalresponse
    } catch (error) {
        Sentry.captureException("Language Translation Utility Error")
        console.error("Language Translation Utility Error:",error)
        await this.prisma.sessions.update({
            where: { sessionId },
            data: {
                state: 20
            }
        })
        return [{
            status: "Internal Server Error",
            "message": "Something went wrong with language translation",
            end_connection: false
        }, {
            status: "Success",
            session_id: sessionId,
            message: "Please refresh to restart the conversation or select yes to end the conversation.",
            options: ['Yes, end the conversation'],
            end_connection: false,
            prompt: "option_selection",
            metadata: {}
        }]
    }
}
